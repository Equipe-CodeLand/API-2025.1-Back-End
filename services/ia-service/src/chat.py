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
def get_response_from_chatbot(question):
    return chatbot.get_response(question)

# Função para treinar o chatbot com a resposta fornecida
def treinar_com_resposta_corretiva(pergunta, resposta_correta):
    trainer = ListTrainer(chatbot)
    trainer.train([pergunta, resposta_correta])  # Treina o chatbot com a nova resposta

# Função para iniciar o chat
def start_chat():
    print("Olá! Eu sou o IAServiceBot. Como posso ajudá-lo hoje?")
    while True:
        try:
            user_input = input("Você: ")
            if user_input.lower() in ['sair', 'exit', 'tchau']:
                print("IAServiceBot: Até logo!")
                break

            # Obter a resposta do chatbot
            response = get_response_from_chatbot(user_input)
            print(f"IAServiceBot: {response}")

            # Perguntar ao usuário se a resposta está correta
            feedback = input("A resposta está correta? (sim/não): ").lower()

            if feedback == 'não':
                # Obter a resposta correta do usuário
                resposta_correta = input("Qual seria a resposta ideal? ")

                # Treinar o chatbot com a resposta correta
                treinar_com_resposta_corretiva(user_input, resposta_correta)
                print("IAServiceBot: Obrigado pela correção! Agora vou me atualizar com a nova resposta.")

        except (KeyboardInterrupt, EOFError, SystemExit):
            break

if __name__ == "__main__":
    start_chat()
