import PhotoSwipeLightbox from 'https://unpkg.com/photoswipe@5.4.3/dist/photoswipe-lightbox.esm.js';
import PhotoSwipe from 'https://unpkg.com/photoswipe@5.4.3/dist/photoswipe.esm.js';

document.addEventListener('DOMContentLoaded', () => {
  const gallerySelector = '.blog-post';
  const linkSelector = 'a.pswp-lightbox-link';

  // 1. Find all images in blog posts and wrap them in anchors if needed
  const galleries = document.querySelectorAll(gallerySelector);
  
  galleries.forEach(gallery => {
    const images = gallery.querySelectorAll('img');
    
    images.forEach(img => {
      // Skip if already wrapped in an anchor
      if (img.closest('a')) return;
      
      const anchor = document.createElement('a');
      anchor.href = img.src;
      anchor.target = '_blank';
      anchor.classList.add('pswp-lightbox-link');
      
      // Set initial dimensions if available
      if (img.naturalWidth) {
        anchor.dataset.pswpWidth = img.naturalWidth;
        anchor.dataset.pswpHeight = img.naturalHeight;
      } else {
        // Fallback or wait for load
        anchor.dataset.pswpWidth = 0;
        anchor.dataset.pswpHeight = 0;
      }

      // Update dimensions when image loads (for cached or late-loading images)
      if (!img.complete || img.naturalWidth === 0) {
        img.onload = () => {
          anchor.dataset.pswpWidth = img.naturalWidth;
          anchor.dataset.pswpHeight = img.naturalHeight;
        };
      }
      
      // Wrap the image
      img.parentNode.insertBefore(anchor, img);
      anchor.appendChild(img);
    });
  });

  // 2. Initialize PhotoSwipe
  const lightbox = new PhotoSwipeLightbox({
    gallery: gallerySelector,
    children: linkSelector,
    pswpModule: PhotoSwipe,
    // Dynamic dimension handling for images that might not have had dimensions at init
    // This event handler ensures we get the correct size before opening
    // However, PhotoSwipe reads data attributes. We updated them in onload above.
  });

  lightbox.init();
});
