import { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import SectionContainer from '../components/ui/SectionContainer';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import { api, getAssetUrl } from '../services/api';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [initialSettings, setInitialSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isEmailExpanded, setIsEmailExpanded] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState(null);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings && initialSettings) {
      // Basic deep comparison (for this flat structure it's fine to stringify)
      const current = JSON.stringify(settings);
      const initial = JSON.stringify(initialSettings);
      setIsDirty(current !== initial);
    }
  }, [settings, initialSettings]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/settings');
      setSettings(data);
      setInitialSettings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    if (success) setSuccess(false);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      const data = await api.put('/settings', settings);
      
      setSettings(data.settings);
      setInitialSettings(data.settings);
      setSuccess(true);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    try {
      setUploadingLogo(true);
      // Fetch with FormData can't use our simple api helper directly if it stringifies, 
      // but api.js handles headers. However for FormData, Content-Type must be omitted to let browser set boundary.
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/settings/upload-logo`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) throw new Error('Failed to upload logo');
      
      const data = await res.json();
      handleChange('logo_url', data.logo_url);
    } catch (err) {
      alert('Logo upload failed: ' + err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      setIsTestingEmail(true);
      setTestEmailStatus(null);
      await api.post('/settings/test-email', {});
      setTestEmailStatus({ type: 'success', message: 'Test email sent successfully!' });
      setTimeout(() => setTestEmailStatus(null), 5000);
    } catch (err) {
      setTestEmailStatus({ type: 'error', message: err.message });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    try {
      setIsChangingPassword(true);
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setPasswordSuccess('Password updated successfully.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Business Settings" subtitle="Manage company information and invoice defaults." />
        <SectionContainer>
          <LoadingSkeleton rows={8} columns={2} />
        </SectionContainer>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="space-y-6">
        <PageHeader title="Business Settings" subtitle="Manage company information and invoice defaults." />
        <SectionContainer>
          <EmptyState icon={AlertCircle} title="Error loading settings" description={error} />
        </SectionContainer>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="Business Settings" 
          subtitle="Manage company information and invoice defaults."
        />
        <div className="flex items-center gap-4 hidden sm:flex">
          {success && (
            <span className="text-success flex items-center gap-1 text-sm font-medium animate-pulse">
              <CheckCircle size={16} />
              Settings updated successfully
            </span>
          )}
          {isDirty && !success && (
            <span className="text-warning flex items-center gap-1 text-sm font-medium text-yellow-500">
              <AlertCircle size={16} />
              Unsaved Changes
            </span>
          )}
          <Button variant="primary" onClick={handleSave} disabled={isSaving || !isDirty}>
            <Save size={16} className="mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-danger/10 text-danger p-4 rounded-lg border border-danger/20 flex items-center">
          <AlertCircle size={18} className="mr-2" />
          <span>{error}</span>
        </div>
      )}

      <SectionContainer className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLUMN 1 */}
        <div className="space-y-8">
          
          {/* Company Information */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-medium text-white">Company Information</h2>
            </CardHeader>
            <CardContent className="space-y-5">
              <Input 
                label="Company Name" 
                value={settings?.company_name || ''} 
                onChange={(e) => handleChange('company_name', e.target.value)} 
              />
              <Input 
                label="Company Address" 
                value={settings?.company_address || ''} 
                onChange={(e) => handleChange('company_address', e.target.value)} 
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input 
                  label="Company Phone" 
                  value={settings?.company_phone || ''} 
                  onChange={(e) => handleChange('company_phone', e.target.value)} 
                />
                <Input 
                  label="Company Email" 
                  type="email"
                  value={settings?.company_email || ''} 
                  onChange={(e) => handleChange('company_email', e.target.value)} 
                />
              </div>
              <Input 
                label="Company Website (Optional)" 
                value={settings?.company_website || ''} 
                onChange={(e) => handleChange('company_website', e.target.value)} 
              />
            </CardContent>
          </Card>

          {/* Invoice Defaults */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-medium text-white">Invoice Defaults</h2>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input 
                  label="Default Currency" 
                  value={settings?.currency || ''} 
                  onChange={(e) => handleChange('currency', e.target.value)} 
                  placeholder="CAD, USD, EUR..."
                />
                <Input 
                  label="Default Tax %" 
                  type="number"
                  step="0.01"
                  value={settings?.default_tax || 0} 
                  onChange={(e) => handleChange('default_tax', e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">Default Notes</label>
                <textarea 
                  className="w-full bg-secondary/50 border border-border rounded-[var(--radius-input)] p-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none h-24"
                  value={settings?.default_notes || ''}
                  onChange={(e) => handleChange('default_notes', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">Default Terms</label>
                <textarea 
                  className="w-full bg-secondary/50 border border-border rounded-[var(--radius-input)] p-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none h-24"
                  value={settings?.default_payment_terms || ''}
                  onChange={(e) => handleChange('default_payment_terms', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

        </div>

        {/* COLUMN 2 */}
        <div className="space-y-8">
          
          {/* Branding */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-medium text-white">Branding</h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-text-secondary">Company Logo</label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-32 bg-secondary/50 border border-border rounded flex items-center justify-center overflow-hidden">
                    {settings?.logo_url ? (
                      <img src={getAssetUrl(settings.logo_url)} alt="Logo" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-text-secondary text-xs">No Logo</span>
                    )}
                  </div>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoUpload} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploadingLogo}
                    />
                    <Button variant="secondary" className="pointer-events-none">
                      <Upload size={16} className="mr-2" />
                      {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input 
                  label="Primary Color" 
                  type="color"
                  value={settings?.primary_color || '#8B3DFF'} 
                  onChange={(e) => handleChange('primary_color', e.target.value)} 
                />
                <Input 
                  label="Secondary Color" 
                  type="color"
                  value={settings?.secondary_color || '#0B0416'} 
                  onChange={(e) => handleChange('secondary_color', e.target.value)} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice Numbering */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-medium text-white">Invoice Numbering</h2>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input 
                  label="Invoice Prefix" 
                  value={settings?.invoice_prefix || ''} 
                  onChange={(e) => handleChange('invoice_prefix', e.target.value)} 
                  placeholder="OD-"
                />
                <Input 
                  label="Starting Number" 
                  type="number"
                  value={settings?.starting_number || 1} 
                  onChange={(e) => handleChange('starting_number', parseInt(e.target.value, 10))} 
                />
              </div>
              <p className="text-sm text-text-secondary bg-secondary/30 p-3 rounded-lg border border-border/50">
                Next invoice will be generated as: <span className="text-white font-mono bg-card px-2 py-0.5 rounded ml-1">{settings?.invoice_prefix || ''}{String(settings?.starting_number || 1).padStart(4, '0')}</span>
              </p>
            </CardContent>
          </Card>

          {/* Email Configuration (Accordion) */}
          <Card>
            <div 
              className="p-6 border-b border-border/50 flex justify-between items-center cursor-pointer hover:bg-secondary/20 transition-colors"
              onClick={() => setIsEmailExpanded(!isEmailExpanded)}
            >
              <h2 className="text-xl font-medium text-white">Email Configuration</h2>
              <div className="text-text-secondary">
                {isEmailExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>
            
            {isEmailExpanded && (
              <CardContent className="space-y-5 bg-card/50 pt-5">
                <div className="bg-primary/10 text-primary p-4 rounded-lg border border-primary/20 text-sm">
                  Email SMTP configuration is now securely managed via environment variables (<code>server/.env</code>). Frontend access has been disabled for security purposes.
                </div>
                
                <div className="pt-4 mt-4 border-t border-border/50 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-white">Test Configuration</p>
                      <p className="text-xs text-text-secondary">Send a test email to verify settings before saving.</p>
                    </div>
                    <Button 
                      variant="secondary" 
                      onClick={handleTestEmail} 
                      disabled={isTestingEmail}
                    >
                      {isTestingEmail ? 'Sending...' : 'Send Test Email'}
                    </Button>
                  </div>
                  {testEmailStatus && (
                    <div className={`text-sm p-3 rounded-lg border flex items-center ${testEmailStatus.type === 'error' ? 'bg-danger/10 text-danger border-danger/20' : 'bg-success/10 text-success border-success/20'}`}>
                      {testEmailStatus.type === 'error' ? <AlertCircle size={16} className="mr-2" /> : <CheckCircle size={16} className="mr-2" />}
                      <span>{testEmailStatus.message}</span>
                    </div>
                  )}
                </div>

              </CardContent>
            )}
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-medium text-white">Security</h2>
              <p className="text-sm text-text-secondary">Manage administrator password.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-5">
                {passwordError && (
                  <div className="bg-danger/10 text-danger p-3 rounded-lg border border-danger/20 flex items-center text-sm">
                    <AlertCircle size={16} className="mr-2 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}
                {passwordSuccess && (
                  <div className="bg-success/10 text-success p-3 rounded-lg border border-success/20 flex items-center text-sm">
                    <CheckCircle size={16} className="mr-2 shrink-0" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                <Input 
                  label="Email (Read-only)" 
                  value="info@oceandevelopersltd.com" 
                  readOnly 
                  className="opacity-60 cursor-not-allowed"
                />
                <Input 
                  label="Current Password" 
                  type="password"
                  value={passwordData.currentPassword} 
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))} 
                />
                <Input 
                  label="New Password" 
                  type="password"
                  value={passwordData.newPassword} 
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))} 
                />
                <Input 
                  label="Confirm Password" 
                  type="password"
                  value={passwordData.confirmPassword} 
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))} 
                />

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full justify-center shadow-soft-purple"
                  disabled={isChangingPassword}
                >
                  <Save size={16} className="mr-2" />
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>

        </div>
      </SectionContainer>

      {/* Mobile Sticky Footer Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border sm:hidden flex justify-between items-center z-10">
        <div>
          {success && <span className="text-success text-xs font-medium">Updated successfully</span>}
          {isDirty && !success && <span className="text-yellow-500 text-xs font-medium">Unsaved changes</span>}
        </div>
        <Button variant="primary" onClick={handleSave} disabled={isSaving || !isDirty} className="shadow-soft-purple">
          <Save size={16} className="mr-2" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>

    </div>
  );
}
