import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Play } from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { employeesApi, payrunApi } from "../api/client";

export default function RunPay() {
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState(format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"));
    const [endDate, setEndDate] = useState(format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"));
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    
    const { data: employees } = useQuery({
        queryKey: ["employees"],
        queryFn: employeesApi.getAll,
    });
    
    const runPayMutation = useMutation({
        mutationFn: payrunApi.calculate,
        onSuccess: (data) => {
            sessionStorage.setItem("payRunResult", JSON.stringify(data));
            navigate("/pay-run-summary");
        },
    });
    
    const handleEmployeeToggle = (employeeId: string) => {
        setSelectedEmployees((prev) =>
            prev.includes(employeeId)
                ? prev.filter((id) => id !== employeeId)
                : [...prev, employeeId]
        );
    };
    
    const handleSelectAll = () => {
        if (selectedEmployees.length === employees?.length) {
            setSelectedEmployees([]);
        } else {
            setSelectedEmployees(employees?.map((e) => e.id) || []);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        runPayMutation.mutate({
            startDate,
            endDate,
            employeeIds: selectedEmployees.length > 0 ? selectedEmployees : undefined,
        });
    };
    
    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-semibold text-gray-900">Run Pay</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Select a date range and employees to calculate payroll.
                    </p>
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="mt-8 space-y-6 max-w-3xl">
                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                    <div className="px-4 py-6 sm:p-8">
                        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="startDate" className="label-field">
                                    Start Date *
                                </label>
                                <input
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    required
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="input-field"
                                    aria-required="true"
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="endDate" className="label-field">
                                    End Date *
                                </label>
                                <input
                                    type="date"
                                    id="endDate"
                                    name="endDate"
                                    required
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="input-field"
                                    aria-required="true"
                                />
                            </div>
                        </div>
                        
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-3">
                                <label className="label-field mb-0">Select Employees (optional)</label>
                                <button
                                    type="button"
                                    onClick={handleSelectAll}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                    {selectedEmployees.length === employees?.length ? "Deselect All" : "Select All"}
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mb-3">
                                Leave empty to process all employees
                            </p>
                            
                            <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3">
                                {employees?.map((employee) => (
                                    <label
                                        key={employee.id}
                                        className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedEmployees.includes(employee.id)}
                                            onChange={() => handleEmployeeToggle(employee.id)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            aria-label={`Select ${employee.firstName} ${employee.lastName}`}
                                        />
                                        <span className="ml-3 text-sm text-gray-700">
                                            {employee.firstName} {employee.lastName}
                                        </span>
                                    </label>
                                ))}
                                
                                {employees && employees.length === 0 && (
                                    <p className="text-center text-gray-500 py-4">
                                        No employees found. Add employees first.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
                        <button
                            type="submit"
                            className="btn-primary inline-flex items-center"
                            disabled={runPayMutation.isPending}
                        >
                            <Play className="w-4 h-4 mr-2" aria-hidden="true" />
                            {runPayMutation.isPending ? "Calculating..." : "Run Pay"}
                        </button>
                    </div>
                </div>
                
                {runPayMutation.isError && (
                    <div className="rounded-md bg-red-50 p-4">
                        <p className="text-sm text-red-800">
                            Error calculating pay run. Please try again.
                        </p>
                    </div>
                )}
            </form>
        </div>
    );
}
