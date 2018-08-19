const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const webpack = require('webpack')
const cleanWebpackPlugin = require('clean-webpack-plugin')
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    mode: 'production',
    entry: {
        index: __dirname + "/src/index.js",
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
        publicPath: ''
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new cleanWebpackPlugin(['dist']),
        new HtmlWebpackPlugin({
            template: __dirname + "/src/index.html",
            inject: 'body'
        }),
        new ScriptExtHtmlWebpackPlugin({
            //sync: /index/,
            defaultAttribute: 'defer'
        }),
        new CopyWebpackPlugin([{
            from: './data',
            to:'data',
            toType: 'dir'
        }],{})
    ],
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    },
    devServer: {
        contentBase: './src',
        port: 7700,
    }
};