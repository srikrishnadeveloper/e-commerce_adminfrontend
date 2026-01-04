import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import toast from 'react-hot-toast';
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
  Code
} from 'lucide-react';
import ImageSelectorModal from './modals/ImageSelectorModal';
import ProductSelectorModal from './ProductSelectorModal';

// Import extracted tab components
import BrandingTab from './siteconfig/BrandingTab';
import NavigationTab from './siteconfig/NavigationTab';
import AnnouncementTab from './siteconfig/AnnouncementTab';
import HomepageTab from './siteconfig/HomepageTab';
import HeroTab from './siteconfig/HeroTab';
import FooterTab from './siteconfig/FooterTab';
import ContactUsTab from './siteconfig/ContactUsTab';
import AboutUsTab from './siteconfig/AboutUsTab';

import JsonTab from './siteconfig/JsonTab';

interface SiteConfig {
  [key: string]: any;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

const SiteConfigPanel: React.FC = () => {
  const [config, setConfig] = useState<SiteConfig>({});
  const [activeTab, setActiveTab] = useState('branding');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true, errors: [] });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState('');
  const [productSelectorOpen, setProductSelectorOpen] = useState(false);
  const [jsonEditorValue, setJsonEditorValue] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const tabs = [
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'navigation', label: 'Navigation', icon: Navigation },
    { id: 'announcement', label: 'Announcement', icon: MessageSquare },
    { id: 'homepage', label: 'Homepage', icon: Home },
    { id: 'hero', label: 'Hero Section', icon: Image },
    { id: 'footer', label: 'Footer', icon: Building },
    { id: 'contactus', label: 'Contact Us', icon: MessageSquare },
    { id: 'aboutus', label: 'About Us', icon: Building },

    { id: 'json', label: 'Raw JSON', icon: Code }
  ];

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    setJsonEditorValue(JSON.stringify(config, null, 2));
  }, [config]);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/siteconfig-api/siteconfig');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setConfig(result.data);
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
        } else {
          console.error('Invalid response format:', result);
          toast.error('Invalid configuration data received');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to load config:', response.status, errorData);
        toast.error(`Failed to load site configuration: ${response.status}`);
      }
    } catch (error) {
      console.error('Error loading config:', error);
      toast.error('Error loading site configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/siteconfig-api/siteconfig/all', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: config,
          version: 1
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success('Site configuration saved successfully!');
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
          
          // Update favicon if it changed
          if (config.branding?.faviconUrl) {
            updateFavicon(config.branding.faviconUrl);
          }
        } else {
          console.error('Save failed:', result);
          toast.error('Failed to save site configuration');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Save request failed:', response.status, errorData);
        toast.error(`Failed to save site configuration: ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Error saving site configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const updateFavicon = (faviconUrl: string) => {
    // Get or create favicon link element
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    
    // Update favicon href
    const fullUrl = faviconUrl.startsWith('http') 
      ? faviconUrl 
      : `http://localhost:5001${faviconUrl}`;
    link.href = fullUrl;
    
    // Also update the type based on extension
    if (faviconUrl.endsWith('.svg')) {
      link.type = 'image/svg+xml';
    } else if (faviconUrl.endsWith('.png')) {
      link.type = 'image/png';
    } else if (faviconUrl.endsWith('.ico')) {
      link.type = 'image/x-icon';
    }
  };

  const updateConfig = (path: string, value: any) => {
    setConfig(prev => {
      // Deep clone to avoid mutation issues with React StrictMode
      const newConfig = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let current = newConfig;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      setHasUnsavedChanges(true);
      return newConfig;
    });
  };

  const addArrayItem = (path: string, item: any) => {
    setConfig(prev => {
      // Deep clone to avoid mutation issues with React StrictMode
      const newConfig = JSON.parse(JSON.stringify(prev));
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
      setHasUnsavedChanges(true);
      return newConfig;
    });
  };

  const removeArrayItem = (path: string, index: number) => {
    setConfig(prev => {
      // Deep clone to avoid mutation issues with React StrictMode
      const newConfig = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let current = newConfig;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      if (current[keys[keys.length - 1]] && Array.isArray(current[keys[keys.length - 1]])) {
        current[keys[keys.length - 1]].splice(index, 1);
      }

      setHasUnsavedChanges(true);
      return newConfig;
    });
  };

  const handleJsonEditorChange = (value: string | undefined) => {
    if (value === undefined) return;

    setJsonEditorValue(value);

    try {
      const parsedConfig = JSON.parse(value);
      setConfig(parsedConfig);
      setJsonError(null);
      setHasUnsavedChanges(true);
    } catch (error) {
      setJsonError((error as Error).message);
    }
  };

  const formatJsonEditor = () => {
    try {
      const formatted = JSON.stringify(JSON.parse(jsonEditorValue), null, 2);
      setJsonEditorValue(formatted);
      setJsonError(null);
    } catch (error) {
      setJsonError((error as Error).message);
    }
  };

  const exportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `site-config-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target?.result as string);
        setConfig(importedConfig);
        setHasUnsavedChanges(true);
        toast.success('Configuration imported successfully!');
      } catch (error) {
        toast.error('Invalid JSON file');
      }
    };
    reader.readAsText(file);

    // Reset the input
    event.target.value = '';
  };

  const handleImageSelect = (imageUrl: string) => {
    if (pickerTarget) {
      updateConfig(pickerTarget, imageUrl);
      setPickerTarget('');
      setPickerOpen(false);
    }
  };

  const handleProductSelect = (productIds: string[]) => {
    updateConfig('homepage.hotDealsSection.productIds', productIds);
    setProductSelectorOpen(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'branding':
        return (
          <BrandingTab
            config={config}
            updateConfig={updateConfig}
            setPickerTarget={setPickerTarget}
            setPickerOpen={setPickerOpen}
          />
        );
      case 'navigation':
        return (
          <NavigationTab
            config={config}
            updateConfig={updateConfig}
            addArrayItem={addArrayItem}
            removeArrayItem={removeArrayItem}
          />
        );
      case 'announcement':
        return (
          <AnnouncementTab
            config={config}
            updateConfig={updateConfig}
            addArrayItem={addArrayItem}
            removeArrayItem={removeArrayItem}
          />
        );
      case 'homepage':
        return (
          <HomepageTab
            config={config}
            updateConfig={updateConfig}
            addArrayItem={addArrayItem}
            removeArrayItem={removeArrayItem}
            setProductSelectorOpen={setProductSelectorOpen}
            setPickerTarget={setPickerTarget}
            setPickerOpen={setPickerOpen}
          />
        );
      case 'hero':
        return (
          <HeroTab
            config={config}
            updateConfig={updateConfig}
            addArrayItem={addArrayItem}
            removeArrayItem={removeArrayItem}
            setPickerTarget={setPickerTarget}
            setPickerOpen={setPickerOpen}
          />
        );
      case 'footer':
        return (
          <FooterTab
            config={config}
            updateConfig={updateConfig}
            addArrayItem={addArrayItem}
            removeArrayItem={removeArrayItem}
          />
        );
      case 'contactus':
        return (
          <ContactUsTab
            config={config}
            updateConfig={updateConfig}
            addArrayItem={addArrayItem}
            removeArrayItem={removeArrayItem}
          />
        );
      case 'aboutus':
        return <AboutUsTab />;

      case 'json':
        return (
          <JsonTab
            jsonEditorValue={jsonEditorValue}
            jsonError={jsonError}
            handleJsonEditorChange={handleJsonEditorChange}
            formatJsonEditor={formatJsonEditor}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading site configuration...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Site Configuration</h1>
          <p className="text-muted-foreground">Manage your website's appearance and content</p>
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <AlertCircle className="h-4 w-4" />
              Unsaved changes
            </div>
          )}
          <div className="flex gap-2">
            <Button
              onClick={loadConfig}
              variant="outline"
              size="sm"
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              onClick={exportConfig}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                asChild
              >
                <span>
                  <Upload className="h-4 w-4" />
                  Import
                </span>
              </Button>
            </label>
            <Button
              onClick={saveConfig}
              disabled={isSaving || !hasUnsavedChanges}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {!validationResult.isValid && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="font-medium text-red-800">Configuration Errors</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
            {validationResult.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-card rounded-lg border border-border p-6">
        {renderTabContent()}
      </div>

      {/* Modals */}
      <ImageSelectorModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleImageSelect}
      />

      <ProductSelectorModal
        isOpen={productSelectorOpen}
        onClose={() => setProductSelectorOpen(false)}
        onProductsSelected={handleProductSelect}
        selectedProductIds={config.homepage?.hotDealsSection?.productIds || []}
      />
    </div>
  );
};

export default SiteConfigPanel;