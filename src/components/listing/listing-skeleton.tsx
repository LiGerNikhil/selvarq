export function ListingSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading clothing" className="page-container py-12">
      <div className="mb-9 space-y-3">
        <div className="h-3 w-36 animate-pulse bg-pearl" />
        <div className="h-9 w-64 animate-pulse bg-pearl" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-[4/5] bg-pearl" />
            <div className="mt-3 h-3 w-1/3 bg-pearl" />
            <div className="mt-2 h-4 w-3/4 bg-pearl" />
            <div className="mt-2 h-3 w-1/2 bg-pearl" />
          </div>
        ))}
      </div>
    </main>
  );
}
