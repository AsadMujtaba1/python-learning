'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SmartMeterUploadProps {
  onUpload: (files: File[]) => void;
  onCancel: () => void;
}

export default function SmartMeterUpload({ onUpload, onCancel }: SmartMeterUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
  }

  function addFiles(newFiles: File[]) {
    setFiles(prev => [...prev, ...newFiles]);

    // Generate previews
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  }

  async function handleUpload() {
    if (files.length === 0) return;
    
    setError(null);
    setExtracting(true);
    
    try {
      // TODO: Replace with actual OCR/extraction API call
      // Simulate extraction from smart meter photos
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockExtracted = {
        electricityUsage: 450,
        gasUsage: 320,
        period: 'Daily',
        date: new Date().toLocaleDateString('en-GB'),
      };

      setExtractedData(mockExtracted);
      setEditedData(mockExtracted);
      setShowConfirmation(true);
    } catch (err) {
      console.error('Extraction failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to extract data from photos. Please try again.');
    } finally {
      setExtracting(false);
    }
  }

  function handleConfirmExtraction() {
    const dataToSave = editMode ? editedData : extractedData;
    setUploading(true);
    
    try {
      // Pass both files and extracted data
      onUpload(files);
      // In real implementation, you'd also save the extracted data
    } finally {
      setUploading(false);
    }
  }

  function handleReupload() {
    setExtractedData(null);
    setShowConfirmation(false);
    setEditMode(false);
    setFiles([]);
    setPreviews([]);
    setError(null);
  }

  function handleEditData(field: string, value: string) {
    setEditedData((prev: any) => ({
      ...prev,
      [field]: ['electricityUsage', 'gasUsage'].includes(field) ? parseFloat(value) || 0 : value,
    }));
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Upload Smart Meter Photos</CardTitle>
              <CardDescription>
                Take photos or upload images of your energy usage data
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Upload Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-32 flex-col gap-3"
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera className="w-8 h-8 text-blue-600" />
              <span>Take Photo</span>
            </Button>

            <Button
              variant="outline"
              className="h-32 flex-col gap-3"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 text-blue-600" />
              <span>Upload Files</span>
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* File Previews */}
          {files.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">
                {files.length} {files.length === 1 ? 'photo' : 'photos'} selected
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                      {(files[index].size / 1024 / 1024).toFixed(1)} MB
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extraction Confirmation */}
          {showConfirmation && extractedData ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-5 space-y-4">
              <div className="flex items-center gap-2 text-green-700 font-semibold">
                <CheckCircle className="w-5 h-5" />
                <span>Data Extracted Successfully!</span>
              </div>

              {!editMode ? (
                <>
                  <div className="space-y-3">
                    {extractedData.electricityUsage && (
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Electricity Usage</p>
                        <p className="text-base font-semibold text-gray-900">
                          {extractedData.electricityUsage} kWh ({extractedData.period})
                        </p>
                      </div>
                    )}
                    
                    {extractedData.gasUsage && (
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Gas Usage</p>
                        <p className="text-base font-semibold text-gray-900">
                          {extractedData.gasUsage} kWh ({extractedData.period})
                        </p>
                      </div>
                    )}

                    {extractedData.date && (
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Reading Date</p>
                        <p className="text-base font-semibold text-gray-900">
                          {extractedData.date}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      className="w-full"
                      onClick={handleConfirmExtraction}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        '✓ Looks good!'
                      )}
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        variant="outline"
                        onClick={() => setEditMode(true)}
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        className="flex-1"
                        variant="outline"
                        onClick={handleReupload}
                      >
                        📸 Re-upload
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700 text-center">
                      Edit the extracted values
                    </p>
                    
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Electricity Usage (kWh)</label>
                      <input
                        type="number"
                        value={editedData.electricityUsage || ''}
                        onChange={(e) => handleEditData('electricityUsage', e.target.value)}
                        className="w-full h-12 px-3 border rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Gas Usage (kWh)</label>
                      <input
                        type="number"
                        value={editedData.gasUsage || ''}
                        onChange={(e) => handleEditData('gasUsage', e.target.value)}
                        className="w-full h-12 px-3 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Period</label>
                      <select
                        value={editedData.period || 'Daily'}
                        onChange={(e) => handleEditData('period', e.target.value)}
                        className="w-full h-12 px-3 border rounded-lg"
                      >
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={handleConfirmExtraction}
                    >
                      ✓ Save Changes
                    </Button>
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => {
                        setEditMode(false);
                        setEditedData(extractedData);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex gap-2 text-red-800">
                    <span className="text-lg">⚠️</span>
                    <div className="text-sm">
                      <p className="font-semibold mb-1">Upload Failed</p>
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">What happens next?</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>AI will extract all energy usage data from your photos</li>
                      <li>You'll be asked to confirm the extracted values</li>
                      <li>Your data will be analyzed to generate insights and savings tips</li>
                      <li>Only numeric usage values are stored - photos can be deleted anytime</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  onClick={handleUpload}
                  disabled={files.length === 0 || extracting}
                >
                  {extracting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Extracting data...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload {files.length > 0 && `${files.length} ${files.length === 1 ? 'Photo' : 'Photos'}`}
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={onCancel} disabled={extracting}>
                  Cancel
                </Button>
              </div>
            </>
          )
          }
        </CardContent>
      </Card>
    </div>
  );
}
