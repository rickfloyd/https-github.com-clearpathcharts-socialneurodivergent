
"use client";

import { useEffect, useMemo, useRef } from "react";
import { createChart, ColorType, Time, CandlestickData, CandlestickSeries } from "lightweight-charts";
import {
  neuroProfiles,
  type NeuroProfileId,
} from "../../lib/neuro/profiles";
import { lightweightThemeAdapter } from "../../lib/charts/lightweightThemeAdapter";

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export function LightweightCandles({
  data,
  profileId,
  height = 520,
}: {
  data?: Candle[];
  profileId: string;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const safeProfileId = (profileId as NeuroProfileId) in neuroProfiles ? (profileId as NeuroProfileId) : "standard_trader";
  const profile = useMemo(() => neuroProfiles[safeProfileId] || neuroProfiles.standard_trader, [safeProfileId]);
  const theme = useMemo(() => lightweightThemeAdapter(profile), [profile]);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: {
          type: ColorType.Solid,
          color: theme.layout.background.bottomColor,
        },
        textColor: theme.layout.textColor,
        attributionLogo: false,
      },
      grid: theme.grid,
      crosshair: theme.crosshair,
      rightPriceScale: theme.rightPriceScale,
      timeScale: theme.timeScale,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: theme.candleSeries.upColor,
      downColor: theme.candleSeries.downColor,
      wickUpColor: theme.candleSeries.wickUpColor,
      wickDownColor: theme.candleSeries.wickDownColor,
      borderUpColor: theme.candleSeries.borderUpColor,
      borderDownColor: theme.candleSeries.borderDownColor,
    });

    // Generate robust live static data if none provided
    const displayData = data || generateMockData(150);
    series.setData(displayData as CandlestickData<Time>[]);

    // Simulated live tick update
    const interval = setInterval(() => {
      const lastCandle = displayData[displayData.length - 1];
      const now = Math.floor(Date.now() / 1000);
      const rand = Math.random();
      const change = (rand - 0.5) * 5;
      
      const newClose = lastCandle.close + change;
      const newHigh = Math.max(lastCandle.high, newClose);
      const newLow = Math.min(lastCandle.low, newClose);
      
      series.update({
        time: now as Time,
        open: lastCandle.close,
        high: newHigh,
        low: newLow,
        close: newClose,
      });
      lastCandle.close = newClose;
      lastCandle.high = newHigh;
      lastCandle.low = newLow;
    }, 1500);

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (!containerRef.current) return;
      chart.applyOptions({
        width: containerRef.current.clientWidth,
        height,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, height, profile, theme]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height,
        borderRadius: 20,
        overflow: "hidden",
        background: `linear-gradient(180deg, ${profile.bgTop}, ${profile.bgBottom})`,
        boxShadow:
          theme.physics.glowBlur > 0
            ? `0 0 ${theme.physics.glowBlur}px ${profile.borderA}55`
            : "none",
      }}
    />
  );
}

// Helper to generate initial data
function generateMockData(count: number): Candle[] {
  const data: Candle[] = [];
  let time = Math.floor(Date.now() / 1000) - count * 60 * 60;
  let lastClose = 150;

  for (let i = 0; i < count; i++) {
    const open = lastClose + (Math.random() - 0.5) * 5;
    const high = open + Math.random() * 5;
    const low = open - Math.random() * 5;
    const close = low + Math.random() * (high - low);
    
    data.push({
      time,
      open,
      high,
      low,
      close,
    });
    
    time += 60 * 60; // plus 1 hour
    lastClose = close;
  }
  
  return data;
}
