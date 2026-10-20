"use client";

import MovieCard, { MediaCardItem } from "@/components/movie/movie-card";
import TrailerModal from "@/components/movie/trailer-modal";
import { Movie } from "@/types/movie";
import { TVShow } from "@/types/tv";
import { RiFilmLine, RiTvLine } from "@remixicon/react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FaArrowRight } from "react-icons/fa";

type MovieExplorerProps = {
    initialMovies: Movie[];
    initialTV?: TVShow[];
    onTrailerSelect?: (movie: Movie) => void;
    activeTrailerMovie: Movie | null;
    setActiveTrailerMovie: (movie: Movie | null) => void;
};

export default function MovieExplorer({
    initialMovies = [],
    initialTV = [],
    activeTrailerMovie,
    setActiveTrailerMovie,
}: MovieExplorerProps) {
    const [mediaType, setMediaType] = useState<"movie" | "tv">("movie");

    // Normalize Movie list to MediaCardItem
    const normalizedMovies = useMemo<MediaCardItem[]>(() => {
        return (initialMovies || []).map((m) => ({
            ...m,
            media_type: "movie",
        }));
    }, [initialMovies]);

    // Normalize TV list to MediaCardItem
    const normalizedTV = useMemo<MediaCardItem[]>(() => {
        return (initialTV || []).map((tv) => ({
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
    }, [initialTV]);

    // Active media items based on selected tab
    const activeItems = mediaType === "movie" ? normalizedMovies : normalizedTV;

    return (
        <section id="popular-content" className="relative mx-auto w-full max-w-6xl min-w-0 px-4 py-8 sm:py-12 sm:px-8">
            {/* Header: Title + Segmented Switcher */}
            <div className="border-b border-border/60 pb-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Left: Section Marker + Title + Segmented Switcher */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="h-6 w-1 rounded-full bg-primary" />
                            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl transition-all duration-300">
                                {mediaType === "movie" ? "Movies" : "TV Series"}
                            </h2>
                        </div>

                        {/* Segmented Switcher: [ Movies ] | [ TV Series ] with sliding spring indicator */}
                        <div className="relative inline-flex items-center rounded-full border border-border/80 bg-muted/60 p-1 backdrop-blur-xs">
                            <button
                                type="button"
                                onClick={() => setMediaType("movie")}
                                className={`relative z-10 flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-colors duration-200 ${
                                    mediaType === "movie"
                                        ? "text-primary-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {mediaType === "movie" && (
                                    <motion.span
                                        layoutId="activeMediaTab"
                                        className="absolute inset-0 rounded-full bg-primary shadow-xs shadow-primary/20"
                                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-1.5">
                                    <RiFilmLine className="size-3.5" />
                                    <span>Movies</span>
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setMediaType("tv")}
                                className={`relative z-10 flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-colors duration-200 ${
                                    mediaType === "tv"
                                        ? "text-primary-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {mediaType === "tv" && (
                                    <motion.span
                                        layoutId="activeMediaTab"
                                        className="absolute inset-0 rounded-full bg-primary shadow-xs shadow-primary/20"
                                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-1.5">
                                    <RiTvLine className="size-3.5" />
                                    <span>TV Series</span>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                <p className="mt-1.5 text-xs text-muted-foreground pl-3.5 transition-opacity duration-300">
                    {mediaType === "movie"
                        ? "Explore popular and top-rated movies across genres"
                        : "Explore trending and acclaimed TV series and shows across genres"}
                </p>
            </div>

            {/* Grid / Empty State with smooth fade-and-slide transition */}
            <AnimatePresence mode="wait">
                {activeItems.length > 0 ? (
                    <motion.div
                        key={mediaType}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="w-full"
                    >
                        <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-x-3.5 gap-y-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-7 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 w-full min-w-0">
                            {activeItems.map((item) => (
                                <MovieCard
                                    key={`${item.media_type || "media"}-${item.id}`}
                                    movie={item}
                                    onPlayTrailer={(m) => setActiveTrailerMovie(m)}
                                />
                            ))}
                        </div>

                        {/* Bottom CTA to View All */}
                        <div className="mt-10 sm:mt-12 flex justify-center">
                            <Link
                                href={mediaType === "movie" ? "/movies" : "/tv"}
                                className="group inline-flex items-center gap-2 rounded-full border border-border/80 bg-card px-6 py-3 text-xs sm:text-sm font-semibold text-foreground shadow-xs transition-all duration-200 hover:border-primary/50 hover:bg-muted hover:text-primary hover:shadow-lg hover:shadow-primary/5 active:scale-95"
                            >
                                <span>{mediaType === "movie" ? "Explore All Movies" : "Explore All TV Series"}</span>
                                <FaArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                            </Link>
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
                            {mediaType === "movie" ? (
                                <RiFilmLine className="size-6" />
                            ) : (
                                <RiTvLine className="size-6" />
                            )}
                        </div>
                        <h3 className="mt-4 text-base font-semibold text-foreground">
                            {mediaType === "movie" ? "No movies found" : "No TV series found"}
                        </h3>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Trailer Modal */}
            <TrailerModal
                movie={activeTrailerMovie}
                isOpen={!!activeTrailerMovie}
                onClose={() => setActiveTrailerMovie(null)}
            />
        </section>
    );
}
