import { Request, Response, NextFunction } from 'express';

export function validateRole(requiredRole: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = req.user?.role;
        if (userRole !== requiredRole) {
            return res.status(403).json({ message: 'Forbidden: Insufficient role' });
        }
        next();
    };
}
