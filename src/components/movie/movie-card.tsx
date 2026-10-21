"use client";

import { NOT_FOUND_IMAGE, getPosterUrl } from "@/lib/tmdb-images";
import type { Movie } from "@/types/movie";
import { RiPlayFill, RiStarFill } from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { getMovieUrl, getTvUrl } from "@/lib/slug";

export type MediaCardItem = Movie & {
    media_type?: "movie" | "tv";
};

type MovieCardProps = {
    movie: MediaCardItem;
    onPlayTrailer?: (movie: Movie) => void;
    priority?: boolean;
};

export default function MovieCard({ movie, onPlayTrailer, priority = false }: MovieCardProps) {
    const [hasError, setHasError] = useState(false);
    const [prevPosterPath, setPrevPosterPath] = useState(movie.poster_path);

    if (movie.poster_path !== prevPosterPath) {
        setPrevPosterPath(movie.poster_path);
        setHasError(false);
    }

    const imgSrc = hasError ? NOT_FOUND_IMAGE : getPosterUrl(movie.poster_path);

    const year = movie.release_date
        ? movie.release_date.slice(0, 4)
        : "";

    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "—";
    const isTV = movie.media_type === "tv";
    const movieUrl = isTV
        ? getTvUrl(movie.id, movie.title)
        : getMovieUrl(movie.id, movie.title);

    return (
        <div className="group relative flex flex-col min-w-0 w-full">
            {/* Poster Card Container */}
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-border/70 bg-muted shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5">
                <Link
                    href={movieUrl}
                    className="absolute inset-0 z-0"
                    aria-label={`View details for ${movie.title}`}
                />
                <Image
                    src={imgSrc}
                    alt={`Poster ${movie.title}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 pointer-events-none"
                    priority={priority}
                    loading={priority ? "eager" : "lazy"}
                    onError={() => setHasError(true)}
                />

                {/* Rating Badge */}
                <div className="absolute left-2.5 top-2.5 z-10 flex items-center gap-1 rounded-md border border-black/20 bg-black/75 px-2 py-0.5 text-xs font-semibold text-amber-400 backdrop-blur-md shadow-xs">
                    <RiStarFill className="size-3 fill-amber-400" />
                    <span className="text-white">{rating}</span>
                </div>

                {/* TV Badge */}
                {isTV && (
                    <div className="absolute right-2.5 top-2.5 z-10 flex items-center rounded-md border border-primary/30 bg-primary/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground backdrop-blur-md shadow-xs">
                        TV
                    </div>
                )}

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
                            className="group/btn flex items-center gap-2 rounded-full border border-white/20 bg-white/90 px-4 py-2 text-xs font-semibold text-zinc-950 shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white active:scale-95"
                            title="Watch Trailer"
                            aria-label={`Watch trailer for ${movie.title}`}
                        >
                            <span className="flex size-6 items-center justify-center rounded-full bg-zinc-950 text-white">
                                <RiPlayFill className="size-3.5 fill-white" />
                            </span>
                            <span>Trailer</span>
                        </button>
                    )}

                    <Link
                        href={movieUrl}
                        className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-200 underline-offset-4 transition hover:text-white hover:underline"
                    >
                        <span>View Details</span>
                        <FaArrowRight className="size-2.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>
            </div>

            {/* Movie Info */}
            <div className="mt-2.5 flex flex-col px-0.5">
                <Link
                    href={movieUrl}
                    className="line-clamp-1 text-sm font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
                    title={movie.title}
                >
                    {movie.title}
                </Link>
                {year && (
                    <span className="text-xs text-muted-foreground mt-0.5">{year}</span>
                )}
            </div>
        </div>
    );
}