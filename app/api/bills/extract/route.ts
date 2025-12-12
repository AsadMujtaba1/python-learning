
import { NextRequest, NextResponse } from 'next/server';
import type { EnergyBill } from '@/lib/types/userProfile';
import pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';

/**
 * Bill OCR Extraction API
 * Extracts energy bill data using pattern matching and OCR
 * 
 * POST /api/bills/extract
 * Body: { fileUrl: string, fileName: string }
 */

export async function POST(request: NextRequest) {
  try {
    const { fileUrl, fileName } = await request.json();
    
    if (!fileUrl || !fileName) {
      return NextResponse.json(
        { error: 'Missing fileUrl or fileName' },
        { status: 400 }
      );
    }
    
    // If PDF, extract text from PDF
    let extractedText = '';
    if (fileName.toLowerCase().endsWith('.pdf')) {
      try {
        // Fetch the PDF file (assuming fileUrl is accessible)
        const res = await fetch(fileUrl);
        if (!res.ok) throw new Error('Failed to fetch PDF');
        const arrayBuffer = await res.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(' ') + '\n';
        }
        extractedText = text;
      } catch (err) {
        return NextResponse.json({ error: 'PDF extraction failed', details: err?.message }, { status: 500 });
      }
    }
    // For images or fallback, use mock text (or OCR in future)
    const extracted = await extractBillData(fileUrl, fileName, extractedText);
    return NextResponse.json(extracted);
    
  } catch (error) {
    console.error('Bill extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract bill data' },
      { status: 500 }
    );
  }
}

/**
 * Extract data from bill using OCR and pattern matching
 * This is a mock implementation for MVP
 * In production, integrate with OCR service
 */
async function extractBillData(
  fileUrl: string,
  fileName: string,
  extractedText?: string
): Promise<Partial<EnergyBill>> {
  // Use extractedText if provided (PDF), else fallback to mock
  let text = extractedText && extractedText.trim().length > 0 ? extractedText : `
    British Gas
    Energy Bill
    Account Number: 123456789
    Bill Date: 15 November 2024
    Bill Period: 16 October 2024 to 15 November 2024 (30 days)
    
    ELECTRICITY
    Usage: 325 kWh
    Unit Rate: 24.50p per kWh
    Standing Charge: 53.37p per day (30 days)
    Electricity Charges: £95.63
    
    GAS
    Usage: 850 kWh
    Unit Rate: 6.24p per kWh
    Standing Charge: 29.11p per day (30 days)
    Gas Charges: £61.77
    
    TOTAL AMOUNT DUE: £157.40
  `;

  // If text is empty after extraction, return error
  if (!text || text.trim().length < 10) {
    return {
      error: 'No text could be extracted from the PDF. Please try another document.',
      extractedText: text
    };
  }

  // Extract provider
  const provider = extractProvider(text);
  // Extract dates
  const billDate = extractBillDate(text);
  const { startDate, endDate, days } = extractBillPeriod(text);
  // Extract electricity data
  const electricityData = extractElectricityData(text);
  // Extract gas data
  const gasData = extractGasData(text);
  // Extract total
  const totalCost = extractTotalCost(text);
  // Determine energy type
  const energyType: 'electricity' | 'gas' | 'dual' =
    electricityData && gasData ? 'dual' :
    electricityData ? 'electricity' : 'gas';
  // Calculate OCR confidence (mock)
  const ocrConfidence = calculateConfidence(text, {
    provider,
    billDate,
    electricityData,
    gasData,
    totalCost
  });
  return {
    provider,
    billDate,
    billPeriodStart: startDate,
    billPeriodEnd: endDate,
    energyType,
    // Electricity
    ...(electricityData && {
      electricityUsage: electricityData.usage,
      electricityDays: days,
      electricityCost: electricityData.cost,
      electricityUnitRate: electricityData.unitRate,
      electricityStandingCharge: electricityData.standingCharge,
    }),
    // Gas
    ...(gasData && {
      gasUsage: gasData.usage,
      gasDays: days,
      gasCost: gasData.cost,
      gasUnitRate: gasData.unitRate,
      gasStandingCharge: gasData.standingCharge,
    }),
    totalCost,
    ocrConfidence,
    needsReview: ocrConfidence < 0.8,
    extractedText: text.trim(),
  };
}

// ============================================================================
// EXTRACTION FUNCTIONS
// ============================================================================

function extractProvider(text: string): string {
  const providers = [
    'British Gas', 'EDF Energy', 'E.ON', 'Scottish Power', 'SSE',
    'npower', 'Bulb', 'Octopus Energy', 'OVO Energy', 'Utilita',
    'Shell Energy', 'Utility Warehouse'
  ];
  
  for (const provider of providers) {
    if (text.includes(provider)) {
      return provider;
    }
  }
  
  return 'Unknown Provider';
}

function extractBillDate(text: string): string {
  // Try various date formats
  const datePatterns = [
    /Bill Date[:\s]+(\d{1,2}\s+\w+\s+\d{4})/i,
    /Date[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/i,
    /(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/i,
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      return new Date(match[1]).toISOString();
    }
  }
  
  return new Date().toISOString();
}

function extractBillPeriod(text: string): { 
  startDate: string; 
  endDate: string; 
  days: number; 
} {
  const periodPattern = /(\d{1,2}\s+\w+\s+\d{4})\s+to\s+(\d{1,2}\s+\w+\s+\d{4})\s*\((\d+)\s+days\)/i;
  const match = text.match(periodPattern);
  
  if (match) {
    return {
      startDate: new Date(match[1]).toISOString(),
      endDate: new Date(match[2]).toISOString(),
      days: parseInt(match[3]),
    };
  }
  
  // Default to 30 days
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    days: 30,
  };
}

function extractElectricityData(text: string): {
  usage: number;
  unitRate: number;
  standingCharge: number;
  cost: number;
} | null {
  // Check if electricity section exists
  if (!text.match(/ELECTRICITY|Electricity/i)) {
    return null;
  }
  
  // Extract usage (kWh)
  const usageMatch = text.match(/Usage[:\s]+(\d+(?:\.\d+)?)\s*kWh/i);
  const usage = usageMatch ? parseFloat(usageMatch[1]) : 0;
  
  // Extract unit rate (pence per kWh)
  const unitRateMatch = text.match(/Unit Rate[:\s]+([\d.]+)p per kWh/i);
  const unitRate = unitRateMatch ? parseFloat(unitRateMatch[1]) : 0;
  
  // Extract standing charge (pence per day)
  const standingChargeMatch = text.match(/Standing Charge[:\s]+([\d.]+)p per day/i);
  const standingCharge = standingChargeMatch ? parseFloat(standingChargeMatch[1]) : 0;
  
  // Extract total cost
  const costMatch = text.match(/Electricity Charges[:\s]+£([\d.]+)/i);
  const cost = costMatch ? parseFloat(costMatch[1]) : 0;
  
  return { usage, unitRate, standingCharge, cost };
}

function extractGasData(text: string): {
  usage: number;
  unitRate: number;
  standingCharge: number;
  cost: number;
} | null {
  // Check if gas section exists
  if (!text.match(/GAS|Gas/i)) {
    return null;
  }
  
  // Extract usage (kWh)
  const usageMatch = text.match(/(?:GAS\s+)?Usage[:\s]+(\d+(?:\.\d+)?)\s*kWh/i);
  const usage = usageMatch ? parseFloat(usageMatch[1]) : 0;
  
  // Extract unit rate (pence per kWh)
  const unitRateMatch = text.match(/(?:Gas\s+)?Unit Rate[:\s]+([\d.]+)p per kWh/i);
  const unitRate = unitRateMatch ? parseFloat(unitRateMatch[1]) : 0;
  
  // Extract standing charge (pence per day)
  const standingChargeMatch = text.match(/(?:Gas\s+)?Standing Charge[:\s]+([\d.]+)p per day/i);
  const standingCharge = standingChargeMatch ? parseFloat(standingChargeMatch[1]) : 0;
  
  // Extract total cost
  const costMatch = text.match(/Gas Charges[:\s]+£([\d.]+)/i);
  const cost = costMatch ? parseFloat(costMatch[1]) : 0;
  
  return { usage, unitRate, standingCharge, cost };
}

function extractTotalCost(text: string): number {
  const patterns = [
    /TOTAL AMOUNT DUE[:\s]+£([\d.]+)/i,
    /Total[:\s]+£([\d.]+)/i,
    /Amount Due[:\s]+£([\d.]+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseFloat(match[1]);
    }
  }
  
  return 0;
}

function calculateConfidence(
  text: string, 
  extracted: Record<string, any>
): number {
  let confidence = 0;
  let checks = 0;
  
  // Provider check
  if (extracted.provider && extracted.provider !== 'Unknown Provider') {
    confidence += 1;
  }
  checks += 1;
  
  // Date check
  if (extracted.billDate) {
    confidence += 1;
  }
  checks += 1;
  
  // Usage check
  if (extracted.electricityData?.usage || extracted.gasData?.usage) {
    confidence += 1;
  }
  checks += 1;
  
  // Rate check
  if (extracted.electricityData?.unitRate || extracted.gasData?.unitRate) {
    confidence += 1;
  }
  checks += 1;
  
  // Total check
  if (extracted.totalCost > 0) {
    confidence += 1;
  }
  checks += 1;
  
  return confidence / checks;
}
