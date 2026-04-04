export function loadImages(urls, timeout = 3000) {
  return Promise.all(
    urls.map(async (url) => {
      const image = new Image();
      let timer;
      const controller = new AbortController();
      try {
        image.src = url;
        if (image.complete && image.naturalWidth > 0) return image;
        const loadPromise = new Promise((resolve, reject) => {
          const { signal } = controller;
          image.addEventListener(
            'load',
            async () => {
              try {
                await image.decode();
              } catch {}
              resolve(image);
            },
            { once: true, signal },
          );
          image.addEventListener('error', () => reject(new Error(`Image load failed: ${url}`)), { once: true, signal });
        });
        const timeoutPromise = new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error(`Image load timeout (${timeout}ms): ${url}`)), timeout);
        });
        return await Promise.race([loadPromise, timeoutPromise]);
      } catch (error) {
        console.warn('Image load failed:', url, error);
        return null;
      } finally {
        if (timer !== undefined) {
          clearTimeout(timer);
        }
        controller.abort();
        image.src = '';
      }
    }),
  ).then((images) => images.filter((image) => image !== null));
}
