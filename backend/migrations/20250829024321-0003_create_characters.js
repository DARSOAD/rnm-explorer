"use strict";

/**
 * characters:
 * - id UUID PK default gen_random_uuid()
 * - api_id INT UNIQUE (external API ID)
 * - FKs a locations (origin_id/location_id) with SET NULL
 * - (status/species/gender) Indexes for filtering:
 * - (status, species, gender) Composite index for common filter combos
 * - (btree) trgm GIN index on name for ILIKE '%...%' searches
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { sequelize } = queryInterface;

    await sequelize.transaction(async (t) => {
      await queryInterface.createTable("characters", {
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
        status: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        species: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        type: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        gender: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        origin_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: "locations", key: "id" },
          onDelete: "SET NULL",
          onUpdate: "CASCADE",
        },
        location_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: "locations", key: "id" },
          onDelete: "SET NULL",
          onUpdate: "CASCADE",
        },
        image: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        url: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        api_created_at: {
          type: Sequelize.DATE,
          allowNull: true,
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

      // Indixes for searching and filtering
      await queryInterface.addIndex("characters", ["name"], {
        name: "characters_name_idx",
        transaction: t,
      });

      // Composite index for common filter combinations
      await queryInterface.addIndex("characters", ["status", "species", "gender"], {
        name: "characters_status_species_gender_idx",
        transaction: t,
      });

      // Individual indexes for single-column filters
      await queryInterface.addIndex("characters", ["status"], {
        name: "characters_status_idx",
        transaction: t,
      });
      await queryInterface.addIndex("characters", ["species"], {
        name: "characters_species_idx",
        transaction: t,
      });
      await queryInterface.addIndex("characters", ["gender"], {
        name: "characters_gender_idx",
        transaction: t,
      });

      // Indixes for Fks to locations/origin and location
      await queryInterface.addIndex("characters", ["origin_id"], {
        name: "characters_origin_id_idx",
        transaction: t,
      });
      await queryInterface.addIndex("characters", ["location_id"], {
        name: "characters_location_id_idx",
        transaction: t,
      });
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("characters");
  }
};
