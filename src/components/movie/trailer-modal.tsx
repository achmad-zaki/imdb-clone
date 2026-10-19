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
                if (!res.ok) throw new Error("Gagal memuat trailer");
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
                            : "Gagal memuat trailer",
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
            <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl transition-all duration-300">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-850 px-5 py-4">
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-amber-400">
                            <RiFilmLine className="size-4" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="truncate text-base font-medium text-zinc-100 sm:text-lg">
                                {movie.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                                {releaseYear && <span>{releaseYear}</span>}
                                <span>•</span>
                                <span className="flex items-center gap-1 text-amber-400">
                                    <RiStarFill className="size-3" />
                                    {movie.vote_average.toFixed(1)}
                                </span>
                                {activeVideo && (
                                    <>
                                        <span>•</span>
                                        <span className="truncate text-zinc-400">{activeVideo.name}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                        aria-label="Tutup modal trailer"
                    >
                        <RiCloseLine className="size-5" />
                    </button>
                </div>

                {/* Video Player Box */}
                <div className="relative aspect-video w-full bg-black">
                    {isLoading ? (
                        <div className="flex h-full w-full flex-col items-center justify-center space-y-3 text-zinc-400">
                            <div className="size-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
                            <p className="text-sm font-light tracking-wide text-zinc-400">Memuat trailer...</p>
                        </div>
                    ) : error ? (
                        <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
                            <p className="text-sm text-red-400">{error}</p>
                            <p className="mt-1 text-xs text-zinc-500">Silakan coba beberapa saat lagi</p>
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
                        <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-zinc-400">
                            <RiFilmLine className="mb-2 size-10 text-zinc-600" />
                            <p className="text-sm font-medium text-zinc-300">Trailer Tidak Tersedia</p>
                            <p className="mt-1 max-w-sm text-xs text-zinc-500">
                                Maaf, trailer resmi untuk film &ldquo;{movie.title}&rdquo; belum tersedia di TMDB.
                            </p>
                        </div>
                    )}
                </div>

                {/* Multiple Video Selection Pills (if more than 1 trailer/clip) */}
                {videos.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto border-t border-zinc-850 px-5 py-3">
                        <span className="shrink-0 text-xs font-medium text-zinc-500">Pilihan Video:</span>
                        {videos.map((vid) => {
                            const isCurrent = activeVideo?.id === vid.id;
                            return (
                                <button
                                    key={vid.id}
                                    onClick={() => setActiveVideo(vid)}
                                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors ${
                                        isCurrent
                                            ? "bg-zinc-100 font-medium text-zinc-950 shadow"
                                            : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
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
                    <div className="border-t border-zinc-850/60 bg-zinc-950/80 px-5 py-3">
                        <p className="line-clamp-2 text-xs leading-relaxed text-zinc-400">
                            {movie.overview}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
