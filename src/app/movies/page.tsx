import { Suspense } from "react";
import { Metadata } from "next";
import {
    discoverMovies,
    getPopularMovies,
    getTopRatedMovies,
    getUpcomingMovies,
} from "@/lib/tmdb";
import MoviesCatalogView from "@/components/movie/movies-catalog-view";

export const metadata: Metadata = {
    title: "Explore Movies — CINEVA",
    description: "Browse popular, top-rated, and upcoming movies with filters by genre, release dates, and ratings.",
};

type MoviesPageProps = {
    searchParams: Promise<{
        page?: string;
        sort?: string;
        genre?: string;
        from?: string;
        to?: string;
    }>;
};

async function MoviesContent({ searchParams }: MoviesPageProps) {
    const params = await searchParams;
    const rawPage = parseInt(params.page || "1", 10);
    const currentPage = isNaN(rawPage) || rawPage < 1 ? 1 : Math.min(rawPage, 500);
    const sort = params.sort === "top_rated" || params.sort === "upcoming" ? params.sort : "popular";
    const genre = params.genre || "0";
    const fromDate = params.from || "";
    const toDate = params.to || "";

    const hasFilters = (genre !== "0" && genre !== "") || fromDate !== "" || toDate !== "";

    let data;
    try {
        if (hasFilters) {
            const sortByMap: Record<string, string> = {
                popular: "popularity.desc",
                top_rated: "vote_average.desc",
                upcoming: "primary_release_date.desc",
            };
            data = await discoverMovies({
                page: currentPage,
                sortBy: sortByMap[sort] || "popularity.desc",
                withGenres: genre !== "0" ? genre : undefined,
                releaseDateGte: fromDate || undefined,
                releaseDateLte: toDate || undefined,
            });
        } else if (sort === "top_rated") {
            data = await getTopRatedMovies(currentPage);
        } else if (sort === "upcoming") {
            data = await getUpcomingMovies(currentPage);
        } else {
            data = await getPopularMovies(currentPage);
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
        <MoviesCatalogView
            initialMovies={data.results || []}
            currentPage={currentPage}
            totalPages={totalPages}
            currentSort={sort}
            currentGenre={genre}
            currentFromDate={fromDate}
            currentToDate={toDate}
            totalResults={data.total_results || 0}
        />
    );
}

function MoviesSkeleton() {
    return (
        <div className="relative mx-auto w-full max-w-7xl min-w-0 px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
            <div className="h-4 w-28 rounded bg-muted animate-pulse mb-4" />
            <div className="h-8 w-48 rounded bg-muted animate-pulse mb-8" />
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar skeleton */}
                <div className="w-full lg:w-72 shrink-0">
                    <div className="h-96 rounded-2xl bg-muted/60 animate-pulse border border-border/40" />
                </div>
                {/* Content skeleton */}
                <div className="flex-1">
                    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
                        {Array.from({ length: 15 }).map((_, i) => (
                            <div key={i} className="aspect-[2/3] w-full rounded-xl bg-muted animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MoviesPage({ searchParams }: MoviesPageProps) {
    return (
        <main className="flex-1 w-full min-w-0 max-w-full">
            <Suspense fallback={<MoviesSkeleton />}>
                <MoviesContent searchParams={searchParams} />
            </Suspense>
        </main>
    );
}

