import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Plus, Trash2, Phone, Mail, MapPin, Clock, Globe } from 'lucide-react';

interface ContactUsTabProps {
  config: any;
  updateConfig: (path: string, value: any) => void;
  addArrayItem: (path: string, item: any) => void;
  removeArrayItem: (path: string, index: number) => void;
}

const ContactUsTab: React.FC<ContactUsTabProps> = ({
  config,
  updateConfig,
  addArrayItem,
  removeArrayItem
}) => {
  const contactUs = config.contactUs || {};

  const handleContactInfoChange = (field: string, value: string) => {
    updateConfig(`contactUs.${field}`, value);
  };

  const handleSocialMediaChange = (index: number, field: string, value: string) => {
    const socialMedia = [...(contactUs.socialMedia || [])];
    socialMedia[index] = { ...socialMedia[index], [field]: value };
    updateConfig('contactUs.socialMedia', socialMedia);
  };

  const addSocialMedia = () => {
    addArrayItem('contactUs.socialMedia', {
      platform: '',
      url: '',
      icon: ''
    });
  };

  const removeSocialMedia = (index: number) => {
    removeArrayItem('contactUs.socialMedia', index);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Contact Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Store Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Store Name</label>
            <Input
              value={contactUs.storeName || ''}
              onChange={(e) => handleContactInfoChange('storeName', e.target.value)}
              placeholder="Your Store Name"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </label>
            <Input
              value={contactUs.phone || ''}
              onChange={(e) => handleContactInfoChange('phone', e.target.value)}
              placeholder="(123) 456-7890"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </label>
            <Input
              type="email"
              value={contactUs.email || ''}
              onChange={(e) => handleContactInfoChange('email', e.target.value)}
              placeholder="contact@yourstore.com"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Website
            </label>
            <Input
              value={contactUs.website || ''}
              onChange={(e) => handleContactInfoChange('website', e.target.value)}
              placeholder="https://yourstore.com"
            />
          </div>
        </div>

        {/* Address */}
        <div className="mt-6">
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Store Address
          </label>
          <Textarea
            value={contactUs.address || ''}
            onChange={(e) => handleContactInfoChange('address', e.target.value)}
            placeholder="123 Main Street, City, State, ZIP Code, Country"
            rows={3}
          />
        </div>
      </div>

      {/* Business Hours */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Business Hours
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Business Hours Title</label>
            <Input
              value={contactUs.businessHoursTitle || ''}
              onChange={(e) => handleContactInfoChange('businessHoursTitle', e.target.value)}
              placeholder="Open Time"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Business Hours</label>
            <Textarea
              value={contactUs.businessHours || ''}
              onChange={(e) => handleContactInfoChange('businessHours', e.target.value)}
              placeholder="Our store has re-opened for shopping, exchange Every day 11am to 7pm"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Contact Form Settings */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Contact Form Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Form Title</label>
            <Input
              value={contactUs.formTitle || ''}
              onChange={(e) => handleContactInfoChange('formTitle', e.target.value)}
              placeholder="Get in Touch"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Form Description</label>
            <Textarea
              value={contactUs.formDescription || ''}
              onChange={(e) => handleContactInfoChange('formDescription', e.target.value)}
              placeholder="If you've got great products your making or looking to work with us then drop us a line."
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Social Media Links */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Social Media Links</h3>
          <Button onClick={addSocialMedia} size="sm" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Social Media
          </Button>
        </div>

        <div className="space-y-4">
          {(contactUs.socialMedia || []).map((social: any, index: number) => (
            <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  value={social.platform || ''}
                  onChange={(e) => handleSocialMediaChange(index, 'platform', e.target.value)}
                  placeholder="Platform (e.g., Facebook, Twitter)"
                />
                <Input
                  value={social.url || ''}
                  onChange={(e) => handleSocialMediaChange(index, 'url', e.target.value)}
                  placeholder="https://..."
                />
                <Input
                  value={social.icon || ''}
                  onChange={(e) => handleSocialMediaChange(index, 'icon', e.target.value)}
                  placeholder="Icon class or SVG"
                />
              </div>
              <Button
                onClick={() => removeSocialMedia(index)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          
          {(!contactUs.socialMedia || contactUs.socialMedia.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              No social media links added yet. Click "Add Social Media" to get started.
            </div>
          )}
        </div>
      </div>

      {/* Page Settings */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Page Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Page Title</label>
            <Input
              value={contactUs.pageTitle || ''}
              onChange={(e) => handleContactInfoChange('pageTitle', e.target.value)}
              placeholder="Contact Us"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Section Title</label>
            <Input
              value={contactUs.sectionTitle || ''}
              onChange={(e) => handleContactInfoChange('sectionTitle', e.target.value)}
              placeholder="Visit Our Store"
            />
          </div>
        </div>
      </div>

      {/* Map/Location Settings */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Map & Location Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Google Maps Embed URL</label>
            <Textarea
              value={contactUs.mapEmbedUrl || ''}
              onChange={(e) => handleContactInfoChange('mapEmbedUrl', e.target.value)}
              placeholder="https://www.google.com/maps/embed?pb=..."
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Location Description</label>
            <Textarea
              value={contactUs.locationDescription || ''}
              onChange={(e) => handleContactInfoChange('locationDescription', e.target.value)}
              placeholder="Additional location details or directions"
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsTab;
