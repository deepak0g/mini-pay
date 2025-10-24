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

        res.json({
            startDate,
            endDate,
            payslips,
            totals,
        });
    } catch (error) {
        logger.error({ error }, "Failed to calculate pay run");
        res.status(500).json({ error: "Failed to calculate pay run" });
    }
});

export default router;
