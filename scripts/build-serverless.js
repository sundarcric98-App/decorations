const esbuild = require('esbuild');
const path = require('path');

console.log('Building serverless API bundle for Vercel...');

esbuild.buildSync({
  entryPoints: [path.resolve(__dirname, '../server/src/app.ts')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outfile: path.resolve(__dirname, '../api/index.js'),
  banner: {
    js: '/* Sathuragiri Decoration API Serverless Bundle */',
  },
  footer: {
    js: `
const _app = (typeof app_default !== 'undefined' && app_default) || 
             (typeof app !== 'undefined' && app) || 
             (module.exports && (module.exports.default || module.exports.app || module.exports));

const serverlessHandler = (req, res) => {
  return _app(req, res);
};

module.exports = serverlessHandler;
module.exports.default = serverlessHandler;
`
  }
});

console.log('✅ api/index.js bundled successfully as a callable Vercel Serverless Function.');
