import { searchManga } from "@/lib/api/komiku";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');

    if (!q) {
        return NextResponse.json({ error: "Query parameter required" }, { status: 400 });
    }

    try {
        const results = await searchManga(q);
        return NextResponse.json(results);
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json({ error: "Failed to search" }, { status: 500 });
    }
}
