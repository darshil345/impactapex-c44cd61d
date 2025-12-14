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
  ChevronRight,
  Loader2,
  X
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSyncSchools, useSyncLogs, useSchools } from '@/hooks/useSchools';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  isLoading: boolean;
  action?: string;
  confirmText?: string;
  confirmValue?: string;
  onConfirmChange?: (value: string) => void;
  onConfirm?: () => void;
  variant?: 'default' | 'danger';
}

function AIModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  isLoading, 
  confirmText,
  confirmValue,
  onConfirmChange,
  onConfirm,
  variant = 'default'
}: AIModalProps) {
  const isDanger = variant === 'danger';
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={cn(isDanger && "text-destructive")}>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{message}</p>
              {confirmText && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Type "{confirmText}" to confirm:</p>
                  <Input 
                    value={confirmValue} 
                    onChange={(e) => onConfirmChange?.(e.target.value)}
                    placeholder={confirmText}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {onConfirm && (
            <Button 
              variant={isDanger ? "destructive" : "default"}
              onClick={onConfirm}
              disabled={confirmText ? confirmValue !== confirmText : false}
            >
              Confirm
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  const { data: schools } = useSchools();

  // Modal states
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState('');
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [confirmValue, setConfirmValue] = useState('');

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

  const callSettingsAssistant = async (action: string) => {
    setActiveModal(action);
    setIsModalLoading(true);
    setModalMessage('');
    setConfirmValue('');

    try {
      const { data, error } = await supabase.functions.invoke('settings-assistant', {
        body: { 
          action, 
          data: { schoolCount: schools?.length || 0 } 
        }
      });

      if (error) throw error;
      setModalMessage(data.message);
    } catch (err) {
      console.error('Settings assistant error:', err);
      setModalMessage('Unable to process your request. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to connect to the assistant',
        variant: 'destructive',
      });
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleExportData = async () => {
    await callSettingsAssistant('export_data');
  };

  const handleConfirmExport = () => {
    toast({
      title: 'Export Started',
      description: 'Your data export will download shortly.',
    });
    setActiveModal(null);
    // Create a simple CSV export
    if (schools && schools.length > 0) {
      const csvContent = [
        ['Name', 'Country', 'Avg Score', 'Sustainability', 'Community', 'Wellbeing', 'Innovation', 'Global Awareness'].join(','),
        ...schools.map(s => [
          s.name,
          s.country,
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
      a.download = 'school-impact-data.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleDeleteData = async () => {
    await callSettingsAssistant('delete_data');
  };

  const handleConfirmDeleteData = async () => {
    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (error) throw error;
      
      toast({
        title: 'Data Deleted',
        description: 'All school data has been permanently deleted.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete data. Please try again.',
        variant: 'destructive',
      });
    }
    setActiveModal(null);
  };

  const lastSync = syncLogs?.[0];

  const getModalConfig = (action: string | null) => {
    switch (action) {
      case 'export_data':
        return { title: 'Export Data', confirmText: undefined, onConfirm: handleConfirmExport, variant: 'default' as const };
      case 'change_email':
        return { title: 'Change Email', confirmText: undefined, onConfirm: undefined, variant: 'default' as const };
      case 'change_password':
        return { title: 'Change Password', confirmText: undefined, onConfirm: undefined, variant: 'default' as const };
      case 'enable_2fa':
        return { title: 'Enable Two-Factor Authentication', confirmText: undefined, onConfirm: undefined, variant: 'default' as const };
      case 'view_sessions':
        return { title: 'Active Sessions', confirmText: undefined, onConfirm: undefined, variant: 'default' as const };
      case 'delete_data':
        return { title: 'Delete All Data', confirmText: 'DELETE', onConfirm: handleConfirmDeleteData, variant: 'danger' as const };
      case 'delete_account':
        return { title: 'Delete Account', confirmText: undefined, onConfirm: undefined, variant: 'danger' as const };
      default:
        return { title: '', confirmText: undefined, onConfirm: undefined, variant: 'default' as const };
    }
  };

  const modalConfig = getModalConfig(activeModal);

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
              <Button variant="outline" size="sm" className="gap-2" onClick={() => callSettingsAssistant('change_email')}>
                <Mail className="h-4 w-4" />
                Change Email
              </Button>
            </SettingsRow>
            <Separator />
            <SettingsRow label="Password" description="Update your password">
              <Button variant="outline" size="sm" onClick={() => callSettingsAssistant('change_password')}>
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
              <Button variant="outline" size="sm" onClick={() => callSettingsAssistant('enable_2fa')}>
                Enable 2FA
              </Button>
            </SettingsRow>
            <Separator />
            <SettingsRow label="Active Sessions" description="Manage your logged-in devices">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => callSettingsAssistant('view_sessions')}>
                View Sessions
                <ChevronRight className="h-4 w-4" />
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
              <Button variant="destructive" size="sm" onClick={handleDeleteData}>
                Delete Data
              </Button>
            </SettingsRow>
            <Separator />
            <SettingsRow label="Delete Account" description="Permanently delete your account">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-destructive border-destructive/50 hover:bg-destructive/10"
                onClick={() => callSettingsAssistant('delete_account')}
              >
                Delete Account
              </Button>
            </SettingsRow>
          </SettingsSection>
        </div>
      </div>

      {/* AI Modal */}
      <AIModal
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        title={modalConfig.title}
        message={modalMessage}
        isLoading={isModalLoading}
        confirmText={modalConfig.confirmText}
        confirmValue={confirmValue}
        onConfirmChange={setConfirmValue}
        onConfirm={modalConfig.onConfirm}
        variant={modalConfig.variant}
      />
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