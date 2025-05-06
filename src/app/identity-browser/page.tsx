import { createIdentity } from "@/lib/dersig";

function IdentityGrid({ count, filterChar }: { count: number, filterChar?: string }) {
  const identities = Array.from({ length: count }, () => createIdentity()).filter(identity => {
    return filterChar ? identity.fingerprint?.startsWith(filterChar) ?? false : true;
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "4px", fontFamily: "monospace", backgroundColor: "#000", color: "#0f0" }}>
      {identities.map((identity, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <div key={index} style={{ padding: "2px" }}>
          <details>
            <summary>{identity.fingerprint}</summary>
            <p>Private Key: {identity.privateKey}</p>
            <p>Public Key: {identity.publicKey}</p>
          </details>
        </div>
      ))}
    </div>
  );
}

export default function IdentityBrowser({ searchParams }: { searchParams: { c?: string } }) {
  return <IdentityGrid count={500} filterChar={searchParams.c} />;
}
