-- Migração segura: adicionar campos de autoria aos WODs em um único ALTER

ALTER TABLE `wods`
    ADD COLUMN `criadoPor` timestamp NULL DEFAULT NULL,
    ADD COLUMN `editadoPor` timestamp NULL DEFAULT NULL,
    ADD COLUMN `editadoEm` timestamp NULL DEFAULT NULL;
