const path = require('path');
const { register } = require('tsconfig-paths');
const { compilerOptions } = require('./tsconfig.json');

register({
  baseUrl: path.join(__dirname, compilerOptions.baseUrl),
  paths: compilerOptions.paths,
});
