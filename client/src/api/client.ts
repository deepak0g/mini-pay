import type { Employee, Timesheet, PayRunResult } from "../types";

const API_BASE = "http://localhost:3000/api";

const fetch = async (url: string, options?: RequestInit) => {
    const token = localStorage.getItem("token") || "xxxxxxxxxxxxxxxxxxxx";
    options = {
        ...options,
        headers: {
            ...options?.headers,
            Authorization: `Bearer ${token}`,
        },
    };
    return await window.fetch(url, options);
};

// Employees API
export const employeesApi = {
    getAll: async (): Promise<Employee[]> => {
        const res = await fetch(`${API_BASE}/employees`);
        if (!res.ok) throw new Error("Failed to fetch employees");
        return res.json();
    },

    getById: async (id: string): Promise<Employee> => {
        const res = await fetch(`${API_BASE}/employees/${id}`);
        if (!res.ok) throw new Error("Failed to fetch employee");
        return res.json();
    },

    create: async (data: Omit<Employee, "id">): Promise<Employee> => {
        const res = await fetch(`${API_BASE}/employees`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to create employee");
        return res.json();
    },

    update: async (id: string, data: Omit<Employee, "id">): Promise<Employee> => {
        const res = await fetch(`${API_BASE}/employees/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update employee");
        return res.json();
    },

    delete: async (id: string): Promise<void> => {
        const res = await fetch(`${API_BASE}/employees/${id}`, {
            method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete employee");
    },
};

// Timesheets API
export const timesheetsApi = {
    getAll: async (): Promise<Timesheet[]> => {
        const res = await fetch(`${API_BASE}/timesheets`);
        if (!res.ok) throw new Error("Failed to fetch timesheets");
        return res.json();
    },

    getByEmployee: async (employeeId: string): Promise<Timesheet[]> => {
        const res = await fetch(`${API_BASE}/timesheets/employee/${employeeId}`);
        if (!res.ok) throw new Error("Failed to fetch timesheets");
        return res.json();
    },

    getById: async (id: string): Promise<Timesheet> => {
        const res = await fetch(`${API_BASE}/timesheets/${id}`);
        if (!res.ok) throw new Error("Failed to fetch timesheet");
        return res.json();
    },

    create: async (data: {
        employeeId: string;
        start: string;
        end: string;
        allowances: number;
        entries: Array<{
            date: string;
            start: string;
            end: string;
            unpaidBreakMins: number;
        }>;
    }): Promise<Timesheet> => {
        const res = await fetch(`${API_BASE}/timesheets`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to create timesheet");
        return res.json();
    },

    update: async (
        id: string,
        data: {
            start: string;
            end: string;
            allowances: number;
            entries: Array<{
                employeeId: string;
                date: string;
                start: string;
                end: string;
                unpaidBreakMins: number;
            }>;
        }
    ): Promise<Timesheet> => {
        const res = await fetch(`${API_BASE}/timesheets/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update timesheet");
        return res.json();
    },

    delete: async (id: string): Promise<void> => {
        const res = await fetch(`${API_BASE}/timesheets/${id}`, {
            method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete timesheet");
    },
};

// Pay Run API
export const payrunApi = {
    calculate: async (data: {
        startDate: string;
        endDate: string;
        employeeIds?: string[];
    }): Promise<PayRunResult> => {
        const res = await fetch(`${API_BASE}/payrun/calculate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to calculate pay run");
        return res.json();
    },
};
