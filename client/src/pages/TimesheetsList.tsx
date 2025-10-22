import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { timesheetsApi } from "../api/client";

export default function TimesheetsList() {
    const queryClient = useQueryClient();
    
    const { data: timesheets, isLoading, error } = useQuery({
        queryKey: ["timesheets"],
        queryFn: timesheetsApi.getAll,
    });
    
    const deleteMutation = useMutation({
        mutationFn: timesheetsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["timesheets"] });
        },
    });
    
    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this timesheet?")) {
            deleteMutation.mutate(id);
        }
    };
    
    if (isLoading) {
        return (
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="text-center py-12">
                    <p className="text-gray-500">Loading timesheets...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="text-center py-12">
                    <p className="text-red-500">Error loading timesheets</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Timesheets</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Manage employee timesheets and work entries.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <Link
                        to="/timesheets/new"
                        className="btn-primary inline-flex items-center"
                        aria-label="Add new timesheet"
                    >
                        <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                        Add Timesheet
                    </Link>
                </div>
            </div>
            
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table className="min-w-full divide-y divide-gray-300" role="table">
                            <thead>
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                                        Employee
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Period Start
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Period End
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Entries
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Allowances
                                    </th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {timesheets && timesheets.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-gray-500">
                                            No timesheets found. Add your first timesheet to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    timesheets?.map((timesheet) => (
                                        <tr key={timesheet.id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                                                {timesheet.employee
                                                    ? `${timesheet.employee.firstName} ${timesheet.employee.lastName}`
                                                    : timesheet.employeeId}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {format(parseISO(timesheet.start), "MMM d, yyyy")}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {format(parseISO(timesheet.end), "MMM d, yyyy")}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {timesheet.TimesheetEntry.length} entries
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                ${timesheet.allowances.toFixed(2)}
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                                <Link
                                                    to={`/timesheets/${timesheet.id}/edit`}
                                                    className="text-blue-600 hover:text-blue-900 inline-flex items-center mr-4"
                                                    aria-label={`Edit timesheet for ${timesheet.employee?.firstName} ${timesheet.employee?.lastName}`}
                                                >
                                                    <Edit className="w-4 h-4 mr-1" aria-hidden="true" />
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(timesheet.id)}
                                                    className="text-red-600 hover:text-red-900 inline-flex items-center"
                                                    aria-label={`Delete timesheet for ${timesheet.employee?.firstName} ${timesheet.employee?.lastName}`}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" aria-hidden="true" />
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
