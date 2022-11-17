## Fullstack Open Course — Part 3

### a) Node.js and Express

* NodeJS is a JavaScript runtime based on Google's Chrome V8 JavaScript engine.

* npm (i.e. node package manager) is a tool used for managing JavaScript packages. In fact, npm originates from the Node ecosystem.

* Use the command `npm init` to initiate a project that will automatically generate a _package.json_ file at the root of the project. The file contains information about the project.

* Within the package.json file we can modify the _scripts_ object from

  ```json
  {
    "name": "backend",
    "version": "0.0.1",
    "description": "",
    "main": "index.js",
    "scripts": {
      "test": "echo \"Error: no test specified\" && exit 1"
    },
    "author": "Matti Luukkainen",
    "license": "MIT"
  }
  ```

  to include a "start" script:

  ```json
  {
    // ...
    "scripts": {
      "start": "node index.js",
      "test": "echo \"Error: no test specified\" && exit 1"
    },
    // ...
  }
  ```

* We then create an _index.js_ file to the root of the project and add the following code to that file:

  ```javascript
  console.log('hello world');
  ```

* We can run the program directly with Node from the command line:

  ```
  node index.js
  ```

* Or we can run it as an npm script:

  ```
  npm start
  ```

* The _start npm_ script works because we defined it in the _package.json_ file.

* Even though the execution of the project works when it is started by calling `node index.js` from the command line, it's customary for npm projects to execute such tasks as npm scripts.

#### Simple web server

* Let's change the application into a web server by editing the `index.js` files as follow:

  ```javascript
  const http = require('http')
  
  const app = http.createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' })
    response.end('Hello World')
  })
  
  const PORT = 3001
  app.listen(PORT)
  console.log(`Server running on port ${PORT}`)
  ```

* Let's take a closer look at the first line of the code:

  ```javascript
  const http = require('http')
  ```

  In the first row, the application imports Node's built-in web server module. This is practically what we have already been doing in our browser-side code, but with a slightly different syntax:

  ```javascript
  import http from 'http'
  ```

  These days, code that runs in the browser uses ES6 modules. Modules are defined with an export and taken into use with an import.

  However, Node.js uses so-called CommonJS modules. The reason for this is that the Node ecosystem had a need for modules long before JavaScript supported them in the language specification. Node supports now also the use of ES6 modules, but since the support is yet not quite perfect we'll stick to CommonJS modules.

  CommonJS modules function almost exactly like ES6 modules, at least as far as our needs in this course are concerned.  

* The next chunk in our code looks like this:

  ```javascript
  const app = http.createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' })
    response.end('Hello World')
  })
  ```

  The code uses the `createServer` method of the http module to create a new web server. An _event handler_ is registered to the server that is called _every time_ an HTTP request is made to the server's address http://localhost:3001.  

  The request is responded to with the status code 200, with the _Content-Type_ header set to _text/plain_, and the content of the site to be returned set to _Hello World_.  

* The last rows bind the http server assigned to the `app` variable, to listen to HTTP requests sent to the port 3001:

  ```javascript
  const PORT = 3001
  app.listen(PORT)
  console.log(`Server running on port ${PORT}`)
  ```

* The primary purpose of the backend server in this course is to offer raw data in the JSON format to the frontend. For this reason, let's immediately change our server to return a hardcoded list of notes in the JSON format:

  ```javascript
  const http = require('http')
  
  let notes = [
    {
      id: 1,
      content: "HTML is easy",
      date: "2022-05-30T17:30:31.098Z",
      important: true
    },
    {
      id: 2,
      content: "Browser can execute only Javascript",
      date: "2022-05-30T18:39:34.091Z",
      important: false
    },
    {
      id: 3,
      content: "GET and POST are the most important methods of HTTP protocol",
      date: "2022-05-30T19:20:14.298Z",
      important: true
    }
  ]
  const app = http.createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify(notes))
  })
  
  const PORT = 3001
  app.listen(PORT)
  console.log(`Server running on port ${PORT}`)
  ```

  The _application/json_ value in the _Content-Type_ header informs the receiver that the data is in the JSON format. The `notes` array gets transformed into JSON with the `JSON.stringify(notes)` method.  

  When we open the browser, the displayed format is exactly the same as in part 2 where we used json-server to serve the list of notes:

  ![fullstack content](https://fullstackopen.com/static/33c3c629d8c3719de79f177cd03d7a71/5a190/2e.png)

#### Express

* Implementing our server code directly with Node's built-in http web server is possible. However, it is cumbersome, especially once the application grows in size.

* Many libraries have been developed to ease server side development with Node, by offering a more pleasing interface to work with the built-in http module. These libraries aim to provide a better abstraction for general use cases we usually require to build a backend server. By far the most popular library intended for this purpose is express. 

* Let's take express into use by defining it as a project dependency with the command:

  ```
  npm install express
  ```

* The dependency is also added to our _package.json_ file:

  ```json
  {
    // ...
    "dependencies": {
      "express": "^4.17.2"
    }
  }
  ```

  The source code for the dependency is installed to the _node_modules_ directory located in the root of the project. In addition to express, you can find a great amount of other dependencies in the directory:

  ![fullstack content](https://fullstackopen.com/static/da4cca859c66e0bf7d064455a105ad49/5a190/4.png)

* These are in fact dependencies of the express library, and the dependencies of all of its dependencies, and so forth. These are called the transitive dependencies of our project.

* What does the caret in front of the version number in _package.json_ mean?

  ```json
  "express": "^4.17.2"
  ```

  The versioning model used in npm is called semantic versioning.  

  The caret in the front of _^4.17.2_ means that if and when the dependencies of a project are updated, the version of express that is installed will be at least _4.17.2_. However, the installed version of express can also be one that has a larger _patch_ number (the last number), or a larger _minor_ number (the middle number). The major version of the library indicated by the first _major_ number must be the same.

* We can update the dependencies of the project with the command:

  ```
  npm update
  ```

* Likewise, if we start working on the project on another computer, we can install all up-to-date dependencies of the project defined in _package.json_ with running the below command in the project's root directory:

  ```
  npm install
  ```

* If the _major_ number of a dependency does not change, then the newer versions should be backwards compatible. This means that if our application happened to use version 4.99.175 of express in the future, then all the code implemented in this part would still have to work without making changes to the code. In contrast, the future 5.0.0. version of express may contain changes that would cause our application to no longer work.

#### Web and express

* Let's get back to our application and make the following changes:

  ```javascript
  const express = require('express')
  const app = express()
  
  let notes = [
    ...
  ]
  
  app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
  })
  
  app.get('/api/notes', (request, response) => {
    response.json(notes)
  })
  
  const PORT = 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
  ```

* The application did not change a whole lot. Right at the beginning of our code we're importing `express`, which this time is a _function_ that is used to create an express application stored in the `app` variable:

  ```javascript
  const express = require('express');
  const app = express();
  ```

* Next, we define two _routes_ to the application. The first one defines an event handler that is used to handle HTTP GET requests made to the application's / root:

  ```javascript
  app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>');
  });
  ```

* The event handler function accepts two parameters. The first request parameter contains all of the information of the HTTP request, and the second response parameter is used to define how the request is responded to.

* In our code, the request is answered by using the send method of the `response` object. Calling the method makes the server respond to the HTTP request by sending a response containing the string `<h1>Hello World!</h1>` that was passed to the `send` method. Since the parameter is a string, express automatically sets the value of the _Content-Type_ header to be _text/html_. The status code of the response defaults to 200.  

* The second route defines an event handler that handles HTTP GET requests to the _notes_ path of the application:

  ```javascript
  app.get('/api/notes', (request, response) => {
    response.json(notes);
  });
  ```

  The request is responded to with the json method of the `response` object. Calling the method will send the notes array that was passed to it as a JSON formatted string. Express automatically sets the _Content-Type_ header with the appropriate value of _application/json_.

* It's worth noting that JSON is a string, and not a JavaScript object like the value assigned to `notes`.

#### nodemon

* If we make changes to the application's code we have to restart the application in order to see the changes. We restart the application by first shutting it down by typing `Ctrl+C` and then restarting the application. Compared to the convenient workflow in React where the browser automatically reloaded after changes were made, this feels slightly cumbersome.

* The solution to this problem is nodemon:

  _nodemon will watch the files in the directory in which nodemon was started, and if any files change, nodemon will automatically restart your node application._

* Let's install nodemon by defining it as a _development dependency_ with the command:

  ```
  npm install --save-dev nodemon
  ```

* By development dependencies, we are referring to tools that are needed only during the development of the application, e.g. for testing or automatically restarting the application, like _nodemon_.

* These development dependencies are not needed when the application is run in production mode on the production server (e.g. Heroku).

* We can start our application with _nodemon_ like this:

  ```
  node_modules/.bin/nodemon index.js
  ```

* Changes to the application code now cause the server to restart automatically. It's worth noting that even though the backend server restarts automatically, the browser still has to be manually refreshed.

* The command is long and quite unpleasant, so let's define a dedicated _npm script_ for it in the _package.json_ file:

  ```javascript
  {
    // ..
    "scripts": {
      "start": "node index.js",
      "dev": "nodemon index.js",
      "test": "echo \"Error: no test specified\" && exit 1"
    },
    // ..
  }
  ```

  In the script there is no need to specify the _node_modules/.bin/nodemon_ path to nodemon, because `npm` automatically knows to search for the file from that directory.

* We can now start the server in the development mode with the command:

  ```
  npm run dev
  ```

  Unlike with the _start_ and _test_ scripts, we also have to add _run_ to the command.

#### REST

* Representational State Transfer, aka REST, was introduced in 2000 in Roy Fielding's dissertation. REST is an architectural style meant for building scalable web applications.  

* We are not going to dig into Fielding's definition of REST or spend time pondering about what is and isn't RESTful. Instead, we take a more [narrow view](https://en.wikipedia.org/wiki/Representational_state_transfer#Applied_to_web_services) by only concerning ourselves with how RESTful APIs are typically understood in web applications. The original definition of REST is in fact not even limited to web applications.

* We mentioned in the [previous part](https://fullstackopen.com/en/part2/altering_data_in_server#rest) that singular things, like notes in the case of our application, are called *resources* in RESTful thinking. Every resource has an associated URL which is the resource's unique address.

* One convention is to create the unique address for resources by combining the name of the resource type with the resource's unique identifier.

* Let's assume that the root URL of our service is *www.example.com/api*.

* If we define the resource type of note to be *notes*, then the address of a note resource with the identifier 10, has the unique address *www.example.com/api/notes/10*.

* The URL for the entire collection of all note resources is *www.example.com/api/notes*.

* We can execute different operations on resources. The operation to be executed is defined by the HTTP *verb*:

  | URL      | verb   | functionality                                                |
  | :------- | :----- | :----------------------------------------------------------- |
  | notes/10 | GET    | fetches a single resource                                    |
  | notes    | GET    | fetches all resources in the collection                      |
  | notes    | POST   | creates a new resource based on the request data             |
  | notes/10 | DELETE | removes the identified resource                              |
  | notes/10 | PUT    | replaces the entire identified resource with the request data |
  | notes/10 | PATCH  | replaces a part of the identified resource with the request data |

* This is how we manage to roughly define what REST refers to as a [uniform interface](https://en.wikipedia.org/wiki/Representational_state_transfer#Architectural_constraints), which means a consistent way of defining interfaces that makes it possible for systems to co-operate.
* This way of interpreting REST falls under the [second level of RESTful maturity](https://martinfowler.com/articles/richardsonMaturityModel.html) in the Richardson Maturity Model. According to the definition provided by Roy Fielding, we have not actually defined a [REST API](http://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven). In fact, a large majority of the world's purported "REST" APIs do not meet Fielding's original criteria outlined in his dissertation.
* In some places (see e.g. [Richardson, Ruby: RESTful Web Services](http://shop.oreilly.com/product/9780596529260.do)) you will see our model for a straightforward [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) API, being referred to as an example of [resource oriented architecture](https://en.wikipedia.org/wiki/Resource-oriented_architecture) instead of REST. We will avoid getting stuck arguing semantics and instead return to working on our application.

#### Fetching a single resource

* Let's expand our application so that it offers a REST interface for operating on individual notes. First let's create a [route](http://expressjs.com/en/guide/routing.html) for fetching a single resource.

* The unique address we will use for an individual note is of the form *notes/10*, where the number at the end refers to the note's unique id number.

* We can define [parameters](http://expressjs.com/en/guide/routing.html#route-parameters) for routes in express by using the colon syntax:

  ```javascript
  app.get('/api/notes/:id', (request, response) => {
    const id = request.params.id
    const note = notes.find(note => note.id === id)
    response.json(note)
  })
  ```

  Now `app.get('/api/notes/:id', ...)`will handle all HTTP GET requests that are of the form */api/notes/SOMETHING*, where *SOMETHING* is an arbitrary string.

* The *id* parameter in the route of a request, can be accessed through the [request](http://expressjs.com/en/api.html#req) object:

  ```javascript
  const id = request.params.id;
  ```

* The now familiar *find* method of arrays is used to find the note with an id that matches the parameter. The note is then returned to the sender of the request.

* When we test our application by going to http://localhost:3001/api/notes/1 in our browser, we notice that it does not appear to work, as the browser displays an empty page.

* After using `console.log` to debug the problem, the cause of the bug becomes clear. The *id* variable contains a string '1', whereas the ids of notes are integers. In JavaScript, the "triple equals" comparison === considers all values of different types to not be equal by default, meaning that 1 is not '1'.

* Let's fix the issue by changing the id parameter from a string into a number:

  ```javascript
  app.get('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    const note = notes.find(note => note.id === id)
    response.json(note)
  })
  ```

* Now fetching an individual resource works.

  ![fullstack content](https://fullstackopen.com/static/f44de7adb5426baa10d552837073aa5c/5a190/9ea.png)

* However, there's another problem with our application.

* If we search for a note with an id that does not exist, the server responds with:

  ![fullstack content](https://fullstackopen.com/static/71dba69685a59c3d5249303257863366/5a190/10ea.png)

* The HTTP status code that is returned is 200, which means that the response succeeded. There is no data sent back with the response, since the value of the *content-length* header is 0, and the same can be verified from the browser.

* The reason for this behavior is that the *note* variable is set to *undefined* if no matching note is found. The situation needs to be handled on the server in a better way. If no note is found, the server should respond with the status code [404 not found](https://www.rfc-editor.org/rfc/rfc9110.html#name-404-not-found) instead of 200.

* Let's make the following change to our code:

  ```java
  app.get('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    const note = notes.find(note => note.id === id)
    
    if (note) {
      response.json(note)
    } else {
      response.status(404).end()
    }
  })

* Since no data is attached to the response, we use the [status](http://expressjs.com/en/4x/api.html#res.status) method for setting the status, and the [end](http://expressjs.com/en/4x/api.html#res.end) method for responding to the request without sending any data.

#### Deleting resources

* Next let's implement a route for deleting resources. Deletion happens by making an HTTP DELETE request to the url of the resource:

  ```javascript
  app.delete('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    notes = notes.filter(note => note.id !== id)
  
    response.status(204).end()
  })
  ```

* If deleting the resource is successful, meaning that the note exists and it is removed, we respond to the request with the status code [204 no content](https://www.rfc-editor.org/rfc/rfc9110.html#name-204-no-content) and return no data with the response.
* There's no consensus on what status code should be returned to a DELETE request if the resource does not exist. Really, the only two options are 204 and 404. For the sake of simplicity our application will respond with 204 in both cases.

#### Postman

* So how do we test the delete operation? HTTP GET requests are easy to make from the browser. We could write some JavaScript for testing deletion, but writing test code is not always the best solution in every situation.
* Many tools exist for making the testing of backends easier. One of these is a command line program [curl](https://curl.haxx.se/). However, instead of curl, we will take a look at using [Postman](https://www.postman.com/) for testing the application.

#### Receiving data

* Next, let's make it possible to add new notes to the server. Adding a note happens by making an HTTP POST request to the address http://localhost:3001/api/notes, and by sending all the information for the new note in the request [body](https://www.w3.org/Protocols/rfc2616/rfc2616-sec7.html#sec7) in the JSON format.

* In order to access the data easily, we need the help of the express [json-parser](https://expressjs.com/en/api.html) that is taken to use with command *app.use(express.json())*.

* Let's activate the json-parser and implement an initial handler for dealing with the HTTP POST requests:

  ```javascript
  const express = require('express')
  const app = express()
  
  app.use(express.json())
  
  //...
  
  app.post('/api/notes', (request, response) => {
    const note = request.body
    console.log(note)
    response.json(note)
  })
  ```

* The event handler function can access the data from the _body_ property of the `request` object.

* Without the json-parser, the _body_ property would be undefined. The json-parser functions so that it takes the JSON data of a request, transforms it into a JavaScript object and then attaches it to the _body_ property of the `request` object before the route handler is called.  

* For the time being, the application does not do anything with the received data besides printing it to the console and sending it back in the response.

* Before we implement the rest of the application logic, let's verify with Postman that the data is actually received by the server. In addition to defining the URL and request type in Postman, we also have to define the data sent in the *body*:

  ![fullstack content](https://fullstackopen.com/static/c34207e9d243ac3b534678fc397f61ea/5a190/14x.png)

*  Once we know that the application receives data correctly, it's time to finalize the handling of the request:

  ```javascript
  app.post('/api/notes', (request, response) => {
    const maxId = notes.length > 0
      ? Math.max(...notes.map(n => n.id)) 
      : 0
  
    const note = request.body
    note.id = maxId + 1
  
    notes = notes.concat(note)
  
    response.json(note)
  })
  ```

* We need a unique id for the note. First, we find out the largest id number in the current list and assign it to the `maxId` variable. The id of the new note is then defined as `maxId + 1`. This method is in fact not recommended, but we will live with it for now as we will replace it soon enough.

* The current version still has the problem that the HTTP POST request can be used to add objects with arbitrary properties. Let's improve the application by defining that the *content* property may not be empty. The *important* and *date* properties will be given default values. All other properties are discarded:

  ```javascript
  const generateId = () => {
    const maxId = notes.length > 0
      ? Math.max(...notes.map(n => n.id))
      : 0
    return maxId + 1
  }
  
  app.post('/api/notes', (request, response) => {
    const body = request.body
  
    if (!body.content) {
      return response.status(400).json({ 
        error: 'content missing' 
      })
    }
  
    const note = {
      content: body.content,
      important: body.important || false,
      date: new Date(),
      id: generateId(),
    }
  
    notes = notes.concat(note)
  
    response.json(note)
  })
  ```

* The logic for generating the new id number for notes has been extracted into a separate *generateId* function.

* If the received data is missing a value for the *content* property, the server will respond to the request with the status code [400 bad request](https://www.rfc-editor.org/rfc/rfc9110.html#name-400-bad-request):

  ```javascript
  if (!body.content) {
    return response.status(400).json({ 
      error: 'content missing' 
    })
  }
  ```

* Notice that calling return is crucial, because otherwise the code will execute to the very end and the malformed note gets saved to the application.

* If the content property has a value, the note will be based on the received data. As mentioned previously, it is better to generate timestamps on the server than in the browser, since we can't trust that host machine running the browser has its clock set correctly. The generation of the *date* property is now done by the server.

* If the *important* property is missing, we will default the value to *false*. The default value is currently generated in a rather odd-looking way:

  ```javascript
  important: body.important || false,
  ```

#### About HTTP request types

* The HTTP standard talks about two properties related to request types, safety and idempotence.

* The HTTP GET request should be _safe_:

  _In particular, the convention has been established that the GET and HEAD methods SHOULD NOT have the significance of taking an action other than retrieval. These methods ought to be considered "safe"._

* Safety means that the executing request must not cause any _side effects_ in the server. By side-effects we mean that the state of the database must not change as a result of the request, and the response must only return data that already exists on the server.

* Nothing can ever guarantee that a GET request is actually _safe_, this is in fact just a recommendation that is defined in the HTTP standard. By adhering to RESTful principles in our API, GET requests are in fact always used in a way that they are _safe_.

* All HTTP requests except POST should be _idempotent_:

  _Methods can also have the property of "idempotence" in that (aside from error or expiration issues) the side-effects of N > 0 identical requests is the same as for a single request. The methods GET, HEAD, PUT and DELETE share this property._

* This means that if a request does not generate side-effects, then the result should be the same regardless of how many times the request is sent.  

* If we make an HTTP PUT request to the url _/api/notes/10_ and with the request we send the data `{ content: "no side effects!", important true }`, the result is the same regardless of how many times the request is sent.

* Like _safety_ for the GET request, _idempotence_ is also just a recommendation in the HTTP standard and not something that can be guaranteed simply based on the request type. However, when our API adheres to RESTful principles, then GET, HEAD, PUT, and DELETE requests are used in such a way that they are idempotent.  

* POST is the only HTTP request that is neither _safe_ nor _idempotent_. If we send 5 different HTTP POST requests to _/api/notes_ with a body of `{content: "many same", important: true}`, the resulting 5 notes on the server will all have the same content.

#### Middleware

* The express json-parser we took into use earlier is a so-called middleware.

* Middleware are functions that can be used for handling `request` and `response` objects.

* The json-parser we used earlier takes the raw data from the requests that's stored in the `request` object, parses it into a JavaScript object and assigns it to the `request` object as a new property _body_.

* In practice, you can use several middleware at the same time. When you have more than one, they're executed one by one in the order that they were taken into use in express.

* Let's implement our own middleware that prints information about every request that is sent to the server.

* Middleware is a function that receives three parameters:

  ```javascript
  const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
  }
  ```

* At the end of the function body the *next* function that was passed as a parameter is called. The *next* function yields control to the next middleware.

* Middleware are taken into use like this:

  ```
  app.use(requestLogger)
  ```

* Middleware functions are called in the order that they're taken into use with the express server object's *use* method. Notice that json-parser is taken into use before the *requestLogger* middleware, because otherwise *request.body* will not be initialized when the logger is executed!

* Middleware functions have to be taken into use before routes if we want them to be executed before the route event handlers are called. There are also situations where we want to define middleware functions after routes. In practice, this means that we are defining middleware functions that are only called if no route handles the HTTP request.

---

### b) Deploying app to internet

* Next let's connect the frontend we made in [part 2](https://fullstackopen.com/en/part2) to our own backend.

* In the previous part, the frontend could ask for the list of notes from the json-server we had as a backend, from the address http://localhost:3001/notes. Our backend has a slightly different url structure now, as the notes can be found at http://localhost:3001/api/notes. Let's change the attribute **baseUrl** in the *src/services/notes.js* like so:

  ```javascript
  import axios from 'axios'
  const baseUrl = 'http://localhost:3001/api/notes'
  
  const getAll = () => {
    const request = axios.get(baseUrl)
    return request.then(response => response.data)
  }
  
  // ...
  
  export default { getAll, create, update }
  ```

* Now frontend's GET request to http://localhost:3001/api/notes does not work for some reason:

  ![fullstack content](https://fullstackopen.com/static/da88e17cb078c89a6e7ba30d61fab0e6/5a190/3ae.png)

* What's going on here? We can access the backend from a browser and from postman without any problems.

#### Same origin policy and CORS

* The issue lies with a thing called CORS, or Cross-Origin Resource Sharing.

* According to Wikipedia:

  _Cross-origin resource sharing (CORS) is a mechanism that allows restricted resources (e.g. fonts) on a web page to be requested from another domain outside the domain from which the first resource was served. A web page may freely embed cross-origin images, stylesheets, scripts, frames, and videos. Certain "cross-domain" requests, notably Ajax requests, are forbidden by default by the same-origin security policy_

* In our context the problem is that, by default, the JavaScript code of an application that runs in a browser can only communicate with a server in the same origin. Because our server is in localhost port 3001, and our frontend in localhost port 3000, they do not have the same origin.

* Keep in mind, that same origin policy and CORS are not specific to React or Node. They are in fact universal principles of the operation of web applications.

* We can allow requests from other _origins_ by using Node's cors middleware.

* In your backend repository, install _cors_ with the command

  ```
  npm install cors
  ```

* take the middleware to use and allow for requests from all origins:

  ```javascript
  const cors = require('cors');
  
  app.use(cors);
  ```

* And the frontend works! However, the functionality for changing the importance of notes has not yet been implemented to the backend.

* The setup of our app looks now as follows:

  ![fullstack content](https://fullstackopen.com/static/2aa09f5e7969cf4ec229aceb70abfa26/664c8/100.png)

#### Application to the Internet

* Now that the whole stack is ready, let's move our application to the internet.

* For both Fly.io and Heroku, we need to change the definition of the port our application uses at the bottom of the *index.js* file like so:

  ```javascript
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
  ```

* Now we are using the port defined in the [environment variable](https://en.wikipedia.org/wiki/Environment_variable) *PORT* or port 3001 if the environment variable *PORT* is undefined. Fly.io and Heroku configure the application port based on that environment variable.

##### Fly.io

* Start by [authenticating](https://fly.io/docs/hands-on/sign-in/) via command line with the command:

  ```
  fly auth login
  ```

* Initializing an app happens by running the following command in the root directory of the app:

  ```
  fly launch
  ```

  Give the app a name or let Fly.io auto generate one. Pick a region where the app will be run. Do not create a postgress database for the app since it is not needed.  

  The last question is "Would you like to deploy now?", answer yes and your app is also deployed to the Fly.io servers.

* If all goes well, the app should now be up and running. You can open it in the browser with the command

  ```
  fly open
  ```

* After the initial setup, when the app code has been updated, it can be deployed to production with the command:

  ```
  fly deploy
  ```

* A particularly important command is `fly logs` that can be used to view server logs. It is best to keep logs always visible!

* Fly.io creates a file *fly.toml* in the root of your app. The file contains all the configuration of your server. On this course we can mostly ignore the contents of the file.

#### Frontend production build

* So far we have been running React code in *development mode*. In development mode the application is configured to give clear error messages, immediately render code changes to the browser, and so on.

* When the application is deployed, we must create a [production build](https://reactjs.org/docs/optimizing-performance.html#use-the-production-build) or a version of the application which is optimized for production.

* A production build of applications created with *create-react-app* can be created with command [npm run build](https://github.com/facebookincubator/create-react-app#npm-run-build-or-yarn-build).

* **NOTE:** at the time of writing (20th January 2022) create-react-app had a bug that causes the following error *TypeError: MiniCssExtractPlugin is not a constructor*

* A possible fix is found from [here](https://github.com/facebook/create-react-app/issues/11930). Add the following to the file *package.json*

  ```json
  {
    // ...
    "resolutions": {
      "mini-css-extract-plugin": "2.4.5"
    }
  }
  ```

  and run commands

  ```
  rm -rf package-lock.json
  rm -rf node_modules
  npm cache clean --force
  npm install
  ```

  After these `npm run build` should work.

* Let's run this command from the *root of the frontend project*.

* This creates a directory called *build* (which contains the only HTML file of our application, *index.html* ) which contains the directory *static*. [Minified](https://en.wikipedia.org/wiki/Minification_(programming)) version of our application's JavaScript code will be generated to the *static* directory. Even though the application code is in multiple files, all of the JavaScript will be minified into one file. Actually all of the code from all of the application's dependencies will also be minified into this single file.

#### Serving static files from the backend

* One option for deploying the frontend is to copy the production build (the *build* directory) to the root of the backend repository and configure the backend to show the frontend's *main page* (the file *build/index.html*) as its main page.

* To make express show *static content*, the page *index.html* and the JavaScript, etc., it fetches, we need a built-in middleware from express called [static](http://expressjs.com/en/starter/static-files.html).

* When we add the following amidst the declarations of middlewares

  ```
  app.use(express.static('build'))
  ```

  whenever express gets an HTTP GET request it will first check if the *build* directory contains a file corresponding to the request's address. If a correct file is found, express will return it.

* Now HTTP GET requests to the address *www.serversaddress.com/index.html* or *www.serversaddress.com* will show the React frontend. GET requests to the address *www.serversaddress.com/api/notes* will be handled by the backend's code.

* Because of our situation, both the frontend and the backend are at the same address, we can declare *baseUrl* as a [relative](https://www.w3.org/TR/WD-html40-970917/htmlweb.html#h-5.1.2) URL. This means we can leave out the part declaring the server.

  ```javascript
  import axios from 'axios'
  const baseUrl = '/api/notes'
  
  const getAll = () => {
    const request = axios.get(baseUrl)
    return request.then(response => response.data)
  }
  
  // ...
  ```

* After the change, we have to create a new production build and copy it to the root of the backend repository.

* The application can now be used from the *backend* address [http://localhost:3001](http://localhost:3001/):

  ![fullstack content](https://fullstackopen.com/static/f5d8aad803a0a13ea9b29fd705774ec8/5a190/28e.png)

* When we use a browser to go to the address [http://localhost:3001](http://localhost:3001/), the server returns the *index.html* file from the *build* repository. Summarized contents of the file are as follows:

  ```html
  <head>
    <meta charset="utf-8"/>
    <title>React App</title>
    <link href="/static/css/main.f9a47af2.chunk.css" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script src="/static/js/1.578f4ea1.chunk.js"></script>
    <script src="/static/js/main.104ca08d.chunk.js"></script>
  </body>
  </html>
  ```

* The file contains instructions to fetch a CSS stylesheet defining the styles of the application, and two *script* tags which instruct the browser to fetch the JavaScript code of the application - the actual React application.

* The React code fetches notes from the server address http://localhost:3001/api/notes and renders them to the screen.

* The setup that is ready for product deployment looks as follows:

  ![fullstack content](https://fullstackopen.com/static/6f33425b60b49278d57df7e62f81a32c/db910/101.png)

* Unlike when running the app in a development environment, everything is now in the same node/express-backend that runs in localhost:3001. When the browser goes to the page, the file *index.html* is rendered. That causes the browser to fetch the product version of the React app. Once it starts to run, it fetches the json-data from the address localhost:3001/api/notes.

#### The whole app to internet

* After ensuring that the production version of the application works locally, commit the production build of the frontend to the backend repository, and push the code to Heroku again. In the case of Fly.io the new deployment is done with the command

  ```
  fly deploy
  ```

* [The application](https://obscure-harbor-49797.herokuapp.com/) works perfectly, except we haven't added the functionality for changing the importance of a note to the backend yet.

* The setup looks like now as follows:

  ![fullstack content](https://fullstackopen.com/static/26dbec11959a8d1418e81b31e11624d0/5a190/102.png)

* The node/express-backend now resides in the Fly.io/Heroku server. When the root address that is of the form https://glacial-ravine-74819.herokuapp.com/ is accessed, the browser loads and executes the React app that fetches the json-data from the Heroku server.

#### Streamlining deploying of the frontend

* To create a new production build of the frontend without extra manual work, let's add some npm-scripts to the *package.json* of the backend repository.

##### Fly.io

* The script looks like this

  ```javascript
  {
    "scripts": {
      // ...
      "build:ui": "rm -rf build && cd ../part2-notes/ && npm run build && cp -r build ../notes-backend",
      "deploy": "fly deploy",
      "deploy:full": "npm run build:ui && npm run deploy",    
      "logs:prod": "fly logs"
    }
  }
  ```

* The script `npm run build:ui` builds the frontend and copies the production version under the backend repository. `npm run deploy` releases the current backend to Fly.io.

* `npm run deploy:full` combines these two scripts.

* There is also a script `npm run logs:prod` to show the Fly.io logs.

* Note that the directory paths in the script *build:ui* depend on the location of repositories in the file system.

---

### c) Saving data to MongoDB

#### MongoDB

* In order to store our saved notes indefinitely, we need a database. Most of the courses taught at the University of Helsinki use relational databases. In most parts of this course we will use [MongoDB](https://www.mongodb.com/) which is a so-called [document database](https://en.wikipedia.org/wiki/Document-oriented_database).

* Let's not add any code dealing with Mongo to our backend just yet. Instead, let's make a practice application by creating a new file, *mongo.js*:

  ```javascript
  const mongoose = require('mongoose')
  
  if (process.argv.length < 3) {
    console.log('Please provide the password as an argument: node mongo.js <password>')
    process.exit(1)
  }
  
  const password = process.argv[2]
  
  const url = `mongodb+srv://notes-app-full:${password}@cluster1.lvvbt.mongodb.net/?retryWrites=true&w=majority`
  
  const noteSchema = new mongoose.Schema({
    content: String,
    date: Date,
    important: Boolean,
  })
  
  const Note = mongoose.model('Note', noteSchema)
  
  mongoose
    .connect(url)
    .then((result) => {
      console.log('connected')
  
      const note = new Note({
        content: 'HTML is Easy',
        date: new Date(),
        important: true,
      })
  
      return note.save()
    })
    .then(() => {
      console.log('note saved!')
      return mongoose.connection.close()
    })
    .catch((err) => console.log(err))
  ```

* **NB:** Depending on which region you selected when building your cluster, the *MongoDB URI* may be different from the example provided above. You should verify and use the correct URI that was generated from MongoDB Atlas.

* The code also assumes that it will be passed the password from the credentials we created in MongoDB Atlas, as a command line parameter. We can access the command line parameter like this:

  ```javascript
  const password = process.argv[2]
  ```

* When the code is run with the command *node mongo.js password*, Mongo will add a new document to the database.

* Let's destroy the default database *myFirstDatabase* and change the name of database referenced in our connection string to *noteApp* instead, by modifying the URI:

  ```javascript
  mongodb+srv://fullstack:$<password>@cluster0.o1opl.mongodb.net/noteApp?retryWrites=true&w=majority
  ```

#### Schema

* After establishing the connection to the database, we define the [schema](http://mongoosejs.com/docs/guide.html) for a note and the matching [model](http://mongoosejs.com/docs/models.html):

  ```javascript
  const noteSchema = new mongoose.Schema({
    content: String,
    date: Date,
    important: Boolean,
  });
  
  const Note = mongoose.model('Note', noteSchema);
  ```

* First we define the schema of a note that is stored in the `noteSchema` variable. The schema tells Mongoose how the note objects are to be stored in the database.  

* In the `Note` model definition, the first _"Note"_ parameter is the singular name of the model. The name of the collection will be the lowercased plural _notes_, because the Mongoose convention is to automatically name collections as the plural (e.g. _notes_) when the schema refers to them in the singular (e.g. _Note_).

* Document databases like Mongo are *schemaless*, meaning that the database itself does not care about the structure of the data that is stored in the database. It is possible to store documents with completely different fields in the same collection.

* The idea behind Mongoose is that the data stored in the database is given a *schema at the level of the application* that defines the shape of the documents stored in any given collection.

#### Creating and saving objects

* Next, the application creates a new note object with the help of the *Note* [model](http://mongoosejs.com/docs/models.html):

  ```javascript
  const note = new Note({
    content: 'HTML is Easy',
    date: new Date(),
    important: false,
  });
  ```

* Models are so-called *constructor functions* that create new JavaScript objects based on the provided parameters. Since the objects are created with the model's constructor function, they have all the properties of the model, which include methods for saving the object to the database.

* Saving the object to the database happens with the appropriately named *save* method, that can be provided with an event handler with the *then* method:

  ```javascript
  note.save().then(result => {
    console.log('note saved!');
    mongoose.connection.close();
  });
  ```

* When the object is saved to the database, the event handler provided to *then* gets called. The event handler closes the database connection with the command `mongoose.connection.close()`. If the connection is not closed, the program will never finish its execution.

#### Fetching objects from the database

* Let's comment out the code for generating new notes and replace it with the following:

  ```javascript
  Note.find({}).then(result => {
    result.forEach(note => {
      console.log(note);
    });
    mongoose.connection.close();
  })
  ```

* When the code is executed, the program prints all the notes stored in the database:

* The objects are retrieved from the database with the [find](https://mongoosejs.com/docs/api/model.html#model_Model-find) method of the *Note* model. The parameter of the method is an object expressing search conditions. Since the parameter is an empty object`{}`, we get all of the notes stored in the *notes* collection.

* The search conditions adhere to the Mongo search query [syntax](https://docs.mongodb.com/manual/reference/operator/).

* We could restrict our search to only include important notes like this:

  ```javascript
  Note.find({ important: true }).then(result => {
    // ...
  });
  ```

#### Backend connected to a database

* Now we have enough knowledge to start using Mongo in our application.

* Let's get a quick start by copy pasting the Mongoose definitions to the *index.js* file:

  ```javascript
  const mongoose = require('mongoose')
  
  // DO NOT SAVE YOUR PASSWORD TO GITHUB!!
  const url =
    `mongodb+srv://fullstack:<password>@cluster0.o1opl.mongodb.net/noteApp?retryWrites=true&w=majority`
  
  mongoose.connect(url)
  
  const noteSchema = new mongoose.Schema({
    content: String,
    date: Date,
    important: Boolean,
  })
  
  const Note = mongoose.model('Note', noteSchema)
  ```

* Let's change the handler for fetching all notes to the following form:

  ```javascript
  app.get('/api/notes', (request, response) => {
    Note.find({}).then(notes => {
      response.json(notes)
    })
  })
  ```

* The application works almost perfectly. The frontend assumes that every object has a unique id in the *id* field. We also don't want to return the mongo versioning field *__v* to the frontend.

* One way to format the objects returned by Mongoose is to [modify](https://stackoverflow.com/questions/7034848/mongodb-output-id-instead-of-id) the *toJSON* method of the schema, which is used on all instances of the models produced with that schema. Modifying the method works like this:

  ```javascript
  noteSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })
  ```

* Even though the *_id* property of Mongoose objects looks like a string, it is in fact an object. The *toJSON* method we defined transforms it into a string just to be safe. If we didn't make this change, it would cause more harm to us in the future once we start writing tests.

* Let's respond to the HTTP request with a list of objects formatted with the *toJSON* method:

  ```javascript
  app.get('/api/notes', (request, response) => {
    Note.find({}).then(notes => {
      response.json(notes)
    })
  })
  ```

* Now the *notes* variable is assigned to an array of objects returned by Mongo. When the response is sent in the JSON format, the *toJSON* method of each object in the array is called automatically by the [JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) method.

#### Database configuration into its own module

* Before we refactor the rest of the backend to use the database, let's extract the Mongoose specific code into its own module.

* Let's create a new directory for the module called *models*, and add a file called *note.js*:

  ```javascript
  const mongoose = require('mongoose')
  
  const url = process.env.MONGODB_URI
  
  console.log('connecting to', url)
  
  mongoose.connect(url)
    .then(result => {
      console.log('connected to MongoDB')
    })
    .catch((error) => {
      console.log('error connecting to MongoDB:', error.message)
    })
  
  const noteSchema = new mongoose.Schema({
    content: String,
    date: Date,
    important: Boolean,
  })
  
  noteSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })
  
  module.exports = mongoose.model('Note', noteSchema)
  ```

* Defining Node [modules](https://nodejs.org/docs/latest-v8.x/api/modules.html) differs slightly from the way of defining [ES6 modules](https://fullstackopen.com/en/part2/rendering_a_collection_modules#refactoring-modules) in part 2.

* The public interface of the module is defined by setting a value to the *module.exports* variable. We will set the value to be the *Note* model. The other things defined inside of the module, like the variables *mongoose* and *url* will not be accessible or visible to users of the module.

* Importing the module happens by adding the following line to *index.js*:

  ```javascript
  const Note = require('./models/note');
  ```

* This way the *Note* variable will be assigned to the same object that the module defines.

* The way that the connection is made has changed slightly:

  ```javascript
  const url = process.env.MONGODB_URI
  
  console.log('connecting to', url)
  
  mongoose.connect(url)
    .then(result => {
      console.log('connected to MongoDB')
    })
    .catch((error) => {
      console.log('error connecting to MongoDB:', error.message)
    })
  ```

* It's not a good idea to hardcode the address of the database into the code, so instead the address of the database is passed to the application via the *MONGODB_URI* environment variable.

* The method for establishing the connection is now given functions for dealing with a successful and unsuccessful connection attempt. Both functions just log a message to the console about the success status:

  ![fullstack content](https://fullstackopen.com/static/b7b715296b130693831cc719ea8d2f99/5a190/45e.png)

* There are many ways to define the value of an environment variable. One way would be to define it when the application is started:

  ```
  MONGODB_URI=address_here npm run dev
  ```

* A more sophisticated way is to use the [dotenv](https://github.com/motdotla/dotenv#readme) library. You can install the library with the command:

  ```
  npm install dotenv
  ```

* To use the library, we create a *.env* file at the root of the project. The environment variables are defined inside of the file, and it can look like this:

  ```
  MONGODB_URI=mongodb+srv://fullstack:<password>@cluster0.o1opl.mongodb.net/noteApp?retryWrites=true&w=majority
  PORT=3001
  ```

* We also added the hardcoded port of the server into the *PORT* environment variable.

* The _.env_ file should be gitignored right away, since we do not want to publish any confidential information publicly online!

  ![fullstack content](https://fullstackopen.com/static/e12482f21c1bd50aaa9fa2e9a85169f1/5a190/45ae.png)

* The environment variables defined in the *.env* file can be taken into use with the expression `require('dotenv').config()` and you can reference them in your code just like you would reference normal environment variables, with the familiar `process.env.MONGODB_URI` syntax.

* Let's change the *index.js* file in the following way:

  ```javascript
  require('dotenv').config()
  const express = require('express')
  const app = express()
  const Note = require('./models/note')
  
  // ..
  
  const PORT = process.env.PORT
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
  ```

* It's important that *dotenv* gets imported before the *note* model is imported. This ensures that the environment variables from the *.env* file are available globally before the code from the other modules is imported.

* Once the file .env has been gitignored, Heroku does not get the database url from the repository, so you have to set it yourself.

* That can be done through the Heroku dashboard as follows:

  ![fullstack content](https://fullstackopen.com/static/c153a824158cc5268d60867e176771d3/5a190/herokuConfig.png)

* or from the command line with the command:

  ```
  heroku config:set MONGODB_URI='mongodb+srv://fullstack:<password>@cluster0.o1opl.mongodb.net/noteApp?retryWrites=true&w=majority'
  ```

* Because GitHub is not used with Fly.io, also the file .env gets to the Fly.io servers when the app is deployed. Because of this also the env variables defined in the file will be available there.

* However, a [better option](https://community.fly.io/t/clarification-on-environment-variables/6309) is to prevent .env form being copied to Fly.io by creating to the project root the file *.dockerignore*, with the following contents

  ```
  .env
  ```

* and set the env value from the command line with the command:

  ```
  fly secrets set MONGODB_URI='mongodb+srv://fullstack:<password>@cluster0.o1opl.mongodb.net/noteApp?retryWrites=true&w=majority'
  ```

#### Using database in route handlers

* Next, let's change the rest of the backend functionality to use the database.

* Creating a new note is accomplished like this:

  ```javascript
  app.post('/api/notes', (request, response) => {
    const body = request.body
  
    if (body.content === undefined) {
      return response.status(400).json({ error: 'content missing' })
    }
  
    const note = new Note({
      content: body.content,
      important: body.important || false,
      date: new Date(),
    })
  
    note.save().then(savedNote => {
      response.json(savedNote)
    })
  })
  ```

* The note objects are created with the *Note* constructor function. The response is sent inside of the callback function for the *save* operation. This ensures that the response is sent only if the operation succeeded. We will discuss error handling a little bit later.

* The *savedNote* parameter in the callback function is the saved and newly created note. The data sent back in the response is the formatted version created with the *toJSON* method:

  ```
  response.json(savedNote)
  ```

* Using Mongoose's [findById](https://mongoosejs.com/docs/api/model.html#model_Model-findById) method, fetching an individual note gets changed into the following:

  ```javascript
  app.get('/api/notes/:id', (request, response) => {
    Note.findById(request.params.id).then(note => {
      response.json(note)
    })
  })
  ```

#### Verifying frontend and backend integration

#### Error handling

#### Moving error handling into middleware

#### The order of middleware loading

#### Other operations

* Let's add some missing functionality to our application, including deleting and updating an individual note.

* The easiest way to delete a note from the database is with the [findByIdAndRemove](https://mongoosejs.com/docs/api/model.html#model_Model-findByIdAndRemove) method:

  ```javascript
  app.delete('/api/notes/:id', (request, response, next) => {
    Note.findByIdAndRemove(request.params.id)
      .then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
  })
  ```

* In both of the "successful" cases of deleting a resource, the backend responds with the status code *204 no content*. The two different cases are deleting a note that exists, and deleting a note that does not exist in the database. The *result* callback parameter could be used for checking if a resource was actually deleted, and we could use that information for returning different status codes for the two cases if we deemed it necessary. Any exception that occurs is passed onto the error handler.

* The toggling of the importance of a note can be easily accomplished with the [findByIdAndUpdate](https://mongoosejs.com/docs/api/model.html#model_Model-findByIdAndUpdate) method.

  ```javascript
  app.put('/api/notes/:id', (request, response, next) => {
    const body = request.body
  
    const note = {
      content: body.content,
      important: body.important,
    }
  
    Note.findByIdAndUpdate(request.params.id, note, { new: true })
      .then(updatedNote => {
        response.json(updatedNote)
      })
      .catch(error => next(error))
  })
  ```

* In the code above, we also allow the content of the note to be edited. However, we will not support changing the creation date for obvious reasons.

* Notice that the `findByIdAndUpdate` method receives a regular JavaScript object as its parameter, and not a new note object created with the *Note* constructor function.

* There is one important detail regarding the use of the *findByIdAndUpdate* method. By default, the *updatedNote* parameter of the event handler receives the original document [without the modifications](https://mongoosejs.com/docs/api/model.html#model_Model-findByIdAndUpdate). We added the optional `{ new: true }`parameter, which will cause our event handler to be called with the new modified document instead of the original.

---

### d) Validation and ESLint

* There are usually constraints that we want to apply to the data that is stored in our application's database. Our application shouldn't accept notes that have a missing or empty *content* property. The validity of the note is checked in the route handler:

  ```javascript
  app.post('/api/notes', (request, response) => {
    const body = request.body
    if (body.content === undefined) {
      return response.status(400).json({ error: 'content missing' })
    }
  
    // ...
  })
  ```

* If the note does not have the *content* property, we respond to the request with the status code *400 bad request*.

* One smarter way of validating the format of the data before it is stored in the database, is to use the [validation](https://mongoosejs.com/docs/validation.html) functionality available in Mongoose.

* We can define specific validation rules for each field in the schema:

  ```javascript
  const noteSchema = new mongoose.Schema({
    content: {
      type: String,
      minLength: 5,
      required: true
    },
    date: { 
      type: Date,
      required: true
    },
    important: Boolean
  })
  ```

* The *content* field is now required to be at least five characters long. The *date* field is set as required, meaning that it can not be missing. The same constraint is also applied to the *content* field, since the minimum length constraint allows the field to be missing. We have not added any constraints to the *important* field, so its definition in the schema has not changed.

* The *minLength* and *required* validators are [built-in](https://mongoosejs.com/docs/validation.html#built-in-validators) and provided by Mongoose. The Mongoose [custom validator](https://mongoosejs.com/docs/validation.html#custom-validators) functionality allows us to create new validators, if none of the built-in ones cover our needs.

* If we try to store an object in the database that breaks one of the constraints, the operation will throw an exception. Let's change our handler for creating a new note so that it passes any potential exceptions to the error handler middleware:

  ```javascript
  app.post('/api/notes', (request, response, next) => {
    const body = request.body
  
    const note = new Note({
      content: body.content,
      important: body.important || false,
      date: new Date(),
    })
  
    note.save()
      .then(savedNote => {
        response.json(savedNote)
      })
      .catch(error => next(error))
  })
  ```

* Let's expand the error handler to deal with these validation errors:

  ```javascript
  const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message })
    }
  
    next(error)
  }
  ```

* When validating an object fails, we return the following default error message from Mongoose:

  ![fullstack content](https://fullstackopen.com/static/6beb35ed56d2e06e0eda3e36dea9f426/5a190/50.png)

* We notice that the backend has now a problem: validations are not done when editing a note. The [documentation](https://github.com/blakehaswell/mongoose-unique-validator#find--updates) explains what is the problem, validations are not run by default when *findOneAndUpdate* is executed.

* The fix is easy. Let us also reformulate the route code a bit:

  ```javascript
  app.put('/api/notes/:id', (request, response, next) => {
    const { content, important } = request.body
  
    Note.findByIdAndUpdate(
      request.params.id, 
      { content, important },
      { new: true, runValidators: true, context: 'query' }
    ) 
      .then(updatedNote => {
        response.json(updatedNote)
      })
      .catch(error => next(error))
  })
  ```

#### Deploying the database backend to production

* The application should work almost as-is in Fly.io/Heroku. We do have to generate a new production build of the frontend since changes thus far were only on our backend.

* The environment variables defined in dotenv will only be used when the backend is not in *production mode*, i.e. Fly.io or Heroku.

* For the production usage we have to set the database URL in the service that is hosting our app.

* In Fly.io that is done *fly secrets set*:

  ```
  fly secrets set MONGODB_URI='mongodb+srv://fullstack:<password>@cluster0.o1opl.mongodb.net/noteApp?retryWrites=true&w=majority'
  ```

* The application should now work. Sometimes things don't go according to plan. If there are problems, *fly logs* or *heroku logs* will be there to help.

* I had an issue with my application after deployment to Fly.io. The individual notes were not showing. I used _fly logs_ to see if I could locate the problem. One of the logs indicated that it could be that my IP address was not whitelisted from the MongoDB site. I tried the option to access the database from any IP address. The log message went away, but I still was unable to see the individual notes. I tried changing something back that the course originally told me to change. It had to do with the `PORT`. I changed this line of code

  ```javascript
  const PORT = process.env.PORT;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  ```

  back to this line of code

  ```javascript
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  ```

#### Lint