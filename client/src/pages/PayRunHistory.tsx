import { useQuery } from "@tanstack/react-query";
import { payrunApi } from "../api/client";
import { Link } from "react-router-dom";
import { Calendar, DollarSign, Users, Eye, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function PayRunHistory() {
    const { data: payruns, isLoading, error } = useQuery({
        queryKey: ["payruns"],
        queryFn: payrunApi.getAll,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">Failed to load pay run history</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Pay Run History</h1>
                <p className="mt-2 text-gray-600">
                    View all completed pay runs and their details
                </p>
            </div>

            {!payruns || payruns.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Pay Runs Yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Run your first pay run to see it here
                    </p>
                    <Link
                        to="/run-pay"
                        className="btn-primary inline-flex items-center"
                    >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Run Pay
                    </Link>
                </div>
            ) : (
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Pay Period
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Created
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Employees
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Total Gross
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {payruns.map((payrun) => (
                                <tr
                                    key={payrun.id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900">
                                                    {format(new Date(payrun.startDate), "dd MMM yyyy")}
                                                    {" - "}
                                                    {format(new Date(payrun.endDate), "dd MMM yyyy")}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {format(new Date(payrun.createdAt), "dd MMM yyyy")}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {format(new Date(payrun.createdAt), "HH:mm")}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-900">
                                            <Users className="w-4 h-4 text-gray-400 mr-2" />
                                            {payrun.employeeCount}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm font-medium text-gray-900">
                                            <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                                            {payrun.totalGross.toFixed(2)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            to={`/pay-run-history/${payrun.id}`}
                                            className="inline-flex items-center text-blue-600 hover:text-blue-900"
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}