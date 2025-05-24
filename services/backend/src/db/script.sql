CREATE DATABASE api2025_1;

USE api2025_1;

CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    role VARCHAR(8) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
);

CREATE TABLE agentes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setor VARCHAR(255) NOT NULL,
    assunto VARCHAR(255) NOT NULL,
    documento VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE agente_usuario (
    agente_id INT NOT NULL,
    usuario_id INT NOT NULL,
    selecionado boolean not null,
    PRIMARY KEY (agente_id, usuario_id),
    FOREIGN KEY (agente_id) REFERENCES agentes(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TABLE agente_acessos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agente_nome VARCHAR(100) NOT NULL,
    usuario_id INT NULL,
    data_acesso TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
