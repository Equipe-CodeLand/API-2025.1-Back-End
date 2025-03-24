import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from '../routes/route'; // Ajuste o caminho conforme necessário
import mysql from 'mysql2';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// 📌 Configuração do Banco de Dados MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "root",
    database: process.env.DB_NAME || "auth_db"
});

db.connect((err) => {
    if (err) {
        console.error("❌ Erro ao conectar ao MySQL:", err);
    } else {
        console.log("✅ Conectado ao MySQL!");
    }
});

// 📌 Rotas
app.use('/api', routes); // Prefixo opcional '/api'

// 📌 Rota de Teste
app.get('/', (req, res) => {
    res.send('API funcionando!');
});

// 📌 Iniciar Servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

export { db };
