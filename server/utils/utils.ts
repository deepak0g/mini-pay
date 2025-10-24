import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const validateMiddleware = <T, U>({ schema, paramsSchema }: { schema?: z.ZodSchema<T>, paramsSchema?: z.ZodSchema<U> }) =>
    (req: Request, res: Response, next: NextFunction) => {
        const result = schema?.safeParse(req.body);
        if (schema && !result?.success) {
            return res.status(400).json({ error: result?.error.issues });
        }
        if (paramsSchema) {
            const paramsResult = paramsSchema.safeParse(req.params);
            if (!paramsResult.success) {
                return res.status(400).json({ error: paramsResult.error.issues });
            }
        }
        next();
    };