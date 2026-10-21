import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getMovieCredits, getMovieDetails, getMovieRecommendations } from "@/lib/tmdb";
import { parseEntityId, getMovieUrl } from "@/lib/slug";
import MovieDetailView from "@/components/movie/movie-detail-view";
import type { Metadata } from "next";

type PageProps = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const numericId = parseEntityId(id);
    const movie = await getMovieDetails(numericId);

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
    const numericId = parseEntityId(id);
    const [movie, recommendations, cast] = await Promise.all([
        getMovieDetails(numericId),
        getMovieRecommendations(numericId),
        getMovieCredits(numericId),
    ]);

    if (!movie) {
        notFound();
    }

    // Auto-redirect if URL doesn't have the movie slug (e.g. visited /movie/1927 instead of /movie/1927-hulk)
    const canonicalUrl = getMovieUrl(movie.id, movie.title);
    const expectedParam = canonicalUrl.replace("/movie/", "");
    if (decodeURIComponent(id) !== expectedParam) {
        redirect(canonicalUrl);
    }

    return (
        <MovieDetailView
            movie={movie}
            recommendations={recommendations}
            cast={cast}
        />
    );
}

function MovieDetailSkeleton() {
    return (
        <div className="min-h-screen bg-background px-4 py-16 sm:px-8">
            <div className="mx-auto max-w-6xl animate-pulse space-y-8">
                <div className="h-8 w-32 rounded-full bg-muted" />
                <div className="flex flex-col gap-8 md:flex-row md:items-end">
                    <div className="aspect-[2/3] w-48 rounded-2xl bg-muted sm:w-60" />
                    <div className="flex-1 space-y-4">
                        <div className="h-4 w-1/4 rounded bg-muted" />
                        <div className="h-10 w-3/4 rounded bg-muted" />
                        <div className="h-5 w-1/3 rounded bg-muted" />
                        <div className="h-12 w-48 rounded-full bg-muted" />
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
