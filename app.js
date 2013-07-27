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
    if(dataArray.length > 1){
      obj[dataArray[0]] = decodeURIComponent(dataArray[1].replace(/\+/, ' '));
    }
  }
  return obj;
};

// add rest functionality
var Rest = function(item){

  var exports = function(req, res){
    var data = '',
        myUrl = url.parse(req.url),
        myCollection = db.get(myUrl.pathname.replace(/\//, '').split('/')[0]),
        query = {},
        empty = true;

    if(myUrl.query){
      query = postParser(myUrl.query);
      empty = false;
    }
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
              docs.status = 'ERROR';
              docs.statusCode = 404;
              docs.message = 'Could not find requested collection.'
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
      case 'PUT':
        req.on('data', function(chunk){
          data += chunk;
        });
        req.on('end', function(){
          data = postParser(data);
          myCollection.find(query, function (err, docs){
            for(var i=0; i < docs.length; i++) {
              for(var key in data) {
                docs[i][key] = data[key];
                myCollection.update({_id: docs[i]._id}, docs[i], function(updateErr, updateDocs){
                  if (updateErr) {
                    res.writeHead(500);
                    return '{status:"ERROR", statusCode: 500, message:"Could not update document"}';
                  }
                  res.end( '{status:"OK",message:"Document(s) updated!"}' );
                });
              }
            }
          });
        });
        break;
      case 'DELETE':
        if(empty) {
          // drop collection
          myCollection.drop(function(data){
            res.end('{status:"OK",message:"Collection Dropped!"}')
          });
        } else {
          return;
          myCollection.remove(query, function (err, docs){
            if (err) {
              res.writeHead(500);
              return '{status:"ERROR", statusCode: 500, message:"Could not delete document"}';
            }
            res.end( '{status:"OK", statusCode: 200, message:"Document deleted!"}' );
          });
        }
        break;
      default:
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
  // get url path split for possible future use
  var pathName = url.parse(req.url).pathname.replace(/^\//, '').split('/');
  // for now, throw a 404 if pathname is more than one level deep
  if(pathName.length > 1) {
    res.writeHead(404);
    res.end('{status:"ERROR", statusCode: 404, message:"Sharknado does not support this pattern yet."}');
  }
  // add request/response to Sharknado object
  if(!paths[pathName[0]]) {
    if(req.method !== 'POST') {
      res.writeHead(404);
      res.end('{status:"ERROR", statusCode: 404, message:"404: collection not found"}');
      return;
    }
    paths[pathName[0]] = new Rest();
  }
  paths[pathName[0]].call(this, req, res);
  // res.end();
}).listen(port, hostName);