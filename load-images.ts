export function loadImages(urls: string[], timeout = 3000): Promise<HTMLImageElement[]> {
  return Promise.all(
    urls.map((url) => {
      const image = new Image();
      image.src = url;
      let timer = 0;
      return Promise.race([
        image.decode(),
        new Promise((_, reject) => {
          timer = Number(setTimeout(reject, timeout));
        }),
      ])
        .then(() => image)
        .catch(() => null)
        .finally(() => clearTimeout(timer));
    }),
  ).then((images) => {
    const array = new Array(images.length);
    images.forEach((image, index) => {
      if (image !== null) {
        array[index] = image;
      }
    });
    return array;
  });
}
