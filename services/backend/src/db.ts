import mysql from "mysql2";

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

export default db;
