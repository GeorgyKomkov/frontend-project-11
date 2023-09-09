import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import path from 'path';

export default {
  mode: process.env.NODE_ENV || 'development',
  entry: path.resolve(process.cwd(), './src/index.js'),
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(process.cwd(), './public/'),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(process.cwd(), './index.html'),
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(scss)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [new CssMinimizerPlugin(), new TerserPlugin()],
  },
};
