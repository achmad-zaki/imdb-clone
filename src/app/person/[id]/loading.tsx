export default function PersonDetailLoading() {
    return (
        <div className="relative min-h-screen bg-background text-foreground animate-pulse">
            <div className="relative z-10 mx-auto max-w-6xl px-4 pt-6 pb-8 sm:px-8">
                {/* Breadcrumb Skeleton */}
                <div className="mb-6 flex items-center gap-2">
                    <div className="h-4 w-12 rounded bg-muted" />
                    <div className="h-4 w-2 rounded bg-muted" />
                    <div className="h-4 w-28 rounded bg-muted" />
                </div>

                {/* Profile Header Skeleton */}
                <div className="flex flex-col gap-8 md:flex-row md:items-start">
                    {/* Profile Photo */}
                    <div className="aspect-[2/3] w-48 shrink-0 rounded-2xl bg-muted border border-border/60 shadow-xl sm:w-64" />

                    {/* Person Info */}
                    <div className="flex flex-1 flex-col space-y-4">
                        <div className="h-4 w-20 rounded-full bg-muted" />
                        <div className="h-10 w-2/3 rounded-lg bg-muted sm:h-12" />
                        <div className="flex flex-wrap gap-2">
                            <div className="h-6 w-28 rounded-md bg-muted" />
                            <div className="h-6 w-36 rounded-md bg-muted" />
                        </div>
                        {/* Bio box */}
                        <div className="space-y-2 pt-2">
                            <div className="h-4 w-full rounded bg-muted/80" />
                            <div className="h-4 w-full rounded bg-muted/80" />
                            <div className="h-4 w-3/4 rounded bg-muted/80" />
                        </div>
                    </div>
                </div>

                {/* Known For Section Skeleton */}
                <div className="mt-12 space-y-4">
                    <div className="h-6 w-36 rounded bg-muted" />
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
