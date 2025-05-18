import { Router, Request, Response } from 'express';
import multer, { StorageEngine } from 'multer';
import AgenteController from '../controller/agenteController';
import { verificarAdmin } from '../middlewares/verificarAdmin';
import Autenticacao from '../controller/loginController';
import PermissaoController from '../controller/permissaoController';
import UsuarioController from '../controller/usuarioController';
import { Authenticate } from '../middlewares/verificaAutenticacao';
import ChatController from '../controller/chatController';
import { ObjectId } from 'mongodb';
import { TIMEOUT } from 'dns';

const router = Router();

router.post('/login', (req: Request, res: Response) => {
    Autenticacao.login(req, res);
});

// configuração pro upload do arquivo pro cadastro do agente
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, 'uploads/');
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// cadastro do usuário
router.post('/cadastro/usuario', verificarAdmin, async (req: Request, res: Response) => {
    const usuario = req.body;
    console.log(usuario);

    try {
        const result = await UsuarioController.cadastrarUsuario(usuario);

        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({ error: 'Erro ao cadastrar usuário' });
    }
});

// Ativar/desativar os usuarios
router.put('/usuarios/:id/status', Authenticate, async (req, res) => {
    const { id } = req.params;
    const { ativo } = req.body;
    const usuarioLogadoId = (req as any).usuarioLogadoId;

    if (Number(id) === usuarioLogadoId) {
        res.status(403).json({ message: 'Você não pode se inativar.' });
        return;
    }

    try {
        const result = await UsuarioController.atualizarStatusUsuario(Number(id), ativo);
        res.json(result);
    } catch (error) {
        res.status(500).json(error);
    }
});


//listagem do usuário
router.get('/usuarios', async (req: Request, res: Response) => {
    try {
        const response = await UsuarioController.listarUsuarios();

        if (response.success) {
            res.status(200).json(response.data);
        } else {
            res.status(500).json({ error: response.message });
        }
    } catch (error) {
        console.error('Erro ao buscar usuarios:', error);
        res.status(500).json({ error: 'Erro ao buscar usuarios' });
    }
});

// listar usuario por id
router.get('/usuarios/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const response = await UsuarioController.listarUsuarioPorId(Number(id));

        if (response.success) {
            res.status(200).json(response.data);
        } else {
            res.status(404).json({ error: response.message });
        }
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
});

router.put('/atualizar/usuarios/:id', async (req: Request, res: Response) => {
    const { id } = req.params

    const dadosAtualizados = req.body

    try {
        const response = await UsuarioController.editarUsuario(Number(id), dadosAtualizados)

        if (response.success) {
            res.status(200).json(response.message);
        } else {
            res.status(404).json({ error: response.message })
        }
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
})

router.get("/usuarios/buscar/agentes/:id", async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const response = await UsuarioController.listarAgentesPorUsuario(Number(id));

        if (response.success) {
            res.status(200).json(response.data);
        } else {
            res.status(404).json({ error: response.message });
        }
    } catch (error) {
        console.error('Erro ao buscar agente:', error);
        res.status(500).json({ error: 'Erro ao buscar agente' });
    }
});

const upload = multer({ storage });

// cadastro do agente
router.post('/cadastro/agente', upload.single('documento'), async (req: Request, res: Response) => {
    const agente = req.body;
    console.log(req.file);

    if (!req.file) {
        res.status(400).json({ success: false, message: "Documento não enviado." });
        return;
    }

    agente.documento = req.file.path;

    try {
        const result = await AgenteController.cadastrarAgente(agente);

        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Erro ao cadastrar agente:', error);
        res.status(500).json({ error: 'Erro ao cadastrar agente' });
    }
});

// Listagem dos agentes
router.get('/agentes', async (req: Request, res: Response) => {
    try {
        const response = await AgenteController.listarAgentes();

        if (response.success) {
            res.status(200).json(response.data);
        } else {
            res.status(500).json({ error: response.message });
        }
    } catch (error) {
        console.error('Erro ao buscar agentes:', error);
        res.status(500).json({ error: 'Erro ao buscar agentes' });
    }
});

// Listagem usuários por agente
router.get('/agentes/:id/usuarios', verificarAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const response = await AgenteController.listarUsuariosPorAgente(parseInt(id));

        if (response.success) {
            res.status(200).json(response.data);
        } else {
            res.status(500).json({ error: response.message });
        }
    } catch (error) {
        console.error('Erro ao buscar usuários por agente:', error);
        res.status(500).json({ error: 'Erro ao buscar usuários por agente' });
    }
});

// Desabilitar permissão de usuário ao agente
router.put('/agentes/:usuarioId/desabilitar', verificarAdmin, async (req: Request, res: Response) => {
    const { usuarioId } = req.params;

    try {
        const response = await PermissaoController.desabilitarPermissaoAgente(parseInt(usuarioId));

        if (response.success) {
            res.status(200).json(response);
        } else {
            res.status(500).json({ error: response.message });
        }
    } catch (error) {
        console.error('Erro ao desabilitar permissão de agente:', error);
        res.status(500).json({ error: 'Erro ao desabilitar permissão de agente' });
    }
});

// Habilitar permissão de usuário ao agente
router.put('/agentes/:usuarioId/habilitar', verificarAdmin, async (req: Request, res: Response) => {
    const { usuarioId } = req.params;

    try {
        const response = await PermissaoController.habilitarPermissaoAgente(parseInt(usuarioId));

        if (response.success) {
            res.status(200).json(response);
        } else {
            res.status(500).json({ error: response.message });
        }
    } catch (error) {
        console.error('Erro ao habilitar permissão de agente:', error);
        res.status(500).json({ error: 'Erro ao habilitar permissão de agente' });
    }
});

// Atualizar agente
router.put('/agentes/:id', verificarAdmin, upload.single('documento'), async (req: Request, res: Response) => {
    const { id } = req.params;
    const agenteData = req.body;

    try {
        if (req.file) {
            agenteData.documento = req.file.path;
        }

        if (agenteData.usuariosSelecionados) {
            try {
                agenteData.usuariosSelecionados = JSON.parse(agenteData.usuariosSelecionados);
            } catch (e) {
                console.error('Erro ao parsear usuariosSelecionados:', e);
                res.status(400).json({
                    success: false,
                    message: 'Formato inválido para usuariosSelecionados'
                });
                return; // Adicione return para encerrar a execução
            }
        }

        const response = await AgenteController.atualizarAgente(parseInt(id), agenteData);

        if (response.success) {
            res.status(200).json(response);
        } else {
            res.status(response.error instanceof Error && response.error.message === 'Agente não encontrado' ?
                404 : 500).json(response);
        }
    } catch (error) {
        console.error('Erro ao atualizar agente:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar agente',
            error: error instanceof Error ? error.message : error
        });
    }
});


// Deletar agente
router.delete('/agentes/:id', verificarAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const response = await AgenteController.deletarAgente(parseInt(id));

        if (response.success) {
            res.status(200).json(response);
        } else {
            res.status(500).json({ error: response.message });
        }
    } catch (error) {
        console.error('Erro ao deletar agente:', error);
        res.status(500).json({ error: 'Erro ao deletar agente' });
    }
});

// Listar todos os chats
router.get('/chats', Authenticate, async (req: Request, res: Response) => {
    try {
        const response = await ChatController.listarChats();
        if (response.success) {
            res.status(200).json(response.data);
        } else {
            res.status(500).json({ error: response.message });
        }
    } catch (error) {
        console.error('Erro ao listar chats:', error);
        res.status(500).json({ error: 'Erro ao listar chats' });
    }
});

router.post('/mensagens', Authenticate, async (req: Request, res: Response) => {
    const { question, chat_id, usuario_id, agente_id } = req.body;

    try {
        let chatIdFinal = chat_id;

        if (chat_id) {
            const chatExiste = await ChatController.buscarChatPorId(chat_id);
            if (!chatExiste.success) {
                const chatCriado = await ChatController.criarChat(usuario_id, agente_id, chat_id, question);
                if (!chatCriado.success) {
                    res.status(500).json({ error: 'Falha ao criar chat' });
                    return;
                }
                chatIdFinal = chatCriado.insertedId;
            }
        } else {
            const chatCriado = await ChatController.criarChat(usuario_id, agente_id, null, question);
            if (!chatCriado.success) {
                res.status(500).json({ error: 'Falha ao criar chat' });
                return;
            }
            chatIdFinal = chatCriado.insertedId;
        }

        const msgUserAdd = await ChatController.adicionarMensagem(usuario_id, agente_id, chatIdFinal, question);

        if (!msgUserAdd.success) {
            res.status(500).json({ error: 'Falha ao adicionar mensagem do usuário' });
            return;
        }

        const response = await fetch('http://127.0.0.1:8000/chat/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, chat_id: chatIdFinal })
        });

        if (!response.ok) {
            res.status(500).json({ error: 'Erro no serviço externo de IA' });
            return;
        }

        const data = await response.json();

        const msgIAAdd = await ChatController.adicionarMensagem(usuario_id, agente_id, data.response, question);

        if (!msgIAAdd.success) {
            res.status(500).json({ error: 'Falha ao adicionar mensagem da IA' });
            return;
        }

        res.status(201).json({
            chatId: chatIdFinal,
            response: data.response
        });

    } catch (error) {
        console.error('Erro no processamento da mensagem:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});



// Buscar chat por ID
router.get('/chats/:chatId', Authenticate, async (req: Request, res: Response) => {
    const { chatId } = req.params;
    try {
        const response = await ChatController.buscarChatPorId(chatId);
        if (response.success) {
            res.status(200).json(response.data);
        } else {
            res.status(404).json({ error: response.message });
        }
    } catch (error) {
        console.error('Erro ao buscar chat:', error);
        res.status(500).json({ error: 'Erro ao buscar chat' });
    }
});

// Excluir chat
router.delete('/chats/:chatId', Authenticate, async (req: Request, res: Response) => {
    const { chatId } = req.params;
    try {
        const response = await ChatController.excluirChat(chatId);
        if (response.success) {
            res.status(200).json({ message: response.message });
        } else {
            res.status(404).json({ error: response.message });
        }
    } catch (error) {
        console.error('Erro ao excluir chat:', error);
        res.status(500).json({ error: 'Erro ao excluir chat' });
    }
});

export default router;
