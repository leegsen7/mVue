const path = require('path')

function resolveUrl(url) {
    return path.resolve(__dirname,'../',url)
}

module.exports = {
    entry: resolveUrl('src/index.js'),
    output: {
        path: resolveUrl('build/'),
        publicPath: resolveUrl('./'),
        filename: 'mVue.js',
    },
    // module: {
    //     rule: [
    //         {
    //             test: '/\.js$/',
    //             use: 'babel-loader',
    //         },
    //     ],
    // },
    devServer: {
        contentBase: resolveUrl('./'),
        port: 4001,
        open: false,
        noInfo: true,
        inline: true,
        hot: true,
        // 浏览器的控制台打印日志
        clientLogLevel: "none",
    },
    mode: 'development',
}