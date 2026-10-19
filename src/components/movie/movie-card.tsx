"use client";

import { getPosterUrl } from "@/lib/tmdb-images";
import type { Movie } from "@/types/movie";
import { RiPlayFill, RiStarFill } from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";

type MovieCardProps = {
    movie: Movie;
    onPlayTrailer?: (movie: Movie) => void;
};

export default function MovieCard({ movie, onPlayTrailer }: MovieCardProps) {
    const year = movie.release_date
        ? movie.release_date.slice(0, 4)
        : "";

    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "—";

    return (
        <div className="group relative flex flex-col">
            {/* Poster Card Container */}
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900 shadow-sm transition-all duration-300 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/50">
                <Image
                    src={getPosterUrl(movie.poster_path)}
                    alt={`Poster ${movie.title}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    loading="lazy"
                />

                {/* Rating Badge */}
                <div className="absolute left-2.5 top-2.5 z-10 flex items-center gap-1 rounded-md border border-black/20 bg-black/70 px-2 py-0.5 text-xs font-medium text-amber-400 backdrop-blur-md">
                    <RiStarFill className="size-3 fill-amber-400" />
                    <span className="text-zinc-100">{rating}</span>
                </div>

                {/* Hover Overlay with Trailer Quick Action */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-black/90 via-black/40 to-black/20 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
                    {onPlayTrailer && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onPlayTrailer(movie);
                            }}
                            className="group/btn flex items-center gap-2 rounded-full border border-white/20 bg-white/90 px-4 py-2 text-xs font-medium text-zinc-950 shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white active:scale-95"
                            title="Putar Trailer"
                            aria-label={`Putar trailer untuk ${movie.title}`}
                        >
                            <span className="flex size-6 items-center justify-center rounded-full bg-zinc-950 text-white">
                                <RiPlayFill className="size-3.5 fill-white" />
                            </span>
                            <span>Trailer</span>
                        </button>
                    )}

                    <Link
                        href={`/movie/${movie.id}`}
                        className="mt-3 text-[11px] font-medium text-zinc-300 underline-offset-4 transition hover:text-white hover:underline"
                    >
                        Lihat Detail &rarr;
                    </Link>
                </div>
            </div>

            {/* Movie Info */}
            <div className="mt-2.5 flex flex-col px-0.5">
                <Link
                    href={`/movie/${movie.id}`}
                    className="line-clamp-1 text-sm font-medium tracking-tight text-zinc-100 transition hover:text-white"
                    title={movie.title}
                >
                    {movie.title}
                </Link>
                {year && (
                    <span className="text-xs text-zinc-400 mt-0.5">{year}</span>
                )}
            </div>
        </div>
    );
}