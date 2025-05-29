import type { Match } from "./key-match";
import { freq } from "./unigram_freq";

const maxLen = 43;
const maxFreq = 501651226;
const maxFreqSquared = maxFreq * maxFreq;

const maxFreqScore = 1024;
const maxCoverageScore = 1024;

function getFreqScore(matches: Match[]) {
	// const freqs: number[] = [];
	let score = 0;
	for (const match of matches) {
		const fq = freq[match.word];
		if (!fq) continue;
		score += (fq / maxFreq) * maxFreqScore;
	}
	return score;
}

function getCoverageScore(matches: Match[]) {
	let size = 0;
	for (const match of matches) {
		size += match.end - match.start;
	}
	return (size / maxLen) * maxCoverageScore;
}

export function keyScore(matches: Match[]) {
	return getFreqScore(matches) + getCoverageScore(matches);
}
