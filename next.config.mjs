/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  images: {
    /* AVIF first, WebP fallback. Source files are pre-encoded to AVIF/WebP by
       scripts/optimize-images.mjs; this covers on-the-fly resizing. */
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1600],
    imageSizes: [64, 96, 128, 200, 256, 360, 420],
    minimumCacheTTL: 31536000
  }
};

export default nextConfig;
