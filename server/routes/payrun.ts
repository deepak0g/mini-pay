import { Router } from "express";
import { prisma } from "../utils/db";
import { logger } from "../utils/logger";
import { grossPay, tax } from "../business/pay";
import { parse } from "date-fns";
import { validateMiddleware } from "../utils/utils";
import { payrunCalculateSchema } from "../../shared/schemas";

const router = Router();

// Run pay calculation
router.post("/calculate", validateMiddleware({
    schema: payrunCalculateSchema
}), async (req, res) => {
    try {
        const { startDate, endDate, employeeIds } = req.body;

        const start = parse(startDate, 'yyyy-MM-dd', new Date());
        const end = parse(endDate, 'yyyy-MM-dd', new Date());

        // Get employees to process
        let employees;
        if (employeeIds && employeeIds.length > 0) {
            employees = await prisma.employee.findMany({
                where: { id: { in: employeeIds } },
            });
        } else {
            employees = await prisma.employee.findMany();
        }

        const payslips = [];

        for (const employee of employees) {
            try {
                const payData = await grossPay({
                    employeeId: employee.id,
                    start,
                    end,
                });

                const taxAmount = await tax(payData.gross);
                const superAmount = payData.gross * employee.superRate;
                const net = payData.gross - taxAmount;

                payslips.push({
                    employee: {
                        id: employee.id,
                        firstName: employee.firstName,
                        lastName: employee.lastName,
                        name: `${employee.firstName} ${employee.lastName}`,
                    },
                    normalHours: payData.normalHours,
                    overtimeHours: payData.overtimeHours,
                    allowances: payData.allowances,
                    gross: payData.gross,
                    tax: taxAmount,
                    super: superAmount,
                    net,
                });
            } catch (error) {
                logger.warn({ error, employeeId: employee.id }, "Error processing employee, skipping");
                // Skip employees with no timesheet data
                continue;
            }
        }

        // Calculate totals
        const totals = payslips.reduce(
            (acc, slip) => ({
                normalHours: acc.normalHours + slip.normalHours,
                overtimeHours: acc.overtimeHours + slip.overtimeHours,
                allowances: acc.allowances + slip.allowances,
                gross: acc.gross + slip.gross,
                tax: acc.tax + slip.tax,
                super: acc.super + slip.super,
                net: acc.net + slip.net,
            }),
            {
                normalHours: 0,
                overtimeHours: 0,
                allowances: 0,
                gross: 0,
                tax: 0,
                super: 0,
                net: 0,
            }
        );

        // Save payrun to database
        const payrun = await prisma.payRun.create({
            data: {
                startDate: start,
                endDate: end,
                totalNormalHours: totals.normalHours,
                totalOvertimeHours: totals.overtimeHours,
                totalAllowances: totals.allowances,
                totalGross: totals.gross,
                totalTax: totals.tax,
                totalSuper: totals.super,
                totalNet: totals.net,
                payslips: {
                    create: payslips.map(slip => ({
                        employeeId: slip.employee.id,
                        employeeName: slip.employee.name,
                        normalHours: slip.normalHours,
                        overtimeHours: slip.overtimeHours,
                        allowances: slip.allowances,
                        gross: slip.gross,
                        tax: slip.tax,
                        super: slip.super,
                        net: slip.net,
                    }))
                }
            },
            include: {
                payslips: true
            }
        });

        logger.info({ payrunId: payrun.id }, "Payrun saved to database");

        res.json({
            id: payrun.id,
            startDate,
            endDate,
            payslips,
            totals,
            createdAt: payrun.createdAt,
        });
    } catch (error) {
        logger.error({ error }, "Failed to calculate pay run");
        res.status(500).json({ error: "Failed to calculate pay run" });
    }
});

// List all payruns
router.get("/", async (req, res) => {
    try {
        const payruns = await prisma.payRun.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                payslips: {
                    select: {
                        id: true,
                        employeeName: true,
                    }
                }
            }
        });

        const formatted = payruns.map(pr => ({
            id: pr.id,
            startDate: pr.startDate,
            endDate: pr.endDate,
            createdAt: pr.createdAt,
            totalGross: pr.totalGross,
            employeeCount: pr.payslips.length,
        }));

        res.json(formatted);
    } catch (error) {
        logger.error({ error }, "Failed to list payruns");
        res.status(500).json({ error: "Failed to list payruns" });
    }
});

// Get a specific payrun
router.get("/:id", async (req, res) => {
    try {
        const payrun = await prisma.payRun.findUnique({
            where: { id: req.params.id },
            include: {
                payslips: true
            }
        });

        if (!payrun) {
            return res.status(404).json({ error: "Payrun not found" });
        }

        // Format response to match PayRunResult type
        const response = {
            id: payrun.id,
            startDate: payrun.startDate.toISOString().split('T')[0],
            endDate: payrun.endDate.toISOString().split('T')[0],
            createdAt: payrun.createdAt,
            payslips: payrun.payslips.map(slip => ({
                employee: {
                    id: slip.employeeId,
                    firstName: slip.employeeName.split(' ')[0] || '',
                    lastName: slip.employeeName.split(' ')[1] || '',
                    name: slip.employeeName,
                },
                normalHours: slip.normalHours,
                overtimeHours: slip.overtimeHours,
                allowances: slip.allowances,
                gross: slip.gross,
                tax: slip.tax,
                super: slip.super,
                net: slip.net,
            })),
            totals: {
                normalHours: payrun.totalNormalHours,
                overtimeHours: payrun.totalOvertimeHours,
                allowances: payrun.totalAllowances,
                gross: payrun.totalGross,
                tax: payrun.totalTax,
                super: payrun.totalSuper,
                net: payrun.totalNet,
            }
        };

        res.json(response);
    } catch (error) {
        logger.error({ error, payrunId: req.params.id }, "Failed to get payrun");
        res.status(500).json({ error: "Failed to get payrun" });
    }
});

// Download payrun as JSON (with optional S3 export)
router.get("/:id/download", async (req, res) => {
    try {
        const payrun = await prisma.payRun.findUnique({
            where: { id: req.params.id },
            include: {
                payslips: true
            }
        });

        if (!payrun) {
            return res.status(404).json({ error: "Payrun not found" });
        }

        // Format response
        const exportData = {
            id: payrun.id,
            startDate: payrun.startDate.toISOString().split('T')[0],
            endDate: payrun.endDate.toISOString().split('T')[0],
            createdAt: payrun.createdAt,
            payslips: payrun.payslips.map(slip => ({
                employee: {
                    id: slip.employeeId,
                    name: slip.employeeName,
                },
                normalHours: slip.normalHours,
                overtimeHours: slip.overtimeHours,
                allowances: slip.allowances,
                gross: slip.gross,
                tax: slip.tax,
                super: slip.super,
                net: slip.net,
            })),
            totals: {
                normalHours: payrun.totalNormalHours,
                overtimeHours: payrun.totalOvertimeHours,
                allowances: payrun.totalAllowances,
                gross: payrun.totalGross,
                tax: payrun.totalTax,
                super: payrun.totalSuper,
                net: payrun.totalNet,
            }
        };

        // Optional: Save to S3 if enabled
        if (process.env.USE_LOCALSTACK === "true" || process.env.USE_S3 === "true") {
            try {
                const { savePayrunToS3 } = await import("../utils/s3");
                await savePayrunToS3(payrun.id, exportData);
                logger.info({ payrunId: payrun.id }, "Payrun exported to S3");
            } catch (error) {
                logger.warn({ error, payrunId: payrun.id }, "Failed to export to S3, continuing with download");
            }
        }

        // Set headers for file download
        const filename = `payrun-${exportData.startDate}-${exportData.endDate}.json`;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        res.json(exportData);
    } catch (error) {
        logger.error({ error, payrunId: req.params.id }, "Failed to download payrun");
        res.status(500).json({ error: "Failed to download payrun" });
    }
});

export default router;
