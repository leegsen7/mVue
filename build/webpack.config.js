const path = require('path')

function resolveUrl(url) {
    return path.resolve(__dirname,'../',url)
}

module.exports = {
    entry: resolveUrl('src/index.js'),
    output: {
        path: resolveUrl('dist'),
        filename: 'mVue.js',
    },
    mode: 'development',
    devtool: 'cheap-module-source-map',
}