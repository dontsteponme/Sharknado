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

## Usage
**Create to a Collection**<br>
POST data to a url (e.g. localhost:1337/collectionName )

**Read from Collection**<br>
_All_ >> Get from URL (e.g. localhost:1337/collectionName)<br>
_Filter_ >> Add key/value parameters (e.g. localhost:1337/collectionName?name=Ryan)

**Update a Document**<br>
PUT data to filtered url (e.g. localhost:1337/collectionName?name=Ryan)<br>
_NOTE:_ If more than one document matches filter, each will be updated (feature?)

**Delete**<br>
A document: DELETE to filtered url (e.g. localhost:1337/collectionName?name=Ryan)<br>
_NOTE:_ If more than one document matches filter, each will be deleted (feature?)

A collection: Delete to url (e.g. localhost:1337/collectionName)<br>
_NOTE:_ Poof! Your collection is gone very easily, so be careful
