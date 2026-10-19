"use client";

import { useEffect, useMemo, useState } from "react";
import { Movie } from "@/types/movie";
import MovieCard from "@/components/movie/movie-card";
import TrailerModal from "@/components/movie/trailer-modal";
import {
    RiCloseLine,
    RiCompass3Line,
    RiFilmLine,
    RiFireLine,
    RiSearchLine,
    RiSparklingLine,
    RiTimeLine,
} from "@remixicon/react";

type CategoryKey = "popular" | "trending" | "now_playing" | "top_rated" | "upcoming";

const CATEGORIES: { id: CategoryKey; label: string; icon: typeof RiFireLine }[] = [
    { id: "popular", label: "Populer", icon: RiFireLine },
    { id: "trending", label: "Trending", icon: RiSparklingLine },
    { id: "now_playing", label: "Sedang Tayang", icon: RiFilmLine },
    { id: "top_rated", label: "Rating Tertinggi", icon: RiCompass3Line },
    { id: "upcoming", label: "Akan Datang", icon: RiTimeLine },
];

const POPULAR_GENRES = [
    { id: 0, name: "Semua Genre" },
    { id: 28, name: "Aksi" },
    { id: 12, name: "Petualangan" },
    { id: 16, name: "Animasi" },
    { id: 35, name: "Komedi" },
    { id: 18, name: "Drama" },
    { id: 878, name: "Fiksi Ilmiah" },
    { id: 27, name: "Horor" },
    { id: 9648, name: "Misteri" },
    { id: 10749, name: "Romansa" },
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
    const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("popular");
    const [selectedGenreId, setSelectedGenreId] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [movies, setMovies] = useState<Movie[]>(initialMovies);
    const [isLoading, setIsLoading] = useState(false);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery.trim());
        }, 350);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch movies when category or search query changes
    useEffect(() => {
        let isCancelled = false;

        const loadMovies = async () => {
            setIsLoading(true);

            if (debouncedQuery.length > 0) {
                // Search API
                try {
                    const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
                    const data = await res.json();
                    if (!isCancelled) setMovies(data.results || []);
                } catch {
                    if (!isCancelled) setMovies([]);
                } finally {
                    if (!isCancelled) setIsLoading(false);
                }
            } else {
                // Category API
                try {
                    const res = await fetch(`/api/movies?category=${selectedCategory}`);
                    const data = await res.json();
                    if (!isCancelled) setMovies(data.results || []);
                } catch {
                    if (!isCancelled) setMovies([]);
                } finally {
                    if (!isCancelled) setIsLoading(false);
                }
            }
        };

        void loadMovies();

        return () => {
            isCancelled = true;
        };
    }, [selectedCategory, debouncedQuery]);

    // Filter by genre in client memory
    const filteredMovies = useMemo(() => {
        if (selectedGenreId === 0) return movies;
        return movies.filter((movie) => movie.genre_ids?.includes(selectedGenreId));
    }, [movies, selectedGenreId]);

    const handleClearSearch = () => {
        setSearchQuery("");
        setDebouncedQuery("");
    };

    return (
        <section id="jelajahi-film" className="relative mx-auto max-w-7xl px-4 py-12 sm:px-8">
            {/* Control Bar: Categories & Search */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                {/* Minimalist Category Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar sm:pb-0">
                    {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = selectedCategory === cat.id && !debouncedQuery;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    handleClearSearch();
                                    setSelectedCategory(cat.id);
                                }}
                                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 ${
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                                        : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60"
                                }`}
                            >
                                <Icon className="size-3.5" />
                                <span>{cat.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Minimalist Search Input */}
                <div className="relative w-full max-w-md">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                        <RiSearchLine className="size-4" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari film atau kata kunci..."
                        className="w-full rounded-full border border-border/80 bg-muted/40 py-2.5 pl-10 pr-10 text-xs text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary/70 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                            aria-label="Hapus pencarian"
                        >
                            <RiCloseLine className="size-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Genre Filter Pills */}
            <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 text-xs no-scrollbar">
                <span className="shrink-0 text-muted-foreground font-medium mr-1">Genre:</span>
                {POPULAR_GENRES.map((g) => {
                    const isSelected = selectedGenreId === g.id;
                    return (
                        <button
                            key={g.id}
                            onClick={() => setSelectedGenreId(g.id)}
                            className={`shrink-0 rounded-md px-3 py-1 transition-all ${
                                isSelected
                                    ? "bg-primary/10 border border-primary/40 text-primary font-medium"
                                    : "bg-muted/50 border border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
                            }`}
                        >
                            {g.name}
                        </button>
                    );
                })}
            </div>

            {/* Results Header Status */}
            <div className="mt-8 flex items-center justify-between border-b border-border/60 pb-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                        {debouncedQuery
                            ? `Hasil Pencarian: "${debouncedQuery}"`
                            : CATEGORIES.find((c) => c.id === selectedCategory)?.label || "Daftar Film"}
                    </h2>
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground font-medium">
                        {filteredMovies.length} film
                    </span>
                </div>

                {selectedGenreId !== 0 && (
                    <button
                        onClick={() => setSelectedGenreId(0)}
                        className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                        Reset filter genre
                    </button>
                )}
            </div>

            {/* Movie Grid / Loading / Empty States */}
            {isLoading ? (
                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="flex flex-col space-y-2.5 animate-pulse">
                            <div className="aspect-[2/3] w-full rounded-xl bg-muted" />
                            <div className="h-3 w-3/4 rounded bg-muted/80" />
                            <div className="h-2.5 w-1/2 rounded bg-muted/60" />
                        </div>
                    ))}
                </div>
            ) : filteredMovies.length > 0 ? (
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
                        Tidak ada film yang ditemukan
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                        {debouncedQuery
                            ? `Tidak ada film yang cocok dengan kata kunci "${debouncedQuery}". Coba kata kunci lain.`
                            : "Tidak ada film pada filter yang Anda pilih."}
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            handleClearSearch();
                            setSelectedGenreId(0);
                        }}
                        className="mt-4 rounded-full border border-border/80 bg-card px-4 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
                    >
                        Tampilkan Semua Film
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
