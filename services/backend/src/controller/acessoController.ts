import { Request, Response } from 'express';
import db from '../config/db';

class AcessoController {
  static registrarAcesso(req: Request, res: Response) {
    const { agente_nome } = req.body;
    const usuario_id = (req as any).usuarioLogadoId;

    if (!agente_nome) {
      return res.status(400).json({ error: 'Agente nome é obrigatório' });
    }

    const query = 'INSERT INTO agente_acessos (agente_nome, usuario_id) VALUES (?, ?)';
    const values = [agente_nome, usuario_id || null];

    db.query(query, values, (error) => {
      if (error) {
        console.error('Erro ao registrar acesso:', error);
        return res.status(500).json({ error: 'Erro ao registrar acesso' });
      }

      res.status(201).json({ message: 'Acesso registrado com sucesso' });
    });
  }

  static listarAcessos(req: Request, res: Response) {
    const query = `
      SELECT id, agente_nome, usuario_id, data_acesso 
      FROM agente_acessos 
      ORDER BY data_acesso DESC
    `;

    db.query(query, (error, results) => {
      if (error) {
        console.error('Erro ao buscar acessos:', error);
        return res.status(500).json({ error: 'Erro ao buscar acessos' });
      }
      console.log('Métricas encontradas:', results); 
      res.status(200).json(results);
    });
  }
}

export default AcessoController;
