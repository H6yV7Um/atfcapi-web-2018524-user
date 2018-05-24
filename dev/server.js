const path = require('path');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const port = 8082;

new WebpackDevServer(webpack({
    devtool: "source-map",
    entry: [
        `webpack-dev-server/client?http://atfcapidev.elenet.me:${port}/`,
        'webpack/hot/only-dev-server',
        'react-hot-loader/patch',
        '../app'
    ],
    output: {
        path: '/',
        filename: 'bundle.js',
        chunkFilename: '[name].[chunkhash:5].js',
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ],
    resolve: {
        extensions: ['.js', '.jsx', '.scss'],
        alias: {
            'atfcapi': path.resolve(__dirname, '../app/components')
        }
    },
    module: {
        rules: [{
                test: /\.(ttf|eot|svg|woff|woff2)(\?.+)?$/,
                loader: 'file-loader',
            },
            {
                test: /\.(jpe?g|png|gif)(\?.+)?$/,
                loader: 'url?name=[hash:12].[ext]&limit=25000',
            },
            {
                test: /\.(js|jsx)$/,
                loader: 'babel-loader',
                include: path.join(__dirname, '../app'),
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'sass-loader']
            },
        ],
    }
}), {
    publicPath: '/',
    hot: true,
    historyApiFallback: true,
    proxy: {
        // 1. 直接使用webpack提供的http-proxy-middleware, 不方便的地方是：如果要切换后端接口环境，需要重新运行npm start命令
        '/atfcapi/*': {
            target: 'http://atfcapi.alpha.elenet.me',
            changeOrigin: true,
        },
        // 2. 下面的配置是用nginx做反向代理，实际请求地址atfcapidev.elenet.me:8081会转发到相应的后端接口地址，详见 actfapi.conf
        // 可以随时切换环境，缺点是配置项比上面的繁琐
        // '/atfcapi/*': {
        //   target: {
        //   target: {
        //     "host": "atfcapidev.elenet.me",
        //     "protocol": 'http:',
        //     "port": 8081
        //   }
        // }
    }
}).listen(port, 'atfcapidev.elenet.me', error => {
    if (error) {
        throw error;
    }
});