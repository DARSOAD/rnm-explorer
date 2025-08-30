"use strict";

/**
 * GIN index with trgm on characters.name for fast ILIKE '%...%' searches.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS characters_name_trgm_idx
      ON characters USING GIN (name gin_trgm_ops);
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP INDEX IF EXISTS characters_name_trgm_idx;`);
  }
};
