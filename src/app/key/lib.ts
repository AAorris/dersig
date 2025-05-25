import { createStreamableValue } from "ai/rsc";
import { createSigningKeyPair } from "@/lib/signing";
import { formatPrettyPublicKey } from "@/lib/utils";
import type { NextRequest } from "next/server";
import { getMatchingStrings } from "@/lib/dictionary-fingerprint-overlay/trie";

export function generatePair() {
	const { publicKey, privateKey } = createSigningKeyPair();
	const prettyPublicKey = formatPrettyPublicKey(publicKey);
	const { matches, score } = getMatchingStrings(prettyPublicKey);
	// let longestMatch = 0;
	// for (const part of prettyPublicKey) {
	// 	const match = getLongestMatchingPrefix(part);
	// 	if (match) {
	// 		matches.push(match);
	// 	}
	// 	longestMatch = Math.max(longestMatch, match?.length ?? 0);
	// }
	// ...
	// const matches = getLongestMatchingSubstrings(publicKey);
	if (matches.length === 0) return null;
	return {
		publicKey,
		privateKey,
		prettyPublicKey,
		matches,
		score,
	};
}

export function streamKeys(timeout = 10_000) {
	const streamableValue = createStreamableValue();
	let best: ReturnType<typeof generatePair> | null = null;
	let isRunning = true;

	const bestPromise = new Promise((resolve, reject) => {
		const compute = () => {
			if (!isRunning) return;

			const gen = generatePair();
			if (!gen) {
				// Schedule next iteration with small delay for streaming
				setTimeout(compute, 1);
				return;
			}

			if (gen.score > 0) {
				streamableValue.update(gen);
				if (gen.score > (best?.score ?? 0)) {
					best = gen;
				}
			}

			// Schedule next iteration with small delay for streaming
			setTimeout(compute, 1);
		};

		// Start the loop
		compute();

		setTimeout(() => {
			isRunning = false;
			streamableValue.done();
			if (best) resolve(best);
			else reject(new Error("No valid key pair found"));
		}, timeout);
	});
	return { streamableValue, bestPromise };
}
