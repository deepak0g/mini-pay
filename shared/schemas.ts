import { z } from "zod";

// Employee schemas
export const employeeSchema = z.object({
    firstName: z.string().min(1, "First name is required").max(100),
    lastName: z.string().min(1, "Last name is required").max(100),
    email: z.string().email("Invalid email").nullable().or(z.literal("")),
    // type: z.enum(["full-time", "part-time", "casual", "contractor"]).optional().nullable(),
    baseHourlyRate: z.number().min(0, "Rate must be positive"),
    superRate: z.number().min(0).max(1, "Super rate must be between 0 and 1"),
    bankBsb: z.string().nullable().or(z.literal("")),
    bankAccount: z.string().nullable().or(z.literal("")),
});

export const employeeIdSchema = z.object({
    id: z.string().min(5, "Invalid employee ID"),
});

// Payrun schemas
export const payrunCalculateSchema = z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    employeeIds: z.array(z.string()).optional(),
});

// Timesheet schemas
export const timesheetSchema = z.object({
    employeeId: z.string().min(5),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const timesheetEntrySchema = z.object({
    timesheetId: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    breakMinutes: z.number().min(0).max(480),
});

// Export types
export type Employee = z.infer<typeof employeeSchema>;
export type PayrunCalculate = z.infer<typeof payrunCalculateSchema>;
export type Timesheet = z.infer<typeof timesheetSchema>;
export type TimesheetEntry = z.infer<typeof timesheetEntrySchema>;
