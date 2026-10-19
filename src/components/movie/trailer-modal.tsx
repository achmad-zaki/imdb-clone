"use client";

import { useEffect, useState } from "react";
import { Movie, Video } from "@/types/movie";
import { RiCloseLine, RiFilmLine, RiPlayFill, RiStarFill } from "@remixicon/react";

type TrailerModalProps = {
    movie: Movie | null;
    isOpen: boolean;
    onClose: () => void;
};

export default function TrailerModal({ movie, isOpen, onClose }: TrailerModalProps) {
    const [videos, setVideos] = useState<Video[]>([]);
    const [activeVideo, setActiveVideo] = useState<Video | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch trailers when movie changes or modal opens
    useEffect(() => {
        if (!isOpen || !movie) return;

        let isCancelled = false;

        const fetchVideos = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const res = await fetch(`/api/trailer?movieId=${movie.id}`);
                if (!res.ok) throw new Error("Failed to load trailer");
                const data = await res.json();
                if (isCancelled) return;
                const vids: Video[] = data.videos || [];
                setVideos(vids);
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

    // Handle Escape key to close modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
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
    }, [isOpen, onClose]);

    if (!isOpen || !movie) return null;

    const releaseYear = movie.release_date ? movie.release_date.slice(0, 4) : "";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
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
            <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl border border-border/80 bg-card text-card-foreground shadow-2xl transition-all duration-300">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
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

                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        aria-label="Close trailer modal"
                    >
                        <RiCloseLine className="size-5" />
                    </button>
                </div>

                {/* Video Player Box */}
                <div className="relative aspect-video w-full bg-black">
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

                {/* Multiple Video Selection Pills */}
                {videos.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto border-t border-border/60 bg-muted/20 px-5 py-3 no-scrollbar">
                        <span className="shrink-0 text-xs font-medium text-muted-foreground">Videos:</span>
                        {videos.map((vid) => {
                            const isCurrent = activeVideo?.id === vid.id;
                            return (
                                <button
                                    key={vid.id}
                                    onClick={() => setActiveVideo(vid)}
                                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors ${
                                        isCurrent
                                            ? "bg-primary font-semibold text-primary-foreground shadow-xs"
                                            : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                                    }`}
                                >
                                    <RiPlayFill className="size-3" />
                                    <span className="max-w-[150px] truncate">{vid.type}: {vid.name}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Synopsis / Info Footer */}
                {movie.overview && (
                    <div className="border-t border-border/60 bg-muted/30 px-5 py-3">
                        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                            {movie.overview}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
