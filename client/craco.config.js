const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/utils": path.resolve(__dirname, "./src/lib/utils"),
      "@/ui": path.resolve(__dirname, "./src/components/ui"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/services": path.resolve(__dirname, "./src/services"),
      "@/pages": path.resolve(__dirname, "./src/pages"),
      "@/assets": path.resolve(__dirname, "./src/assets"),
      "@/models": path.resolve(__dirname, "./src/assets"),
    },
  },
};
