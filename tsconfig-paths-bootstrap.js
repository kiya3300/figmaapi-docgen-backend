const tsConfigPaths = require('tsconfig-paths');
const tsConfig = require('./tsconfig.json');

const baseUrl = './dist';
const cleanup = tsConfigPaths.register({
  baseUrl,
  paths: {
    '@/*': ['*'],
    '@/shared/*': ['shared/*'],
    '@/modules/*': ['modules/*'],
    '@/config/*': ['config/*']
  }
}); 