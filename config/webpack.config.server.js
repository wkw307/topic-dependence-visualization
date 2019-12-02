// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, '../server/index.ts'),
  devtool: 'inline-source-map',
  target: "node",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.ts', '.tsx', '.js' ],
  },
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, '../module'),
    libraryTarget: "umd",
    library: 'server',
  }
};