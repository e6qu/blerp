interface SkeletonLineProps {
  className?: string;
  width?: string;
}

export function SkeletonLine({ className = "", width = "w-full" }: SkeletonLineProps) {
  return (
    <div
      className={`h-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse ${width} ${className}`}
    />
  );
}

export function SkeletonCircle({ size = "h-8 w-8" }: { size?: string }) {
  return <div className={`rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse ${size}`} />;
}

export function TableSkeleton({ rows = 5, columns = 3 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-white dark:bg-gray-800">
      <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3">
        <div className="flex gap-8">
          {Array.from({ length: columns }, (_, i) => (
            <SkeletonLine key={i} width="w-24" className="h-3" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-8 px-6 py-4">
            {Array.from({ length: columns }, (_, j) => (
              <SkeletonLine key={j} width={j === 0 ? "w-48" : "w-32"} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-white dark:bg-gray-800 p-4 space-y-3">
      <SkeletonLine width="w-1/3" className="h-5" />
      <SkeletonLine width="w-full" />
      <SkeletonLine width="w-2/3" />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <SkeletonCircle size="h-12 w-12" />
        <div className="space-y-2">
          <SkeletonLine width="w-32" className="h-5" />
          <SkeletonLine width="w-48" className="h-3" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <SkeletonLine width="w-16" className="h-3" />
          <SkeletonLine width="w-full" />
        </div>
        <div className="space-y-2">
          <SkeletonLine width="w-16" className="h-3" />
          <SkeletonLine width="w-full" />
        </div>
      </div>
    </div>
  );
}
