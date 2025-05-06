export interface Identity {
	publicKey: string;
	fingerprint: string;
}

export interface PrivateKeyPair {
	privateKey: string;
	publicKey: string;
	fingerprint?: string;
}

export interface SharedSecret {
	info?: string;
	value: string;
}
