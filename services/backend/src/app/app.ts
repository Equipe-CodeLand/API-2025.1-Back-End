import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import routes from '../routes/route'; 
import db from '../config/db'; // Importa a instância do banco de dados
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from '../swagger';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// 📌 Conexão com o Banco de Dados
db.connect((err) => {
    if (err) {
        console.error("❌ Erro ao conectar ao MySQL:", err);
    } else {
        console.log("✅ Conectado ao MySQL!");
    }
});

// 📌 Rotas
app.use(routes);

// 📌 Rota de Teste
app.get('/', (req, res) => {
    res.send('API funcionando!');
});

// 📌Rota Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
console.log(`📚 Swagger rodando em http://localhost:${PORT}/api-docs`)
// 📌 Iniciar Servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});