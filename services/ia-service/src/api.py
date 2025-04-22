# from fastapi import FastAPI
# from pydantic import BaseModel
# from src.chatbot import get_response, train_chatbot


# # Criar a API com FastAPI
# app = FastAPI()

# # Modelo de entrada para perguntas
# class QuestionRequest(BaseModel):
#     question: str

# # Modelo de entrada para correção de respostas
# class CorrectionRequest(BaseModel):
#     question: str
#     correct_answer: str

# # Rota para obter a resposta do chatbot
# @app.post("/chat/")
# async def chat(request: QuestionRequest):
#     response = get_response(request.question)
#     return {"response": response}

# # Rota para corrigir e treinar o chatbot com uma resposta correta
# @app.post("/train/")
# async def train(request: CorrectionRequest):
#     message = train_chatbot(request.question, request.correct_answer)
#     return {"message": message}

# # Mensagem de boas-vindas na rota raiz
# @app.get("/")
# async def root():
#     return {"message": "Bem-vindo ao IAServiceBot API!"}



from fastapi import FastAPI
from pydantic import BaseModel
from src.chatbot import get_response, train_chatbot
from chatbot import responder_pergunta, treinar_chatbot  # Importa funções do chatbot treinado

# Criar a API com FastAPI
app = FastAPI()

# Modelo de entrada para perguntas
class QuestionRequest(BaseModel):
    question: str

# Modelo de entrada para correção e treinamento do chatbot
class CorrectionRequest(BaseModel):
    question: str
    correct_answer: str

# Rota para obter a resposta do chatbot
@app.post("/chat/")
async def chat(request: QuestionRequest):
    response = responder_pergunta(request.question)  # Chama a IA para responder
    return {"response": response}

# Rota para corrigir e treinar o chatbot com novas respostas
@app.post("/train/")
async def train(request: CorrectionRequest):
    treinar_chatbot(request.question, request.correct_answer)  # Treina o chatbot
    return {"message": f"O chatbot foi treinado com a nova resposta para: '{request.question}'"}

# Mensagem de boas-vindas na rota raiz
@app.get("/")
async def root():
    return {"message": "Bem-vindo ao IAServiceBot API!"}


