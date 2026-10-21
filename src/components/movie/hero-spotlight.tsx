"use client";

import { GENRE_MAP } from "@/lib/tmdb";
import { getBackdropUrl } from "@/lib/tmdb-images";
import { getMovieUrl } from "@/lib/slug";
import { Movie } from "@/types/movie";
import { RiFireFill, RiInformationLine, RiPlayFill, RiStarFill } from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type HeroSpotlightProps = {
    movies: Movie[];
    onPlayTrailer: (movie: Movie) => void;
};

export default function HeroSpotlight({ movies, onPlayTrailer }: HeroSpotlightProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [backdropErrors, setBackdropErrors] = useState<Record<number, boolean>>({});

    const featured = movies ? movies.slice(0, 5) : [];
    const featuredLength = featured.length;

    useEffect(() => {
        if (featuredLength <= 1) return;

        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % featuredLength);
        }, 5000);

        return () => clearInterval(interval);
    }, [featuredLength, activeIndex]);

    if (!movies || movies.length === 0) return null;

    const activeMovie = featured[activeIndex] || featured[0];

    const year = activeMovie.release_date ? activeMovie.release_date.slice(0, 4) : "";
    const rating = activeMovie.vote_average ? activeMovie.vote_average.toFixed(1) : "—";
    const genres = (activeMovie.genre_ids || [])
        .map((id) => GENRE_MAP[id])
        .filter(Boolean)
        .slice(0, 3);

    return (
        <section
            className="relative min-h-[500px] w-full max-w-full min-w-0 overflow-hidden bg-background sm:min-h-[580px] lg:min-h-[640px] transition-colors duration-300"
        >
            {/* Backdrop Image with Slow Scale (Ken Burns) and Multi-directional Gradient Masks */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div key={activeMovie.id} className="absolute inset-0 animate-hero-fade">
                    <Image
                        src={backdropErrors[activeMovie.id] ? "/images/not-found.png" : getBackdropUrl(activeMovie.backdrop_path)}
                        alt={`Latar belakang ${activeMovie.title}`}
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover object-center opacity-40 dark:opacity-60 animate-hero-kenburns"
                        onError={() => setBackdropErrors((prev) => ({ ...prev, [activeMovie.id]: true }))}
                    />
                </div>

                {/* Preload other slides' backdrop images for instant switching */}
                <div className="hidden" aria-hidden="true">
                    {featured.map((m) => (
                        <Image
                            key={m.id}
                            src={getBackdropUrl(m.backdrop_path)}
                            alt=""
                            width={1}
                            height={1}
                            priority
                        />
                    ))}
                </div>

                {/* Theme-Adaptive Vignette Gradients */}
                <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-t from-background via-background/75 to-transparent" />
                <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-r from-background/95 via-background/70 to-transparent sm:w-3/4" />
                <div className="absolute inset-0 z-1 pointer-events-none bg-background/10 backdrop-blur-[1px]" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 mx-auto flex h-full min-h-[500px] w-full max-w-6xl min-w-0 flex-col justify-end px-4 pb-10 pt-28 sm:min-h-[580px] sm:px-8 sm:pb-14 lg:min-h-[640px]">
                <div key={activeMovie.id} className="max-w-2xl animate-hero-content">
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

                {/* Centered Pagination Bars */}
                <div
                    className="mt-8 flex w-full items-center justify-center gap-2.5 sm:mt-10"
                    role="tablist"
                    aria-label="Hero Spotlight Pagination"
                >
                    {featured.map((movie, idx) => {
                        const isSelected = idx === activeIndex;
                        return (
                            <button
                                key={movie.id}
                                type="button"
                                role="tab"
                                aria-selected={isSelected}
                                aria-label={`Pilih film: ${movie.title}`}
                                onClick={() => setActiveIndex(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                                    isSelected
                                        ? "w-10 sm:w-12 bg-primary shadow-xs"
                                        : "w-3.5 sm:w-4 bg-foreground/20 dark:bg-white/20 hover:bg-foreground/40 dark:hover:bg-white/40 hover:w-5 sm:hover:w-6"
                                }`}
                            >
                                <span className="sr-only">{movie.title}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
