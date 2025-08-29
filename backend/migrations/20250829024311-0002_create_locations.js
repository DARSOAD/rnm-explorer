"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("locations", {
      id: { type: Sequelize.INTEGER, primaryKey: true, allowNull: false }, 
      name: { type: Sequelize.STRING(160), allowNull: false },
      url: { type: Sequelize.STRING(512), allowNull: false, unique: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") }
    });

    await queryInterface.addIndex("locations", ["name"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("locations");
  }
};
