import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import type { PayRunResult } from "../types";

export default function PayRunSummary() {
    const navigate = useNavigate();
    const [payRunResult, setPayRunResult] = useState<PayRunResult | null>(null);
    
    useEffect(() => {
        const stored = sessionStorage.getItem("payRunResult");
        if (stored) {
            setPayRunResult(JSON.parse(stored));
        } else {
            navigate("/run-pay");
        }
    }, [navigate]);
    
    if (!payRunResult) {
        return (
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="text-center py-12">
                    <p className="text-gray-500">Loading pay run results...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
                <button
                    onClick={() => navigate("/run-pay")}
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                    aria-label="Back to run pay"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                    Back to Run Pay
                </button>
            </div>
            
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-semibold text-gray-900">Pay Run Summary</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Period: {new Date(payRunResult.startDate).toLocaleDateString()} -{" "}
                        {new Date(payRunResult.endDate).toLocaleDateString()}
                    </p>
                </div>
            </div>
            
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300" role="table">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                            Employee
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                            Normal Hours
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                            Overtime Hours
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                            Allowances
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                            Gross Pay
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                            Tax
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                            Super
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                            Net Pay
                                        </th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {payRunResult.payslips.map((payslip) => (
                                        <tr key={payslip.employee.id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                {payslip.employee.name}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                                                {payslip.normalHours.toFixed(1)}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                                                {payslip.overtimeHours.toFixed(2)}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                                                ${payslip.allowances.toFixed(2)}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium text-right">
                                                ${payslip.gross.toFixed(2)}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                                                ${payslip.tax.toFixed(2)}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                                                ${payslip.super.toFixed(2)}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-semibold text-right">
                                                ${payslip.net.toFixed(2)}
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <Link
                                                    to={`/payslip/${payslip.employee.id}`}
                                                    state={{ payslip, period: { start: payRunResult.startDate, end: payRunResult.endDate } }}
                                                    className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                                                    aria-label={`View payslip for ${payslip.employee.name}`}
                                                >
                                                    <FileText className="w-4 h-4 mr-1" aria-hidden="true" />
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <th scope="row" className="py-4 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                            Totals
                                        </th>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-gray-900 text-right">
                                            {payRunResult.totals.normalHours.toFixed(1)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-gray-900 text-right">
                                            {payRunResult.totals.overtimeHours.toFixed(2)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-gray-900 text-right">
                                            ${payRunResult.totals.allowances.toFixed(2)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm font-bold text-gray-900 text-right">
                                            ${payRunResult.totals.gross.toFixed(2)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-gray-900 text-right">
                                            ${payRunResult.totals.tax.toFixed(2)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-gray-900 text-right">
                                            ${payRunResult.totals.super.toFixed(2)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm font-bold text-gray-900 text-right">
                                            ${payRunResult.totals.net.toFixed(2)}
                                        </td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 sm:pr-6"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
