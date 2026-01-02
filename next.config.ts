// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'images.unsplash.com',
//         port: '',
//         pathname: '/**',
//       },
//       {
//         protocol: 'https',
//         hostname: 'images.pexels.com',
//         port: '',
//         pathname: '/**',
//       },
//     ],
//   },
// };

// export default nextConfig;


// new code
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // ✅ ADD THIS FIRST - tennews.in domain
      {
        protocol: 'https',
        hostname: 'tennews.in',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.istockphoto.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.istockphoto.com',
        port: '',
        pathname: '/**',
      },
      // ✅ Google Images domains add karen
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.gstatic.com', // All gstatic domains
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com', // Google user content
        port: '',
        pathname: '/**',
      },
      // ✅ Agar aap Firebase storage use kar rahe hain
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.firebasestorage.app',
        port: '',
        pathname: '/**',
      },
      // ✅ ui-avatars.com for agent profile images
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/**',
      },
      // ✅ res.cloudinary.com for videos
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      // ✅ Cloudinary for all cloudinary domains
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      // ✅ img.freepik.com for agent images
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
        port: '',
        pathname: '/**',
      },
      // ✅ All freepik domains
      {
        protocol: 'https',
        hostname: '**.freepik.com',
        port: '',
        pathname: '/**',
      },
      // ✅ Aap chahein to wildcard pattern add kar sakte hain sab domains ke liye
      // {
      //   protocol: 'https',
      //   hostname: '**',
      //   port: '',
      //   pathname: '/**',
      // },
    ],
  },
};

export default nextConfig;