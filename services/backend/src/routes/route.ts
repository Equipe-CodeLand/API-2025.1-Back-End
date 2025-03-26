import { Router } from 'express';
import multer, { StorageEngine } from 'multer';
import { Request, Response } from 'express';
import { db } from '../app/app'; // Importa a conexão com o MySQL
import AgenteController from '../controller/agenteController';

const router = Router();

router.post('/login', (req, res) => {
    const { email, senha } = req.body;

    // Consulta ao MySQL
    db.query("SELECT * FROM users WHERE email = ? AND password = ?", [email, senha], (err, results: any) => {
        if (err) {
            console.error("Erro no MySQL:", err); // <-- Adicione isso para ver o erro
            return res.status(500).json({ error: "Erro ao consultar o banco de dados" });
        }

        if (Array.isArray(results) && results.length > 0) {
            res.status(200).json({ message: "Login bem-sucedido", user: results[0] });
        } else {
            res.status(401).json({ error: "Credenciais inválidas" });
        }
    });

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
router.post('/cadastro/agente', upload.single('documento'), async (req: Request, res: Response): Promise<void> => {
    const agente = req.body;

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
