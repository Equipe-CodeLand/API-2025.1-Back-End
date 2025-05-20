import { ObjectId } from "mongodb";
import { getDb } from "../config/db";
import { Chat } from "../interfaces/chat";
import { Mensagem } from "../interfaces/mensagem";

export default class ChatController {
    static async criarChat(usuario_id:number, agente_id:number, chat_id:any, question:string) {
        try {
            const db = await getDb();
            const collection = db.collection<Chat>("Chats");

            let id = chat_id

            if (!chat_id){
                id = new ObjectId()
            }

            const novoChat: Chat = {
                id: id,
                usuario_id: usuario_id,
                agente_id: agente_id,
                data_criacao: new Date(),
                titulo: question,
                mensagens: [],
            };

            const result = await collection.insertOne(novoChat);
            return { success: true, insertedId: result.insertedId };
        } catch (error) {
            console.error("Erro ao criar chat:", error);
            return { success: false, message: "Erro ao criar chat", error };
        }
    }

    static async listarChats() {
        try {
            const db = await getDb();
            const collection = db.collection<Chat>("Chats");
            const chats = await collection.find().toArray();
            return { success: true, data: chats };
        } catch (error) {
            console.error("Erro ao listar chats:", error);
            return { success: false, message: "Erro ao listar chats", error };
        }
    }

    static async buscarChatPorId(id: string) {
        try {
            const db = await getDb();
            const collection = db.collection<Chat>("Chats");
            const chat = await collection.findOne({ id: id });

            if (!chat) {
                return { success: false, message: "Chat não encontrado" };
            }

            return { success: true, data: chat };
        } catch (error) {
            console.error("Erro ao buscar chat:", error);
            return { success: false, message: "Erro ao buscar chat", error };
        }
    }

    static async adicionarMensagem(usuario_id:number|null, agente_id:number|null, chat_id:any, texto:string) {
        try {
            const db = await getDb();
            const collection = db.collection<Chat>("Chats");

            const novaMensagem: Mensagem = {
                id: new ObjectId(),
                usuario_id: usuario_id,
                agente_id: agente_id,
                texto: texto,
                data: new Date(),
            };

            const result = await collection.updateOne(
                { id: chat_id },
                { $push: { mensagens: novaMensagem } }
            );

            if (result.modifiedCount === 0) {
                return { success: false, message: "Chat não encontrado ou mensagem não adicionada" };
            }

            return { success: true, message: "Mensagem adicionada com sucesso" };
        } catch (error) {
            console.error("Erro ao adicionar mensagem:", error);
            return { success: false, message: "Erro ao adicionar mensagem", error };
        }
    }

    static async excluirChat(chatId: string) {
        try {
            const db = await getDb();
            const collection = db.collection("Chats");

            const result = await collection.deleteOne({ id: new ObjectId(chatId) });

            if (result.deletedCount === 0) {
                return { success: false, message: "Chat não encontrado" };
            }

            return { success: true, message: "Chat excluído com sucesso" };
        } catch (error) {
            console.error("Erro ao excluir chat:", error);
            return { success: false, message: "Erro ao excluir chat", error };
        }
    }

}
