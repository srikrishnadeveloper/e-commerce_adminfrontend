import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import toast from 'react-hot-toast';
import {
  Upload,
  Trash2,
  Search,
  Image as ImageIcon,
  Copy,
  FolderOpen,
  RefreshCw,
  X,
  CloudUpload,
  CheckCircle,
  Filter,
} from 'lucide-react';

interface ImageFile {
  name: string;
  path: string;
  size: number;
  modified: string;
  extension: string;
  directory?: string;
}

const API_BASE = 'http://localhost:5001';

const ImageManagement: React.FC = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDirectory, setSelectedDirectory] = useState<string>('all');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [previewImage, setPreviewImage] = useState<ImageFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadImages();
  }, []);

  useEffect(() => {
    filterImages();
  }, [images, searchTerm, selectedDirectory]);

  const loadImages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/api/images`);
      const data = await response.json();
      if (data.success) {
        setImages(data.data);
      } else {
        toast.error('Failed to load images');
      }
    } catch (error) {
      console.error('Error loading images:', error);
      toast.error('Failed to load images');
    } finally {
      setIsLoading(false);
    }
  };

  const filterImages = () => {
    let filtered = [...images];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        img => img.name.toLowerCase().includes(term) || img.path.toLowerCase().includes(term)
      );
    }

    // Filter by directory
    if (selectedDirectory !== 'all') {
      if (selectedDirectory === 'root') {
        filtered = filtered.filter(img => !img.directory);
      } else {
        filtered = filtered.filter(img => img.directory === selectedDirectory);
      }
    }

    setFilteredImages(filtered);
  };

  const getDirectories = () => {
    const dirs = new Set<string>();
    images.forEach(img => {
      if (img.directory) {
        dirs.add(img.directory);
      }
    });
    return Array.from(dirs).sort();
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      const response = await fetch(`${API_BASE}/api/images/upload`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Successfully uploaded ${data.data.length} image(s)`);
        loadImages();
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDeleteImage = async (imagePath: string) => {
    const filename = imagePath.split('/').pop();
    if (!filename) return;

    if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;

    try {
      const response = await fetch(`${API_BASE}/api/images/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Image deleted');
        loadImages();
        setSelectedImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(imagePath);
          return newSet;
        });
      } else {
        toast.error(data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedImages.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedImages.size} image(s)?`)) return;

    let successCount = 0;
    let failCount = 0;

    for (const imagePath of selectedImages) {
      const filename = imagePath.split('/').pop();
      if (!filename) continue;

      try {
        const response = await fetch(`${API_BASE}/api/images/${encodeURIComponent(filename)}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Deleted ${successCount} image(s)`);
      loadImages();
      setSelectedImages(new Set());
    }
    if (failCount > 0) {
      toast.error(`Failed to delete ${failCount} image(s)`);
    }
  };

  const copyToClipboard = (path: string) => {
    navigator.clipboard.writeText(path);
    toast.success('Path copied to clipboard');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const toggleImageSelection = (path: string) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedImages.size === filteredImages.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(filteredImages.map(img => img.path)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Image Management</h1>
          <p className="text-muted-foreground mt-1">
            Upload, view, and manage all your product images
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={loadImages}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Images
          </Button>
        </div>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
            : 'border-gray-300 dark:border-gray-700 hover:border-blue-400'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileUpload(e.target.files)}
          accept="image/*"
          multiple
          className="hidden"
        />
        <CloudUpload className={`h-12 w-12 mx-auto mb-4 ${dragOver ? 'text-blue-500' : 'text-gray-400'}`} />
        <p className="text-lg font-medium text-foreground mb-1">
          {uploading ? 'Uploading...' : 'Drag & drop images here'}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          or click the Upload button above
        </p>
        <p className="text-xs text-muted-foreground">
          Supports PNG, JPG, JPEG, GIF, SVG, WEBP
        </p>
      </div>

      {/* Filters & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card rounded-xl p-4 border">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          {/* Directory Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedDirectory}
              onChange={(e) => setSelectedDirectory(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Folders</option>
              <option value="root">Root</option>
              {getDirectories().map(dir => (
                <option key={dir} value={dir}>{dir}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Stats */}
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{filteredImages.length}</span>
            {filteredImages.length !== images.length && (
              <span> of {images.length}</span>
            )}
            {' '}images
          </div>

          {/* Selection Actions */}
          {selectedImages.size > 0 && (
            <div className="flex items-center gap-2 pl-4 border-l">
              <span className="text-sm text-blue-600 font-medium">
                {selectedImages.size} selected
              </span>
              <Button
                onClick={handleBulkDelete}
                size="sm"
                variant="destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          )}

          <Button
            onClick={selectAll}
            variant="outline"
            size="sm"
          >
            {selectedImages.size === filteredImages.length && filteredImages.length > 0 ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
      </div>

      {/* Images Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border">
          <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No images found</h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedDirectory !== 'all'
              ? 'Try adjusting your filters'
              : 'Upload some images to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.path}
              className={`group relative bg-card rounded-xl border overflow-hidden transition-all hover:shadow-lg ${
                selectedImages.has(image.path) ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {/* Selection Checkbox */}
              <button
                onClick={() => toggleImageSelection(image.path)}
                className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedImages.has(image.path)
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white/80 border-gray-300 opacity-0 group-hover:opacity-100'
                }`}
              >
                {selectedImages.has(image.path) && <CheckCircle className="h-4 w-4" />}
              </button>

              {/* Image Preview */}
              <div
                className="aspect-square cursor-pointer"
                onClick={() => setPreviewImage(image)}
              >
                <img
                  src={`${API_BASE}${image.path}`}
                  alt={image.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Image Info */}
              <div className="p-3 space-y-1">
                <p className="text-sm font-medium text-foreground truncate" title={image.name}>
                  {image.name}
                </p>
                <p className="text-xs text-muted-foreground truncate" title={image.path}>
                  {image.path}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatFileSize(image.size)}</span>
                  {image.directory && (
                    <span className="flex items-center gap-1">
                      <FolderOpen className="h-3 w-3" />
                      {image.directory}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => copyToClipboard(image.path)}
                  className="p-1.5 bg-white/90 rounded-lg shadow hover:bg-white transition-colors"
                  title="Copy path"
                >
                  <Copy className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDeleteImage(image.path)}
                  className="p-1.5 bg-white/90 rounded-lg shadow hover:bg-red-50 transition-colors"
                  title="Delete image"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-card rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <img
              src={`${API_BASE}${previewImage.path}`}
              alt={previewImage.name}
              className="max-w-full max-h-[70vh] object-contain"
            />
            
            <div className="p-4 bg-card border-t">
              <h3 className="font-semibold text-foreground mb-2">{previewImage.name}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Path:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-muted px-2 py-1 rounded text-xs flex-1 overflow-hidden text-ellipsis">
                      {previewImage.path}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(previewImage.path)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Size:</span>
                  <p className="mt-1 font-medium">{formatFileSize(previewImage.size)}</p>
                </div>
                {previewImage.directory && (
                  <div>
                    <span className="text-muted-foreground">Folder:</span>
                    <p className="mt-1 font-medium">{previewImage.directory}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <p className="mt-1 font-medium">{previewImage.extension.toUpperCase()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageManagement;
