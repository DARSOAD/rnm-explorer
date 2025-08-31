// src/features/characters/components/FiltersBar.tsx
import { useEffect, useMemo, useState } from "react";

type Value = {
  sort: "NAME_ASC" | "NAME_DESC";
  status?: string; species?: string; gender?: string;
  name?: string; origin?: string;
};

type Props = { value: Value; onApply: (next: Value) => void };

const STATUSES = ["", "Alive", "Dead", "unknown"];
const GENDERS = ["", "Male", "Female", "Genderless", "unknown"];
const SPECIES = ["", "Human", "Alien", "Humanoid", "Robot", "Mythological", "unknown"];

export default function FiltersBar({ value, onApply }: Props) {
  const [draft, setDraft] = useState<Value>(value);
  useEffect(() => setDraft(value), [value]);

  const set = (p: Partial<Value>) => setDraft((d) => ({ ...d, ...p }));
  const flipSort = useMemo(() => (draft.sort === "NAME_ASC" ? "NAME_DESC" : "NAME_ASC"), [draft.sort]);

  const applyNow = () => {

    onApply(draft);
  };

  return (
    <section className="flex flex-row md:items-end mb-4 w-full p-3">

      <div className="w-full">
        <input className="border rounded p-2 w-full" placeholder="Name contains…"
          value={draft.name ?? ""} onChange={(e) => set({ name: e.target.value || undefined })} />
      </div>

      <div className="w-50">
        <select className="border rounded p-2 w-full"
          value={draft.status ?? ""}
          onChange={(e) => set({ status: e.target.value || undefined })}>
          {STATUSES.map(s => <option key={s} value={s}>{s || "Status"}</option>)}
        </select>

        <select className="border rounded p-2 w-full"
          value={draft.species ?? ""}
          onChange={(e) => set({ species: e.target.value || undefined })}>
          {SPECIES.map(s => <option key={s} value={s}>{s || "Species"}</option>)}
        </select>

        <select className="border rounded p-2 w-full"
          value={draft.gender ?? ""}
          onChange={(e) => set({ gender: e.target.value || undefined })}>
          {GENDERS.map(s => <option key={s} value={s}>{s || "Gender"}</option>)}
        </select>
      </div>

      <div className="w-50">
        <button className="border rounded px-3 py-2 w-full" onClick={() => set({ sort: flipSort })}>
          {draft.sort === "NAME_ASC" ? "A→Z" : "Z→A"}
        </button>
        <button className="border rounded px-3 py-2 w-full" onClick={applyNow}>
          Apply filters
        </button>
        <button className="border rounded px-3 py-2 w-full" onClick={() => setDraft({ sort: "NAME_ASC" })}>
          Reset
        </button>
      </div>
    </section>
  );
}
