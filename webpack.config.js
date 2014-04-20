module.exports = {
    context: __dirname
  , entry: {
        scripts: [
            "./public/scripts/app"
        ]
      , stylesheets: [
            "./public/stylesheets/app.styl"
          , "./node_modules/leaflet/dist/leaflet.css"
          , "./public/stylesheets/angular-carousel.css"
        ]
    } 
  , output: {
        path: __dirname + "/public/scripts"
      , filename: "[name].bundle.js"
    }
  , module: {
      loaders: [
          {
              test: /\.styl$/
            , loader: 'style-loader!css-loader!stylus-loader'
          }
        , {
              test: /\.css$/
            , loader: 'style-loader!css-loader'
          }
        , {
              test: /\.png/
            , loader: 'url-loader?limit=100000&mimetype=image/png'
          }
      ]
    }
};
