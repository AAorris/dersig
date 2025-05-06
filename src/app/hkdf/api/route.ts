import { computeSecretWithIdentity } from "@/lib/xsig";
import { signMessage, createIdentity } from "@/lib/dersig";
import type { Identity, PrivateKeyPair, SharedSecret } from "@/lib/types";

export async function GET() {
	// Create two separate identities
	const alicePrivate = createIdentity();
	const bobPrivate = createIdentity();

	const pub = ({
		publicKey,
		fingerprint,
	}: ReturnType<typeof createIdentity>): Identity => ({
		publicKey,
		fingerprint,
	});

	const alice: Identity = pub(alicePrivate);
	const bob: Identity = pub(bobPrivate);

	// Demonstrate key derivation with documents
	const aliceDerived: SharedSecret = computeSecretWithIdentity(
		alicePrivate,
		bob,
		"share:overrides",
	);

	const bobDerived: SharedSecret = computeSecretWithIdentity(
		bobPrivate,
		alice,
		"share:overrides",
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
			},
			null,
			2,
		),
		{
			headers: { "Content-Type": "application/json" },
		},
	);
}
