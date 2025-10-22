export interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    type: string;
    baseHourlyRate: number;
    superRate: number;
    bankBsb: string;
    bankAccount: string;
}

export interface TimesheetEntry {
    id: string;
    timesheetId: string;
    employeeId: string;
    date: string;
    start: string;
    end: string;
    unpaidBreakMins: number;
}

export interface Timesheet {
    id: string;
    employeeId: string;
    start: string;
    end: string;
    allowances: number;
    employee?: Employee;
    TimesheetEntry: TimesheetEntry[];
}

export interface Payslip {
    employee: {
        id: string;
        firstName: string;
        lastName: string;
        name: string;
    };
    normalHours: number;
    overtimeHours: number;
    allowances: number;
    gross: number;
    tax: number;
    super: number;
    net: number;
}

export interface PayRunResult {
    startDate: string;
    endDate: string;
    payslips: Payslip[];
    totals: {
        normalHours: number;
        overtimeHours: number;
        allowances: number;
        gross: number;
        tax: number;
        super: number;
        net: number;
    };
}
