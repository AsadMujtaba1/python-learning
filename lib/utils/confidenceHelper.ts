/**
 * Confidence Helper Utilities
 * 
 * Helper functions for OCR confidence scoring and display
 */

/**
 * Get color class based on confidence score
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence > 0.8) return 'bg-green-500';
  if (confidence > 0.6) return 'bg-yellow-500';
  return 'bg-red-500';
}

/**
 * Get text color class based on confidence score
 */
export function getConfidenceTextColor(confidence: number): string {
  if (confidence > 0.8) return 'text-green-600';
  if (confidence > 0.6) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Get confidence level label
 */
export function getConfidenceLabel(confidence: number): string {
  if (confidence > 0.8) return 'High';
  if (confidence > 0.6) return 'Medium';
  return 'Low';
}

/**
 * Determine if extraction needs review based on confidence
 */
export function needsReview(confidence?: number): boolean {
  return confidence ? confidence < 0.8 : true;
}
