"use strict";

/**
 * Initial seed: 15 characters (page 1 of the API).
 * - Insert LOCATIONS with api_id (internal UUID is auto-generated).
 * - Read LOCATIONS again to map api_id -> id (UUID).
 * - Insert CHARACTERS with api_id and UUID FKs (origin_id / location_id).
 *
 * Requires previous migrations:
 *   0001_init_extensions.js (pgcrypto, pg_trgm)
 *   0002_create_locations.js (id UUID PK, api_id INT UNIQUE, url UNIQUE, timestamps)
 *   0003_create_characters.js (id UUID PK, api_id INT UNIQUE, UUID FKs)
 *   0004_create_favorites.js (id UUID PK, user_id STRING, character_id UUID FK)
 *   0005_create_comments.js (id UUID PK, character_id UUID FK, author STRING, content TEXT)
 */

const doFetch = (...args) =>
  (globalThis.fetch
    ? globalThis.fetch(...args)
    : import("node-fetch").then(({ default: f }) => f(...args)));

function parseApiId(url) {
  if (!url) return null;
  const m = String(url).match(/\/(\d+)(?:\/)?$/);
  return m ? Number(m[1]) : null;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1) Bring 15 characters from the external API
    const res = await doFetch("https://rickandmortyapi.com/api/character?page=1");
    if (!res.ok) throw new Error(`Falló la petición: ${res.status}`);
    const data = await res.json();

    const first15 = (data?.results ?? []).slice(0, 15);
    if (first15.length === 0) return;

    const now = new Date();

    // 2) Build a map of unique LOCATIONS (api_id, name, url)
    const locMap = new Map();
    for (const c of first15) {
      const originUrl = c.origin?.url || "";
      const locUrl = c.location?.url || "";
      const originApiId = parseApiId(originUrl);
      const locApiId = parseApiId(locUrl);

      if (originApiId && originUrl) {
        locMap.set(originApiId, {
          api_id: originApiId,
          name: c.origin?.name || "unknown",
          url: originUrl,
        });
      }
      if (locApiId && locUrl) {
        locMap.set(locApiId, {
          api_id: locApiId,
          name: c.location?.name || "unknown",
          url: locUrl,
        });
      }
    }

    // 3) Insert LOCATIONS (api_id, name, url, timestamps)
    const locationsRows = Array.from(locMap.values()).map((l) => ({
      api_id: l.api_id,
      name: l.name,
      url: l.url,
      created_at: now,
      updated_at: now,
    }));

    if (locationsRows.length > 0) {
      await queryInterface.bulkInsert("locations", locationsRows, { ignoreDuplicates: true });
    }

    // 4) Read LOCATIONS again to map api_id -> id (UUID)
    let locByApiId = new Map();
    const apiIds = Array.from(locMap.keys());
    if (apiIds.length > 0) {
      const [locs] = await queryInterface.sequelize.query(
        `SELECT id, api_id FROM locations WHERE api_id IN (${apiIds.join(",")})`
      );
      locByApiId = new Map(locs.map((l) => [Number(l.api_id), l.id]));
    }

    // 5) Prepare CHARACTERS rows api_id, name, status, species, 
    const characterRows = first15.map((c) => {
      const originApiId = parseApiId(c.origin?.url || "");
      const locApiId = parseApiId(c.location?.url || "");
      return {
        api_id: c.id, 
        name: c.name,
        status: c.status ?? null,
        species: c.species ?? null,
        type: c.type ?? null,
        gender: c.gender ?? null,
        origin_id: originApiId ? locByApiId.get(originApiId) || null : null, // UUID
        location_id: locApiId ? locByApiId.get(locApiId) || null : null,     // UUID
        image: c.image ?? null,
        url: c.url,
        api_created_at: c.created ? new Date(c.created) : null,
        created_at: now,
        updated_at: now,
      };
    });

    await queryInterface.bulkInsert("characters", characterRows);
  },

  async down(queryInterface, Sequelize) {
    const res = await doFetch("https://rickandmortyapi.com/api/character?page=1");
    if (!res.ok) return;
    const data = await res.json();
    const first15 = (data?.results ?? []).slice(0, 15);

    const charApiIds = first15.map((c) => c.id).filter(Boolean);
    const locApiIds = (() => {
      const set = new Set();
      for (const c of first15) {
        const o = parseApiId(c.origin?.url || "");
        const l = parseApiId(c.location?.url || "");
        if (o) set.add(o);
        if (l) set.add(l);
      }
      return Array.from(set);
    })();

    // 1) Erase CHARACTERS with api_id in (first 15)
    if (charApiIds.length > 0) {
      await queryInterface.bulkDelete(
        "characters",
        { api_id: { [Sequelize.Op.in]: charApiIds } },
        {}
      );
    }

    // 2) Erase LOCATIONS with api_id in (those used by first 15 characters)
    if (locApiIds.length > 0) {
      await queryInterface.sequelize.query(`
        DELETE FROM locations l
        WHERE l.api_id IN (${locApiIds.join(",")})
          AND NOT EXISTS (
            SELECT 1 FROM characters c
            WHERE c.origin_id = l.id OR c.location_id = l.id
          )
      `);
    }
  },
};
