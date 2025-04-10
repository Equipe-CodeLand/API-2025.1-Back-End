import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/auth';
import { Usuario } from '../interfaces/usuario';
import bcrypt from 'bcrypt';

export default new class Autenticacao {
    public async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, senha } = req.body;

            if (!email || !senha) {
                res.status(400).json({ message: 'Email e senha são obrigatórios' });
                return;
            }

            const [rows] = await pool.query<Usuario[]>(
                'SELECT * FROM usuario WHERE email = ?', 
                [email]
            );

            if (rows.length === 0) {
                res.status(401).json({ message: 'Credenciais inválidas' });
                return;
            }

            const usuario = rows[0];

            // 🔐 Compara a senha fornecida com o hash do banco
            const senhaValida = await bcrypt.compare(senha, usuario.senha);

            if (!senhaValida) {
                res.status(401).json({ message: 'Credenciais inválidas' });
                return;
            }

            const token = jwt.sign(
                { id: usuario.id, role: usuario.role }, 
                process.env.JWT_SECRET as string, 
                { expiresIn: '1h' }
            );

            res.json({ 
                message: 'Login bem-sucedido',
                token,
                role: usuario.role
            });

        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }
}
