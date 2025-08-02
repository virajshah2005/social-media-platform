import { useState, useEffect, useCallback } from 'react';

export const useLazyLoad = (ref, options = {}) => {
  const [isVisible, setIsVisible] = useState(false);

  const callbackFunction = useCallback(entries => {
    const [entry] = entries;
    setIsVisible(entry.isIntersecting);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(callbackFunction, options);
    const currentRef = ref.current;
    
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, options, callbackFunction]);

  return isVisible;
};

export default useLazyLoad;
