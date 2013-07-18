# Sharknado
_arbitrary data store with an arbitrary name_

Sharknado is a node server with mongoDB that allows for rapid prototyping. Just post to the server and a collection is born.

## What's needed
- node
- mongoDB

## Set up
- Clone Repo
- Install node modules (via npm install)
- Change variables in app.js to configure server
- start server (node app.js)

*Create/Add to a Collection*
Post data to a url (e.g. localhost:1337/collectionName )

*Get from Collection*
_All_ >> Get from URL (e.g. localhost:1337/collectionName)
_Filter_ >> Add parameters (e.g. localhost:1337/collectionName?name=Ryan)
