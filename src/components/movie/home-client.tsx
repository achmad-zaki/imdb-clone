"use client";

import { useState } from "react";
import { Movie } from "@/types/movie";
import HeroSpotlight from "@/components/movie/hero-spotlight";
import MovieExplorer from "@/components/movie/movie-explorer";

type HomeClientProps = {
    trendingMovies: Movie[];
    popularMovies: Movie[];
};

export default function HomeClient({ trendingMovies, popularMovies }: HomeClientProps) {
    const [activeTrailerMovie, setActiveTrailerMovie] = useState<Movie | null>(null);

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
            {/* Minimalist Hero Spotlight */}
            <HeroSpotlight
                movies={trendingMovies.length > 0 ? trendingMovies : popularMovies}
                onPlayTrailer={(movie) => setActiveTrailerMovie(movie)}
            />

            {/* Interactive Minimalist Explorer */}
            <MovieExplorer
                initialMovies={popularMovies}
                activeTrailerMovie={activeTrailerMovie}
                setActiveTrailerMovie={setActiveTrailerMovie}
            />
        </div>
    );
}
