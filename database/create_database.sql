-- ============================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS
-- Sistema Odontológico
-- PostgreSQL 12+
-- ============================================

-- Criar o banco de dados (execute isso primeiro, conectado ao postgres)
CREATE DATABASE sistema_odontologico
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Portuguese_Brazil.1252'
    LC_CTYPE = 'Portuguese_Brazil.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

COMMENT ON DATABASE sistema_odontologico IS 'Sistema de Gerenciamento de Consultório Odontológico';
