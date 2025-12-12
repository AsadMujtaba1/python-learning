import { EvChargingInputs, EvChargingOutputs } from "./types";

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatCurrencyGBP(n: number): string {
  return `£${round2(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function calculateEvCharging(inputs: EvChargingInputs): EvChargingOutputs {
  const { batteryKwh, socFrom, socTo, homeRatePeakPence, homeRateOffPeakPence, publicRateSlowPence, publicRateFastPence, publicRateRapidPence, lossFactor, efficiencyMpkwh } = inputs;

  const kwhNeeded = round2(batteryKwh * (socTo - socFrom) / 100);
  const kwhWithLoss = round2(kwhNeeded * (1 + lossFactor));

  const homePeakRateGBP = homeRatePeakPence / 100;
  const homeOffPeakRateGBP = homeRateOffPeakPence !== undefined ? homeRateOffPeakPence / 100 : undefined;
  const publicSlowRateGBP = publicRateSlowPence / 100;
  const publicFastRateGBP = publicRateFastPence / 100;
  const publicRapidRateGBP = publicRateRapidPence / 100;

  const costsGBP = {
    homePeak: round2(kwhWithLoss * homePeakRateGBP),
    homeOffPeak: homeOffPeakRateGBP !== undefined ? round2(kwhWithLoss * homeOffPeakRateGBP) : undefined,
    publicSlow: round2(kwhWithLoss * publicSlowRateGBP),
    publicFast: round2(kwhWithLoss * publicFastRateGBP),
    publicRapid: round2(kwhWithLoss * publicRapidRateGBP),
  };

  let costPerMilePence: EvChargingOutputs["costPerMilePence"] = undefined;
  if (efficiencyMpkwh && efficiencyMpkwh > 0) {
    costPerMilePence = {
      homePeak: round2(homeRatePeakPence / efficiencyMpkwh),
      homeOffPeak: homeRateOffPeakPence !== undefined ? round2(homeRateOffPeakPence / efficiencyMpkwh) : undefined,
      publicSlow: round2(publicRateSlowPence / efficiencyMpkwh),
      publicFast: round2(publicRateFastPence / efficiencyMpkwh),
      publicRapid: round2(publicRateRapidPence / efficiencyMpkwh),
    };
  }

  // Insights
  const insights: string[] = [];
  if (costsGBP.homeOffPeak !== undefined && costsGBP.homePeak > 0) {
    const diff = costsGBP.homePeak - costsGBP.homeOffPeak;
    if (diff > 0.01) {
      insights.push(`Off‑peak charging could save approximately ${formatCurrencyGBP(diff)} vs peak for this session.`);
    }
  }
  if (costsGBP.publicRapid > 0 && costsGBP.homePeak > 0) {
    const ratio = round2(costsGBP.publicRapid / costsGBP.homePeak);
    if (ratio > 1.05) {
      insights.push(`Rapid public charging is approximately ${ratio}× the cost of home peak for this session.`);
    }
  }
  insights.push(`Estimated additional home energy for this charge: ${kwhWithLoss} kWh.`);

  return {
    kwhNeeded,
    kwhWithLoss,
    costsGBP,
    costPerMilePence,
    insights,
  };
}
