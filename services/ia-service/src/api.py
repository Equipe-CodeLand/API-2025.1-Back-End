from fastapi import FastAPI
from pydantic import BaseModel
from src.chatbot import get_response, train_chatbot


# Criar a API com FastAPI
app = FastAPI()

# Modelo de entrada para perguntas
class QuestionRequest(BaseModel):
    question: str

# Modelo de entrada para correção de respostas
class CorrectionRequest(BaseModel):
    question: str
    correct_answer: str

# Rota para obter a resposta do chatbot
@app.post("/chat/")
async def chat(request: QuestionRequest):
    response = get_response(request.question)
    return {"response": response}

# Rota para corrigir e treinar o chatbot com uma resposta correta
@app.post("/train/")
async def train(request: CorrectionRequest):
    message = train_chatbot(request.question, request.correct_answer)
    return {"message": message}

# Mensagem de boas-vindas na rota raiz
@app.get("/")
async def root():
    return {"message": "Bem-vindo ao IAServiceBot API!"}


