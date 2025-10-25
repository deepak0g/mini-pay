import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import type { Payslip } from "../types";
import { format } from "date-fns";

export default function PayslipView() {
    const location = useLocation();
    const navigate = useNavigate();
    const { payslip, period } = location.state as { payslip: Payslip; period: { start: string; end: string } };

    if (!payslip) {
        return (
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="text-center py-12">
                    <p className="text-gray-500">No payslip data available</p>
                    <button
                        onClick={() => navigate("/run-pay")}
                        className="mt-4 btn-primary"
                    >
                        Go to Run Pay
                    </button>
                </div>
            </div>
        );
    }

    const handleDownloadPDF = () => {
        // Placeholder for PDF download functionality
        alert("PDF download functionality would be implemented here");
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
                <button
                    onClick={() => navigate("/pay-run-summary")}
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                    aria-label="Back to pay run summary"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                    Back to Summary
                </button>
            </div>

            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                    <div className="px-4 py-6 sm:p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Payslip</h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    Pay Period: {format(period.start, 'dd/MM/yyyy')} - {format(period.end, 'dd/MM/yyyy')}
                                </p>
                            </div>
                            {/* <button
                                onClick={handleDownloadPDF}
                                className="btn-secondary inline-flex items-center"
                                aria-label="Download payslip as PDF"
                            >
                                <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                                Download PDF
                            </button> */}
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Employee Details</h2>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{payslip.employee.name}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Employee ID</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{payslip.employee.id}</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="border-t border-gray-200 mt-6 pt-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hours Worked</h2>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Normal Hours</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{payslip.normalHours.toFixed(1)} hours</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Overtime Hours</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{payslip.overtimeHours.toFixed(2)} hours</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="border-t border-gray-200 mt-6 pt-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Earnings</h2>
                            <dl className="space-y-3">
                                <div className="flex justify-between">
                                    <dt className="text-sm font-medium text-gray-500">Gross Pay</dt>
                                    <dd className="text-sm text-gray-900">${payslip.gross.toFixed(2)}</dd>
                                </div>
                                {payslip.allowances > 0 && (
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Allowances</dt>
                                        <dd className="text-sm text-gray-900">${payslip.allowances.toFixed(2)}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        <div className="border-t border-gray-200 mt-6 pt-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Deductions</h2>
                            <dl className="space-y-3">
                                <div className="flex justify-between">
                                    <dt className="text-sm font-medium text-gray-500">Tax (PAYG)</dt>
                                    <dd className="text-sm text-gray-900">-${payslip.tax.toFixed(2)}</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="border-t border-gray-200 mt-6 pt-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Superannuation</h2>
                            <dl className="space-y-3">
                                <div className="flex justify-between">
                                    <dt className="text-sm font-medium text-gray-500">Employer Contribution</dt>
                                    <dd className="text-sm text-gray-900">${payslip.super.toFixed(2)}</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="border-t-2 border-gray-900 mt-6 pt-6">
                            <div className="flex justify-between items-center">
                                <dt className="text-lg font-bold text-gray-900">Net Pay</dt>
                                <dd className="text-2xl font-bold text-gray-900">${payslip.net.toFixed(2)}</dd>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Summary</h3>
                            <div className="text-sm text-gray-700 space-y-1">
                                <p>
                                    <span className="font-medium">{payslip.employee.firstName}</span> worked{" "}
                                    <span className="font-medium">{payslip.normalHours.toFixed(1)}</span> normal hours
                                    {payslip.overtimeHours > 0 && (
                                        <>
                                            {" "}and <span className="font-medium">{payslip.overtimeHours.toFixed(2)}</span> overtime hours
                                        </>
                                    )}
                                    , earning a gross pay of{" "}
                                    <span className="font-medium">${payslip.gross.toFixed(2)}</span>.
                                </p>
                                <p>
                                    After tax deductions of <span className="font-medium">${payslip.tax.toFixed(2)}</span>,
                                    the net pay is <span className="font-medium">${payslip.net.toFixed(2)}</span>.
                                </p>
                                <p>
                                    Employer superannuation contribution: <span className="font-medium">${payslip.super.toFixed(2)}</span>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
