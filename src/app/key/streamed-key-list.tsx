'use client';
import { readStreamableValue, type StreamableValue } from 'ai/rsc';
import type { generatePair } from './lib';
import { memo, useEffect, useState } from 'react';

export function StreamedKeyList(props: {
  size: number
  streamableValue: StreamableValue<ReturnType<typeof generatePair>>
}) {
  // const values = useRef<ReturnType<typeof generatePair>[]>([]);
  const [bestSet, setBestSet] = useState<ReturnType<typeof generatePair>[]>([]);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    let done = false;
    (async () => {
      for await (const pair of readStreamableValue(props.streamableValue)) {
        if (!pair) continue;
        if (done) break;
        // values.current.push(pair)
        setBestSet((prev) => {
          // Find the correct position to insert the new pair
          if (prev.length < 2) {
            // If we have less than 2 pairs, just add and sort
            const newSet = [pair, ...prev].filter((p): p is NonNullable<typeof p> => p !== null).sort((a, b) => b.score - a.score);
            return newSet.slice(0, props.size);
          }

          const lastScore = prev[prev.length - 1]?.score ?? 0;

          // If the new pair's score is between first and last, or better than first
          if (pair.score >= lastScore) {
            // Find the correct insertion point
            let insertIndex = prev.length;
            for (let i = 0; i < prev.length; i++) {
              if (pair.score > (prev[i]?.score ?? 0)) {
                insertIndex = i;
                break;
              }
            }

            // Insert at the correct position
            const newSet = [...prev];
            newSet.splice(insertIndex, 0, pair);

            // Keep only the top N
            return newSet.slice(0, props.size);
          }

          // If score is worse than the last pair and we're at capacity, ignore it
          if (prev.length >= props.size) {
            return prev;
          }

          // Otherwise, add to the end
          return [...prev, pair].slice(0, props.size);
        })
      }
    })().catch(e => setError(e))
    return () => {
      // values.current = [];
      setBestSet([]);
      done = true;
    }
  }, [props.streamableValue, props.size]);

  return <div className="font-mono grid grid-cols-3 gap-2 w-full justify-between">{bestSet.filter((v): v is NonNullable<typeof v> => v !== null).map((v) => <Line key={v.publicKey} v={v} />)}</div>;
}

const Line = memo(({ v }: { v: NonNullable<ReturnType<typeof generatePair>> }) => {
  return (
    <>
      <div className="flex gap-2">
        {v.matches.map(x => <div key={x}>{x}</div>)}
      </div>
      <div>{
        v?.prettyPublicKey.map(x => {
          if (v.matches.includes(x.toLowerCase())) {
            return <span className="text-orange-500 mx-[4px]" key={x}>{x}</span>
          }
          return <span className="text-gray-500" key={x}>{x}</span>;
        })}</div>
      <div>{v?.privateKey}</div>
    </>
  )
})
Line.displayName = "Line"