import { getMovieVideos } from "@/lib/tmdb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get("movieId");

    if (!movieId) {
        return NextResponse.json({ error: "movieId parameter is required" }, { status: 400 });
    }

    try {
        const videos = await getMovieVideos(movieId);
        const trailer = videos.find((v) => v.type === "Trailer") || videos[0] || null;

        return NextResponse.json({
            videos,
            trailer,
        });
    } catch (err) {
        return NextResponse.json(
            { error: "Gagal mengambil data video", details: String(err) },
            { status: 500 }
        );
    }
}
