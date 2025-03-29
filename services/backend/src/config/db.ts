import mysql from 'mysql2';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

// Configuração da conexão com o MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "root",
    database: process.env.DB_NAME || "api2025_1"
});

export default db;