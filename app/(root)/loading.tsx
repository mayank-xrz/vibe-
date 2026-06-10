const Loading = () => {
  return (
    <div className="flex w-full flex-1 flex-col gap-8 p-8" role="status" aria-label="Loading page">
      <div className="flex flex-col gap-3">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded-lg bg-gray-100" />
      </div>
      <div className="flex items-center gap-6 rounded-xl border border-gray-200 p-6">
        <div className="size-28 animate-pulse rounded-full bg-gray-200" />
        <div className="flex flex-col gap-3">
          <div className="h-5 w-40 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-8 w-32 animate-pulse rounded-lg bg-gray-100" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
};

export default Loading;
