
import { DeepPartial, ChartOptions, ColorType } from 'lightweight-charts';
import { NeuroProfile } from '../../types';

export const adaptLightweightTheme = (profile: NeuroProfile): DeepPartial<ChartOptions> => {
  const { ui, candles } = profile;

  return {
    layout: {
      background: {
        type: ColorType.VerticalGradient,
        topColor: ui.bgTop,
        bottomColor: ui.bgBottom,
      },
      textColor: ui.text,
      fontSize: 12,
      fontFamily: 'Inter, sans-serif',
    },
    grid: {
      vertLines: {
        color: ui.gridColor,
      },
      horzLines: {
        color: ui.gridColor,
      },
    },
    rightPriceScale: {
      borderColor: ui.borderA,
      textColor: ui.text,
    },
    timeScale: {
      borderColor: ui.borderA,
    },
    crosshair: {
      vertLine: {
        color: ui.accent,
        labelBackgroundColor: ui.accent,
      },
      horzLine: {
        color: ui.accent,
        labelBackgroundColor: ui.accent,
      },
    },
  };
};

export const adaptCandleSeriesOptions = (profile: NeuroProfile) => {
  const { candles } = profile;

  return {
    upColor: candles.upColor,
    downColor: candles.downColor,
    borderVisible: true,
    wickVisible: true,
    borderUpColor: candles.borderUpColor,
    borderDownColor: candles.borderDownColor,
    wickUpColor: candles.wickUpColor,
    wickDownColor: candles.wickDownColor,
  };
};
