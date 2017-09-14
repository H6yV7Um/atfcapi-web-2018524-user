var webpack=require("webpack");
var HtmlWebpackPlugin=require("html-webpack-plugin");
module.exports={
    entry:__dirname+"/src/main.js",
    output:{
        path:__dirname+"/dist",
        filename:"[name].js"
    },
    module:{
        rules:[{
            test:/\.js$/,
            loader:"babel-loader"
        },
        {
            test:/\.vue$/,
            loader:"vue-loader"
        },
        {
            test:/\.css$/,
            use:["style-loader","css-loader"]
        },
        // {
        //     test:/\.html$/,
        //     loader:"html-loader"
        // },
        {
            test:/\.png | .jpg$/,
            loader:"url-loader"
        }
        ]
    },
    resolve:{
        alias:{
            "vue":"vue/dist/vue.js"
        }
    },
    devServer:{
        port:8088,
        host:"127.0.0.1",
        hot:true,
        compress: true,
        watchContentBase: true
        //contentBase:__dirname + 'dist'
    },
    plugins:[
        // new webpack.optimize.UglifyJsPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            template:"./index.html"
        })
    ]
}