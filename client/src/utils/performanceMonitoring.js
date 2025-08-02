import { useEffect, useRef } from 'react';
import * as Sentry from '@sentry/react';

export const usePerformanceMonitoring = (componentName) => {
  const startTime = useRef(performance.now());

  useEffect(() => {
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime.current;

      // Report component lifecycle duration to Sentry
      Sentry.addBreadcrumb({
        category: 'performance',
        message: `${componentName} lifecycle duration`,
        data: {
          duration,
          component: componentName,
        },
      });

      // Report to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName} lifecycle: ${duration.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
};

export const measureApiCall = async (name, apiCall) => {
  const startTime = performance.now();
  try {
    const result = await apiCall();
    const duration = performance.now() - startTime;

    // Report API call duration
    Sentry.addBreadcrumb({
      category: 'api',
      message: `API call: ${name}`,
      data: {
        duration,
        success: true,
      },
    });

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    
    Sentry.addBreadcrumb({
      category: 'api',
      message: `API call: ${name}`,
      data: {
        duration,
        success: false,
        error: error.message,
      },
    });

    throw error;
  }
};
