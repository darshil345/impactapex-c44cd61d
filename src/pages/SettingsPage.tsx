import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TierProvider } from '@/contexts/TierContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  User, Bell, Shield, Palette, Database, Globe, Mail,
  Moon, Sun, Download, Trash2, Loader2, Key, Smartphone,
  LogOut, Check, X, Plus
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';

interface SettingsSectionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
  variant?: 'default' | 'danger';
}

function SettingsSection({ icon: Icon, title, description, children, variant = 'default' }: SettingsSectionProps) {
  const isDanger = variant === 'danger';
  return (
    <div className={cn("bg-card rounded-2xl border p-6", isDanger && "border-destructive/20")}>
      <div className="flex items-start gap-4 mb-6">
        <div className={cn("p-2.5 rounded-xl", isDanger ? "bg-destructive/10" : "bg-primary/10")}>
          <Icon className={cn("h-5 w-5", isDanger ? "text-destructive" : "text-primary")} />
        </div>
        <div>
          <h3 className={cn("font-semibold text-lg", isDanger && "text-destructive")}>{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SettingsRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-medium text-sm">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function SettingsContent() {
  const { isDark, setTheme } = useTheme();
  const { user, profile, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const { toast } = useToast();
  const { data: products } = useProducts();

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const handleChangeEmail = async () => {
    if (!newEmail) { toast({ title: 'Error', description: 'Please enter a new email address', variant: 'destructive' }); return; }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      toast({ title: 'Verification Email Sent', description: 'Please check both your old and new email to confirm.' });
      setActiveModal(null); setNewEmail('');
    } catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    finally { setIsLoading(false); }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) { toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' }); return; }
    if (newPassword.length < 6) { toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' }); return; }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: 'Password Updated' });
      setActiveModal(null); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    finally { setIsLoading(false); }
  };

  const handleExportData = () => {
    if (products && products.length > 0) {
      const csvContent = [
        ['Name', 'Brand', 'Category', 'Overall Rating', 'Quality', 'Value', 'Innovation', 'Sustainability', 'Popularity', 'Recommended', 'URL'].join(','),
        ...products.map(p => [
          `"${p.name || ''}"`, `"${p.brand || ''}"`, `"${p.category || ''}"`,
          p.overall_rating, p.quality_score, p.value_score, p.innovation_score,
          p.sustainability_score, p.popularity_score, p.is_recommended, `"${p.url}"`
        ].join(','))
      ].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `product-research-${new Date().toISOString().split('T')[0]}.csv`;
      a.click(); URL.revokeObjectURL(url);
      toast({ title: 'Export Complete', description: `Exported ${products.length} products to CSV.` });
    } else {
      toast({ title: 'No Data', description: 'No products to export.', variant: 'destructive' });
    }
  };

  const handleDeleteData = async () => {
    if (confirmText !== 'DELETE') return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from('products').delete().eq('user_id', user?.id);
      if (error) throw error;
      toast({ title: 'Data Deleted', description: 'All product data has been deleted.' });
      setActiveModal(null); setConfirmText('');
    } catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    finally { setIsLoading(false); }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE MY ACCOUNT') return;
    setIsLoading(true);
    try {
      await supabase.from('profiles').delete().eq('id', user?.id);
      await signOut();
      toast({ title: 'Account Deletion Requested', description: 'Your data has been removed.' });
      navigate('/auth');
    } catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    finally { setIsLoading(false); }
  };

  const closeModal = () => {
    setActiveModal(null); setNewEmail(''); setNewPassword(''); setConfirmPassword(''); setConfirmText('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-4xl">
        <div>
          <h1 className="text-2xl font-display font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your account and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Product Management */}
          <SettingsSection icon={Database} title="Products & Data" description="Manage your product research data">
            <SettingsRow label="Total Products" description={`${products?.length || 0} products in your library`}>
              <Button onClick={() => navigate('/add-product')} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </SettingsRow>
            <Separator />
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="gap-2" onClick={handleExportData}>
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </div>
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection icon={Bell} title="Notifications" description="Configure how you receive updates">
            <SettingsRow label="Email Notifications" description="Receive important updates via email">
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </SettingsRow>
            <Separator />
            <SettingsRow label="Weekly Digest" description="Get a summary of your product research">
              <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
            </SettingsRow>
          </SettingsSection>

          {/* Appearance */}
          <SettingsSection icon={Palette} title="Appearance" description="Customize the look and feel">
            <SettingsRow label="Dark Mode" description="Toggle dark theme">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <Switch checked={isDark} onCheckedChange={setTheme} />
                <Moon className="h-4 w-4 text-muted-foreground" />
              </div>
            </SettingsRow>
            <Separator />
            <SettingsRow label="Language" description="Choose your preferred language">
              <Button variant="outline" size="sm" className="gap-2">
                <Globe className="h-4 w-4" />English
              </Button>
            </SettingsRow>
          </SettingsSection>

          {/* Account */}
          <SettingsSection icon={User} title="Account" description="Manage your account settings">
            <SettingsRow label="Email" description={user?.email || 'No email set'}>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setActiveModal('change_email')}>
                <Mail className="h-4 w-4" />Change Email
              </Button>
            </SettingsRow>
            <Separator />
            <SettingsRow label="Password" description="Update your password">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setActiveModal('change_password')}>
                <Key className="h-4 w-4" />Change Password
              </Button>
            </SettingsRow>
          </SettingsSection>

          {/* Security */}
          <SettingsSection icon={Shield} title="Security" description="Keep your account secure">
            <SettingsRow label="Two-Factor Authentication" description="Add an extra layer of security">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => toast({ title: '2FA', description: 'Coming soon!' })}>
                <Smartphone className="h-4 w-4" />Enable 2FA
              </Button>
            </SettingsRow>
            <Separator />
            <SettingsRow label="Active Sessions" description="Sign out from all devices">
              <Button variant="outline" size="sm" className="gap-2" onClick={async () => { await supabase.auth.signOut({ scope: 'global' }); navigate('/auth'); }}>
                <LogOut className="h-4 w-4" />Sign Out All
              </Button>
            </SettingsRow>
          </SettingsSection>

          {/* Danger Zone */}
          <SettingsSection icon={Trash2} title="Danger Zone" description="Irreversible actions" variant="danger">
            <SettingsRow label="Delete All Products" description="Remove all product research data">
              <Button variant="destructive" size="sm" onClick={() => setActiveModal('delete_data')}>Delete Data</Button>
            </SettingsRow>
            <Separator />
            <SettingsRow label="Delete Account" description="Permanently delete your account">
              <Button variant="outline" size="sm" className="text-destructive border-destructive/50 hover:bg-destructive/10"
                onClick={() => setActiveModal('delete_account')}>Delete Account</Button>
            </SettingsRow>
          </SettingsSection>
        </div>
      </div>

      {/* Modals */}
      <Dialog open={activeModal === 'change_email'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent>
          <DialogHeader><DialogTitle>Change Email</DialogTitle><DialogDescription>A verification email will be sent.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Current Email</Label><Input value={user?.email || ''} disabled /></div>
            <div className="space-y-2"><Label>New Email</Label><Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleChangeEmail} disabled={isLoading || !newEmail}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Send Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === 'change_password'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent>
          <DialogHeader><DialogTitle>Change Password</DialogTitle><DialogDescription>Must be at least 6 characters.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>New Password</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
            <div className="space-y-2">
              <Label>Confirm Password</Label><Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              {confirmPassword && newPassword !== confirmPassword && <p className="text-sm text-destructive flex items-center gap-1"><X className="h-3 w-3" /> Passwords do not match</p>}
              {confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && <p className="text-sm text-green-600 flex items-center gap-1"><Check className="h-3 w-3" /> Passwords match</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleChangePassword} disabled={isLoading || !newPassword || newPassword !== confirmPassword || newPassword.length < 6}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === 'delete_data'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-destructive">Delete All Products</DialogTitle><DialogDescription>This action cannot be undone.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">You have <strong>{products?.length || 0}</strong> products. All will be permanently deleted.</p>
            <div className="space-y-2"><Label>Type <span className="font-mono font-bold">DELETE</span> to confirm</Label>
              <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteData} disabled={isLoading || confirmText !== 'DELETE'}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Delete All Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === 'delete_account'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-destructive">Delete Account</DialogTitle><DialogDescription>Permanent and cannot be undone.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Remove all your product data</li><li>Delete your profile and settings</li><li>Sign you out of all devices</li>
            </ul>
            <div className="space-y-2"><Label>Type <span className="font-mono font-bold">DELETE MY ACCOUNT</span> to confirm</Label>
              <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={isLoading || confirmText !== 'DELETE MY ACCOUNT'}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Delete My Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

export default function SettingsPage() {
  return (
    <TierProvider>
      <SettingsContent />
    </TierProvider>
  );
}
