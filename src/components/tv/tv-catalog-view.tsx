"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TVShow } from "@/types/tv";
import { Movie } from "@/types/movie";
import MovieCard, { MediaCardItem } from "@/components/movie/movie-card";
import TrailerModal from "@/components/movie/trailer-modal";
import {
    RiBroadcastLine,
    RiFilter3Line,
    RiFireLine,
    RiStarLine,
    RiTvLine,
} from "@remixicon/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { AnimatePresence, motion } from "framer-motion";

const POPULAR_TV_GENRES = [
    { id: 0, name: "All Genres" },
    { id: 10759, name: "Action & Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 10762, name: "Kids" },
    { id: 9648, name: "Mystery" },
    { id: 10765, name: "Sci-Fi & Fantasy" },
    { id: 10768, name: "War & Politics" },
    { id: 37, name: "Western" },
];

const SORT_OPTIONS: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "popular", label: "Popular", icon: RiFireLine },
    { id: "top_rated", label: "Top Rated", icon: RiStarLine },
    { id: "on_the_air", label: "On The Air", icon: RiBroadcastLine },
];

type TVCatalogViewProps = {
    initialShows: TVShow[];
    currentPage: number;
    totalPages: number;
    currentSort: string;
    totalResults: number;
};

export default function TVCatalogView({
    initialShows,
    currentPage,
    totalPages,
    currentSort,
    totalResults,
}: TVCatalogViewProps) {
    const [selectedGenreId, setSelectedGenreId] = useState<number>(0);
    const [activeTrailerMovie, setActiveTrailerMovie] = useState<Movie | null>(null);

    // Normalize TVShow to MediaCardItem
    const normalizedShows = useMemo<MediaCardItem[]>(() => {
        return (initialShows || []).map((tv) => ({
            id: tv.id,
            title: tv.name,
            overview: tv.overview,
            poster_path: tv.poster_path,
            backdrop_path: tv.backdrop_path,
            release_date: tv.first_air_date,
            vote_average: tv.vote_average,
            vote_count: tv.vote_count,
            genre_ids: tv.genre_ids,
            popularity: tv.popularity,
            media_type: "tv" as const,
        }));
    }, [initialShows]);

    // Filter by genre locally
    const filteredShows = useMemo(() => {
        if (!normalizedShows) return [];
        if (selectedGenreId === 0) return normalizedShows;
        return normalizedShows.filter((tv) => tv.genre_ids?.includes(selectedGenreId));
    }, [normalizedShows, selectedGenreId]);

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
        return query ? `/tv?${query}` : "/tv";
    };

    return (
        <div className="relative mx-auto w-full max-w-6xl min-w-0 px-4 py-8 sm:py-12 sm:px-8">
            {/* Breadcrumb navigation */}
            <nav className="mb-4 flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
                <Link href="/" className="hover:text-foreground transition-colors">
                    Home
                </Link>
                <span>/</span>
                <span className="font-medium text-foreground">TV Series</span>
            </nav>

            {/* Header: | Explore TV Series */}
            <div className="border-b border-border/60 pb-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="h-6 w-1 rounded-full bg-primary" />
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                Explore TV Series
                            </h1>
                        </div>
                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground pl-3.5">
                            Discover thousands of popular, top-rated, and on-the-air TV shows from TMDB
                        </p>
                    </div>

                    {/* Sort Selector with animated sliding indicator */}
                    <div className="relative inline-flex items-center rounded-full border border-border/80 bg-muted/60 p-1 backdrop-blur-xs self-start sm:self-auto">
                        {SORT_OPTIONS.map((opt) => {
                            const isActive = currentSort === opt.id;
                            const Icon = opt.icon;
                            return (
                                <Link
                                    key={opt.id}
                                    href={buildUrl(1, opt.id)}
                                    className={`relative z-10 flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-colors duration-200 ${
                                        isActive
                                            ? "text-primary-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {isActive && (
                                        <motion.span
                                            layoutId="activeTVSortTab"
                                            className="absolute inset-0 rounded-full bg-primary shadow-xs shadow-primary/20"
                                            transition={{ type: "spring", stiffness: 450, damping: 32 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-1.5">
                                        <Icon className="size-3.5" />
                                        <span>{opt.label}</span>
                                    </span>
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
                {POPULAR_TV_GENRES.map((g) => {
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
                    Showing <span className="font-semibold text-foreground">{filteredShows.length}</span> titles on Page{" "}
                    <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
                    <span className="font-semibold text-foreground">{totalPages.toLocaleString()}</span>
                </p>
                {selectedGenreId !== 0 && (
                    <button
                        type="button"
                        onClick={() => setSelectedGenreId(0)}
                        className="font-medium text-primary hover:underline underline-offset-4"
                    >
                        Reset Genre Filter
                    </button>
                )}
            </div>

            {/* TV Shows Grid with smooth fade-and-slide transition */}
            <AnimatePresence mode="wait">
                {filteredShows.length > 0 ? (
                    <motion.div
                        key={`${currentSort}-${selectedGenreId}-${currentPage}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="w-full"
                    >
                        <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6 w-full min-w-0">
                            {filteredShows.map((tv, index) => (
                                <MovieCard
                                    key={tv.id}
                                    movie={tv}
                                    priority={index < 4}
                                    onPlayTrailer={(m) => setActiveTrailerMovie(m)}
                                />
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="empty-state"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="mt-16 flex flex-col items-center justify-center text-center"
                    >
                        <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <RiTvLine className="size-6" />
                        </div>
                        <h3 className="mt-4 text-base font-semibold text-foreground">
                            No TV series found
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                            There are no titles matching this genre on the current page.
                        </p>
                        <button
                            type="button"
                            onClick={() => setSelectedGenreId(0)}
                            className="mt-4 rounded-full border border-border/80 bg-card px-4 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
                        >
                            Reset Filter
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between border-t border-border/60 pt-6">
                    <div className="text-xs text-muted-foreground">
                        Page {currentPage} of {totalPages.toLocaleString()} ({totalResults.toLocaleString()} total series)
                    </div>

                    <div className="flex items-center gap-1.5">
                        {/* Prev Button */}
                        {currentPage > 1 ? (
                            <Link
                                href={buildUrl(currentPage - 1)}
                                className="flex size-8 items-center justify-center rounded-lg border border-border/80 bg-card text-muted-foreground transition hover:border-primary/50 hover:bg-muted hover:text-foreground active:scale-95"
                                aria-label="Previous Page"
                            >
                                <FaChevronLeft className="size-3" />
                            </Link>
                        ) : (
                            <span className="flex size-8 items-center justify-center rounded-lg border border-border/40 bg-muted/40 text-muted-foreground/40 cursor-not-allowed">
                                <FaChevronLeft className="size-3" />
                            </span>
                        )}

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                            {pageNumbers.map((p, idx) => {
                                if (p === "...") {
                                    return (
                                        <span
                                            key={`ellipsis-${idx}`}
                                            className="flex size-8 items-center justify-center text-xs text-muted-foreground"
                                        >
                                            …
                                        </span>
                                    );
                                }

                                const pageNum = p as number;
                                const isCurrent = pageNum === currentPage;

                                return (
                                    <Link
                                        key={pageNum}
                                        href={buildUrl(pageNum)}
                                        className={`flex size-8 items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                                            isCurrent
                                                ? "bg-primary text-primary-foreground shadow-xs shadow-primary/20 pointer-events-none"
                                                : "border border-border/70 bg-card text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground active:scale-95"
                                        }`}
                                    >
                                        {pageNum}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Next Button */}
                        {currentPage < totalPages ? (
                            <Link
                                href={buildUrl(currentPage + 1)}
                                className="flex size-8 items-center justify-center rounded-lg border border-border/80 bg-card text-muted-foreground transition hover:border-primary/50 hover:bg-muted hover:text-foreground active:scale-95"
                                aria-label="Next Page"
                            >
                                <FaChevronRight className="size-3" />
                            </Link>
                        ) : (
                            <span className="flex size-8 items-center justify-center rounded-lg border border-border/40 bg-muted/40 text-muted-foreground/40 cursor-not-allowed">
                                <FaChevronRight className="size-3" />
                            </span>
                        )}
                    </div>
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
