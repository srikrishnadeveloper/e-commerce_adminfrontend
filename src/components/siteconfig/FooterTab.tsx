import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Plus, Trash2 } from 'lucide-react';

interface SiteConfig {
  footer?: {
    copyright: string;
    getDirectionText: string;
    getDirectionLink: string;
    newsletter?: {
      title: string;
      description: string;
      placeholder: string;
      buttonText: string;
    };
    socialMedia?: {
      youtube?: { url: string; enabled: boolean };
      facebook?: { url: string; enabled: boolean };
      instagram?: { url: string; enabled: boolean };
      telegram?: { url: string; enabled: boolean };
    };
    sections?: Array<{
      title: string;
      links: Array<{ name: string; link: string }>;
    }>;
  };
}

interface FooterTabProps {
  config: SiteConfig;
  updateConfig: (path: string, value: any) => void;
  addArrayItem: (path: string, item: any) => void;
  removeArrayItem: (path: string, index: number) => void;
}

const FooterTab: React.FC<FooterTabProps> = ({
  config,
  updateConfig,
  addArrayItem,
  removeArrayItem
}) => (
  <div className="space-y-6">
    {/* Basic Footer Info */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Copyright Text</label>
          <Input
            value={config.footer?.copyright || ''}
            onChange={(e) => updateConfig('footer.copyright', e.target.value)}
            placeholder="© 2024 TechCart. All rights reserved."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Get Direction Text</label>
          <Input
            value={config.footer?.getDirectionText || ''}
            onChange={(e) => updateConfig('footer.getDirectionText', e.target.value)}
            placeholder="Get Direction"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Get Direction Link</label>
          <Input
            value={config.footer?.getDirectionLink || ''}
            onChange={(e) => updateConfig('footer.getDirectionLink', e.target.value)}
            placeholder="https://maps.google.com"
          />
        </div>
      </div>
    </div>

    {/* Newsletter Section */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Newsletter Section</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Newsletter Title</label>
          <Input
            value={config.footer?.newsletter?.title || ''}
            onChange={(e) => updateConfig('footer.newsletter.title', e.target.value)}
            placeholder="Subscribe to our newsletter"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Newsletter Description</label>
          <Input
            value={config.footer?.newsletter?.description || ''}
            onChange={(e) => updateConfig('footer.newsletter.description', e.target.value)}
            placeholder="Get the latest updates and offers"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Input Placeholder</label>
          <Input
            value={config.footer?.newsletter?.placeholder || ''}
            onChange={(e) => updateConfig('footer.newsletter.placeholder', e.target.value)}
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Button Text</label>
          <Input
            value={config.footer?.newsletter?.buttonText || ''}
            onChange={(e) => updateConfig('footer.newsletter.buttonText', e.target.value)}
            placeholder="Subscribe"
          />
        </div>
      </div>
    </div>

    {/* Social Media Section */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Social Media Links</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['youtube', 'facebook', 'instagram', 'telegram'].map((platform) => (
          <div key={platform} className="p-4 border border-border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-foreground capitalize">{platform}</h4>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.footer?.socialMedia?.[platform]?.enabled !== false}
                  onChange={(e) => updateConfig(`footer.socialMedia.${platform}.enabled`, e.target.checked)}
                  className="rounded"
                />
                <label className="text-sm text-foreground">Enabled</label>
              </div>
            </div>
            <Input
              value={config.footer?.socialMedia?.[platform]?.url || ''}
              onChange={(e) => updateConfig(`footer.socialMedia.${platform}.url`, e.target.value)}
              placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
              disabled={config.footer?.socialMedia?.[platform]?.enabled === false}
            />
          </div>
        ))}
      </div>
    </div>

    {/* Footer Sections */}
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Footer Sections</h3>
        <Button
          onClick={() => addArrayItem('footer.sections', { title: '', links: [] })}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Section
        </Button>
      </div>
      <div className="space-y-4">
        {config.footer?.sections?.map((section, sectionIndex) => (
          <div key={sectionIndex} className="p-4 border border-border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1 mr-3">
                <label className="block text-sm font-medium text-foreground mb-1">Section Title</label>
                <Input
                  value={section.title}
                  onChange={(e) => updateConfig(`footer.sections.${sectionIndex}.title`, e.target.value)}
                  placeholder="Quick Links"
                />
              </div>
              <Button
                onClick={() => removeArrayItem('footer.sections', sectionIndex)}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">Links</h4>
                <Button
                  onClick={() => addArrayItem(`footer.sections.${sectionIndex}.links`, { name: '', link: '' })}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-3 w-3" />
                  Add Link
                </Button>
              </div>
              {section.links?.map((link, linkIndex) => (
                <div key={linkIndex} className="flex gap-2 items-center">
                  <Input
                    value={link.name}
                    onChange={(e) => updateConfig(`footer.sections.${sectionIndex}.links.${linkIndex}.name`, e.target.value)}
                    placeholder="Link Name"
                    className="flex-1"
                  />
                  <Input
                    value={link.link}
                    onChange={(e) => updateConfig(`footer.sections.${sectionIndex}.links.${linkIndex}.link`, e.target.value)}
                    placeholder="/link"
                    className="flex-1"
                  />
                  <Button
                    onClick={() => removeArrayItem(`footer.sections.${sectionIndex}.links`, linkIndex)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default FooterTab;
