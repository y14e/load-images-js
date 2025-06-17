export function loadImage(urls: string[]): Promise<HTMLImageElement[]> {
  async function load(url: string): Promise<HTMLImageElement> {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  }
  return Promise.all(urls.map(load));
);
}
