import { getPopularMovies, getTrendingMovies, getPopularPeople, getTrendingPeople } from "@/lib/tmdb";
import HomeClient from "@/components/movie/home-client";

export default async function Home() {
    const [trendingData, popularData, peopleData] = await Promise.all([
        getTrendingMovies("week").catch(() => ({
            results: [],
            page: 1,
            total_pages: 1,
            total_results: 0,
        })),
        getPopularMovies(1).catch(() => ({
            results: [],
            page: 1,
            total_pages: 1,
            total_results: 0,
        })),
        getPopularPeople(1)
            .catch(() => getTrendingPeople("week"))
            .catch(() => ({
                results: [],
                page: 1,
                total_pages: 1,
                total_results: 0,
            })),
    ]);

    return (
        <HomeClient
            trendingMovies={trendingData.results || []}
            popularMovies={popularData.results || []}
            trendingPeople={peopleData.results || []}
        />
    );
}
