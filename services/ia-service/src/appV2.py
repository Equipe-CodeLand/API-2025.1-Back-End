# import os
# import json
# import mysql.connector
# import random
# import numpy as np
# import pandas as pd
# from sklearn.neighbors import NearestNeighbors
# from sklearn.cluster import KMeans
# from sklearn.tree import DecisionTreeClassifier, export_text
# from sklearn.linear_model import LogisticRegression
# from sklearn.metrics import accuracy_score, classification_report
# from sklearn.preprocessing import LabelEncoder
# from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn.naive_bayes import MultinomialNB
# from sklearn.pipeline import Pipeline
# from sklearn.model_selection import train_test_split
# from sklearn.svm import SVC
# from sklearn.metrics.pairwise import cosine_similarity
# import spacy
# from chatterbot import ChatBot
# from chatterbot.trainers import ListTrainer
# from chatterbot.response_selection import get_most_frequent_response
# from datetime import datetime, timedelta

# # ====================
# # 1. CONFIGURAÇÃO INICIAL
# # ====================
# print("=== INICIALIZANDO SISTEMA ===")
# print("Carregando módulos e configurando ambiente...")

# # Carregar modelo de linguagem para pré-processamento
# print("Carregando modelo de linguagem...")
# try:
#     nlp = spacy.load('pt_core_news_sm')
# except:
#     print("Erro ao carregar modelo de linguagem spaCy. Instale com: python -m spacy download pt_core_news_sm")
#     nlp = None

# # Configuração do ChatBot
# print("\n[1/4] Configurando chatbot...")
# chatbot = ChatBot(
#     "AssistenteEmpresarialAvancado",
#     storage_adapter="chatterbot.storage.SQLStorageAdapter",
#     database_uri="sqlite:///chatbot_avancado.sqlite3",
#     logic_adapters=[
#         {
#             "import_path": "chatterbot.logic.BestMatch",
#             "default_response": "Não tenho certeza, mas posso te ajudar a encontrar a resposta!",
#             "maximum_similarity_threshold": 0.9,
#             "response_selection_method": get_most_frequent_response,
#             "excluded_words": ["e", "pi", "log"]
#         },
#         {
#             "import_path": "chatterbot.logic.MathematicalEvaluation"
#         },
#         {
#             "import_path": "chatterbot.logic.TimeLogicAdapter"
#         }
#     ],
#     preprocessors=[
#         'chatterbot.preprocessors.clean_whitespace',
#         'chatterbot.preprocessors.convert_to_ascii'
#     ],
#     filters=["chatterbot.filters.get_recent_repeated_responses"]
# )

# # ====================
# # 2. CARREGAMENTO DE DADOS E CLASSIFICADOR FAQ
# # ====================
# print("\n[2/4] Carregando dados de treinamento e configurando classificador...")

# class FAQClassifier:
#     def __init__(self):
#         self.nlp = nlp
#         self.df = None
#         self.classifier = None
#         self.tfidf_vectorizer = None
#         self.tfidf_matrix = None
    
#     def preprocess_text(self, text):
#         if not self.nlp:
#             return text.lower()
#         doc = self.nlp(text.lower())
#         tokens = [token.lemma_ for token in doc if not token.is_stop and not token.is_punct and token.is_alpha]
#         return ' '.join(tokens)
    
#     def load_data(self, data):
#         self.df = pd.DataFrame(data)
#         self.df['pergunta_processed'] = self.df['pergunta'].apply(self.preprocess_text)
#         self.df['resposta_processed'] = self.df['resposta'].apply(self.preprocess_text)
        
#         # Treinar classificador
#         X = self.df['pergunta_processed']
#         y = self.df['topico']
#         self.classifier = Pipeline([
#             ('tfidf', TfidfVectorizer()),
#             ('clf', SVC(kernel='linear', probability=True))
#         ])
#         self.classifier.fit(X, y)
        
#         # Treinar modelo de similaridade
#         self.tfidf_vectorizer = TfidfVectorizer().fit(self.df['pergunta_processed'])
#         self.tfidf_matrix = self.tfidf_vectorizer.transform(self.df['pergunta_processed'])
    
#     def classify_question(self, question):
#         processed = self.preprocess_text(question)
#         topic = self.classifier.predict([processed])[0]
#         proba = np.max(self.classifier.predict_proba([processed]))
#         return topic, proba
    
#     def find_similar_questions(self, question, n=3):
#         processed = self.preprocess_text(question)
#         input_vec = self.tfidf_vectorizer.transform([processed])
#         similarities = cosine_similarity(input_vec, self.tfidf_matrix)
#         top_indices = similarities.argsort()[0][-n:][::-1]
#         return self.df.iloc[top_indices]
    
#     def get_answer(self, question, threshold=0.5):
#         topic, confidence = self.classify_question(question)
#         if confidence < threshold:
#             return None
        
#         similar = self.find_similar_questions(question, n=1).iloc[0]
#         similarity = cosine_similarity(
#             self.tfidf_vectorizer.transform([self.preprocess_text(question)]),
#             self.tfidf_vectorizer.transform([similar['pergunta_processed']])
#         )[0][0]
        
#         if similarity > 0.7:
#             return similar['resposta']
#         else:
#             return f"Sobre {topic}: {similar['resposta']}"

# def carregar_faq_json(arquivo):
#     """Carrega perguntas e respostas do arquivo JSON"""
#     try:
#         with open(arquivo, "r", encoding="utf-8") as file:
#             faq_data = json.load(file)
#         return faq_data
#     except Exception as e:
#         print(f"Erro ao carregar FAQ: {str(e)}")
#         return []

# # Carregar dados e treinar classificador
# faq_data = carregar_faq_json("./data/data1.json")
# faq_classifier = FAQClassifier()
# if faq_data:
#     print(f"Encontradas {len(faq_data)} perguntas no FAQ")
#     faq_classifier.load_data(faq_data)
#     print("Classificador de FAQ treinado com sucesso!")
# else:
#     print("Nenhum dado de FAQ encontrado.")

# # Treinamento do chatbot
# try:
#     if faq_data:
#         dados_faq = [(item["pergunta"], item["resposta"]) for item in faq_data]
#         trainer = ListTrainer(chatbot)
#         trainer.train([item for sublist in dados_faq for item in sublist])
#         print("Chatbot treinado com sucesso!")
#     else:
#         print("Nenhum dado de FAQ encontrado para treinar o chatbot.")
# except Exception as e:
#     print(f"Erro durante o treinamento do chatbot: {str(e)}")

# # ====================
# # 3. ANÁLISE DE DADOS
# # ====================
# print("\n[3/4] Configurando módulo de análise de dados...")

# class AnalisadorDadosEmpresa:
#     """Classe responsável por todas as análises de dados e modelos de ML"""
    
#     def __init__(self):
#         self.le = LabelEncoder()
#         self.carregar_dados()
#         self.treinar_modelos()
    
#     def carregar_dados(self):
#         """Carrega dados do MySQL ou cria dados de exemplo"""
#         try:
#             print("Conectando ao banco de dados MySQL...")
#             self.conn = mysql.connector.connect(
#                 host="localhost",
#                 user="root",
#                 password="root",
#                 database="empresa"
#             )
#             print("Conexão bem-sucedida! Carregando dados...")
#             query = "SELECT nome, cargo, salario, data_contratacao FROM funcionarios"
#             self.df_funcionarios = pd.read_sql(query, self.conn)
#         except Exception as e:
#             print(f"Falha ao conectar ao MySQL: {str(e)}")
#             print("Criando dados de exemplo...")
#             self.criar_dados_exemplo()
        
#         # Processamento dos dados
#         hoje = datetime.now()
#         self.df_funcionarios['dias_empresa'] = (hoje - pd.to_datetime(
#             self.df_funcionarios['data_contratacao'])).dt.days
#         self.df_funcionarios['cargo_encoded'] = self.le.fit_transform(
#             self.df_funcionarios['cargo'])
#         print(f"Dados carregados. Total: {len(self.df_funcionarios)} registros")
    
#     def criar_dados_exemplo(self):
#         """Gera dados fictícios para demonstração"""
#         dados = {
#             'nome': ['Ana Souza', 'Carlos Lima', 'Mariana Oliveira', 'João Silva', 'Fernanda Costa'],
#             'cargo': ['Desenvolvedor', 'Analista', 'Gerente', 'Desenvolvedor', 'Analista'],
#             'salario': [7500, 6500, 12000, 8000, 7000],
#             'data_contratacao': ['2020-01-15', '2021-03-10', '2018-11-20', '2019-05-05', '2020-08-30']
#         }
#         self.df_funcionarios = pd.DataFrame(dados)
    
#     def treinar_modelos(self):
#         """Treina todos os modelos de machine learning"""
#         print("\nTreinando modelos de ML...")
        
#         # 1. Modelo de Clusterização (K-Means)
#         print("\n1. Clusterização (K-Means):")
#         X_kmeans = self.df_funcionarios[['salario', 'dias_empresa']]
#         self.kmeans = KMeans(n_clusters=3, random_state=42)
#         self.kmeans.fit(X_kmeans)
#         self.df_funcionarios['cluster'] = self.kmeans.labels_
#         print(f"Clusters criados: {self.kmeans.n_clusters}")
#         print(f"Centróides:\n{self.kmeans.cluster_centers_}")
        
#         # 2. Modelo de Classificação de Cargos (Árvore de Decisão)
#         print("\n2. Classificação de Cargos (Árvore de Decisão):")
#         X_cargo = self.df_funcionarios[['salario', 'dias_empresa']]
#         y_cargo = self.df_funcionarios['cargo_encoded']
#         self.modelo_cargo = DecisionTreeClassifier(max_depth=3, random_state=42)
#         self.modelo_cargo.fit(X_cargo, y_cargo)
        
#         # Mostrar estrutura da árvore
#         print("\nEstrutura da Árvore de Decisão:")
#         tree_rules = export_text(
#             self.modelo_cargo,
#             feature_names=['salario', 'dias_empresa'],
#             class_names=list(self.le.classes_)
#         )
#         print(tree_rules)
        
#         # 3. Modelo de Risco de Turnover (Regressão Logística)
#         print("\n3. Risco de Turnover (Regressão Logística):")
#         media_salario = self.df_funcionarios['salario'].mean()
#         self.df_funcionarios['risco_turnover'] = np.where(
#             (self.df_funcionarios['salario'] < media_salario) & 
#             (self.df_funcionarios['dias_empresa'] > 365*2), 1, 0)
        
#         X_risco = self.df_funcionarios[['salario', 'dias_empresa']]
#         y_risco = self.df_funcionarios['risco_turnover']
#         self.modelo_risco = LogisticRegression()
#         self.modelo_risco.fit(X_risco, y_risco)
        
#         # Avaliar modelos
#         self.avaliar_modelos()
    
#     def avaliar_modelos(self):
#         """Avalia e exibe métricas dos modelos"""
#         print("\n=== AVALIAÇÃO DOS MODELOS ===")
        
#         # Dados para avaliação
#         X = self.df_funcionarios[['salario', 'dias_empresa']]
        
#         # Avaliar modelo de cargos
#         y_cargo = self.df_funcionarios['cargo_encoded']
#         y_pred_cargo = self.modelo_cargo.predict(X)
        
#         print("\nRelatório de Classificação - Cargos:")
#         print(classification_report(
#             y_cargo, y_pred_cargo, 
#             target_names=self.le.classes_,
#             zero_division=0
#         ))
        
#         # Avaliar modelo de turnover
#         y_risco = self.df_funcionarios['risco_turnover']
#         y_pred_risco = self.modelo_risco.predict(X)
        
#         print("\nRelatório de Classificação - Turnover:")
#         print(classification_report(
#             y_risco, y_pred_risco,
#             target_names=['Baixo Risco', 'Alto Risco'],
#             zero_division=0
#         ))
        
#         # Exemplo de previsões
#         print("\nExemplos de Previsões:")
#         sample = self.df_funcionarios.sample(2)
#         for _, row in sample.iterrows():
#             # Prever cargo
#             cargo_pred = self.le.inverse_transform(
#                 self.modelo_cargo.predict([[row['salario'], row['dias_empresa']]])
#             )[0]
            
#             # Prever risco
#             risco_proba = self.modelo_risco.predict_proba(
#                 [[row['salario'], row['dias_empresa']]]
#             )[0][1]
            
#             print(f"\nFuncionário: {row['nome']}")
#             print(f"  Cargo real: {row['cargo']} | Predito: {cargo_pred}")
#             print(f"  Risco de turnover: {risco_proba:.1%}")
    
#     # Métodos auxiliares para interação
#     def prever_cargo(self, salario, dias_empresa):
#         """Prediz o cargo com base em salário e tempo de empresa"""
#         cargo_code = self.modelo_cargo.predict([[salario, dias_empresa]])[0]
#         return self.le.inverse_transform([cargo_code])[0]
    
#     def prever_risco(self, salario, dias_empresa):
#         """Prediz o risco de turnover"""
#         proba = self.modelo_risco.predict_proba([[salario, dias_empresa]])[0][1]
#         return proba, "Alto Risco" if proba > 0.5 else "Baixo Risco"

# # Inicializar o analisador
# analisador = AnalisadorDadosEmpresa()


# # ====================
# # 4. INTERFACE PRINCIPAL
# # ====================
# print("\n[4/4] Configurando interface de interação...")

# def gerar_dados_sinteticos(n=5):
#     """Gera dados fictícios para testes"""
#     cargos = analisador.le.classes_.tolist()
#     dados = []
#     for i in range(n):
#         cargo = random.choice(cargos)
#         salario = random.randint(5000, 15000)
#         dias = random.randint(30, 365*5)
#         data = (datetime.now() - timedelta(days=dias)).strftime('%Y-%m-%d')
#         dados.append({
#             'nome': f'Funcionario Teste {i+1}',
#             'cargo': cargo,
#             'salario': salario,
#             'data_contratacao': data
#         })
#     return pd.DataFrame(dados)

# def responder_pergunta(pergunta):
#     """Processa a pergunta e retorna uma resposta"""
#     pergunta_lower = pergunta.lower()
    
#     # 1. Tentar responder com o classificador FAQ primeiro (com threshold mais baixo)
#     resposta_faq = faq_classifier.get_answer(pergunta)
#     if resposta_faq and "Não tenho certeza" not in resposta_faq:
#         return resposta_faq
    
#     # 2. Análise de salários
#     if any(palavra in pergunta_lower for palavra in ['salário', 'salario', 'remuneração']):
#         stats = analisador.df_funcionarios['salario'].describe()
#         return (
#             "Estatísticas salariais:\n"
#             f"Média: R${stats['mean']:.2f}\n"
#             f"Mediana: R${stats['50%']:.2f}\n"
#             f"Intervalo: R${stats['min']:.2f} - R${stats['max']:.2f}"
#         )
    
#     # 3. Previsão de cargo
#     elif 'prever cargo' in pergunta_lower:
#         try:
#             salario = float(next(s for s in pergunta.split() if s.replace('.','').isdigit()))
#             dias = int(next(d for d in pergunta.split() if d.isdigit()))
#             cargo = analisador.prever_cargo(salario, dias)
#             return f"Para R${salario:.2f} e {dias} dias, cargo previsto: {cargo}"
#         except:
#             return "Não entendi. Formato: 'prever cargo para 5000 365'"
    
#     # 4. Risco de turnover
#     elif 'risco' in pergunta_lower:
#         try:
#             nome = next(n for n in analisador.df_funcionarios['nome'] if n.split()[0].lower() in pergunta_lower)
#             dados = analisador.df_funcionarios[analisador.df_funcionarios['nome'] == nome].iloc[0]
#             proba, risco = analisador.prever_risco(dados['salario'], dados['dias_empresa'])
#             return f"{nome} tem {risco} ({proba:.1%} de probabilidade)"
#         except:
#             return "Funcionário não encontrado ou dados insuficientes"
    
#     # 5. Dados sintéticos
#     elif 'dados sintéticos' in pergunta_lower:
#         n = int(next((s for s in pergunta.split() if s.isdigit()), 3))
#         df = gerar_dados_sinteticos(n)
#         return "Dados sintéticos gerados:\n" + df.to_string(index=False)
    
#     # 6. Resposta padrão do chatbot (desativar adaptadores matemáticos temporariamente)
#     resposta = chatbot.get_response(pergunta, additional_response_selection_parameters={
#         'exclude': 'MathematicalEvaluation'
#     })
#     return str(resposta)

# # ====================
# # EXECUÇÃO PRINCIPAL
# # ====================
# print("\n=== SISTEMA PRONTO ===")
# print("Comandos disponíveis:")
# print("- Salários: 'mostre análise salarial'")
# print("- Previsão: 'prever cargo para 5000 365'")
# print("- Risco: 'qual risco da Ana'")
# print("- Dados: 'gere 3 dados sintéticos'")
# print("- Sair: 'sair'")

# while True:
#     try:
#         pergunta = input("\nVocê: ").strip()
#         if not pergunta:
#             continue
            
#         if pergunta.lower() == 'sair':
#             print("Encerrando o sistema...")
#             break
            
#         resposta = responder_pergunta(pergunta)
#         print("\nAssistente:", resposta)
        
#     except (KeyboardInterrupt, EOFError):
#         print("\nSistema interrompido pelo usuário")
#         break
#     except Exception as e:
#         print(f"\nErro: {str(e)}")



import os
import json
import mysql.connector
import random
import numpy as np
import pandas as pd
from sklearn.neighbors import NearestNeighbors
from sklearn.cluster import KMeans
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.metrics.pairwise import cosine_similarity
import spacy
from chatterbot import ChatBot
from chatterbot.trainers import ListTrainer
from chatterbot.response_selection import get_most_frequent_response
from datetime import datetime, timedelta
from sentence_transformers import SentenceTransformer
from collections import defaultdict

# ====================
# 1. CONFIGURAÇÃO INICIAL
# ====================
print("=== INICIALIZANDO SISTEMA ===")
print("Carregando módulos e configurando ambiente...")

# Carregar modelos de linguagem
print("Carregando modelos de linguagem...")
try:
    nlp = spacy.load('pt_core_news_sm')
    encoder = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
except Exception as e:
    print(f"Erro ao carregar modelos: {str(e)}")
    nlp = None
    encoder = None

# Configuração do ChatBot
print("\n[1/4] Configurando chatbot...")
chatbot = ChatBot(
    "AssistenteEmpresarialAvancado",
    storage_adapter="chatterbot.storage.SQLStorageAdapter",
    database_uri="sqlite:///chatbot_avancado.sqlite3",
    logic_adapters=[
        {
            "import_path": "chatterbot.logic.BestMatch",
            "default_response": "Não tenho certeza, mas posso te ajudar a encontrar a resposta!",
            "maximum_similarity_threshold": 0.85,  # Reduzido para melhorar cobertura
            "response_selection_method": get_most_frequent_response,
        },
        {
            "import_path": "chatterbot.logic.MathematicalEvaluation"
        }
    ],
    preprocessors=[
        'chatterbot.preprocessors.clean_whitespace',
        'chatterbot.preprocessors.convert_to_ascii'
    ]
)

# ====================
# 2. CARREGAMENTO DE DADOS E CLASSIFICADOR FAQ
# ====================
print("\n[2/4] Carregando dados de treinamento e configurando classificador...")

class FAQClassifier:
    def __init__(self):
        self.nlp = nlp
        self.encoder = encoder
        self.df = None
        self.classifiers = {}  # Dicionário para múltiplos classificadores
        self.embeddings = None
        self.topico_encoder = LabelEncoder()
        self.subtopico_encoders = defaultdict(LabelEncoder)
        
    def preprocess_text(self, text):
        """Pré-processamento avançado com lematização"""
        if not self.nlp:
            return text.lower()
        doc = self.nlp(text.lower())
        tokens = [token.lemma_ for token in doc if not token.is_stop and not token.is_punct and token.is_alpha]
        return ' '.join(tokens)
    
    def load_data(self, data):
        """Carrega e prepara os dados do FAQ"""
        self.df = pd.DataFrame(data)
        
        # Pré-processamento
        self.df['pergunta_processed'] = self.df['pergunta'].apply(self.preprocess_text)
        self.df['resposta_processed'] = self.df['resposta'].apply(self.preprocess_text)
        
        # Codificação de tópicos e subtópicos
        self.df['topico_encoded'] = self.topico_encoder.fit_transform(self.df['topico'])
        
        for topico in self.df['topico'].unique():
            subset = self.df[self.df['topico'] == topico]
            self.subtopico_encoders[topico].fit(subset['subtopicos'].explode().unique())
        
        # Gerar embeddings
        print("Gerando embeddings das perguntas...")
        self.embeddings = self.encoder.encode(self.df['pergunta'].tolist())
        
        # Treinar classificadores
        self.train_classifiers()
        
    def train_classifiers(self):
        """Treina modelos hierárquicos"""
        print("Treinando classificadores...")
        
        # 1. Classificador de tópico principal
        X = self.embeddings
        y = self.df['topico_encoded']
        
        self.classifiers['topico'] = Pipeline([
            ('clf', SVC(kernel='rbf', probability=True))
        ])
        self.classifiers['topico'].fit(X, y)
        
        # 2. Classificadores de subtópico por tópico
        for topico in self.df['topico'].unique():
            subset = self.df[self.df['topico'] == topico]
            if len(subset) < 10:
                continue
            
            # Filtrar apenas o primeiro subtópico de cada registro
            subtopicos_simples = subset['subtopicos'].apply(lambda x: x[0] if isinstance(x, list) and len(x) > 0 else "geral")
            
            # Verifica se há variedade suficiente
            unique_subtopics = subtopicos_simples.unique()
            if len(unique_subtopics) < 2:
                print(f"Tópico '{topico}' tem apenas 1 subtópico. Pulando treinamento de subtópico.")
                continue
            
            X_sub = self.embeddings[subset.index]
            y_sub = self.subtopico_encoders[topico].transform(subtopicos_simples)
            
            self.classifiers[f'subtopico_{topico}'] = Pipeline([
                ('clf', SVC(kernel='linear', probability=True))
            ])
            self.classifiers[f'subtopico_{topico}'].fit(X_sub, y_sub)

        # 3. Classificador de dificuldade
        if 'dificuldade' in self.df.columns and len(self.df['dificuldade'].unique()) > 1:
            self.df['dificuldade_encoded'] = LabelEncoder().fit_transform(self.df['dificuldade'])
            self.classifiers['dificuldade'] = Pipeline([
                ('clf', LogisticRegression())
            ])
            self.classifiers['dificuldade'].fit(X, self.df['dificuldade_encoded'])

    def classify_question(self, question):
        """Classificação hierárquica da pergunta"""
        # Pré-processamento
        processed = self.preprocess_text(question)
        embedding = self.encoder.encode([processed])
        
        # 1. Classificar tópico principal
        topico_idx = self.classifiers['topico'].predict(embedding)[0]
        topico = self.topico_encoder.inverse_transform([topico_idx])[0]
        topico_conf = np.max(self.classifiers['topico'].predict_proba(embedding))
        
        # 2. Classificar subtópico
        subtopico = None
        subtopico_conf = 0
        if f'subtopico_{topico}' in self.classifiers:
            subtopico_idx = self.classifiers[f'subtopico_{topico}'].predict(embedding)[0]
            subtopico = self.subtopico_encoders[topico].inverse_transform([subtopico_idx])[0]
            subtopico_conf = np.max(self.classifiers[f'subtopico_{topico}'].predict_proba(embedding))
        
        # 3. Classificar dificuldade
        dificuldade = None
        if 'dificuldade' in self.classifiers:
            dificuldade_idx = self.classifiers['dificuldade'].predict(embedding)[0]
            dificuldade = self.df['dificuldade'].unique()[dificuldade_idx]
        
        return {
            'topico': topico,
            'topico_confianca': float(topico_conf),
            'subtopico': subtopico,
            'subtopico_confianca': float(subtopico_conf),
            'dificuldade': dificuldade
        }
    
    def find_similar_questions(self, question, n=3, threshold=0.7):
        """Busca semântica por perguntas similares"""
        embedding = self.encoder.encode([question])
        similarities = cosine_similarity(embedding, self.embeddings)[0]
        
        # Filtrar por threshold e pegar os top N
        top_indices = np.where(similarities >= threshold)[0]
        if len(top_indices) == 0:
            return pd.DataFrame()
            
        top_indices = top_indices[np.argsort(similarities[top_indices])[-n:][::-1]]
        return self.df.iloc[top_indices].copy().assign(similarity=similarities[top_indices])
    
    def get_answer(self, question, min_confidence=0.6):
        """Obtém resposta com base na classificação e similaridade"""
        # Classificação
        classification = self.classify_question(question)
        
        # Busca semântica
        similar = self.find_similar_questions(question, n=1, threshold=0.6)
        
        if similar.empty:
            return None
            
        best_match = similar.iloc[0]
        
        # Montar resposta contextual
        resposta = f"**{classification['topico']}**"
        if classification['subtopico']:
            resposta += f" ({classification['subtopico']})"
        
        resposta += f": {best_match['resposta']}"
        
        if 'exemplo_pratico' in best_match and pd.notna(best_match['exemplo_pratico']):
            resposta += f"\n\nExemplo: {best_match['exemplo_pratico']}"
        
        if 'estatisticas' in best_match and pd.notna(best_match['estatisticas']):
            resposta += f"\n\nDados: {best_match['estatisticas']}"
        
        return resposta

def carregar_faq_json(arquivo):
    """Carrega e valida o FAQ"""
    try:
        with open(arquivo, "r", encoding="utf-8") as file:
            faq_data = json.load(file)
        
        # Validação básica
        required_fields = ['id', 'topico', 'pergunta', 'resposta']
        for item in faq_data:
            if not all(field in item for field in required_fields):
                print(f"Item inválido no FAQ: {item.get('id', 'sem ID')}")
                return []
        
        print(f"FAQ carregado com {len(faq_data)} perguntas")
        return faq_data
    except Exception as e:
        print(f"Erro ao carregar FAQ: {str(e)}")
        return []

# Carregar dados e treinar classificador
faq_data = carregar_faq_json("./data/data1.json")
faq_classifier = FAQClassifier()
if faq_data:
    faq_classifier.load_data(faq_data)
    print("Classificador treinado com sucesso!")
    
    # Exemplo de classificação
    teste = "Como melhorar a integração de novos funcionários?"
    print("\nExemplo de classificação:")
    print(f"Pergunta: {teste}")
    print("Classificação:", faq_classifier.classify_question(teste))
    print("Resposta:", faq_classifier.get_answer(teste))
else:
    print("Nenhum dado de FAQ encontrado.")

# Treinamento do chatbot
try:
    if faq_data:
        # Treinar com perguntas e variantes
        training_data = []
        for item in faq_data:
            training_data.append(item['pergunta'])
            if 'pergunta_variantes' in item:
                training_data.extend(item['pergunta_variantes'])
            training_data.append(item['resposta'])
        
        trainer = ListTrainer(chatbot)
        trainer.train(training_data)
        print("Chatbot treinado com sucesso!")
    else:
        print("Nenhum dado de FAQ encontrado para treinar o chatbot.")
except Exception as e:
    print(f"Erro durante o treinamento do chatbot: {str(e)}")
#====================
# 3. ANÁLISE DE DADOS
# ====================
print("\n[3/4] Configurando módulo de análise de dados...")

class AnalisadorDadosEmpresa:
    """Classe responsável por todas as análises de dados e modelos de ML"""
    
    def __init__(self):
        self.le = LabelEncoder()
        self.carregar_dados()
        self.treinar_modelos()
    
    def carregar_dados(self):
        """Carrega dados do MySQL ou cria dados de exemplo"""
        try:
            print("Conectando ao banco de dados MySQL...")
            self.conn = mysql.connector.connect(
                host="localhost",
                user="root",
                password="root",
                database="empresa"
            )
            print("Conexão bem-sucedida! Carregando dados...")
            query = "SELECT nome, cargo, salario, data_contratacao FROM funcionarios"
            self.df_funcionarios = pd.read_sql(query, self.conn)
        except Exception as e:
            print(f"Falha ao conectar ao MySQL: {str(e)}")
            print("Criando dados de exemplo...")
            self.criar_dados_exemplo()
        
        # Processamento dos dados
        hoje = datetime.now()
        self.df_funcionarios['dias_empresa'] = (hoje - pd.to_datetime(
            self.df_funcionarios['data_contratacao'])).dt.days
        self.df_funcionarios['cargo_encoded'] = self.le.fit_transform(
            self.df_funcionarios['cargo'])
        print(f"Dados carregados. Total: {len(self.df_funcionarios)} registros")
    
    def criar_dados_exemplo(self):
        """Gera dados fictícios para demonstração"""
        dados = {
            'nome': ['Ana Souza', 'Carlos Lima', 'Mariana Oliveira', 'João Silva', 'Fernanda Costa'],
            'cargo': ['Desenvolvedor', 'Analista', 'Gerente', 'Desenvolvedor', 'Analista'],
            'salario': [7500, 6500, 12000, 8000, 7000],
            'data_contratacao': ['2020-01-15', '2021-03-10', '2018-11-20', '2019-05-05', '2020-08-30']
        }
        self.df_funcionarios = pd.DataFrame(dados)
    
    def treinar_modelos(self):
        """Treina todos os modelos de machine learning"""
        print("\nTreinando modelos de ML...")
        
        # 1. Modelo de Clusterização (K-Means)
        print("\n1. Clusterização (K-Means):")
        X_kmeans = self.df_funcionarios[['salario', 'dias_empresa']]
        self.kmeans = KMeans(n_clusters=3, random_state=42)
        self.kmeans.fit(X_kmeans)
        self.df_funcionarios['cluster'] = self.kmeans.labels_
        print(f"Clusters criados: {self.kmeans.n_clusters}")
        print(f"Centróides:\n{self.kmeans.cluster_centers_}")
        
        # 2. Modelo de Classificação de Cargos (Árvore de Decisão)
        print("\n2. Classificação de Cargos (Árvore de Decisão):")
        X_cargo = self.df_funcionarios[['salario', 'dias_empresa']]
        y_cargo = self.df_funcionarios['cargo_encoded']
        self.modelo_cargo = DecisionTreeClassifier(max_depth=3, random_state=42)
        self.modelo_cargo.fit(X_cargo, y_cargo)
        
        # Mostrar estrutura da árvore
        print("\nEstrutura da Árvore de Decisão:")
        tree_rules = export_text(
            self.modelo_cargo,
            feature_names=['salario', 'dias_empresa'],
            class_names=list(self.le.classes_)
        )
        print(tree_rules)
        
        # 3. Modelo de Risco de Turnover (Regressão Logística)
        print("\n3. Risco de Turnover (Regressão Logística):")
        media_salario = self.df_funcionarios['salario'].mean()
        self.df_funcionarios['risco_turnover'] = np.where(
            (self.df_funcionarios['salario'] < media_salario) & 
            (self.df_funcionarios['dias_empresa'] > 365*2), 1, 0)
        
        X_risco = self.df_funcionarios[['salario', 'dias_empresa']]
        y_risco = self.df_funcionarios['risco_turnover']
        self.modelo_risco = LogisticRegression()
        self.modelo_risco.fit(X_risco, y_risco)
        
        # Avaliar modelos
        self.avaliar_modelos()
    
    def avaliar_modelos(self):
        """Avalia e exibe métricas dos modelos"""
        print("\n=== AVALIAÇÃO DOS MODELOS ===")
        
        # Dados para avaliação
        X = self.df_funcionarios[['salario', 'dias_empresa']]
        
        # Avaliar modelo de cargos
        y_cargo = self.df_funcionarios['cargo_encoded']
        y_pred_cargo = self.modelo_cargo.predict(X)
        
        print("\nRelatório de Classificação - Cargos:")
        print(classification_report(
            y_cargo, y_pred_cargo, 
            target_names=self.le.classes_,
            zero_division=0
        ))
        
        # Avaliar modelo de turnover
        y_risco = self.df_funcionarios['risco_turnover']
        y_pred_risco = self.modelo_risco.predict(X)
        
        print("\nRelatório de Classificação - Turnover:")
        print(classification_report(
            y_risco, y_pred_risco,
            target_names=['Baixo Risco', 'Alto Risco'],
            zero_division=0
        ))
        
        # Exemplo de previsões
        print("\nExemplos de Previsões:")
        sample = self.df_funcionarios.sample(2)
        for _, row in sample.iterrows():
            # Prever cargo
            cargo_pred = self.le.inverse_transform(
                self.modelo_cargo.predict([[row['salario'], row['dias_empresa']]])
            )[0]
            
            # Prever risco
            risco_proba = self.modelo_risco.predict_proba(
                [[row['salario'], row['dias_empresa']]]
            )[0][1]
            
            print(f"\nFuncionário: {row['nome']}")
            print(f"  Cargo real: {row['cargo']} | Predito: {cargo_pred}")
            print(f"  Risco de turnover: {risco_proba:.1%}")
    
    # Métodos auxiliares para interação
    def prever_cargo(self, salario, dias_empresa):
        """Prediz o cargo com base em salário e tempo de empresa"""
        cargo_code = self.modelo_cargo.predict([[salario, dias_empresa]])[0]
        return self.le.inverse_transform([cargo_code])[0]
    
    def prever_risco(self, salario, dias_empresa):
        """Prediz o risco de turnover"""
        proba = self.modelo_risco.predict_proba([[salario, dias_empresa]])[0][1]
        return proba, "Alto Risco" if proba > 0.5 else "Baixo Risco"

# Inicializar o analisador
analisador = AnalisadorDadosEmpresa()


# ====================
# 4. INTERFACE PRINCIPAL
# ====================
print("\n[4/4] Configurando interface de interação...")

def gerar_dados_sinteticos(n=5):
    """Gera dados fictícios para testes"""
    cargos = analisador.le.classes_.tolist()
    dados = []
    for i in range(n):
        cargo = random.choice(cargos)
        salario = random.randint(5000, 15000)
        dias = random.randint(30, 365*5)
        data = (datetime.now() - timedelta(days=dias)).strftime('%Y-%m-%d')
        dados.append({
            'nome': f'Funcionario Teste {i+1}',
            'cargo': cargo,
            'salario': salario,
            'data_contratacao': data
        })
    return pd.DataFrame(dados)

def responder_pergunta(pergunta):
    """Processa a pergunta e retorna uma resposta"""
    pergunta_lower = pergunta.lower()
    
    # 1. Tentar responder com o classificador FAQ primeiro (com threshold mais baixo)
    resposta_faq = faq_classifier.get_answer(pergunta)
    if resposta_faq and "Não tenho certeza" not in resposta_faq:
        return resposta_faq
    
    # 2. Análise de salários
    if any(palavra in pergunta_lower for palavra in ['salário', 'salario', 'remuneração']):
        stats = analisador.df_funcionarios['salario'].describe()
        return (
            "Estatísticas salariais:\n"
            f"Média: R${stats['mean']:.2f}\n"
            f"Mediana: R${stats['50%']:.2f}\n"
            f"Intervalo: R${stats['min']:.2f} - R${stats['max']:.2f}"
        )
    
    # 3. Previsão de cargo
    elif 'prever cargo' in pergunta_lower:
        try:
            salario = float(next(s for s in pergunta.split() if s.replace('.','').isdigit()))
            dias = int(next(d for d in pergunta.split() if d.isdigit()))
            cargo = analisador.prever_cargo(salario, dias)
            return f"Para R${salario:.2f} e {dias} dias, cargo previsto: {cargo}"
        except:
            return "Não entendi. Formato: 'prever cargo para 5000 365'"
    
    # 4. Risco de turnover
    elif 'risco' in pergunta_lower:
        try:
            nome = next(n for n in analisador.df_funcionarios['nome'] if n.split()[0].lower() in pergunta_lower)
            dados = analisador.df_funcionarios[analisador.df_funcionarios['nome'] == nome].iloc[0]
            proba, risco = analisador.prever_risco(dados['salario'], dados['dias_empresa'])
            return f"{nome} tem {risco} ({proba:.1%} de probabilidade)"
        except:
            return "Funcionário não encontrado ou dados insuficientes"
    
    # 5. Dados sintéticos
    elif 'dados sintéticos' in pergunta_lower:
        n = int(next((s for s in pergunta.split() if s.isdigit()), 3))
        df = gerar_dados_sinteticos(n)
        return "Dados sintéticos gerados:\n" + df.to_string(index=False)
    
    # 6. Resposta padrão do chatbot (desativar adaptadores matemáticos temporariamente)
    resposta = chatbot.get_response(pergunta)
    return str(resposta)

# ====================
# EXECUÇÃO PRINCIPAL
# ====================
print("\n=== SISTEMA PRONTO ===")
print("Comandos disponíveis:")
print("- Salários: 'mostre análise salarial'")
print("- Previsão: 'prever cargo para 5000 365'")
print("- Risco: 'qual risco da Ana'")
print("- Dados: 'gere 3 dados sintéticos'")
print("- Sair: 'sair'")

while True:
    try:
        pergunta = input("\nVocê: ").strip()
        if not pergunta:
            continue
            
        if pergunta.lower() == 'sair':
            print("Encerrando o sistema...")
            break
            
        resposta = responder_pergunta(pergunta)
        print("\nAssistente:", resposta)
        
    except (KeyboardInterrupt, EOFError):
        print("\nSistema interrompido pelo usuário")
        break
    except Exception as e:
        print(f"\nErro: {str(e)}")