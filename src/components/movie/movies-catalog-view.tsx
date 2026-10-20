"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Movie } from "@/types/movie";
import MovieCard from "@/components/movie/movie-card";
import TrailerModal from "@/components/movie/trailer-modal";
import { RiFilmLine, RiFilter3Line, RiSortDesc } from "@remixicon/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

const POPULAR_GENRES = [
    { id: 0, name: "All Genres" },
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 18, name: "Drama" },
    { id: 878, name: "Sci-Fi" },
    { id: 27, name: "Horror" },
    { id: 9648, name: "Mystery" },
    { id: 10749, name: "Romance" },
    { id: 53, name: "Thriller" },
];

const SORT_OPTIONS = [
    { id: "popular", label: "Popular" },
    { id: "top_rated", label: "Top Rated" },
    { id: "upcoming", label: "Upcoming" },
];

type MoviesCatalogViewProps = {
    initialMovies: Movie[];
    currentPage: number;
    totalPages: number;
    currentSort: string;
    totalResults: number;
};

export default function MoviesCatalogView({
    initialMovies,
    currentPage,
    totalPages,
    currentSort,
    totalResults,
}: MoviesCatalogViewProps) {
    const [selectedGenreId, setSelectedGenreId] = useState<number>(0);
    const [activeTrailerMovie, setActiveTrailerMovie] = useState<Movie | null>(null);

    // Filter by genre locally
    const filteredMovies = useMemo(() => {
        if (!initialMovies) return [];
        if (selectedGenreId === 0) return initialMovies;
        return initialMovies.filter((movie) => movie.genre_ids?.includes(selectedGenreId));
    }, [initialMovies, selectedGenreId]);

    // Build page pagination numbers
    const pageNumbers = useMemo(() => {
        const pages: (number | string)[] = [];
        const maxShown = 5;

        if (totalPages <= maxShown + 2) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 3) {
                start = 2;
                end = 4;
            } else if (currentPage >= totalPages - 2) {
                start = totalPages - 3;
                end = totalPages - 1;
            }

            if (start > 2) pages.push("...");
            for (let i = start; i <= end; i++) pages.push(i);
            if (end < totalPages - 1) pages.push("...");
            pages.push(totalPages);
        }

        return pages;
    }, [currentPage, totalPages]);

    const buildUrl = (page: number, sort: string = currentSort) => {
        const params = new URLSearchParams();
        if (page > 1) params.set("page", page.toString());
        if (sort && sort !== "popular") params.set("sort", sort);
        const query = params.toString();
        return query ? `/movies?${query}` : "/movies";
    };

    return (
        <div className="relative mx-auto w-full max-w-6xl min-w-0 px-4 py-8 sm:py-12 sm:px-8">
            {/* Breadcrumb navigation */}
            <nav className="mb-4 flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
                <Link href="/" className="hover:text-foreground transition-colors">
                    Home
                </Link>
                <span>/</span>
                <span className="font-medium text-foreground">Movies</span>
            </nav>

            {/* Header: | All Movies */}
            <div className="border-b border-border/60 pb-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="h-6 w-1 rounded-full bg-primary" />
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                Explore Movies
                            </h1>
                        </div>
                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground pl-3.5">
                            Discover thousands of titles from TMDB, filter by genre, and watch official trailers
                        </p>
                    </div>

                    {/* Sort Selector */}
                    <div className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-border/70 bg-card p-1 shadow-xs">
                        <span className="flex items-center gap-1 px-2 text-xs font-medium text-muted-foreground">
                            <RiSortDesc className="size-3.5" />
                            <span className="hidden xs:inline">Sort:</span>
                        </span>
                        {SORT_OPTIONS.map((opt) => {
                            const isActive = currentSort === opt.id;
                            return (
                                <Link
                                    key={opt.id}
                                    href={buildUrl(1, opt.id)}
                                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                                        isActive
                                            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                                >
                                    {opt.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Genre Filter Pills (Responsive scroll on mobile) */}
            <div className="mt-6 flex w-full min-w-0 max-w-full items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 text-xs no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                <span className="shrink-0 flex items-center gap-1 text-muted-foreground font-medium mr-1 hidden sm:inline-flex">
                    <RiFilter3Line className="size-3.5" />
                    Genre:
                </span>
                {POPULAR_GENRES.map((g) => {
                    const isSelected = selectedGenreId === g.id;
                    return (
                        <button
                            key={g.id}
                            type="button"
                            onClick={() => setSelectedGenreId(g.id)}
                            className={`shrink-0 rounded-lg sm:rounded-md px-3 py-1.5 text-xs transition-all active:scale-95 ${
                                isSelected
                                    ? "bg-primary text-primary-foreground font-semibold shadow-xs shadow-primary/20"
                                    : "bg-card border border-border/70 text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground"
                            }`}
                        >
                            {g.name}
                        </button>
                    );
                })}
            </div>

            {/* Summary & Active Filter notice */}
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <p>
                    Showing <span className="font-semibold text-foreground">{filteredMovies.length}</span> titles on Page{" "}
                    <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
                    <span className="font-semibold text-foreground">{totalPages.toLocaleString()}</span>
                </p>
                {selectedGenreId !== 0 && (
                    <button
                        type="button"
                        onClick={() => setSelectedGenreId(0)}
                        className="font-medium text-primary hover:underline underline-offset-4 transition"
                    >
                        Reset Genre Filter
                    </button>
                )}
            </div>

            {/* Movie Grid / Empty State */}
            {filteredMovies.length > 0 ? (
                <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-x-3.5 gap-y-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-7 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 w-full min-w-0">
                    {filteredMovies.map((movie) => (
                        <MovieCard
                            key={movie.id}
                            movie={movie}
                            onPlayTrailer={(m) => setActiveTrailerMovie(m)}
                        />
                    ))}
                </div>
            ) : (
                <div className="mt-16 flex flex-col items-center justify-center text-center">
                    <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <RiFilmLine className="size-6" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-foreground">
                        No movies found on this page
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                        There are no movies matching the selected genre on page {currentPage}.
                    </p>
                    <button
                        type="button"
                        onClick={() => setSelectedGenreId(0)}
                        className="mt-4 rounded-full border border-border/80 bg-card px-4 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
                    >
                        Show All on This Page
                    </button>
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-12 sm:mt-16 flex flex-col items-center justify-center gap-4 border-t border-border/60 pt-8">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        {/* Prev Button */}
                        {currentPage > 1 ? (
                            <Link
                                href={buildUrl(currentPage - 1)}
                                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/80 bg-card px-3 text-xs font-medium text-foreground transition-all hover:border-primary/50 hover:bg-muted hover:text-primary active:scale-95"
                                aria-label="Previous page"
                            >
                                <FaChevronLeft className="size-3" />
                                <span className="hidden sm:inline">Prev</span>
                            </Link>
                        ) : (
                            <button
                                type="button"
                                disabled
                                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/40 bg-muted/40 px-3 text-xs font-medium text-muted-foreground/50 cursor-not-allowed opacity-50"
                                aria-label="Previous page (disabled)"
                            >
                                <FaChevronLeft className="size-3" />
                                <span className="hidden sm:inline">Prev</span>
                            </button>
                        )}

                        {/* Page Number Pills */}
                        <div className="flex items-center gap-1">
                            {pageNumbers.map((p, idx) => {
                                if (typeof p === "string") {
                                    return (
                                        <span
                                            key={`ellipsis-${idx}`}
                                            className="flex h-9 w-7 items-center justify-center text-xs text-muted-foreground"
                                        >
                                            ...
                                        </span>
                                    );
                                }

                                const isCurrent = p === currentPage;
                                return isCurrent ? (
                                    <span
                                        key={p}
                                        className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground shadow-sm shadow-primary/20"
                                        aria-current="page"
                                    >
                                        {p}
                                    </span>
                                ) : (
                                    <Link
                                        key={p}
                                        href={buildUrl(p)}
                                        className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-border/80 bg-card px-3 text-xs font-medium text-muted-foreground transition-all hover:border-primary/50 hover:bg-muted hover:text-foreground active:scale-95"
                                    >
                                        {p}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Next Button */}
                        {currentPage < totalPages ? (
                            <Link
                                href={buildUrl(currentPage + 1)}
                                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/80 bg-card px-3 text-xs font-medium text-foreground transition-all hover:border-primary/50 hover:bg-muted hover:text-primary active:scale-95"
                                aria-label="Next page"
                            >
                                <span className="hidden sm:inline">Next</span>
                                <FaChevronRight className="size-3" />
                            </Link>
                        ) : (
                            <button
                                type="button"
                                disabled
                                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/40 bg-muted/40 px-3 text-xs font-medium text-muted-foreground/50 cursor-not-allowed opacity-50"
                                aria-label="Next page (disabled)"
                            >
                                <span className="hidden sm:inline">Next</span>
                                <FaChevronRight className="size-3" />
                            </button>
                        )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Page <span className="font-medium text-foreground">{currentPage}</span> of{" "}
                        <span className="font-medium text-foreground">{totalPages.toLocaleString()}</span>
                    </p>
                </div>
            )}

            {/* Trailer Modal */}
            <TrailerModal
                movie={activeTrailerMovie}
                isOpen={!!activeTrailerMovie}
                onClose={() => setActiveTrailerMovie(null)}
            />
        </div>
    );
}
