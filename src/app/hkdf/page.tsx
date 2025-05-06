import HKDFVisualization from "./component"
import { fingerprint, createIdentity } from "@/lib/dersig"
import { computeSecretWithIdentity, encrypt, decrypt, createDocument } from "@/lib/xsig"

// Server-side function to generate cryptographic data
async function generateCryptographicData() {
  // Get server identity from environment variables
  const serverIdentity = {
    privateKey: process.env.DERSIG_PRIVATE_KEY as string,
    publicKey: process.env.NEXT_PUBLIC_DERSIG_PUBLIC_KEY as string,
    fingerprint: fingerprint(process.env.NEXT_PUBLIC_DERSIG_PUBLIC_KEY as string),
  }

  // Generate client identity
  const clientIdentity = createIdentity()

  // Compute shared secrets
  const sharedSecret = computeSecretWithIdentity(serverIdentity, clientIdentity, "identity:generated")

  const sharedSecretAlt = computeSecretWithIdentity(clientIdentity, serverIdentity, "identity:generated")

  // Create signed documents
  const serverDocument = createDocument(serverIdentity, clientIdentity, "identity:generated")
  const clientDocument = createDocument(clientIdentity, serverIdentity, "identity:generated")

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
    documents: {
      server: serverDocument,
      client: clientDocument,
    },
    messages: {
      encrypted: encryptedMessage,
      decryptedServer,
      decryptedClient,
    },
  }
}

export default async function Home() {
  // Generate the initial cryptographic data
  const initialData = await generateCryptographicData()

  return (
    <main className="min-h-screen bg-background">
      <HKDFVisualization initialData={initialData} />
    </main>
  )
}
