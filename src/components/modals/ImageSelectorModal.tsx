import React, { useEffect, useMemo, useState, useRef } from 'react';
import { X, Upload, Trash2, Plus } from 'lucide-react';
import { imagesAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface ImageFile {
  name: string;
  path: string; // e.g. /images/foo.png
  size: number; // bytes
  modified: string;
  extension: string;
  directory?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imagePath: string) => void; // returns /images/... value
}

const humanSize = (bytes: number) => {
  if (!bytes && bytes !== 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(1)} ${units[i]}`;
};

const toSrc = (p?: string) => (p?.startsWith('http') ? p : `http://localhost:5001${p}`);

const ImageSelectorModal: React.FC<Props> = ({ isOpen, onClose, onSelect }) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<Record<string, { w: number; h: number }>>({});
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    loadImages();
  }, [isOpen]);

  const supported = useMemo(() => new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico']), []);
  const filtered = useMemo(() => images.filter((i) => supported.has(i.extension?.toLowerCase?.())), [images, supported]);

  const loadImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await imagesAPI.getAll();
      const list: ImageFile[] = res.data || [];
      setImages(list);
      // Preload dimensions
      list.forEach((img) => {
        const src = toSrc(img.path);
        const i = new Image();
        i.onload = () => {
          setDimensions((d) => ({ ...d, [img.path]: { w: i.naturalWidth, h: i.naturalHeight } }));
        };
        i.src = src;
      });
    } catch (e: any) {
      setError(e?.message || 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter(file => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      return supported.has(ext);
    });

    if (validFiles.length === 0) {
      toast.error('Please select valid image files (PNG, JPG, JPEG, GIF, WebP, SVG, ICO)');
      return;
    }

    if (validFiles.length > 10) {
      toast.error('Maximum 10 files can be uploaded at once');
      return;
    }

    const oversizedFiles = validFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Some files are too large. Maximum file size is 10MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await imagesAPI.upload(formData);
      toast.success(`Successfully uploaded ${response.count} image(s)`);

      // Reload images list
      await loadImages();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error?.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageName: string) => {
    try {
      await imagesAPI.delete(imageName);
      toast.success('Image deleted successfully');
      await loadImages();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete image');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Select Image</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />

        <div
          className={`p-4 ${dragOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Drag and Drop Zone */}
          {!loading && !error && filtered.length === 0 && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No images found</p>
              <p className="text-sm text-gray-500 mb-4">Drag and drop images here or click upload to get started</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Upload Images
              </button>
            </div>
          )}

          {loading && (
            <div className="py-10 text-center text-gray-600">Loading images…</div>
          )}
          {error && (
            <div className="py-2 px-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <>
              {/* Drag and Drop Hint */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 <strong>Tip:</strong> Drag and drop images here to upload them quickly!
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 overflow-y-auto max-h-[60vh]">
                {filtered.map((img) => {
                  const dim = dimensions[img.path];
                  return (
                    <div key={img.path} className="relative group">
                      <button
                        type="button"
                        className="w-full border rounded hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                        onClick={() => onSelect(img.path)}
                        title={img.name}
                      >
                        <img
                          src={toSrc(img.path)}
                          alt={img.name}
                          className="w-full h-28 max-w-full max-h-28 object-cover rounded-t"
                          style={{
                            minHeight: '112px',
                            maxHeight: '112px',
                            minWidth: '100%',
                            maxWidth: '100%',
                            objectFit: 'cover'
                          }}
                          loading="lazy"
                        />
                        <div className="p-2 text-xs text-gray-600 flex items-center justify-between">
                          <span className="truncate mr-2" title={img.name}>{img.name}</span>
                          <span>{humanSize(img.size)}</span>
                        </div>
                        <div className="px-2 pb-2 text-[11px] text-gray-500">{dim ? `${dim.w}×${dim.h}` : '—'}</div>
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(img.name);
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Delete image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageSelectorModal;

