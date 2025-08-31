import { useParams, Link } from 'react-router-dom';

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <main className="p-4">
      <Link className="text-sm underline" to="/">← Back</Link>
      <h1 className="text-xl font-semibold mt-2">Character Detail</h1>
      <p className="text-sm opacity-70">ID: {id}</p>
    </main>
  );
}
