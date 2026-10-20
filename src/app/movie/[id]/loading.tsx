export default function MovieDetailLoading() {
    return (
        <div className="relative min-h-screen bg-background text-foreground animate-pulse">
            {/* Cinematic Backdrop Hero Skeleton */}
            <div className="relative min-h-[460px] w-full overflow-hidden bg-muted/40 sm:min-h-[520px]">
                <div className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-8">
                    {/* Breadcrumb Skeleton */}
                    <div className="mb-6 flex items-center gap-2">
                        <div className="h-4 w-12 rounded bg-muted" />
                        <div className="h-4 w-2 rounded bg-muted" />
                        <div className="h-4 w-16 rounded bg-muted" />
                        <div className="h-4 w-2 rounded bg-muted" />
                        <div className="h-4 w-32 rounded bg-muted" />
                    </div>

                    <div className="flex flex-col gap-8 md:flex-row md:items-end">
                        {/* Poster Skeleton */}
                        <div className="aspect-[2/3] w-48 shrink-0 rounded-2xl bg-muted border border-border/60 shadow-xl sm:w-60" />

                        {/* Title & Metadata Skeleton */}
                        <div className="flex flex-1 flex-col space-y-4 max-w-3xl">
                            <div className="h-4 w-1/4 rounded bg-muted/80" />
                            <div className="h-10 w-3/4 rounded-lg bg-muted sm:h-12" />
                            <div className="flex flex-wrap gap-3">
                                <div className="h-7 w-20 rounded-md bg-muted" />
                                <div className="h-7 w-24 rounded-md bg-muted" />
                                <div className="h-7 w-28 rounded-md bg-muted" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <div className="h-11 w-36 rounded-full bg-primary/20" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Body Skeleton */}
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 space-y-10">
                <div className="space-y-3 max-w-3xl">
                    <div className="h-6 w-32 rounded bg-muted" />
                    <div className="h-4 w-full rounded bg-muted/70" />
                    <div className="h-4 w-5/6 rounded bg-muted/70" />
                    <div className="h-4 w-4/6 rounded bg-muted/70" />
                </div>

                <div className="space-y-4">
                    <div className="h-6 w-40 rounded bg-muted" />
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="aspect-[2/3] rounded-xl bg-muted" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
