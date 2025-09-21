import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import toast from 'react-hot-toast';
import Editor from '@monaco-editor/react';
import {
  Save,
  RotateCcw,
  Download,
  Upload,
  Eye,
  EyeOff,
  Palette,
  Navigation,
  Home,
  MessageSquare,
  Image,
  Building,
  History,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  Code,
  FileText
} from 'lucide-react';

interface SiteConfig {
  branding?: {
    logo?: {
      light: string;
      dark: string;
      alt: string;
    };
    faviconUrl?: string;
    colors?: {
      primary: string;
      secondary: string;
      accent: string;
      neutral: string;
    };
  };
  navigation?: {
    mainMenu?: Array<{ name: string; link: string }>;
    footerNav?: Array<{ text: string; href: string }>;
  };
  announcementbar?: {
    enabled: boolean;
    text: string;
    backgroundColor: string;
    textColor: string;
  };
  hero?: {
    slides?: Array<{
      id: number;
      heading: string;
      subheading: string;
      button: string;
      image: string;
    }>;
  };
  homepage?: {
    hotDealsSection?: {
      title: string;
      subtitle: string;
    };
    featuresSection?: {
      title: string;
      subtitle: string;
      features?: Array<{
        icon: string;
        title: string;
        description: string;
      }>;
    };
    testimonialSection?: {
      title: string;
      navigationLabels?: {
        previous: string;
        next: string;
      };
      testimonials?: Array<{
        name: string;
        role: string;
        rating: number;
        text: string;
      }>;
    };
    featuredCollections?: {
      title: string;
      collections?: Array<{
        id: number;
        title: string;
        subtitle: string;
        description: string;
        image: string;
        buttonText: string;
        buttonLink: string;
        gradient: string;
      }>;
    };
  };
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
    sections?: Array<{
      title: string;
      links: Array<{ name: string; link: string }>;
    }>;
  };
  company?: {
    address?: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
    contact?: {
      email: string;
      phone: string;
    };
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const SiteConfigPanel: React.FC = () => {
  const [config, setConfig] = useState<SiteConfig>({});
  const [originalConfig, setOriginalConfig] = useState<SiteConfig>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('branding');
  const [showPreview, setShowPreview] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [jsonEditorValue, setJsonEditorValue] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const tabs = [
    { id: 'branding', label: 'Branding & Colors', icon: Palette },
    { id: 'navigation', label: 'Navigation', icon: Navigation },
    { id: 'announcement', label: 'Announcement Bar', icon: MessageSquare },
    { id: 'homepage', label: 'Homepage', icon: Home },
    { id: 'hero', label: 'Hero Section', icon: Image },
    { id: 'footer', label: 'Footer', icon: Building },
    { id: 'company', label: 'Company Info', icon: Building },
    { id: 'json', label: 'Raw JSON Editor', icon: Code },
  ];

  useEffect(() => {
    loadSiteConfig();
  }, []);

  useEffect(() => {
    const configChanged = JSON.stringify(config) !== JSON.stringify(originalConfig);
    setHasChanges(configChanged);
  }, [config, originalConfig]);

  useEffect(() => {
    // Sync JSON editor with config changes
    setJsonEditorValue(JSON.stringify(config, null, 2));
    setJsonError(null);
  }, [config]);

  const loadSiteConfig = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/siteconfig-api/siteconfig');
      const result = await response.json();

      if (result.success) {
        setConfig(result.data);
        setOriginalConfig(result.data);
      } else {
        toast.error('Failed to load site configuration');
      }
    } catch (error) {
      console.error('Error loading site config:', error);
      toast.error('Error loading site configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const validateConfig = async (configData: SiteConfig) => {
    try {
      const response = await fetch('/siteconfig-api/siteconfig/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: configData })
      });
      const result = await response.json();

      if (result.success) {
        setValidation(result.data);
        return result.data;
      }
    } catch (error) {
      console.error('Error validating config:', error);
    }
    return null;
  };

  const saveConfig = async () => {
    try {
      setIsSaving(true);

      // Validate first
      const validationResult = await validateConfig(config);
      if (validationResult && !validationResult.isValid) {
        toast.error(`Configuration has ${validationResult.errors.length} error(s). Please fix them before saving.`);
        return;
      }

      const response = await fetch('/siteconfig-api/siteconfig/all', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config })
      });

      const result = await response.json();

      if (result.success) {
        setOriginalConfig(config);
        setHasChanges(false);
        toast.success('Site configuration saved successfully!');
      } else {
        toast.error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Error saving configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const resetConfig = () => {
    setConfig(originalConfig);
    setValidation(null);
    setShowResetConfirm(false);
    toast.success('Configuration reset to last saved state');
  };

  const handleResetClick = () => {
    if (hasChanges) {
      setShowResetConfirm(true);
    } else {
      toast.info('No changes to reset');
    }
  };

  const createBackup = async () => {
    try {
      const response = await fetch('/siteconfig-api/siteconfig/backup', {
        method: 'POST'
      });
      const result = await response.json();

      if (result.success) {
        toast.success('Backup created successfully!');
      } else {
        toast.error('Failed to create backup');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Error creating backup');
    }
  };

  const updateConfig = (path: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current = newConfig;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  const addArrayItem = (path: string, item: any) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current = newConfig;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      if (!current[keys[keys.length - 1]]) {
        current[keys[keys.length - 1]] = [];
      }

      current[keys[keys.length - 1]].push(item);
      return newConfig;
    });
  };

  const removeArrayItem = (path: string, index: number) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current = newConfig;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      if (current[keys[keys.length - 1]]) {
        current[keys[keys.length - 1]].splice(index, 1);
      }

      return newConfig;
    });
  };

  const handleJsonEditorChange = (value: string | undefined) => {
    if (!value) return;

    setJsonEditorValue(value);

    try {
      const parsedConfig = JSON.parse(value);
      setJsonError(null);
      setConfig(parsedConfig);
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : 'Invalid JSON');
    }
  };

  const formatJsonEditor = () => {
    try {
      const parsed = JSON.parse(jsonEditorValue);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonEditorValue(formatted);
      setJsonError(null);
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : 'Invalid JSON');
    }
  };

  const exportConfiguration = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `site-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Configuration exported successfully!');
  };

  const importConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target?.result as string);
        setConfig(importedConfig);
        toast.success('Configuration imported successfully!');
      } catch (error) {
        toast.error('Invalid configuration file');
      }
    };
    reader.readAsText(file);

    // Reset the input
    event.target.value = '';
  };

  const renderBrandingTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logo Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Logo Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Light Logo URL</label>
              <Input
                value={config.branding?.logo?.light || ''}
                onChange={(e) => updateConfig('branding.logo.light', e.target.value)}
                placeholder="/logo.svg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Dark Logo URL</label>
              <Input
                value={config.branding?.logo?.dark || ''}
                onChange={(e) => updateConfig('branding.logo.dark', e.target.value)}
                placeholder="/logo-dark.svg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Logo Alt Text</label>
              <Input
                value={config.branding?.logo?.alt || ''}
                onChange={(e) => updateConfig('branding.logo.alt', e.target.value)}
                placeholder="Company Logo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Favicon URL</label>
              <Input
                value={config.branding?.faviconUrl || ''}
                onChange={(e) => updateConfig('branding.faviconUrl', e.target.value)}
                placeholder="/favicon.ico"
              />
            </div>
          </div>
        </div>

        {/* Colors Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Brand Colors</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Primary Color</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.branding?.colors?.primary || '#3b82f6'}
                  onChange={(e) => updateConfig('branding.colors.primary', e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={config.branding?.colors?.primary || '#3b82f6'}
                  onChange={(e) => updateConfig('branding.colors.primary', e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Secondary Color</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.branding?.colors?.secondary || '#6b7280'}
                  onChange={(e) => updateConfig('branding.colors.secondary', e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={config.branding?.colors?.secondary || '#6b7280'}
                  onChange={(e) => updateConfig('branding.colors.secondary', e.target.value)}
                  placeholder="#6b7280"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Accent Color</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.branding?.colors?.accent || '#ef4444'}
                  onChange={(e) => updateConfig('branding.colors.accent', e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={config.branding?.colors?.accent || '#ef4444'}
                  onChange={(e) => updateConfig('branding.colors.accent', e.target.value)}
                  placeholder="#ef4444"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Neutral Color</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.branding?.colors?.neutral || '#f3f4f6'}
                  onChange={(e) => updateConfig('branding.colors.neutral', e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={config.branding?.colors?.neutral || '#f3f4f6'}
                  onChange={(e) => updateConfig('branding.colors.neutral', e.target.value)}
                  placeholder="#f3f4f6"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNavigationTab = () => (
    <div className="space-y-6">
      {/* Main Menu */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Main Navigation Menu</h3>
          <Button
            onClick={() => addArrayItem('navigation.mainMenu', { name: '', link: '' })}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Menu Item
          </Button>
        </div>
        <div className="space-y-3">
          {config.navigation?.mainMenu?.map((item, index) => (
            <div key={index} className="flex gap-3 items-center p-3 border border-border rounded-lg">
              <div className="flex-1">
                <Input
                  value={item.name}
                  onChange={(e) => updateConfig(`navigation.mainMenu.${index}.name`, e.target.value)}
                  placeholder="Menu Name"
                  className="mb-2"
                />
                <Input
                  value={item.link}
                  onChange={(e) => updateConfig(`navigation.mainMenu.${index}.link`, e.target.value)}
                  placeholder="/link"
                />
              </div>
              <Button
                onClick={() => removeArrayItem('navigation.mainMenu', index)}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Footer Navigation</h3>
          <Button
            onClick={() => addArrayItem('navigation.footerNav', { text: '', href: '' })}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Footer Link
          </Button>
        </div>
        <div className="space-y-3">
          {config.navigation?.footerNav?.map((item, index) => (
            <div key={index} className="flex gap-3 items-center p-3 border border-border rounded-lg">
              <div className="flex-1">
                <Input
                  value={item.text}
                  onChange={(e) => updateConfig(`navigation.footerNav.${index}.text`, e.target.value)}
                  placeholder="Link Text"
                  className="mb-2"
                />
                <Input
                  value={item.href}
                  onChange={(e) => updateConfig(`navigation.footerNav.${index}.href`, e.target.value)}
                  placeholder="/link"
                />
              </div>
              <Button
                onClick={() => removeArrayItem('navigation.footerNav', index)}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnnouncementTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Announcement Bar Settings</h3>
          <div className="space-y-3">
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
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Announcement Text</label>
              <Textarea
                value={config.announcementbar?.text || ''}
                onChange={(e) => updateConfig('announcementbar.text', e.target.value)}
                placeholder="Free shipping on all orders over $50!"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Colors</h3>
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
      {config.announcementbar?.enabled && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Preview:</h4>
          <div
            className="p-3 text-center text-sm rounded-lg"
            style={{
              backgroundColor: config.announcementbar?.backgroundColor || '#2c3bc5',
              color: config.announcementbar?.textColor || '#ffffff'
            }}
          >
            {config.announcementbar?.text || 'Announcement text will appear here'}
          </div>
        </div>
      )}
    </div>
  );

  const renderHomepageTab = () => (
    <div className="space-y-8">
      {/* Hot Deals Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Hot Deals Section</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Title</label>
            <Input
              value={config.homepage?.hotDealsSection?.title || ''}
              onChange={(e) => updateConfig('homepage.hotDealsSection.title', e.target.value)}
              placeholder="Hot Deals"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Subtitle</label>
            <Input
              value={config.homepage?.hotDealsSection?.subtitle || ''}
              onChange={(e) => updateConfig('homepage.hotDealsSection.subtitle', e.target.value)}
              placeholder="Don't miss these amazing offers"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Features Section</h3>
          <Button
            onClick={() => addArrayItem('homepage.featuresSection.features', { icon: '', title: '', description: '' })}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Feature
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Section Title</label>
            <Input
              value={config.homepage?.featuresSection?.title || ''}
              onChange={(e) => updateConfig('homepage.featuresSection.title', e.target.value)}
              placeholder="Why Choose Us"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Section Subtitle</label>
            <Input
              value={config.homepage?.featuresSection?.subtitle || ''}
              onChange={(e) => updateConfig('homepage.featuresSection.subtitle', e.target.value)}
              placeholder="Discover what makes us special"
            />
          </div>
        </div>
        <div className="space-y-3">
          {config.homepage?.featuresSection?.features?.map((feature, index) => (
            <div key={index} className="p-4 border border-border rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Icon</label>
                  <Input
                    value={feature.icon}
                    onChange={(e) => updateConfig(`homepage.featuresSection.features.${index}.icon`, e.target.value)}
                    placeholder="🚚"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Title</label>
                  <Input
                    value={feature.title}
                    onChange={(e) => updateConfig(`homepage.featuresSection.features.${index}.title`, e.target.value)}
                    placeholder="Fast Delivery"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => removeArrayItem('homepage.featuresSection.features', index)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                <Textarea
                  value={feature.description}
                  onChange={(e) => updateConfig(`homepage.featuresSection.features.${index}.description`, e.target.value)}
                  placeholder="We deliver your orders quickly and safely"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Testimonials Section</h3>
          <Button
            onClick={() => addArrayItem('homepage.testimonialSection.testimonials', {
              name: '',
              role: '',
              rating: 5,
              text: ''
            })}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Testimonial
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Section Title</label>
            <Input
              value={config.homepage?.testimonialSection?.title || ''}
              onChange={(e) => updateConfig('homepage.testimonialSection.title', e.target.value)}
              placeholder="What Our Customers Say"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Previous Button Label</label>
            <Input
              value={config.homepage?.testimonialSection?.navigationLabels?.previous || ''}
              onChange={(e) => updateConfig('homepage.testimonialSection.navigationLabels.previous', e.target.value)}
              placeholder="Previous"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Next Button Label</label>
            <Input
              value={config.homepage?.testimonialSection?.navigationLabels?.next || ''}
              onChange={(e) => updateConfig('homepage.testimonialSection.navigationLabels.next', e.target.value)}
              placeholder="Next"
            />
          </div>
        </div>
        <div className="space-y-3">
          {config.homepage?.testimonialSection?.testimonials?.map((testimonial, index) => (
            <div key={index} className="p-4 border border-border rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Customer Name</label>
                  <Input
                    value={testimonial.name}
                    onChange={(e) => updateConfig(`homepage.testimonialSection.testimonials.${index}.name`, e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Role/Title</label>
                  <Input
                    value={testimonial.role}
                    onChange={(e) => updateConfig(`homepage.testimonialSection.testimonials.${index}.role`, e.target.value)}
                    placeholder="Verified Customer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Rating (1-5)</label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={testimonial.rating}
                    onChange={(e) => updateConfig(`homepage.testimonialSection.testimonials.${index}.rating`, parseInt(e.target.value))}
                    placeholder="5"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-foreground mb-1">Testimonial Text</label>
                <Textarea
                  value={testimonial.text}
                  onChange={(e) => updateConfig(`homepage.testimonialSection.testimonials.${index}.text`, e.target.value)}
                  placeholder="This product exceeded my expectations. Great quality and fast delivery!"
                  rows={3}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => removeArrayItem('homepage.testimonialSection.testimonials', index)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove Testimonial
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Collections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Featured Collections</h3>
          <Button
            onClick={() => addArrayItem('homepage.featuredCollections.collections', {
              id: Date.now(),
              title: '',
              subtitle: '',
              description: '',
              image: '',
              buttonText: '',
              buttonLink: '',
              gradient: ''
            })}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Collection
          </Button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-1">Section Title</label>
          <Input
            value={config.homepage?.featuredCollections?.title || ''}
            onChange={(e) => updateConfig('homepage.featuredCollections.title', e.target.value)}
            placeholder="Featured Collections"
          />
        </div>
        <div className="space-y-4">
          {config.homepage?.featuredCollections?.collections?.map((collection, index) => (
            <div key={index} className="p-4 border border-border rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Title</label>
                  <Input
                    value={collection.title}
                    onChange={(e) => updateConfig(`homepage.featuredCollections.collections.${index}.title`, e.target.value)}
                    placeholder="Collection Title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Subtitle</label>
                  <Input
                    value={collection.subtitle}
                    onChange={(e) => updateConfig(`homepage.featuredCollections.collections.${index}.subtitle`, e.target.value)}
                    placeholder="Collection Subtitle"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Image URL</label>
                  <Input
                    value={collection.image}
                    onChange={(e) => updateConfig(`homepage.featuredCollections.collections.${index}.image`, e.target.value)}
                    placeholder="/images/collection.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Button Text</label>
                  <Input
                    value={collection.buttonText}
                    onChange={(e) => updateConfig(`homepage.featuredCollections.collections.${index}.buttonText`, e.target.value)}
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Button Link</label>
                  <Input
                    value={collection.buttonLink}
                    onChange={(e) => updateConfig(`homepage.featuredCollections.collections.${index}.buttonLink`, e.target.value)}
                    placeholder="/collections/electronics"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Gradient</label>
                  <Input
                    value={collection.gradient}
                    onChange={(e) => updateConfig(`homepage.featuredCollections.collections.${index}.gradient`, e.target.value)}
                    placeholder="from-blue-500 to-purple-600"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                <Textarea
                  value={collection.description}
                  onChange={(e) => updateConfig(`homepage.featuredCollections.collections.${index}.description`, e.target.value)}
                  placeholder="Collection description"
                  rows={2}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => removeArrayItem('homepage.featuredCollections.collections', index)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove Collection
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderHeroTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Hero Slides</h3>
        <Button
          onClick={() => addArrayItem('hero.slides', {
            id: Date.now(),
            heading: '',
            subheading: '',
            button: '',
            image: ''
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
                <label className="block text-sm font-medium text-foreground mb-1">Image URL</label>
                <Input
                  value={slide.image}
                  onChange={(e) => updateConfig(`hero.slides.${index}.image`, e.target.value)}
                  placeholder="/images/hero-slide.jpg"
                />
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

  const renderFooterTab = () => (
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

  const renderCompanyTab = () => (
    <div className="space-y-6">
      {/* Company Address */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Company Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Street Address</label>
            <Input
              value={config.company?.address?.street || ''}
              onChange={(e) => updateConfig('company.address.street', e.target.value)}
              placeholder="123 Main Street"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">City</label>
            <Input
              value={config.company?.address?.city || ''}
              onChange={(e) => updateConfig('company.address.city', e.target.value)}
              placeholder="New York"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">State</label>
            <Input
              value={config.company?.address?.state || ''}
              onChange={(e) => updateConfig('company.address.state', e.target.value)}
              placeholder="NY"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">ZIP Code</label>
            <Input
              value={config.company?.address?.zip || ''}
              onChange={(e) => updateConfig('company.address.zip', e.target.value)}
              placeholder="10001"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <Input
              value={config.company?.contact?.email || ''}
              onChange={(e) => updateConfig('company.contact.email', e.target.value)}
              placeholder="contact@techcart.com"
              type="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
            <Input
              value={config.company?.contact?.phone || ''}
              onChange={(e) => updateConfig('company.contact.phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              type="tel"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderJsonTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Raw JSON Editor</h3>
          <p className="text-sm text-muted-foreground">Edit the complete site configuration as JSON</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={formatJsonEditor}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Format JSON
          </Button>
        </div>
      </div>

      {jsonError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">JSON Error</span>
          </div>
          <p className="text-sm text-red-700 mt-1">{jsonError}</p>
        </div>
      )}

      <div className="border border-border rounded-lg overflow-hidden">
        <Editor
          height="600px"
          defaultLanguage="json"
          value={jsonEditorValue}
          onChange={handleJsonEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
          }}
          theme="vs-light"
        />
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">JSON Editor Tips:</p>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>Changes are automatically synced with the form-based interface</li>
              <li>Use the "Format JSON" button to properly format your JSON</li>
              <li>Invalid JSON will show an error message above</li>
              <li>All changes must be saved using the "Save Changes" button</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'branding':
        return renderBrandingTab();
      case 'navigation':
        return renderNavigationTab();
      case 'announcement':
        return renderAnnouncementTab();
      case 'homepage':
        return renderHomepageTab();
      case 'hero':
        return renderHeroTab();
      case 'footer':
        return renderFooterTab();
      case 'company':
        return renderCompanyTab();
      case 'json':
        return renderJsonTab();
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading site configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Site Configuration</h2>
          <p className="text-muted-foreground">Manage your site's branding, content, and settings</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowPreview(!showPreview)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button
            onClick={exportConfiguration}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={importConfiguration}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="import-config"
            />
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              asChild
            >
              <label htmlFor="import-config" className="cursor-pointer">
                <Upload className="h-4 w-4" />
                Import
              </label>
            </Button>
          </div>
          <Button
            onClick={createBackup}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            Backup
          </Button>
          <Button
            onClick={handleResetClick}
            variant="outline"
            size="sm"
            disabled={!hasChanges}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button
            onClick={saveConfig}
            disabled={isSaving || !hasChanges}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Validation Status */}
      {validation && (
        <div className={`p-4 rounded-lg border ${validation.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2">
            {validation.isValid ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <span className={`font-medium ${validation.isValid ? 'text-green-800' : 'text-red-800'}`}>
              {validation.isValid ? 'Configuration is valid' : `${validation.errors.length} validation error(s)`}
            </span>
          </div>
          {validation.errors.length > 0 && (
            <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
          {validation.warnings.length > 0 && (
            <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
              {validation.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Changes Indicator */}
      {hasChanges && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">You have unsaved changes</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {renderTabContent()}
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-foreground">Confirm Reset</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to reset all changes? This will discard all unsaved modifications and restore the configuration to its last saved state.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setShowResetConfirm(false)}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={resetConfig}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteConfigPanel;