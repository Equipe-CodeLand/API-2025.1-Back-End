import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { RowDataPacket } from 'mysql2';

interface Usuario extends RowDataPacket {
    id: number;
    nome: string;
    email: string;
    senha: string;
    criado_em: Date;
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Exportando como handler de rota diretamente
export const loginHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            res.status(400).json({ message: 'Email e senha são obrigatórios' });
            return;
        }

        const [rows] = await pool.query<Usuario[]>(
            'SELECT * FROM usuarios WHERE email = ?', 
            [email]
        );
        
        if (rows.length === 0) {
            res.status(401).json({ message: 'Credenciais inválidas' });
            return;
        }

        const usuario = rows[0];
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        
        if (!senhaValida) {
            res.status(401).json({ message: 'Credenciais inválidas' });
            return;
        }

        const { senha: _, ...usuarioSemSenha } = usuario;
        
        res.json({ 
            message: 'Login bem-sucedido',
            usuario: usuarioSemSenha
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};