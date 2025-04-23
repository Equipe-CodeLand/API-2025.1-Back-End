import { Router, Request, Response } from 'express';
import multer, { StorageEngine } from 'multer';
import AgenteController from '../controller/agenteController';
import { verificarAdmin } from '../middlewares/verificarAdmin';
import Autenticacao from '../controller/loginController';
import PermissaoController from '../controller/permissaoController';
import UsuarioController from '../controller/usuarioController';

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

export default router;
