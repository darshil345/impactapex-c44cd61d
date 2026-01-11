import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FileSpreadsheet, Link, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SetupPage() {
  const [sheetUrl, setSheetUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncedCount, setSyncedCount] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const extractSheetId = (url: string): string | null => {
    const patterns = [
      /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
      /^([a-zA-Z0-9-_]{20,})$/,
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
    return sheetId !== null && sheetId.length > 15;
  };

  // Auto-sync when a valid URL is pasted
  useEffect(() => {
    const sheetId = extractSheetId(sheetUrl);
    if (sheetId && sheetId.length > 15 && !isSyncing && !syncSuccess) {
      // Debounce the sync to avoid multiple calls
      const timeoutId = setTimeout(() => {
        handleSync();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [sheetUrl]);

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

    setIsSyncing(true);
    setError(null);

    try {
      // Call the sync function with the custom sheet ID
      const { data, error: syncError } = await supabase.functions.invoke('sync-google-sheets', {
        body: { sheetId }
      });

      if (syncError) throw syncError;

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.success) {
        throw new Error('Sync failed. Please check your sheet format and try again.');
      }

      // Save the URL to the user's profile and mark setup as complete
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          google_sheets_url: sheetUrl,
          has_completed_setup: true 
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      setSyncedCount(data?.recordsSynced || 0);
      setSyncSuccess(true);
      
      toast({
        title: 'Data synced successfully!',
        description: `${data?.recordsSynced || 0} schools imported from your Google Sheet.`,
      });

      // Navigate to dashboard after success
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err: any) {
      console.error('Sync error:', err);
      let errorMessage = err.message || 'Failed to sync data.';
      
      // Provide more helpful error messages
      if (errorMessage.includes('400') || errorMessage.includes('publicly accessible')) {
        errorMessage = 'Your Google Sheet is not publicly accessible. Please make sure sharing is set to "Anyone with the link can view".';
      } else if (errorMessage.includes('No valid data')) {
        errorMessage = 'No valid data found. Please check that your sheet has the correct column format.';
      }
      
      setError(errorMessage);
    } finally {
      setIsSyncing(false);
    }
  };

  const sampleSheetUrl = 'https://docs.google.com/spreadsheets/d/1vF9F08dNRXq-xToR3fsL0_2yFTtKMsWbLoz-2xD5tvA/edit';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl border-2">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center">
            <FileSpreadsheet className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display">Connect Your Data Source</CardTitle>
          <CardDescription className="text-base">
            Paste your Google Sheets URL below to sync your school data. 
            The data will sync automatically once you paste a valid link.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-4">
          {syncSuccess ? (
            <div className="text-center py-10 space-y-4">
              <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center animate-in zoom-in duration-300">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">
                Successfully Synced!
              </h3>
              <p className="text-muted-foreground">
                {syncedCount} schools imported from your Google Sheet.
              </p>
              <p className="text-sm text-muted-foreground animate-pulse">
                Redirecting to your dashboard...
              </p>
            </div>
          ) : (
            <>
              {/* Input Section */}
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
                    className="pl-10 h-12 text-base"
                    disabled={isSyncing}
                    autoFocus
                  />
                  {isSyncing && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                {isSyncing && (
                  <p className="text-sm text-primary animate-pulse flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Syncing data from Google Sheets...
                  </p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Instructions */}
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Required: Make your sheet public
                </h4>
                <ol className="text-sm text-amber-700 dark:text-amber-300 space-y-2 list-decimal list-inside">
                  <li>Open your Google Sheet in a new tab</li>
                  <li>Click <span className="font-medium">Share</span> button (top right corner)</li>
                  <li>Under "General access", click and change to <span className="font-medium">"Anyone with the link"</span></li>
                  <li>Make sure the role is set to <span className="font-medium">"Viewer"</span></li>
                  <li>Copy the URL from your browser and paste it above</li>
                </ol>
              </div>

              {/* Sheet Format */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <h4 className="font-medium text-sm">Expected Column Format:</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <div>A: School ID (optional)</div>
                  <div>B: School Name</div>
                  <div>C: Country</div>
                  <div>D: School Type/Region</div>
                  <div>E: Criteria</div>
                  <div>F: Indicator</div>
                  <div>G: Score (0-100)</div>
                  <div>H: Status</div>
                  <div>I: Trend</div>
                  <div>J: Problem (optional)</div>
                  <div>K: Solution (optional)</div>
                </div>
              </div>

              {/* Sample Sheet Link */}
              <div className="text-center">
                <a 
                  href={sampleSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  View sample spreadsheet template
                </a>
              </div>

              {/* Manual Sync Button */}
              <Button
                onClick={handleSync}
                disabled={!sheetUrl.trim() || isSyncing}
                className="w-full h-12 text-base gap-2"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-5 h-5" />
                    Sync Data & Continue
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
