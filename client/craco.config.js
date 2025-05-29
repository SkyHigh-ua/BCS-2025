const path = require("path");
const webpack = require("webpack");

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
      "@/models": path.resolve(__dirname, "./src/models"),
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env": JSON.stringify(process.env),
      }),
    ],
    configure: (webpackConfig) => {
      // Add support for ESM modules in tests
      if (process.env.NODE_ENV === "test") {
        webpackConfig.module.rules.push({
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          exclude: /node_modules\/(?!(axios|react-router-dom)\/).*/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        });
      }
      return webpackConfig;
    },
  },
  jest: {
    configure: {
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },
      transformIgnorePatterns: ["node_modules/(?!(axios|react-router-dom)/)"],
    },
  },
};
