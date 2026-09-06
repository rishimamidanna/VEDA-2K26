"use client";

export function ProjectSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[var(--color-border-subtle)] bg-white p-5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-20 rounded-md bg-gray-200" />
          <div className="h-5 w-48 rounded-md bg-gray-200" />
        </div>
        <div className="h-6 w-20 rounded-full bg-gray-200" />
      </div>
      <div className="mb-3 h-10 w-full rounded-md bg-gray-100" />
      <div className="mb-4 flex gap-3">
        <div className="h-4 w-16 rounded-md bg-gray-200" />
        <div className="h-4 w-1 rounded-full bg-gray-200" />
        <div className="h-4 w-16 rounded-md bg-gray-200" />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 w-16 rounded-lg bg-gray-100" />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded-md bg-gray-100" />
        <div className="h-9 w-28 rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}

export function ProjectSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <ProjectSkeleton key={i} />
      ))}
    </div>
  );
}
