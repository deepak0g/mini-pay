import { prisma } from "../db";
import { differenceInMinutes } from "date-fns";

export const grossPay = async ({ employeeId, start, end }: { employeeId: string; start: Date; end: Date }) => {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
        throw new Error("Employee not found");
    }
    const timesheet = await prisma.timesheet.findMany({
        where: {
            employeeId,
            start: {
                gte: start,
                lte: end
            },
            end: {
                gte: start,
                lte: end
            }
        },
        orderBy: {
            start: "asc"
        },
        include: {
            TimesheetEntry: true
        }
    });

    if (!timesheet) {
        throw new Error("Timesheet not found");
    }

    // gross = (normal_hours * base_rate) + (overtime_hours * base_rate * 1.5) + allowances
    // Weekly overtime threshold: 38 hours (hours above are overtime).

    let totalHours = timesheet.reduce((acc, timesheet) =>
        acc + timesheet.TimesheetEntry.reduce((acc, timesheetEntry) => {
            const minutesWorked = differenceInMinutes(timesheetEntry.end, timesheetEntry.start);
            const hoursWorked = (minutesWorked - timesheetEntry.unpaidBreakMins) / 60;
            return acc + hoursWorked;
        }, 0), 0);

    let normalHours = totalHours > 38 ? 38 : totalHours;
    const overtimeHours = totalHours > 38 ? totalHours - 38 : 0;

    const allowances = timesheet.reduce((acc, timesheet) =>
        acc + timesheet.allowances, 0);
    const gross = (normalHours * employee.baseHourlyRate) + (overtimeHours * employee.baseHourlyRate * 1.5) + allowances;

    return { gross, allowances, normalHours, overtimeHours };
}

export const tax = async (gross: number) => {
    const taxRates = await prisma.taxRates.findMany({
        orderBy: { min: 'asc' }
    });
    
    let totalTax = 0;
    
    for (const taxRate of taxRates) {
        if (gross > taxRate.min) {
            const taxableInBracket = Math.min(gross, taxRate.max) - taxRate.min;
            totalTax += taxableInBracket * taxRate.rate;
        }
    }
    
    return totalTax;
}

