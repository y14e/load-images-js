export function loadImages(urls: string[], timeout = 3000): Promise<HTMLImageElement[]> {
  return Promise.all(
    urls.map(async (url) => {
      const image = new Image();
      let resolved = false;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const controller = new AbortController();
      try {
        image.src = url;
        if (image.complete && image.naturalWidth > 0) {
          resolved = true;
          return image;
        }
        return await Promise.race([
          new Promise<HTMLImageElement>((resolve, reject) => {
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
          new Promise<never>((_, reject) => {
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
        controller.abort();
        if (!resolved) {
          image.src = '';
        }
      }
    }),
  ).then((images) => images.filter((image): image is HTMLImageElement => image !== null));
}
