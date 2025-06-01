import { verifyNote } from "@/lib/signed-note";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const { signedNote, senderPublicKey } = await request.json();

		if (!signedNote || !senderPublicKey) {
			return NextResponse.json(
				{ error: "signedNote and senderPublicKey are required" },
				{ status: 400 },
			);
		}

		const verification = verifyNote({
			signedNote,
			senderPublicKey,
		});

		return NextResponse.json({
			isValid: verification.isValid,
			message: verification.message,
			recipientPublicKey: verification.recipientPublicKey,
			senderPublicKey: verification.senderPublicKey,
		});
	} catch (error) {
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : "Verification failed",
				isValid: false,
				message: "",
			},
			{ status: 200 }, // Return 200 but with error in body for invalid signatures
		);
	}
}
