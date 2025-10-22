import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Users, FileText, DollarSign, LayoutDashboard } from "lucide-react";
import EmployeesList from "./pages/EmployeesList";
import EmployeeForm from "./pages/EmployeeForm";
import TimesheetsList from "./pages/TimesheetsList";
import TimesheetForm from "./pages/TimesheetForm";
import RunPay from "./pages/RunPay";
import PayRunSummary from "./pages/PayRunSummary";
import PayslipView from "./pages/PayslipView";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Navigation() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };
  
  return (
    <nav className="bg-white shadow-sm border-b" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Payroo</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/") && location.pathname === "/"
                    ? "border-blue-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
                aria-current={isActive("/") && location.pathname === "/" ? "page" : undefined}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" aria-hidden="true" />
                Dashboard
              </Link>
              <Link
                to="/employees"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/employees")
                    ? "border-blue-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
                aria-current={isActive("/employees") ? "page" : undefined}
              >
                <Users className="w-4 h-4 mr-2" aria-hidden="true" />
                Employees
              </Link>
              <Link
                to="/timesheets"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/timesheets")
                    ? "border-blue-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
                aria-current={isActive("/timesheets") ? "page" : undefined}
              >
                <FileText className="w-4 h-4 mr-2" aria-hidden="true" />
                Timesheets
              </Link>
              <Link
                to="/run-pay"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/run-pay")
                    ? "border-blue-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
                aria-current={isActive("/run-pay") ? "page" : undefined}
              >
                <DollarSign className="w-4 h-4 mr-2" aria-hidden="true" />
                Run Pay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<RunPay />} />
              <Route path="/employees" element={<EmployeesList />} />
              <Route path="/employees/new" element={<EmployeeForm />} />
              <Route path="/employees/:id/edit" element={<EmployeeForm />} />
              <Route path="/timesheets" element={<TimesheetsList />} />
              <Route path="/timesheets/new" element={<TimesheetForm />} />
              <Route path="/timesheets/:id/edit" element={<TimesheetForm />} />
              <Route path="/run-pay" element={<RunPay />} />
              <Route path="/pay-run-summary" element={<PayRunSummary />} />
              <Route path="/payslip/:employeeId" element={<PayslipView />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
