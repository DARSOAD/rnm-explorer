// backend/src/infrastructure/db/sequelize.ts
import "dotenv/config";
import { Sequelize, DataTypes, Model, Optional } from "sequelize";

export const sequelize = new Sequelize(
  process.env.DB_NAME || "rickmorty",
  process.env.DB_USER || "postgres",
  process.env.DB_PASS || "postgres",
  {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    dialect: "postgres",
    logging: process.env.DB_LOGGING === "true" ? console.log : false,
  }
);

// Character
export const Character = sequelize.define("Character", {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: Sequelize.literal("gen_random_uuid()") },
  api_id: { type: DataTypes.INTEGER, unique: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING },
  species: { type: DataTypes.STRING },
  type: { type: DataTypes.STRING },
  gender: { type: DataTypes.STRING },
  origin_id: { type: DataTypes.UUID },
  location_id: { type: DataTypes.UUID },
  image: { type: DataTypes.STRING },
  url: { type: DataTypes.STRING, allowNull: false, unique: true },
  api_created_at: { type: DataTypes.DATE },
  created_at: { type: DataTypes.DATE, defaultValue: Sequelize.fn("NOW") },
  updated_at: { type: DataTypes.DATE, defaultValue: Sequelize.fn("NOW") },
}, {
  tableName: "characters",
  timestamps: false,
});

// Location
export const Location = sequelize.define("Location", {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: Sequelize.literal("gen_random_uuid()") },
  api_id: { type: DataTypes.INTEGER, unique: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  url: { type: DataTypes.STRING, allowNull: false, unique: true },
  created_at: { type: DataTypes.DATE, defaultValue: Sequelize.fn("NOW") },
  updated_at: { type: DataTypes.DATE, defaultValue: Sequelize.fn("NOW") },
}, {
  tableName: "locations",
  timestamps: false,
});

// Favorite
export const Favorite = sequelize.define("Favorite", {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: Sequelize.literal("gen_random_uuid()") },
  user_id: { type: DataTypes.STRING },
  character_id: { type: DataTypes.UUID, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: Sequelize.fn("NOW") },
  updated_at: { type: DataTypes.DATE, defaultValue: Sequelize.fn("NOW") },
  deleted_at: { type: DataTypes.DATE },
}, {
  tableName: "favorites",
  timestamps: false,
});

// Comment
export const Comment = sequelize.define("Comment", {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: Sequelize.literal("gen_random_uuid()") },
  character_id: { type: DataTypes.UUID, allowNull: false },
  author: { type: DataTypes.STRING },
  content: { type: DataTypes.TEXT, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: Sequelize.fn("NOW") },
  updated_at: { type: DataTypes.DATE, defaultValue: Sequelize.fn("NOW") },
  deleted_at: { type: DataTypes.DATE },
}, {
  tableName: "comments",
  timestamps: false,
});

// Relaciones
Character.belongsTo(Location, { as: "origin", foreignKey: "origin_id" });
Character.belongsTo(Location, { as: "location", foreignKey: "location_id" });
Favorite.belongsTo(Character, { foreignKey: "character_id" });
Comment.belongsTo(Character, { foreignKey: "character_id" });

// Inicializador
export async function initSequelize() {
  await sequelize.authenticate();
  return { sequelize, Character, Location, Favorite, Comment };
}
