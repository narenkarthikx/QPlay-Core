/// <reference types="vite/client" />

declare global {
  interface Window {
    google?: {
      accounts: {
        id: any;
      };
    };
  }
}
