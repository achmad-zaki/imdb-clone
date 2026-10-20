"use client";

import { useMemo, useState } from "react";
import { Movie } from "@/types/movie";
import MovieCard from "@/components/movie/movie-card";
import TrailerModal from "@/components/movie/trailer-modal";
import { RiFilmLine, RiFireLine } from "@remixicon/react";

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

type MovieExplorerProps = {
    initialMovies: Movie[];
    onTrailerSelect?: (movie: Movie) => void;
    activeTrailerMovie: Movie | null;
    setActiveTrailerMovie: (movie: Movie | null) => void;
};

export default function MovieExplorer({
    initialMovies,
    activeTrailerMovie,
    setActiveTrailerMovie,
}: MovieExplorerProps) {
    const [selectedGenreId, setSelectedGenreId] = useState<number>(0);

    // Filter by genre in client memory
    const filteredMovies = useMemo(() => {
        if (!initialMovies) return [];
        if (selectedGenreId === 0) return initialMovies;
        return initialMovies.filter((movie) => movie.genre_ids?.includes(selectedGenreId));
    }, [initialMovies, selectedGenreId]);

    return (
        <section id="popular-movies" className="relative mx-auto max-w-6xl px-4 py-12 sm:px-8">
            {/* Section Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
                <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <RiFireLine className="size-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                            Popular Movies
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Top trending and most-watched movies right now
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {filteredMovies.length} movies
                    </span>
                    {selectedGenreId !== 0 && (
                        <button
                            type="button"
                            onClick={() => setSelectedGenreId(0)}
                            className="text-xs font-medium text-primary hover:underline underline-offset-4 transition"
                        >
                            Reset filter
                        </button>
                    )}
                </div>
            </div>

            {/* Genre Filter Pills */}
            <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2 text-xs no-scrollbar">
                <span className="shrink-0 text-muted-foreground font-medium mr-1">Genre:</span>
                {POPULAR_GENRES.map((g) => {
                    const isSelected = selectedGenreId === g.id;
                    return (
                        <button
                            key={g.id}
                            type="button"
                            onClick={() => setSelectedGenreId(g.id)}
                            className={`shrink-0 rounded-md px-3 py-1.5 transition-all ${
                                isSelected
                                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                    : "bg-muted/50 border border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
                            }`}
                        >
                            {g.name}
                        </button>
                    );
                })}
            </div>

            {/* Movie Grid / Empty State */}
            {filteredMovies.length > 0 ? (
                <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
                        No movies found
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                        There are no popular movies matching the selected genre.
                    </p>
                    <button
                        type="button"
                        onClick={() => setSelectedGenreId(0)}
                        className="mt-4 rounded-full border border-border/80 bg-card px-4 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
                    >
                        Show All Popular Movies
                    </button>
                </div>
            )}

            {/* Trailer Modal */}
            <TrailerModal
                movie={activeTrailerMovie}
                isOpen={!!activeTrailerMovie}
                onClose={() => setActiveTrailerMovie(null)}
            />
        </section>
    );
}
