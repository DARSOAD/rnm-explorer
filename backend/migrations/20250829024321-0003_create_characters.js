"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("characters", {
      id: { type: Sequelize.INTEGER, primaryKey: true, allowNull: false }, 
      name: { type: Sequelize.STRING(160), allowNull: false },
      status: { type: Sequelize.STRING(32), allowNull: true },  
      species: { type: Sequelize.STRING(80), allowNull: true },
      type: { type: Sequelize.STRING(160), allowNull: true },   
      gender: { type: Sequelize.STRING(32), allowNull: true },
      origin_id: {                                           
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "locations", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      location_id: {                                       
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "locations", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      image: { type: Sequelize.STRING(512), allowNull: true },
      url: { type: Sequelize.STRING(512), allowNull: false, unique: true }, 
      api_created_at: { type: Sequelize.DATE, allowNull: true },            
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") }
    });

    await queryInterface.addIndex("characters", ["name"]);
    await queryInterface.addIndex("characters", ["status", "species", "gender"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("characters");
  }
};
