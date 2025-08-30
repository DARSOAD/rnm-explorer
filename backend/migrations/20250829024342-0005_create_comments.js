"use strict";

/**
 * comments:
 * - id UUID PK
 * - character_id UUID FK CASCADE
 * - author (nullable), content (TEXT) NOT NULL
 * -  created_at, updated_at, deleted_at: Audit
 * - Index (character_id, created_at)
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { sequelize } = queryInterface;

    await sequelize.transaction(async (t) => {
      await queryInterface.createTable("comments", {
        id: {
          type: Sequelize.UUID,
          allowNull: false,
          defaultValue: Sequelize.literal("gen_random_uuid()"),
          primaryKey: true,
        },
        character_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: "characters", key: "id" },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        author: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW"),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW"),
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      }, { transaction: t });

      await queryInterface.addIndex("comments", ["character_id", "created_at"], {
        name: "comments_character_created_idx",
        transaction: t,
      });
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("comments");
  }
};
