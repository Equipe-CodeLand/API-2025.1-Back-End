import db from '../config/db';

interface RegistroAcessoParams {
  usuario_id: number;
  agente_id?: number;
  agente_nome: string;
}

class AcessoController {
  static async registrarAcesso({ usuario_id, agente_id, agente_nome }: RegistroAcessoParams) {
    try {
      if (!agente_nome) {
        return { success: false, message: 'Agente nome é obrigatório' };
      }

      const query = `
        INSERT INTO agente_acessos (agente_nome, usuario_id, agente_id) 
        VALUES (?, ?, ?)
      `;
      const values = [agente_nome, usuario_id || null, agente_id || null];

      await new Promise((resolve, reject) => {
        db.query(query, values, (error) => {
          if (error) {
            console.error('Erro ao registrar acesso:', error);
            return reject(error);
          }
          return resolve(true);
        });
      });

      return { success: true, message: 'Acesso registrado com sucesso' };
    } catch (error) {
      console.error('Erro no registrarAcesso:', error);
      return { success: false, message: 'Erro ao registrar acesso', error };
    }
  }

  static async listarAcessos() {
    try {
      const query = `
        SELECT id, agente_nome, agente_id, usuario_id, data_acesso 
        FROM agente_acessos 
        ORDER BY data_acesso DESC
      `;

      const resultados: any = await new Promise((resolve, reject) => {
        db.query(query, (error, results) => {
          if (error) {
            console.error('Erro ao buscar acessos:', error);
            return reject(error);
          }
          return resolve(results);
        });
      });

      return { success: true, data: resultados };
    } catch (error) {
      console.error('Erro no listarAcessos:', error);
      return { success: false, message: 'Erro ao buscar acessos', error };
    }
  }
}

export default AcessoController;
