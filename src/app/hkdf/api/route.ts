import { createDocument, computeSecretWithIdentity } from "@/lib/xsig";
import { signMessage, createIdentity, createAgent } from "@/lib/dersig";
import type {
	Agent,
	PrivateKeyPair,
	SharedSecret,
	SignedAgreement,
} from "@/lib/types";

export async function GET() {
	// Create two separate identities
	const alice: PrivateKeyPair = createIdentity();
	const bob: PrivateKeyPair = createIdentity();

	// Create agent views (public information only)
	const aliceAgent: Agent = createAgent(alice.publicKey);
	const bobAgent: Agent = createAgent(bob.publicKey);

	// Demonstrate key derivation with documents
	const aliceDerived: SharedSecret = computeSecretWithIdentity(
		alice.privateKey,
		alice.fingerprint,
		bobAgent,
		"chat:send",
	);

	const bobDerived: SharedSecret = computeSecretWithIdentity(
		bob.privateKey,
		bob.fingerprint,
		aliceAgent,
		"chat:send",
	);

	// Create a bot identity and demonstrate document signing
	const aliceBot: PrivateKeyPair = createIdentity();
	const aliceBotAgent: Agent = createAgent(aliceBot.publicKey);

	const aliceCreatedAliceBotProof: SignedAgreement = createDocument(
		alice,
		aliceBotAgent,
		"agent:contract",
	);

	const aliceBotAcceptance: SignedAgreement = createDocument(
		aliceBot,
		aliceAgent,
		"agent:contract:accept",
	);

	return new Response(
		JSON.stringify(
			{
				alice: {
					...alice,
					derivedSecret: aliceDerived,
				},
				bob: {
					...bob,
					derivedSecret: bobDerived,
				},
				equal: aliceDerived.value === bobDerived.value,
				aliceBot: {
					...aliceBot,
					documents: [aliceCreatedAliceBotProof, aliceBotAcceptance],
				},
			},
			null,
			2,
		),
		{
			headers: { "Content-Type": "application/json" },
		},
	);
}
