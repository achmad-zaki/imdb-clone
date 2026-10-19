import {
    getNowPlayingMovies,
    getPopularMovies,
    getTopRatedMovies,
    getTrendingMovies,
    getUpcomingMovies,
} from "@/lib/tmdb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "popular";
    const page = parseInt(searchParams.get("page") || "1", 10);

    try {
        let data;
        switch (category) {
            case "trending":
                data = await getTrendingMovies("day");
                break;
            case "now_playing":
                data = await getNowPlayingMovies(page);
                break;
            case "top_rated":
                data = await getTopRatedMovies(page);
                break;
            case "upcoming":
                data = await getUpcomingMovies(page);
                break;
            case "popular":
            default:
                data = await getPopularMovies(page);
                break;
        }

        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json(
            { error: "Gagal mengambil daftar film", details: String(err) },
            { status: 500 }
        );
    }
}
