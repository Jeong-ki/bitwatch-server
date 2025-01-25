import webpackNodeExternals from 'webpack-node-externals';
import path from 'path';
import 'dotenv/config';

export default {
  mode: process.env.NODE_ENV || 'development',
  target: 'node',
  entry: './src/index.ts',
  watch: process.env.NODE_ENV === 'development',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.json'],
    alias: {
      src: path.resolve(__dirname, 'src/'),
    },
  },
  externals: [webpackNodeExternals()],
};
