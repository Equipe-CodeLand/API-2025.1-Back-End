import db from "../config/db";

export default class UsuarioController {
    static async cadastrarUsuario(usuario: any) {
        try {
            const { nome, email, senha, cargo } = usuario;

            const queryInsert = `INSERT INTO usuario (nome, email, senha, role, ativo) VALUES (?, ?, ?, ?, ?)`;
            const values = [nome, email, senha, cargo, true];

            return new Promise<any>((resolve, reject) => {
                db.query(queryInsert, values, async (err, result) => {
                    if (err) {
                        console.error('Erro ao cadastrar usuário:', err);
                        return reject({ success: false, message: 'Erro ao cadastrar usuário', error: err });
                    }

                    try {
                        // Obter o ID do usuário recém-inserido
                        const usuarioId = (result as any).insertId;

                        // Buscar todos os agentes existentes
                        const queryAgentes = 'SELECT id FROM agentes';
                        const agentes = await new Promise<any[]>((resolve, reject) => {
                            db.query(queryAgentes, (err, rows) => {
                                if (err) {
                                    console.error('Erro ao buscar agentes:', err);
                                    return reject(err);
                                }
                                if (Array.isArray(rows)) {
                                    resolve(rows);
                                } else {
                                    reject(new Error('Formato inesperado no resultado da consulta'));
                                }
                            });
                        });

                        if (agentes.length > 0) {
                            let queryAssociaAgente = '';
                            let valoresAssociaAgente: any[] = [];

                            if (cargo !== 'admin') {
                                // Associar todos os agentes ao novo usuário com "selecionado" como false
                                queryAssociaAgente = 'INSERT INTO agente_usuario (agente_id, usuario_id, selecionado) VALUES ?';
                                valoresAssociaAgente = agentes.map((agente) => [agente.id, usuarioId, false]);
                            } else {
                                // Se o usuário for admin, associar apenas o agente com ID 1 com "selecionado" como true
                                queryAssociaAgente = 'INSERT INTO agente_usuario (agente_id, usuario_id, selecionado) VALUES ?';
                                valoresAssociaAgente = agentes.map((agente) => [agente.id, usuarioId, true]);
                            }

                            await new Promise<void>((resolve, reject) => {
                                db.query(queryAssociaAgente, [valoresAssociaAgente], (err) => {
                                    if (err) {
                                        console.error('Erro ao associar agentes ao usuário:', err);
                                        return reject(err);
                                    }
                                    console.log(`Agentes foram associados ao usuário com ID ${usuarioId}`);
                                    resolve();
                                });
                            });
                        }

                        resolve({
                            success: true,
                            message: 'Usuário cadastrado com sucesso'
                        });
                    } catch (error) {
                        console.error('Erro ao associar agentes ao usuário:', error);
                        reject({ success: false, message: 'Erro ao associar agentes ao usuário', error });
                    }
                });
            });
        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);
            return { success: false, message: 'Erro ao cadastrar usuário', error };
        }
    }
}