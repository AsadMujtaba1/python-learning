'use client';

import { Calendar, CheckCircle, XCircle, Clock, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { SmartMeterPhoto } from '@/lib/types/smartMeterTypes';

interface PhotoHistoryProps {
  photos: SmartMeterPhoto[];
  onPhotoClick: (photo: SmartMeterPhoto) => void;
  onRefresh: () => void;
}

export default function PhotoHistory({ photos, onPhotoClick, onRefresh }: PhotoHistoryProps) {
  const getStatusIcon = (photo: SmartMeterPhoto) => {
    if (photo.extractionStatus === 'completed' && photo.userConfirmed) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (photo.extractionStatus === 'completed') {
      return <Clock className="w-5 h-5 text-yellow-600" />;
    }
    if (photo.extractionStatus === 'failed') {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
    return <Clock className="w-5 h-5 text-gray-400" />;
  };

  const getStatusText = (photo: SmartMeterPhoto) => {
    if (photo.extractionStatus === 'completed' && photo.userConfirmed) {
      return 'Confirmed';
    }
    if (photo.extractionStatus === 'completed') {
      return 'Awaiting Confirmation';
    }
    if (photo.extractionStatus === 'failed') {
      return 'Extraction Failed';
    }
    if (photo.extractionStatus === 'processing') {
      return 'Processing...';
    }
    return 'Pending';
  };

  const getPhotoTypeLabel = (type: string) => {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  async function handleDelete(photo: SmartMeterPhoto) {
    if (!confirm('Delete this photo? Extracted data will be kept unless you also delete the readings.')) {
      return;
    }

    await fetch(`/api/smart-meter/photos/${photo.id}`, {
      method: 'DELETE',
    });

    onRefresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Photo History</h2>
          <p className="text-gray-600 mt-1">
            {photos.length} {photos.length === 1 ? 'photo' : 'photos'} uploaded
          </p>
        </div>
        {photos.filter(p => !p.userConfirmed && p.extractionStatus === 'completed').length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>{photos.filter(p => !p.userConfirmed && p.extractionStatus === 'completed').length}</strong> photos awaiting confirmation
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <Card
            key={photo.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onPhotoClick(photo)}
          >
            <CardContent className="p-4">
              {/* Photo Preview */}
              <div className="relative mb-3">
                {photo.fileUrl ? (
                  <img
                    src={photo.fileUrl}
                    alt="Smart meter photo"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md">
                  {getStatusIcon(photo)}
                </div>
              </div>

              {/* Photo Info */}
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {getPhotoTypeLabel(photo.photoType)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getStatusText(photo)}
                    </p>
                  </div>
                  {photo.extractionConfidence > 0 && (
                    <div className={`text-xs font-semibold px-2 py-1 rounded ${
                      photo.extractionConfidence >= 80
                        ? 'bg-green-100 text-green-700'
                        : photo.extractionConfidence >= 60
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {photo.extractionConfidence}% confidence
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {photo.uploadTimestamp.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Error Message */}
                {photo.extractionError && (
                  <p className="text-xs text-red-600 mt-2">
                    {photo.extractionError}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onPhotoClick(photo);
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleDelete(photo);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {photos.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No photos uploaded yet</p>
          <p className="text-sm text-gray-400">
            Start by uploading your first smart meter photo
          </p>
        </div>
      )}
    </div>
  );
}
