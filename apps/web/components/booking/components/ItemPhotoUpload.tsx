'use client';

import { useState, useRef } from 'react';
import { Camera, X, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { deliveryAPI } from '../../../lib/api/delivery';
import toast from 'react-hot-toast';

interface ItemPhotoUploadProps {
  onPhotoSelected: (photoData: { base64: string; url?: string }) => void;
  existingPhoto?: string;
}

export default function ItemPhotoUpload({ onPhotoSelected, existingPhoto }: ItemPhotoUploadProps) {
  const [photoBase64, setPhotoBase64] = useState<string>(existingPhoto || '');
  const [previewUrl, setPreviewUrl] = useState<string>(existingPhoto || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setPhotoBase64(base64);
        setPreviewUrl(base64);
        setUploadError(null);

        // Start upload immediately
        setIsUploading(true);
        try {
          const response = await deliveryAPI.uploadTempPhoto(base64);
          if (response.success && response.data.photoUrl) {
            onPhotoSelected({ base64, url: response.data.photoUrl });
            toast.success('✅ Photo uploaded successfully!');
          } else {
            // Show error - require successful upload
            const errorMsg = 'Photo upload failed. Please try again.';
            setUploadError(errorMsg);
            setPreviewUrl('');
            toast.error(errorMsg);
          }
        } catch (error: any) {
          console.error('Upload failed:', error);
          const errorMsg = error?.response?.data?.message || 'Failed to upload photo. Please try again.';
          setUploadError(errorMsg);
          setPreviewUrl('');
          toast.error(errorMsg);
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        toast.error('Failed to read image file');
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File processing error:', error);
      toast.error('Failed to process image');
    }
  };

  const handleCapture = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPhotoBase64('');
    setPreviewUrl('');
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onPhotoSelected({ base64: '' });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Camera className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">Item Photo</h4>
            <p className="text-xs text-gray-500">Required for verification</p>
          </div>
        </div>
        {photoBase64 && !isUploading && !uploadError && (
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        )}
        {isUploading && (
          <div className="flex items-center gap-2 text-blue-600 text-xs font-medium">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Uploading...</span>
          </div>
        )}
        {uploadError && (
          <div className="flex items-center gap-1 text-red-600 text-xs font-semibold">
            <span>❌ Upload failed</span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!previewUrl ? (
        <div className="border-2 border-dashed border-red-300 rounded-lg p-6 text-center bg-red-50 hover:bg-red-100 transition-colors cursor-pointer" onClick={handleCapture}>
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <Camera className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">📸 Take a photo of your item</p>
              <p className="text-xs text-red-600 font-semibold mt-1">⚠️ This is required to proceed</p>
              <p className="text-xs text-gray-500 mt-1">Clear photo helps driver identify the package</p>
            </div>
            <Button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleCapture(); }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-10 text-sm"
            >
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
          <img
            src={previewUrl}
            alt="Item preview"
            className={`w-full h-48 object-contain transition-opacity duration-300 ${isUploading ? 'opacity-50' : 'opacity-100'}`}
          />
          {!isUploading && (
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-colors"
              aria-label="Remove photo"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="text-sm font-medium text-blue-600">Uploading...</span>
              </div>
            </div>
          )}
          {!isUploading && (
            <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white px-3 py-2 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Photo ready
            </div>
          )}
        </div>
      )}

      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-900">Upload failed</p>
            <p className="text-xs text-red-700 mt-1">{uploadError}</p>
          </div>
          <button
            onClick={() => {
              setUploadError(null);
              handleCapture();
            }}
            className="text-xs font-semibold text-red-600 hover:text-red-700 whitespace-nowrap flex-shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      <p className="text-xs text-gray-500 italic">
        * This photo will only be visible to you, the recipient, and admin for verification purposes. Drivers cannot see it.
      </p>
    </div>
  );
}
