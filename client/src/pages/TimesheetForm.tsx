import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, formatISO } from "date-fns";
import { employeesApi, timesheetsApi } from "../api/client";

interface TimesheetEntryForm {
    date: string;
    start: string;
    end: string;
    unpaidBreakMins: string;
}

export default function TimesheetForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();
    const isEditing = !!id;
    
    const [employeeId, setEmployeeId] = useState("");
    const [weekStart, setWeekStart] = useState("");
    const [allowances, setAllowances] = useState("0");
    const [entries, setEntries] = useState<TimesheetEntryForm[]>([]);
    
    const { data: employees } = useQuery({
        queryKey: ["employees"],
        queryFn: employeesApi.getAll,
    });
    
    const { data: timesheet } = useQuery({
        queryKey: ["timesheet", id],
        queryFn: () => timesheetsApi.getById(id!),
        enabled: isEditing,
    });
    
    useEffect(() => {
        if (timesheet) {
            setEmployeeId(timesheet.employeeId);
            setWeekStart(format(new Date(timesheet.start), "yyyy-MM-dd"));
            setAllowances(timesheet.allowances.toString());
            setEntries(
                timesheet.TimesheetEntry.map((entry) => ({
                    date: format(new Date(entry.date), "yyyy-MM-dd"),
                    start: format(new Date(entry.start), "HH:mm"),
                    end: format(new Date(entry.end), "HH:mm"),
                    unpaidBreakMins: entry.unpaidBreakMins.toString(),
                }))
            );
        }
    }, [timesheet]);
    
    const handleWeekChange = (date: string) => {
        setWeekStart(date);
        const start = startOfWeek(new Date(date), { weekStartsOn: 1 }); // Monday
        const end = endOfWeek(new Date(date), { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start, end });
        
        // Generate entries for weekdays (Mon-Fri)
        const weekdayEntries = days.slice(0, 5).map((day) => ({
            date: format(day, "yyyy-MM-dd"),
            start: "09:00",
            end: "17:00",
            unpaidBreakMins: "30",
        }));
        
        setEntries(weekdayEntries);
    };
    
    const addEntry = () => {
        setEntries([
            ...entries,
            {
                date: weekStart || format(new Date(), "yyyy-MM-dd"),
                start: "09:00",
                end: "17:00",
                unpaidBreakMins: "30",
            },
        ]);
    };
    
    const removeEntry = (index: number) => {
        setEntries(entries.filter((_, i) => i !== index));
    };
    
    const updateEntry = (index: number, field: keyof TimesheetEntryForm, value: string) => {
        const newEntries = [...entries];
        newEntries[index]![field] = value;
        setEntries(newEntries);
    };
    
    const createMutation = useMutation({
        mutationFn: timesheetsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["timesheets"] });
            navigate("/timesheets");
        },
    });
    
    const updateMutation = useMutation({
        mutationFn: (data: any) => timesheetsApi.update(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["timesheets"] });
            queryClient.invalidateQueries({ queryKey: ["timesheet", id] });
            navigate("/timesheets");
        },
    });
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        if (!employeeId || !weekStart || entries.length === 0) {
            alert("Please fill in all required fields and add at least one entry");
            return;
        }
        
        const start = startOfWeek(new Date(weekStart), { weekStartsOn: 1 });
        const end = endOfWeek(new Date(weekStart), { weekStartsOn: 1 });
        
        const data = {
            employeeId,
            start: formatISO(start),
            end: formatISO(end),
            allowances: parseFloat(allowances),
            entries: entries.map((entry) => ({
                employeeId,
                date: formatISO(new Date(entry.date)),
                start: formatISO(new Date(`${entry.date}T${entry.start}:00`)),
                end: formatISO(new Date(`${entry.date}T${entry.end}:00`)),
                unpaidBreakMins: parseInt(entry.unpaidBreakMins),
            })),
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
                    onClick={() => navigate("/timesheets")}
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                    aria-label="Back to timesheets list"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                    Back to Timesheets
                </button>
            </div>
            
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {isEditing ? "Edit Timesheet" : "Add New Timesheet"}
                    </h1>
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="mt-8 space-y-6 max-w-4xl">
                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                    <div className="px-4 py-6 sm:p-8">
                        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-3">
                            <div className="sm:col-span-2">
                                <label htmlFor="employeeId" className="label-field">
                                    Employee *
                                </label>
                                <select
                                    id="employeeId"
                                    name="employeeId"
                                    required
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(e.target.value)}
                                    className="input-field"
                                    disabled={isEditing}
                                    aria-required="true"
                                >
                                    <option value="">Select an employee</option>
                                    {employees?.map((emp) => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.firstName} {emp.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label htmlFor="weekStart" className="label-field">
                                    Week Starting *
                                </label>
                                <input
                                    type="date"
                                    id="weekStart"
                                    name="weekStart"
                                    required
                                    value={weekStart}
                                    onChange={(e) => handleWeekChange(e.target.value)}
                                    className="input-field"
                                    aria-required="true"
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="allowances" className="label-field">
                                    Allowances ($)
                                </label>
                                <input
                                    type="number"
                                    id="allowances"
                                    name="allowances"
                                    step="0.01"
                                    min="0"
                                    value={allowances}
                                    onChange={(e) => setAllowances(e.target.value)}
                                    className="input-field"
                                />
                            </div>
                        </div>
                        
                        <div className="mt-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Time Entries</h3>
                                <button
                                    type="button"
                                    onClick={addEntry}
                                    className="btn-secondary inline-flex items-center text-sm"
                                    aria-label="Add time entry"
                                >
                                    <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
                                    Add Entry
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                {entries.map((entry, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-1 gap-4 sm:grid-cols-5 items-end p-4 bg-gray-50 rounded-lg"
                                    >
                                        <div>
                                            <label htmlFor={`date-${index}`} className="label-field">
                                                Date
                                            </label>
                                            <input
                                                type="date"
                                                id={`date-${index}`}
                                                value={entry.date}
                                                onChange={(e) => updateEntry(index, "date", e.target.value)}
                                                className="input-field"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor={`start-${index}`} className="label-field">
                                                Start Time
                                            </label>
                                            <input
                                                type="time"
                                                id={`start-${index}`}
                                                value={entry.start}
                                                onChange={(e) => updateEntry(index, "start", e.target.value)}
                                                className="input-field"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor={`end-${index}`} className="label-field">
                                                End Time
                                            </label>
                                            <input
                                                type="time"
                                                id={`end-${index}`}
                                                value={entry.end}
                                                onChange={(e) => updateEntry(index, "end", e.target.value)}
                                                className="input-field"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor={`break-${index}`} className="label-field">
                                                Break (mins)
                                            </label>
                                            <input
                                                type="number"
                                                id={`break-${index}`}
                                                value={entry.unpaidBreakMins}
                                                onChange={(e) => updateEntry(index, "unpaidBreakMins", e.target.value)}
                                                className="input-field"
                                                min="0"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => removeEntry(index)}
                                                className="w-full btn-secondary inline-flex items-center justify-center text-red-600 hover:text-red-700"
                                                aria-label={`Remove entry for ${entry.date}`}
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" aria-hidden="true" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                
                                {entries.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        No entries added. Click "Add Entry" to get started.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
                        <button
                            type="button"
                            onClick={() => navigate("/timesheets")}
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
                                ? "Update Timesheet"
                                : "Add Timesheet"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
