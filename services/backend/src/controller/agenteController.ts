import { Request, Response } from 'express';
import db from '../config/db';

export default class AgenteController {

    static async cadastrarAgente(agente: any) {
        const { setor, assunto, documento } = agente;
    
        // Query para inserir o novo agente
        const queryInsertAgente = 'INSERT INTO agentes (setor, assunto, documento) VALUES (?, ?, ?)';
        const values = [setor, assunto, documento];
    
        return new Promise<any>((resolve, reject) => {
            db.query(queryInsertAgente, values, async (err, results) => {
                if (err) {
                    console.error('Erro ao cadastrar agente:', err);
                    return reject({ success: false, message: 'Erro ao cadastrar agente', error: err });
                }
    
                try {
                    // Obter o ID do agente recém-inserido
                    const agenteId = (results as any).insertId;
    
                    // Buscar todos os usuários existentes
                    const queryUsuarios = 'SELECT id FROM usuario';
                    const usuarios = await new Promise<any[]>((resolve, reject) => {
                        db.query(queryUsuarios, (err, rows) => {
                            if (err) {
                                console.error('Erro ao buscar usuários:', err);
                                return reject(err);
                            }
                            if (Array.isArray(rows)) {
                                resolve(rows);
                            } else {
                                reject(new Error('Unexpected result format from database query'));
                            }
                        });
                    });
    
                    if (usuarios.length > 0) {
                        // Associar cada usuário ao novo agente
                        const queryAssociaUsuario = 'INSERT INTO agente_usuario (agente_id, usuario_id, selecionado) VALUES ?';
                        const valoresAssociaUsuario = usuarios.map((usuario) => [agenteId, usuario.id, true]);
    
                        await new Promise<void>((resolve, reject) => {
                            db.query(queryAssociaUsuario, [valoresAssociaUsuario], (err) => {
                                if (err) {
                                    console.error('Erro ao associar usuários ao agente:', err);
                                    return reject(err);
                                }
                                console.log(`Todos os usuários foram associados ao agente com ID ${agenteId}`);
                                resolve();
                            });
                        });
                    }
    
                    resolve({
                        success: true,
                        message: 'Agente cadastrado com sucesso e usuários associados',
                    });
                } catch (error) {
                    console.error('Erro ao associar usuários ao agente:', error);
                    reject({ success: false, message: 'Erro ao associar usuários ao agente', error });
                }
            });
        });
    }
    
    static async listarAgentes(): Promise<any> {
        const query = 'SELECT * FROM agentes';
    
        return new Promise((resolve, reject) => {
            db.query(query, (err, rows) => {
                if (err) {
                    console.error('Erro ao buscar agentes:', err);
                    reject({ success: false, message: 'Erro ao buscar agentes', error: err });
                } else {
                    resolve({ success: true, data: rows });
                }
            });
        });
    }

    static async listarUsuariosPorAgente(agenteId: number): Promise<any> {
        try {
            // Consulta para recuperar os IDs dos usuários associados ao agente e o campo 'selecionado'
            const queryAgenteUsuario = `
                SELECT au.usuario_id, au.selecionado, u.id, u.nome, u.email 
                FROM agente_usuario au
                INNER JOIN usuario u ON au.usuario_id = u.id
                WHERE au.agente_id = ?
            `;
            const valuesAgenteUsuario = [agenteId];
    
            // Executar a consulta
            const usuariosDetalhes = await new Promise<any>((resolve, reject) => {
                db.query(queryAgenteUsuario, valuesAgenteUsuario, (err, rows) => {
                    if (err) {
                        console.error('Erro ao buscar usuários associados ao agente:', err);
                        reject({ success: false, message: 'Erro ao buscar usuários associados ao agente', error: err });
                    } else {
                        resolve(rows);
                    }
                });
            });
    
            // Retornar os detalhes dos usuários com o campo 'selecionado'
            return { success: true, data: usuariosDetalhes };
    
        } catch (error) {
            console.error('Erro ao buscar usuários por agente:', error);
            return { success: false, message: 'Erro ao buscar usuários por agente', error: error };
        }
    }

    static async deletarAgente(agenteId: number): Promise<any> {
        // Primeiro, deletar todas as associações do agente com usuários
        const queryDeleteAssociacoes = 'DELETE FROM agente_usuario WHERE agente_id = ?';
        
        // Depois, deletar o agente
        const queryDeleteAgente = 'DELETE FROM agentes WHERE id = ?';
    
        return new Promise<any>(async (resolve, reject) => {
            try {
                // Iniciar uma transação para garantir atomicidade
                await new Promise<void>((resolve, reject) => {
                    db.query('START TRANSACTION', (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
    
                // 1. Deletar as associações primeiro
                await new Promise<void>((resolve, reject) => {
                    db.query(queryDeleteAssociacoes, [agenteId], (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
    
                // 2. Deletar o agente
                await new Promise<void>((resolve, reject) => {
                    db.query(queryDeleteAgente, [agenteId], (err, result) => {
                        if (err) return reject(err);
                        if ((result as any).affectedRows === 0) {
                            return reject(new Error('Nenhum agente encontrado com o ID fornecido'));
                        }
                        resolve();
                    });
                });
    
                // Commit da transação
                await new Promise<void>((resolve, reject) => {
                    db.query('COMMIT', (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
    
                resolve({
                    success: true,
                    message: 'Agente e suas associações deletados com sucesso'
                });
    
            } catch (error) {
                // Rollback em caso de erro
                await new Promise<void>((resolve) => {
                    db.query('ROLLBACK', () => resolve());
                });
    
                console.error('Erro ao deletar agente:', error);
                reject({
                    success: false,
                    message: 'Erro ao deletar agente',
                    error: error instanceof Error ? error.message : error
                });
            }
        });
    }
}