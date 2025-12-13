import PhotoSwipeLightbox from "https://unpkg.com/photoswipe@5.4.3/dist/photoswipe-lightbox.esm.js";
import PhotoSwipe from "https://unpkg.com/photoswipe@5.4.3/dist/photoswipe.esm.js";

document.addEventListener("DOMContentLoaded", () => {
  const gallerySelector = ".blog-post";
  const linkSelector = "a.pswp-lightbox-link";

  const galleries = document.querySelectorAll(gallerySelector);

  galleries.forEach((gallery) => {
    const images = gallery.querySelectorAll("img");

    images.forEach((img) => {
      if (img.closest("a")) return;

      const anchor = document.createElement("a");
      anchor.href = img.src;
      anchor.target = "_blank";
      anchor.classList.add("pswp-lightbox-link");

      if (img.naturalWidth) {
        anchor.dataset.pswpWidth = img.naturalWidth;
        anchor.dataset.pswpHeight = img.naturalHeight;
      } else {
        anchor.dataset.pswpWidth = 0;
        anchor.dataset.pswpHeight = 0;
      }

      if (!img.complete || img.naturalWidth === 0) {
        img.onload = () => {
          anchor.dataset.pswpWidth = img.naturalWidth;
          anchor.dataset.pswpHeight = img.naturalHeight;
        };
      }

      img.parentNode.insertBefore(anchor, img);
      anchor.appendChild(img);
    });
  });

  const lightbox = new PhotoSwipeLightbox({
    gallery: gallerySelector,
    children: linkSelector,
    pswpModule: PhotoSwipe,
  });

  lightbox.init();
});
