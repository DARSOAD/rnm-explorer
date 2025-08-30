"use strict";

/**
 * favorites:
 * - id UUID PK
 * - user_id (null for anonymous) STRING
 * - character_id UUID FK CASCADE
 * - UNIQUE(user_id, character_id)
 * - created_at, updated_at, deleted_at (soft delete ): Audit
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { sequelize } = queryInterface;

    await sequelize.transaction(async (t) => {
      await queryInterface.createTable("favorites", {
        id: {
          type: Sequelize.UUID,
          allowNull: false,
          defaultValue: Sequelize.literal("gen_random_uuid()"),
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        character_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: "characters", key: "id" },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
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

      await queryInterface.addConstraint("favorites", {
        fields: ["user_id", "character_id"],
        type: "unique",
        name: "favorites_user_character_unique",
        transaction: t,
      });

      await queryInterface.addIndex("favorites", ["character_id", "created_at"], {
        name: "favorites_character_created_idx",
        transaction: t,
      });
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("favorites");
  }
};
