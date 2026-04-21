
"use client";

import { ReactNode } from "react";
import {
  neuroProfiles,
  type NeuroProfileId,
} from "../../lib/neuro/profiles";

const TIMEFRAMES = ["1m", "5m", "10m", "15m", "30m", "1h", "4h", "1d", "1w", "1M", "YTD"];

export function ChartFrame({
  title,
  profileId,
  timeframe,
  onTimeframeChange,
  children,
}: {
  title: string;
  profileId: string;
  timeframe?: string;
  onTimeframeChange?: (tf: string) => void;
  children: ReactNode;
}) {
  const safeProfileId = (profileId as NeuroProfileId) in neuroProfiles ? (profileId as NeuroProfileId) : "standard_trader";
  const profile = neuroProfiles[safeProfileId];

  return (
    <div
      className="rounded-[24px] p-[2px] w-full h-full"
      style={{
        background: `linear-gradient(135deg, ${profile.borderA}, ${profile.borderB})`,
      }}
    >
      <div
        className="rounded-[22px] overflow-hidden w-full h-full flex flex-col"
        style={{
          background: `linear-gradient(180deg, ${profile.bgTop}, ${profile.bgBottom})`,
        }}
      >
        <div className="px-5 pt-4 pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold" style={{ color: profile.text }}>
              {title}
            </h3>
            <span className="text-xs opacity-80" style={{ color: profile.text }}>
              {profile.label}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange?.(tf)}
                className="px-3 py-1 text-xs rounded-md border transition"
                style={{
                  color: profile.text,
                  borderColor: timeframe === tf ? profile.borderA : "rgba(255,255,255,0.10)",
                  background:
                    timeframe === tf ? `${profile.borderA}22` : "rgba(255,255,255,0.03)",
                }}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 flex-1 h-full" style={{ background: profile.panel }}>
          {children}
        </div>
      </div>
    </div>
  );
}
