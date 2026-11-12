/** @type {import('next').NextConfig} */

// Security headers carried over from the Carma car app, tightened for a
// marketing site: no third-party scripts, fonts are self-hosted, images local.
// Vercel Web Analytics loads from this same domain (/_vercel/insights), so 'self' covers it.
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // React needs eval only in development (better error stacks); production stays strict.
      `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'production' ? '' : " 'unsafe-eval' https://va.vercel-scripts.com"}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
    ].join('; '),
  },
];

const nextConfig = {
  poweredByHeader: false,
  // Two root layouts (English and German), so the 404 page is defined once in app/global-not-found.tsx.
  experimental: { globalNotFound: true },
  // Addresses from the old Carma car-search app on this domain: send visitors and
  // search engines to the new site instead of a "not found" page.
  async redirects() {
    const toHome = ['/alerts', '/auth/:path*', '/buying-assistance', '/enterprise/:path*', '/enterprise', '/error', '/help', '/login', '/portfolio', '/settings', '/terms', '/account'];
    return [
      ...toHome.map((source) => ({ source, destination: '/', permanent: true })),
      { source: '/privacy', destination: '/datenschutz', permanent: true },
    ];
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
