import type { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        logger.warn({ path: req.path }, "Missing or invalid Authorization header");
        return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }
    const token = authHeader.slice(7).trim();
    if (!token) {
        logger.warn({ path: req.path }, "Empty bearer token");
        return res.status(401).json({ error: "Bearer token required" });
    }
    next();
};
