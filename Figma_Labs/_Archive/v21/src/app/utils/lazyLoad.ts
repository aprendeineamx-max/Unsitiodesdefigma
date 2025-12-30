// Utility for lazy loading components
export const lazyLoadWithRetry = (
  importFn: () => Promise<any>,
  retriesLeft = 3,
  interval = 1000
): Promise<any> => {
  return new Promise((resolve, reject) => {
    importFn()
      .then(resolve)
      .catch((error) => {
        setTimeout(() => {
          if (retriesLeft === 1) {
            // On last retry, reject
            reject(error);
            return;
          }

          // Retry the import
          lazyLoadWithRetry(importFn, retriesLeft - 1, interval).then(
            resolve,
            reject
          );
        }, interval);
      });
  });
};

// Export default for easier importing
export default lazyLoadWithRetry;
