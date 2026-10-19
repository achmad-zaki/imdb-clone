import { Movie, MovieDetail, MovieResponse, Video, VideoResponse } from "@/types/movie";
import { PersonResponse } from "@/types/person";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export const GENRE_MAP: Record<number, string> = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western",
};

export async function tmdbFetch<T>(
    endpoint: string,
    params?: Record<string, string>,
): Promise<T> {
    const token = process.env.TMDB_API_READ_ACCESS_TOKEN;

    if (!token) {
        throw new Error("TMDB API token not configured");
    }

    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);

    Object.entries(params ?? {}).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
        },
        next: { revalidate: 3600 },
    });

    if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status} for ${endpoint}`);
    }

    return response.json() as Promise<T>;
}

export async function getPopularMovies(page = 1, language = "en-US"): Promise<MovieResponse> {
    return tmdbFetch<MovieResponse>("/movie/popular", {
        language,
        page: page.toString(),
    });
}

export async function getTrendingMovies(timeWindow: "day" | "week" = "day"): Promise<MovieResponse> {
    return tmdbFetch<MovieResponse>(`/trending/movie/${timeWindow}`, {
        language: "en-US",
    });
}

export async function getNowPlayingMovies(page = 1, language = "en-US"): Promise<MovieResponse> {
    return tmdbFetch<MovieResponse>("/movie/now_playing", {
        language,
        page: page.toString(),
    });
}

export async function getTopRatedMovies(page = 1, language = "en-US"): Promise<MovieResponse> {
    return tmdbFetch<MovieResponse>("/movie/top_rated", {
        language,
        page: page.toString(),
    });
}

export async function getUpcomingMovies(page = 1, language = "en-US"): Promise<MovieResponse> {
    return tmdbFetch<MovieResponse>("/movie/upcoming", {
        language,
        page: page.toString(),
    });
}

export async function searchMovies(query: string, page = 1): Promise<MovieResponse> {
    if (!query || query.trim() === "") {
        return { page: 1, results: [], total_pages: 0, total_results: 0 };
    }
    return tmdbFetch<MovieResponse>("/search/movie", {
        query: query.trim(),
        language: "en-US",
        page: page.toString(),
        include_adult: "false",
    });
}

export async function getMovieVideos(movieId: number | string): Promise<Video[]> {
    try {
        const response = await tmdbFetch<VideoResponse>(`/movie/${movieId}/videos`, {
            language: "en-US",
        });

        let youtubeVideos = response.results?.filter((v) => v.site === "YouTube") || [];

        // Fallback to TV videos if empty
        if (youtubeVideos.length === 0) {
            try {
                const tvResp = await tmdbFetch<VideoResponse>(`/tv/${movieId}/videos`, {
                    language: "en-US",
                });
                youtubeVideos = tvResp.results?.filter((v) => v.site === "YouTube") || [];
            } catch {
                // Ignore TV video errors
            }
        }

        // Prioritize official Trailer, then Teaser, then other
        return youtubeVideos.sort((a, b) => {
            const getScore = (v: Video) => {
                let score = 0;
                if (v.type === "Trailer") score += 10;
                if (v.type === "Teaser") score += 5;
                if (v.official) score += 3;
                return score;
            };
            return getScore(b) - getScore(a);
        });
    } catch {
        return [];
    }
}

type TMDBTVDetail = {
    id: number;
    name?: string;
    original_name?: string;
    first_air_date?: string;
    episode_run_time?: number[];
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average: number;
    genres: { id: number; name: string }[];
    tagline: string;
    status: string;
};

type TMDBTVRecItem = {
    id: number;
    name?: string;
    original_name?: string;
    first_air_date?: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average: number;
};

export async function getMovieDetails(movieId: number | string): Promise<MovieDetail | null> {
    try {
        return await tmdbFetch<MovieDetail>(`/movie/${movieId}`, {
            language: "en-US",
        });
    } catch {
        try {
            // Fallback to TV show endpoint
            const tv = await tmdbFetch<TMDBTVDetail>(`/tv/${movieId}`, {
                language: "en-US",
            });
            return {
                ...tv,
                title: tv.name || tv.original_name || "",
                release_date: tv.first_air_date || "",
                runtime: (Array.isArray(tv.episode_run_time) && tv.episode_run_time[0]) || 45,
                budget: 0,
                revenue: 0,
            } as MovieDetail;
        } catch {
            return null;
        }
    }
}

export async function getMovieRecommendations(movieId: number | string): Promise<Movie[]> {
    try {
        const data = await tmdbFetch<MovieResponse>(`/movie/${movieId}/recommendations`, {
            language: "en-US",
            page: "1",
        });
        if (data.results && data.results.length > 0) return data.results;

        // Fallback to similar
        const similar = await tmdbFetch<MovieResponse>(`/movie/${movieId}/similar`, {
            language: "en-US",
            page: "1",
        });
        if (similar.results && similar.results.length > 0) return similar.results;

        // Fallback to TV recommendations
        const tvRec = await tmdbFetch<{ results: TMDBTVRecItem[] }>(`/tv/${movieId}/recommendations`, {
            language: "en-US",
            page: "1",
        });
        return (tvRec.results || []).map((t) => ({
            ...t,
            title: t.name || t.original_name || "",
            release_date: t.first_air_date || "",
        }));
    } catch {
        return [];
    }
}

export async function getTrendingPeople(timeWindow: "day" | "week" = "week"): Promise<PersonResponse> {
    return tmdbFetch<PersonResponse>(`/trending/person/${timeWindow}`, {
        language: "en-US",
    });
}
