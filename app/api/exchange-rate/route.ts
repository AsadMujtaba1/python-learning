/**
 * ExchangeRate API Integration (FREE, NO KEY REQUIRED)
 * 
 * Provides:
 * - Real-time currency exchange rates
 * - Historical exchange rates
 * - Currency conversion
 * 
 * API: https://api.exchangerate.host/
 * Docs: https://exchangerate.host/#/
 * 
 * Use cases:
 * - Convert energy costs for international users
 * - Show costs in user's preferred currency
 * - Compare UK energy prices with other countries
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, withTimeout } from '@/lib/utils/errorHandling';
import { CacheManager } from '@/lib/utils/caching';
import { API } from '@/lib/utils/constants';

const cache = new CacheManager();

interface ExchangeRateResponse {
  base: string; // Base currency (GBP)
  rates: Record<string, number>; // All currency rates
  date: string;
}

interface ConversionResponse {
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
  date: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'rates' or 'convert'
    const from = searchParams.get('from') || 'GBP';
    const to = searchParams.get('to');
    const amount = searchParams.get('amount');

    if (type === 'convert') {
      if (!to || !amount) {
        return NextResponse.json(
          { error: 'Parameters "to" and "amount" required for conversion' },
          { status: 400 }
        );
      }

      return await convertCurrency(from, to, parseFloat(amount));
    } else {
      // Default: get all rates with GBP as base
      return await getExchangeRates(from);
    }

  } catch (error) {
    return NextResponse.json(
      { error: handleApiError(error, '/api/exchange-rate').userMessage },
      { status: 500 }
    );
  }
}

async function getExchangeRates(base: string = 'GBP'): Promise<NextResponse> {
  const cacheKey = `exchange:rates:${base}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, cached: true });
  }

  try {
    const url = `https://api.exchangerate.host/latest?base=${base}`;
    
    const response = await withTimeout(
      fetch(url),
      API.TIMEOUT_DEFAULT
    );

    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.status}`);
    }

    const data = await response.json();

    const result: ExchangeRateResponse = {
      base: data.base,
      rates: data.rates,
      date: data.date,
    };

    cache.set(cacheKey, result);
    return NextResponse.json(result);

  } catch (error) {
    throw error;
  }
}

async function convertCurrency(
  from: string,
  to: string,
  amount: number
): Promise<NextResponse> {
  const cacheKey = `exchange:convert:${from}:${to}`;
  let rate = await cache.get<number>(cacheKey);

  if (!rate) {
    try {
      const url = `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=1`;
      
      const response = await withTimeout(
        fetch(url),
        API.TIMEOUT_DEFAULT
      );

      if (!response.ok) {
        throw new Error(`Conversion API error: ${response.status}`);
      }

      const data = await response.json();
      rate = data.info.rate;

      await cache.set(cacheKey, rate);
    } catch (error) {
      throw error;
    }
  }

  // Type guard: rate should be defined at this point
  if (!rate) {
    throw new Error('Failed to fetch exchange rate');
  }

  const result: ConversionResponse = {
    from,
    to,
    amount,
    result: amount * rate,
    rate,
    date: new Date().toISOString().split('T')[0],
  };

  return NextResponse.json(result);
}

/**
 * Common currency symbols
 */
const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: '£',
  USD: '$',
  EUR: '€',
  JPY: '¥',
  CHF: 'Fr',
  CAD: 'C$',
  AUD: 'A$',
  NZD: 'NZ$',
  CNY: '¥',
  INR: '₹',
  BRL: 'R$',
  ZAR: 'R',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  PLN: 'zł',
  CZK: 'Kč',
  HUF: 'Ft',
  RON: 'lei',
  BGN: 'лв',
  TRY: '₺',
  ILS: '₪',
  THB: '฿',
  MYR: 'RM',
  SGD: 'S$',
  IDR: 'Rp',
  PHP: '₱',
  MXN: 'Mex$',
  ARS: 'AR$',
  CLP: 'CLP$',
  COP: 'COL$',
  PEN: 'S/',
};

/**
 * Get currency symbol
 */
function getCurrencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code.toUpperCase()] || code;
}
