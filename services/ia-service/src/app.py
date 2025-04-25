import json
from chatterbot import ChatBot
from chatterbot.trainers import ChatterBotCorpusTrainer, ListTrainer

# 1. Criar e configurar o chatbot
chatbot = ChatBot(
    'IAServiceBot',
    storage_adapter='chatterbot.storage.SQLStorageAdapter',
    logic_adapters=[
        'chatterbot.logic.BestMatch',
        'chatterbot.logic.MathematicalEvaluation',
    ],
    database_uri='sqlite:///database.db'  # Banco de dados SQLite para persistência
)

# 2. Treinamento com o corpus ChatterBot (dados padrões)
trainer = ChatterBotCorpusTrainer(chatbot)
trainer.train('chatterbot.corpus.english')

# 3. Função para carregar dados do JSON
def carregar_dados_json(caminho_arquivo):
    perguntas_respostas = []
    
    with open(caminho_arquivo, mode='r', encoding='utf-8') as file:
        dados = json.load(file)
        for item in dados:
            pergunta = item['pergunta']
            resposta = item['resposta']
            perguntas_respostas.append((pergunta, resposta))
    
    return perguntas_respostas

# 4. Função para preparar os dados para o treinamento
def preparar_dados_para_treinamento(dados):
    dados_treinamento = []
    for pergunta, resposta in dados:
        dados_treinamento.append(pergunta)
        dados_treinamento.append(resposta)
    return dados_treinamento

# 5. Treinar com os dados carregados do JSON
def treinar_com_dados_personalizados(chatbot, dados):
    trainer = ListTrainer(chatbot)
    dados_treinamento = preparar_dados_para_treinamento(dados)
    trainer.train(dados_treinamento)

# 6. Carregar e treinar com a base personalizada
dados_json = carregar_dados_json('./data/data1.json')  # Caminho do arquivo JSON
treinar_com_dados_personalizados(chatbot, dados_json)

# 7. Função para obter contexto baseado na pergunta (similar ao seu 'get_context')
def get_context(question):
    # ChatterBot irá buscar a resposta mais próxima para a pergunta
    response = chatbot.get_response(question)
    return response

# 8. Função para gerar a resposta
def generate_response(question):
    response = get_context(question)
    return str(response)

# 9. Teste a interação
query = "O que é um sistema ERP de gestão de frotas?"

# Gera a resposta para a pergunta
response = generate_response(query)
print(f"Resposta: {response}")
