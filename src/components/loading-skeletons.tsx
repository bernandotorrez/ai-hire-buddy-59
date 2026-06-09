import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function JobCardSkeleton() {
  return (
    <Card className="p-6 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-6 w-2/3" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <Skeleton className="h-7 w-20" />
      </div>
    </Card>
  );
}

export function ApplicantTableSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="p-6 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-72 max-w-full" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-14" />
              </div>
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="flex w-full flex-col items-center gap-3 sm:w-44">
              <Skeleton className="h-10 w-full" />
              <MatchScoreSkeleton />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="grid gap-6">
      <Card className="p-6 shadow-soft">
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-72 max-w-full" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </Card>
      <Card className="p-6 shadow-soft">
        <Skeleton className="mb-5 h-6 w-36" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className={index > 3 ? "sm:col-span-2" : undefined}>
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className={index > 3 ? "h-24 w-full" : "h-10 w-full"} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function ApplicationCardSkeleton() {
  return (
    <Card className="p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-7 w-24" />
      </div>
    </Card>
  );
}

export function AIInsightsSkeleton() {
  return (
    <div className="mt-4 rounded-md bg-muted/50 p-4">
      <Skeleton className="mb-3 h-4 w-1/2" />
      <Skeleton className="mb-2 h-4 w-full" />
      <Skeleton className="mb-2 h-4 w-11/12" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  );
}

export function MatchScoreSkeleton() {
  return (
    <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-muted">
      <Skeleton className="h-14 w-14 rounded-full" />
    </div>
  );
}
