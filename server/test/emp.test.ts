import { GetEmployees } from "../business/employees";
import { grossPay, tax } from "../business/pay";
import * as dateFns from "date-fns";

// console.log(await GetEmployees());
const emps = await GetEmployees();
for (const emp of emps) {
    const result = await grossPay({
        employeeId: emp.id,
        start: dateFns.parse('2025-08-11', 'yyyy-MM-dd', new Date()),
        end: dateFns.parse('2025-08-17', 'yyyy-MM-dd', new Date())
    });

    const taxAmount = parseFloat((await tax(result.gross)).toFixed(2));
    const superAmount = parseFloat((result.gross * emp.superRate).toFixed(2)); // 11.5% super rate
    const net = parseFloat((result.gross - taxAmount).toFixed(2));

    console.log(`${emp.firstName} ${emp.lastName}: ${result.normalHours.toFixed(1)} normal + ${result.overtimeHours.toFixed(2)} overtime, gross $${result.gross.toFixed(2)}, tax $${taxAmount}, super $${superAmount}, net $${net}`);
}
