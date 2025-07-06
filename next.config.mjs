// next.config.mjs
import path from 'path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com']
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(process.cwd())
    return config
  }
}

export default nextConfig
