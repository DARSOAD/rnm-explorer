"use strict";

const doFetch = (...args) =>
  (globalThis.fetch
    ? globalThis.fetch(...args)
    : import("node-fetch").then(({ default: f }) => f(...args)));

function parseApiId(url) {
  if (!url) return null;
  const m = url.match(/\/(\d+)(?:\/)?$/);
  return m ? Number(m[1]) : null;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const res = await doFetch("https://rickandmortyapi.com/api/character?page=1");
    if (!res.ok) throw new Error(`Falló la petición: ${res.status}`);
    const data = await res.json();

    const first15 = data.results.slice(0, 15);
    const now = new Date();

    const locMap = new Map();
    for (const c of first15) {
      const originId = parseApiId(c.origin?.url || "");
      const locId = parseApiId(c.location?.url || "");
      if (originId) locMap.set(originId, { id: originId, name: c.origin.name || "unknown", url: c.origin.url });
      if (locId) locMap.set(locId, { id: locId, name: c.location.name || "unknown", url: c.location.url });
    }

    const locationsRows = Array.from(locMap.values()).map(l => ({
      id: l.id, name: l.name, url: l.url, created_at: now, updated_at: now
    }));
    if (locationsRows.length > 0) {
      await queryInterface.bulkInsert("locations", locationsRows, { ignoreDuplicates: true });
    }

    const characterRows = first15.map(c => ({
      id: c.id,
      name: c.name,
      status: c.status ?? null,
      species: c.species ?? null,
      type: c.type ?? null,
      gender: c.gender ?? null,
      origin_id: parseApiId(c.origin?.url || "") || null,
      location_id: parseApiId(c.location?.url || "") || null,
      image: c.image ?? null,
      url: c.url,
      api_created_at: c.created ? new Date(c.created) : null,
      created_at: now,
      updated_at: now
    }));

    await queryInterface.bulkInsert("characters", characterRows);
  },

  async down(queryInterface, Sequelize) {
    const res = await doFetch("https://rickandmortyapi.com/api/character?page=1");
    const data = await res.json();
    const ids = data.results.slice(0, 15).map(c => c.id);
    await queryInterface.bulkDelete("characters", { id: { [Sequelize.Op.in]: ids } });
  }
};
