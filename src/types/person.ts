export type KnownFor = {
    id: number;
    title?: string;
    name?: string;
    media_type?: string;
    release_date?: string;
    first_air_date?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    vote_average?: number;
};

export type Person = {
    id: number;
    name: string;
    original_name?: string;
    media_type?: string;
    adult?: boolean;
    popularity: number;
    gender?: number;
    known_for_department?: string;
    profile_path: string | null;
    known_for?: KnownFor[];
};

export type PersonResponse = {
    page: number;
    results: Person[];
    total_pages: number;
    total_results: number;
};

export type PersonMovieCredit = {
    id: number;
    title: string;
    character?: string;
    original_title?: string;
    overview?: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    vote_average: number;
    vote_count?: number;
    popularity: number;
    genre_ids?: number[];
};

export type PersonDetail = {
    id: number;
    name: string;
    also_known_as?: string[];
    biography: string;
    birthday: string | null;
    deathday: string | null;
    gender: number;
    homepage: string | null;
    imdb_id: string | null;
    known_for_department: string;
    place_of_birth: string | null;
    popularity: number;
    profile_path: string | null;
    movie_credits?: {
        cast: PersonMovieCredit[];
        crew: {
            id: number;
            title: string;
            job: string;
            department: string;
            poster_path: string | null;
            release_date: string;
            vote_average: number;
        }[];
    };
};
