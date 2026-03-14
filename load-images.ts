export function loadImages(urls: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(
    urls.map(async (url: string): Promise<HTMLImageElement> => {
      const image = new Image();
      image.src = url;
      await image.decode();
      return image;
    }),
  );
}
