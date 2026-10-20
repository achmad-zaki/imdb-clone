import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPersonDetails } from "@/lib/tmdb";
import { parseEntityId } from "@/lib/slug";
import PersonDetailView from "@/components/person/person-detail-view";
import type { Metadata } from "next";

type PageProps = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const numericId = parseEntityId(id);
    const person = await getPersonDetails(numericId);

    if (!person) {
        return {
            title: "Person Not Found — CINEVA",
        };
    }

    return {
        title: `${person.name} — Biography & Filmography | CINEVA`,
        description: person.biography
            ? person.biography.slice(0, 160)
            : `Discover ${person.name}'s biography, filmography, and movies on CINEVA.`,
    };
}

async function PersonDetailContent({ idPromise }: { idPromise: Promise<{ id: string }> }) {
    const { id } = await idPromise;
    const numericId = parseEntityId(id);
    const person = await getPersonDetails(numericId);

    if (!person) {
        notFound();
    }

    return <PersonDetailView person={person} />;
}

function PersonDetailSkeleton() {
    return (
        <div className="min-h-screen bg-background px-4 py-16 sm:px-8">
            <div className="mx-auto max-w-6xl animate-pulse space-y-8">
                <div className="h-8 w-32 rounded-full bg-muted" />
                <div className="flex flex-col gap-8 md:flex-row md:items-start">
                    <div className="aspect-[2/3] w-48 sm:w-64 rounded-2xl bg-muted" />
                    <div className="flex-1 space-y-4">
                        <div className="h-5 w-24 rounded-full bg-muted" />
                        <div className="h-12 w-3/4 rounded-lg bg-muted" />
                        <div className="flex gap-2">
                            <div className="h-6 w-32 rounded-md bg-muted" />
                            <div className="h-6 w-32 rounded-md bg-muted" />
                        </div>
                        <div className="h-28 w-full rounded-xl bg-muted" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PersonDetailPage({ params }: PageProps) {
    return (
        <Suspense fallback={<PersonDetailSkeleton />}>
            <PersonDetailContent idPromise={params} />
        </Suspense>
    );
}
