"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("favorites", {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal("gen_random_uuid()"), primaryKey: true },
      user_id: { type: Sequelize.STRING(120), allowNull: true }, 
      character_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "characters", key: "id" },
        onDelete: "CASCADE"
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") }
    });
    await queryInterface.addConstraint("favorites", {
      fields: ["user_id", "character_id"],
      type: "unique",
      name: "favorites_user_character_unique"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("favorites");
  }
};
