module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Removed react-native-dotenv plugin as it causes web build issues
      // Environment variables are now handled in src/config/env.js
      // Re-added @babel/plugin-syntax-import-meta with proper configuration for ReadyPlayerMe
      ['@babel/plugin-syntax-import-meta', { loose: true }],
    ],
    env: {
      web: {
        plugins: [
          ['@babel/plugin-transform-modules-commonjs', { loose: true }],
          ['@babel/plugin-syntax-import-meta', { loose: true }],
        ],
      },
    },
  };
};
