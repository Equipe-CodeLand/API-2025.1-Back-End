import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/auth';
import { Usuario } from '../interfaces/usuario';

export default new class Autenticacao {
    public async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, senha } = req.body;

            // Verifica se os campos obrigatórios estão presentes
            if (!email || !senha) {
                res.status(400).json({ message: 'Email e senha são obrigatórios' });
                return;
            }

            // Busca o usuário no banco de dados pelo email
            const [rows] = await pool.query<Usuario[]>(
                'SELECT * FROM usuario WHERE email = ?', 
                [email]
            );

            console.log('Usuário encontrado:', rows); 

            // Verifica se o usuário existe
            if (rows.length === 0) {
                res.status(401).json({ message: 'Credenciais inválidas' });
                return;
            }

            const usuario = rows[0];

            console.log('Senha fornecida:', senha);
            console.log('Senha do banco de dados:', usuario.senha);

            const senhaValida = senha === usuario.senha; 
            console.log('Senha válida?', senhaValida);

            if (!senhaValida) {
                res.status(401).json({ message: 'Credenciais inválidas' });
                return;
            }

            // Gera o token JWT
            const token = jwt.sign(
                { id: usuario.id, role: usuario.role }, 
                process.env.JWT_SECRET as string, 
                { expiresIn: '1h' }
            );

            // Retorna a resposta com o token
            res.json({ 
                message: 'Login bem-sucedido',
                token 
            });

        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }
}