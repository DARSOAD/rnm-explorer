export const measure = async <T>(label: string, fn: () => Promise<T>): Promise<T> => {
    const t0 = performance.now();
    try {
      return await fn();
    } finally {
      const t1 = performance.now();
      console.log(`[timing] ${label} ${Math.round(t1 - t0)}ms`);
    }
  };
  