import React, { useCallback } from 'react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface SiteConfig {
  announcementbar?: {
    enabled: boolean;
    backgroundColor: string;
    textColor: string;
    announcements: string[];
  };
}

interface AnnouncementTabProps {
  config: SiteConfig;
  updateConfig: (path: string, value: any) => void;
  addArrayItem: (path: string, item: any) => void;
  removeArrayItem: (path: string, index: number) => void;
}

const AnnouncementTab: React.FC<AnnouncementTabProps> = ({
  config,
  updateConfig,
  addArrayItem,
  removeArrayItem
}) => {
  // Use useCallback to prevent double execution in React StrictMode
  const handleAddAnnouncement = useCallback(() => {
    addArrayItem('announcementbar.announcements', '');
  }, [addArrayItem]);

  const handleRemoveAnnouncement = useCallback((index: number) => {
    removeArrayItem('announcementbar.announcements', index);
  }, [removeArrayItem]);

  return (
    <div className="space-y-6">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="announcement-enabled"
          checked={config.announcementbar?.enabled || false}
          onChange={(e) => updateConfig('announcementbar.enabled', e.target.checked)}
          className="rounded border-border"
        />
        <label htmlFor="announcement-enabled" className="text-sm font-medium text-foreground">
          Enable Announcement Bar
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Announcements Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Announcement Messages</h3>
            <Button
              onClick={handleAddAnnouncement}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Message
            </Button>
          </div>
          <div className="space-y-3">
            {config.announcementbar?.announcements?.map((announcement, index) => (
              <div key={`announcement-${index}`} className="flex gap-3 items-center p-3 border border-border rounded-lg">
                <div className="flex-1">
                  <Textarea
                    value={announcement}
                    onChange={(e) => updateConfig(`announcementbar.announcements.${index}`, e.target.value)}
                    placeholder="Enter announcement message..."
                    rows={2}
                  />
                </div>
                <Button
                  onClick={() => handleRemoveAnnouncement(index)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {(!config.announcementbar?.announcements || config.announcementbar.announcements.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <p>No announcements yet. Click "Add Message" to create your first announcement.</p>
              </div>
            )}
          </div>
        </div>

        {/* Colors Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Appearance</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Background Color</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.announcementbar?.backgroundColor || '#2c3bc5'}
                  onChange={(e) => updateConfig('announcementbar.backgroundColor', e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={config.announcementbar?.backgroundColor || '#2c3bc5'}
                  onChange={(e) => updateConfig('announcementbar.backgroundColor', e.target.value)}
                  placeholder="#2c3bc5"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Text Color</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.announcementbar?.textColor || '#ffffff'}
                  onChange={(e) => updateConfig('announcementbar.textColor', e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={config.announcementbar?.textColor || '#ffffff'}
                  onChange={(e) => updateConfig('announcementbar.textColor', e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      {config.announcementbar?.enabled && config.announcementbar?.announcements?.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Preview:</h4>
          <div
            className="p-3 text-center text-sm rounded-lg overflow-hidden relative"
            style={{
              backgroundColor: config.announcementbar?.backgroundColor || '#2c3bc5',
              color: config.announcementbar?.textColor || '#ffffff'
            }}
          >
            <div className="animate-scroll-left flex items-center space-x-16 whitespace-nowrap">
              {config.announcementbar.announcements.map((announcement, index) => (
                <span key={`preview-${index}`} className="text-sm font-medium">
                  {announcement || 'Announcement text will appear here'}
                </span>
              ))}
              {/* Duplicate for seamless loop */}
              {config.announcementbar.announcements.map((announcement, index) => (
                <span key={`preview-dup-${index}`} className="text-sm font-medium">
                  {announcement || 'Announcement text will appear here'}
                </span>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Preview shows scrolling animation with all announcement messages
          </p>
        </div>
      )}
    </div>
  );
};

export default AnnouncementTab;
