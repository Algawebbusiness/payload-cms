import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  /**
   * The API sends no cache headers of its own, so Cloudflare in front of
   * cms.algaweb.site was caching GET responses — edge copies up to half an hour
   * old were observed. Editors saved a change and the public site kept showing
   * the previous version, and different visitors saw different versions.
   *
   * Media files are deliberately left cacheable; only the JSON API opts out.
   */
  async headers() {
    return [
      {
        source: '/api/:path((?!media/file/).*)',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
