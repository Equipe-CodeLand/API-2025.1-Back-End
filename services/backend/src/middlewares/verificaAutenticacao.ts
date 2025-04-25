import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: number;
  role: string;
}

export const Authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token não fornecido' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    // Repassa os dados do usuário logado para a rota
    (req as any).usuarioLogadoId = decoded.id;
    (req as any).role = decoded.role;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido ou expirado' });
    return; 
  }
};
