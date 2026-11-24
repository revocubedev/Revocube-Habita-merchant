import { Loader2, Mail } from 'lucide-react';
import Card, { CardContent } from '@/components/ui/Card';
import { useGetEmailPreferences, useUpdateEmailPreferences, type EmailPreference } from '@/api/api_controllers/emailPreferenceController';

const EmailNotification = () => {
  const { data: preferences, isPending, isError, isFetching, refetch } = useGetEmailPreferences();
  const { updatePreferences, isLoading: saving } = useUpdateEmailPreferences();
  const togglePreference = async (preference: EmailPreference) => {
    try {
      await updatePreferences([{ notificationType: preference.notificationType, isEnabled: !preference.isEnabled }]);
    } catch {
      // The API manager displays the error; retain the saved preference.
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Poppins' }}>
      <div>
        <h1 className="text-2xl font-display font-semibold text-foreground">Email Notification</h1>
        <p className="mt-2 text-sm text-muted-foreground">Manage your email notification preferences for this estate.</p>
      </div>
      <Card className="bg-card border border-border rounded-xl">
        <CardContent className="p-6">
          <h2 className="text-base font-medium text-foreground mb-5">Email preferences</h2>
          {isPending ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading preferences…
            </p>
          ) : isError ? (
            <div className="flex items-center gap-3 text-sm">
              <p className="text-destructive">Could not load email preferences.</p>
              <button type="button" onClick={() => void refetch()} className="underline">Retry</button>
            </div>
          ) : preferences?.length === 0 ? (
            <p className="text-sm text-muted-foreground">No email preferences are available.</p>
          ) : (
            <div className="divide-y divide-border">
              {preferences?.map((preference) => (
                <div key={preference.notificationType} className="flex items-center justify-between gap-6 py-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                    <div>
                      <h3 id={`label-${preference.notificationType}`} className="text-sm font-medium text-foreground">Estate join requests</h3>
                      <p id={`description-${preference.notificationType}`} className="mt-1 text-sm text-muted-foreground">Receive an email when someone requests to join this estate.</p>
                      <p className="mt-2 text-xs text-muted-foreground">{preference.isEnabled ? 'Enabled' : 'Disabled'}</p>
                    </div>
                  </div>
                  <button
                    type="button" role="switch" aria-checked={preference.isEnabled}
                    aria-labelledby={`label-${preference.notificationType}`}
                    aria-describedby={`description-${preference.notificationType}`}
                    disabled={saving || isFetching}
                    onClick={() => void togglePreference(preference)}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 ${preference.isEnabled ? 'bg-[#f30100]' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${preference.isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {saving && <p className="mt-4 text-sm text-muted-foreground" role="status">Saving preference…</p>}
        </CardContent>
      </Card>
    </div>
  );
};
export default EmailNotification;
