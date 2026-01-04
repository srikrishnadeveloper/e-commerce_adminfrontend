import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Save, Plus, Trash2, ArrowLeft, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface Value {
  icon: string;
  title: string;
  description: string;
}

interface Stat {
  value: string;
  label: string;
}

interface AboutUsData {
  _id?: string;
  heroTitle: string;
  storyTitle: string;
  storyParagraphs: string[];
  storyImage: string;
  missionTitle: string;
  missionText: string;
  valuesTitle: string;
  values: Value[];
  statsEnabled: boolean;
  stats: Stat[];
  ctaTitle: string;
  ctaText: string;
  ctaButtonText: string;
  ctaButtonLink: string;
}

const defaultData: AboutUsData = {
  heroTitle: 'About Us',
  storyTitle: 'Our Story',
  storyParagraphs: [''],
  storyImage: '',
  missionTitle: 'Our Mission',
  missionText: '',
  valuesTitle: 'Our Values',
  values: [],
  statsEnabled: true,
  stats: [],
  ctaTitle: 'Ready to Start Shopping?',
  ctaText: '',
  ctaButtonText: 'Browse Products',
  ctaButtonLink: '/shop'
};

const iconOptions = [
  { value: 'quality', label: 'Quality (Badge)' },
  { value: 'customer', label: 'Customer (People)' },
  { value: 'innovation', label: 'Innovation (Lightbulb)' }
];

const AboutUsManagement: React.FC = () => {
  const [data, setData] = useState<AboutUsData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAboutUs();
  }, []);

  const fetchAboutUs = async () => {
    try {
      const response = await fetch('/siteconfig-api/aboutus');
      const result = await response.json();
      if (result.success && result.data) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching about us:', error);
      toast.error('Failed to load About Us content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/siteconfig-api/aboutus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result.success) {
        toast.success('About Us content saved successfully!');
        setData(result.data);
      } else {
        toast.error(result.message || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving about us:', error);
      toast.error('Failed to save About Us content');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof AboutUsData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  // Story paragraphs handlers
  const addParagraph = () => {
    setData(prev => ({
      ...prev,
      storyParagraphs: [...prev.storyParagraphs, '']
    }));
  };

  const updateParagraph = (index: number, value: string) => {
    const newParagraphs = [...data.storyParagraphs];
    newParagraphs[index] = value;
    setData(prev => ({ ...prev, storyParagraphs: newParagraphs }));
  };

  const removeParagraph = (index: number) => {
    setData(prev => ({
      ...prev,
      storyParagraphs: prev.storyParagraphs.filter((_, i) => i !== index)
    }));
  };

  // Values handlers
  const addValue = () => {
    setData(prev => ({
      ...prev,
      values: [...prev.values, { icon: 'quality', title: '', description: '' }]
    }));
  };

  const updateValue = (index: number, field: keyof Value, value: string) => {
    const newValues = [...data.values];
    newValues[index] = { ...newValues[index], [field]: value };
    setData(prev => ({ ...prev, values: newValues }));
  };

  const removeValue = (index: number) => {
    setData(prev => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index)
    }));
  };

  // Stats handlers
  const addStat = () => {
    setData(prev => ({
      ...prev,
      stats: [...prev.stats, { value: '', label: '' }]
    }));
  };

  const updateStat = (index: number, field: keyof Stat, value: string) => {
    const newStats = [...data.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setData(prev => ({ ...prev, stats: newStats }));
  };

  const removeStat = (index: number) => {
    setData(prev => ({
      ...prev,
      stats: prev.stats.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">About Us Page</h1>
            <p className="text-gray-500 text-sm">Manage your About Us page content</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => window.open('/about', '_blank')}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Hero Section</h2>
          <div>
            <Label htmlFor="heroTitle">Page Title</Label>
            <Input
              id="heroTitle"
              value={data.heroTitle}
              onChange={(e) => updateField('heroTitle', e.target.value)}
              placeholder="About Us"
            />
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Our Story Section</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="storyTitle">Section Title</Label>
              <Input
                id="storyTitle"
                value={data.storyTitle}
                onChange={(e) => updateField('storyTitle', e.target.value)}
                placeholder="Our Story"
              />
            </div>

            <div>
              <Label htmlFor="storyImage">Story Image URL</Label>
              <Input
                id="storyImage"
                value={data.storyImage}
                onChange={(e) => updateField('storyImage', e.target.value)}
                placeholder="/images/about/story.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to show placeholder</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Story Paragraphs</Label>
                <Button type="button" size="sm" variant="outline" onClick={addParagraph}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Paragraph
                </Button>
              </div>
              <div className="space-y-3">
                {data.storyParagraphs.map((paragraph, index) => (
                  <div key={index} className="flex space-x-2">
                    <Textarea
                      value={paragraph}
                      onChange={(e) => updateParagraph(index, e.target.value)}
                      placeholder={`Paragraph ${index + 1}`}
                      rows={3}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => removeParagraph(index)}
                      disabled={data.storyParagraphs.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Mission Section</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="missionTitle">Section Title</Label>
              <Input
                id="missionTitle"
                value={data.missionTitle}
                onChange={(e) => updateField('missionTitle', e.target.value)}
                placeholder="Our Mission"
              />
            </div>
            <div>
              <Label htmlFor="missionText">Mission Statement</Label>
              <Textarea
                id="missionText"
                value={data.missionText}
                onChange={(e) => updateField('missionText', e.target.value)}
                placeholder="Enter your mission statement..."
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Values Section</h2>
            <Button type="button" size="sm" variant="outline" onClick={addValue}>
              <Plus className="h-4 w-4 mr-1" />
              Add Value
            </Button>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="valuesTitle">Section Title</Label>
              <Input
                id="valuesTitle"
                value={data.valuesTitle}
                onChange={(e) => updateField('valuesTitle', e.target.value)}
                placeholder="Our Values"
              />
            </div>
            
            {data.values.map((value, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium">Value {index + 1}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => removeValue(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>Icon</Label>
                    <select
                      value={value.icon}
                      onChange={(e) => updateValue(index, 'icon', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      {iconOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Title</Label>
                    <Input
                      value={value.title}
                      onChange={(e) => updateValue(index, 'title', e.target.value)}
                      placeholder="Value title"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <Label>Description</Label>
                  <Textarea
                    value={value.description}
                    onChange={(e) => updateValue(index, 'description', e.target.value)}
                    placeholder="Value description"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Stats Section</h2>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={data.statsEnabled}
                  onChange={(e) => updateField('statsEnabled', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Show Stats</span>
              </label>
              <Button type="button" size="sm" variant="outline" onClick={addStat}>
                <Plus className="h-4 w-4 mr-1" />
                Add Stat
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.stats.map((stat, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <Input
                    value={stat.value}
                    onChange={(e) => updateStat(index, 'value', e.target.value)}
                    placeholder="10K+"
                  />
                  <Input
                    value={stat.label}
                    onChange={(e) => updateStat(index, 'label', e.target.value)}
                    placeholder="Happy Customers"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => removeStat(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Call to Action Section</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ctaTitle">CTA Title</Label>
              <Input
                id="ctaTitle"
                value={data.ctaTitle}
                onChange={(e) => updateField('ctaTitle', e.target.value)}
                placeholder="Ready to Start Shopping?"
              />
            </div>
            <div>
              <Label htmlFor="ctaButtonText">Button Text</Label>
              <Input
                id="ctaButtonText"
                value={data.ctaButtonText}
                onChange={(e) => updateField('ctaButtonText', e.target.value)}
                placeholder="Browse Products"
              />
            </div>
            <div>
              <Label htmlFor="ctaButtonLink">Button Link</Label>
              <Input
                id="ctaButtonLink"
                value={data.ctaButtonLink}
                onChange={(e) => updateField('ctaButtonLink', e.target.value)}
                placeholder="/shop"
              />
            </div>
            <div>
              <Label htmlFor="ctaText">CTA Description</Label>
              <Textarea
                id="ctaText"
                value={data.ctaText}
                onChange={(e) => updateField('ctaText', e.target.value)}
                placeholder="Enter CTA description..."
                rows={2}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsManagement;
