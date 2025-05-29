# DerSig

A cryptogrpahic playground and web application working with Ed25519 digital signatures, X25519 key exchange, and authenticated encryption for secure communications.

## Overview

DerSig is a comprehensive cryptographic toolkit that provides:

- **Digital Signatures**: Ed25519 key generation, signing, and verification
- **Key Exchange**: X25519 Elliptic Curve Diffie-Hellman key exchange
- **Authenticated Encryption**: ChaCha20-Poly1305 support
- **Shared Secrets**: HKDF-based key derivation for secure channels
- **RTC Interface**: Mechanisms for two way data channels

## Features

### Core Cryptography

#### Digital Signatures (Ed25519)
- Generate Ed25519 signing key pairs
- Sign messages with private keys
- Verify signatures with public keys
- Import/export keys in PKCS#8 format
- Fingerprint generation for key identification

#### Encryption (X25519 + ChaCha-Poly1305)
- Generate X25519 encryption key pairs
- Encrypt/decrypt UTF-8 messages
- Shared secret derivation using ECDH
- Authenticated encryption with integrity protection

#### Combined Operations
- Sign-then-encrypt workflow for authenticated and confidential messaging
- Ephemeral key generation for forward secrecy
- Topic-based key derivation for group communications

### Key Management
- Base64URL encoding for compact key representation
- Cryptographic fingerprints for key identification
- Key pair import/export functionality
- Header stripping for raw key material extraction

## Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## Usage

### Basic Key Operations

```typescript
import { createSigningKeyPair, signMessage, verifyMessage } from './src/lib/signing';
import { createEncryptionKeyPair, encryptUtf8, decryptUtf8 } from './src/lib/encryption';

// Generate signing keys
const signingKeys = createSigningKeyPair();
console.log('Private Key:', signingKeys.privateKey);
console.log('Public Key:', signingKeys.publicKey);

// Sign a message
const message = "Hello, world!";
const signature = signMessage(signingKeys.privateKey, message);

// Verify signature
const isValid = verifyMessage({
  publicKey: signingKeys.publicKey,
  message: message,
  signature: signature
});
```

### Encryption and Shared Secrets

```typescript
import { getSharedSecret } from './src/lib/shared-secret';

// Generate encryption key pairs
const aliceKeys = createEncryptionKeyPair();
const bobKeys = createEncryptionKeyPair();

// Derive shared secret
const sharedSecret = getSharedSecret({
  localPrivateKey: aliceKeys.privateKey,
  remotePublicKey: bobKeys.publicKey
});

// Encrypt message
const encrypted = encryptUtf8({
  secretKey: sharedSecret,
  message: "Secret message"
});

// Decrypt message
const decrypted = decryptUtf8(encrypted, sharedSecret);
```

### Signed Encryption

```typescript
import { encryptAndSign, verifyAndDecrypt } from './src/lib/signed-encryption';

const senderSigningKeys = createSigningKeyPair();
const receiverEncryptionKeys = createEncryptionKeyPair();

// Encrypt and sign
const encryptedMessage = encryptAndSign({
  message: "Confidential and authenticated message",
  senderPrivateSigningKey: senderSigningKeys.privateKey,
  receiverPublicEncryptionKey: receiverEncryptionKeys.publicKey,
  topic: "secure-channel"
});

// Verify and decrypt
const decryptedMessage = verifyAndDecrypt({
  message: encryptedMessage,
  topic: "secure-channel",
  receiverPrivateEncryptionKey: receiverEncryptionKeys.privateKey,
  senderPublicSigningKey: senderSigningKeys.publicKey
});
```

## Architecture

### Library Structure

```
src/lib/
├── signing.ts              # Ed25519 digital signatures
├── encryption.ts           # X25519 + AES-256-GCM encryption
├── shared-secret.ts        # ECDH key exchange with HKDF
├── signed-encryption.ts    # Combined sign-then-encrypt
├── buffer-encoding.ts      # Base64URL encoding and fingerprinting
```

Run tests with:
```bash
pnpm test
```

## Dependencies

### Core Cryptography
- `@noble/curves`: Pure JavaScript elliptic curve implementations
- `@node-rs/xxhash`: Fast hashing for fingerprints

### Web Framework
- `next`: React framework for the web interface
- `react`: UI library
- `tailwindcss`: Utility-first CSS framework
- `@radix-ui/*`: Accessible UI components

### Development
- `typescript`: Type safety
- `jest`: Testing framework
- `eslint`: Code linting

## License

This project is private and not currently licensed for public use.

## Contributing

This is a private project. Please contact the maintainer for contribution guidelines.
