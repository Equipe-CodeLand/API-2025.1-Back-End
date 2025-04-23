import { RowDataPacket } from "mysql2";
import Role from "../enum/role";

export interface Usuario extends RowDataPacket {
    id: number;
    nome: string;
    email: string;
    senha: string;
    criado_em: Date;
    role: Role;
    ativo: boolean;
}