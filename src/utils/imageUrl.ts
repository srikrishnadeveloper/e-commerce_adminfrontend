// Centralized image URL utility for the admin dashboard
// This ensures all image paths are correctly resolved to the backend API

// API base URL for images (without /api suffix)
export const IMAGE_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE)
  ? import.meta.env.VITE_API_BASE.replace('/api', '')
  : 'http://localhost:5001';

// Placeholder image path
export const PLACEHOLDER_IMAGE = '/images/placeholder.svg';

/**
 * Helper to get full image URL from a relative path
 * @param imagePath - The image path (can be relative like /images/photo.jpg or absolute URL)
 * @param fallback - Optional fallback image path (defaults to placeholder)
 * @returns Full URL to the image
 */
export const getImageUrl = (imagePath: string | undefined | null, fallback: string = PLACEHOLDER_IMAGE): string => {
  // If no path provided, return fallback
  if (!imagePath || imagePath.trim() === '') {
    return `${IMAGE_BASE_URL}${fallback}`;
  }
  
  // If already a full URL (http:// or https://), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a data URL, return as-is
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // Prepend the backend base URL for relative paths
  return `${IMAGE_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

/**
 * Check if an image URL is valid (not empty or placeholder-like)
 * @param imagePath - The image path to check
 * @returns true if the image path appears to be a real image
 */
export const hasValidImage = (imagePath: string | undefined | null): boolean => {
  if (!imagePath || imagePath.trim() === '') return false;
  if (imagePath === PLACEHOLDER_IMAGE) return false;
  return true;
};

export default getImageUrl;
