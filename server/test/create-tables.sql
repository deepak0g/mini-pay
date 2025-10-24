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