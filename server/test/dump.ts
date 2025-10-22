import { prisma } from "../db";
import { parse, setHours, setMinutes, formatISO, startOfToday, format, parseISO } from "date-fns";

const dump = [
    {
        "employeeId": "e-alice",
        "periodStart": "2025-08-11",
        "periodEnd": "2025-08-17",
        "entries": [
            { "date": "2025-08-11", "start": "09:00", "end": "17:30", "unpaidBreakMins": 30 },
            { "date": "2025-08-12", "start": "09:00", "end": "17:30", "unpaidBreakMins": 30 },
            { "date": "2025-08-13", "start": "09:00", "end": "17:30", "unpaidBreakMins": 30 },
            { "date": "2025-08-14", "start": "09:00", "end": "15:00", "unpaidBreakMins": 30 },
            { "date": "2025-08-15", "start": "10:00", "end": "18:00", "unpaidBreakMins": 30 }
        ],
        "allowances": 30.0
    },
    {
        "employeeId": "e-bob",
        "periodStart": "2025-08-11",
        "periodEnd": "2025-08-17",
        "entries": [
            { "date": "2025-08-11", "start": "08:00", "end": "18:00", "unpaidBreakMins": 60 },
            { "date": "2025-08-12", "start": "08:00", "end": "18:00", "unpaidBreakMins": 60 },
            { "date": "2025-08-13", "start": "08:00", "end": "18:00", "unpaidBreakMins": 60 },
            { "date": "2025-08-14", "start": "08:00", "end": "18:00", "unpaidBreakMins": 60 },
            { "date": "2025-08-15", "start": "08:00", "end": "18:00", "unpaidBreakMins": 60 }
        ],
        "allowances": 0.0
    }
]

const setHoursMinutes = (dateStr: string, hours: number, minutes: number) => {
    let date = new Date(dateStr);
    date.setUTCHours(hours);
    date.setUTCMinutes(minutes);
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);
    return date;
}

const runDump = async () => {
    for (const entry of dump) {
        const employee = await prisma.employee.findUnique({ where: { id: entry.employeeId } });
        if (!employee) {
            throw new Error("Employee not found");
        }

        const timesheet = await prisma.timesheet.create({
            data: {
                employee: { connect: { id: entry.employeeId } },
                start: formatISO(entry.periodStart),
                end: formatISO(entry.periodEnd),
                TimesheetEntry: {
                    create: entry.entries.map((entryData) => ({
                        employee: { connect: { id: entry.employeeId } },
                        date: formatISO(entryData.date),
                        start: (setHoursMinutes(formatISO(entryData.date),
                            parseInt(entryData.start.split(":")[0]!),
                            parseInt(entryData.start.split(":")[1]!))
                        ),
                        end: (setHoursMinutes(formatISO(entryData.date),
                            parseInt(entryData.end.split(":")[0]!),
                            parseInt(entryData.end.split(":")[1]!))
                        ),
                        unpaidBreakMins: entryData.unpaidBreakMins,
                    }))
                },
                allowances: entry.allowances,
            },
        });
    }
}

runDump();
// console.log(getEmptyDate());
