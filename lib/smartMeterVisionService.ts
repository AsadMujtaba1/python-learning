/**
 * SMART METER AI VISION EXTRACTION SERVICE
 * 
 * Uses OpenAI Vision API to extract energy usage data from photos
 * Supports any type of meter reading, chart, bill, or usage screenshot
 */

import {
  PhotoExtractionRequest,
  PhotoExtractionResult,
  PhotoType,
  DataValueType,
} from './types/smartMeterTypes';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const OPENAI_VISION_MODEL = 'gpt-4o'; // Latest vision model

/**
 * Main extraction function - analyzes any energy-related photo
 */
export async function extractSmartMeterData(
  request: PhotoExtractionRequest
): Promise<PhotoExtractionResult> {
  const startTime = Date.now();
  const result: PhotoExtractionResult = {
    photoId: request.photoId,
    success: false,
    confidence: 0,
    detectedPhotoType: 'unknown',
    extractedValues: [],
    warnings: [],
    errors: [],
    processingTimeMs: 0,
  };

  try {
    // Validate API key
    if (!OPENAI_API_KEY) {
      result.errors.push('OpenAI API key not configured');
      result.processingTimeMs = Date.now() - startTime;
      return result;
    }

    // Build comprehensive prompt for AI Vision
    const prompt = buildExtractionPrompt(request);

    // Call OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_VISION_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: request.fileUrl,
                  detail: 'high', // High detail for better accuracy
                },
              },
            ],
          },
        ],
        max_tokens: 2000,
        temperature: 0.1, // Low temperature for consistency
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      result.errors.push(`OpenAI API error: ${response.status} - ${error}`);
      result.processingTimeMs = Date.now() - startTime;
      return result;
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      result.errors.push('No response from AI Vision');
      result.processingTimeMs = Date.now() - startTime;
      return result;
    }

    // Parse AI response
    const parsed = parseAIResponse(aiResponse, request);
    
    Object.assign(result, parsed);
    result.success = (parsed.extractedValues?.length ?? 0) > 0;
    result.processingTimeMs = Date.now() - startTime;

    // Log for monitoring
    console.log(`✅ Smart Meter Vision: Extracted ${result.extractedValues.length} values from photo ${request.photoId}`);

    return result;
  } catch (error) {
    result.errors.push(`Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    result.processingTimeMs = Date.now() - startTime;
    console.error('Smart Meter Vision Error:', error);
    return result;
  }
}

/**
 * Build comprehensive prompt for AI Vision
 */
function buildExtractionPrompt(request: PhotoExtractionRequest): string {
  return `You are an expert energy data extraction AI. Analyze this image and extract ALL energy-related information.

**Your task:**
1. Identify what type of energy document this is
2. Extract EVERY numeric value related to energy consumption, cost, or meter readings
3. For charts/graphs, extract ALL data points you can see
4. Identify dates, time periods, and ranges
5. Detect the energy supplier if visible
6. Calculate or infer missing information when possible

**Image Context:**
- Upload timestamp: ${request.uploadTimestamp.toISOString()}
- User location: ${request.userRegion || 'UK'}
${request.userPostcode ? `- Postcode: ${request.userPostcode}` : ''}

**Expected document types:**
- Smart meter display (import/export/day/night readings)
- Weekly/monthly/yearly usage charts
- Supplier app screenshots
- In-home display photos
- Paper bills or statements
- Bar charts, line graphs, pie charts
- Usage tables or summaries

**Response Format (JSON only):**
{
  "documentType": "smart-meter-reading | weekly-chart | monthly-chart | yearly-chart | supplier-app-screenshot | in-home-display | paper-bill | usage-summary | bar-chart | line-chart | unknown",
  "confidence": 0-100,
  "supplier": "supplier name if visible",
  "dateRange": {
    "start": "ISO date string or null",
    "end": "ISO date string or null",
    "description": "e.g., 'Last 7 days', 'December 2024'"
  },
  "extractedValues": [
    {
      "value": numeric_value,
      "unit": "kWh | m³ | GBP | pence | percentage",
      "type": "meter-reading | weekly-total | monthly-total | yearly-total | daily-average | chart-data-point | cost-value | tariff-rate",
      "meterType": "import | export | day | night | total | null",
      "confidence": 0-100,
      "label": "description of what this value represents",
      "position": "top-left | center | bottom-right | etc",
      "date": "ISO date string if specific date visible"
    }
  ],
  "chartData": {
    "type": "bar | line | area | pie",
    "dataPoints": [
      {"label": "Jan", "value": 450.5, "date": "2024-01-01"},
      {"label": "Feb", "value": 420.3, "date": "2024-02-01"}
    ],
    "xAxisLabel": "Month",
    "yAxisLabel": "kWh"
  },
  "fullText": "complete OCR text from image",
  "warnings": ["any warnings or uncertainties"],
  "additionalInfo": "any other relevant observations"
}

**Important instructions:**
- Extract EVERY number you see, even if unsure
- If you see a chart, extract ALL visible data points
- For relative dates ("Last Week"), convert to absolute dates using upload timestamp
- If dates are ambiguous, make your best inference and note low confidence
- Always return valid JSON
- Be thorough - missing data impacts user savings calculations

Return ONLY the JSON response, no additional text.`;
}

/**
 * Parse AI Vision response into structured format
 */
function parseAIResponse(
  aiResponse: string,
  request: PhotoExtractionRequest
): Partial<PhotoExtractionResult> {
  const result: Partial<PhotoExtractionResult> = {
    extractedValues: [],
    warnings: [],
    errors: [],
  };

  try {
    // Extract JSON from response (AI might add markdown)
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      result.errors?.push('Could not find JSON in AI response');
      return result;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Map document type
    result.detectedPhotoType = mapDocumentType(parsed.documentType);
    result.confidence = parsed.confidence || 0;
    result.detectedSupplier = parsed.supplier || undefined;

    // Parse date range
    if (parsed.dateRange) {
      const start = parsed.dateRange.start ? new Date(parsed.dateRange.start) : undefined;
      const end = parsed.dateRange.end ? new Date(parsed.dateRange.end) : undefined;
      
      if (start || end) {
        result.detectedDateRange = {
          start: start || inferStartDate(parsed.dateRange.description, request.uploadTimestamp),
          end: end || inferEndDate(parsed.dateRange.description, request.uploadTimestamp),
        };
      }
    }

    // Parse extracted values
    if (parsed.extractedValues && Array.isArray(parsed.extractedValues)) {
      result.extractedValues = parsed.extractedValues.map((v: any) => ({
        value: parseFloat(v.value),
        unit: v.unit || 'kWh',
        type: v.type || 'meter-reading',
        confidence: v.confidence || 50,
        location: parseLocation(v.position),
        rawText: v.label,
      }));
    }

    // Parse chart data
    if (parsed.chartData && parsed.chartData.dataPoints) {
      result.chartData = {
        dataPoints: parsed.chartData.dataPoints.map((dp: any) => ({
          date: dp.date ? new Date(dp.date) : new Date(),
          value: parseFloat(dp.value),
        })),
        chartType: parsed.chartData.type || 'line',
        xAxisLabel: parsed.chartData.xAxisLabel,
        yAxisLabel: parsed.chartData.yAxisLabel,
      };

      // Add chart data points to extracted values
      parsed.chartData.dataPoints.forEach((dp: any, idx: number) => {
        result.extractedValues?.push({
          value: parseFloat(dp.value),
          unit: 'kWh',
          type: 'chart-data-point',
          confidence: 80,
          location: { x: 0, y: 0, width: 0, height: 0 },
          rawText: `${dp.label}: ${dp.value}`,
        });
      });
    }

    // Store full OCR text
    result.fullOcrText = parsed.fullText;

    // Add warnings
    if (parsed.warnings && Array.isArray(parsed.warnings)) {
      result.warnings = parsed.warnings;
    }

    // Set success based on whether we have values
    if (result.extractedValues && result.extractedValues.length > 0) {
      result.success = true;
    }

    return result;
  } catch (error) {
    result.errors?.push(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
}

/**
 * Map AI document type to our PhotoType
 */
function mapDocumentType(aiType: string): PhotoType {
  const mapping: { [key: string]: PhotoType } = {
    'smart-meter-reading': 'smart-meter-reading',
    'weekly-chart': 'weekly-chart',
    'monthly-chart': 'monthly-chart',
    'yearly-chart': 'yearly-chart',
    'supplier-app-screenshot': 'supplier-app-screenshot',
    'in-home-display': 'in-home-display',
    'paper-bill': 'paper-bill',
    'usage-summary': 'usage-summary',
    'bar-chart': 'bar-chart',
    'line-chart': 'line-chart',
  };

  return mapping[aiType] || 'unknown';
}

/**
 * Infer start date from description and upload timestamp
 */
function inferStartDate(description: string, uploadDate: Date): Date {
  const desc = description?.toLowerCase() || '';
  const date = new Date(uploadDate);

  if (desc.includes('last 7 days') || desc.includes('last week')) {
    date.setDate(date.getDate() - 7);
  } else if (desc.includes('last 30 days') || desc.includes('last month')) {
    date.setMonth(date.getMonth() - 1);
  } else if (desc.includes('last year')) {
    date.setFullYear(date.getFullYear() - 1);
  } else if (desc.includes('yesterday')) {
    date.setDate(date.getDate() - 1);
  } else if (desc.includes('today')) {
    // Keep current date
  } else {
    // Default to 1 month ago
    date.setMonth(date.getMonth() - 1);
  }

  return date;
}

/**
 * Infer end date from description and upload timestamp
 */
function inferEndDate(description: string, uploadDate: Date): Date {
  const desc = description?.toLowerCase() || '';

  if (desc.includes('yesterday')) {
    const date = new Date(uploadDate);
    date.setDate(date.getDate() - 1);
    return date;
  }

  // Default to upload date
  return new Date(uploadDate);
}

/**
 * Parse position description to coordinates
 */
function parseLocation(position: string): { x: number; y: number; width: number; height: number } {
  // Simplified - in production, use actual image coordinates
  const posMap: { [key: string]: { x: number; y: number } } = {
    'top-left': { x: 0, y: 0 },
    'top-right': { x: 80, y: 0 },
    'center': { x: 40, y: 40 },
    'bottom-left': { x: 0, y: 80 },
    'bottom-right': { x: 80, y: 80 },
  };

  const coords = posMap[position] || { x: 0, y: 0 };
  return { ...coords, width: 20, height: 20 };
}

/**
 * Batch extraction for multiple photos
 */
export async function batchExtractSmartMeterData(
  requests: PhotoExtractionRequest[]
): Promise<PhotoExtractionResult[]> {
  console.log(`📸 Processing ${requests.length} photos...`);

  // Process in parallel with rate limiting
  const batchSize = 3; // Process 3 at a time
  const results: PhotoExtractionResult[] = [];

  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(req => extractSmartMeterData(req))
    );
    results.push(...batchResults);

    // Small delay between batches
    if (i + batchSize < requests.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`✅ Processed ${results.length} photos`);
  return results;
}
