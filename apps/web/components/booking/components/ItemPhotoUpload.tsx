'use client';

import { useState, useRef } from 'react';
import { Camera, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import toast from 'react-hot-toast';

interface ItemPhotoUploadProps {
  onPhotoSelected: (base64Photo: string) => void;
  existingPhoto?: string;
}

export default function ItemPhotoUpload({ onPhotoSelected, existingPhoto }: ItemPhotoUploadProps) {
  const [photoBase64, setPhotoBase64] = useState<string>(existingPhoto || '');
  const [previewUrl, setPreviewUrl] = useState<string>(existingPhoto || '');
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
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotoBase64(base64);
        setPreviewUrl(base64);
        onPhotoSelected(base64);
        toast.success('Photo selected successfully!');
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onPhotoSelected('');
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
        {photoBase64 && (
          <CheckCircle2 className="w-5 h-5 text-green-600" />
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
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Camera className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Take a photo of your item</p>
              <p className="text-xs text-gray-500 mt-1">Clear photo helps driver identify the package</p>
            </div>
            <Button
              type="button"
              onClick={handleCapture}
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
            className="w-full h-48 object-contain"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-colors"
            aria-label="Remove photo"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white px-3 py-2 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Photo ready to upload
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 italic">
        * This photo will only be visible to you, the recipient, and admin for verification purposes.
      </p>
    </div>
  );
}
