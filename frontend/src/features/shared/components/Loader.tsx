export function Loader() {
    return (
      <div className="w-full py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-current border-t-transparent" />
        <span className="ml-3">Loading…</span>
      </div>
    );
  }
  