export function loadImages(urls, timeout = 3000) {
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
  ).then((images) => images.filter(Boolean));
}
