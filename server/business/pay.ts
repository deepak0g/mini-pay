import { prisma } from "../utils/db";
import { differenceInMinutes, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

export const grossPay = async ({ employeeId, start, end }: { employeeId: string; start: Date; end: Date }) => {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
        throw new Error("Employee not found");
    }
    const timesheet = await prisma.timesheet.findMany({
        where: {
            employeeId,
            // start: {
            //     gte: start,
            // },
            // end: {
            //     lte: end,
            // }
        },
        orderBy: {
            start: "asc"
        },
        include: {
            TimesheetEntry: {
                where: {
                    date: {
                        gte: start,
                        lte: end,
                    }
                }
            }
        }
    });

    if (!timesheet.length) {
        throw new Error("Timesheet not found");
    }

    // gross = (normal_hours * base_rate) + (overtime_hours * base_rate * 1.5) + allowances
    // Weekly overtime threshold: 38 hours (hours above are overtime).

    // Flatten all timesheet entries
    const allEntries = timesheet.flatMap(ts => 
        ts.TimesheetEntry.map(entry => ({
            ...entry,
            timesheetAllowances: ts.allowances
        }))
    );

    // Group entries by week
    const weeklyHours = new Map<string, { normalHours: number; overtimeHours: number; allowances: number }>();

    for (const entry of allEntries) {
        const entryDate = new Date(entry.date);
        const weekStart = startOfWeek(entryDate, { weekStartsOn: 1 }); // Monday as week start
        const weekKey = weekStart.toISOString();

        const minutesWorked = differenceInMinutes(entry.end, entry.start);
        const hoursWorked = (minutesWorked - entry.unpaidBreakMins) / 60;

        if (!weeklyHours.has(weekKey)) {
            weeklyHours.set(weekKey, { normalHours: 0, overtimeHours: 0, allowances: 0 });
        }

        const week = weeklyHours.get(weekKey)!;
        const currentWeekHours = week.normalHours + week.overtimeHours;
        
        // Calculate how much of this entry is normal vs overtime
        if (currentWeekHours < 38) {
            const remainingNormalHours = 38 - currentWeekHours;
            const normalFromThisEntry = Math.min(hoursWorked, remainingNormalHours);
            const overtimeFromThisEntry = Math.max(0, hoursWorked - remainingNormalHours);
            
            week.normalHours += normalFromThisEntry;
            week.overtimeHours += overtimeFromThisEntry;
        } else {
            // Already over 38 hours this week, all is overtime
            week.overtimeHours += hoursWorked;
        }
    }

    // Calculate allowances (sum from all timesheets in the period)
    const allowances = timesheet.reduce((acc, ts) => acc + ts.allowances, 0);

    // Sum up all weeks
    let totalNormalHours = 0;
    let totalOvertimeHours = 0;

    for (const week of weeklyHours.values()) {
        totalNormalHours += week.normalHours;
        totalOvertimeHours += week.overtimeHours;
    }

    const gross = (totalNormalHours * employee.baseHourlyRate) + (totalOvertimeHours * employee.baseHourlyRate * 1.5) + allowances;

    return { 
        gross, 
        allowances, 
        normalHours: totalNormalHours, 
        overtimeHours: totalOvertimeHours 
    };
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

