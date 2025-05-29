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
	// if (matches.length === 0) return null;
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
	let isRunning = true;
	let isCancelled = false;
	let batch: ReturnType<typeof generatePair>[] = [];
	let lowWatermark = 0;
	let seen = 0;
	const deadline = Date.now() + timeout;

	void new Promise((resolve, reject) => {
		const compute = () => {
			if (!isRunning) return;
			if (isCancelled) throw new Error("Cancelled");

			const ts = Date.now();
			const gen = generatePair();
			if (!gen && ts < deadline) {
				setTimeout(compute, 1);
				return;
			}
			seen += 1;
			if (gen.score > lowWatermark) {
				batch.push(gen);
				lowWatermark = lowWatermark + (gen.score - lowWatermark) * 0.01;
			}
			if (seen % 1000 === 0) {
				streamableValue.update(batch);
				batch = [];
				seen = 0;
			}

			if (ts > deadline) {
				streamableValue.update(batch);
				batch = [];
				resolve(undefined);
			}

			setTimeout(compute, 1);
		};

		// start
		compute();
	})
		.finally(() => {
			isRunning = false;
			streamableValue.done();
		})
		.catch((e) => {
			console.error(e);
		});
	return {
		streamableValue,
		abort: () => {
			isCancelled = true;
			streamableValue.done();
		},
	};
}
