var api_v1   = require('./routes/api_v1')
  , http     = require('http')
  //, io       = require('socket.io')
  , koa      = require('koa')
  , logger   = require('koa-logger')
  , os       = require('os')
  , route    = require('koa-route')
  , serve    = require('koa-static')
  , stylus   = require('koa-stylus')
  , routes   = require('./routes')
  , util     = require('util')
  ;

// Get environment
var env = process.env.NODE_ENV || 'development';

// Create koa app
var app = koa();

// middleware
app.use(logger());
app.use(stylus(__dirname + '/public'));
app.use(serve(__dirname + '/public'));

// Route middleware
app.use(route.get('/', routes.index));
app.use(route.get('/entry/:name', routes.entry));
app.use(route.get('/entry/by-id/:id', routes.entry_by_id));
app.use(route.get('/api/v1/entry/:name', api_v1.entry));
app.use(route.get('/api/v1/entry/by-id/:id', api_v1.entry_by_id));
app.use(route.get('/api/v1/search', api_v1.search));

// Get host and port
switch(env) {
  case 'production':
    global.port = 80;
    global.host = 'vegan-society.net';
    break;
  default:
    global.port = 3000;
    // For development environments, use IP address of localhost
    var interfaces = os.networkInterfaces();
    for (var prop in interfaces) {
      for (var i=0; i<interfaces[prop].length; i++) {
        if (interfaces[prop][i].internal === false && interfaces[prop][i].family === 'IPv4') {
          global.host = util.format('%s:%d', interfaces[prop][i].address, global.port);
        }
      }
    }
    break;
}

// Create HTTP Server
http.createServer(app.callback()).listen(global.port);
console.log(util.format('Server listening on port %s', global.port));
