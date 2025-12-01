import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
    userId: string;
    role: string;
    iat: number;
    exp: number;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new Error('No token provided');
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
        req.user = { userId: decodedToken.userId, role: decodedToken.role, iat: decodedToken.iat, exp: decodedToken.exp };
        req.userData = { userId: decodedToken.userId, role: decodedToken.role }; // For backward compatibility
        next();
    } catch (error) {
        res.status(401).json({ message: 'Auth failed' });
    }
};
