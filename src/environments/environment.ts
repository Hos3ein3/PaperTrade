import { Environment } from './environment.model';

export const environment: Environment = {
  production: false,
  apiBaseUrl: 'http://localhost:5143/api/v1',
  apiVersion: '1.0',
  signalrHubUrl: 'http://localhost:5143/hubs/notifications',
  vapidPublicKey: 'BGV6_XJKy1AMRPt_G3TUUcjznT8-C7tBH1vj5j8FLcEnAASQl_AMhquOuQI8dow0AC-IF57mGtg8hcu3N2DoxA0',
  googleClientId: 'mock-google-client-id.apps.googleusercontent.com',
  appName: 'TrackerPro Universal Terminal',
  features: {
    enablePaperTrading: true,
    enableForex: true,
    enableCrypto: true,
    enableMockFallback: false, // Use REAL running API at http://localhost:5143
    showErrorTraces: true, // Default is true; if false, hides 500 error traces
  },
};

export * from './environment.model';
