import { tmdbFetch } from "@/lib/tmdb";
import { NextRequest, NextResponse } from "next/server";

export type SearchResultItem = {
    id: number;
    type: "movie" | "tv" | "person" | "company" | "keyword";
    title: string;
    subtitle?: string | null;
    year?: string | null;
    rating?: number | null;
    image?: string | null;
    overview?: string | null;
    badge: string;
    extra?: string | null;
    poster_path?: string | null;
    backdrop_path?: string | null;
    release_date?: string;
    vote_average?: number;
    genre_ids?: number[];
};

type TMDBRawMultiItem = {
    id: number;
    media_type: "movie" | "tv" | "person";
    title?: string;
    name?: string;
    original_title?: string;
    original_name?: string;
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
    poster_path?: string | null;
    backdrop_path?: string | null;
    profile_path?: string | null;
    overview?: string;
    genre_ids?: number[];
    known_for_department?: string;
    known_for?: { title?: string; name?: string }[];
};

type TMDBRawTVItem = {
    id: number;
    name?: string;
    original_name?: string;
    first_air_date?: string;
    vote_average?: number;
    poster_path?: string | null;
    backdrop_path?: string | null;
    overview?: string;
    genre_ids?: number[];
};

type TMDBRawPersonItem = {
    id: number;
    name?: string;
    original_name?: string;
    profile_path?: string | null;
    known_for_department?: string;
    known_for?: { title?: string; name?: string }[];
};

type TMDBRawCompanyItem = {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country?: string;
};

type TMDBRawKeywordItem = {
    id: number;
    name: string;
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const category = (searchParams.get("category") || "all").toLowerCase();

    if (!query || query.trim() === "") {
        return NextResponse.json({ results: [] });
    }

    try {
        let results: SearchResultItem[] = [];

        switch (category) {
            case "titles": {
                // Search across both Movies and TV series
                const multiData = await tmdbFetch<{ results: TMDBRawMultiItem[] }>("/search/multi", {
                    query,
                    language: "en-US",
                    include_adult: "false",
                    page: "1",
                });

                const filtered = (multiData.results || []).filter(
                    (item) => item.media_type === "movie" || item.media_type === "tv",
                );

                results = filtered.map((item) => {
                    const isMovie = item.media_type === "movie";
                    const title = isMovie ? item.title || item.original_title : item.name || item.original_name;
                    const date = isMovie ? item.release_date : item.first_air_date;

                    return {
                        id: item.id,
                        type: isMovie ? "movie" : "tv",
                        title: title || "Untitled",
                        year: date ? date.slice(0, 4) : null,
                        rating: item.vote_average ? Number(item.vote_average.toFixed(1)) : null,
                        image: item.poster_path
                            ? `https://image.tmdb.org/t/p/w185${item.poster_path}`
                            : null,
                        overview: item.overview || "",
                        badge: isMovie ? "Movie" : "TV Show",
                        poster_path: item.poster_path || null,
                        backdrop_path: item.backdrop_path || null,
                        release_date: date || "",
                        vote_average: item.vote_average || 0,
                        genre_ids: item.genre_ids || [],
                    };
                });
                break;
            }

            case "tv": {
                // TV Shows / Episodes
                const tvData = await tmdbFetch<{ results: TMDBRawTVItem[] }>("/search/tv", {
                    query,
                    language: "en-US",
                    include_adult: "false",
                    page: "1",
                });

                results = (tvData.results || []).map((item) => ({
                    id: item.id,
                    type: "tv",
                    title: item.name || item.original_name || "Untitled",
                    year: item.first_air_date ? item.first_air_date.slice(0, 4) : null,
                    rating: item.vote_average ? Number(item.vote_average.toFixed(1)) : null,
                    image: item.poster_path
                        ? `https://image.tmdb.org/t/p/w185${item.poster_path}`
                        : null,
                    overview: item.overview || "",
                    badge: "TV Show",
                    poster_path: item.poster_path || null,
                    backdrop_path: item.backdrop_path || null,
                    release_date: item.first_air_date || "",
                    vote_average: item.vote_average || 0,
                    genre_ids: item.genre_ids || [],
                }));
                break;
            }

            case "celebs": {
                // Actors, Actresses, Directors, Crew
                const personData = await tmdbFetch<{ results: TMDBRawPersonItem[] }>("/search/person", {
                    query,
                    language: "en-US",
                    include_adult: "false",
                    page: "1",
                });

                results = (personData.results || []).map((item) => {
                    let dept = item.known_for_department || "Celebrity";
                    if (dept === "Acting") dept = "Actor / Actress";
                    else if (dept === "Directing") dept = "Director";
                    else if (dept === "Writing") dept = "Writer";
                    else if (dept === "Production") dept = "Producer";

                    const knownWorks = (item.known_for || [])
                        .map((k) => k.title || k.name)
                        .filter(Boolean)
                        .slice(0, 3)
                        .join(", ");

                    return {
                        id: item.id,
                        type: "person",
                        title: item.name || item.original_name || "Unnamed",
                        subtitle: dept,
                        image: item.profile_path
                            ? `https://image.tmdb.org/t/p/w185${item.profile_path}`
                            : null,
                        extra: knownWorks ? `Known for: ${knownWorks}` : null,
                        badge: "Celebrity",
                    };
                });
                break;
            }

            case "companies": {
                // Production Companies
                const companyData = await tmdbFetch<{ results: TMDBRawCompanyItem[] }>("/search/company", {
                    query,
                    page: "1",
                });

                results = (companyData.results || []).map((item) => ({
                    id: item.id,
                    type: "company",
                    title: item.name || "Unnamed Company",
                    subtitle: item.origin_country
                        ? `Country: ${item.origin_country}`
                        : "Production Studio",
                    image: item.logo_path
                        ? `https://image.tmdb.org/t/p/w185${item.logo_path}`
                        : null,
                    badge: "Company",
                }));
                break;
            }

            case "keywords": {
                // Keywords
                const keywordData = await tmdbFetch<{ results: TMDBRawKeywordItem[] }>("/search/keyword", {
                    query,
                    page: "1",
                });

                results = (keywordData.results || []).map((item) => ({
                    id: item.id,
                    type: "keyword",
                    title: item.name,
                    subtitle: "Topic & Keyword",
                    badge: "Keyword",
                }));
                break;
            }

            case "all":
            default: {
                // Multi search: movies, tv shows, people
                const multiData = await tmdbFetch<{ results: TMDBRawMultiItem[] }>("/search/multi", {
                    query,
                    language: "en-US",
                    include_adult: "false",
                    page: "1",
                });

                results = (multiData.results || []).map((item) => {
                    if (item.media_type === "person") {
                        let dept = item.known_for_department || "Celebrity";
                        if (dept === "Acting") dept = "Actor / Actress";
                        else if (dept === "Directing") dept = "Director";

                        const knownWorks = (item.known_for || [])
                            .map((k) => k.title || k.name)
                            .filter(Boolean)
                            .slice(0, 2)
                            .join(", ");

                        return {
                            id: item.id,
                            type: "person",
                            title: item.name || item.original_name || "Unnamed",
                            subtitle: dept,
                            image: item.profile_path
                                ? `https://image.tmdb.org/t/p/w185${item.profile_path}`
                                : null,
                            extra: knownWorks ? `Known for: ${knownWorks}` : null,
                            badge: "Celebrity",
                        };
                    }

                    const isMovie = item.media_type === "movie";
                    const title = isMovie
                        ? item.title || item.original_title
                        : item.name || item.original_name;
                    const date = isMovie ? item.release_date : item.first_air_date;

                    return {
                        id: item.id,
                        type: isMovie ? "movie" : "tv",
                        title: title || "Untitled",
                        year: date ? date.slice(0, 4) : null,
                        rating: item.vote_average
                            ? Number(item.vote_average.toFixed(1))
                            : null,
                        image: item.poster_path
                            ? `https://image.tmdb.org/t/p/w185${item.poster_path}`
                            : null,
                        overview: item.overview || "",
                        badge: isMovie ? "Movie" : "TV Show",
                        poster_path: item.poster_path || null,
                        backdrop_path: item.backdrop_path || null,
                        release_date: date || "",
                        vote_average: item.vote_average || 0,
                        genre_ids: item.genre_ids || [],
                    };
                });
                break;
            }
        }

        return NextResponse.json({ results: results.slice(0, 15) });
    } catch (error) {
        console.error("TMDB search error:", error);

        return NextResponse.json(
            { message: "Failed to process search.", results: [] },
            { status: 502 },
        );
    }
}