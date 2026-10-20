"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PersonDetail, PersonMovieCredit } from "@/types/person";
import { Movie } from "@/types/movie";
import { getPosterUrl, getProfileUrl } from "@/lib/tmdb-images";
import TrailerModal from "@/components/movie/trailer-modal";
import {
    RiArrowLeftLine,
    RiCake2Line,
    RiCalendarLine,
    RiExternalLinkLine,
    RiFilmLine,
    RiMapPin2Line,
    RiPlayFill,
    RiStarFill,
    RiUserStarLine,
} from "@remixicon/react";
import { FaStar } from "react-icons/fa";
import { formatDate } from "@/lib/date";
import { getMovieUrl } from "@/lib/slug";

type PersonDetailViewProps = {
    person: PersonDetail;
};

export default function PersonDetailView({ person }: PersonDetailViewProps) {
    const [trailerMovie, setTrailerMovie] = useState<Movie | null>(null);
    const [isBioExpanded, setIsBioExpanded] = useState(false);
    const [filterCategory, setFilterCategory] = useState<"all" | "acting" | "crew">("acting");

    // Deduplicate and process movies
    const { castMovies, crewMovies } = useMemo(() => {
        const rawCast = person.movie_credits?.cast || [];
        const rawCrew = person.movie_credits?.crew || [];

        // Deduplicate cast by ID, keeping the one with release date or higher popularity
        const castMap = new Map<number, PersonMovieCredit>();
        for (const movie of rawCast) {
            if (!movie.id || !movie.title) continue;
            if (!castMap.has(movie.id)) {
                castMap.set(movie.id, movie);
            } else {
                const existing = castMap.get(movie.id)!;
                if ((movie.popularity || 0) > (existing.popularity || 0)) {
                    castMap.set(movie.id, movie);
                }
            }
        }

        // Sort cast by release date descending, with undated movies at the end
        const sortedCast = Array.from(castMap.values()).sort((a, b) => {
            if (!a.release_date) return 1;
            if (!b.release_date) return -1;
            return b.release_date.localeCompare(a.release_date);
        });

        // Deduplicate crew
        const crewMap = new Map<number, (typeof rawCrew)[0]>();
        for (const movie of rawCrew) {
            if (!movie.id || !movie.title) continue;
            if (!crewMap.has(movie.id)) {
                crewMap.set(movie.id, movie);
            }
        }
        const sortedCrew = Array.from(crewMap.values()).sort((a, b) => {
            if (!a.release_date) return 1;
            if (!b.release_date) return -1;
            return b.release_date.localeCompare(a.release_date);
        });

        return {
            castMovies: sortedCast,
            crewMovies: sortedCrew,
        };
    }, [person.movie_credits]);

    // Top most famous works based on popularity
    const topKnownFor = useMemo(() => {
        return [...castMovies]
            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
            .slice(0, 6);
    }, [castMovies]);

    // Calculate age if birthday is available
    const age = useMemo(() => {
        if (!person.birthday) return null;
        const birthDate = new Date(person.birthday);
        const endDate = person.deathday ? new Date(person.deathday) : new Date();
        let calculatedAge = endDate.getFullYear() - birthDate.getFullYear();
        const m = endDate.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && endDate.getDate() < birthDate.getDate())) {
            calculatedAge--;
        }
        return calculatedAge;
    }, [person.birthday, person.deathday]);

    const activeMovies = filterCategory === "crew" ? crewMovies : castMovies;

    return (
        <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Top Navigation Bar */}
            <div className="relative z-10 mx-auto max-w-6xl px-4 pt-6 sm:px-8">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-4 py-2 text-xs font-semibold text-foreground backdrop-blur-md transition hover:bg-muted"
                >
                    <RiArrowLeftLine className="size-4" />
                    <span>Back to Home</span>
                </Link>
            </div>

            {/* Profile Hero Header */}
            <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-8">
                <div className="flex flex-col gap-8 md:flex-row md:items-start">
                    {/* Portrait Photo */}
                    <div className="relative aspect-[2/3] w-48 sm:w-64 shrink-0 overflow-hidden rounded-2xl border-2 border-border/80 bg-muted shadow-2xl mx-auto md:mx-0">
                        <Image
                            src={getProfileUrl(person.profile_path, "h632")}
                            alt={person.name}
                            fill
                            priority
                            sizes="(max-width: 640px) 192px, 256px"
                            className="object-cover"
                        />
                    </div>

                    {/* Person Information */}
                    <div className="flex flex-1 flex-col">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                <RiUserStarLine className="size-3.5" />
                                <span>{person.known_for_department || "Acting"}</span>
                            </span>
                            {person.popularity ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                    <RiStarFill className="size-3 text-amber-500 fill-amber-500" />
                                    <span>Popularity: {person.popularity.toFixed(1)}</span>
                                </span>
                            ) : null}
                        </div>

                        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                            {person.name}
                        </h1>

                        {/* Quick Personal Info Badges */}
                        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                            {person.birthday && (
                                <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/50 px-2.5 py-1 text-xs font-medium">
                                    <RiCake2Line className="size-3.5 text-primary" />
                                    <span>
                                        Born: {formatDate(person.birthday)}
                                        {age !== null && !person.deathday && ` (Age ${age})`}
                                    </span>
                                </div>
                            )}

                            {person.deathday && (
                                <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/50 px-2.5 py-1 text-xs font-medium text-zinc-400">
                                    <RiCalendarLine className="size-3.5" />
                                    <span>Died: {formatDate(person.deathday)} (Age {age})</span>
                                </div>
                            )}

                            {person.place_of_birth && (
                                <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/50 px-2.5 py-1 text-xs font-medium">
                                    <RiMapPin2Line className="size-3.5 text-primary" />
                                    <span>{person.place_of_birth}</span>
                                </div>
                            )}

                            {person.imdb_id && (
                                <a
                                    href={`https://www.imdb.com/name/${person.imdb_id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-500 hover:bg-amber-500/20 transition-colors"
                                >
                                    <span>IMDb Profile</span>
                                    <RiExternalLinkLine className="size-3" />
                                </a>
                            )}
                        </div>

                        {/* Biography Section */}
                        <div className="mt-6 border-t border-border/60 pt-6">
                            <h2 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                                Biography
                            </h2>
                            {person.biography ? (
                                <div className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    <p
                                        className={
                                            isBioExpanded
                                                ? "whitespace-pre-line"
                                                : "line-clamp-4 whitespace-pre-line"
                                        }
                                    >
                                        {person.biography}
                                    </p>
                                    {person.biography.length > 300 && (
                                        <button
                                            type="button"
                                            onClick={() => setIsBioExpanded(!isBioExpanded)}
                                            className="mt-2 text-xs font-semibold text-primary underline underline-offset-4 hover:opacity-80 transition"
                                        >
                                            {isBioExpanded ? "Show Less" : "Read Full Biography"}
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <p className="mt-2 text-sm italic text-muted-foreground">
                                    Biography is not available for this person yet.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Known For Highlights */}
            {topKnownFor.length > 0 && (
                <section className="mx-auto max-w-6xl px-4 py-8 sm:px-8 border-t border-border/60">
                    <div className="flex items-center gap-2.5 mb-6">
                        <div className="h-6 w-1 rounded-full bg-primary" />
                        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                            Known For
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {topKnownFor.map((movie) => {
                            const year = movie.release_date ? movie.release_date.slice(0, 4) : "";
                            const movieUrl = getMovieUrl(movie.id, movie.title);
                            return (
                                <div
                                    key={movie.id}
                                    className="group relative flex flex-col rounded-xl border border-border/60 bg-card p-2 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1"
                                >
                                    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted">
                                        <Link
                                            href={movieUrl}
                                            className="absolute inset-0 z-0"
                                            aria-label={`View details for ${movie.title}`}
                                        />
                                        <Image
                                            src={getPosterUrl(movie.poster_path, "w342")}
                                            alt={movie.title}
                                            fill
                                            sizes="(max-width: 640px) 50vw, 200px"
                                            className="object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none"
                                        />
                                        {movie.vote_average ? (
                                            <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 backdrop-blur-xs">
                                                <FaStar className="size-2.5 fill-amber-400" />
                                                <span className="text-white">{movie.vote_average.toFixed(1)}</span>
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="mt-2 flex flex-col px-1">
                                        <Link
                                            href={movieUrl}
                                            className="line-clamp-1 text-xs font-semibold text-foreground transition-colors hover:text-primary"
                                            title={movie.title}
                                        >
                                            {movie.title}
                                        </Link>
                                        {movie.character && (
                                            <p className="line-clamp-1 text-[11px] text-muted-foreground mt-0.5">
                                                as {movie.character}
                                            </p>
                                        )}
                                        {year && (
                                            <span className="text-[10px] text-muted-foreground/80 mt-0.5">
                                                {year}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Complete Filmography Section */}
            <section className="mx-auto max-w-6xl px-4 py-8 sm:px-8 border-t border-border/60">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div className="flex items-center gap-2.5">
                        <div className="h-6 w-1 rounded-full bg-primary" />
                        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                            Filmography
                        </h2>
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                            {activeMovies.length} titles
                        </span>
                    </div>

                    {/* Filter Tabs if actor also has crew credits */}
                    {crewMovies.length > 0 && (
                        <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 p-1 text-xs">
                            <button
                                type="button"
                                onClick={() => setFilterCategory("acting")}
                                className={`rounded-full px-3 py-1 font-medium transition-all ${
                                    filterCategory === "acting"
                                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                Acting ({castMovies.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilterCategory("crew")}
                                className={`rounded-full px-3 py-1 font-medium transition-all ${
                                    filterCategory === "crew"
                                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                Production / Crew ({crewMovies.length})
                            </button>
                        </div>
                    )}
                </div>

                {/* Filmography Table / List */}
                {activeMovies.length > 0 ? (
                    <div className="divide-y divide-border/50 rounded-2xl border border-border/70 bg-card overflow-hidden">
                        {activeMovies.map((movie) => {
                            const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";
                            const role =
                                "character" in movie
                                    ? (movie as PersonMovieCredit).character
                                    : "job" in movie
                                      ? (movie as { job?: string }).job
                                      : "";

                            return (
                                <div
                                    key={`${movie.id}-${role}`}
                                    className="group flex items-center justify-between gap-4 p-3.5 sm:px-5 transition-colors hover:bg-muted/40"
                                >
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        {/* Thumbnail */}
                                        <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                                            <Image
                                                src={getPosterUrl(movie.poster_path, "w92")}
                                                alt={movie.title}
                                                fill
                                                sizes="40px"
                                                className="object-cover"
                                            />
                                        </div>

                                        {/* Movie Title & Character */}
                                        <div className="min-w-0 flex flex-col">
                                            <Link
                                                href={getMovieUrl(movie.id, movie.title)}
                                                className="truncate text-sm font-semibold text-foreground transition-colors hover:text-primary"
                                                title={movie.title}
                                            >
                                                {movie.title}
                                            </Link>
                                            {role && (
                                                <p className="truncate text-xs text-muted-foreground mt-0.5">
                                                    {"character" in movie ? `as ${role}` : role}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Year & Action */}
                                    <div className="flex shrink-0 items-center gap-3 text-xs">
                                        {movie.vote_average ? (
                                            <span className="hidden sm:flex items-center gap-1 font-medium text-amber-500">
                                                <FaStar className="size-2.5 fill-amber-500" />
                                                <span>{movie.vote_average.toFixed(1)}</span>
                                            </span>
                                        ) : null}

                                        <span className="font-mono text-xs font-medium text-muted-foreground">
                                            {year}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setTrailerMovie({
                                                    id: movie.id,
                                                    title: movie.title,
                                                    overview: ("overview" in movie ? movie.overview : "") || "",
                                                    poster_path: movie.poster_path,
                                                    backdrop_path: ("backdrop_path" in movie ? movie.backdrop_path : null) || null,
                                                    release_date: movie.release_date,
                                                    vote_average: movie.vote_average,
                                                })
                                            }
                                            className="flex size-7 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                                            title="Watch Trailer"
                                            aria-label={`Watch trailer for ${movie.title}`}
                                        >
                                            <RiPlayFill className="size-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-12 text-center text-muted-foreground">
                        <RiFilmLine className="size-10 mx-auto opacity-50 mb-2" />
                        <p className="text-sm font-semibold text-foreground">No movies found</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            No film credits found for this category.
                        </p>
                    </div>
                )}
            </section>

            {/* Trailer Modal */}
            <TrailerModal
                movie={trailerMovie}
                isOpen={!!trailerMovie}
                onClose={() => setTrailerMovie(null)}
            />
        </div>
    );
}
