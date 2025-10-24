import { prisma } from "../utils/db";
import { parse, setHours, setMinutes, formatISO, startOfToday, format, parseISO } from "date-fns";
import fs from "fs";
import path from "path";
import { logger } from "../utils/logger";

let dump: any[] = []

const setHoursMinutes = (dateStr: string, hours: number, minutes: number) => {
    const date = new Date(dateStr);
    date.setUTCHours(hours);
    date.setUTCMinutes(minutes);
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);
    return date;
}

const runDump = async (fileName: string) => {

    const dumpData = await fs.promises.readFile(path.join(__dirname, fileName), "utf-8");
    dump = JSON.parse(dumpData);

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
                    create: entry.entries.map((entryData: any) => ({
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

const runEmpDump = async (fileName: string) => {
    const dumpData = await fs.promises.readFile(path.join(__dirname, fileName), "utf-8");
    dump = JSON.parse(dumpData);

    for (const entry of dump) {
        const employee = await prisma.employee.create({
            data: {
                id: entry.id,
                firstName: entry.firstName,
                lastName: entry.lastName,
                type: entry.type,
                baseHourlyRate: entry.baseHourlyRate,
                superRate: entry.superRate,
                email: entry.email,
                bankAccount: entry.bankAccount,
                bankBsb: entry.bank.bsb,
            },
        });
    }
}

const dumpTax = async () => {
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "TaxRates"`);

    await prisma.$executeRawUnsafe(`
        CREATE TABLE "TaxRates" (
            id text NOT NULL,
            min double precision NOT NULL,
            max double precision NOT NULL,
            rate double precision NOT NULL,
            CONSTRAINT "TaxRates_pkey" PRIMARY KEY (id)
        )
    `);

    await prisma.$executeRawUnsafe(`
        INSERT INTO "TaxRates" ("id", "max", "min", "rate") VALUES 
        ('tax-1', 370, 0, 0), 
        ('tax-2', 900, 370.01, 0.1), 
        ('tax-3', 1500, 900.01, 0.19), 
        ('tax-4', 3000, 1500.01, 0.325), 
        ('tax-5', 5000, 3000.01, 0.37), 
        ('tax-6', 999999999, 5000.01, 0.45)
    `);
}

const clearDB = async () => {
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "TaxRates"`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "TimesheetEntry"`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Timesheet"`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Employee"`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "User"`);

    const sqlFile = path.join(__dirname, "create-tables.sql");
    if (fs.existsSync(sqlFile)) {
        const sql = await fs.promises.readFile(sqlFile, "utf-8");
        // Split by semicolons and filter out empty statements
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            await prisma.$executeRawUnsafe(statement);
        }
    }
}

// runEmpDump();
// runDump();
// console.log(getEmptyDate());

await clearDB();

if (process.argv.includes("--test")) {
    logger.info("Running dump");
    await runEmpDump("test-cases-emp.json");
    await runDump("test-cases-timesheets.json");
} else {
    if (process.argv.includes("--emp")) {
        await runEmpDump("test-cases-emp.json");
    }
    if (process.argv.includes("--timesheet")) {
        await runDump("timesheets.json");
    }
    else {
        await runEmpDump("test-cases-emp.json");
        await runDump("timesheets.json");
    }
}

await dumpTax();