import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { imagesAPI } from '../../services/api';

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

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    imagesAPI
      .getAll()
      .then((res) => {
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
      })
      .catch((e) => setError(e?.message || 'Failed to load images'))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const supported = useMemo(() => new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']), []);
  const filtered = useMemo(() => images.filter((i) => supported.has(i.extension?.toLowerCase?.())), [images, supported]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Select Image</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {loading && (
            <div className="py-10 text-center text-gray-600">Loading images…</div>
          )}
          {error && (
            <div className="py-2 px-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 overflow-y-auto max-h-[60vh]">
              {filtered.map((img) => {
                const dim = dimensions[img.path];
                return (
                  <button
                    key={img.path}
                    type="button"
                    className="group border rounded hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                    onClick={() => onSelect(img.path)}
                    title={img.name}
                  >
                    <img
                      src={toSrc(img.path)}
                      alt={img.name}
                      className="w-full h-28 object-cover rounded-t"
                      loading="lazy"
                    />
                    <div className="p-2 text-xs text-gray-600 flex items-center justify-between">
                      <span className="truncate mr-2" title={img.name}>{img.name}</span>
                      <span>{humanSize(img.size)}</span>
                    </div>
                    <div className="px-2 pb-2 text-[11px] text-gray-500">{dim ? `${dim.w}×${dim.h}` : '—'}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageSelectorModal;

