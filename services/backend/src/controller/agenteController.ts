import { Request, Response } from 'express';
import db from '../config/db';

export default class AgenteController {

    static async cadastrarAgente(agente: any) {
        const { setor, assunto, documento } = agente;

        // Query para inserir o novo agente
        const queryInsertAgente = 'INSERT INTO agentes (setor, assunto, documento) VALUES (?, ?, ?)';
        const values = [setor, assunto, documento];

        return new Promise<any>((resolve, reject) => {
            // Inserir o novo agente
            db.query(queryInsertAgente, values, async (err, results) => {
                if (err) {
                    console.error('Erro ao cadastrar agente:', err);
                    reject({ success: false, message: 'Erro ao cadastrar agente', error: err });
                } else {
                    try {
                        // Obter o ID do agente recém-inserido
                        const agenteId = (results as any).insertId;

                        // Buscar todos os usuários existentes
                        const queryUsuarios = 'SELECT id FROM usuario';
                        const usuarios = await new Promise<any>((resolve, reject) => {
                            db.query(queryUsuarios, (err, rows) => {
                                if (err) {
                                    console.error('Erro ao buscar usuários:', err);
                                    reject(err);
                                } else {
                                    resolve(rows);
                                }
                            });
                        });

                        // Associar cada usuário ao novo agente
                        if (usuarios.length > 0) {
                            const queryAssociaUsuario = 'INSERT INTO agente_usuario (agente_id, usuario_id, selecionado) VALUES ?';
                            const valoresAssociaUsuario = usuarios.map((usuario: any) => [agenteId, usuario.id, true]);

                            await new Promise<void>((resolve, reject) => {
                                db.query(queryAssociaUsuario, [valoresAssociaUsuario], (err) => {
                                    if (err) {
                                        console.error('Erro ao associar usuários ao agente:', err);
                                        reject(err);
                                    } else {
                                        console.log(`Todos os usuários foram associados ao agente com ID ${agenteId}`);
                                        resolve();
                                    }
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
            // Primeira consulta: Recuperar os IDs dos usuários associados ao agente
            const queryAgenteUsuario = 'SELECT usuario_id FROM agente_usuario WHERE agente_id = ?';
            const valuesAgenteUsuario = [agenteId];
    
            // Executar a primeira consulta
            const usuariosAssociados = await new Promise<any>((resolve, reject) => {
                db.query(queryAgenteUsuario, valuesAgenteUsuario, (err, rows) => {
                    if (err) {
                        console.error('Erro ao buscar usuários associados ao agente:', err);
                        reject({ success: false, message: 'Erro ao buscar usuários associados ao agente', error: err });
                    } else {
                        resolve(rows);
                    }
                });
            });
    
            // Extrair os IDs dos usuários
            const usuarioIds = usuariosAssociados.map((row: any) => row.usuario_id);
    
            // Se não houver usuários associados, retornar uma resposta vazia
            if (usuarioIds.length === 0) {
                return { success: true, data: [] };
            }
    
            // Segunda consulta: Recuperar os detalhes dos usuários com base nos IDs
            const queryUsuarios = 'SELECT id, nome, email FROM usuario WHERE id IN (?)';
            const valuesUsuarios = [usuarioIds];
    
            // Executar a segunda consulta
            const usuariosDetalhes = await new Promise<any>((resolve, reject) => {
                db.query(queryUsuarios, valuesUsuarios, (err, rows) => {
                    if (err) {
                        console.error('Erro ao buscar detalhes dos usuários:', err);
                        reject({ success: false, message: 'Erro ao buscar detalhes dos usuários', error: err });
                    } else {
                        resolve(rows);
                    }
                });
            });
    
            // Retornar os detalhes dos usuários
            return { success: true, data: usuariosDetalhes };
    
        } catch (error) {
            console.error('Erro ao buscar usuários por agente:', error);
            return { success: false, message: 'Erro ao buscar usuários por agente', error: error };
        }
    }
}