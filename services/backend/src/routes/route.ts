import { Router, Request, Response } from 'express';
import multer, { StorageEngine } from 'multer';
import AgenteController from '../controller/agenteController';
import { verificarAdmin } from '../middlewares/verificarAdmin';
import Autenticacao from '../controller/loginController';

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

const upload = multer({ storage });

// cadastro do agente
router.post('/cadastro/agente', verificarAdmin, upload.single('documento'), async (req: Request, res: Response) => {
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

export default router;
