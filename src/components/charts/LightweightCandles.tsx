
import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time, CandlestickSeries } from 'lightweight-charts';
import { INTERFACE_PROFILES } from '../../lib/interface/profiles';
import { resolveInterfacePhysics } from '../../lib/interface/interfacePhysics';
import { adaptLightweightTheme, adaptCandleSeriesOptions } from '../../lib/charts/lightweightThemeAdapter';

interface LightweightCandlesProps {
  profileId: string;
  symbol: string;
  timeframe: string;
  data?: CandlestickData<Time>[];
}

export const LightweightCandles: React.FC<LightweightCandlesProps> = ({
  profileId,
  symbol,
  timeframe,
  data = [],
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [isReady, setIsReady] = useState(false);

  const profile = INTERFACE_PROFILES[profileId] || INTERFACE_PROFILES.standard_trader;
  const physics = resolveInterfacePhysics(profile);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      ...adaptLightweightTheme(profile),
    });

    const series = chart.addSeries(CandlestickSeries, adaptCandleSeriesOptions(profile));
    
    // Mock data if none provided
    const mockData: CandlestickData<Time>[] = data.length > 0 ? data : generateMockData(100);
    series.setData(mockData);

    chartRef.current = chart;
    seriesRef.current = series;
    setIsReady(true);

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0 || !chartRef.current) return;
      const { width, height } = entries[0].contentRect;
      chartRef.current.applyOptions({ width, height });
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  // Update theme when profile changes
  useEffect(() => {
    if (chartRef.current && seriesRef.current && isReady) {
      chartRef.current.applyOptions(adaptLightweightTheme(profile));
      seriesRef.current.applyOptions(adaptCandleSeriesOptions(profile));
    }
  }, [profileId, isReady]);

  // Listen for theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (chartRef.current && seriesRef.current && isReady) {
        const styles = getComputedStyle(document.documentElement);
        const adaptiveOptions = {
          upColor: styles.getPropertyValue('--candle-up').trim(),
          downColor: styles.getPropertyValue('--candle-down').trim(),
          borderVisible: false,
          wickUpColor: styles.getPropertyValue('--candle-up').trim(),
          wickDownColor: styles.getPropertyValue('--candle-down').trim(),
        };
        seriesRef.current.applyOptions(adaptiveOptions);
      }
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  }, [isReady]);

  return (
    <div className="relative w-full h-full overflow-hidden group bg-black">
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        
        {/* THE BRANDING SHIELD: COVERS THE WATERMARK COMPLETELY */}
        <div className="branding-anchor-shield">
          <span style={{ color: '#00f2ff', fontSize: '8px', fontWeight: 'bold', letterSpacing: '1px' }}>
            CLEARPATH
          </span>
        </div>

        {/* THE LIVE DATA ENGINE */}
        <div 
          ref={chartContainerRef} 
          className="w-full h-full"
          style={{
            filter: `blur(${physics.glowBlur}px)`,
            transition: `all ${physics.animationSpeed}ms ease-in-out`,
          }}
        />
      </div>
      
      {/* Symbol Overlay */}
      <div className="absolute top-4 left-4 pointer-events-none z-10">
        <div className="flex flex-col">
          <span className="text-lg font-black tracking-tighter uppercase" style={{ color: profile.ui.text }}>
            {symbol}
          </span>
          <span className="text-[10px] uppercase tracking-widest opacity-50" style={{ color: profile.ui.text }}>
            {timeframe} • {profile.name}
          </span>
        </div>
      </div>

      {/* Glow Overlay for high intensity modes */}
      {physics.glowBlur > 0 && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-20 mix-blend-screen"
          style={{
            boxShadow: `inset 0 0 ${physics.glowBlur * 10}px ${profile.ui.accent}`,
          }}
        />
      )}
    </div>
  );
};

// Helper to generate mock data
function generateMockData(count: number): CandlestickData<Time>[] {
  const data: CandlestickData<Time>[] = [];
  let time = new Date(Date.now() - count * 24 * 60 * 60 * 1000);
  let lastClose = 150;

  for (let i = 0; i < count; i++) {
    const open = lastClose + (Math.random() - 0.5) * 5;
    const high = open + Math.random() * 5;
    const low = open - Math.random() * 5;
    const close = low + Math.random() * (high - low);
    
    data.push({
      time: (time.getTime() / 1000) as Time,
      open,
      high,
      low,
      close,
    });
    
    time = new Date(time.getTime() + 24 * 60 * 60 * 1000);
    lastClose = close;
  }
  
  return data;
}
