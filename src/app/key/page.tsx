import { streamKeys } from "./lib";
import { StreamedKeyList } from "./streamed-key-list";

export default async function Page() {
  const { streamableValue, bestPromise } = streamKeys(60_000);
  return <StreamedKeyList streamableValue={streamableValue.value} size={50} />
}