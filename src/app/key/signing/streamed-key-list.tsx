'use client';
import type { generatePair } from './lib';
import { memo } from 'react';
import { useStreamedKeys, getColorForScore, type KeyPair } from '../lib';
import type { StreamableValue } from 'ai/rsc';

export function StreamedKeyList(props: {
  size: number
  streamableValue: StreamableValue<(ReturnType<typeof generatePair> | number)[]>
}) {
  const { bestSet, totalPairsSeen, copyToClipboard } = useStreamedKeys(props.streamableValue, props.size);

  return (
    <div className="w-full">
      <div className="p-2 text-sm text-gray-400 font-mono fixed bottom-0 right-0 bg-black">
        Pairs processed: {totalPairsSeen}
      </div>
      <div className="p-2 px-4 font-mono grid grid-cols-2 gap-2 w-full justify-between w-[968px] mx-auto items-center" style={{
        gridTemplateColumns: "1fr 50ch"
      }}>{bestSet.filter((v): v is NonNullable<typeof v> => v !== null).map((v) => <Line key={v.publicKey} v={v} copyToClipboard={() => copyToClipboard(v)} />)}</div>
    </div>
  );
}

const Line = memo(({ v, copyToClipboard }: { v: NonNullable<ReturnType<typeof generatePair>>, copyToClipboard: (v: ReturnType<typeof generatePair>) => void }) => {
  const color = getColorForScore(v.score);
  return (
    <>
      <span className={`${color.strong}`}>
        {`${v.matches.join(' ')} ${Number(v.score).toFixed(0)}`}
      </span>
      <button
        className={`text-right cursor-pointer ${color.dim} h-[40px]`}
        onClick={() => copyToClipboard(v)}
        onKeyDown={() => copyToClipboard(v)}
        type="button"
        tabIndex={0}
      >{
          v.prettyPublicKey.map(x => {
            if (v.matches.includes(x.toLowerCase())) {
              return <span className={`${color.strong}`} key={x}>{x}</span>
            }
            return <span key={x}>{x}</span>;
          })}</button>
    </>
  )
})
Line.displayName = "Line"