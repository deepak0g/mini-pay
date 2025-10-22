import { prisma } from "../db";

export const GetEmployees = async () => {
    const employees = await prisma.employee.findMany();
    return employees;
}