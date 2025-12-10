'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Edit2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { SmartMeterPhoto, ExtractedValue } from '@/lib/types/smartMeterTypes';

interface PhotoConfirmationProps {
  photo: SmartMeterPhoto;
  onConfirm: (confirmed: boolean, editedValues?: ExtractedValue[]) => void;
  onClose: () => void;
}

export default function PhotoConfirmation({ photo, onConfirm, onClose }: PhotoConfirmationProps) {
  const [extractedValues, setExtractedValues] = useState<ExtractedValue[]>([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExtractedValues();
  }, [photo.id]);

  async function loadExtractedValues() {
    try {
      const res = await fetch(`/api/smart-meter/photos/${photo.id}/values`);
      const data = await res.json();
      setExtractedValues(data.values || []);
    } catch (error) {
      console.error('Failed to load values:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleValueEdit(index: number, newValue: number) {
    const updated = [...extractedValues];
    updated[index] = { ...updated[index], value: newValue };
    setExtractedValues(updated);
  }

  function handleConfirm() {
    onConfirm(true, editing ? extractedValues : undefined);
  }

  function handleReject() {
    if (confirm('Are you sure? This will mark the extraction as incorrect and you can retake the photo.')) {
      onConfirm(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Confirm Extracted Data</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Please verify the information we extracted from your photo
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <XCircle className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Photo Preview */}
          {photo.fileUrl && (
            <div className="relative">
              <img
                src={photo.fileUrl}
                alt="Smart meter reading"
                className="w-full max-h-64 object-contain rounded-lg border"
              />
            </div>
          )}

          {/* Extraction Confidence */}
          <div className={`p-4 rounded-lg ${
            photo.extractionConfidence >= 80
              ? 'bg-green-50 border border-green-200'
              : photo.extractionConfidence >= 60
              ? 'bg-yellow-50 border border-yellow-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              <AlertCircle className={`w-5 h-5 ${
                photo.extractionConfidence >= 80 ? 'text-green-600' :
                photo.extractionConfidence >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`} />
              <span className="font-semibold">
                Extraction Confidence: {photo.extractionConfidence}%
              </span>
            </div>
            {photo.extractionConfidence < 80 && (
              <p className="text-sm mt-2 text-gray-700">
                The AI is not very confident about this extraction. 
                Please carefully review the values below.
              </p>
            )}
          </div>

          {/* Extracted Values */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading extracted values...</p>
            </div>
          ) : extractedValues.length > 0 ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">
                  Extracted Values ({extractedValues.length})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(!editing)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  {editing ? 'Cancel Edit' : 'Edit Values'}
                </Button>
              </div>

              <div className="space-y-3">
                {extractedValues.map((value, index) => (
                  <div key={value.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {value.valueType.split('-').map(w => 
                            w.charAt(0).toUpperCase() + w.slice(1)
                          ).join(' ')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Period: {value.inferredStartDate.toLocaleDateString()} - {value.inferredEndDate.toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Confidence: {value.confidence}%
                        </p>
                      </div>

                      <div className="text-right">
                        {editing ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.1"
                              value={value.value}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleValueEdit(index, parseFloat(e.target.value))}
                              className="w-32 text-right"
                            />
                            <span className="text-sm font-semibold text-gray-700">
                              {value.unit}
                            </span>
                          </div>
                        ) : (
                          <p className="text-2xl font-bold text-gray-900">
                            {value.value} <span className="text-sm font-normal">{value.unit}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-yellow-800">
                No values were extracted from this photo. 
                You may want to retake it with better lighting or focus.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleConfirm}
              disabled={extractedValues.length === 0}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {editing ? 'Confirm Edited Values' : 'Looks Correct'}
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleReject}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Incorrect Data
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            By confirming, you're helping us improve our AI accuracy. 
            Your feedback is valuable!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
