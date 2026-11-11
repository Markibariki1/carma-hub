import type { MetadataRoute } from 'next';
import { site, ownerDetailsComplete } from '@/site.config';

export default function robots(): MetadataRoute.Robots {
  return ownerDetailsComplete
    ? { rules: { userAgent: '*', allow: '/' }, sitemap: `${site.url}/sitemap.xml` }
    : { rules: { userAgent: '*', disallow: '/' } };
}
