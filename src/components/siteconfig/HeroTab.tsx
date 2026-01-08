import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';

interface SiteConfig {
  hero?: {
    slides?: Array<{
      id: number;
      heading: string;
      subheading: string;
      button: string;
      buttonLink: string;
      image: string;
      textColor?: string;
    }>;
  };
}

interface HeroTabProps {
  config: SiteConfig;
  updateConfig: (path: string, value: any) => void;
  addArrayItem: (path: string, item: any) => void;
  removeArrayItem: (path: string, index: number) => void;
  setPickerTarget: (target: string) => void;
  setPickerOpen: (open: boolean) => void;
}

const HeroTab: React.FC<HeroTabProps> = ({
  config,
  updateConfig,
  addArrayItem,
  removeArrayItem,
  setPickerTarget,
  setPickerOpen
}) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-foreground">Hero Slides</h3>
      <Button
        onClick={() => addArrayItem('hero.slides', {
          id: Date.now(),
          heading: '',
          subheading: '',
          button: '',
          buttonLink: '',
          image: '',
          textColor: '#000000'
        })}
        size="sm"
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Slide
      </Button>
    </div>
    <div className="space-y-4">
      {config.hero?.slides?.map((slide, index) => (
        <div key={index} className="p-4 border border-border rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Heading</label>
              <Input
                value={slide.heading}
                onChange={(e) => updateConfig(`hero.slides.${index}.heading`, e.target.value)}
                placeholder="Welcome to TechCart"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Subheading</label>
              <Input
                value={slide.subheading}
                onChange={(e) => updateConfig(`hero.slides.${index}.subheading`, e.target.value)}
                placeholder="Discover amazing products"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Button Text</label>
              <Input
                value={slide.button}
                onChange={(e) => updateConfig(`hero.slides.${index}.button`, e.target.value)}
                placeholder="Shop Now"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Button Link</label>
              <Input
                value={slide.buttonLink || ''}
                onChange={(e) => updateConfig(`hero.slides.${index}.buttonLink`, e.target.value)}
                placeholder="/products"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Text Color</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={slide.textColor || '#000000'}
                  onChange={(e) => updateConfig(`hero.slides.${index}.textColor`, e.target.value)}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  value={slide.textColor || '#000000'}
                  onChange={(e) => updateConfig(`hero.slides.${index}.textColor`, e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Image URL <span className="text-xs text-gray-500">(Recommended: 1400 x 909)</span></label>
              <div className="flex gap-2">
                <Input
                  value={slide.image}
                  onChange={(e) => updateConfig(`hero.slides.${index}.image`, e.target.value)}
                  placeholder="/images/hero-slide.jpg"
                />
                <Button variant="outline" size="sm" onClick={() => { setPickerTarget(`hero.slides.${index}.image`); setPickerOpen(true); }}>Select</Button>
              </div>
              {slide.image && (
                <div className="mt-2">
                  <img
                    src={getImageUrl(slide.image)}
                    alt={`Slide ${index + 1}`}
                    className="w-24 h-24 object-cover rounded border"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => removeArrayItem('hero.slides', index)}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="h-4 w-4" />
              Remove Slide
            </Button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default HeroTab;
