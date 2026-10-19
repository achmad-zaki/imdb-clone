"use client";

import { useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Person } from "@/types/person";
import { getProfileUrl } from "@/lib/tmdb-images";
import { getPersonUrl } from "@/lib/slug";
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
        <section id="popular-people" className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-8">
            {/* Header: | Popular People */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="h-6 w-1 rounded-full bg-primary" />
                        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                            Popular People
                        </h2>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground pl-3.5">
                        Most popular actors, actresses, and creators in cinema today
                    </p>
                </div>

                {/* Carousel Navigation Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                        type="button"
                        onClick={() => handleScroll("left")}
                        aria-label="Scroll left"
                        className="flex size-8 items-center justify-center rounded-full border border-border/80 bg-card text-muted-foreground transition hover:border-primary/50 hover:bg-muted hover:text-foreground active:scale-95 outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0"
                    >
                        <FaChevronLeft className="size-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleScroll("right")}
                        aria-label="Scroll right"
                        className="flex size-8 items-center justify-center rounded-full border border-border/80 bg-card text-muted-foreground transition hover:border-primary/50 hover:bg-muted hover:text-foreground active:scale-95 outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0"
                    >
                        <FaChevronRight className="size-3.5" />
                    </button>
                </div>
            </div>

            {/* People Circular Avatars with Name and Actor / Actress Below */}
            <div
                ref={scrollContainerRef}
                className="mt-6 flex items-start gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth"
            >
                {actors.map((person, index) => {
                    return (
                        <Link
                            key={person.id}
                            href={getPersonUrl(person.id, person.name)}
                            title={`${person.name} — Click to view biography & filmography`}
                            className="group flex w-28 sm:w-32 md:w-36 shrink-0 flex-col items-center rounded-2xl p-1 outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 active:ring-0 select-none"
                        >
                            {/* Circular Image Container */}
                            <div className="relative size-24 sm:size-28 md:size-32 shrink-0 cursor-pointer rounded-full overflow-hidden border-2 border-border/70 shadow-sm transition-all duration-300 group-hover:border-primary group-hover:shadow-md outline-none ring-0">
                                <Image
                                    src={getProfileUrl(person.profile_path, "w185")}
                                    alt={person.name}
                                    fill
                                    sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 128px"
                                    className="object-cover rounded-full"
                                />

                                {/* Rank Badge */}
                                <span className="absolute top-1.5 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                                    #{index + 1}
                                </span>

                                {/* Gentle, subtle hover tint (not too dark) */}
                                <div className="absolute inset-0 z-20 rounded-full bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            </div>

                            {/* Name & Actor / Actress Below Image */}
                            <div className="mt-2.5 flex w-full flex-col items-center px-1 text-center">
                                <h3 className="w-full truncate text-xs sm:text-sm font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                                    {person.name}
                                </h3>
                                <span className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                                    Actor / Actress
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
