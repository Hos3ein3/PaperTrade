import { Environment } from './environment.model';

export const environment: Environment = {
  production: true,
  apiBaseUrl: '/api/v1',
  apiUrl: '/api',
  apiVersion: '1.0',
  signalrHubUrl: '/hubs/notifications',
  vapidPublicKey: 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIhbQFLXYp5Nksh8U=',
  googleClientId: 'production-google-client-id.apps.googleusercontent.com',
  appName: 'TrackerPro Universal Terminal',
  features: {
    enablePaperTrading: true,
    enableForex: true,
    enableCrypto: true,
    enableMockFallback: false,
    showErrorTraces: true,
  },
};
