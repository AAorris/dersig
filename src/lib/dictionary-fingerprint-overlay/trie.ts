import { Trie, TrieNode } from "@datastructures-js/trie";
// import { data } from "./dictionary";
import { freq } from "./unigram_freq";

const trie = new Trie();
let loaded = false;

function load() {
	if (loaded) return;
	for (const word of Object.keys(freq)) {
		if (word.length > 2 && word.length < 8) {
			trie.insert(word);
		}
	}
	loaded = true;
}

const maxFreq = 501651226;

function getFreqScore(length: number, freq: number) {
	const factor = length - 2;
	const result = (freq / maxFreq) * 256 * factor;
	return result;
}

const maxParts = 43;
function rawWordsScore(parts: number) {
	// less parts is better
	return ((maxParts - parts) / maxParts) * 64;
}

export function getMatchingStrings(rawWords: string[]) {
	load();
	const processedWords = rawWords.map((word, index) => {
		const lower = word.toLowerCase();
		// Create mapping from cleaned positions to original positions
		const cleanedToOriginal: number[] = [];
		let result = "";
		for (let i = 0; i < lower.length; i++) {
			const char = lower[i];
			if (char !== "-" && char !== "_") {
				cleanedToOriginal.push(i);
				result += char;
			}
		}
		return { cleaned: result, cleanedToOriginal, original: lower, index };
	});

	const matches = new Set<string>();
	const adjacentToSeparatorWords = new Set<string>();
	let score = 0;

	for (const wordInfo of processedWords) {
		const word = wordInfo.cleaned;
		if (word.length < 3) continue;
		if (trie.find(word)?.isEndOfWord()) {
			matches.add(word);

			// Check if this word was adjacent to a separator in the original
			const originalWord = wordInfo.original;
			let isAdjacentToSeparator = false;

			// Find where this cleaned word appears in the original
			if (wordInfo.cleanedToOriginal.length > 0) {
				const startPos = wordInfo.cleanedToOriginal[0];
				const endPos =
					wordInfo.cleanedToOriginal[wordInfo.cleanedToOriginal.length - 1];

				// Check if there's a separator before or after
				const hasSeparatorBefore =
					startPos > 0 &&
					(originalWord[startPos - 1] === "-" ||
						originalWord[startPos - 1] === "_");
				const hasSeparatorAfter =
					endPos < originalWord.length - 1 &&
					(originalWord[endPos + 1] === "-" ||
						originalWord[endPos + 1] === "_");

				isAdjacentToSeparator = hasSeparatorBefore || hasSeparatorAfter;
			}

			// Check if this word is in the first or last raw word
			const isInFirstOrLastWord =
				wordInfo.index === 0 || wordInfo.index === rawWords.length - 1;

			if (isAdjacentToSeparator || isInFirstOrLastWord) {
				adjacentToSeparatorWords.add(word);
			}

			// Add freq scores
			score += freq[word] ? getFreqScore(word.length, freq[word]) : 0;
		}
	}

	const matchesArray = Array.from(matches);
	const separatorBonus = adjacentToSeparatorWords.size * 32; // Bonus points for separator-adjacent words or first/last position words
	const scaledScore =
		score +
		matchesArray.length * 64 +
		rawWordsScore(rawWords.length) +
		separatorBonus;
	const bonusFactor = matchesArray.some((x) => x.length > 3) ? 10 : 1;
	return {
		matches: matchesArray,
		score: scaledScore * bonusFactor,
	};
}

export function getLongestMatchingPrefix(rawWord: string) {
	load();
	const word = rawWord.toLowerCase();
	let bestIndex = 0;
	for (let i = 3; i < word.length; i++) {
		const hasString = trie.has(word.substring(0, i + 1));
		if (!hasString) break;
		bestIndex = i;
	}
	let node = trie.find(word.substring(0, bestIndex + 1));
	if (!node) return null;
	while (!node.isEndOfWord) {
		bestIndex--;
		node = node.getParent();
	}
	return word.slice(0, bestIndex + 1);
}

export function getLongestMatchingSubstrings(rawWord: string) {
	load();
	const word = rawWord.toLowerCase();
	const matches = new Set<string>();
	for (let i = 0; i < word.length; i++) {
		for (let j = Math.min(i + 3, word.length); j <= word.length; j++) {
			const substring = word.substring(i, j);
			const match = getLongestMatchingPrefix(substring);
			if (match) matches.add(match);
		}
	}
	return Array.from(matches).sort((l, r) => r.length - l.length);
}
