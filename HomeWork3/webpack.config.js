var path = require("path");
var webpack = require("webpack");
var PrettierPlugin = require("prettier-webpack-plugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    mode:'development',
    entry: "./src/index.js",
    output: {
    path: path.resolve(__dirname, "dist")
    },
    devtool: "source-map",
    module: {
      rules: [
        { test: /\.js$/,
          exclude: /node_modules/,
          loader: "babel-loader" 
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        }
      ]
    },
    devServer:{
      contentBase: "./dist",
      hot: true
    }
    ,
    plugins:[
      new HtmlWebpackPlugin({
        template: "./src/index.html"
      }),
      new PrettierPlugin(),
      new webpack.HotModuleReplacementPlugin({})
    ]
  };