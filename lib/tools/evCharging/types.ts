// EV Charging Tool Types and Validation

export interface EvModelSpec {
  make: string;
  model: string;
  trim?: string;
  batteryKwh: number;
  efficiencyMpkwh?: number;
  source: string;
  lastUpdated?: string;
}

export interface EvChargingInputs {
  batteryKwh: number;
  efficiencyMpkwh?: number;
  socFrom: number;
  socTo: number;
  homeRatePeakPence: number;
  homeRateOffPeakPence?: number;
  publicRateSlowPence: number;
  publicRateFastPence: number;
  publicRateRapidPence: number;
  lossFactor: number;
}

export interface EvChargingOutputs {
  kwhNeeded: number;
  kwhWithLoss: number;
  costsGBP: {
    homePeak: number;
    homeOffPeak?: number;
    publicSlow: number;
    publicFast: number;
    publicRapid: number;
  };
  costPerMilePence?: {
    homePeak: number;
    homeOffPeak?: number;
    publicSlow: number;
    publicFast: number;
    publicRapid: number;
  };
  insights: string[];
}

export function validateEvChargingInputs(inputs: EvChargingInputs): string[] {
  const errors: string[] = [];
  if (inputs.socFrom < 0 || inputs.socFrom > 100) {
    errors.push('Starting SoC must be between 0 and 100.');
  }
  if (inputs.socTo < 0 || inputs.socTo > 100) {
    errors.push('Target SoC must be between 0 and 100.');
  }
  if (inputs.socTo <= inputs.socFrom) {
    errors.push('Target SoC must be greater than starting SoC.');
  }
  if (inputs.batteryKwh <= 0) {
    errors.push('Battery capacity must be greater than 0.');
  }
  if (inputs.homeRatePeakPence < 0) {
    errors.push('Home peak rate must be 0 or greater.');
  }
  if (inputs.homeRateOffPeakPence !== undefined && inputs.homeRateOffPeakPence < 0) {
    errors.push('Home off-peak rate must be 0 or greater.');
  }
  if (inputs.publicRateSlowPence < 0) {
    errors.push('Public slow rate must be 0 or greater.');
  }
  if (inputs.publicRateFastPence < 0) {
    errors.push('Public fast rate must be 0 or greater.');
  }
  if (inputs.publicRateRapidPence < 0) {
    errors.push('Public rapid rate must be 0 or greater.');
  }
  if (inputs.lossFactor < 0 || inputs.lossFactor > 0.25) {
    errors.push('Charging loss factor must be between 0 and 0.25.');
  }
  return errors;
}
