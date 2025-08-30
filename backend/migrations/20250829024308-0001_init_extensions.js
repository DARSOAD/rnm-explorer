"use strict";

/**
 * Habilita extensiones necesarias:
 * - pgcrypto: for gen_random_uuid()
 * - pg_trgm: for trigram indexing and similarity searches
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
    await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm";`);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP EXTENSION IF EXISTS "pg_trgm";`);
    await queryInterface.sequelize.query(`DROP EXTENSION IF EXISTS "pgcrypto";`);
  }
};
