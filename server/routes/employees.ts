import { Router } from "express";
import { prisma } from "../utils/db";
import { logger } from "../utils/logger";
import { employeeSchema, employeeIdSchema } from "../../shared/schemas";
import { validateMiddleware } from "../utils/utils";

const router = Router();

// Get all employees
router.get("/", async (req, res) => {
    try {
        const employees = await prisma.employee.findMany({
            orderBy: { firstName: "asc" },
        });
        res.json(employees);
    } catch (error) {
        logger.error({ error }, "Failed to fetch employees");
        res.status(500).json({ error: "Failed to fetch employees" });
    }
});

// Get single employee
router.get("/:id", validateMiddleware({ paramsSchema: employeeIdSchema }),
    async (req, res) => {
        try {
            const employee = await prisma.employee.findUnique({
                where: { id: req.params.id },
            });
            if (!employee) {
                return res.status(404).json({ error: "Employee not found" });
            }
            res.json(employee);
        } catch (error) {
            logger.error({ error, employeeId: req.params.id }, "Failed to fetch employee");
            res.status(500).json({ error: "Failed to fetch employee" });
        }
    });

// Create employee
router.post("/", validateMiddleware({ schema: employeeSchema }), async (req, res) => {
    try {
        const { firstName, lastName, email, type, baseHourlyRate, superRate, bankBsb, bankAccount } = req.body;

        const employee = await prisma.employee.create({
            data: {
                firstName,
                lastName,
                email: email || null,
                type,
                baseHourlyRate,
                superRate,
                bankBsb: bankBsb || null,
                bankAccount: bankAccount || null,
            },
        });
        logger.info({ employeeId: employee.id }, "Employee created");
        res.status(201).json(employee);
    } catch (error) {
        logger.error({ error }, "Failed to create employee");
        res.status(500).json({ error: "Failed to create employee" });
    }
});

// Update employee
router.put("/:id", validateMiddleware({
    paramsSchema: employeeIdSchema,
    schema: employeeSchema
}), async (req, res) => {
    try {
        const { firstName, lastName, email, type, baseHourlyRate, superRate, bankBsb, bankAccount } = req.body;

        const employee = await prisma.employee.update({
            where: { id: req.params.id },
            data: {
                firstName,
                lastName,
                email: email || null,
                type,
                baseHourlyRate,
                superRate,
                bankBsb: bankBsb || null,
                bankAccount: bankAccount || null,
            },
        });
        logger.info({ employeeId: employee.id }, "Employee updated");
        res.json(employee);
    } catch (error) {
        logger.error({ error, employeeId: req.params.id }, "Failed to update employee");
        res.status(500).json({ error: "Failed to update employee" });
    }
});

// Delete employee
router.delete("/:id", validateMiddleware({ paramsSchema: employeeIdSchema }), async (req, res) => {
    try {
        await prisma.employee.delete({
            where: { id: req.params.id },
        });
        logger.info({ employeeId: req.params.id }, "Employee deleted");
        res.status(204).send();
    } catch (error) {
        logger.error({ error, employeeId: req.params.id }, "Failed to delete employee");
        res.status(500).json({ error: "Failed to delete employee" });
    }
});

export default router;
