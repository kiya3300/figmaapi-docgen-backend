const tsConfigPaths = require('tsconfig-paths');
const path = require('path');

const baseUrl = path.resolve(__dirname, 'dist');
const cleanup = tsConfigPaths.register({
  baseUrl,
  paths: {
    '@/*': ['*'],
    '@/shared/*': ['shared/*'],
    '@/modules/*': ['modules/*'],
    '@/config/*': ['config/*']
  }
}); 