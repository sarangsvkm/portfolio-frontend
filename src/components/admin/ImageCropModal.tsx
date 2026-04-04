import { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { X, Check, Upload, Crop, ImageOff } from 'lucide-react';
import getCroppedImg from '../../utils/cropImage';

interface ImageCropModalProps {
  imageSrc: string;
  onCropComplete: (croppedFile: File) => void;
  onCancel: () => void;
  aspect?: number; // pass undefined for freeform
}

type Mode = 'choose' | 'crop';

export function ImageCropModal({ imageSrc, onCropComplete, onCancel, aspect }: ImageCropModalProps) {
  const [mode, setMode] = useState<Mode>('choose');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop);
  }, []);

  const onCropCompleteFn = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const handleCropAndUpload = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const file = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (file) {
        onCropComplete(file);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadAsIs = async () => {
    setIsProcessing(true);
    try {
      // Fetch the blob from the object URL and convert to File
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const ext = blob.type.split('/')[1] || 'jpeg';
      const file = new File([blob], `original_image.${ext}`, { type: blob.type });
      onCropComplete(file);
    } catch (e) {
      console.error('Error uploading as-is', e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-screen">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {mode === 'choose' ? 'Upload Image' : 'Crop Image'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Choice Mode */}
        {mode === 'choose' && (
          <>
            <div className="p-6 overflow-hidden">
              {/* Image Preview */}
              <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex items-center justify-center max-h-[40vh]">
                <img
                  src={imageSrc}
                  alt="Preview"
                  className="max-h-[40vh] max-w-full object-contain"
                />
              </div>
            </div>

            <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-800 pt-4 shrink-0">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">
                How would you like to upload this image?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Crop first */}
                <button
                  onClick={() => setMode('crop')}
                  disabled={isProcessing}
                  className="flex flex-col items-center gap-3 px-5 py-6 rounded-2xl border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 hover:border-purple-500 hover:bg-purple-100 dark:hover:bg-purple-950/60 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                    <Crop className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900 dark:text-white">Crop & Upload</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Trim, zoom and position the image before uploading</p>
                  </div>
                </button>

                {/* Upload as-is */}
                <button
                  onClick={handleUploadAsIs}
                  disabled={isProcessing}
                  className="flex flex-col items-center gap-3 px-5 py-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group disabled:opacity-50"
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-700 dark:bg-gray-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    {isProcessing ? (
                      <Upload className="w-6 h-6 animate-pulse" />
                    ) : (
                      <ImageOff className="w-6 h-6" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {isProcessing ? 'Uploading...' : 'Upload As-Is'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Upload the original image without any changes</p>
                  </div>
                </button>
              </div>

              <button
                onClick={onCancel}
                disabled={isProcessing}
                className="w-full mt-3 py-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {/* Crop Mode */}
        {mode === 'crop' && (
          <>
            <div className="relative w-full h-[50vh] sm:h-[55vh] bg-gray-100 dark:bg-gray-950">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={onCropChange}
                onCropComplete={onCropCompleteFn}
                onZoomChange={onZoomChange}
              />
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 items-center justify-between shrink-0">
              <div className="flex items-center gap-4 w-full sm:w-1/2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 shrink-0">Zoom</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-label="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setMode('choose')}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCropAndUpload}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium shadow-md shadow-purple-500/20 transition-all disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : (
                    <>
                      <Check className="w-4 h-4" />
                      Crop & Upload
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
