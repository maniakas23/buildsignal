export function AuthLayoutSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="h-16 bg-muted" />
      <div className="flex">
        <div className="w-64 min-h-screen bg-muted" />
        <div className="flex-1 p-6">
          <div className="h-8 w-48 bg-muted rounded mb-4" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}
