import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export const initializeSentry = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1.0,
      environment: import.meta.env.MODE,
      enabled: process.env.NODE_ENV === 'production',
      beforeSend(event) {
        // Don't send events in development
        if (process.env.NODE_ENV === 'development') {
          return null;
        }
        return event;
      },
    });
  }
};

export const captureError = (error, context = {}) => {
  console.error('Error:', error);
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      extra: context,
    });
  }
};

export const setUserContext = (user) => {
  if (process.env.NODE_ENV === 'production' && user) {
    Sentry.setUser({
      id: user.id,
      username: user.username,
      email: user.email,
    });
  }
};
