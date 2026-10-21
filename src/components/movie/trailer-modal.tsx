"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CastMember, Movie, Video } from "@/types/movie";
import { MediaCardItem } from "@/components/movie/movie-card";
import { Button } from "@/components/ui/button";
import { getProfileUrl } from "@/lib/tmdb-images";
import { getPersonUrl } from "@/lib/slug";
import {
    RiArrowLeftSLine,
    RiArrowRightSLine,
    RiCloseLine,
    RiFilmLine,
    RiPlayFill,
    RiStarFill,
    RiUser3Line,
} from "@remixicon/react";

type TrailerModalProps = {
    movie: MediaCardItem | Movie | null;
    isOpen: boolean;
    onClose: () => void;
};

export default function TrailerModal({ movie, isOpen, onClose }: TrailerModalProps) {
    const [videos, setVideos] = useState<Video[]>([]);
    const [activeVideo, setActiveVideo] = useState<Video | null>(null);
    const [cast, setCast] = useState<CastMember[]>([]);
    const [activeTab, setActiveTab] = useState<"overview" | "cast">("overview");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const castScrollRef = useRef<HTMLDivElement>(null);
    const handleScrollCast = (direction: "left" | "right") => {
        if (!castScrollRef.current) return;
        const scrollAmount = 240;
        castScrollRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    const currentIndex = videos.findIndex((v) => v.id === activeVideo?.id);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex >= 0 && currentIndex < videos.length - 1;

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setActiveVideo(videos[currentIndex - 1]);
        }
    }, [currentIndex, videos]);

    const handleNext = useCallback(() => {
        if (currentIndex >= 0 && currentIndex < videos.length - 1) {
            setActiveVideo(videos[currentIndex + 1]);
        }
    }, [currentIndex, videos]);

    // Auto-scroll active pill into view when activeVideo changes
    const activeVideoId = activeVideo?.id;
    useEffect(() => {
        if (!activeVideoId) return;
        const activeEl = document.getElementById(`trailer-pill-${activeVideoId}`);
        if (activeEl) {
            activeEl.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center",
            });
        }
    }, [activeVideoId]);

    // Fetch trailers when movie changes or modal opens
    useEffect(() => {
        if (!isOpen || !movie) return;

        let isCancelled = false;

        const fetchVideos = async () => {
            setIsLoading(true);
            setError(null);
            setActiveTab("overview");

            try {
                const typeParam = (movie as { media_type?: string })?.media_type
                    ? `&type=${(movie as { media_type?: string }).media_type}`
                    : "";
                const res = await fetch(`/api/trailer?movieId=${movie.id}${typeParam}`);
                if (!res.ok) throw new Error("Failed to load trailer");
                const data = await res.json();
                if (isCancelled) return;
                const vids: Video[] = data.videos || [];
                setVideos(vids);
                setCast(data.cast || []);
                if (vids.length > 0) {
                    const trailer =
                        vids.find((v) => v.type === "Trailer" && v.official) ||
                        vids.find((v) => v.type === "Trailer") ||
                        vids[0];
                    setActiveVideo(trailer);
                } else {
                    setActiveVideo(null);
                }
            } catch (err: unknown) {
                if (!isCancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load trailer",
                    );
                }
            } finally {
                if (!isCancelled) setIsLoading(false);
            }
        };

        void fetchVideos();

        return () => {
            isCancelled = true;
        };
    }, [isOpen, movie]);

    // Handle Escape key and Arrow navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            } else if (e.key === "ArrowLeft") {
                if (
                    document.activeElement?.tagName !== "INPUT" &&
                    document.activeElement?.tagName !== "TEXTAREA"
                ) {
                    handlePrev();
                }
            } else if (e.key === "ArrowRight") {
                if (
                    document.activeElement?.tagName !== "INPUT" &&
                    document.activeElement?.tagName !== "TEXTAREA"
                ) {
                    handleNext();
                }
            }
        };

        if (isOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleKeyDown);
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose, handlePrev, handleNext]);

    if (!isOpen || !movie) return null;

    const releaseYear = movie.release_date ? movie.release_date.slice(0, 4) : "";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-2 sm:p-4 md:p-6"
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Container */}
            <div className="relative z-10 my-auto flex max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border/80 bg-card text-card-foreground shadow-2xl transition-all duration-300">
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-4 py-3 sm:px-5 sm:py-3.5">
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <RiFilmLine className="size-4" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="truncate text-base font-semibold text-foreground sm:text-lg">
                                {movie.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {releaseYear && <span>{releaseYear}</span>}
                                <span>•</span>
                                <span className="flex items-center gap-1 font-semibold text-amber-500">
                                    <RiStarFill className="size-3 fill-amber-500" />
                                    {movie.vote_average.toFixed(1)}
                                </span>
                                {activeVideo && (
                                    <>
                                        <span>•</span>
                                        <span className="truncate text-muted-foreground">{activeVideo.name}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        aria-label="Close trailer modal"
                    >
                        <RiCloseLine className="size-5" />
                    </Button>
                </div>

                {/* Video Player Box */}
                <div className="relative flex w-full shrink min-h-0 items-center justify-center bg-black">
                    <div
                        className="relative aspect-video w-full"
                        style={{
                            maxHeight: "min(500px, 52vh)",
                            width: "min(100%, calc(min(500px, 52vh) * 16 / 9))",
                        }}
                    >
                        {isLoading ? (
                            <div className="flex h-full w-full flex-col items-center justify-center space-y-3 text-muted-foreground">
                                <div className="size-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                                <p className="text-sm font-light tracking-wide text-muted-foreground">Loading trailer...</p>
                            </div>
                        ) : error ? (
                            <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
                                <p className="text-sm text-destructive">{error}</p>
                                <p className="mt-1 text-xs text-muted-foreground">Please try again later</p>
                            </div>
                        ) : activeVideo ? (
                            <iframe
                                key={activeVideo.key}
                                src={`https://www.youtube-nocookie.com/embed/${activeVideo.key}?autoplay=1&rel=0&modestbranding=1`}
                                title={activeVideo.name}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="h-full w-full border-0"
                            />
                        ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-muted-foreground">
                                <RiFilmLine className="mb-2 size-10 opacity-60" />
                                <p className="text-sm font-semibold text-foreground">Trailer Not Available</p>
                                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                                    Sorry, official trailer for &ldquo;{movie.title}&rdquo; is currently not available on TMDB.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Multiple Video Selection Bar */}
                {videos.length > 1 && (
                    <div className="flex shrink-0 items-center gap-2 border-t border-border/60 bg-muted/20 px-3 py-2 sm:px-5">
                        {/* Prev Button */}
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handlePrev}
                            disabled={!hasPrev}
                            title="Video sebelumnya"
                            aria-label="Previous video"
                        >
                            <RiArrowLeftSLine className="size-5" />
                        </Button>

                        {/* Video Pills List */}
                        <div className="flex flex-1 items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar scroll-smooth">
                            {videos.map((vid) => {
                                const isCurrent = activeVideo?.id === vid.id;
                                return (
                                    <button
                                        id={`trailer-pill-${vid.id}`}
                                        key={vid.id}
                                        onClick={() => setActiveVideo(vid)}
                                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-all ${
                                            isCurrent
                                                ? "bg-primary font-semibold text-primary-foreground shadow-xs ring-2 ring-primary/30"
                                                : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`}
                                        aria-current={isCurrent ? "true" : undefined}
                                    >
                                        <RiPlayFill className="size-3 shrink-0" />
                                        <span className="max-w-[130px] truncate sm:max-w-[180px] md:max-w-[220px]">
                                            {vid.type}: {vid.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Next Button */}
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleNext}
                            disabled={!hasNext}
                            title="Video berikutnya"
                            aria-label="Next video"
                        >
                            <RiArrowRightSLine className="size-5" />
                        </Button>

                        {/* Counter */}
                        <div className="hidden shrink-0 text-xs font-medium text-muted-foreground tabular-nums sm:block pl-1">
                            {currentIndex >= 0 ? currentIndex + 1 : 1}/{videos.length}
                        </div>
                    </div>
                )}

                {/* Synopsis / Cast Footer */}
                {(movie.overview || cast.length > 0) && (
                    <div className="shrink-0 border-t border-border/60 bg-muted/30 px-4 py-2.5 sm:px-5">
                        <div className="flex items-center gap-4 mb-1.5">
                            {movie.overview && (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("overview")}
                                    className={`text-xs font-semibold pb-0.5 border-b-2 transition-colors ${
                                        activeTab === "overview"
                                            ? "border-primary text-foreground"
                                            : "border-transparent text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    Sinopsis
                                </button>
                            )}
                            {cast.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("cast")}
                                    className={`inline-flex items-center gap-1.5 text-xs font-semibold pb-0.5 border-b-2 transition-colors ${
                                        activeTab === "cast"
                                            ? "border-primary text-foreground"
                                            : "border-transparent text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <RiUser3Line className="size-3.5" />
                                    <span>Pemeran ({cast.length})</span>
                                </button>
                            )}
                        </div>

                        {activeTab === "overview" && movie.overview ? (
                            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                {movie.overview}
                            </p>
                        ) : (
                            <div className="flex items-center gap-1.5">
                                {cast.length > 3 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="size-7 shrink-0"
                                        onClick={() => handleScrollCast("left")}
                                        aria-label="Previous cast"
                                        title="Pemeran sebelumnya"
                                    >
                                        <RiArrowLeftSLine className="size-4" />
                                    </Button>
                                )}
                                <div
                                    ref={castScrollRef}
                                    className="flex flex-1 items-center gap-2 overflow-x-auto py-0.5 no-scrollbar scroll-smooth"
                                >
                                    {cast.map((actor) => (
                                        <Link
                                            key={actor.id}
                                            href={getPersonUrl(actor.id, actor.name)}
                                            className="group inline-flex items-center gap-2 shrink-0 rounded-lg border border-border/50 bg-background/60 px-2 py-1 transition-colors hover:border-primary/50 hover:bg-background"
                                            title={`${actor.name} (${actor.character})`}
                                        >
                                            <div className="relative size-6 shrink-0 rounded-full overflow-hidden border border-border bg-muted">
                                                <Image
                                                    src={getProfileUrl(actor.profile_path, "w185")}
                                                    alt={actor.name}
                                                    fill
                                                    sizes="24px"
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="text-left text-xs min-w-0">
                                                <p className="font-semibold text-foreground truncate max-w-[110px] group-hover:text-primary transition-colors">
                                                    {actor.name}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground truncate max-w-[110px]">
                                                    {actor.character || "Cast"}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                {cast.length > 3 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="size-7 shrink-0"
                                        onClick={() => handleScrollCast("right")}
                                        aria-label="Next cast"
                                        title="Pemeran berikutnya"
                                    >
                                        <RiArrowRightSLine className="size-4" />
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
