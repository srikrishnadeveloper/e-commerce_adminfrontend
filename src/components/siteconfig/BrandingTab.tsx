import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface SiteConfig {
  branding?: {
    logo?: {
      url: string;
      alt: string;
    };
    faviconUrl?: string;
  };
}

interface BrandingTabProps {
  config: SiteConfig;
  updateConfig: (path: string, value: any) => void;
  setPickerTarget: (target: string) => void;
  setPickerOpen: (open: boolean) => void;
}

const BrandingTab: React.FC<BrandingTabProps> = ({
  config,
  updateConfig,
  setPickerTarget,
  setPickerOpen
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Logo Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Logo Settings</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Logo URL</label>
            <div className="flex gap-2">
              <Input
                value={config.branding?.logo?.url || ''}
                onChange={(e) => updateConfig('branding.logo.url', e.target.value)}
                placeholder="/logo.svg"
              />
              <Button variant="outline" size="sm" onClick={() => { setPickerTarget('branding.logo.url'); setPickerOpen(true); }}>Select</Button>
            </div>
            {config.branding?.logo?.url && (
              <div className="mt-2">
                <img
                  src={(config.branding?.logo?.url || '').startsWith('http') ? (config.branding?.logo?.url as string) : `http://localhost:5001${config.branding?.logo?.url}`}
                  alt="Logo Preview"
                  className="w-20 h-20 object-contain rounded border bg-white"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Logo Alt Text</label>
            <Input
              value={config.branding?.logo?.alt || ''}
              onChange={(e) => updateConfig('branding.logo.alt', e.target.value)}
              placeholder="Company Logo"
            />
          </div>
        </div>
      </div>

      {/* Favicon Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Favicon</h3>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Favicon URL</label>
          <div className="flex gap-2">
            <Input
              value={config.branding?.faviconUrl || ''}
              onChange={(e) => updateConfig('branding.faviconUrl', e.target.value)}
              placeholder="/favicon.ico"
            />
            <Button variant="outline" size="sm" onClick={() => { setPickerTarget('branding.faviconUrl'); setPickerOpen(true); }}>Select</Button>
          </div>
          {config.branding?.faviconUrl && (
            <div className="mt-2">
              <img
                src={(config.branding?.faviconUrl || '').startsWith('http') ? (config.branding?.faviconUrl as string) : `http://localhost:5001${config.branding?.faviconUrl}`}
                alt="Favicon"
                className="w-8 h-8 object-contain rounded border"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default BrandingTab;
