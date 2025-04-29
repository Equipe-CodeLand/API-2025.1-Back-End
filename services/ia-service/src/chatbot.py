from chatterbot import ChatBot
from chatterbot.trainers import ListTrainer
from src.appV2 import FAQClassifier, carregar_faq_json  # Assuma que seu código do FAQ está nesse módulo
import os

# Iniciar o FAQClassifier com a base de conhecimento
faq_data = carregar_faq_json("./data/data1.json")
faq_classifier = FAQClassifier(faq_data)

# Criar e configurar o ChatterBot
chatbot = ChatBot(
    "AssistenteEmpresarial",
    storage_adapter="chatterbot.storage.SQLStorageAdapter",
    database_uri="sqlite:///chatbot.sqlite3",
    logic_adapters=[]  # Desligamos os adapters internos para usar nossa lógica
)

# Função de resposta integrada
def get_response(question):
    resposta_faq = faq_classifier.get_answer(question)
    if "Não encontrei informações suficientes" in resposta_faq:
        return "Hmm, não sei exatamente, mas posso te ajudar a encontrar a resposta!"
    return resposta_faq

# Função para treinar chatbot com novas perguntas (útil para casos fora da base de dados)
def train_chatbot(question, correct_answer):
    trainer = ListTrainer(chatbot)
    trainer.train([question, correct_answer])
    return "Chatbot atualizado com a nova resposta!"

# Execução simples via terminal
if __name__ == "__main__":
    print("=== CHATBOT INTEGRADO COM FAQ ===")
    print("Digite sua pergunta ou 'sair' para encerrar")

    while True:
        pergunta = input("Você: ").strip()
        if pergunta.lower() == 'sair':
            print("Encerrando...")
            break
        resposta = get_response(pergunta)
        print("Assistente:", resposta)
