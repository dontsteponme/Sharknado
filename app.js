// required variables
var http = require('http')
  , url = require('url')
  , mongoDB = require('mongoDB')
  , monk = require('monk')
  , dbName = 'test'
  , hostName = 'localhost'
  , port = 1337
  , db = monk(hostName + '/' + dbName)
  , paths = {};

// post data parser
var postParser = function(data) {
  var obj = {}
    , dataArray = [];
  // spilt &
  data = data.split('&');
  // iterate through array and build object
  for (var i=0; i < data.length; i++){
    dataArray = data[i].split('=');
    obj[dataArray[0]] = decodeURIComponent(dataArray[1].replace(/\+/, ' '));
  }
  return obj;
};

// add rest functionality
var Rest = function(item){

  var exports = function(req, res){
    var data = '',
        myUrl = url.parse(req.url),
        myCollection = db.get(myUrl.pathname.replace(/\//g, ''));

    switch (req.method) {
      case 'POST':
        // add to collection
        req.on('data', function(chunk) {
            data += chunk;
        });
        // handle request when data is complete
        req.on('end', function() {
          data = postParser(data);
          myCollection.insert(data);
          myCollection.find({}, function (err, docs){
            if(err) {
              docs.status = "ERROR";
              res.end( JSON.stringify(err) );
              return;
            }
            docs.unshift({
              status:"OK",
              timestamp: new Date().getTime()
            });
            res.end( JSON.stringify(docs) );
          });
        });
        break;
      default:
        var query = {};
        if(myUrl.query){
          query = postParser(myUrl.query);
        }
        myCollection.find(query, function (err, docs){
          res.end( JSON.stringify(docs) );
        });
        break;
    }
  };

  return exports;
};

// find the names of the current collections and add them to the path
db.driver.collectionNames(function(e,names){
  var cName;
  for (var i = 0; i < names.length; i++) {
    cName = names[i].name.replace(dbName + '.', '');
    if( !cName.match(/system./) ) {
      paths[cName] = new Rest(db.get(cName));
    }
  }
});

// start server
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  var pathName = url.parse(req.url).pathname.replace(/\//g, '');
  // add request/response to fakePI object
  if(!paths[pathName]) {
    if(req.method !== 'POST') {
      res.end('{status:"ERROR",message:"404: collection not found"}')
    }
    paths[pathName] = new Rest();
  }
  paths[pathName].call(this, req, res);
  // res.end();
}).listen(port, hostName);