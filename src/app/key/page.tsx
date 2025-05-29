import { Suspense } from "react";
import { streamKeys } from "./lib";
import { StreamedKeyList } from "./streamed-key-list";

export const dynamic = 'force-dynamic';

export default async function Page() {
  return (
    <div className="bg-black flex flex-col gap-4 w-full min-h-[100vh] lg:text-lg xl:text-xl">
      <Suspense>
        <Content />
      </Suspense>
    </div>
  )
}

function Content() {
  const { streamableValue } = streamKeys(process.env.VERCEL_ENV ? 1_000 : 60_000);
  return (
    <StreamedKeyList streamableValue={streamableValue.value} size={50} />
  )
}
