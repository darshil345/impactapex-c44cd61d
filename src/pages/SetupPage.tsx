import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FileSpreadsheet, Link, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SetupPage() {
  const [sheetUrl, setSheetUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const extractSheetId = (url: string): string | null => {
    // Match Google Sheets URL patterns
    const patterns = [
      /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
      /^([a-zA-Z0-9-_]+)$/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    const sheetId = extractSheetId(url);
    return sheetId !== null && sheetId.length > 10;
  };

  const handleSync = async () => {
    if (!validateUrl(sheetUrl)) {
      setError('Please enter a valid Google Sheets URL');
      return;
    }

    const sheetId = extractSheetId(sheetUrl);
    if (!sheetId) {
      setError('Could not extract Sheet ID from URL');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      // First save the URL to the user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          google_sheets_url: sheetUrl,
          has_completed_setup: true 
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      setIsSyncing(true);

      // Call the sync function with the custom sheet ID
      const { data, error: syncError } = await supabase.functions.invoke('sync-google-sheets', {
        body: { sheetId }
      });

      if (syncError) throw syncError;

      if (data?.error) {
        throw new Error(data.error);
      }

      setSyncSuccess(true);
      toast({
        title: 'Data synced successfully!',
        description: `${data?.recordsSynced || 0} records imported from your Google Sheet.`,
      });

      // Navigate to dashboard after success
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err: any) {
      console.error('Sync error:', err);
      setError(err.message || 'Failed to sync data. Make sure your sheet is publicly accessible.');
    } finally {
      setIsValidating(false);
      setIsSyncing(false);
    }
  };

  const handleSkip = async () => {
    try {
      await supabase
        .from('profiles')
        .update({ has_completed_setup: true })
        .eq('id', user?.id);
      
      navigate('/');
    } catch (err) {
      console.error('Error skipping setup:', err);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <FileSpreadsheet className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Connect Your Data</CardTitle>
          <CardDescription className="text-base">
            Link your Google Sheet to sync data with your dashboard. Your sheet must be publicly accessible (Anyone with the link can view).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {syncSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">
                Data Synced Successfully!
              </h3>
              <p className="text-muted-foreground">
                Redirecting to your dashboard...
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <Label htmlFor="sheet-url" className="text-sm font-medium">
                  Google Sheets URL
                </Label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="sheet-url"
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    value={sheetUrl}
                    onChange={(e) => {
                      setSheetUrl(e.target.value);
                      setError(null);
                    }}
                    className="pl-10"
                    disabled={isValidating || isSyncing}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Paste the full URL of your Google Sheet
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-sm">⚠️ Important: Make your sheet public</h4>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Open your Google Sheet</li>
                  <li>Click <strong>Share</strong> (top right)</li>
                  <li>Under "General access", change to <strong>"Anyone with the link"</strong></li>
                  <li>Set role to <strong>"Viewer"</strong></li>
                  <li>Copy the link and paste it here</li>
                </ol>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-sm">Expected Sheet Format:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Column A: School ID (optional)</li>
                  <li>• Column B: School Name</li>
                  <li>• Column C: Country</li>
                  <li>• Column D: School Type/Region</li>
                  <li>• Column E: Criteria (e.g., Sustainability, Innovation)</li>
                  <li>• Column F: Indicator</li>
                  <li>• Column G: Score (numeric)</li>
                  <li>• Column H: Status</li>
                  <li>• Column I: Trend</li>
                  <li>• Column J: Problem (optional)</li>
                  <li>• Column K: Solution (optional)</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  disabled={isValidating || isSyncing}
                  className="flex-1"
                >
                  Skip for now
                </Button>
                <Button
                  onClick={handleSync}
                  disabled={!sheetUrl.trim() || isValidating || isSyncing}
                  className="flex-1 gap-2"
                >
                  {isSyncing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Syncing...
                    </>
                  ) : isValidating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      Sync Data
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
