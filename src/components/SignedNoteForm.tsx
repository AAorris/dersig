'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SignedNoteResult {
  success: boolean;
  error?: string;
  data?: {
    originalMessage: string;
    signedNote: string;
    isValid: boolean;
    signerPublicKey: string;
    recipientPublicKey?: string;
    message: string;
  };
}

interface SignedNoteFormProps {
  signerKeys: { privateKey: string; publicKey: string };
  defaultMessage: string;
  processSignedNote: (formData: FormData) => Promise<SignedNoteResult>;
}

export function SignedNoteForm({
  signerKeys,
  defaultMessage,
  processSignedNote
}: SignedNoteFormProps) {
  const [result, setResult] = useState<SignedNoteResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editedNote, setEditedNote] = useState<string>('');
  const [editedVerification, setEditedVerification] = useState<{
    isValid: boolean;
    message: string;
    error?: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      const result = await processSignedNote(formData);
      setResult(result);
      // Initialize the editable note with the signed result
      if (result.success && result.data) {
        setEditedNote(result.data.signedNote);
        setEditedVerification({
          isValid: result.data.isValid,
          message: result.data.message
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEditedNoteChange(newNote: string) {
    setEditedNote(newNote);

    if (!newNote.trim()) {
      setEditedVerification(null);
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch('/api/verify-note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signedNote: newNote,
          senderPublicKey: signerKeys.publicKey,
        }),
      });

      const verification = await response.json();

      setEditedVerification({
        isValid: verification.isValid,
        message: verification.message || '',
        error: verification.error
      });
    } catch (error) {
      setEditedVerification({
        isValid: false,
        message: '',
        error: 'Failed to verify note'
      });
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <>
      {/* Message Form */}
      <Card>
        <CardHeader>
          <CardTitle>Sign Your Message</CardTitle>
          <CardDescription>
            Write anything you want to sign. Could be a note, a promise, or just &quot;hello world&quot;.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {/* Hidden inputs for keys */}
            <input type="hidden" name="signerPrivateKey" value={signerKeys.privateKey} />
            <input type="hidden" name="signerPublicKey" value={signerKeys.publicKey} />

            <div>
              <Label htmlFor="message">Your Message</Label>
              <Textarea
                id="message"
                name="message"
                defaultValue={defaultMessage}
                placeholder="Type your message here..."
                className="min-h-[100px]"
                required
              />
            </div>

            <div>
              <Label htmlFor="recipientPublicKey" className="text-sm">
                Recipient (optional)
              </Label>
              <Input
                id="recipientPublicKey"
                name="recipientPublicKey"
                placeholder="Recipient's public key (leave empty for public message)"
                className="font-mono text-xs"
              />
            </div>

            <div className="bg-gray-50 border rounded-lg p-3">
              <Label className="text-xs text-muted-foreground">Your Signing Key (generated fresh)</Label>
              <div className="mt-1">
                <Input
                  value={signerKeys.publicKey}
                  readOnly
                  className="font-mono text-xs bg-white"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing...' : 'Sign Message'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error Display */}
      {result && !result.success && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{result.error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {result?.success && result.data && (
        <>
          {/* MARKER: results-display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Your Signed Message
                <Badge variant={result.data.isValid ? "default" : "destructive"}>
                  {result.data.isValid ? "Valid Signature" : "Invalid Signature"}
                </Badge>
              </CardTitle>
              <CardDescription>
                Your message wrapped with cryptographic proof. Anyone can verify this came from you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">The Signed Note</Label>
                <Textarea
                  value={result.data.signedNote}
                  readOnly
                  rows={Math.min(Math.max(6, result.data.signedNote.split('\n').length + 1), 15)}
                  className="mt-1 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This is what you would share with others. They can verify it came from you.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Original Message</Label>
                  <Textarea
                    value={result.data.originalMessage}
                    readOnly
                    rows={Math.min(Math.max(2, Math.ceil(result.data.originalMessage.length / 40)), 6)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Verified Message</Label>
                  <Textarea
                    value={result.data.message}
                    readOnly
                    rows={Math.min(Math.max(2, Math.ceil(result.data.message.length / 40)), 6)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Signature Valid:</Label>
                <Badge variant={result.data.isValid ? "default" : "destructive"}>
                  {result.data.isValid ? "✓ Yes" : "✗ No"}
                </Badge>
                {result.data.isValid && (
                  <span className="text-sm text-muted-foreground">
                    The signature proves this message came from you
                  </span>
                )}
              </div>

              {result.data.recipientPublicKey && (
                <div>
                  <Label className="text-sm font-medium">Recipient</Label>
                  <Input
                    value={result.data.recipientPublicKey}
                    readOnly
                    className="mt-1 font-mono text-xs"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tampering Demo Section */}
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔧 Try Tampering with the Signature
                {isVerifying && <Badge variant="secondary">Verifying...</Badge>}
                {editedVerification && !isVerifying && (
                  <Badge variant={editedVerification.isValid ? "default" : "destructive"}>
                    {editedVerification.isValid ? "Valid" : "Tampered"}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Edit the signed message below and watch how any changes break the signature verification.
                This demonstrates why digital signatures are tamper-evident.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Editable Signed Note</Label>
                <Textarea
                  value={editedNote}
                  onChange={(e) => handleEditedNoteChange(e.target.value)}
                  rows={Math.min(Math.max(6, editedNote.split('\n').length + 1), 15)}
                  className="mt-1 font-mono text-sm"
                  placeholder="The signed note will appear here after signing..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Try changing any character in the message, signature, or public key above.
                </p>
              </div>

              {editedVerification && !isVerifying && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">Verification Status:</Label>
                    <Badge variant={editedVerification.isValid ? "default" : "destructive"}>
                      {editedVerification.isValid ? "✓ Valid" : "✗ Invalid"}
                    </Badge>
                    {!editedVerification.isValid && (
                      <span className="text-sm text-orange-600">
                        {editedVerification.error || "Signature verification failed - content has been tampered with!"}
                      </span>
                    )}
                  </div>

                  {editedVerification.message && (
                    <div>
                      <Label className="text-sm font-medium">Extracted Message</Label>
                      <Textarea
                        value={editedVerification.message}
                        readOnly
                        rows={Math.min(Math.max(2, Math.ceil(editedVerification.message.length / 40)), 6)}
                        className="mt-1"
                      />
                    </div>
                  )}

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <h4 className="font-medium text-orange-800 mb-2">What is happening?</h4>
                    <p className="text-sm text-orange-700">
                      {editedVerification.isValid
                        ? "The signature is valid - no tampering detected. The message content matches what was originally signed."
                        : "The signature is invalid! This means either the message content, public key, or signature has been modified since it was originally signed. This is how digital signatures detect tampering."
                      }
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Understanding the Format</CardTitle>
              <CardDescription>
                See how your signed message is structured
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 border rounded-lg p-4">
                <h4 className="font-medium mb-2">The Parts</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <code className="bg-white px-2 py-1 rounded text-xs">header</code>
                    <span className="text-muted-foreground">Optional public key of the recipient</span>
                  </div>
                  <div className="flex gap-2">
                    <code className="bg-white px-2 py-1 rounded text-xs">~~~</code>
                    <span className="text-muted-foreground">Boundary marker (start of message)</span>
                  </div>
                  <div className="flex gap-2">
                    <code className="bg-white px-2 py-1 rounded text-xs">Your message</code>
                    <span className="text-muted-foreground">The actual content you wrote</span>
                  </div>
                  <div className="flex gap-2">
                    <code className="bg-white px-2 py-1 rounded text-xs">~~~</code>
                    <span className="text-muted-foreground">Boundary marker (end of message)</span>
                  </div>
                  <div className="flex gap-2">
                    <code className="bg-white px-2 py-1 rounded text-xs">Public key</code>
                    <span className="text-muted-foreground">Your public signing key</span>
                  </div>
                  <div className="flex gap-2">
                    <code className="bg-white px-2 py-1 rounded text-xs">Signature</code>
                    <span className="text-muted-foreground">Cryptographic proof you signed this</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Your Public Key</Label>
                <Input
                  value={result.data.signerPublicKey}
                  readOnly
                  className="mt-1 font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Share this with others so they can verify your signatures
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
} 