import useGetApiManager from "../useGetApiManager";
import useApiManager from "../useApiManager";

export interface EmailPreference {
  notificationType: "ESTATE_JOIN_REQUEST";
  isEnabled: boolean;
}
const QUERY_KEY = "estate_email_preferences";
export const useGetEmailPreferences = () => useGetApiManager<EmailPreference[]>({
  queryKey: [QUERY_KEY], endpoint: "estate/email-preferences", isAuth: true, isCode: true,
  select: (response) => response.data,
});
export const useUpdateEmailPreferences = () => {
  const { callApi, isLoading } = useApiManager({
    endpoint: "estate/email-preferences", method: "PUT", isAuth: true, isCode: true,
    queryKey: [QUERY_KEY],
  });
  return { updatePreferences: (preferences: EmailPreference[]) => callApi({ preferences }), isLoading };
};
