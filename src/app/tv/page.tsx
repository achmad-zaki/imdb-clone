import { Suspense } from "react";
import { Metadata } from "next";
import { getPopularTVShows, getTopRatedTVShows, getOnTheAirTVShows } from "@/lib/tmdb";
import TVCatalogView from "@/components/tv/tv-catalog-view";

export const metadata: Metadata = {
    title: "Explore TV Series — CINEVA",
    description: "Browse popular, top-rated, and on-the-air TV series and shows with ratings, air dates, and official HD trailers.",
};

type TVPageProps = {
    searchParams: Promise<{
        page?: string;
        sort?: string;
    }>;
};

async function TVContent({ searchParams }: TVPageProps) {
    const params = await searchParams;
    const rawPage = parseInt(params.page || "1", 10);
    const currentPage = isNaN(rawPage) || rawPage < 1 ? 1 : Math.min(rawPage, 500);
    const sort = params.sort === "top_rated" || params.sort === "on_the_air" ? params.sort : "popular";

    let data;
    try {
        if (sort === "top_rated") {
            data = await getTopRatedTVShows(currentPage);
        } else if (sort === "on_the_air") {
            data = await getOnTheAirTVShows(currentPage);
        } else {
            data = await getPopularTVShows(currentPage);
        }
    } catch {
        data = {
            results: [],
            page: currentPage,
            total_pages: 1,
            total_results: 0,
        };
    }

    const totalPages = Math.min(data.total_pages || 1, 500);

    return (
        <TVCatalogView
            initialShows={data.results || []}
            currentPage={currentPage}
            totalPages={totalPages}
            currentSort={sort}
            totalResults={data.total_results || 0}
        />
    );
}

function TVSkeleton() {
    return (
        <div className="relative mx-auto w-full max-w-6xl min-w-0 px-4 py-8 sm:py-12 sm:px-8">
            <div className="h-4 w-28 rounded bg-muted animate-pulse mb-4" />
            <div className="h-8 w-48 rounded bg-muted animate-pulse" />
            <div className="mt-6 flex gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-8 w-20 rounded-lg bg-muted animate-pulse" />
                ))}
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="aspect-[2/3] w-full rounded-xl bg-muted animate-pulse" />
                ))}
            </div>
        </div>
    );
}

export default function TVCatalogPage({ searchParams }: TVPageProps) {
    return (
        <main className="flex-1 w-full min-w-0 max-w-full">
            <Suspense fallback={<TVSkeleton />}>
                <TVContent searchParams={searchParams} />
            </Suspense>
        </main>
    );
}
