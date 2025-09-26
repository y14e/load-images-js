export function loadImage(urls) {
  return Promise.all(
    urls.map(async url => {
      const image = new Image();
      image.src = url;
      await image.decode();
      return image;
    }),
  );
}
