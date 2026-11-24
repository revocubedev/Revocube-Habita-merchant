import useApiManager from "../useApiManager";
import useGetApiManager from "../useGetApiManager";

export const useTwoFactorStatus = () =>
  useGetApiManager<{ twoFactorEnabled: boolean }>({
    queryKey: ["two_factor_status"],
    endpoint: "/estate-managers/2fa/status",
    isAuth: true,
    isCode: false,
    select: (response) => response.data,
  });

export interface VerifySetupPayload {
  token: string;
}

export interface Verify2FaLoginPayload {
  challengeToken: string;
  token: string;
}

export interface Disable2FaPayload {
  password: string;
  token: string;
}

export interface TwoFactorLoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    manager: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
    };
    estates: {
      id: string;
      name: string;
      estateCode: string;
      status: string;
      package: {
        id: string;
        name: string;
      };
    }[];
  };
}


export interface TwoFactorSetupData {
  qrCode: string;
  secret: string;
  otpAuthUrl: string;
  manualSetup: {
    secret: string;
    account: string;
    issuer: string;
    algorithm: string;
    digits: number;
    period: number;
  };
}

/** POST /estate-managers/2fa/setup — initiate 2FA setup (returns QR + secret) */
export const useSetup2FA = () => {
  const { callApi, data, isLoading, error, isSuccess } = useApiManager({
    endpoint: "/estate-managers/2fa/setup",
    method: "POST",
    isAuth: true,
    isCode: false,
    showSuccessToastt: false,
  });

  const setup2FA = () => callApi({});
  return { setup2FA, data, isLoading, error, isSuccess };
};

/** POST /estate-managers/2fa/verify-setup — confirm TOTP code to enable 2FA */
export const useVerifySetup2FA = () => {
  const { callApi, isLoading, error, isSuccess } = useApiManager({
    endpoint: "/estate-managers/2fa/verify-setup",
    queryKey: ["two_factor_status"],
    method: "POST",
    isAuth: true,
    isCode: false,
  });

  const verifySetup = (details: VerifySetupPayload) => callApi(details);
  return { verifySetup, isLoading, error, isSuccess };
};

/** POST /estate-managers/2fa/verify — verify TOTP during login (uses challenge token) */
export const useVerify2FALogin = () => {
  const { callApi, isLoading, error, isSuccess, data } = useApiManager({
    endpoint: "/estate-managers/2fa/verify",
    method: "POST",
    isAuth: false, // Not authenticated yet — uses challengeToken
    isCode: false,
    showSuccessToastt: false,
  });

  const verify2FALogin = (details: Verify2FaLoginPayload): Promise<TwoFactorLoginResponse> => callApi(details);
  return { verify2FALogin, data, isLoading, error, isSuccess };
};

/** POST /estate-managers/2fa/disable — disable 2FA (requires password + TOTP) */
export const useDisable2FA = () => {
  const { callApi, isLoading, error, isSuccess } = useApiManager({
    endpoint: "/estate-managers/2fa/disable",
    queryKey: ["two_factor_status"],
    method: "POST",
    isAuth: true,
    isCode: false,
  });

  const disable2FA = (details: Disable2FaPayload) => callApi(details);
  return { disable2FA, isLoading, error, isSuccess };
};
