export function loadImage(urls) {
  async function load(url) {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  }
  return Promise.all(urls.map(load));
}
