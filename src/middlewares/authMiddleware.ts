import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: any; // The decoded token payload
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(" ")[1];
        
        jwt.verify(token, process.env.JWT_SECRET || "super_secret_jwt_key_here", (err, user) => {
            if (err) {
                return res.status(403).json({ message: "Invalid or expired token" });
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ message: "Authorization header missing" });
    }
};

export const authorizeRole = (role: "USER" | "VENDOR" | "ADMIN") => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ message: "Forbidden: Insufficient privileges" });
        }
        next();
    };
};
