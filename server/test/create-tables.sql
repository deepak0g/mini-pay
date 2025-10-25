CREATE TABLE
  public."Employee" (
    id text NOT NULL,
    email text NULL,
    name text NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    type
      text NOT NULL,
      "baseHourlyRate" double precision NOT NULL,
      "superRate" double precision NOT NULL,
      "bankBsb" text NULL,
      "bankAccount" text NULL
  );

ALTER TABLE
  public."Employee"
ADD
  CONSTRAINT "Employee_pkey" PRIMARY KEY (id);

CREATE TABLE
  public."TaxRates" (
    id text NOT NULL,
    min double precision NOT NULL,
    max double precision NOT NULL,
    rate double precision NOT NULL
  );

ALTER TABLE
  public."TaxRates"
ADD
  CONSTRAINT "TaxRates_pkey" PRIMARY KEY (id);

CREATE TABLE
  public."Timesheet" (
    id text NOT NULL,
    "employeeId" text NOT NULL,
    start timestamp(3) without time zone NOT NULL,
    "end" timestamp(3) without time zone NOT NULL,
    allowances double precision NOT NULL
  );

ALTER TABLE
  public."Timesheet"
ADD
  CONSTRAINT "Timesheet_pkey" PRIMARY KEY (id);

CREATE TABLE
  public."TimesheetEntry" (
    id text NOT NULL,
    "timesheetId" text NOT NULL,
    "employeeId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    start timestamp(3) without time zone NOT NULL,
    "end" timestamp(3) without time zone NOT NULL,
    "unpaidBreakMins" integer NOT NULL
  );

ALTER TABLE
  public."TimesheetEntry"
ADD
  CONSTRAINT "TimesheetEntry_pkey" PRIMARY KEY (id);

CREATE TABLE
  public."User" (
    id text NOT NULL,
    email text NOT NULL,
    name text NULL,
    "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone NOT NULL
  );

ALTER TABLE
  public."User"
ADD
  CONSTRAINT "User_pkey" PRIMARY KEY (id);

-- PayRun table
CREATE TABLE
  public."PayRun" (
    id text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "totalNormalHours" double precision NOT NULL,
    "totalOvertimeHours" double precision NOT NULL,
    "totalAllowances" double precision NOT NULL,
    "totalGross" double precision NOT NULL,
    "totalTax" double precision NOT NULL,
    "totalSuper" double precision NOT NULL,
    "totalNet" double precision NOT NULL
  );

ALTER TABLE
  public."PayRun"
ADD
  CONSTRAINT "PayRun_pkey" PRIMARY KEY (id);

-- Payslip table
CREATE TABLE
  public."Payslip" (
    id text NOT NULL,
    "payRunId" text NOT NULL,
    "employeeId" text NOT NULL,
    "employeeName" text NOT NULL,
    "normalHours" double precision NOT NULL,
    "overtimeHours" double precision NOT NULL,
    allowances double precision NOT NULL,
    gross double precision NOT NULL,
    tax double precision NOT NULL,
    super double precision NOT NULL,
    net double precision NOT NULL,
    "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

ALTER TABLE
  public."Payslip"
ADD
  CONSTRAINT "Payslip_pkey" PRIMARY KEY (id);

-- Foreign key for Payslip -> PayRun
ALTER TABLE
  public."Payslip"
ADD
  CONSTRAINT "Payslip_payRunId_fkey" FOREIGN KEY ("payRunId") REFERENCES public."PayRun" (id) ON DELETE CASCADE ON UPDATE CASCADE;