import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { httpLogger, logger } from "./utils/logger";
import employeesRouter from "./routes/employees";
import timesheetsRouter from "./routes/timesheets";
import payrunRouter from "./routes/payrun";
import { authMiddleware } from "./middleware/auth";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:5173"];
app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, Postman, etc.)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api/", limiter);

// Request logging
app.use(httpLogger);

// Body parser with size limit
app.use(express.json({ limit: "1mb" }));

// Authentication middleware
app.use(authMiddleware);

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// API routes
app.use("/api/employees", employeesRouter);
app.use("/api/timesheets", timesheetsRouter);
app.use("/api/payrun", payrunRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`);
});