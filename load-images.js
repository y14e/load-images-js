export function loadImages(urls, options = {}) {
  const { signal: externalSignal, timeout = 3000 } = options;
  return Promise.all(
    urls.map(async (url) => {
      const image = new Image();
      let resolved = false;
      let timer;
      const controller = new AbortController();
      let externalAbortHandler;
      if (externalSignal) {
        if (externalSignal.aborted) {
          controller.abort();
        } else {
          externalAbortHandler = () => controller.abort();
          externalSignal.addEventListener('abort', externalAbortHandler, { once: true });
        }
      }
      try {
        image.src = url;
        if (image.complete && image.naturalWidth > 0) {
          resolved = true;
          return image;
        }
        return await Promise.race([
          new Promise((resolve, reject) => {
            const { signal } = controller;
            image.addEventListener(
              'load',
              async () => {
                try {
                  await image.decode();
                } catch {}
                resolved = true;
                resolve(image);
              },
              { once: true, signal },
            );
            image.addEventListener('error', () => reject(new Error(`Image load failed: ${url}`)), { once: true, signal });
          }),
          new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error(`Image load timeout (${timeout}ms): ${url}`)), timeout);
          }),
        ]);
      } catch (error) {
        console.warn('Image load failed:', url, error);
        return null;
      } finally {
        if (timer !== undefined) {
          clearTimeout(timer);
        }
        if (externalSignal && externalAbortHandler) {
          externalSignal.removeEventListener('abort', externalAbortHandler);
        }
        controller.abort();
        if (!resolved) {
          image.src = '';
        }
      }
    }),
  ).then((images) => images.filter((image) => image !== null));
}
