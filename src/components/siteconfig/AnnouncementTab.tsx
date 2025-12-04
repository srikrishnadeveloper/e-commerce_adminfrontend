import React, { useCallback, useMemo } from 'react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';

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
  // Memoize current announcements for performance
  const currentAnnouncements = useMemo(() =>
    config.announcementbar?.announcements || [],
    [config.announcementbar?.announcements]
  );

  // Use useCallback to prevent double execution in React StrictMode
  const handleAddAnnouncement = useCallback(() => {
    addArrayItem('announcementbar.announcements', 'New announcement message...');
  }, [addArrayItem]);

  const handleRemoveAnnouncement = useCallback((index: number) => {
    removeArrayItem('announcementbar.announcements', index);
  }, [removeArrayItem]);

  const handleAnnouncementChange = useCallback((index: number, value: string) => {
    updateConfig(`announcementbar.announcements.${index}`, value);
  }, [updateConfig]);

  return (
    <div className="space-y-6">
      {/* Enhanced Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/50">
        <div className="flex items-center space-x-3">
          {config.announcementbar?.enabled ? (
            <Eye className="h-5 w-5 text-green-600" />
          ) : (
            <EyeOff className="h-5 w-5 text-gray-400" />
          )}
          <div>
            <label htmlFor="announcement-enabled" className="text-sm font-medium text-foreground cursor-pointer">
              Enable Announcement Bar
            </label>
            <p className="text-xs text-muted-foreground">
              {config.announcementbar?.enabled
                ? 'Announcement bar is visible to users'
                : 'Announcement bar is hidden from users'
              }
            </p>
          </div>
        </div>
        <input
          type="checkbox"
          id="announcement-enabled"
          checked={config.announcementbar?.enabled || false}
          onChange={(e) => updateConfig('announcementbar.enabled', e.target.checked)}
          className="rounded border-border h-4 w-4"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Announcements Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Announcement Messages</h3>
              <p className="text-sm text-muted-foreground">
                {currentAnnouncements.length} message{currentAnnouncements.length !== 1 ? 's' : ''} configured
              </p>
            </div>
            <Button
              onClick={handleAddAnnouncement}
              size="sm"
              className="flex items-center gap-2"
              disabled={currentAnnouncements.length >= 10}
            >
              <Plus className="h-4 w-4" />
              Add Message
            </Button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {currentAnnouncements.map((announcement, index) => (
              <div key={`announcement-${index}`} className="flex gap-3 items-start p-3 border border-border rounded-lg bg-background">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Message {index + 1}</span>
                    <span className="text-xs text-muted-foreground">
                      {announcement.length}/200 characters
                    </span>
                  </div>
                  <Textarea
                    value={announcement}
                    onChange={(e) => handleAnnouncementChange(index, e.target.value)}
                    placeholder="Enter announcement message..."
                    rows={2}
                    maxLength={200}
                    className="resize-none"
                  />
                </div>
                <Button
                  onClick={() => handleRemoveAnnouncement(index)}
                  variant="destructive"
                  size="sm"
                  className="mt-6"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {currentAnnouncements.length === 0 && (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <Plus className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="font-medium">No announcements yet</p>
                <p className="text-sm">Click "Add Message" to create your first announcement.</p>
              </div>
            )}

            {currentAnnouncements.length >= 10 && (
              <div className="text-center py-2 text-amber-600 text-sm">
                Maximum of 10 announcements reached
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

      {/* Enhanced Preview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-foreground">Live Preview</h4>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Real-time preview</span>
          </div>
        </div>

        {config.announcementbar?.enabled && currentAnnouncements.length > 0 ? (
          <div className="space-y-2">
            <div
              className="h-12 flex items-center text-center text-sm rounded-lg overflow-hidden relative border-2 border-dashed border-gray-300"
              style={{
                backgroundColor: config.announcementbar?.backgroundColor || '#2c3bc5',
                color: config.announcementbar?.textColor || '#ffffff'
              }}
            >
              <div
                className="animate-scroll-left flex items-center whitespace-nowrap px-4"
                style={{
                  animationDuration: `${Math.max(20, currentAnnouncements.length * 4)}s`
                }}
              >
                {currentAnnouncements.filter(a => a.trim()).map((announcement, index) => (
                  <span key={`preview-${index}`} className="text-sm font-medium px-8">
                    {announcement || 'Announcement text will appear here'}
                  </span>
                ))}
                {/* Duplicate for seamless loop */}
                {currentAnnouncements.filter(a => a.trim()).map((announcement, index) => (
                  <span key={`preview-dup-${index}`} className="text-sm font-medium px-8">
                    {announcement || 'Announcement text will appear here'}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Scrolling animation with {currentAnnouncements.filter(a => a.trim()).length} messages</span>
              <span>Animation speed: {Math.max(20, currentAnnouncements.length * 4)}s per cycle</span>
            </div>
          </div>
        ) : (
          <div className="h-12 flex items-center justify-center text-center text-sm rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500">
            {!config.announcementbar?.enabled
              ? 'Announcement bar is disabled'
              : 'No announcement messages to preview'
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementTab;
