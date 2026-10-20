"use client";

import { useState } from "react";
import { Movie } from "@/types/movie";
import { Person } from "@/types/person";
import { TVShow } from "@/types/tv";
import HeroSpotlight from "@/components/movie/hero-spotlight";
import TrendingPeople from "@/components/movie/trending-people";
import MovieExplorer from "@/components/movie/movie-explorer";

type HomeClientProps = {
    trendingMovies: Movie[];
    popularMovies: Movie[];
    trendingPeople: Person[];
    popularTV: TVShow[];
};

export default function HomeClient({
    trendingMovies,
    popularMovies,
    trendingPeople,
    popularTV,
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

            {/* Interactive Popular Movies & TV Explorer */}
            <MovieExplorer
                initialMovies={popularMovies}
                initialTV={popularTV}
                activeTrailerMovie={activeTrailerMovie}
                setActiveTrailerMovie={setActiveTrailerMovie}
            />
        </div>
    );
}
