import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2 } from "lucide-react";
import { employeesApi } from "../api/client";

export default function EmployeesList() {
    const queryClient = useQueryClient();
    
    const { data: employees, isLoading, error } = useQuery({
        queryKey: ["employees"],
        queryFn: employeesApi.getAll,
    });
    
    const deleteMutation = useMutation({
        mutationFn: employeesApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
        },
    });
    
    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete ${name}?`)) {
            deleteMutation.mutate(id);
        }
    };
    
    if (isLoading) {
        return (
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="text-center py-12">
                    <p className="text-gray-500">Loading employees...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="text-center py-12">
                    <p className="text-red-500">Error loading employees</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Employees</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        A list of all employees including their name, rate, and super.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <Link
                        to="/employees/new"
                        className="btn-primary inline-flex items-center"
                        aria-label="Add new employee"
                    >
                        <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                        Add Employee
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
                                        Name
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Email
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Type
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Base Rate
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Super Rate
                                    </th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {employees && employees.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-gray-500">
                                            No employees found. Add your first employee to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    employees?.map((employee) => (
                                        <tr key={employee.id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                                                {employee.firstName} {employee.lastName}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {employee.email || "-"}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">
                                                {employee.type}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                ${employee.baseHourlyRate.toFixed(2)}/hr
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {(employee.superRate * 100).toFixed(1)}%
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                                <Link
                                                    to={`/employees/${employee.id}/edit`}
                                                    className="text-blue-600 hover:text-blue-900 inline-flex items-center mr-4"
                                                    aria-label={`Edit ${employee.firstName} ${employee.lastName}`}
                                                >
                                                    <Edit className="w-4 h-4 mr-1" aria-hidden="true" />
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(employee.id, `${employee.firstName} ${employee.lastName}`)}
                                                    className="text-red-600 hover:text-red-900 inline-flex items-center"
                                                    aria-label={`Delete ${employee.firstName} ${employee.lastName}`}
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
