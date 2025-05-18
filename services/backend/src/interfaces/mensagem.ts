import { ObjectId } from "mongodb";

export interface Mensagem {
  id: ObjectId;
  usuario_id: number; 
  agente_id: number;
  texto: string;
  data: Date;
}
