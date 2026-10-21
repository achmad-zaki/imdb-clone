import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getTVCredits, getTVDetails, getTVRecommendations } from "@/lib/tmdb";
import { parseEntityId, getTvUrl } from "@/lib/slug";
import TVDetailView from "@/components/tv/tv-detail-view";
import type { Metadata } from "next";

type PageProps = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const numericId = parseEntityId(id);
    const tv = await getTVDetails(numericId);

    if (!tv) {
        return {
            title: "Serial TV Tidak Ditemukan — CINEVA",
        };
    }

    return {
        title: `${tv.name} — TV Series & Trailer | CINEVA`,
        description: tv.overview || `Informasi lengkap dan trailer resmi serial TV ${tv.name}`,
    };
}

async function TVDetailContent({ idPromise }: { idPromise: Promise<{ id: string }> }) {
    const { id } = await idPromise;
    const numericId = parseEntityId(id);
    const [tv, recommendations, cast] = await Promise.all([
        getTVDetails(numericId),
        getTVRecommendations(numericId),
        getTVCredits(numericId),
    ]);

    if (!tv) {
        notFound();
    }

    // Auto-redirect if URL doesn't have the tv series slug (e.g. visited /tv/1399 instead of /tv/1399-game-of-thrones)
    const canonicalUrl = getTvUrl(tv.id, tv.name);
    const expectedParam = canonicalUrl.replace("/tv/", "");
    if (decodeURIComponent(id) !== expectedParam) {
        redirect(canonicalUrl);
    }

    return (
        <TVDetailView
            tv={tv}
            recommendations={recommendations}
            cast={cast}
        />
    );
}

function TVDetailSkeleton() {
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

export default function TVDetailPage({ params }: PageProps) {
    return (
        <Suspense fallback={<TVDetailSkeleton />}>
            <TVDetailContent idPromise={params} />
        </Suspense>
    );
}
