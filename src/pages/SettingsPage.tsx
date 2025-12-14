import { useState } from 'react';
import { TierProvider } from '@/contexts/TierContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
  ChevronRight
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useSyncSchools, useSyncLogs } from '@/hooks/useSchools';
import { useToast } from '@/hooks/use-toast';

interface SettingsSectionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingsSection({ icon: Icon, title, description, children }: SettingsSectionProps) {
  return (
    <div className="bg-card rounded-2xl border p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
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
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [autoSync, setAutoSync] = useState(false);
  const { toast } = useToast();
  const syncMutation = useSyncSchools();
  const { data: syncLogs } = useSyncLogs();

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
              <Button variant="outline" className="gap-2">
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
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
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
            <SettingsRow label="Email" description="Your account email address">
              <Button variant="outline" size="sm" className="gap-2">
                <Mail className="h-4 w-4" />
                Change Email
              </Button>
            </SettingsRow>
            <Separator />
            <SettingsRow label="Password" description="Update your password">
              <Button variant="outline" size="sm">
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
              <Button variant="outline" size="sm">
                Enable 2FA
              </Button>
            </SettingsRow>
            <Separator />
            <SettingsRow label="Active Sessions" description="Manage your logged-in devices">
              <Button variant="outline" size="sm" className="gap-2">
                View Sessions
                <ChevronRight className="h-4 w-4" />
              </Button>
            </SettingsRow>
          </SettingsSection>

          {/* Danger Zone */}
          <div className="bg-card rounded-2xl border border-destructive/20 p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-2.5 rounded-xl bg-destructive/10">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-destructive">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">Irreversible actions</p>
              </div>
            </div>
            <div className="space-y-4">
              <SettingsRow label="Delete All Data" description="Remove all school data from your account">
                <Button variant="destructive" size="sm">
                  Delete Data
                </Button>
              </SettingsRow>
              <Separator />
              <SettingsRow label="Delete Account" description="Permanently delete your account">
                <Button variant="outline" size="sm" className="text-destructive border-destructive/50 hover:bg-destructive/10">
                  Delete Account
                </Button>
              </SettingsRow>
            </div>
          </div>
        </div>
      </div>
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