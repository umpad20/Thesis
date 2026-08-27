import { Skeleton } from "@/components/ui/skeleton";

/**
 * ── Student Home Dashboard Skeleton ─────────────────────────────────────────
 */
export function DashboardHomeSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner Skeleton */}
      <div className="rounded-3xl p-6 sm:p-8 bg-slate-100/80 border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-lg w-full">
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-80 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="w-24 h-12 rounded-2xl" />
          <Skeleton className="w-32 h-12 rounded-2xl" />
        </div>
      </div>

      {/* 4 KPI Metrics Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="w-9 h-9 rounded-xl" />
            </div>
            <Skeleton className="h-7 w-24 rounded-lg" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
        ))}
      </div>

      {/* Living Storybook Pathway & Recent Quizzes Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white border border-slate-200/80 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-6 w-48 rounded-lg" />
              <Skeleton className="h-4 w-64 rounded-md" />
            </div>
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 space-y-3">
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-5 w-32 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-slate-200/80 space-y-4">
          <Skeleton className="h-6 w-36 rounded-lg" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-3 w-16 rounded-md" />
                </div>
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ── Leaderboard Skeleton ────────────────────────────────────────────────────
 */
export function LeaderboardSkeleton() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header & Toggle */}
      <div className="text-center space-y-3">
        <Skeleton className="h-5 w-40 rounded-full mx-auto" />
        <Skeleton className="h-8 w-72 rounded-xl mx-auto" />
        <Skeleton className="h-4 w-96 rounded-md mx-auto" />
        <div className="flex justify-center pt-2">
          <Skeleton className="h-11 w-80 rounded-2xl" />
        </div>
      </div>

      {/* Podium 3 Champions */}
      <div className="grid grid-cols-3 gap-4 items-end max-w-2xl mx-auto pt-6">
        {/* 2nd Place */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-3 text-center h-48 flex flex-col justify-end">
          <Skeleton className="w-12 h-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-20 rounded-md mx-auto" />
          <Skeleton className="h-6 w-16 rounded-full mx-auto" />
        </div>
        {/* 1st Place */}
        <div className="p-5 rounded-2xl bg-amber-50/60 border-2 border-amber-200 space-y-3 text-center h-60 flex flex-col justify-end">
          <Skeleton className="w-16 h-16 rounded-full mx-auto bg-amber-200/80" />
          <Skeleton className="h-5 w-24 rounded-md mx-auto" />
          <Skeleton className="h-7 w-20 rounded-full mx-auto" />
        </div>
        {/* 3rd Place */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-3 text-center h-44 flex flex-col justify-end">
          <Skeleton className="w-12 h-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-20 rounded-md mx-auto" />
          <Skeleton className="h-6 w-16 rounded-full mx-auto" />
        </div>
      </div>

      {/* Roster List */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 space-y-3">
        <Skeleton className="h-5 w-48 rounded-md mb-4" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * ── Storybook Map / Badges Skeleton ─────────────────────────────────────────
 */
export function StorybookMapSkeleton() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 rounded-xl" />
          <Skeleton className="h-4 w-80 rounded-md" />
        </div>
        <Skeleton className="h-10 w-36 rounded-2xl" />
      </div>

      {/* 5 Stage Pathway Cards */}
      <div className="space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-6 rounded-3xl bg-white border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-2xl flex-shrink-0" />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-32 rounded-md" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3.5 w-64 rounded-md" />
                <Skeleton className="h-2 w-40 rounded-full" />
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Skeleton className="h-10 w-28 rounded-xl flex-1 md:flex-none" />
              <Skeleton className="h-10 w-32 rounded-xl flex-1 md:flex-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * ── Teacher Dashboard Skeleton ──────────────────────────────────────────────
 */
export function TeacherDashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Educator Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-lg w-full">
          <Skeleton className="h-5 w-32 rounded-full bg-slate-700" />
          <Skeleton className="h-8 w-64 rounded-xl bg-slate-700" />
          <Skeleton className="h-4 w-80 rounded-md bg-slate-800" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="w-32 h-11 rounded-2xl bg-slate-700" />
          <Skeleton className="w-36 h-11 rounded-2xl bg-blue-600/60" />
        </div>
      </div>

      {/* 4 Stat Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="w-9 h-9 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
        ))}
      </div>

      {/* Attention Radar Skeleton */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-56 rounded-lg" />
            <Skeleton className="h-4 w-72 rounded-md" />
          </div>
          <Skeleton className="h-10 w-72 rounded-2xl" />
        </div>

        {/* Pupil Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-3 w-16 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-200/60">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20 rounded-md" />
                  <Skeleton className="h-3 w-12 rounded-md" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24 rounded-md" />
                  <Skeleton className="h-3 w-12 rounded-md" />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-9 w-full rounded-xl" />
                <Skeleton className="h-9 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * ── Table / Roster Skeleton ─────────────────────────────────────────────────
 */
export function TableRosterSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Skeleton className="h-11 w-72 rounded-2xl" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-11 w-36 rounded-2xl" />
          <Skeleton className="h-11 w-40 rounded-2xl" />
        </div>
      </div>

      {/* Roster Table / Card Grid */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36 rounded-md" />
                <Skeleton className="h-3 w-24 rounded-md" />
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * ── Picture Book Reader Skeleton ────────────────────────────────────────────
 */
export function LessonReaderSkeleton() {
  return (
    <div className="space-y-4 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-40 rounded-md" />
          <Skeleton className="h-6 w-56 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-xl" />
        </div>
      </div>

      {/* 2-Page Book Spread */}
      <div className="bg-slate-900 p-4 sm:p-5 rounded-3xl border-4 border-amber-200/30">
        <div className="grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden bg-white min-h-[460px]">
          {/* Left Page (Art) */}
          <div className="p-6 sm:p-8 flex flex-col justify-between border-r border-amber-200/60 bg-amber-50/20">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-32 rounded-xl" />
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
              <Skeleton className="h-64 sm:h-72 w-full rounded-2xl" />
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-amber-200/40">
              <Skeleton className="h-9 w-28 rounded-xl" />
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
          </div>

          {/* Right Page (Text) */}
          <div className="p-6 sm:p-8 flex flex-col justify-between bg-white">
            <div className="space-y-6">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-4 w-20 rounded-md" />
              </div>
              <div className="p-6 rounded-3xl bg-amber-50/40 border border-amber-200/60 space-y-4">
                <Skeleton className="h-3 w-48 rounded-md" />
                <Skeleton className="h-8 w-full rounded-lg" />
                <Skeleton className="h-8 w-3/4 rounded-lg" />
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-amber-200/40">
              <Skeleton className="h-11 w-32 rounded-xl" />
              <Skeleton className="h-11 w-32 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
