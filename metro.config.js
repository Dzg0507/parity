const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration to handle React DevTools issue
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// ✅ Use blockList directly—no need to import from metro-config
config.resolver.blockList = [
  /.*\/react-native\/Libraries\/Core\/setUpReactDevTools\.js$/,
  /.*\/react-native\/src\/private\/devsupport\/rndevtools\/ReactDevToolsSettingsManager.*$/,
  /.*\/node_modules\/\.n8ao-Hh9vGF1V\/dev-server\.js$/, // ⛔️ import.meta offender
  /.*\/node_modules\/.*\/dev-server\.js$/, // Block any dev-server files with import.meta
  /.*\/node_modules\/.*\/.*dev.*\.js$/, // Block any development files that might use import.meta
  /.*\/node_modules\/@monogrid\/gainmap-js\/.*\.js$/, // ⛔️ Gainmap import.meta.url offender
  /.*\/node_modules\/@readyplayerme\/react-avatar-creator\/.*\.js$/, // ⛔️ ReadyPlayerMe React Avatar Creator import.meta offender
];

// Add resolver alias to provide mock implementations for missing modules
config.resolver.alias = {
  ...config.resolver.alias,
  '../../src/private/devsupport/rndevtools/ReactDevToolsSettingsManager':
    require.resolve('./src/utils/mocks/ReactDevToolsSettingsManager.js'),
  '@readyplayerme/react-avatar-creator':
    require.resolve('./src/utils/mocks/ReadyPlayerMeAvatarCreatorShim.js'),
  '@readyplayerme/visage':
    require.resolve('@readyplayerme/visage/dist/index.cjs.js'),
  '@monogrid/gainmap-js':
    require.resolve('./src/utils/mocks/GainmapMock.js'),
};

// Configure transformer for web compatibility
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
  unstable_allowRequireContext: false,
};

// Add web-specific resolver configuration
config.resolver.sourceExts = [...config.resolver.sourceExts, 'web.js', 'web.ts', 'web.tsx'];

module.exports = config;
