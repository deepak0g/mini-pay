import { Router } from "express";
import { prisma } from "../utils/db";
import { parseISO } from "date-fns";

const router = Router();

// Get all timesheets
router.get("/", async (req, res) => {
    try {
        const timesheets = await prisma.timesheet.findMany({
            include: {
                employee: true,
                TimesheetEntry: {
                    orderBy: { date: "asc" },
                },
            },
            orderBy: { start: "desc" },
        });
        res.json(timesheets);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch timesheets" });
    }
});

// Get timesheets for an employee
router.get("/employee/:employeeId", async (req, res) => {
    try {
        const timesheets = await prisma.timesheet.findMany({
            where: { employeeId: req.params.employeeId },
            include: {
                TimesheetEntry: {
                    orderBy: { date: "asc" },
                },
            },
            orderBy: { start: "desc" },
        });
        res.json(timesheets);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch timesheets" });
    }
});

// Get single timesheet
router.get("/:id", async (req, res) => {
    try {
        const timesheet = await prisma.timesheet.findUnique({
            where: { id: req.params.id },
            include: {
                employee: true,
                TimesheetEntry: {
                    orderBy: { date: "asc" },
                },
            },
        });
        if (!timesheet) {
            return res.status(404).json({ error: "Timesheet not found" });
        }
        res.json(timesheet);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch timesheet" });
    }
});

// Create timesheet with entries
router.post("/", async (req, res) => {
    try {
        const { employeeId, start, end, allowances, entries } = req.body;
        
        const timesheet = await prisma.timesheet.create({
            data: {
                employeeId,
                start: parseISO(start),
                end: parseISO(end),
                allowances: parseFloat(allowances || 0),
                TimesheetEntry: {
                    create: entries.map((entry: any) => ({
                        employeeId,
                        date: parseISO(entry.date),
                        start: parseISO(entry.start),
                        end: parseISO(entry.end),
                        unpaidBreakMins: parseInt(entry.unpaidBreakMins),
                    })),
                },
            },
            include: {
                TimesheetEntry: true,
            },
        });
        res.status(201).json(timesheet);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create timesheet" });
    }
});

// Update timesheet
router.put("/:id", async (req, res) => {
    try {
        const { start, end, allowances, entries } = req.body;
        
        // Delete existing entries
        await prisma.timesheetEntry.deleteMany({
            where: { timesheetId: req.params.id },
        });
        
        // Update timesheet and create new entries
        const timesheet = await prisma.timesheet.update({
            where: { id: req.params.id },
            data: {
                start: parseISO(start),
                end: parseISO(end),
                allowances: parseFloat(allowances || 0),
                TimesheetEntry: {
                    create: entries.map((entry: any) => ({
                        employeeId: entry.employeeId,
                        date: parseISO(entry.date),
                        start: parseISO(entry.start),
                        end: parseISO(entry.end),
                        unpaidBreakMins: parseInt(entry.unpaidBreakMins),
                    })),
                },
            },
            include: {
                TimesheetEntry: true,
            },
        });
        res.json(timesheet);
    } catch (error) {
        res.status(500).json({ error: "Failed to update timesheet" });
    }
});

// Delete timesheet
router.delete("/:id", async (req, res) => {
    try {
        await prisma.timesheet.delete({
            where: { id: req.params.id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Failed to delete timesheet" });
    }
});

export default router;
