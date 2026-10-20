import { Genre } from "./movie";

export type TVShow = {
    id: number;
    name: string;
    original_name?: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    first_air_date: string;
    vote_average: number;
    vote_count?: number;
    genre_ids?: number[];
    popularity?: number;
    origin_country?: string[];
    media_type?: "tv";
};

export type TVResponse = {
    page: number;
    results: TVShow[];
    total_pages: number;
    total_results: number;
};

export type TVNetwork = {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country?: string;
};

export type TVSeason = {
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    season_number: number;
    episode_count: number;
    air_date: string | null;
    vote_average?: number;
};

export type TVDetail = {
    id: number;
    name: string;
    original_name?: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    first_air_date: string;
    last_air_date?: string;
    vote_average: number;
    vote_count?: number;
    genres: Genre[];
    tagline: string;
    status: string;
    number_of_seasons: number;
    number_of_episodes: number;
    seasons: TVSeason[];
    networks: TVNetwork[];
    episode_run_time?: number[];
    media_type?: "tv";
};
