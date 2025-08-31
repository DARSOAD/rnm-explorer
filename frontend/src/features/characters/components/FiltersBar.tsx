import { useEffect, useMemo, useState } from "react";

type Props = {
  value: {
    sort: "NAME_ASC" | "NAME_DESC";
    status?: string; species?: string; gender?: string;
    name?: string; origin?: string;
  };
  onChange: (next: Props["value"]) => void;
};

const STATUSES = ["", "Alive", "Dead", "unknown"];
const GENDERS  = ["", "Male", "Female", "Genderless", "unknown"];
const SPECIES  = ["", "Human", "Alien", "Humanoid", "Robot", "Mythological", "unknown"];

export default function FiltersBar({ value, onChange }: Props) {
  const [name, setName] = useState(value.name ?? "");
  const [origin, setOrigin] = useState(value.origin ?? "");
  useEffect(() => setName(value.name ?? ""), [value.name]);
  useEffect(() => setOrigin(value.origin ?? ""), [value.origin]);

  useEffect(() => {
    const t = setTimeout(() => onChange({ ...value, name, origin }), 300);
    return () => clearTimeout(t);
  }, [name, origin]); // eslint-disable-line react-hooks/exhaustive-deps

  const flipSort = useMemo(
    () => (value.sort === "NAME_ASC" ? "NAME_DESC" : "NAME_ASC"),
    [value.sort]
  );

  return (
    <section className="flex flex-col md:flex-row gap-3 md:items-end mb-4">
      <div className="flex gap-2 flex-1">
        <select className="border rounded p-2 w-36"
          value={value.status ?? ""} onChange={(e)=>onChange({ ...value, status:e.target.value||undefined,})}>
          {STATUSES.map(s => <option key={s} value={s}>{s||"Status"}</option>)}
        </select>

        <select className="border rounded p-2 w-40"
          value={value.species ?? ""} onChange={(e)=>onChange({ ...value, species:e.target.value||undefined })}>
          {SPECIES.map(s => <option key={s} value={s}>{s||"Species"}</option>)}
        </select>

        <select className="border rounded p-2 w-40"
          value={value.gender ?? ""} onChange={(e)=>onChange({ ...value, gender:e.target.value||undefined })}>
          {GENDERS.map(s => <option key={s} value={s}>{s||"Gender"}</option>)}
        </select>
      </div>

      <div className="flex gap-2 flex-1">
        <input className="border rounded p-2 flex-1" placeholder="Name contains..."
          value={name} onChange={(e)=>setName(e.target.value)} />
        <input className="border rounded p-2 flex-1" placeholder="Origin name contains..."
          value={origin} onChange={(e)=>setOrigin(e.target.value)} />
      </div>

      <div className="flex gap-2">
        <button
          className="border rounded px-3 py-2"
          onClick={() => onChange({ ...value, sort: flipSort })}
          title={value.sort === "NAME_ASC" ? "A→Z" : "Z→A"}
        >
          {value.sort === "NAME_ASC" ? "A→Z" : "Z→A"}
        </button>
        <button
          className="border rounded px-3 py-2"
          onClick={() =>
            onChange({ sort:"NAME_ASC", status:undefined, species:undefined, gender:undefined, name:"", origin:"" })
          }
        >
          Reset
        </button>
      </div>
    </section>
  );
}
