from chatterbot import ChatBot
from chatterbot.trainers import ListTrainer

# Criar e configurar o chatbot
chatbot = ChatBot(
    'IAServiceBot',
    storage_adapter='chatterbot.storage.SQLStorageAdapter',
    logic_adapters=[
        'chatterbot.logic.BestMatch',
        'chatterbot.logic.MathematicalEvaluation',
    ],
    database_uri='sqlite:///database.db'  # Banco de dados SQLite para persistência
)

# Função para obter resposta do chatbot
def get_response(question):
    return str(chatbot.get_response(question))

# Função para treinar o chatbot com uma resposta correta
def train_chatbot(question, correct_answer):
    trainer = ListTrainer(chatbot)
    trainer.train([question, correct_answer])
    return "Chatbot atualizado com a nova resposta!"
