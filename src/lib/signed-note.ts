import { signMessage, verifyMessage } from "./signing";

const BOUNDARY = "~~~";

export function signNote({
	message,
	signerPrivateKey,
	recipientPublicKey,
	senderPublicKey,
}: {
	message: string;
	signerPrivateKey: string;
	recipientPublicKey?: string;
	senderPublicKey: string;
}): string {
	// Sanitize the message to remove any boundary sequences
	const sanitizedMessage = sanitizeMessage(message);

	// Create the formatted text
	const formattedText = stringifySignedNote({
		recipientPublicKey,
		message: sanitizedMessage,
		senderPublicKey,
		signature: "", // Placeholder for now
	});

	// Sign the formatted text (without the signature line)
	const textToSign = formattedText.split("\n").slice(0, -1).join("\n");
	const signature = signMessage(signerPrivateKey, textToSign);

	return stringifySignedNote({
		recipientPublicKey,
		message: sanitizedMessage,
		senderPublicKey,
		signature,
	});
}

function sanitizeMessage(message: string): string {
	// Replace any occurrence of the boundary with a safe alternative
	// This prevents boundary injection attacks
	return message.replace(new RegExp(BOUNDARY, "g"), "---");
}

function stringifySignedNote({
	recipientPublicKey,
	message,
	senderPublicKey,
	signature,
}: SignedNote): string {
	if (signature && signature.length !== 86) {
		throw new Error(`Invalid signature length: ${signature.length}`);
	}

	const lines = [];
	if (recipientPublicKey) {
		lines.push(recipientPublicKey);
	}
	lines.push(BOUNDARY);
	lines.push(message);
	lines.push(BOUNDARY);
	lines.push(senderPublicKey);
	lines.push(signature);

	return lines.join("\n");
}

interface SignedNote {
	recipientPublicKey?: string;
	message: string; // plain text message (sanitized)
	senderPublicKey: string;
	signature: string; // signature of the formatted text including recipient
}

export function parseSignedNote(signedNote: string): SignedNote {
	const lines = signedNote.split("\n");

	// Find the boundary positions
	const firstBoundaryIndex = lines.findIndex((line) => line === BOUNDARY);
	const lastBoundaryIndex = lines.lastIndexOf(BOUNDARY);

	if (
		firstBoundaryIndex === -1 ||
		lastBoundaryIndex === -1 ||
		firstBoundaryIndex === lastBoundaryIndex
	) {
		throw new Error(
			"Invalid signed note format: missing or malformed boundaries",
		);
	}

	// Check if there's a recipient (first line starts with : and is before first boundary)
	let recipientPublicKey: string | undefined;
	const messageStartIndex = firstBoundaryIndex;

	if (firstBoundaryIndex > 0) {
		recipientPublicKey = lines[0];
		if (firstBoundaryIndex !== 1) {
			throw new Error(
				"Invalid signed note format: recipient must be immediately before first boundary",
			);
		}
	} else if (firstBoundaryIndex !== 0) {
		throw new Error(
			"Invalid signed note format: first boundary must be at start if no recipient",
		);
	}

	// Extract message (between boundaries)
	const message = lines
		.slice(firstBoundaryIndex + 1, lastBoundaryIndex)
		.join("\n");

	// Extract sender and signature (last two lines should start with :)
	const senderLine = lines[lastBoundaryIndex + 1];
	const signatureLine = lines[lastBoundaryIndex + 2];

	if (!senderLine || !signatureLine) {
		throw new Error("Invalid signed note format: missing sender or signature");
	}

	const senderPublicKey = senderLine;
	const signature = signatureLine;

	// Validate the reconstruction
	const test = stringifySignedNote({
		recipientPublicKey,
		message,
		senderPublicKey,
		signature,
	});

	if (test !== signedNote) {
		throw new Error(
			`Invalid note parsing:\nOriginal:\n${signedNote}\nReconstructed:\n${test}`,
		);
	}

	return { recipientPublicKey, message, senderPublicKey, signature };
}

export function verifyNote({
	signedNote,
	senderPublicKey,
}: {
	signedNote: string;
	senderPublicKey: string;
}): {
	isValid: boolean;
	recipientPublicKey?: string;
	message: string;
	senderPublicKey: string;
} {
	const {
		recipientPublicKey,
		message,
		senderPublicKey: parsedSenderPublicKey,
		signature,
	} = parseSignedNote(signedNote);

	// Verify that the parsed sender matches the provided sender public key
	if (parsedSenderPublicKey !== senderPublicKey) {
		return {
			isValid: false,
			recipientPublicKey,
			message,
			senderPublicKey: parsedSenderPublicKey,
		};
	}

	// Create the text that was signed (formatted text without signature line)
	const textToVerify = signedNote.split("\n").slice(0, -1).join("\n");

	const isValid = verifyMessage({
		publicKey: senderPublicKey,
		message: textToVerify,
		signature,
	});

	return {
		isValid,
		recipientPublicKey,
		message,
		senderPublicKey: parsedSenderPublicKey,
	};
}
