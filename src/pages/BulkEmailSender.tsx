import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import toast from 'react-hot-toast';
import { emailAPI } from '../services/emailService';
import type { RecipientGroup, SendResult } from '../services/emailService';
import {
  Mail,
  Send,
  Users,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Settings,
  Plus,
  X
} from 'lucide-react';

const CUSTOM_TEMPLATE_ID = 'custom';

const BulkEmailSender: React.FC = () => {
  // State
  const [recipientGroups, setRecipientGroups] = useState<RecipientGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [subject, setSubject] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [recipientCount, setRecipientCount] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [customEmails, setCustomEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [useCustomEmails, setUseCustomEmails] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadRecipientGroups();
  }, []);

  const loadRecipientGroups = async () => {
    setIsLoading(true);
    try {
      // Load recipient groups
      const groupsData = await emailAPI.getRecipientGroups();
      if (groupsData.status === 'success') {
        setRecipientGroups(groupsData.data);
      }
    } catch (error: any) {
      console.error('Failed to load data:', error);
      if (error.response && error.response.status === 401) {
        toast.error('Session expired. Please log out and log in again.');
      } else {
        toast.error('Failed to load email configuration');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!content) {
      toast.error('Please enter email content');
      return;
    }

    try {
      const data = await emailAPI.previewEmail({
        templateId: CUSTOM_TEMPLATE_ID,
        title,
        subject,
        content
      });

      console.log('Preview response:', data);

      if (data.status === 'success' && data.data?.html) {
        setPreviewHtml(data.data.html);
        setShowPreview(true);
      } else {
        console.error('Preview failed:', data);
        toast.error('Failed to generate preview');
      }
    } catch (error) {
      console.error('Preview error:', error);
      toast.error(`Failed to generate preview: ${error.message || 'Unknown error'}`);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    if (!content) {
      toast.error('Please enter email content');
      return;
    }

    setIsTesting(true);
    try {
      const data = await emailAPI.sendBulkEmail({
        templateId: CUSTOM_TEMPLATE_ID,
        customEmails: [testEmail],
        subject,
        title,
        content
      });

      if (data.status === 'success' && data.data.sent > 0) {
        toast.success('Test email sent successfully!');
      } else {
        toast.error(data.data?.errors?.[0]?.error || 'Failed to send test email');
      }
    } catch (error) {
      toast.error('Failed to send test email');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSend = async () => {
    if (!content) {
      toast.error('Please enter email content');
      return;
    }

    if (useCustomEmails && customEmails.length === 0) {
      toast.error('Please add at least one recipient email');
      return;
    }

    const count = useCustomEmails 
      ? customEmails.length 
      : recipientGroups.find(g => g.id === selectedGroup)?.count || 0;

    setRecipientCount(count);
    setShowConfirmModal(true);
  };

  const handleConfirmSend = async () => {
    setShowConfirmModal(false);
    setIsSending(true);
    setSendResult(null);

    try {
      const data = await emailAPI.sendBulkEmail({
        templateId: CUSTOM_TEMPLATE_ID,
        recipientGroup: useCustomEmails ? undefined : selectedGroup,
        customEmails: useCustomEmails ? customEmails : undefined,
        subject,
        title,
        content
      });

      if (data.status === 'success') {
        setSendResult(data.data);
        if (data.data.sent > 0) {
          toast.success(`Successfully sent ${data.data.sent} of ${data.data.total} emails!`);
        }
        if (data.data.failed > 0) {
          toast.error(`${data.data.failed} emails failed to send`);
        }
      } else {
        toast.error(data.message || 'Failed to send emails');
      }
    } catch (error) {
      toast.error('Failed to send emails');
    } finally {
      setIsSending(false);
    }
  };

  const addCustomEmail = () => {
    if (!newEmail) return;
    
    // Split by comma, semicolon, space, newline to support bulk paste
    const rawEmails = newEmail.split(/[,;\s\n]+/).map(e => e.trim()).filter(e => e.length > 0);
    
    if (rawEmails.length === 0) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validNewEmails: string[] = [];
    let invalidCount = 0;
    let duplicateCount = 0;

    rawEmails.forEach(email => {
      if (!emailRegex.test(email)) {
        invalidCount++;
        return;
      }

      if (customEmails.includes(email) || validNewEmails.includes(email)) {
        duplicateCount++;
        return;
      }

      validNewEmails.push(email);
    });

    if (validNewEmails.length > 0) {
      setCustomEmails(prev => [...prev, ...validNewEmails]);
      setNewEmail('');
      toast.success(`Added ${validNewEmails.length} email(s)`);
      
      if (invalidCount > 0) {
        toast.error(`Skipped ${invalidCount} invalid email(s)`);
      }
    } else {
      if (invalidCount > 0) {
        toast.error('Please enter valid email address(es)');
      } else if (duplicateCount > 0) {
        toast.error('Email(s) already added');
      }
    }
  };

  const removeCustomEmail = (email: string) => {
    setCustomEmails(customEmails.filter(e => e !== email));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Bulk Email Sender
          </h2>
          <p className="text-muted-foreground mt-1">
            Send promotional emails, newsletters, and announcements to your customers
          </p>
        </div>
        <Button variant="outline" onClick={loadRecipientGroups} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Composer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Email Content */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-foreground mb-4">Email Content</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter email title"
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter subject"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="content">Content (HTML supported)</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="<p>Write your email content here...</p>"
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tip: Use {'{{name}}'} to personalize with recipient's name
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>

          {/* Send Test */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Test Email
            </h3>
            <div className="flex gap-3">
              <Input
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="flex-1"
              />
              <Button 
                onClick={handleSendTest} 
                disabled={isTesting || !testEmail || !content}
              >
                {isTesting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Test
              </Button>
            </div>
          </div>
        </div>

        {/* Recipients & Actions */}
        <div className="space-y-6">
          {/* Recipients */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recipients
            </h3>

            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="useCustom"
                checked={useCustomEmails}
                onCheckedChange={(checked) => setUseCustomEmails(!!checked)}
              />
              <Label htmlFor="useCustom" className="text-sm">
                Use custom email list
              </Label>
            </div>

            {useCustomEmails ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="email@example.com or paste comma-separated list"
                    onKeyDown={(e) => e.key === 'Enter' && addCustomEmail()}
                  />
                  <Button size="sm" onClick={addCustomEmail}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {customEmails.length > 0 && (
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {customEmails.map((email) => (
                      <div
                        key={email}
                        className="flex items-center justify-between bg-muted px-3 py-1.5 rounded text-sm"
                      >
                        <span className="truncate">{email}</span>
                        <button
                          onClick={() => removeCustomEmail(email)}
                          className="text-muted-foreground hover:text-destructive ml-2"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-sm text-muted-foreground">
                  {customEmails.length} recipient(s) added
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recipientGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedGroup(group.id)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      selectedGroup === group.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{group.name}</span>
                      <span className="text-sm text-muted-foreground">{group.count}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{group.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={isSending || !content}
            className="w-full"
            size="lg"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Email Campaign
              </>
            )}
          </Button>

          {/* Send Result */}
          {sendResult && (
            <div className={`rounded-lg p-4 ${
              sendResult.failed > 0 ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-green-500/10 border border-green-500/20'
            }`}>
              <h4 className="font-medium flex items-center gap-2 mb-2">
                {sendResult.failed === 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
                Send Result
              </h4>
              <div className="space-y-1 text-sm">
                <p>Total: {sendResult.total}</p>
                <p className="text-green-600">Sent: {sendResult.sent}</p>
                {sendResult.failed > 0 && (
                  <p className="text-red-600">Failed: {sendResult.failed}</p>
                )}
              </div>
              {sendResult.errors && sendResult.errors.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs font-medium mb-1">Errors:</p>
                  <div className="max-h-20 overflow-y-auto text-xs text-muted-foreground">
                    {sendResult.errors.map((err, idx) => (
                      <p key={idx}>{err.email}: {err.error}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Email Preview</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-60px)] bg-gray-100">
              <div 
                className="bg-white rounded border shadow-sm email-preview-container"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
              <style>{`
                .email-preview-container {
                  background-color: #ffffff !important;
                  color: #333333;
                  color-scheme: light;
                  padding: 20px;
                }
                .email-preview-container *:not([style*="color"]) {
                  color: inherit;
                }
                .email-preview-container h1:not([style*="color"]),
                .email-preview-container h2:not([style*="color"]),
                .email-preview-container h3:not([style*="color"]),
                .email-preview-container h4:not([style*="color"]) {
                  color: #1a1a1a;
                }
                .email-preview-container p:not([style*="color"]),
                .email-preview-container span:not([style*="color"]),
                .email-preview-container div:not([style*="color"]),
                .email-preview-container li:not([style*="color"]) {
                  color: #333333;
                }
                .email-preview-container a:not([style*="color"]) {
                  color: #2563eb;
                }
              `}</style>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Email Send</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to send this email to {recipientCount} recipients?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSend}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Send Email
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkEmailSender;
