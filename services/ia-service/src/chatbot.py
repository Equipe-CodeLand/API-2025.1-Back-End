from chatterbot import ChatBot
from chatterbot.trainers import ListTrainer

# Criar e configurar o chatbot
chatbot = ChatBot(
    "AssistenteEmpresarial",
    storage_adapter="chatterbot.storage.SQLStorageAdapter",
    database_uri="sqlite:///chatbot.sqlite3",
    logic_adapters=[
        {
            "import_path": "chatterbot.logic.BestMatch",
            "default_response": "Hmm, não sei exatamente, mas posso te ajudar a encontrar a resposta!",
            "maximum_similarity_threshold": 0.75
        }
    ]
)

# Função para obter resposta do chatbot
def get_response(question):
    return str(chatbot.get_response(question))

# Função para treinar o chatbot com uma resposta correta
def train_chatbot(question, correct_answer):
    trainer = ListTrainer(chatbot)
    trainer.train([question, correct_answer])
    return "Chatbot atualizado com a nova resposta!"
