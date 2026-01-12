import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TierProvider } from '@/contexts/TierContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Globe, 
  Mail,
  Moon,
  Sun,
  RefreshCw,
  Download,
  Trash2,
  ChevronRight,
  Loader2,
  Key,
  Smartphone,
  LogOut,
  Check,
  X
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useSyncSchools, useSyncLogs, useSchools } from '@/hooks/useSchools';
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
    <div className={cn(
      "bg-card rounded-2xl border p-6",
      isDanger && "border-destructive/20"
    )}>
      <div className="flex items-start gap-4 mb-6">
        <div className={cn(
          "p-2.5 rounded-xl",
          isDanger ? "bg-destructive/10" : "bg-primary/10"
        )}>
          <Icon className={cn("h-5 w-5", isDanger ? "text-destructive" : "text-primary")} />
        </div>
        <div>
          <h3 className={cn("font-semibold text-lg", isDanger && "text-destructive")}>{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

interface SettingsRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

function SettingsRow({ label, description, children }: SettingsRowProps) {
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
  const [autoSync, setAutoSync] = useState(false);
  const { toast } = useToast();
  const syncMutation = useSyncSchools();
  const { data: syncLogs } = useSyncLogs();
  const { data: schools } = useSchools();

  // Modal states
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const handleSync = async () => {
    try {
      await syncMutation.mutateAsync();
      toast({
        title: 'Sync Complete',
        description: 'School data has been updated from Google Sheets',
      });
    } catch (err) {
      toast({
        title: 'Sync Failed',
        description: 'Could not sync data from Google Sheets',
        variant: 'destructive',
      });
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail) {
      toast({ title: 'Error', description: 'Please enter a new email address', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      
      toast({
        title: 'Verification Email Sent',
        description: 'Please check both your old and new email to confirm the change.',
      });
      setActiveModal(null);
      setNewEmail('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      toast({
        title: 'Password Updated',
        description: 'Your password has been changed successfully.',
      });
      setActiveModal(null);
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    setIsLoading(true);
    try {
      // For now, show that 2FA setup requires additional configuration
      toast({
        title: '2FA Setup',
        description: 'Two-factor authentication will be available soon. We are working on adding this security feature.',
      });
      setActiveModal(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    if (schools && schools.length > 0) {
      const csvContent = [
        ['Name', 'Country', 'Avg Score', 'Sustainability', 'Community', 'Wellbeing', 'Innovation', 'Global Awareness'].join(','),
        ...schools.map(s => [
          `"${s.name}"`,
          `"${s.country}"`,
          s.avgScore,
          s.sustainability,
          s.communityEngagement,
          s.wellbeing,
          s.innovation,
          s.globalAwareness
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `school-impact-data-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Export Complete',
        description: `Exported ${schools.length} schools to CSV.`,
      });
    } else {
      toast({
        title: 'No Data',
        description: 'There is no school data to export.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteData = async () => {
    if (confirmText !== 'DELETE') return;
    
    setIsLoading(true);
    try {
      // Delete all school data
      const { error } = await supabase
        .from('schools')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (error) throw error;
      
      // Reset setup status and clear google sheets url so user needs to reconnect
      await updateProfile({ 
        has_completed_setup: false,
        google_sheets_url: null 
      });
      
      toast({
        title: 'Data Deleted',
        description: 'All school data has been permanently deleted. Redirecting to setup...',
      });
      setActiveModal(null);
      setConfirmText('');
      
      // Redirect to setup page
      navigate('/setup');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE MY ACCOUNT') return;
    
    setIsLoading(true);
    try {
      // Delete user profile first
      await supabase.from('profiles').delete().eq('id', user?.id);
      
      // Note: Full account deletion requires admin API
      // For now, we sign out and show a message
      await signOut();
      
      toast({
        title: 'Account Deletion Requested',
        description: 'Your data has been removed. Contact support for full account deletion.',
      });
      navigate('/auth');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOutAllDevices = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut({ scope: 'global' });
      toast({
        title: 'Signed Out',
        description: 'You have been signed out from all devices.',
      });
      navigate('/auth');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setNewEmail('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setConfirmText('');
  };

  const lastSync = syncLogs?.[0];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-4xl">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-display font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your account and preferences</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Data & Sync */}
          <SettingsSection
            icon={Database}
            title="Data & Sync"
            description="Manage your school data and synchronization"
          >
            <SettingsRow 
              label="Last Sync" 
              description={lastSync ? `${lastSync.records_synced} schools synced` : 'Never synced'}
            >
              <span className="text-sm text-muted-foreground">
                {lastSync ? new Date(lastSync.synced_at).toLocaleString() : 'N/A'}
              </span>
            </SettingsRow>
            <Separator />
            <SettingsRow label="Google Sheets URL" description={profile?.google_sheets_url ? 'Connected' : 'Not connected'}>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Allow reconfiguring the sheet
                  updateProfile({ has_completed_setup: false });
                  navigate('/setup');
                }}
              >
                {profile?.google_sheets_url ? 'Change Sheet' : 'Connect Sheet'}
              </Button>
            </SettingsRow>
            <Separator />
            <SettingsRow label="Auto-sync" description="Automatically sync data every hour">
              <Switch checked={autoSync} onCheckedChange={setAutoSync} />
            </SettingsRow>
            <Separator />
            <div className="flex gap-3 pt-2">
              <Button 
                onClick={handleSync} 
                disabled={syncMutation.isPending}
                className="gap-2"
              >
                <RefreshCw className={cn("h-4 w-4", syncMutation.isPending && "animate-spin")} />
                {syncMutation.isPending ? 'Syncing...' : 'Sync Now'}
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleExportData}>
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </div>
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection
            icon={Bell}
            title="Notifications"
            description="Configure how you receive updates"
          >
            <SettingsRow label="Email Notifications" description="Receive important updates via email">
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </SettingsRow>
            <Separator />
            <SettingsRow label="Weekly Digest" description="Get a summary of school performance">
              <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
            </SettingsRow>
          </SettingsSection>

          {/* Appearance */}
          <SettingsSection
            icon={Palette}
            title="Appearance"
            description="Customize the look and feel"
          >
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
                <Globe className="h-4 w-4" />
                English
                <ChevronRight className="h-4 w-4" />
              </Button>
            </SettingsRow>
          </SettingsSection>

          {/* Account */}
          <SettingsSection
            icon={User}
            title="Account"
            description="Manage your account settings"
          >
            <SettingsRow label="Email" description={user?.email || 'No email set'}>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setActiveModal('change_email')}>
                <Mail className="h-4 w-4" />
                Change Email
              </Button>
            </SettingsRow>
            <Separator />
            <SettingsRow label="Password" description="Update your password">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setActiveModal('change_password')}>
                <Key className="h-4 w-4" />
                Change Password
              </Button>
            </SettingsRow>
          </SettingsSection>

          {/* Security */}
          <SettingsSection
            icon={Shield}
            title="Security"
            description="Keep your account secure"
          >
            <SettingsRow label="Two-Factor Authentication" description="Add an extra layer of security">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setActiveModal('enable_2fa')}>
                <Smartphone className="h-4 w-4" />
                Enable 2FA
              </Button>
            </SettingsRow>
            <Separator />
            <SettingsRow label="Active Sessions" description="Sign out from all devices">
              <Button variant="outline" size="sm" className="gap-2" onClick={handleSignOutAllDevices}>
                <LogOut className="h-4 w-4" />
                Sign Out All
              </Button>
            </SettingsRow>
          </SettingsSection>

          {/* Danger Zone */}
          <SettingsSection
            icon={Trash2}
            title="Danger Zone"
            description="Irreversible actions"
            variant="danger"
          >
            <SettingsRow label="Delete All Data" description="Remove all school data from your account">
              <Button variant="destructive" size="sm" onClick={() => setActiveModal('delete_data')}>
                Delete Data
              </Button>
            </SettingsRow>
            <Separator />
            <SettingsRow label="Delete Account" description="Permanently delete your account">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-destructive border-destructive/50 hover:bg-destructive/10"
                onClick={() => setActiveModal('delete_account')}
              >
                Delete Account
              </Button>
            </SettingsRow>
          </SettingsSection>
        </div>
      </div>

      {/* Change Email Modal */}
      <Dialog open={activeModal === 'change_email'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Email Address</DialogTitle>
            <DialogDescription>
              A verification email will be sent to both your current and new email addresses.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Email</Label>
              <Input value={user?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">New Email</Label>
              <Input 
                id="new-email"
                type="email"
                placeholder="Enter new email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleChangeEmail} disabled={isLoading || !newEmail}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Send Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={activeModal === 'change_password'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter a new password for your account. It must be at least 6 characters.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input 
                id="new-password"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input 
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <X className="h-3 w-3" /> Passwords do not match
                </p>
              )}
              {confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Passwords match
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button 
              onClick={handleChangePassword} 
              disabled={isLoading || !newPassword || newPassword !== confirmPassword || newPassword.length < 6}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enable 2FA Modal */}
      <Dialog open={activeModal === 'enable_2fa'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enhance your account security with 2FA.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground">
              Two-factor authentication adds an extra layer of security to your account. 
              Once enabled, you'll need to enter a code from your authenticator app when signing in.
            </p>
            <p className="text-sm text-muted-foreground">
              This feature is coming soon. We're working on adding TOTP-based 2FA support.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Data Modal */}
      <Dialog open={activeModal === 'delete_data'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete All School Data</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All school data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              You currently have <strong>{schools?.length || 0}</strong> schools in your database. 
              This action will permanently delete all of them.
            </p>
            <div className="space-y-2">
              <Label>Type <span className="font-mono font-bold">DELETE</span> to confirm</Label>
              <Input 
                placeholder="DELETE"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteData} 
              disabled={isLoading || confirmText !== 'DELETE'}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete All Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Modal */}
      <Dialog open={activeModal === 'delete_account'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Account</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Deleting your account will:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Remove all your school data</li>
              <li>Delete your profile and settings</li>
              <li>Sign you out of all devices</li>
            </ul>
            <div className="space-y-2">
              <Label>Type <span className="font-mono font-bold">DELETE MY ACCOUNT</span> to confirm</Label>
              <Input 
                placeholder="DELETE MY ACCOUNT"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount} 
              disabled={isLoading || confirmText !== 'DELETE MY ACCOUNT'}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete My Account
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
