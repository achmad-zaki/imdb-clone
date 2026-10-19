"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Movie, MovieDetail } from "@/types/movie";
import { getBackdropUrl, getPosterUrl } from "@/lib/tmdb-images";
import MovieCard from "@/components/movie/movie-card";
import TrailerModal from "@/components/movie/trailer-modal";
import {
    RiArrowLeftLine,
    RiCalendarLine,
    RiFilmLine,
    RiPlayFill,
    RiStarFill,
    RiTimeLine,
} from "@remixicon/react";

type MovieDetailViewProps = {
    movie: MovieDetail;
    recommendations: Movie[];
};

export default function MovieDetailView({ movie, recommendations }: MovieDetailViewProps) {
    const [trailerMovie, setTrailerMovie] = useState<Movie | null>(null);

    const year = movie.release_date ? movie.release_date.slice(0, 4) : "";
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "—";

    const formatRuntime = (minutes?: number) => {
        if (!minutes || minutes <= 0) return null;
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hrs > 0 ? `${hrs}j ${mins}m` : `${mins}m`;
    };

    return (
        <div className="relative min-h-screen bg-zinc-950 text-zinc-100">
            {/* Cinematic Backdrop Hero */}
            <div className="relative min-h-[460px] w-full overflow-hidden sm:min-h-[520px]">
                <Image
                    src={getBackdropUrl(movie.backdrop_path)}
                    alt={movie.title}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-top opacity-35"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/30" />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/60 to-transparent" />

                {/* Back navigation */}
                <div className="relative z-10 mx-auto max-w-7xl px-4 pt-6 sm:px-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs font-medium text-zinc-300 backdrop-blur-md transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                    >
                        <RiArrowLeftLine className="size-4" />
                        <span>Kembali ke Beranda</span>
                    </Link>
                </div>

                {/* Main Movie Info Layout */}
                <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-8">
                    <div className="flex flex-col gap-8 md:flex-row md:items-end">
                        {/* Poster */}
                        <div className="relative aspect-[2/3] w-48 shrink-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl sm:w-60">
                            <Image
                                src={getPosterUrl(movie.poster_path)}
                                alt={`Poster ${movie.title}`}
                                fill
                                sizes="(max-width: 640px) 192px, 240px"
                                className="object-cover"
                                priority
                            />
                        </div>

                        {/* Title & Metadata */}
                        <div className="flex flex-col max-w-3xl">
                            {movie.tagline && (
                                <p className="text-xs font-medium uppercase tracking-wider text-amber-400/90">
                                    &ldquo;{movie.tagline}&rdquo;
                                </p>
                            )}

                            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                                {movie.title}
                            </h1>

                            {/* Meta pills */}
                            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                                <div className="flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 font-semibold text-amber-400">
                                    <RiStarFill className="size-3.5 fill-amber-400" />
                                    <span>{rating}</span>
                                    {movie.vote_count ? (
                                        <span className="text-[11px] font-normal text-amber-300/70">
                                            ({movie.vote_count.toLocaleString("id-ID")})
                                        </span>
                                    ) : null}
                                </div>

                                {year && (
                                    <div className="flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-zinc-300">
                                        <RiCalendarLine className="size-3.5 text-zinc-500" />
                                        <span>{year}</span>
                                    </div>
                                )}

                                {formatRuntime(movie.runtime) && (
                                    <div className="flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-zinc-300">
                                        <RiTimeLine className="size-3.5 text-zinc-500" />
                                        <span>{formatRuntime(movie.runtime)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Genre tags */}
                            {movie.genres && movie.genres.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {movie.genres.map((g) => (
                                        <span
                                            key={g.id}
                                            className="rounded-md border border-zinc-800 bg-zinc-900/80 px-2.5 py-0.5 text-xs text-zinc-300"
                                        >
                                            {g.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Watch Trailer CTA */}
                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setTrailerMovie(movie)}
                                    className="group inline-flex items-center gap-2.5 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-950 shadow-xl transition-all duration-200 hover:scale-105 hover:bg-zinc-100 active:scale-95"
                                >
                                    <span className="flex size-6 items-center justify-center rounded-full bg-zinc-950 text-white transition-transform group-hover:scale-110">
                                        <RiPlayFill className="size-3.5 fill-white" />
                                    </span>
                                    <span>Tonton Trailer Resmi</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Synopsis & Details Section */}
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                    {/* Synopsis */}
                    <div className="lg:col-span-2">
                        <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                            Sinopsis
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base">
                            {movie.overview || "Sinopsis untuk film ini belum tersedia."}
                        </p>
                    </div>

                    {/* Metadata Card */}
                    <div className="rounded-2xl border border-zinc-850 bg-zinc-900/40 p-6 backdrop-blur-sm">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            Informasi Tambahan
                        </h3>
                        <dl className="mt-4 space-y-3 text-xs">
                            <div className="flex justify-between border-b border-zinc-850 pb-2">
                                <dt className="text-zinc-500">Judul Asli</dt>
                                <dd className="font-medium text-zinc-200 text-right">{movie.original_title || movie.title}</dd>
                            </div>
                            <div className="flex justify-between border-b border-zinc-850 pb-2">
                                <dt className="text-zinc-500">Status</dt>
                                <dd className="font-medium text-zinc-200">{movie.status || "Released"}</dd>
                            </div>
                            <div className="flex justify-between border-b border-zinc-850 pb-2">
                                <dt className="text-zinc-500">Bahasa Asli</dt>
                                <dd className="font-medium text-zinc-200 uppercase">{movie.original_language || "en"}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-zinc-500">Tanggal Rilis</dt>
                                <dd className="font-medium text-zinc-200">{movie.release_date || "—"}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Recommendations */}
                {recommendations.length > 0 && (
                    <div className="mt-16 border-t border-zinc-900 pt-12">
                        <div className="flex items-center gap-2">
                            <RiFilmLine className="size-5 text-amber-400" />
                            <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                                Rekomendasi Film Terkait
                            </h2>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                            {recommendations.slice(0, 12).map((rec) => (
                                <MovieCard
                                    key={rec.id}
                                    movie={rec}
                                    onPlayTrailer={(m) => setTrailerMovie(m)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Trailer Modal */}
            <TrailerModal
                movie={trailerMovie}
                isOpen={!!trailerMovie}
                onClose={() => setTrailerMovie(null)}
            />
        </div>
    );
}
