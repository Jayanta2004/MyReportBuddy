/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // pdf-parse and formidable use Node.js-only APIs — keep them out of the
    // edge/browser bundle so they are only resolved on the server.
    serverComponentsExternalPackages: ['pdf-parse', 'pdfjs-dist', 'formidable'],
    outputFileTracingIncludes: {
      '/api/**/*': [
        './node_modules/pdf-parse/lib/**/*',
        './node_modules/pdfjs-dist/legacy/build/**/*'
      ]
    }
  },
};

module.exports = nextConfig;
