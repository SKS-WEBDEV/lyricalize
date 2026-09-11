/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly SAAVN_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}