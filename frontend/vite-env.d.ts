/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_API_URL: string;
  // Add other VITE_ variables here as your project grows
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
