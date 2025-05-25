import mysql from 'mysql2';
import dotenv from 'dotenv';
import { Db, MongoClient, ServerApiVersion } from "mongodb";

const uri = "mongodb+srv://admin:admin@api.ynef8lp.mongodb.net/?retryWrites=true&w=majority&appName=API";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("API").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

export async function getDb(): Promise<Db> {
  await client.connect();
  const dbMongo = client.db("API");
  console.log("Conectado ao MongoDB");

  return dbMongo!;
}

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