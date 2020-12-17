# Fastify-fs-route
---
## What is this? 
This plugin will help you add routes and validation schemes to these routes

## Installation 
`npm i fastify-fs-route`

### How to connect
```
const fastify = require("fastify")()

fastify.register(require("fastify-fs-route")("./routes","./schemas",true|false))
//The first parameter is the path to routes
//The second parameter is the path to schemas
//The third parameter is responsible for whether folders in the directory with routes will be used as a prefix to your paths. 
//Example, in the "routes/api/something.js" "your link will look like "/api/something", if set to false the link will look like /something

fastify.listen(3000)
```

## Example of adding a route and schemas

Create a js file in the folders with your routes.

> ***`IMPORTANT` if you want to connect the validation scheme to your route you need to create a json file and name it the same as your route and it should be located in the folder with the same name as in the routes***
---
routes/api/user.js
schemas/api/user.json
---
Adding a route
Our route - "routes/user.js"
```
function findUser(request,reply){
    //you're code
}
//To add a route you need to export it by specifying the request method and your function
module.exports = {
    post: findUser,
    //or array
    //In the array, you can pass parameters such as {prefix: "/foo", params:"/: id"} you also add your own validation scheme or event handlers such as onRequest        (request,reply,done) be sure to call the done function.
You can see more handlers in the official fastify documentation 
    //See the example below
    post: [
    //all options in curly brackets are optional
    {prefix:"/foo",params:"/:id",onRequest:(req,rep,done)=>{
    console.log("request") 
    done()},
    schema:{body:{type:'object', properties:{email:{type:'string'}}}},
    findUser
    ],
    get:[{},findUser] //working
}
```
Adding a schema
For each route method, you can do validation
Be sure to specify the method that you use for the route, otherwise the route will not be validated
Our schema - "schemas/user.json"
```
{
  "post": {
    "schema": {
      "body": {
        "type": "object",
        "required": ["email"],
        "properties": {
          "email": {
            "type": "string"
          }
        }
      }
    }
  },
  "get":{
    "schema":{
      "querystring":{
        "type":"object",
        "properties":{
          "name":{
            "type":"string"
          }
        }
      }
    }
  }
}
}

```
