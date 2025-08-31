import { useEffect, useMemo, useState } from "react";
import { useComments } from "../hooks/useComments";

type Props = { characterId: string };

export default function CommentsPanel({ characterId }: Props) {
  const {
    pageVM, loading, error,
    page, setPage,
    pageSize, setPageSize,
    sort, setSort,
    addComment, updateComment, deleteComment,
    adding, updating, deleting,
  } = useComments(characterId, 1, 10, "CREATED_AT_DESC");

  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    setDraft("");
    setEditingId(null);
    setEditingText("");
  }, [characterId]);

  const disabled = useMemo(() => adding || updating || deleting, [adding, updating, deleting]);

  if (loading && !pageVM) {
    return <div className="text-sm text-gray-500">Loading comments…</div>;
  }
  if (error) {
    return <div className="rounded border border-red-200 bg-red-50 text-red-700 p-2 text-sm">Failed to load comments.</div>;
  }

  return (
    <section className="space-y-4">
      {/* Header + Controls */}
      <header className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
        <h3 className="text-lg font-semibold">Comments</h3>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="border rounded px-2 py-1 text-sm"
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
          >
            <option value="CREATED_AT_DESC">Newest first</option>
            <option value="CREATED_AT_ASC">Oldest first</option>
          </select>

          <select
            className="border rounded px-2 py-1 text-sm"
            value={pageSize}
            onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)); }}
          >
            {[5,10,20].map(n => <option key={n} value={n}>{n}/page</option>)}
          </select>
        </div>
      </header>

      {/* New comment */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add a comment…"
          className="flex-1 border rounded px-3 py-2 text-sm"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && draft.trim()) { addComment(draft.trim()); setDraft(""); }}}
          disabled={disabled}
        />
        <button
          className="px-3 py-2 rounded text-sm bg-blue-600 text-white disabled:opacity-50"
          onClick={() => { if (draft.trim()) { addComment(draft.trim()); setDraft(""); } }}
          disabled={disabled || !draft.trim()}
        >
          {adding ? "Adding…" : "Add"}
        </button>
      </div>

      {/* List */}
      <ul className="space-y-2">
        {pageVM?.items?.length ? pageVM.items.map((c) => (
          <li key={c.id} className="border rounded p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs text-gray-500">
                  <span className="font-medium">{c.author}</span>{" "}
                  <span>• {new Date(c.createdAt).toLocaleString()}</span>
                  {c.updatedAt && <span> • edited {new Date(c.updatedAt).toLocaleString()}</span>}
                </div>

                {editingId === c.id ? (
                  <div className="mt-2 flex gap-2">
                    <input
                      className="flex-1 border rounded px-2 py-1 text-sm"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && editingText.trim()) {
                          updateComment(c.id, editingText.trim());
                          setEditingId(null);
                          setEditingText("");
                        }
                        if (e.key === "Escape") {
                          setEditingId(null);
                          setEditingText("");
                        }
                      }}
                      autoFocus
                    />
                    <button
                      className="px-2 py-1 rounded text-sm bg-green-600 text-white disabled:opacity-50"
                      onClick={() => { if (editingText.trim()) { updateComment(c.id, editingText.trim()); setEditingId(null); setEditingText(""); } }}
                      disabled={disabled || !editingText.trim()}
                    >
                      Save
                    </button>
                    <button
                      className="px-2 py-1 rounded text-sm bg-gray-200 disabled:opacity-50"
                      onClick={() => { setEditingId(null); setEditingText(""); }}
                      disabled={disabled}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p className="mt-1 text-sm break-words">{c.content}</p>
                )}
              </div>

              <div className="flex-shrink-0 flex gap-1">
                {editingId !== c.id && (
                  <button
                    className="px-2 py-1 rounded text-xs bg-amber-100 text-amber-800 border border-amber-200"
                    onClick={() => { setEditingId(c.id); setEditingText(c.content); }}
                    disabled={disabled}
                  >
                    Edit
                  </button>
                )}
                <button
                  className="px-2 py-1 rounded text-xs bg-red-100 text-red-800 border border-red-200"
                  onClick={() => deleteComment(c.id)}
                  disabled={disabled}
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        )) : (
          <li className="text-sm text-gray-500">No comments yet. Be the first!</li>
        )}
      </ul>

      {/* Pagination */}
      {pageVM && (
        <footer className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Page {pageVM.pageInfo.page} / {pageVM.pageInfo.totalPages} • {pageVM.pageInfo.totalItems} total
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded border text-sm disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pageVM.pageInfo.hasPrev}
            >
              Prev
            </button>
            <button
              className="px-3 py-1 rounded border text-sm disabled:opacity-50"
              onClick={() => setPage((p) => p + 1)}
              disabled={!pageVM.pageInfo.hasNext}
            >
              Next
            </button>
          </div>
        </footer>
      )}
    </section>
  );
}
