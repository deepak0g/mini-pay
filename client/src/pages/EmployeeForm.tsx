import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { employeesApi } from "../api/client";
import type { Employee } from "../types";

export default function EmployeeForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();
    const isEditing = !!id;
    
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        type: "hourly",
        baseHourlyRate: "",
        superRate: "0.115",
        bankBsb: "",
        bankAccount: "",
    });
    
    const { data: employee } = useQuery({
        queryKey: ["employee", id],
        queryFn: () => employeesApi.getById(id!),
        enabled: isEditing,
    });
    
    useEffect(() => {
        if (employee) {
            setFormData({
                firstName: employee.firstName,
                lastName: employee.lastName,
                email: employee.email || "",
                type: employee.type,
                baseHourlyRate: employee.baseHourlyRate.toString(),
                superRate: employee.superRate.toString(),
                bankBsb: employee.bankBsb,
                bankAccount: employee.bankAccount,
            });
        }
    }, [employee]);
    
    const createMutation = useMutation({
        mutationFn: employeesApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
            navigate("/employees");
        },
    });
    
    const updateMutation = useMutation({
        mutationFn: (data: Omit<Employee, "id">) => employeesApi.update(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
            queryClient.invalidateQueries({ queryKey: ["employee", id] });
            navigate("/employees");
        },
    });
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        const data = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email || null,
            type: formData.type,
            baseHourlyRate: parseFloat(formData.baseHourlyRate),
            superRate: parseFloat(formData.superRate),
            bankBsb: formData.bankBsb,
            bankAccount: formData.bankAccount,
        };
        
        if (isEditing) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };
    
    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
                <button
                    onClick={() => navigate("/employees")}
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                    aria-label="Back to employees list"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                    Back to Employees
                </button>
            </div>
            
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {isEditing ? "Edit Employee" : "Add New Employee"}
                    </h1>
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="mt-8 space-y-6 max-w-2xl">
                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                    <div className="px-4 py-6 sm:p-8">
                        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="firstName" className="label-field">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    required
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="input-field"
                                    aria-required="true"
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="lastName" className="label-field">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    required
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="input-field"
                                    aria-required="true"
                                />
                            </div>
                            
                            <div className="sm:col-span-2">
                                <label htmlFor="email" className="label-field">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="type" className="label-field">
                                    Employment Type *
                                </label>
                                <select
                                    id="type"
                                    name="type"
                                    required
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="input-field"
                                    aria-required="true"
                                >
                                    <option value="hourly">Hourly</option>
                                    <option value="salaried">Salaried</option>
                                </select>
                            </div>
                            
                            <div>
                                <label htmlFor="baseHourlyRate" className="label-field">
                                    Base Hourly Rate ($) *
                                </label>
                                <input
                                    type="number"
                                    id="baseHourlyRate"
                                    name="baseHourlyRate"
                                    required
                                    step="0.01"
                                    min="0"
                                    value={formData.baseHourlyRate}
                                    onChange={(e) => setFormData({ ...formData, baseHourlyRate: e.target.value })}
                                    className="input-field"
                                    aria-required="true"
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="superRate" className="label-field">
                                    Super Rate (decimal) *
                                </label>
                                <input
                                    type="number"
                                    id="superRate"
                                    name="superRate"
                                    required
                                    step="0.001"
                                    min="0"
                                    max="1"
                                    value={formData.superRate}
                                    onChange={(e) => setFormData({ ...formData, superRate: e.target.value })}
                                    className="input-field"
                                    aria-required="true"
                                    aria-describedby="superRate-description"
                                />
                                <p id="superRate-description" className="mt-1 text-sm text-gray-500">
                                    e.g., 0.115 for 11.5%
                                </p>
                            </div>
                            
                            <div>
                                <label htmlFor="bankBsb" className="label-field">
                                    Bank BSB *
                                </label>
                                <input
                                    type="text"
                                    id="bankBsb"
                                    name="bankBsb"
                                    required
                                    value={formData.bankBsb}
                                    onChange={(e) => setFormData({ ...formData, bankBsb: e.target.value })}
                                    className="input-field"
                                    placeholder="000-000"
                                    aria-required="true"
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="bankAccount" className="label-field">
                                    Bank Account *
                                </label>
                                <input
                                    type="text"
                                    id="bankAccount"
                                    name="bankAccount"
                                    value={formData.bankAccount}
                                    onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                                    className="input-field"
                                    aria-required="true"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
                        <button
                            type="button"
                            onClick={() => navigate("/employees")}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {createMutation.isPending || updateMutation.isPending
                                ? "Saving..."
                                : isEditing
                                ? "Update Employee"
                                : "Add Employee"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
