/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ESTATE_CODE: string;
  readonly FIGMA_PERSONAL_ACCESS_TOKEN: string;
  readonly FIGMA_FILE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
