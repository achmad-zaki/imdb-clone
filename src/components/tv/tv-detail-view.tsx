"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TVDetail, TVShow } from "@/types/tv";
import { CastMember, Movie } from "@/types/movie";
import MovieCard from "@/components/movie/movie-card";
import TrailerModal from "@/components/movie/trailer-modal";
import { getBackdropUrl, getPosterUrl, getProfileUrl } from "@/lib/tmdb-images";
import { getPersonUrl } from "@/lib/slug";
import { formatDate } from "@/lib/date";
import { Button } from "@/components/ui/button";
import {
    RiArrowLeftSLine,
    RiArrowRightSLine,
    RiCalendarLine,
    RiFilmLine,
    RiPlayFill,
    RiStarFill,
    RiTvLine,
    RiStackLine,
    RiBroadcastLine,
    RiUser3Line,
} from "@remixicon/react";

type TVDetailViewProps = {
    tv: TVDetail;
    recommendations: TVShow[];
    cast?: CastMember[];
};

export default function TVDetailView({ tv, recommendations, cast }: TVDetailViewProps) {
    const [trailerMovie, setTrailerMovie] = useState<Movie | null>(null);
    const castScrollRef = useRef<HTMLDivElement>(null);

    const handleScrollCast = (direction: "left" | "right") => {
        if (!castScrollRef.current) return;
        const scrollAmount = 320;
        castScrollRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    // Adapt TV show to Movie interface for trailer modal
    const handlePlayTrailer = () => {
        setTrailerMovie({
            id: tv.id,
            title: tv.name,
            overview: tv.overview,
            poster_path: tv.poster_path,
            backdrop_path: tv.backdrop_path,
            release_date: tv.first_air_date,
            vote_average: tv.vote_average,
        });
    };

    const firstYear = tv.first_air_date ? tv.first_air_date.slice(0, 4) : "";
    const lastYear = tv.last_air_date ? tv.last_air_date.slice(0, 4) : "";
    const yearsDisplay = firstYear
        ? tv.status === "Returning Series"
            ? `${firstYear}–present`
            : lastYear && lastYear !== firstYear
                ? `${firstYear}–${lastYear}`
                : firstYear
        : "";

    // Adapt recommendations to MovieCard items
    const recommendedItems = recommendations.map((r) => ({
        id: r.id,
        title: r.name,
        overview: r.overview,
        poster_path: r.poster_path,
        backdrop_path: r.backdrop_path,
        release_date: r.first_air_date,
        vote_average: r.vote_average,
        vote_count: r.vote_count,
        genre_ids: r.genre_ids,
        media_type: "tv" as const,
    }));

    return (
        <div className="relative min-h-screen bg-background text-foreground pb-20">
            {/* Hero Backdrop Section */}
            <div className="relative min-h-[460px] w-full overflow-hidden bg-muted sm:min-h-[540px]">
                <Image
                    src={getBackdropUrl(tv.backdrop_path)}
                    alt={tv.name}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-top opacity-35 dark:opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent sm:w-3/4" />

                {/* Main TV Info Layout */}
                <div className="relative z-10 mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-8">
                    {/* Breadcrumb Navigation */}
                    <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-foreground transition-colors">
                            Home
                        </Link>
                        <span>/</span>
                        <Link href="/tv" className="hover:text-foreground transition-colors">
                            TV Series
                        </Link>
                        <span>/</span>
                        <span className="truncate max-w-[200px] sm:max-w-md font-medium text-foreground">
                            {tv.name}
                        </span>
                    </nav>

                    <div className="flex flex-col gap-8 md:flex-row md:items-end">
                        {/* Poster */}
                        <div className="relative aspect-[2/3] w-48 shrink-0 overflow-hidden rounded-2xl border border-border/80 bg-muted shadow-2xl sm:w-60">
                            <Image
                                src={getPosterUrl(tv.poster_path)}
                                alt={`Poster for ${tv.name}`}
                                fill
                                priority
                                sizes="(max-width: 640px) 192px, 240px"
                                className="object-cover"
                            />
                        </div>

                        {/* Title & Meta Details */}
                        <div className="flex-1 space-y-4">
                            {/* Badges row */}
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-md bg-primary/90 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-xs">
                                    <RiTvLine className="size-3.5" />
                                    <span>TV Series</span>
                                </span>

                                <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-semibold ${
                                    tv.status === "Returning Series"
                                        ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                                        : "bg-muted text-muted-foreground border border-border/70"
                                }`}>
                                    <span className={`size-1.5 rounded-full ${tv.status === "Returning Series" ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
                                    <span>{tv.status || "TV Series"}</span>
                                </span>
                            </div>

                            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                                {tv.name}
                            </h1>

                            {tv.tagline && (
                                <p className="text-sm italic text-muted-foreground sm:text-base">
                                    &ldquo;{tv.tagline}&rdquo;
                                </p>
                            )}

                            {/* Meta pills */}
                            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                                    <RiStarFill className="size-4 fill-amber-400" />
                                    <span className="text-foreground">{tv.vote_average ? tv.vote_average.toFixed(1) : "—"}</span>
                                    {tv.vote_count ? (
                                        <span className="text-xs font-normal text-muted-foreground">
                                            ({tv.vote_count.toLocaleString()} votes)
                                        </span>
                                    ) : null}
                                </div>

                                {yearsDisplay && (
                                    <div className="flex items-center gap-1 rounded-md border border-border/60 bg-muted/60 px-2.5 py-1 text-muted-foreground font-medium">
                                        <RiCalendarLine className="size-3.5" />
                                        <span>{yearsDisplay}</span>
                                    </div>
                                )}

                                {tv.number_of_seasons > 0 && (
                                    <div className="flex items-center gap-1 rounded-md border border-border/60 bg-muted/60 px-2.5 py-1 text-muted-foreground font-medium">
                                        <RiStackLine className="size-3.5" />
                                        <span>
                                            {tv.number_of_seasons} {tv.number_of_seasons === 1 ? "Season" : "Seasons"}
                                            {tv.number_of_episodes > 0 ? ` • ${tv.number_of_episodes} Ep` : ""}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Genre tags */}
                            {tv.genres && tv.genres.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {tv.genres.map((g) => (
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
                                    onClick={handlePlayTrailer}
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
                            Series Storyline
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                            {tv.overview || "Storyline for this TV series is currently not available."}
                        </p>

                        {/* Seasons Overview */}
                        {tv.seasons && tv.seasons.length > 0 && (
                            <div className="mt-10">
                                <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                                    <RiStackLine className="size-5 text-primary" />
                                    <h3 className="text-base font-semibold text-foreground sm:text-lg">
                                        Seasons ({tv.seasons.length})
                                    </h3>
                                </div>

                                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {tv.seasons.map((season) => (
                                        <div
                                            key={season.id}
                                            className="flex gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-xs transition hover:border-primary/40"
                                        >
                                            <div className="relative aspect-[2/3] w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                                                <Image
                                                    src={getPosterUrl(season.poster_path || tv.poster_path, "w185")}
                                                    alt={season.name}
                                                    fill
                                                    sizes="56px"
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs font-semibold text-foreground">
                                                    {season.name}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                                    {season.episode_count} Episodes
                                                    {season.air_date ? ` • ${season.air_date.slice(0, 4)}` : ""}
                                                </p>
                                                {season.overview && (
                                                    <p className="line-clamp-2 text-[11px] text-muted-foreground/80 mt-1">
                                                        {season.overview}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Metadata Card */}
                    <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs h-fit">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Series Information
                        </h3>
                        <dl className="mt-4 space-y-3 text-xs">
                            <div className="flex justify-between border-b border-border/60 pb-2">
                                <dt className="text-muted-foreground">Original Name</dt>
                                <dd className="font-semibold text-foreground text-right">{tv.original_name || tv.name}</dd>
                            </div>
                            <div className="flex justify-between border-b border-border/60 pb-2">
                                <dt className="text-muted-foreground">Status</dt>
                                <dd className="font-semibold text-foreground">{tv.status || "Released"}</dd>
                            </div>
                            <div className="flex justify-between border-b border-border/60 pb-2">
                                <dt className="text-muted-foreground">First Air Date</dt>
                                <dd className="font-semibold text-foreground">{formatDate(tv.first_air_date) || "—"}</dd>
                            </div>
                            {tv.last_air_date && (
                                <div className="flex justify-between border-b border-border/60 pb-2">
                                    <dt className="text-muted-foreground">Last Air Date</dt>
                                    <dd className="font-semibold text-foreground">{formatDate(tv.last_air_date)}</dd>
                                </div>
                            )}
                            <div className="flex justify-between border-b border-border/60 pb-2">
                                <dt className="text-muted-foreground">Total Seasons</dt>
                                <dd className="font-semibold text-foreground">{tv.number_of_seasons}</dd>
                            </div>
                            <div className="flex justify-between border-b border-border/60 pb-2">
                                <dt className="text-muted-foreground">Total Episodes</dt>
                                <dd className="font-semibold text-foreground">{tv.number_of_episodes}</dd>
                            </div>
                            {tv.networks && tv.networks.length > 0 && (
                                <div className="flex justify-between pt-1">
                                    <dt className="text-muted-foreground flex items-center gap-1">
                                        <RiBroadcastLine className="size-3.5" />
                                        <span>Network</span>
                                    </dt>
                                    <dd className="font-semibold text-foreground text-right">
                                        {tv.networks.map((n) => n.name).join(", ")}
                                    </dd>
                                </div>
                            )}
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
                {recommendedItems.length > 0 && (
                    <div className="mt-16 border-t border-border/60 pt-12">
                        <div className="flex items-center gap-2">
                            <RiFilmLine className="size-5 text-primary" />
                            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                                More Like This
                            </h2>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                            {recommendedItems.slice(0, 12).map((rec) => (
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
