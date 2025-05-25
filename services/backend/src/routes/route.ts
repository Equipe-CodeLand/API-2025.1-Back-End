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

/**
 * @swagger
 * tags:
 *   - name: Autenticação
 *   - name: Usuários
 *   - name: Agentes
 *   - name: Permissões
 *   - name: Chats
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Realiza o login de um usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
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


/**
 * @swagger
 * /cadastro/usuario:
 *   post:
 *     summary: Cadastra um novo usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso
 *       500:
 *         description: Erro ao cadastrar usuário
 */
// cadastro do usuário
router.post('/cadastro/usuario', async (req: Request, res: Response) => {
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
/**
 * @swagger
 * /usuarios/{id}/status:
 *   put:
 *     summary: Ativa ou desativa um usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ativo
 *             properties:
 *               ativo:
 *                 type: boolean
 *                 description: Define se o usuário deve estar ativo (true) ou inativo (false)
 *     responses:
 *       200:
 *         description: Status do usuário atualizado com sucesso
 *       403:
 *         description: O usuário não pode se auto-inativar
 *       500:
 *         description: Erro ao atualizar status do usuário
 */
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
/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: Lista de usuários
 *       500:
 *         description: Erro ao buscar usuários
 */
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
/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Lista um usuário por ID
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalhes do usuário
 *       404:
 *         description: Usuário não encontrado
 */
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

/**
 * @swagger
 * /atualizar/usuarios/{id}:
 *   put:
 *     summary: Atualiza os dados de um usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       500:
 *         description: Erro ao atualizar usuário
 */
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

/**
 * @swagger
 * /usuarios/buscar/agentes:
 *   get:
 *     summary: Lista agentes vinculados ao usuário logado
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de agentes vinculados
 *       500:
 *         description: Erro ao buscar agentes
 */
router.get("/usuarios/buscar/agentes", Authenticate, async (req: Request, res: Response) => {
    const usuarioLogadoId = (req as any).usuarioLogadoId;

    try {
        const response = await UsuarioController.listarAgentesPorUsuario(Number(usuarioLogadoId));

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
/**
 * @swagger
 * /cadastro/agente:
 *   post:
 *     summary: Cadastra um novo agente
 *     tags: [Agente]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               setor:
 *                 type: string
 *               assunto:
 *                 type: string
 *               documento:
 *                 type: string
 *     responses:
 *       201:
 *         description: Agente cadastrado com sucesso
 *       500:
 *         description: Erro ao cadastrar agente
 */
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
/**
 * @swagger
 * /agentes:
 *   get:
 *     summary: Lista todos os agentes
 *     tags: [Agentes]
 *     responses:
 *       200:
 *         description: Lista de agentes
 *       500:
 *         description: Erro ao buscar agentes
 */
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
/**
 * @swagger
 * /agentes/{id}/usuarios:
 *   get:
 *     summary: Lista os usuários vinculados a um agente
 *     tags: [Agentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do agente
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Erro ao buscar usuários por agente
 */
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
/**
 * @swagger
 * /agentes/{usuarioId}/desabilitar:
 *   put:
 *     summary: Desabilita a permissão de agente para um usuário
 *     tags: [Permissões]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Permissão desabilitada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Erro ao desabilitar permissão
 */
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
/**
 * @swagger
 * /agentes/{usuarioId}/habilitar:
 *   put:
 *     summary: Habilita a permissão de agente para um usuário
 *     tags: [Permissões]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Permissão habilitada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Erro ao habilitar permissão
 */
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
/**
 * @swagger
 * /agentes/{id}:
 *   put:
 *     summary: Atualiza os dados de um agente
 *     tags: [Agentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Agentes atualizado com sucesso
 *       500:
 *         description: Erro ao atualizar agentes
 */
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
/**
 * @swagger
 * /agentes/{id}:
 *   delete:
 *     summary: Deleta um agente
 *     tags: [Agentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do agente a ser deletado
 *     responses:
 *       200:
 *         description: Agente deletado com sucesso
 *       500:
 *         description: Erro ao deletar agente
 */
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
/**
 * @swagger
 * /chats:
 *   get:
 *     summary: Lista todos os chats
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de chats retornada com sucesso
 *       500:
 *         description: Erro ao listar chats
 */
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

/**
 * @swagger
 * /mensagens:
 *   post:
 *     summary: Envia uma nova mensagem (cria o chat se necessário)
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - agente_id
 *             properties:
 *               question:
 *                 type: string
 *               chat_id:
 *                 type: string
 *                 nullable: true
 *               agente_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Mensagem enviada com sucesso
 *       500:
 *         description: Erro interno no servidor
 */
router.post('/mensagens', Authenticate, async (req: Request, res: Response) => {
    const { question, chat_id, agente_id } = req.body;
    const usuario_id = (req as any).usuarioLogadoId;

    console.log('recebi a msg',question, chat_id, usuario_id, agente_id )

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

        const msgUserAdd = await ChatController.adicionarMensagem(usuario_id, null, chatIdFinal, question);
        console.log('mandei pro mongo')

        if (!msgUserAdd.success) {
            res.status(500).json({ error: 'Falha ao adicionar mensagem do usuário' });
            return;
        }

        const response = await fetch('http://192.168.1.25:8000/chat/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, chat_id: chatIdFinal })
        });

        if (!response.ok) {
            res.status(500).json({ error: 'Erro no serviço externo de IA' });
            return;
        }

        const data = await response.json();
        console.log('resposta da IA:', data);

        const msgIAAdd = await ChatController.adicionarMensagem(
            usuario_id,
            agente_id,
            chatIdFinal,
            data.response
        );          

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
/**
 * @swagger
 * /chats/{chatId}:
 *   get:
 *     summary: Busca um chat pelo ID
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do chat
 *     responses:
 *       200:
 *         description: Chat encontrado
 *       404:
 *         description: Chat não encontrado
 *       500:
 *         description: Erro ao buscar chat
 */
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

/**
 * @swagger
 * /historico/chat:
 *   get:
 *     summary: Busca o histórico de chats de um usuário ou as mensagens de um chat específico
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: usuario_id
 *         schema:
 *           type: integer
 *         description: ID do usuário para listar todos os seus chats
 *       - in: query
 *         name: chat_id
 *         schema:
 *           type: string
 *         description: ID do chat para listar todas as mensagens do chat
 *     responses:
 *       200:
 *         description: Histórico retornado com sucesso
 *       400:
 *         description: Parâmetros inválidos ou ausentes
 *       500:
 *         description: Erro ao buscar histórico
 */
router.get('/historico/chat', Authenticate, async (req: Request, res: Response) => {
    const { usuario_id, chat_id } = req.query;

    if (!usuario_id && !chat_id) {
        res.status(400).json({ error: "Informe 'usuario_id' ou 'chat_id' para buscar o histórico." });
        return;
    }

    try {
        const response = await ChatController.buscarHistorico({
            usuario_id: usuario_id ? Number(usuario_id) : undefined,
            chat_id: chat_id?.toString()
        });

        if (response.success) {
            res.status(200).json(response.data);
        } else {
            res.status(404).json({ error: response.message });
        }
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
});

// Excluir chat
/**
 * @swagger
 * /chats/{chatId}:
 *   delete:
 *     summary: Exclui um chat pelo ID
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do chat
 *     responses:
 *       200:
 *         description: Chat excluído com sucesso
 *       404:
 *         description: Chat não encontrado
 *       500:
 *         description: Erro ao excluir chat
 */
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
