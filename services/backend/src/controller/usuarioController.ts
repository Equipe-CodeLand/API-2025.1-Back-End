import db from "../config/db";
import bcrypt from 'bcrypt';
import { RowDataPacket } from 'mysql2';
import jwt from 'jsonwebtoken';
import { Request, Response } from "express";


export default class UsuarioController {
    static async cadastrarUsuario(usuario: any) {
        try {
            const { nome, email, senha, cargo } = usuario;

            // 🔍 Verifica se o email já está cadastrado
            const queryEmail = 'SELECT id FROM usuario WHERE email = ?';
            const emailExiste = await new Promise<boolean>((resolve, reject) => {
                db.query(queryEmail, [email], (err, results: RowDataPacket[]) => {
                    if (err) return reject(err);
                    resolve(results.length > 0);
                });
            });

            if (emailExiste) {
                return {
                    success: false,
                    message: 'E-mail já cadastrado.'
                };
            }

            // 🔐 Cria hash da senha
            const saltRounds = 10;
            const senhaHash = await bcrypt.hash(senha, saltRounds);

            const queryInsert = `INSERT INTO usuario (nome, email, senha, role, ativo) VALUES (?, ?, ?, ?, ?)`;
            const values = [nome, email, senhaHash, cargo, true];

            return new Promise<any>((resolve, reject) => {
                db.query(queryInsert, values, async (err, result) => {
                    if (err) {
                        console.error('Erro ao cadastrar usuário:', err);
                        return reject({ success: false, message: 'Erro ao cadastrar usuário', error: err });
                    }

                    const usuarioId = (result as any).insertId;

                    try {
                        const queryAgentes = 'SELECT id FROM agentes';
                        const agentes = await new Promise<any[]>((resolve, reject) => {
                            db.query(queryAgentes, (err, rows) => {
                                if (err) return reject(err);
                                if (Array.isArray(rows)) return resolve(rows);
                                return reject(new Error('Formato inesperado'));
                            });
                        });

                        if (agentes.length > 0) {
                            let queryAssociaAgente = 'INSERT INTO agente_usuario (agente_id, usuario_id, selecionado) VALUES ?';
                            let valoresAssociaAgente: any[] = [];

                            if (cargo !== 'admin') {
                                valoresAssociaAgente = agentes.map((agente) => [agente.id, usuarioId, false]);
                            } else {
                                valoresAssociaAgente = agentes.map((agente) => [agente.id, usuarioId, true]);
                            }

                            await new Promise<void>((resolve, reject) => {
                                db.query(queryAssociaAgente, [valoresAssociaAgente], (err) => {
                                    if (err) return reject(err);
                                    resolve();
                                });
                            });
                        }

                        resolve({
                            success: true,
                            message: 'Usuário cadastrado com sucesso',
                            senhaHash
                        });

                    } catch (error) {
                        return reject({ success: false, message: 'Erro ao associar agentes', error });
                    }
                });
            });
        } catch (error) {
            return { success: false, message: 'Erro ao cadastrar usuário', error };
        }
    }

    static async listarUsuarios(): Promise<any> {
        const query = 'SELECT * FROM usuario';

        return new Promise((resolve, reject) => {
            db.query(query, (err, rows) => {
                if (err) {
                    console.error('Erro ao buscar usuarios:', err);
                    reject({ success: false, message: 'Erro ao buscar usuarios', error: err });
                } else {
                    resolve({ success: true, data: rows });
                }
            });
        });
    }

    static async listarUsuarioPorId(id: number): Promise<any> {
        const query = 'SELECT * FROM usuario WHERE id = ?';

        return new Promise((resolve, reject) => {
            db.query(query, [id], (err, result: RowDataPacket[]) => {
                if (err) {
                    console.error('Erro ao buscar usuário:', err);
                    reject({ success: false, message: 'Erro ao buscar usuário', error: err });
                } else {
                    if (result.length === 0) {
                        resolve({ success: false, message: 'Usuário não encontrado' });
                    } else {
                        resolve({ success: true, data: result[0] });
                    }
                }
            });
        });
    }

    static async atualizarStatusUsuario(id: number, ativo: boolean): Promise<any> {
        const query = 'UPDATE usuario SET ativo = ? WHERE id = ?';

        return new Promise((resolve, reject) => {
            db.query(query, [ativo, id], (err, result) => {
                if (err) {
                    console.error('Erro ao atualizar status do usuário:', err);
                    reject({ success: false, message: 'Erro ao atualizar status', error: err });
                } else {
                    resolve({ success: true, message: `Usuário ${ativo ? 'reativado' : 'inativo'} com sucesso!` });
                }
            });
        });
    }

}
