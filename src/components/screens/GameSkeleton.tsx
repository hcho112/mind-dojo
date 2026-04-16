export function GameSkeleton() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg)]">
      <div className="text-[var(--text-muted)] animate-pulse">Loading game...</div>
    </div>
  );
}
