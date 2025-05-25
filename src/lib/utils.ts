import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatPrettyPublicKey(publicKey: string): string[] {
	const segments: string[] = [];
	let currentSegment = "";

	// Handle the first character
	if (publicKey.length > 0) {
		currentSegment = publicKey[0];
	}

	for (let i = 1; i < publicKey.length; i++) {
		const char = publicKey[i];
		const prevChar = publicKey[i - 1];

		const isLetter = /[a-zA-Z]/.test(char);
		const prevIsLetter = /[a-zA-Z]/.test(prevChar);

		const isUppercase = isLetter && char === char.toUpperCase();
		const prevIsUppercase = prevIsLetter && prevChar === prevChar.toUpperCase();

		// Check if we're in a valid "Capital + lowercase" pattern
		const isCapitalFollowedByLowercase =
			isLetter &&
			prevIsLetter &&
			prevIsUppercase &&
			!isUppercase &&
			currentSegment.length === 1; // Previous char was the first (capital) letter

		// Start a new segment if:
		// 1. Current char is a letter but previous wasn't, or vice versa
		// 2. Both are letters but case changes, EXCEPT when it's a single capital followed by lowercase
		const boundaryDetected =
			isLetter !== prevIsLetter ||
			(isLetter &&
				prevIsLetter &&
				isUppercase !== prevIsUppercase &&
				!isCapitalFollowedByLowercase);

		if (boundaryDetected) {
			segments.push(currentSegment);
			currentSegment = char;
		} else {
			currentSegment += char;
		}
	}

	// Add the last segment if there is one
	if (currentSegment) {
		segments.push(currentSegment);
	}

	return segments;
}
