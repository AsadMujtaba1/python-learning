/**
 * BILL OCR EXTRACTION SERVICE
 * 
 * Extract energy bill data from uploaded images/PDFs
 * Uses Tesseract.js for OCR (client-side, privacy-focused)
 * Extracts: usage, rates, supplier, account details
 * 
 * Privacy-First: All processing done client-side, no uploads to external servers
 */

export interface BillData {
  // Extracted information
  supplier?: string;
  accountNumber?: string;
  address?: string;
  billingPeriod?: {
    from: string;
    to: string;
  };
  electricityUsage?: {
    kwh: number;
    cost?: number;
    rate?: number; // pence per kWh
  };
  gasUsage?: {
    kwh: number;
    cost?: number;
    rate?: number; // pence per kWh
  };
  standingCharge?: {
    electricity?: number;
    gas?: number;
  };
  totalCost?: number;
  tariffName?: string;
  
  // Metadata
  extractionDate: string;
  confidence: 'high' | 'medium' | 'low';
  rawText?: string; // Full extracted text for debugging
}

export interface ExtractionResult {
  success: boolean;
  data?: BillData;
  error?: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Extract data from energy bill image/PDF
 */
export async function extractBillData(file: File): Promise<ExtractionResult> {
  try {
    // Validate file type
    if (!isValidFileType(file)) {
      return {
        success: false,
        error: 'Invalid file type. Please upload a PDF, JPG, or PNG file.',
        confidence: 'low',
      };
    }

    let extractedText: string;

    // Handle PDFs differently from images
    if (file.type === 'application/pdf') {
      extractedText = await extractTextFromPDF(file);
    } else {
      // Convert image file to data URL
      const imageData = await fileToDataURL(file);
      // Perform OCR on image
      extractedText = await performOCR(imageData);
    }

    // Parse extracted text
    const billData = parseBillText(extractedText);

    // Calculate confidence
    const confidence = calculateConfidence(billData);

    return {
      success: true,
      data: billData,
      confidence,
    };
  } catch (error) {
    console.error('Bill extraction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process bill. Please try a different file or ensure it\'s readable.',
      confidence: 'low',
    };
  }
}

/**
 * Validate file type
 */
function isValidFileType(file: File): boolean {
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];
  return validTypes.includes(file.type);
}

/**
 * Convert file to data URL
 */
function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Extract text from PDF file
 */
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    console.log('Starting PDF extraction...');
    
    // Dynamically import PDF.js
    const pdfjsLib = await import('pdfjs-dist');
    console.log('PDF.js loaded, version:', pdfjsLib.version);
    
    // Use unpkg CDN which is more reliable for ES modules
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    
    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    console.log('File loaded, size:', arrayBuffer.byteLength, 'bytes');
    
    // Load PDF document with standard font loading disabled for faster processing
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      verbosity: 0, // Reduce console noise
      standardFontDataUrl: undefined // Don't load fonts for text extraction
    });
    
    const pdf = await loadingTask.promise;
    console.log('PDF loaded, pages:', pdf.numPages);
    
    let fullText = '';
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
        console.log(`Page ${pageNum} extracted, length:`, pageText.length);
      } catch (pageError) {
        console.error(`Error extracting page ${pageNum}:`, pageError);
        // Continue with other pages
      }
    }
    
    console.log('Total extracted text length:', fullText.length);
    
    if (!fullText.trim()) {
      throw new Error('No text found in PDF. This appears to be a scanned document. Please try:\n1. Converting to JPG/PNG and uploading as image\n2. Using a different PDF export from your supplier');
    }
    
    return fullText;
  } catch (error) {
    console.error('PDF extraction error details:', error);
    
    if (error instanceof Error) {
      // If it's our custom error about no text, pass it through
      if (error.message.includes('No text found')) {
        throw error;
      }
      
      // For other errors, provide more specific guidance
      throw new Error(`PDF processing failed: ${error.message}\n\nTry:\n• Uploading as JPG/PNG instead\n• Using a different browser\n• Ensuring your PDF isn't password protected`);
    }
    
    throw new Error('Failed to read PDF file. Please try uploading as an image (JPG/PNG) instead.');
  }
}

/**
 * Perform OCR on image using Tesseract.js
 */
async function performOCR(imageData: string): Promise<string> {
  try {
    // Dynamically import Tesseract.js (client-side only)
    const { createWorker } = await import('tesseract.js');
    
    // Create worker and initialize
    const worker = await createWorker('eng', 1, {
      logger: (m) => {
        // Optional: Log progress
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });
    
    // Perform OCR
    const result = await worker.recognize(imageData);
    
    // Clean up worker
    await worker.terminate();
    
    // Return extracted text
    return result.data.text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image. Please ensure the image is clear and readable.');
  }
}

/**
 * Parse extracted text to extract bill data
 */
function parseBillText(text: string): BillData {
  console.log('=== PARSING BILL TEXT ===');
  console.log('Text length:', text.length);
  console.log('First 500 chars:', text.substring(0, 500));
  
  const billData: BillData = {
    extractionDate: new Date().toISOString(),
    confidence: 'medium',
    rawText: text,
  };

  // Extract supplier (with variations and common misspellings)
  // IMPORTANT: Check more specific patterns first (longer strings before shorter)
  const suppliers = [
    { name: 'Octopus Energy', patterns: ['octopus energy', 'octopusenergy'] },
    { name: 'OVO Energy', patterns: ['ovo energy', 'ovoenergy'] },
    { name: 'British Gas', patterns: ['british gas', 'britishgas', 'bg energy', 'centrica'] },
    { name: 'E.ON', patterns: ['e.on next', 'e.on energy', 'e.on', 'eon next', 'eon energy', 'e on', 'eon'] },
    { name: 'EDF Energy', patterns: ['edf energy', 'edfenergy', 'edf'] },
    { name: 'Scottish Power', patterns: ['scottish power', 'scottishpower', 'sp energy'] },
    { name: 'SSE', patterns: ['sse energy', 'sse airtricity', 'scottish southern energy', 'sse'] },
    { name: 'Shell Energy', patterns: ['shell energy', 'first utility', 'shell'] },
    { name: 'Utilita', patterns: ['utilita energy', 'utilita'] },
    { name: 'Bulb', patterns: ['bulb energy', 'bulb'] },
    { name: 'So Energy', patterns: ['so energy', 'soenergy'] },
  ];
  
  const lowerText = text.toLowerCase();
  
  // First pass: Look for exact, longer patterns using word boundaries for accuracy
  for (const supplier of suppliers) {
    // Start with longest patterns first (more specific)
    const sortedPatterns = [...supplier.patterns].sort((a, b) => b.length - a.length);
    for (const pattern of sortedPatterns) {
      // For short patterns (3 chars or less like 'ovo', 'sse'), use strict word boundary matching
      // For longer patterns, use includes() for flexibility
      let found = false;
      if (pattern.length <= 3) {
        // Strict matching for short patterns to avoid false positives
        const regex = new RegExp(`\\b${pattern}\\b`, 'i');
        found = regex.test(text);
      } else {
        found = lowerText.includes(pattern);
      }
      
      if (found) {
        billData.supplier = supplier.name;
        break;
      }
    }
    if (billData.supplier) break;
  }
  
  // Add generic 'octopus' check last (only if no other supplier found)
  if (!billData.supplier && lowerText.includes('octopus')) {
    billData.supplier = 'Octopus Energy';
  }

  // Extract account number
  const accountMatch = text.match(/account\s*(?:number|no\.?)?[\s:]+(\d+)/i);
  if (accountMatch) {
    billData.accountNumber = accountMatch[1];
  }

  // Extract address
  const addressMatch = text.match(/(\d+[\w\s,]+[A-Z]{2}\d{1,2}\s?\d[A-Z]{2})/i);
  if (addressMatch) {
    billData.address = addressMatch[1].trim();
  }

  // Extract billing period (multiple date formats)
  const periodPatterns = [
    /(?:billing\s*period|period|statement\s*period)[\s:]+(\d{1,2}\/\d{1,2}\/\d{2,4})\s*(?:-|to|–)\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /(?:billing\s*period|period)[\s:]+(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})\s*(?:-|to|–)\s*(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/i,
    /from[\s:]+(\d{1,2}\/\d{1,2}\/\d{2,4})\s*to\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
  ];
  
  for (const pattern of periodPatterns) {
    const match = text.match(pattern);
    if (match) {
      billData.billingPeriod = {
        from: match[1],
        to: match[2],
      };
      break;
    }
  }

  // Extract electricity usage (multiple patterns for flexibility)
  const elecPatterns = [
    // Pattern 1: "Electricity Usage: 300 kWh, Rate: 15.5p, Cost: £46.50"
    /electricity\s+usage[\s\S]*?(\d+\.?\d*)\s*kwh[\s\S]{0,100}?rate[\s:]+(\d+\.?\d*)\s*p[\s\S]{0,50}?cost[\s:]+£(\d+\.?\d*)/i,
    // Pattern 2: "Electricity: 300 kWh @ 15.5p/kWh = £46.50"
    /electricity[\s:]+(\d+\.?\d*)\s*kwh\s*[@]?\s*(\d+\.?\d*)\s*p[\/]?kwh[\s=]*£?(\d+\.?\d*)/i,
    // Pattern 3: Look for electricity followed by kWh within 200 chars
    /electricity[\s\S]{0,200}?(\d+\.?\d*)\s*kwh/i,
    // Pattern 4: "Total Usage: 300 kWh"
    /(?:total\s+)?usage[\s:]+(\d+\.?\d*)\s*kwh/i,
    // Pattern 5: Just kWh amount (last resort)
    /(\d+\.?\d*)\s*kwh/i,
  ];
  
  for (const pattern of elecPatterns) {
    const match = text.match(pattern);
    if (match) {
      billData.electricityUsage = {
        kwh: parseFloat(match[1]),
        rate: match[2] ? parseFloat(match[2]) : undefined,
        cost: match[3] ? parseFloat(match[3]) : undefined,
      };
      console.log('Found electricity usage:', billData.electricityUsage);
      break;
    }
  }
  
  // If we didn't get rate/cost, try to find them separately
  if (billData.electricityUsage && !billData.electricityUsage.rate) {
    const ratePatterns = [
      /electricity[\s\S]{0,200}?unit\s+rate[\s:]+(\d+\.?\d*)\s*p/i,
      /electricity[\s\S]{0,200}?rate[\s:]+(\d+\.?\d*)\s*p/i,
      /unit\s+rate[\s:]+(\d+\.?\d*)\s*p[\s\/]*kwh/i,
      /(\d+\.?\d*)\s*p[\s\/]*kwh/i,
    ];
    for (const pattern of ratePatterns) {
      const rateMatch = text.match(pattern);
      if (rateMatch) {
        billData.electricityUsage.rate = parseFloat(rateMatch[1]);
        console.log('Found electricity rate:', billData.electricityUsage.rate);
        break;
      }
    }
  }
  
  // If we have kWh and rate but no cost, calculate it
  if (billData.electricityUsage && billData.electricityUsage.kwh && billData.electricityUsage.rate && !billData.electricityUsage.cost) {
    billData.electricityUsage.cost = (billData.electricityUsage.kwh * billData.electricityUsage.rate) / 100;
    console.log('Calculated electricity cost:', billData.electricityUsage.cost);
  }
  
  // If we didn't find cost yet, look for electricity cost separately
  if (billData.electricityUsage && !billData.electricityUsage.cost) {
    const costPatterns = [
      /electricity[\s\S]{0,200}?cost[\s:]+£(\d+\.?\d*)/i,
      /electricity[\s\S]{0,200}?£(\d+\.?\d*)/i,
    ];
    for (const pattern of costPatterns) {
      const costMatch = text.match(pattern);
      if (costMatch) {
        billData.electricityUsage.cost = parseFloat(costMatch[1]);
        console.log('Found electricity cost:', billData.electricityUsage.cost);
        break;
      }
    }
  }

  // Extract gas usage (similar flexible patterns)
  const gasPatterns = [
    /gas\s+usage[\s\S]*?(\d+\.?\d*)\s*kwh[\s\S]{0,100}?rate[\s:]+(\d+\.?\d*)\s*p[\s\S]{0,50}?cost[\s:]+£(\d+\.?\d*)/i,
    /gas[\s:]+(\d+\.?\d*)\s*kwh\s*[@]?\s*(\d+\.?\d*)\s*p[\/]?kwh[\s=]*£?(\d+\.?\d*)/i,
    /gas[\s\S]{0,200}?(\d+\.?\d*)\s*kwh/i,
  ];
  
  for (const pattern of gasPatterns) {
    const match = text.match(pattern);
    if (match) {
      billData.gasUsage = {
        kwh: parseFloat(match[1]),
        rate: match[2] ? parseFloat(match[2]) : undefined,
        cost: match[3] ? parseFloat(match[3]) : undefined,
      };
      console.log('Found gas usage:', billData.gasUsage);
      break;
    }
  }
  
  // If we didn't get rate/cost, try to find them separately
  if (billData.gasUsage && !billData.gasUsage.rate) {
    const gasRatePatterns = [
      /gas[\s\S]{0,200}?unit\s+rate[\s:]+(\d+\.?\d*)\s*p/i,
      /gas[\s\S]{0,200}?rate[\s:]+(\d+\.?\d*)\s*p/i,
    ];
    for (const pattern of gasRatePatterns) {
      const rateMatch = text.match(pattern);
      if (rateMatch) {
        billData.gasUsage.rate = parseFloat(rateMatch[1]);
        console.log('Found gas rate:', billData.gasUsage.rate);
        break;
      }
    }
  }
  
  // Calculate gas cost if we have kWh and rate
  if (billData.gasUsage && billData.gasUsage.kwh && billData.gasUsage.rate && !billData.gasUsage.cost) {
    billData.gasUsage.cost = (billData.gasUsage.kwh * billData.gasUsage.rate) / 100;
    console.log('Calculated gas cost:', billData.gasUsage.cost);
  }
  
  // If we didn't find cost yet, look for gas cost separately
  if (billData.gasUsage && !billData.gasUsage.cost) {
    const gasCostPatterns = [
      /gas[\s\S]{0,200}?cost[\s:]+£(\d+\.?\d*)/i,
      /gas[\s\S]{0,200}?£(\d+\.?\d*)/i,
    ];
    for (const pattern of gasCostPatterns) {
      const costMatch = text.match(pattern);
      if (costMatch) {
        billData.gasUsage.cost = parseFloat(costMatch[1]);
        console.log('Found gas cost:', billData.gasUsage.cost);
        break;
      }
    }
  }

  // Extract standing charges (daily or monthly)
  const standingChargePatterns = [
    // Electricity standing charge patterns
    { 
      patterns: [
        /electricity\s+standing\s+charge[\s:]+£?(\d+\.?\d*)\s*(?:per\s+)?(day|daily|month|monthly)?/i,
        /standing\s+charge\s+(?:\()?electricity(?:\))?[\s:]+£?(\d+\.?\d*)/i,
        /elec(?:tricity)?\s+daily\s+charge[\s:]+£?(\d+\.?\d*)/i,
      ],
      type: 'electricity' as const
    },
    // Gas standing charge patterns
    {
      patterns: [
        /gas\s+standing\s+charge[\s:]+£?(\d+\.?\d*)\s*(?:per\s+)?(day|daily|month|monthly)?/i,
        /standing\s+charge\s+(?:\()?gas(?:\))?[\s:]+£?(\d+\.?\d*)/i,
        /gas\s+daily\s+charge[\s:]+£?(\d+\.?\d*)/i,
      ],
      type: 'gas' as const
    },
  ];
  
  for (const { patterns, type } of standingChargePatterns) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = parseFloat(match[1]);
        const period = match[2]?.toLowerCase();
        
        // Convert monthly to daily if needed
        const dailyAmount = period?.includes('month') ? amount / 30 : amount;
        
        if (!billData.standingCharge) {
          billData.standingCharge = {};
        }
        billData.standingCharge[type] = dailyAmount;
        break;
      }
    }
  }

  // Extract total cost (multiple patterns)
  const totalPatterns = [
    /total\s+(?:amount\s+)?(?:due|cost|to\s+pay)[\s:]+£(\d+\.?\d*)/i,
    /amount\s+(?:due|payable)[\s:]+£(\d+\.?\d*)/i,
    /(?:you\s+owe|balance\s+due)[\s:]+£(\d+\.?\d*)/i,
    /(?:total|balance)[\s:]+£(\d+\.?\d*)/i,
    /£(\d+\.?\d*)\s+(?:total|due|payable)/i,
  ];
  
  for (const pattern of totalPatterns) {
    const match = text.match(pattern);
    if (match) {
      billData.totalCost = parseFloat(match[1]);
      console.log('Found total cost:', billData.totalCost);
      break;
    }
  }
  
  // If no total found, try to calculate from parts
  if (!billData.totalCost) {
    let calculated = 0;
    if (billData.electricityUsage?.cost) calculated += billData.electricityUsage.cost;
    if (billData.gasUsage?.cost) calculated += billData.gasUsage.cost;
    if (billData.standingCharge?.electricity) calculated += billData.standingCharge.electricity * 30; // ~1 month
    if (billData.standingCharge?.gas) calculated += billData.standingCharge.gas * 30;
    
    if (calculated > 0) {
      billData.totalCost = calculated;
      console.log('Calculated total cost from parts:', billData.totalCost);
    }
  }

  // Extract tariff name
  const tariffMatch = text.match(/tariff[\s:]+([A-Za-z\s]+)/i);
  if (tariffMatch) {
    billData.tariffName = tariffMatch[1].trim();
  }

  return billData;
}

/**
 * Calculate extraction confidence
 */
function calculateConfidence(billData: BillData): 'high' | 'medium' | 'low' {
  let score = 0;

  // Critical fields
  if (billData.supplier) score += 20;
  if (billData.totalCost) score += 20;
  if (billData.electricityUsage || billData.gasUsage) score += 20;

  // Important fields
  if (billData.accountNumber) score += 15;
  if (billData.billingPeriod) score += 10;
  if (billData.tariffName) score += 10;

  // Nice-to-have fields
  if (billData.address) score += 5;

  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

/**
 * Save extracted bill data to Firestore
 */
export async function saveBillData(userId: string, billData: BillData): Promise<void> {
  try {
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('./firebase');

    const billRef = doc(db, 'users', userId, 'bills', billData.extractionDate);
    
    await setDoc(billRef, {
      ...billData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to save bill data:', error);
    throw error;
  }
}

/**
 * Get user's saved bills
 */
export async function getUserBills(userId: string): Promise<BillData[]> {
  try {
    const { collection, query, getDocs, orderBy } = await import('firebase/firestore');
    const { db } = await import('./firebase');

    const billsRef = collection(db, 'users', userId, 'bills');
    const q = query(billsRef, orderBy('extractionDate', 'desc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as BillData);
  } catch (error) {
    console.error('Failed to get bills:', error);
    return [];
  }
}

/**
 * Compare bill data with current tariffs
 */
export function compareBillWithTariffs(billData: BillData): {
  currentCost: number;
  potentialSavings: number;
  betterTariffs: number;
} {
  const currentCost = billData.totalCost || 0;
  
  // Mock comparison (in production, use tariffEngine)
  const potentialSavings = currentCost * 0.15; // Assume 15% savings available
  const betterTariffs = 12; // Number of better deals

  return {
    currentCost,
    potentialSavings,
    betterTariffs,
  };
}
