export interface Environment {
  production: boolean;
  apiBaseUrl: string;
  apiVersion: string;
  signalrHubUrl: string;
  vapidPublicKey: string;
  googleClientId: string;
  appName: string;
  features: {
    enablePaperTrading: boolean;
    enableForex: boolean;
    enableCrypto: boolean;
    enableMockFallback: boolean;
    showErrorTraces: boolean;
  };
}
