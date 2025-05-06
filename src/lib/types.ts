export interface Agent {
	publicKey: string;
	fingerprint: string;
}

export interface PrivateKeyPair {
	privateKey: string;
	publicKey: string;
	fingerprint?: string;
}

export interface SharedSecret {
	info: string;
	value: string;
	parties: string[];
}

export interface SignedAgreement {
	info: string;
	value: string;
	parties: string[];
}
