"use strict";

/**
 * locations:
 * - id UUID PK default gen_random_uuid()
 * - api_id INT UNIQUE (extermal API ID)
 * - name, url UNIQUE
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { sequelize } = queryInterface;

    await sequelize.transaction(async (t) => {
      await queryInterface.createTable("locations", {
        id: {
          type: Sequelize.UUID,
          allowNull: false,
          defaultValue: Sequelize.literal("gen_random_uuid()"),
          primaryKey: true,
        },
        api_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        url: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
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
      }, { transaction: t });

      // Indexes
      await queryInterface.addIndex("locations", ["name"], {
        name: "locations_name_idx",
        transaction: t,
      });
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("locations");
  }
};
