/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverComponentsExternalPackages: ["@node-rs/xxhash"],
	},
};

export default nextConfig;
