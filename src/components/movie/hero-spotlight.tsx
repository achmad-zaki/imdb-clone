"use client";

import { GENRE_MAP } from "@/lib/tmdb";
import { getBackdropUrl, getPosterUrl } from "@/lib/tmdb-images";
import { Movie } from "@/types/movie";
import { RiFireFill, RiInformationLine, RiPlayFill, RiStarFill } from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FaStar } from "react-icons/fa";
import { getMovieUrl } from "@/lib/slug";

type HeroSpotlightProps = {
    movies: Movie[];
    onPlayTrailer: (movie: Movie) => void;
};

export default function HeroSpotlight({ movies, onPlayTrailer }: HeroSpotlightProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    if (!movies || movies.length === 0) return null;

    const featured = movies.slice(0, 5);
    const activeMovie = featured[activeIndex] || featured[0];

    const year = activeMovie.release_date ? activeMovie.release_date.slice(0, 4) : "";
    const rating = activeMovie.vote_average ? activeMovie.vote_average.toFixed(1) : "—";
    const genres = (activeMovie.genre_ids || [])
        .map((id) => GENRE_MAP[id])
        .filter(Boolean)
        .slice(0, 3);

    return (
        <section className="relative min-h-[500px] w-full max-w-full min-w-0 overflow-hidden bg-background sm:min-h-[580px] lg:min-h-[640px] transition-colors duration-300">
            {/* Backdrop Image with Multi-directional Gradient Masks */}
            <div className="absolute inset-0 z-0">
                <Image
                    key={activeMovie.id}
                    src={getBackdropUrl(activeMovie.backdrop_path)}
                    alt={`Latar belakang ${activeMovie.title}`}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center transition-opacity duration-700 ease-in-out opacity-40 dark:opacity-60"
                />

                {/* Theme-Adaptive Vignette Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent sm:w-3/4" />
                <div className="absolute inset-0 bg-background/10 backdrop-blur-[1px]" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 mx-auto flex h-full min-h-[500px] w-full max-w-6xl min-w-0 flex-col justify-end px-4 pb-12 pt-28 sm:min-h-[580px] sm:px-8 sm:pb-16 lg:min-h-[640px]">
                <div className="max-w-2xl">
                    {/* Badge */}
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-md shadow-xs">
                        <RiFireFill className="size-3.5 fill-current" />
                        <span>Trending #{activeIndex + 1}</span>
                    </div>

                    {/* Movie Title */}
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                        {activeMovie.title}
                    </h1>

                    {/* Meta info & genres */}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1 font-semibold text-amber-500">
                            <RiStarFill className="size-4 fill-amber-500" />
                            {rating}
                        </span>
                        {year && (
                            <>
                                <span>•</span>
                                <span>{year}</span>
                            </>
                        )}
                        {genres.length > 0 && (
                            <>
                                <span>•</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {genres.map((g) => (
                                        <span
                                            key={g}
                                            className="rounded-md border border-border/60 bg-muted/60 px-2 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm"
                                        >
                                            {g}
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Overview */}
                    <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {activeMovie.overview || "Overview is currently not available."}
                    </p>

                    {/* Action CTAs */}
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => onPlayTrailer(activeMovie)}
                            className="group inline-flex items-center gap-2.5 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                            <span className="flex size-6 items-center justify-center rounded-full bg-primary-foreground text-primary transition-transform group-hover:scale-110">
                                <RiPlayFill className="size-3.5 fill-current" />
                            </span>
                            <span>Watch Trailer</span>
                        </button>

                        <Link
                            href={getMovieUrl(activeMovie.id, activeMovie.title)}
                            className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-5 py-3 text-sm font-medium text-foreground backdrop-blur-md transition-all duration-200 hover:bg-muted"
                        >
                            <RiInformationLine className="size-4 text-muted-foreground" />
                            <span>Movie Details</span>
                        </Link>
                    </div>
                </div>

                {/* Thumbnail Switcher for Featured Movies */}
                <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 border-t border-border/60 pt-4 sm:mt-12 w-full min-w-0">
                    <span className="text-xs font-medium text-muted-foreground shrink-0">Featured Spotlight:</span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar min-w-0 w-full flex-1 -mx-4 px-4 sm:mx-0 sm:px-0">
                        {featured.map((movie, idx) => {
                            const isSelected = idx === activeIndex;
                            return (
                                <button
                                    key={movie.id}
                                    onClick={() => setActiveIndex(idx)}
                                    className={`group relative flex shrink-0 items-center gap-2 rounded-xl border p-1 text-left transition-all duration-200 ${isSelected
                                            ? "border-primary bg-card shadow-md ring-1 ring-primary/40"
                                            : "border-border/60 bg-card/60 hover:border-border hover:bg-card"
                                        }`}
                                    title={movie.title}
                                >
                                    <div className="relative h-10 w-7 overflow-hidden rounded-lg bg-muted">
                                        <Image
                                            src={getPosterUrl(movie.poster_path, "w92")}
                                            alt={movie.title}
                                            fill
                                            sizes="28px"
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="hidden pr-2 sm:block">
                                        <p className="max-w-[100px] truncate text-xs font-semibold text-foreground">
                                            {movie.title}
                                        </p>
                                        <p className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                                            <FaStar className="size-2.5 text-amber-500 fill-amber-500 shrink-0" />
                                            <span>{movie.vote_average.toFixed(1)}</span>
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
