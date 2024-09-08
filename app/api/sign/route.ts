import { type NextRequest, NextResponse } from "next/server";

import { pinata } from "@/services/pinata";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const data = await req.json();
    const url = await pinata.gateways.createSignedURL({
      cid: data.cid,
      expires: 1200, // 20 mins
    });

    return NextResponse.json(url, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { text: "Error creating Signed URL:" },
      { status: 500 }
    );
  }
}
