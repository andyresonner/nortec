import { useEffect, useState } from 'react';

export function useIntersectionObserver(ref, options = {}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return undefined;
    const node = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (options.once !== false) observer.unobserve(node);
        } else if (options.once === false) {
          setIsVisible(false);
        }
      },
      {
        threshold: options.threshold ?? 0.2,
        rootMargin: options.rootMargin ?? '0px',
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, options.once, options.threshold, options.rootMargin]);

  return isVisible;
}

