"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("comments", {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal("gen_random_uuid()"), primaryKey: true },
      character_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "characters", key: "id" },
        onDelete: "CASCADE"
      },
      author: { type: Sequelize.STRING(120), allowNull: true }, 
      content: { type: Sequelize.TEXT, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") }
    });
    await queryInterface.addIndex("comments", ["character_id", "created_at"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("comments");
  }
};
