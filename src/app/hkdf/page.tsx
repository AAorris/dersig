import HKDFVisualization from "./component"
import { fingerprint, createIdentity, derivePublicKey } from "@/lib/dersig"
import { computeSecretWithIdentity, encrypt, decrypt } from "@/lib/xsig"

// Server-side function to generate cryptographic data
async function generateCryptographicData(privateKey?: string) {
  // Get server identity from environment variables
  const serverIdentity = {
    privateKey: process.env.DERSIG_PRIVATE_KEY as string,
    publicKey: process.env.NEXT_PUBLIC_DERSIG_PUBLIC_KEY as string,
    fingerprint: fingerprint(process.env.NEXT_PUBLIC_DERSIG_PUBLIC_KEY as string),
  }

  // Generate client identity
  const clientIdentity = privateKey ? (
    {
      privateKey,
      publicKey: derivePublicKey(privateKey),
      fingerprint: fingerprint(derivePublicKey(privateKey)),
    }
  ) : createIdentity()

  // Compute shared secrets
  const sharedSecret = computeSecretWithIdentity(serverIdentity, clientIdentity, "identity:generated")

  const sharedSecretAlt = computeSecretWithIdentity(clientIdentity, serverIdentity, "identity:generated")

  // Encrypt and decrypt messages
  const message = "Hello, secure world!"
  const encryptedMessage = encrypt(sharedSecret, message)
  const decryptedServer = decrypt(sharedSecret, encryptedMessage)
  const decryptedClient = decrypt(sharedSecretAlt, encryptedMessage)

  // Return only the data needed by the client, without exposing private keys
  return {
    identities: {
      server: {
        fingerprint: serverIdentity.fingerprint,
        publicKey: serverIdentity.publicKey,
      },
      client: {
        fingerprint: clientIdentity.fingerprint,
        publicKey: clientIdentity.publicKey,
      },
    },
    messages: {
      encrypted: encryptedMessage,
      sharedSecretFingerprintServer: fingerprint(sharedSecret.value),
      sharedSecretFingerprintClient: fingerprint(sharedSecretAlt.value),
      decryptedServer,
      decryptedClient,
    },
  }
}

export default async function Home({ searchParams }: { searchParams: Promise<{ privateKey?: string }> }) {
  // Generate the initial cryptographic data
  const { privateKey } = await searchParams
  const initialData = await generateCryptographicData(privateKey)

  return (
    <main className="min-h-screen bg-background">
      <HKDFVisualization initialData={initialData} />
    </main>
  )
}
