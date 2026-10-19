"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Movie } from "@/types/movie";
import { getBackdropUrl, getPosterUrl } from "@/lib/tmdb-images";
import { GENRE_MAP } from "@/lib/tmdb";
import { RiFireFill, RiInformationLine, RiPlayFill, RiStarFill } from "@remixicon/react";

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
        <section className="relative min-h-[500px] w-full overflow-hidden bg-zinc-950 sm:min-h-[580px] lg:min-h-[640px]">
            {/* Backdrop Image with Multi-directional Gradient Masks */}
            <div className="absolute inset-0 z-0">
                <Image
                    key={activeMovie.id}
                    src={getBackdropUrl(activeMovie.backdrop_path)}
                    alt={`Latar belakang ${activeMovie.title}`}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center transition-opacity duration-700 ease-in-out"
                />

                {/* Dark Minimalist Vignette Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent sm:w-3/4" />
                <div className="absolute inset-0 bg-zinc-950/30 backdrop-blur-[1px]" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 mx-auto flex h-full min-h-[500px] max-w-7xl flex-col justify-end px-4 pb-12 pt-28 sm:min-h-[580px] sm:px-8 sm:pb-16 lg:min-h-[640px]">
                <div className="max-w-2xl">
                    {/* Badge */}
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400 backdrop-blur-md">
                        <RiFireFill className="size-3.5 fill-amber-400" />
                        <span>Sedang Tren #{activeIndex + 1}</span>
                    </div>

                    {/* Movie Title */}
                    <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                        {activeMovie.title}
                    </h1>

                    {/* Meta info & genres */}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-300">
                        <span className="flex items-center gap-1 font-semibold text-amber-400">
                            <RiStarFill className="size-4 fill-amber-400" />
                            {rating}
                        </span>
                        {year && (
                            <>
                                <span className="text-zinc-600">•</span>
                                <span className="text-zinc-400">{year}</span>
                            </>
                        )}
                        {genres.length > 0 && (
                            <>
                                <span className="text-zinc-600">•</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {genres.map((g) => (
                                        <span
                                            key={g}
                                            className="rounded-md border border-zinc-700/60 bg-zinc-900/60 px-2 py-0.5 text-xs font-normal text-zinc-300 backdrop-blur-sm"
                                        >
                                            {g}
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Overview */}
                    <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
                        {activeMovie.overview || "Sinopsis film belum tersedia."}
                    </p>

                    {/* Action CTAs */}
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => onPlayTrailer(activeMovie)}
                            className="group inline-flex items-center gap-2.5 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-white/10 transition-all duration-200 hover:scale-105 hover:bg-zinc-100 active:scale-95"
                        >
                            <span className="flex size-6 items-center justify-center rounded-full bg-zinc-950 text-white transition-transform group-hover:scale-110">
                                <RiPlayFill className="size-3.5 fill-white" />
                            </span>
                            <span>Tonton Trailer</span>
                        </button>

                        <Link
                            href={`/movie/${activeMovie.id}`}
                            className="inline-flex items-center gap-2 rounded-full border border-zinc-700/80 bg-zinc-900/80 px-5 py-3 text-sm font-medium text-zinc-200 backdrop-blur-md transition-all duration-200 hover:border-zinc-500 hover:bg-zinc-800 hover:text-white"
                        >
                            <RiInformationLine className="size-4 text-zinc-400" />
                            <span>Detail Film</span>
                        </Link>
                    </div>
                </div>

                {/* Thumbnail Switcher for Featured Movies */}
                <div className="mt-8 flex items-center justify-between gap-4 border-t border-zinc-800/60 pt-4 sm:mt-12">
                    <span className="text-xs font-medium text-zinc-500">Pilihan Sorotan:</span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {featured.map((movie, idx) => {
                            const isSelected = idx === activeIndex;
                            return (
                                <button
                                    key={movie.id}
                                    onClick={() => setActiveIndex(idx)}
                                    className={`group relative flex shrink-0 items-center gap-2 rounded-lg border p-1 text-left transition-all duration-200 ${
                                        isSelected
                                            ? "border-amber-400/80 bg-zinc-900 shadow-md ring-1 ring-amber-400/40"
                                            : "border-zinc-800/80 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/80"
                                    }`}
                                    title={movie.title}
                                >
                                    <div className="relative h-10 w-7 overflow-hidden rounded bg-zinc-800">
                                        <Image
                                            src={getPosterUrl(movie.poster_path, "w92")}
                                            alt={movie.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="hidden pr-2 sm:block">
                                        <p className="max-w-[100px] truncate text-xs font-medium text-zinc-200">
                                            {movie.title}
                                        </p>
                                        <p className="text-[10px] text-zinc-500">
                                            ★ {movie.vote_average.toFixed(1)}
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
