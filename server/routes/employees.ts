import { Router } from "express";
import { prisma } from "../db";

const router = Router();

// Get all employees
router.get("/", async (req, res) => {
    try {
        const employees = await prisma.employee.findMany({
            orderBy: { firstName: "asc" },
        });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch employees" });
    }
});

// Get single employee
router.get("/:id", async (req, res) => {
    try {
        const employee = await prisma.employee.findUnique({
            where: { id: req.params.id },
        });
        if (!employee) {
            return res.status(404).json({ error: "Employee not found" });
        }
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch employee" });
    }
});

// Create employee
router.post("/", async (req, res) => {
    try {
        const { firstName, lastName, email, type, baseHourlyRate, superRate, bankBsb, bankAccount } = req.body;
        
        const employee = await prisma.employee.create({
            data: {
                firstName,
                lastName,
                email,
                type,
                baseHourlyRate: parseFloat(baseHourlyRate),
                superRate: parseFloat(superRate),
                bankBsb,
                bankAccount,
            },
        });
        res.status(201).json(employee);
    } catch (error) {
        res.status(500).json({ error: "Failed to create employee" });
    }
});

// Update employee
router.put("/:id", async (req, res) => {
    try {
        const { firstName, lastName, email, type, baseHourlyRate, superRate, bankBsb, bankAccount } = req.body;
        
        const employee = await prisma.employee.update({
            where: { id: req.params.id },
            data: {
                firstName,
                lastName,
                email,
                type,
                baseHourlyRate: parseFloat(baseHourlyRate),
                superRate: parseFloat(superRate),
                bankBsb,
                bankAccount,
            },
        });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: "Failed to update employee" });
    }
});

// Delete employee
router.delete("/:id", async (req, res) => {
    try {
        await prisma.employee.delete({
            where: { id: req.params.id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Failed to delete employee" });
    }
});

export default router;
