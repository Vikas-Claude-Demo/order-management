import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    outputFileTracingRoot: __dirname,
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value: "script-src 'self' 'unsafe-eval' 'unsafe-inline'; object-src 'none'; img-src * data: blob:;",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
