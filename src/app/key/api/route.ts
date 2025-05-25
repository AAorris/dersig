import { createSigningKeyPair } from "@/lib/signing";
import { formatPrettyPublicKey } from "@/lib/utils";
import type { NextRequest } from "next/server";
import { getMatchingStrings } from "@/lib/dictionary-fingerprint-overlay/trie";

function generatePair() {
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

export function GET(request: NextRequest) {
	let pair = generatePair();
	const valid = [];
	let longest = 0;
	const deadline = Date.now() + 10_000;
	while (Date.now() < deadline) {
		const gen = generatePair();
		if (!gen) continue;
		if (gen.score > 0) {
			valid.push(gen);
		}
		if (gen.score > longest) {
			longest = gen.score;
			pair = gen;
		}
	}
	if (!pair) return new Response("Failed to generate key pair");
	let responseLines = valid
		.sort((l, r) => {
			return (r?.score ?? 0) - (l?.score ?? 0);
		})
		.map(
			({ prettyPublicKey, matches, score }) =>
				`${prettyPublicKey.join(" ")} (${matches.join(" ")}) ${score}\n`,
		);
	responseLines.push(
		`\n---\nLongest: ${longest}\nTotal: ${valid.reduce((acc, gen) => acc + gen.matches.length, 0)}`,
	);
	return new Response(responseLines.join("\n"));
}
