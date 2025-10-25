import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { payrunApi } from "../api/client";
import { ArrowLeft, Calendar, DollarSign, Users, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function PayRunDetail() {
    const { id } = useParams<{ id: string }>();
    
    const { data: payrun, isLoading, error } = useQuery({
        queryKey: ["payrun", id],
        queryFn: () => payrunApi.getById(id!),
        enabled: !!id,
    });

    const handleDownloadJSON = async () => {
        if (!payrun || !id) return;
        
        try {
            await payrunApi.downloadJSON(id, payrun.startDate, payrun.endDate);
        } catch (error) {
            console.error("Failed to download payrun:", error);
            alert("Failed to download payrun. Please try again.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !payrun) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">Failed to load pay run details</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    to="/pay-run-history"
                    className="inline-flex items-center text-blue-600 hover:text-blue-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to History
                </Link>
                
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Pay Run Details</h1>
                        <div className="mt-2 flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            {format(new Date(payrun.startDate), "dd MMM yyyy")} - {format(new Date(payrun.endDate), "dd MMM yyyy")}
                        </div>
                    </div>
                    <button
                        onClick={handleDownloadJSON}
                        className="btn-secondary inline-flex items-center"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download JSON
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Employees</p>
                            <p className="text-2xl font-bold text-gray-900">{payrun.payslips.length}</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Gross</p>
                            <p className="text-2xl font-bold text-green-600">${payrun.totals.gross.toFixed(2)}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Tax</p>
                            <p className="text-2xl font-bold text-red-600">${payrun.totals.tax.toFixed(2)}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-red-600" />
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Net</p>
                            <p className="text-2xl font-bold text-blue-600">${payrun.totals.net.toFixed(2)}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
            </div>

            {/* Payslips Table */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Employee Payslips</h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Employee
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Normal Hours
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    OT Hours
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Gross
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tax
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Super
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Net
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {payrun.payslips.map((slip) => (
                                <tr key={slip.employee.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {slip.employee.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                        {slip.normalHours.toFixed(1)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                        {slip.overtimeHours.toFixed(1)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                        ${slip.gross.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600">
                                        ${slip.tax.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                        ${slip.super.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600">
                                        ${slip.net.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                    TOTALS
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                                    {payrun.totals.normalHours.toFixed(1)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                                    {payrun.totals.overtimeHours.toFixed(1)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                                    ${payrun.totals.gross.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-red-600">
                                    ${payrun.totals.tax.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                                    ${payrun.totals.super.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600">
                                    ${payrun.totals.net.toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}
