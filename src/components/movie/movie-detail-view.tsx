"use client";

import MovieCard from "@/components/movie/movie-card";
import TrailerModal from "@/components/movie/trailer-modal";
import { formatDate } from "@/lib/date";
import { getBackdropUrl, getPosterUrl, getProfileUrl } from "@/lib/tmdb-images";
import { getPersonUrl } from "@/lib/slug";
import { CastMember, Movie, MovieDetail } from "@/types/movie";
import { Button } from "@/components/ui/button";
import {
    RiArrowLeftSLine,
    RiArrowRightSLine,
    RiCalendarLine,
    RiFilmLine,
    RiPlayFill,
    RiStarFill,
    RiTimeLine,
    RiUser3Line,
} from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

type MovieDetailViewProps = {
    movie: MovieDetail;
    recommendations: Movie[];
    cast?: CastMember[];
};

export default function MovieDetailView({ movie, recommendations, cast }: MovieDetailViewProps) {
    const [trailerMovie, setTrailerMovie] = useState<Movie | null>(null);
    const [backdropError, setBackdropError] = useState(false);
    const [prevBackdropPath, setPrevBackdropPath] = useState(movie.backdrop_path);
    if (movie.backdrop_path !== prevBackdropPath) {
        setPrevBackdropPath(movie.backdrop_path);
        setBackdropError(false);
    }

    const [posterError, setPosterError] = useState(false);
    const [prevPosterPath, setPrevPosterPath] = useState(movie.poster_path);
    if (movie.poster_path !== prevPosterPath) {
        setPrevPosterPath(movie.poster_path);
        setPosterError(false);
    }

    const backdropSrc = backdropError ? "/images/not-found.png" : getBackdropUrl(movie.backdrop_path);
    const posterSrc = posterError ? "/images/not-found.png" : getPosterUrl(movie.poster_path);
    const castScrollRef = useRef<HTMLDivElement>(null);

    const handleScrollCast = (direction: "left" | "right") => {
        if (!castScrollRef.current) return;
        const scrollAmount = 320;
        castScrollRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    const year = movie.release_date ? movie.release_date.slice(0, 4) : "";
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "—";

    const formatRuntime = (minutes?: number) => {
        if (!minutes || minutes <= 0) return null;
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    };

    return (
        <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Cinematic Backdrop Hero */}
            <div className="relative min-h-[460px] w-full overflow-hidden sm:min-h-[520px]">
                <Image
                    src={backdropSrc}
                    alt={movie.title}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-top opacity-35 dark:opacity-50"
                    onError={() => setBackdropError(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent sm:w-3/4" />

                {/* Main Movie Info Layout */}
                <div className="relative z-10 mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-8">
                    {/* Breadcrumb Navigation */}
                    <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-foreground transition-colors">
                            Home
                        </Link>
                        <span>/</span>
                        <Link href="/movies" className="hover:text-foreground transition-colors">
                            Movies
                        </Link>
                        <span>/</span>
                        <span className="truncate max-w-[200px] sm:max-w-md font-medium text-foreground">
                            {movie.title}
                        </span>
                    </nav>

                    <div className="flex flex-col gap-8 md:flex-row md:items-end">
                        {/* Poster */}
                        <div className="relative aspect-[2/3] w-48 shrink-0 overflow-hidden rounded-2xl border border-border/80 bg-muted shadow-2xl sm:w-60">
                            <Image
                                src={posterSrc}
                                alt={`Poster for ${movie.title}`}
                                fill
                                sizes="(max-width: 640px) 192px, 240px"
                                className="object-cover"
                                priority
                                onError={() => setPosterError(true)}
                            />
                        </div>

                        {/* Title & Metadata */}
                        <div className="flex flex-col max-w-3xl">
                            {movie.tagline && (
                                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                                    &ldquo;{movie.tagline}&rdquo;
                                </p>
                            )}

                            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                                {movie.title}
                            </h1>

                            {/* Meta pills */}
                            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                                <div className="flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                                    <RiStarFill className="size-3.5 fill-current" />
                                    <span>{rating}</span>
                                    {movie.vote_count ? (
                                        <span className="text-[11px] font-normal opacity-80">
                                            ({movie.vote_count.toLocaleString("en-US")})
                                        </span>
                                    ) : null}
                                </div>

                                {year && (
                                    <div className="flex items-center gap-1 rounded-md border border-border/60 bg-muted/60 px-2.5 py-1 text-muted-foreground font-medium">
                                        <RiCalendarLine className="size-3.5" />
                                        <span>{year}</span>
                                    </div>
                                )}

                                {formatRuntime(movie.runtime) && (
                                    <div className="flex items-center gap-1 rounded-md border border-border/60 bg-muted/60 px-2.5 py-1 text-muted-foreground font-medium">
                                        <RiTimeLine className="size-3.5" />
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
                                            className="rounded-md border border-border/60 bg-muted/80 px-2.5 py-0.5 text-xs font-medium text-foreground"
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
                                    className="group inline-flex items-center gap-2.5 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
                                >
                                    <span className="flex size-6 items-center justify-center rounded-full bg-primary-foreground text-primary transition-transform group-hover:scale-110">
                                        <RiPlayFill className="size-3.5 fill-current" />
                                    </span>
                                    <span>Watch Official Trailer</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Synopsis & Details Section */}
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                    {/* Synopsis */}
                    <div className="lg:col-span-2">
                        <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                            Storyline
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                            {movie.overview || "Storyline for this movie is currently not available."}
                        </p>
                    </div>

                    {/* Metadata Card */}
                    <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Movie Details
                        </h3>
                        <dl className="mt-4 space-y-3 text-xs">
                            <div className="flex justify-between border-b border-border/60 pb-2">
                                <dt className="text-muted-foreground">Original Title</dt>
                                <dd className="font-semibold text-foreground text-right">{movie.original_title || movie.title}</dd>
                            </div>
                            <div className="flex justify-between border-b border-border/60 pb-2">
                                <dt className="text-muted-foreground">Status</dt>
                                <dd className="font-semibold text-foreground">{movie.status || "Released"}</dd>
                            </div>
                            <div className="flex justify-between border-b border-border/60 pb-2">
                                <dt className="text-muted-foreground">Original Language</dt>
                                <dd className="font-semibold text-foreground uppercase">{movie.original_language || "en"}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">Release Date</dt>
                                <dd className="font-semibold text-foreground">{formatDate(movie.release_date) || "—"}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Top Cast Section */}
                {cast && cast.length > 0 && (
                    <div className="mt-14 border-t border-border/60 pt-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <RiUser3Line className="size-5 text-primary" />
                                <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                                    Top Cast
                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground font-medium hidden sm:inline mr-1">
                                    {cast.length} Pemeran
                                </span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleScrollCast("left")}
                                    aria-label="Previous cast"
                                    title="Pemeran sebelumnya"
                                >
                                    <RiArrowLeftSLine className="size-5" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleScrollCast("right")}
                                    aria-label="Next cast"
                                    title="Pemeran berikutnya"
                                >
                                    <RiArrowRightSLine className="size-5" />
                                </Button>
                            </div>
                        </div>

                        <div
                            ref={castScrollRef}
                            className="mt-6 flex items-start gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
                        >
                            {cast.slice(0, 20).map((actor) => (
                                <Link
                                    key={actor.id}
                                    href={getPersonUrl(actor.id, actor.name)}
                                    className="group flex w-24 sm:w-28 shrink-0 flex-col items-center text-center"
                                >
                                    <div className="relative size-20 sm:size-24 rounded-full overflow-hidden border-2 border-border/70 shadow-sm transition-colors duration-300 group-hover:border-primary bg-muted">
                                        <Image
                                            src={getProfileUrl(actor.profile_path, "w185")}
                                            alt={actor.name}
                                            fill
                                            sizes="(max-width: 640px) 80px, 96px"
                                            className="object-cover"
                                        />
                                    </div>
                                    <h3 className="mt-2.5 w-full truncate text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                        {actor.name}
                                    </h3>
                                    <p className="mt-0.5 w-full truncate text-[11px] text-muted-foreground">
                                        {actor.character || "Cast"}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommendations */}
                {recommendations.length > 0 && (
                    <div className="mt-16 border-t border-border/60 pt-12">
                        <div className="flex items-center gap-2">
                            <RiFilmLine className="size-5 text-primary" />
                            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                                More Like This
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
