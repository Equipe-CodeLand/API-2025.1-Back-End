import { ObjectId } from "mongodb";
import { Mensagem } from "./mensagem";

export interface Chat {
  _id: ObjectId;
  usuario_id: number;
  agente_id: number;
  data_criacao: Date;
  titulo: string;
  mensagens: Mensagem[];
}