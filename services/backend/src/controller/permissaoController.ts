import db from "../db";

export default class PermissaoController{
    static async desabilitarPermissaoAgente(usuarioId: number){
        try{
            const query = 'select * from agente_usuario where usuario_id = ?';
            const values = [usuarioId];

            if(!usuarioId){
                return {success: false, message: 'Usuário não informado'};
            }

            return new Promise<any>((resolve, reject) => {
                db.query(query, values, async (err, results) => {
                    if(err){
                        console.error('Erro ao desabilitar permissão do agente:', err);
                        reject({success: false, message: 'Erro ao desabilitar permissão do agente', error: err});
                    }else{
                        if((results as any[]).length == 0){
                            resolve({success: false, message: 'Usuário não possui permissão de agente'});
                        }else{
                            const queryDesabilitaPermissao = 'update agente_usuario set selecionado = 2 where usuario_id = ?';
                            db.query(queryDesabilitaPermissao, values, async (err) => {
                                if(err){
                                    console.error('Erro ao desabilitar permissão do agente:', err);
                                    reject({success: false, message: 'Erro ao desabilitar permissão do agente', error: err});
                                }else{
                                    resolve({success: true, message: 'Permissão de agente desabilitada com sucesso'});
                                }
                            });
                        }
                    }
                });
            });
        } catch (error) {
            console.error('Erro ao desabilitar permissão do agente:', error);
            return {success: false, message: 'Erro ao desabilitar permissão do agente'};
        }
    }
}