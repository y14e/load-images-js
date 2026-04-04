export function loadImages(urls, timeout = 3000) {
  return Promise.all(
    urls.map(async (url) => {
      const image = new Image();
      image.src = url;
      let timer;
      const decodePromise = (async () => {
        if (image.complete) {
          return image;
        }
        try {
          await image.decode();
          return image;
        } catch {}
        await new Promise((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () => reject();
        });
        return image;
      })();
      const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(reject, timeout);
      });
      try {
        return await Promise.race([decodePromise, timeoutPromise]);
      } catch {
        return null;
      } finally {
        if (timer !== undefined) {
          clearTimeout(timer);
        }
      }
    }),
  ).then((images) => images.filter((image) => image !== null));
}
