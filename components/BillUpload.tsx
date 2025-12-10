'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Button from './Button';
import Alert from './Alert';
import Badge from './Badge';
import LoadingSpinner from './LoadingSpinner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import type { EnergyBill } from '@/lib/types/userProfile';
import { getConfidenceColor } from '@/lib/utils/confidenceHelper';

interface BillUploadProps {
  onBillExtracted: (bill: EnergyBill) => void;
  existingBills?: EnergyBill[];
}

export default function BillUpload({ onBillExtracted, existingBills = [] }: BillUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<EnergyBill> | null>(null);
  const [editedData, setEditedData] = useState<Partial<EnergyBill> | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = async (file: File) => {
    // Validate file
    if (!file.type.includes('pdf') && !file.type.includes('image')) {
      setError('Please upload a PDF or image file (JPG, PNG)');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    
    setError(null);
    setIsUploading(true);
    
    try {
      // Upload file to storage
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await fetch('/api/bills/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }
      
      const { fileUrl, fileName } = await uploadResponse.json();
      
      // Extract data using OCR
      const extractResponse = await fetch('/api/bills/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl, fileName }),
      });
      
      if (!extractResponse.ok) {
        throw new Error('Failed to extract bill data');
      }
      
      const extracted: Partial<EnergyBill> = await extractResponse.json();
      
      // Show review modal
      const dataWithMetadata = {
        ...extracted,
        fileUrl,
        fileName,
        uploadDate: new Date().toISOString(),
        id: crypto.randomUUID(),
        needsReview: extracted.ocrConfidence ? extracted.ocrConfidence < 0.8 : true,
      };
      setExtractedData(dataWithMetadata);
      setEditedData(dataWithMetadata);
      setShowReviewModal(true);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process bill');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };
  
  const handleConfirmBill = () => {
    const dataToSave = editMode ? editedData : extractedData;
    if (dataToSave) {
      onBillExtracted(dataToSave as EnergyBill);
      setShowReviewModal(false);
      setExtractedData(null);
      setEditedData(null);
      setEditMode(false);
    }
  };

  const handleReupload = () => {
    setShowReviewModal(false);
    setExtractedData(null);
    setEditedData(null);
    setEditMode(false);
    // Trigger file input
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 300);
  };

  const handleEditField = (field: keyof EnergyBill, value: any) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const formatCurrency = (value?: number) => {
    return value !== undefined ? `£${value.toFixed(2)}` : 'Not found';
  };
  
  const formatUsage = (value?: number) => {
    return value !== undefined ? `${value.toFixed(0)} kWh` : 'Not found';
  };
  
  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all
          ${dragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Uploading and extracting data...
            </p>
          </div>
        ) : (
          <>
            <div className="text-5xl mb-3">📄</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Upload Energy Bill
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Drag and drop your bill here, or click to browse
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-500">
              <Badge variant="secondary" size="sm">PDF</Badge>
              <Badge variant="secondary" size="sm">JPG</Badge>
              <Badge variant="secondary" size="sm">PNG</Badge>
              <span>•</span>
              <span>Max 10MB</span>
            </div>
          </>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <Alert variant="error" dismissible onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {/* Info Alert */}
      <Alert variant="info" dismissible={false}>
        <div className="flex items-start gap-2">
          <span className="text-lg">💡</span>
          <div className="text-sm">
            <p className="font-semibold mb-1">What we extract:</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              <li>Provider name and tariff details</li>
              <li>Usage (kWh) for electricity and gas</li>
              <li>Unit rates and standing charges</li>
              <li>Bill period and total cost</li>
            </ul>
            <p className="mt-2 text-xs">
              You'll review all extracted data before saving.
            </p>
          </div>
        </div>
      </Alert>
      
      {/* Existing Bills */}
      {existingBills.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            📊 Uploaded Bills ({existingBills.length})
          </h3>
          <div className="space-y-2">
            {existingBills.slice(0, 3).map((bill) => (
              <div
                key={bill.id}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {bill.provider}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(bill.billDate).toLocaleDateString('en-GB', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  <Badge 
                    variant={bill.energyType === 'dual' ? 'primary' : 'secondary'} 
                    size="sm"
                  >
                    {bill.energyType}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {bill.electricityUsage && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Electricity:</span>
                      <span className="ml-1 font-semibold text-gray-900 dark:text-white">
                        {formatUsage(bill.electricityUsage)}
                      </span>
                    </div>
                  )}
                  {bill.gasUsage && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Gas:</span>
                      <span className="ml-1 font-semibold text-gray-900 dark:text-white">
                        {formatUsage(bill.gasUsage)}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Total:</span>
                    <span className="ml-1 font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(bill.totalCost)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Review Modal */}
      {extractedData && (
        <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Review Extracted Data</DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto space-y-4">
              {extractedData.needsReview && (
                <Alert variant="warning">
                  ⚠️ Some data had low confidence. Please review carefully.
                </Alert>
              )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Provider
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={editedData?.provider || ''}
                    onChange={(e) => handleEditField('provider', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                ) : (
                  <p className="text-sm text-gray-900 dark:text-white">
                    {extractedData.provider || 'Not found'}
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Bill Date
                </label>
                {editMode ? (
                  <input
                    type="date"
                    value={editedData?.billDate || ''}
                    onChange={(e) => handleEditField('billDate', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                ) : (
                  <p className="text-sm text-gray-900 dark:text-white">
                    {extractedData.billDate 
                      ? new Date(extractedData.billDate).toLocaleDateString('en-GB')
                      : 'Not found'
                    }
                  </p>
                )}
              </div>
              
              {extractedData.electricityUsage !== undefined && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                      Electricity Usage (kWh)
                    </label>
                    {editMode ? (
                      <input
                        type="number"
                        value={editedData?.electricityUsage || ''}
                        onChange={(e) => handleEditField('electricityUsage', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatUsage(extractedData.electricityUsage)}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                      Electricity Cost (£)
                    </label>
                    {editMode ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editedData?.electricityCost || ''}
                        onChange={(e) => handleEditField('electricityCost', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatCurrency(extractedData.electricityCost)}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                      Unit Rate (p/kWh)
                    </label>
                    {editMode ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editedData?.electricityUnitRate || ''}
                        onChange={(e) => handleEditField('electricityUnitRate', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 dark:text-white">
                        {extractedData.electricityUnitRate !== undefined 
                          ? `${extractedData.electricityUnitRate}p/kWh`
                          : 'Not found'
                        }
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                      Standing Charge (p/day)
                    </label>
                    {editMode ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editedData?.electricityStandingCharge || ''}
                        onChange={(e) => handleEditField('electricityStandingCharge', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 dark:text-white">
                        {extractedData.electricityStandingCharge !== undefined
                          ? `${extractedData.electricityStandingCharge}p/day`
                          : 'Not found'
                        }
                      </p>
                    )}
                  </div>
                </>
              )}
              
              {extractedData.gasUsage !== undefined && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                      Gas Usage (kWh)
                    </label>
                    {editMode ? (
                      <input
                        type="number"
                        value={editedData?.gasUsage || ''}
                        onChange={(e) => handleEditField('gasUsage', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatUsage(extractedData.gasUsage)}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                      Gas Cost (£)
                    </label>
                    {editMode ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editedData?.gasCost || ''}
                        onChange={(e) => handleEditField('gasCost', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatCurrency(extractedData.gasCost)}
                      </p>
                    )}
                  </div>
                </>
              )}
              
              <div className="col-span-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Total Bill (£)
                </label>
                {editMode ? (
                  <input
                    type="number"
                    step="0.01"
                    value={editedData?.totalCost || ''}
                    onChange={(e) => handleEditField('totalCost', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md text-lg font-bold"
                  />
                ) : (
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(extractedData.totalCost)}
                  </p>
                )}
              </div>
            </div>
            
            {extractedData.ocrConfidence !== undefined && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Extraction Confidence:
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getConfidenceColor(extractedData.ocrConfidence)}`}
                        style={{ width: `${extractedData.ocrConfidence * 100}%` }}
                      />
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {Math.round(extractedData.ocrConfidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex-col gap-2">
            <div className="flex gap-3 w-full">
              <Button
                variant="primary"
                onClick={handleConfirmBill}
                className="flex-1"
              >
                {editMode ? '✓ Save Changes' : '✓ Confirm & Save'}
              </Button>
            </div>
            <div className="flex gap-2 w-full">
              {!editMode && (
                <Button
                  variant="secondary"
                  onClick={() => setEditMode(true)}
                  className="flex-1"
                >
                  ✏️ Edit Details
                </Button>
              )}
              {editMode && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditMode(false);
                    setEditedData(extractedData);
                  }}
                  className="flex-1"
                >
                  Cancel Edit
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={handleReupload}
                className="flex-1"
              >
                📸 Re-upload
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}
    </div>
  );
}
