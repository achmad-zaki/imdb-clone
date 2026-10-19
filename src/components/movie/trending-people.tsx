"use client";

import { useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Person } from "@/types/person";
import { getProfileUrl } from "@/lib/tmdb-images";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

type TrendingPeopleProps = {
    people: Person[];
};

export default function TrendingPeople({ people }: TrendingPeopleProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Filter specifically for movie cast / actors
    const actors = useMemo(() => {
        if (!people || people.length === 0) return [];
        const filtered = people.filter(
            (p) => !p.known_for_department || p.known_for_department === "Acting"
        );
        return filtered.length > 0 ? filtered : people;
    }, [people]);

    if (!actors || actors.length === 0) return null;

    const handleScroll = (direction: "left" | "right") => {
        if (!scrollContainerRef.current) return;
        const scrollAmount = 360;
        scrollContainerRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    return (
        <section id="trending-people" className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-8">
            {/* Header: | Trending People */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="h-6 w-1 rounded-full bg-primary" />
                        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                            Trending Celebrities
                        </h2>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground pl-3.5">
                        Top trending actors and actresses in cinema this week
                    </p>
                </div>

                {/* Carousel Navigation Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                        type="button"
                        onClick={() => handleScroll("left")}
                        aria-label="Scroll left"
                        className="flex size-8 items-center justify-center rounded-full border border-border/80 bg-card text-muted-foreground transition hover:border-primary/50 hover:bg-muted hover:text-foreground active:scale-95"
                    >
                        <FaChevronLeft className="size-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleScroll("right")}
                        aria-label="Scroll right"
                        className="flex size-8 items-center justify-center rounded-full border border-border/80 bg-card text-muted-foreground transition hover:border-primary/50 hover:bg-muted hover:text-foreground active:scale-95"
                    >
                        <FaChevronRight className="size-3.5" />
                    </button>
                </div>
            </div>

            {/* People Circular Avatars with Hover Opacity Name */}
            <div
                ref={scrollContainerRef}
                className="mt-6 flex items-center gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth"
            >
                {actors.map((person, index) => {
                    const knownFor =
                        person.known_for && person.known_for.length > 0
                            ? person.known_for[0]
                            : null;
                    const knownForTitle = knownFor ? knownFor.title || knownFor.name : null;
                    const targetMovieId = knownFor?.id;

                    const Content = (
                        <div className="group relative size-28 sm:size-32 md:size-36 shrink-0 cursor-pointer rounded-full overflow-hidden border-2 border-border/70 shadow-sm transition-colors duration-300 hover:border-primary">
                            {/* Profile Image (rounded-full) */}
                            <Image
                                src={getProfileUrl(person.profile_path, "w185")}
                                alt={person.name}
                                fill
                                sizes="(max-width: 640px) 112px, (max-width: 768px) 128px, 144px"
                                className="object-cover rounded-full"
                            />

                            {/* Rank Badge (hidden when hovered) */}
                            <span className="absolute top-2 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white shadow-xs transition-opacity duration-200 group-hover:opacity-0">
                                #{index + 1}
                            </span>

                            {/* Hover Overlay with Opacity revealing Name */}
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-full bg-black/80 px-2.5 text-center opacity-0 backdrop-blur-xs transition-opacity duration-300 group-hover:opacity-100">
                                <span className="text-[10px] font-bold text-primary">
                                    #{index + 1}
                                </span>
                                <h3 className="mt-0.5 text-xs sm:text-sm font-bold text-white line-clamp-2 leading-tight drop-shadow-sm">
                                    {person.name}
                                </h3>
                                <span className="mt-1 text-[9px] sm:text-[10px] font-medium text-zinc-300">
                                    Actor / Actress
                                </span>
                                {knownForTitle && (
                                    <p className="mt-0.5 max-w-[90%] truncate text-[8px] sm:text-[9px] text-zinc-400">
                                        {knownForTitle}
                                    </p>
                                )}
                            </div>
                        </div>
                    );

                    return targetMovieId ? (
                        <Link
                            key={person.id}
                            href={`/movie/${targetMovieId}`}
                            title={`${person.name} — Click to view: ${knownForTitle}`}
                            className="shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                            {Content}
                        </Link>
                    ) : (
                        <div key={person.id} className="shrink-0" title={person.name}>
                            {Content}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
