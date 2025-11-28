-- Script para popular dados de teste
-- Execute APÓS a migração migration_auth.sql

-- Limpar dados de teste anteriores
DELETE FROM users WHERE email LIKE '%@test.com' OR email LIKE '%@rxnation.com';

-- Inserir usuários de teste
-- Senha para todos: "senha123" (hash SHA-256)
-- Hash: a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3

-- 1. Atleta de teste
INSERT INTO users (
    email, 
    passwordHash, 
    name, 
    role, 
    emailVerified,
    lastSignedIn,
    createdAt
) VALUES (
    'atleta@test.com',
    'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
    'Atleta Teste',
    'atleta',
    true,
    NOW(),
    NOW()
);

-- 2. Box Master de teste
INSERT INTO users (
    email, 
    passwordHash, 
    name, 
    role, 
    emailVerified,
    lastSignedIn,
    createdAt
) VALUES (
    'boxmaster@test.com',
    'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
    'Box Master Teste',
    'box_master',
    true,
    NOW(),
    NOW()
);

-- 3. Franqueado de teste
INSERT INTO users (
    email, 
    passwordHash, 
    name, 
    role, 
    emailVerified,
    lastSignedIn,
    createdAt
) VALUES (
    'franqueado@test.com',
    'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
    'Franqueado Teste',
    'franqueado',
    true,
    NOW(),
    NOW()
);

-- 4. Admin da Liga de teste
INSERT INTO users (
    email, 
    passwordHash, 
    name, 
    role, 
    emailVerified,
    lastSignedIn,
    createdAt
) VALUES (
    'admin@test.com',
    'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
    'Admin Liga Teste',
    'admin_liga',
    true,
    NOW(),
    NOW()
);

-- 5. Usuário com email não verificado
INSERT INTO users (
    email, 
    passwordHash, 
    name, 
    role, 
    emailVerified,
    lastSignedIn,
    createdAt
) VALUES (
    'nao-verificado@test.com',
    'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
    'Não Verificado',
    'atleta',
    false,
    NOW(),
    NOW()
);

-- Verificar dados inseridos
SELECT 
    id,
    email,
    name,
    role,
    emailVerified,
    LEFT(passwordHash, 20) as hash_preview,
    lastSignedIn
FROM users 
WHERE email LIKE '%@test.com'
ORDER BY id;

-- Informações de login
SELECT '
╔════════════════════════════════════════════════════════════╗
║           USUÁRIOS DE TESTE CRIADOS COM SUCESSO            ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Todos os usuários têm a senha: senha123                   ║
║                                                            ║
║  1. Atleta                                                 ║
║     Email: atleta@test.com                                 ║
║     Senha: senha123                                        ║
║     Role: atleta                                           ║
║                                                            ║
║  2. Box Master                                             ║
║     Email: boxmaster@test.com                              ║
║     Senha: senha123                                        ║
║     Role: box_master                                       ║
║                                                            ║
║  3. Franqueado                                             ║
║     Email: franqueado@test.com                             ║
║     Senha: senha123                                        ║
║     Role: franqueado                                       ║
║                                                            ║
║  4. Admin da Liga                                          ║
║     Email: admin@test.com                                  ║
║     Senha: senha123                                        ║
║     Role: admin_liga                                       ║
║                                                            ║
║  5. Email Não Verificado                                   ║
║     Email: nao-verificado@test.com                         ║
║     Senha: senha123                                        ║
║     Role: atleta                                           ║
║     Verificado: NÃO                                        ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
' as INFO;
