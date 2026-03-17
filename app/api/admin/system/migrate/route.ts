import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    return NextResponse.json(
        { error: "This migration endpoint was removed (Prisma/Neon decommissioned)." },
        { status: 410 }
    );
}
