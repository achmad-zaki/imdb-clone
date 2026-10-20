import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getMovieDetails, getMovieRecommendations } from "@/lib/tmdb";
import MovieDetailView from "@/components/movie/movie-detail-view";
import type { Metadata } from "next";

type PageProps = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const movie = await getMovieDetails(id);

    if (!movie) {
        return {
            title: "Film Tidak Ditemukan — CINEVA",
        };
    }

    return {
        title: `${movie.title} — Detail & Trailer | CINEVA`,
        description: movie.overview || `Informasi lengkap dan trailer resmi film ${movie.title}`,
    };
}

async function MovieDetailContent({ idPromise }: { idPromise: Promise<{ id: string }> }) {
    const { id } = await idPromise;
    const [movie, recommendations] = await Promise.all([
        getMovieDetails(id),
        getMovieRecommendations(id),
    ]);

    if (!movie) {
        notFound();
    }

    return <MovieDetailView movie={movie} recommendations={recommendations} />;
}

function MovieDetailSkeleton() {
    return (
        <div className="min-h-screen bg-zinc-950 px-4 py-16 sm:px-8">
            <div className="mx-auto max-w-6xl animate-pulse space-y-8">
                <div className="h-8 w-32 rounded-full bg-zinc-900" />
                <div className="flex flex-col gap-8 md:flex-row md:items-end">
                    <div className="aspect-[2/3] w-48 rounded-2xl bg-zinc-900 sm:w-60" />
                    <div className="flex-1 space-y-4">
                        <div className="h-4 w-1/4 rounded bg-zinc-900" />
                        <div className="h-10 w-3/4 rounded bg-zinc-850" />
                        <div className="h-5 w-1/3 rounded bg-zinc-900" />
                        <div className="h-12 w-48 rounded-full bg-zinc-800" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MovieDetailPage({ params }: PageProps) {
    return (
        <Suspense fallback={<MovieDetailSkeleton />}>
            <MovieDetailContent idPromise={params} />
        </Suspense>
    );
}
