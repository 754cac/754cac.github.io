const DEFAULT_COLOR_PALETTES = {
  p0: ["#5135FF", "#FF5828", "#F69CFF", "#FFA50F"],
  p1: ["#FE69B7", "#BC0A6F", "#00F5FF", "#7B68EE"],
  p2: ["#FE69B7", "#BC0A6F", "#E6E6FA", "#6495ED"],
  p3: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"],
  p4: ["#667eea", "#764ba2", "#f093fb", "#f5576c"],
  p5: ["#11998e", "#38ef7d", "#2575fc", "#6a11cb"],
};

/**
 * Generate a random ellipse descriptor for composing the SVG.
 * @param {string[]} palette - Array of color strings to pick from.
 * @returns {{color:string,fx:number,scale:number[],skew:number,rotation:number,translation:number[]}}
 */
function generateRandomEllipse(palette) {
  return {
    color: palette[Math.floor(Math.random() * palette.length)],
    fx: 0.1 + Math.random() * 0.3,
    scale: [0.7 + Math.random() * 0.8, 0.7 + Math.random() * 0.8],
    skew: -10 + Math.random() * 20,
    rotation: Math.random() * 360,
    translation: [-250 + Math.random() * 500, -250 + Math.random() * 500],
  };
}

/**
 * Create an SVG string containing layered radial gradients.
 * @param {string[]} palette - Array of color strings
 * @param {object} [options]
 * @param {number} [options.width]
 * @param {number} [options.height]
 * @param {string} [options.viewBox]
 * @param {number} [options.ellipseCount]
 * @param {number} [options.saturation]
 * @param {string} [options.backgroundColor]
 * @param {string} [options.preserveAspectRatio]
 * @returns {string} SVG markup
 */
function generateGradientSVG(palette, options = {}) {
  const {
    width = 600,
    height = 400,
    viewBox = "0 0 600 600",
    ellipseCount = 12,
    saturation = 125,
    backgroundColor = "#5135FF",
    preserveAspectRatio = "xMidYMid slice",
  } = options;
  const ellipses = Array.from({ length: ellipseCount }, () =>
    generateRandomEllipse(palette)
  );
  const gradients = ellipses
    .map((ellipse, index) => {
      return `<radialGradient id="grad${index}" fx="${ellipse.fx}" fy="0.5">
    <stop offset="0%" stop-color="${ellipse.color}"/>
    <stop offset="100%" stop-color="${ellipse.color}" stop-opacity="0"/>
  </radialGradient>`;
    })
    .join("");
  const rects = ellipses
    .map((ellipse, index) => {
      return `<rect x="0" y="0" width="100%" height="100%" fill="url(#grad${index})" transform="translate(300 300) scale(${ellipse.scale[0]} ${ellipse.scale[1]}) skewX(${ellipse.skew}) rotate(${ellipse.rotation}) translate(${ellipse.translation[0]} ${ellipse.translation[1]}) translate(-300 -300)"/>`;
    })
    .join("");
  const filterStyle = `filter:saturate(${saturation}%);-webkit-filter:saturate(${saturation}%)`;
  return `<svg width="${width}" height="${height}" viewBox="${viewBox}" style="width:100%;max-width:${width}px;height:auto;${filterStyle}" preserveAspectRatio="${preserveAspectRatio}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${gradients}
  </defs>
  <rect x="0" y="0" width="100%" height="100%" fill="${backgroundColor}"/>
  ${rects}
</svg>`;
}
/**
 * Convenience: generate SVG by palette key from the bundled palettes.
 * @param {string} paletteName
 * @param {object} options
 */
function generateGradientWithPalette(paletteName, options) {
  return generateGradientSVG(DEFAULT_COLOR_PALETTES[paletteName], options);
}

/**
 * Trigger a download of an SVG string as a .svg file.
 * @param {string} svgContent
 * @param {string} [filename]
 */
function downloadSVG(svgContent, filename) {
  const blob = new Blob([svgContent], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `gradient-${Date.now()}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Convert an SVG string to a PNG and trigger a download. Defaults to
 * using the SVG viewBox (if present) scaled by the device pixel ratio.
 * @param {string} svgContent
 * @param {string} [filename]
 * @param {number} [width] - optional explicit pixel width
 * @param {number} [height] - optional explicit pixel height
 * @returns {Promise<void>}
 */
function downloadPNG(svgContent, filename, width, height) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    if (!ctx) {
      reject(new Error("Canvas context not available"));
      return;
    }

    // Determine DPR-aware dimensions when width/height not explicitly provided
    const dpr = typeof window !== "undefined" && window.devicePixelRatio ? window.devicePixelRatio : 1;
    if (typeof width === "undefined" || typeof height === "undefined") {
      // Try to parse viewBox from the SVG to infer base dimensions
      const vbMatch = svgContent.match(/viewBox=["']?([\d\.\-\s]+)["']?/i);
      if (vbMatch && vbMatch[1]) {
        const parts = vbMatch[1].trim().split(/\s+/).map(Number);
        if (parts.length === 4 && Number.isFinite(parts[2]) && Number.isFinite(parts[3])) {
          width = Math.max(1, Math.round(parts[2] * dpr));
          height = Math.max(1, Math.round(parts[3] * dpr));
        }
      }
      // Fallback to sensible defaults
      if (typeof width === "undefined") width = Math.round(600 * dpr);
      if (typeof height === "undefined") height = Math.round(400 * dpr);
    }

    canvas.width = width;
    canvas.height = height;
    img.onload = () => {
      try {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename || `gradient-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            resolve();
          } else {
            reject(new Error("Failed to create blob"));
          }
        }, "image/png");
      } catch (err) {
        reject(err);
      } finally {
        // Revoke the temporary SVG URL used as image src
        if (svgUrl) try { URL.revokeObjectURL(svgUrl); } catch (e) {}
      }
    };
    img.onerror = () => {
      if (svgUrl) try { URL.revokeObjectURL(svgUrl); } catch (e) {}
      reject(new Error("Failed to load SVG"));
    };
    const svgBlob = new Blob([svgContent], { type: "image/svg+xml" });
    const svgUrl = URL.createObjectURL(svgBlob);
    img.src = svgUrl;
  });
}

class GradientGenerator {
  constructor(palette, options = {}) {
    this.palette =
      typeof palette === "string" ? DEFAULT_COLOR_PALETTES[palette] : palette;
    this.options = options;
  }
  generate() {
    return generateGradientSVG(this.palette, this.options);
  }
  setPalette(palette) {
    this.palette =
      typeof palette === "string" ? DEFAULT_COLOR_PALETTES[palette] : palette;
  }
  setOptions(options) {
    this.options = { ...this.options, ...options };
  }
  downloadSVG(filename) {
    downloadSVG(this.generate(), filename);
  }
  async downloadPNG(filename, width, height) {
    return downloadPNG(this.generate(), filename, width, height);
  }
}
var index = {
  generateGradientSVG,
  generateGradientWithPalette,
  downloadSVG,
  downloadPNG,
  GradientGenerator,
  DEFAULT_COLOR_PALETTES,
};

export {
  DEFAULT_COLOR_PALETTES,
  GradientGenerator,
  index as default,
  downloadPNG,
  downloadSVG,
  generateGradientSVG,
  generateGradientWithPalette,
};
