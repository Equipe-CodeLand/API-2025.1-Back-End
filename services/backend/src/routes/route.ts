import { Router } from 'express';
import { db } from '../app/app'; // Importa a conexão com o MySQL

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

export default router;
