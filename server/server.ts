import express from "express";
import cors from "cors";
import employeesRouter from "./routes/employees";
import timesheetsRouter from "./routes/timesheets";
import payrunRouter from "./routes/payrun";

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// API routes
app.use("/api/employees", employeesRouter);
app.use("/api/timesheets", timesheetsRouter);
app.use("/api/payrun", payrunRouter);

app.listen(3000, () => {
    console.log("Server started on port 3000");
});