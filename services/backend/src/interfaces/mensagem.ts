import { ObjectId } from "mongodb";

export interface Mensagem {
  id: ObjectId;
  usuario_id: number|null; // quando é mensagem do bot, usuario_id = null
  agente_id: number|null; // quando é mensagem do usuario, agente_id = null
  texto: string;
  data: Date;
}
