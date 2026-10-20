"use client";

import { useState } from "react";
import { Movie } from "@/types/movie";
import { Person } from "@/types/person";
import HeroSpotlight from "@/components/movie/hero-spotlight";
import TrendingPeople from "@/components/movie/trending-people";
import MovieExplorer from "@/components/movie/movie-explorer";

type HomeClientProps = {
    trendingMovies: Movie[];
    popularMovies: Movie[];
    trendingPeople: Person[];
};

export default function HomeClient({
    trendingMovies,
    popularMovies,
    trendingPeople,
}: HomeClientProps) {
    const [activeTrailerMovie, setActiveTrailerMovie] = useState<Movie | null>(null);

    return (
        <div className="flex min-h-screen flex-col w-full min-w-0 max-w-full bg-background text-foreground transition-colors duration-300">
            {/* Minimalist Hero Spotlight */}
            <HeroSpotlight
                movies={trendingMovies.length > 0 ? trendingMovies : popularMovies}
                onPlayTrailer={(movie) => setActiveTrailerMovie(movie)}
            />

            {/* Trending People Carousel */}
            <TrendingPeople people={trendingPeople} />

            {/* Interactive Popular Movies Explorer */}
            <MovieExplorer
                initialMovies={popularMovies}
                activeTrailerMovie={activeTrailerMovie}
                setActiveTrailerMovie={setActiveTrailerMovie}
            />
        </div>
    );
}
