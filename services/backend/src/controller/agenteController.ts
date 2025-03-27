import { Request, Response } from 'express';
import db from '../db';

export default class AgenteController {

    static async cadastrarAgente(agente: any) {
        const { setor, assunto, documento } = agente;

        const query = 'INSERT INTO agentes (setor, assunto, documento) VALUES (?, ?, ?)';
        const values = [setor, assunto, documento];

        return new Promise<any>((resolve, reject) => {
            db.query(query, values, (err, results) => {
                if (err) {
                    console.error('Erro ao cadastrar agente:', err);
                    reject({ success: false, message: 'Erro ao cadastrar agente', error: err });
                } else {

                    resolve({
                        success: true,
                        message: 'Agente cadastrado com sucesso',
                    });
                }
            });
        });
    }
}
