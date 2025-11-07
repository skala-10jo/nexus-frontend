import { onMounted, onUnmounted, watch } from 'vue';

export function useIntersectionObserver(target, callback, options = {}) {
  let observer;

  const cleanup = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  const observe = () => {
    cleanup();

    if (!target.value) return;

    observer = new IntersectionObserver(callback, {
      root: options.root || null,
      rootMargin: options.rootMargin || '0px',
      threshold: options.threshold || 0
    });

    observer.observe(target.value);
  };

  onMounted(() => {
    observe();
  });

  watch(target, () => {
    observe();
  });

  onUnmounted(() => {
    cleanup();
  });

  return {
    observe,
    cleanup
  };
}
