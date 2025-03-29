import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface DecodedToken {
    id: number;
    role: string;
}

export const verificarAdmin = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Acesso negado' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

        if (decoded.role !== 'admin') {
            res.status(403).json({ message: 'Apenas administradores podem acessar esta rota' });
            return;
        }

        next(); // 🔥 Certifique-se de chamar `next()`
    } catch (error) {
        res.status(401).json({ message: 'Token inválido' });
    }
};
