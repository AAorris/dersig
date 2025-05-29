'use client';
import { readStreamableValue, type StreamableValue } from 'ai/rsc';
import type { generatePair } from './lib';
import { memo, useEffect, useState } from 'react';

export function StreamedKeyList(props: {
  size: number
  streamableValue: StreamableValue<ReturnType<typeof generatePair>[]>
}) {
  // const values = useRef<ReturnType<typeof generatePair>[]>([]);
  const [bestSet, setBestSet] = useState<ReturnType<typeof generatePair>[]>([]);
  const [totalPairsSeen, setTotalPairsSeen] = useState<number>(0);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    let done = false;
    (async () => {
      for await (const pairs of readStreamableValue(props.streamableValue)) {
        if (!pairs) continue;
        if (done) break;

        // Update the total count of pairs seen
        setTotalPairsSeen(prev => prev + pairs.filter(p => p !== null).length);

        // values.current.push(pair)
        setBestSet((prev) => {
          // Filter out null values and sort the batch by score (highest first)
          const sortedBatch = pairs
            .filter((p): p is NonNullable<typeof p> => p !== null)
            .sort((a, b) => b.score - a.score);

          if (sortedBatch.length === 0) return prev;

          // If we have less than 2 items in prev, just merge and sort
          if (prev.length < 2) {
            const newSet = [...sortedBatch, ...prev]
              .filter((p): p is NonNullable<typeof p> => p !== null)
              .sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0));
            return newSet.slice(0, props.size);
          }

          // Ensure prev is sorted (it should be, but just in case)
          const sortedPrev = [...prev]
            .filter((p): p is NonNullable<typeof p> => p !== null)
            .sort((a, b) => b.score - a.score);

          // Merge the sorted batch with the sorted previous set
          const merged: NonNullable<ReturnType<typeof generatePair>>[] = [];
          let batchIndex = 0;
          let prevIndex = 0;

          // Merge while maintaining order
          while (merged.length < props.size && (batchIndex < sortedBatch.length || prevIndex < sortedPrev.length)) {
            const batchItem = sortedBatch[batchIndex];
            const prevItem = sortedPrev[prevIndex];

            if (batchIndex >= sortedBatch.length) {
              // No more batch items, take from prev
              if (prevItem) {
                merged.push(prevItem);
              }
              prevIndex++;
            } else if (prevIndex >= sortedPrev.length) {
              // No more prev items, take from batch
              merged.push(batchItem);
              batchIndex++;
            } else if (batchItem.score > prevItem.score) {
              // Batch item has higher score
              merged.push(batchItem);
              batchIndex++;
            } else {
              // Prev item has higher or equal score
              merged.push(prevItem);
              prevIndex++;
            }
          }

          // If we couldn't fit all batch items and we're at capacity,
          // replace the last item with the first unprocessed batch item
          if (merged.length === props.size && batchIndex < sortedBatch.length) {
            const remainingBatchItem = sortedBatch[batchIndex];
            const lastMergedItem = merged[merged.length - 1];

            if (remainingBatchItem && lastMergedItem && remainingBatchItem.score > lastMergedItem.score) {
              merged[merged.length - 1] = remainingBatchItem;
            }
          }

          return merged;
        })
      }
    })().catch(e => setError(e))
    return () => {
      // values.current = [];
      setBestSet([]);
      setTotalPairsSeen(0);
      done = true;
    }
  }, [props.streamableValue, props.size]);

  return (
    <div className="w-full">
      <div className="p-2 text-sm text-gray-400 font-mono">
        Pairs processed: {totalPairsSeen.toLocaleString()}
      </div>
      <div className="p-2 font-mono grid grid-cols-3 gap-2 w-full justify-between" style={{
        gridTemplateColumns: "300px 1fr 43ch"
      }}>{bestSet.filter((v): v is NonNullable<typeof v> => v !== null).map((v) => <Line key={v.publicKey} v={v} />)}</div>
    </div>
  );
}

/**
 * Normal – White
 * Magic – Blue
 * Rare – Yellow
 * Legendary – Orange
 * Unique – Gold
 */
const colorMap = {
  "normal": { strong: "text-gray-400", dim: "text-gray-500" },
  "magic": { strong: "text-blue-400", dim: "text-blue-600" },
  "rare": { strong: "text-yellow-400", dim: "text-yellow-600" },
  "legendary": { strong: "text-orange-400", dim: "text-orange-600" },
  "unique": { strong: "text-gold-400", dim: "text-gold-600" },
}

const Line = memo(({ v }: { v: NonNullable<ReturnType<typeof generatePair>> }) => {
  const color = colorMap[v.score > 4096 ? "legendary" : v.score > 2048 ? "rare" : v.score > 1024 ? "magic" : "normal"];
  return (
    <>
      <span className={color.strong}>
        {`${v.matches.join(' ')} ${Number(v.score).toFixed(0)}`}
      </span>
      <span className={`text-right cursor-pointer ${color.dim}`}>{
        v?.prettyPublicKey.map(x => {
          if (v.matches.includes(x.toLowerCase())) {
            return <span className={`${color.strong}`} key={x}>{x}</span>
          }
          return <span key={x}>{x}</span>;
        })}</span>
      <span className={`text-right ${color.dim}`}>{v?.privateKey}</span>
    </>
  )
})
Line.displayName = "Line"