## Fullstack Open Course — Part 4

### a) Structure of backend application, introduction to testing

* Let's continue our work on the backend of the notes application we started in [part 3](https://fullstackopen.com/en/part3).

#### Project structure

* Before we move into the topic of testing, we will modify the structure of our project to adhere to Node.js best practices.

* So far we have been using *console.log* and *console.error* to print different information from the code. However, this is not a very good way to do things. Let's separate all printing to the console to its own module *utils/logger.js*:

  ```javascript
  const info = (...params) => {
    console.log(...params)
  }
  
  const error = (...params) => {
    console.error(...params)
  }
  
  module.exports = {
    info, error
  }
  ```

* The logger has two functions, **info** for printing normal log messages, and **error** for all error messages.

* Extracting logging into its own module is a good idea in more ways than one. If we wanted to start writing logs to a file or send them to an external logging service like [graylog](https://www.graylog.org/) or [papertrail](https://papertrailapp.com/) we would only have to make changes in one place.

* The contents of the *index.js* file used for starting the application gets simplified as follows:

  ```javascript
  const app = require('./app') // the actual Express application
  const http = require('http')
  const config = require('./utils/config')
  const logger = require('./utils/logger')
  
  const server = http.createServer(app)
  
  server.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`)
  })
  ```

* The *index.js* file only imports the actual application from the *app.js* file and then starts the application. The function *info* of the logger-module is used for the console printout telling that the application is running.

* The handling of environment variables is extracted into a separate *utils/config.js* file:

  ```javascript
  require('dotenv').config()
  
  const PORT = process.env.PORT
  const MONGODB_URI = process.env.MONGODB_URI
  
  module.exports = {
    MONGODB_URI,
    PORT
  }
  ```

* The other parts of the application can access the environment variables by importing the configuration module:

  ```javascript
  const config = require('./utils/config')
  
  logger.info(`Server running on port ${config.PORT}`)
  ```

* The route handlers have also been moved into a dedicated module. The event handlers of routes are commonly referred to as *controllers*, and for this reason we have created a new *controllers* directory. All of the routes related to notes are now in the *notes.js* module under the *controllers* directory.

* The contents of the *notes.js* module are the following:

  ```javascript
  const notesRouter = require('express').Router()
  const Note = require('../models/note')
  
  notesRouter.get('/', (request, response) => {
    Note.find({}).then(notes => {
      response.json(notes)
    })
  })
  
  notesRouter.get('/:id', (request, response, next) => {
    Note.findById(request.params.id)
      .then(note => {
        if (note) {
          response.json(note)
        } else {
          response.status(404).end()
        }
      })
      .catch(error => next(error))
  })
  
  notesRouter.post('/', (request, response, next) => {
    const body = request.body
  
    const note = new Note({
      content: body.content,
      important: body.important || false,
      date: new Date()
    })
  
    note.save()
      .then(savedNote => {
        response.json(savedNote)
      })
      .catch(error => next(error))
  })
  
  notesRouter.delete('/:id', (request, response, next) => {
    Note.findByIdAndRemove(request.params.id)
      .then(() => {
        response.status(204).end()
      })
      .catch(error => next(error))
  })
  
  notesRouter.put('/:id', (request, response, next) => {
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
  
  module.exports = notesRouter
  ```

* This is almost an exact copy-paste of our previous *index.js* file.

* However, there are a few significant changes. At the very beginning of the file we create a new [router](http://expressjs.com/en/api.html#router) object:

  ```javascript
  const notesRouter = require('express').Router()
  
  //...
  
  module.exports = notesRouter
  ```

* The module exports the router to be available for all consumers of the module.

* All routes are now defined for the router object, in a similar fashion to what we had previously done with the object representing the entire application.

* It's worth noting that the paths in the route handlers have shortened. In the previous version, we had:

  ```javascript
  app.delete('/api/notes/:id', (request, response) => {
  ```

* And in the current version, we have:

  ```javascript
  notesRouter.delete('/:id', (request, response) => {
  ```

* So what are these router objects exactly? The Express manual provides the following explanation:

  _A router object is an isolated instance of middleware and routes. You can think of it as a "mini-application," capable only of performing middleware and routing functions. Every Express application has a built-in app router._

* The router is in fact a *middleware*, that can be used for defining "related routes" in a single place, that is typically placed in its own module.

* The *app.js* file that creates the actual application, takes the router into use as shown below:

  ```javascript
  const notesRouter = require('./controllers/notes')
  app.use('/api/notes', notesRouter)
  ```

* The router we defined earlier is used *if* the URL of the request starts with */api/notes*. For this reason, the notesRouter object must only define the relative parts of the routes, i.e. the empty path */* or just the parameter */:id*.

* After making these changes, our *app.js* file looks like this:

  ```javascript
  const config = require('./utils/config')
  const express = require('express')
  const app = express()
  const cors = require('cors')
  const notesRouter = require('./controllers/notes')
  const middleware = require('./utils/middleware')
  const logger = require('./utils/logger')
  const mongoose = require('mongoose')
  
  logger.info('connecting to', config.MONGODB_URI)
  
  mongoose.connect(config.MONGODB_URI)
    .then(() => {
      logger.info('connected to MongoDB')
    })
    .catch((error) => {
      logger.error('error connecting to MongoDB:', error.message)
    })
  
  app.use(cors())
  app.use(express.static('build'))
  app.use(express.json())
  app.use(middleware.requestLogger)
  
  app.use('/api/notes', notesRouter)
  
  app.use(middleware.unknownEndpoint)
  app.use(middleware.errorHandler)
  
  module.exports = app
  ```

* The file takes different middleware into use, and one of these is the *notesRouter* that is attached to the */api/notes* route.

* Our custom middleware has been moved to a new *utils/middleware.js* module:

  ```javascript
  const logger = require('./logger')
  
  const requestLogger = (request, response, next) => {
    logger.info('Method:', request.method)
    logger.info('Path:  ', request.path)
    logger.info('Body:  ', request.body)
    logger.info('---')
    next()
  }
  
  const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
  const errorHandler = (error, request, response, next) => {
    logger.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message })
    }
  
    next(error)
  }
  
  module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler
  }
  ```

* The responsibility of establishing the connection to the database has been given to the *app.js* module. The *note.js* file under the *models* directory only defines the Mongoose schema for notes.

  ```javascript
  const mongoose = require('mongoose')
  
  const noteSchema = new mongoose.Schema({
    content: {
      type: String,
      required: true,
      minlength: 5
    },
    date: {
      type: Date,
      required: true,
    },
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

* To recap, the directory structure looks like this after the changes have been made:

  ```
  ├── index.js
  ├── app.js
  ├── build
  │   └── ...
  ├── controllers
  │   └── notes.js
  ├── models
  │   └── note.js
  ├── package-lock.json
  ├── package.json
  ├── utils
  │   ├── config.js
  │   ├── logger.js
  │   └── middleware.js
  ```

* For smaller applications the structure does not matter that much. Once the application starts to grow in size, you are going to have to establish some kind of structure, and separate the different responsibilities of the application into separate modules. This will make developing the application much easier.

* There is no strict directory structure or file naming convention that is required for Express applications. To contrast this, Ruby on Rails does require a specific structure. Our current structure simply follows some of the best practices you can come across on the internet.

#### Note on exports

#### Testing Node applications

* We have completely neglected one essential area of software development, and that is automated testing.

* Let's start our testing journey by looking at unit tests. The logic of our application is so simple, that there is not much that makes sense to test with unit tests. Let's create a new file *utils/for_testing.js* and write a couple of simple functions that we can use for test writing practice:

  ```javascript
  const reverse = (string) => {
    return string
      .split('')
      .reverse()
      .join('')
  }
  
  const average = (array) => {
    const reducer = (sum, item) => {
      return sum + item
    }
  
    return array.reduce(reducer, 0) / array.length
  }
  
  module.exports = {
    reverse,
    average,
  }
  ```

* There are many different testing libraries or *test runners* available for JavaScript. In this course we will be using a testing library developed and used internally by Facebook called [jest](https://jestjs.io/), that resembles the previous king of JavaScript testing libraries [Mocha](https://mochajs.org/).

* Jest is a natural choice for this course, as it works well for testing backends, and it shines when it comes to testing React applications.

* Since tests are only executed during the development of our application, we will install *jest* as a development dependency with the command:

  ```
  npm install --save-dev jest
  ```

* Let's define the *npm script \*test** to execute tests with Jest and to report about the test execution with the *verbose* style:

  ```json
  {
    //...
    "scripts": {
      "start": "node index.js",
      "dev": "nodemon index.js",
      "build:ui": "rm -rf build && cd ../../../2/luento/notes && npm run build && cp -r build ../../../3/luento/notes-backend",
      "deploy": "git push heroku master",
      "deploy:full": "npm run build:ui && git add . && git commit -m uibuild && git push && npm run deploy",
      "logs:prod": "heroku logs --tail",
      "lint": "eslint .",
      "test": "jest --verbose"
    },
    //...
  }
  ```

* Jest requires one to specify that the execution environment is Node. This can be done by adding the following to the end of *package.json*:

  ```json
  {
   //...
   "jest": {
     "testEnvironment": "node"
   }
  }
  ```

* Alternatively, Jest can look for a configuration file with the default name *jest.config.js*, where we can define the execution environment like this:

  ```javascript
  module.exports = {
    testEnvironment: 'node',
  }
  ```

* Let's create a separate directory for our tests called *tests* and create a new file called *reverse.test.js* with the following contents:

  ```javascript
  const reverse = require('../utils/for_testing').reverse
  
  test('reverse of a', () => {
    const result = reverse('a')
  
    expect(result).toBe('a')
  })
  
  test('reverse of react', () => {
    const result = reverse('react')
  
    expect(result).toBe('tcaer')
  })
  
  test('reverse of releveler', () => {
    const result = reverse('releveler')
  
    expect(result).toBe('releveler')
  })
  ```

* The ESLint configuration we added to the project in the previous part complains about the *test* and *expect* commands in our test file, since the configuration does not allow *globals*. Let's get rid of the complaints by adding *"jest": true* to the *env* property in the *.eslintrc.js* file.

  ```javascript
  module.exports = {
    'env': {
      'commonjs': true,
      'es2021': true,
      'node': true,
      'jest': true,
    },
    'extends': 'eslint:recommended',
    'parserOptions': {
      'ecmaVersion': 12
    },
    "rules": {
      // ...
    },
  }
  ```

* Individual test cases are defined with the *test* function. The first parameter of the function is the test description as a string. The second parameter is a *function*, that defines the functionality for the test case. The functionality for the second test case looks like this:

  ```javascript
  () => {
    const result = reverse('react')
  
    expect(result).toBe('tcaer')
  }
  ```

* First we execute the code to be tested, meaning that we generate a reverse for the string *react*. Next we verify the results with the [expect](https://jestjs.io/docs/expect#expectvalue) function. Expect wraps the resulting value into an object that offers a collection of *matcher* functions, that can be used for verifying the correctness of the result. Since in this test case we are comparing two strings, we can use the [toBe](https://jestjs.io/docs/expect#tobevalue) matcher.

* As expected, all of the tests pass:

  ![fullstack content](https://fullstackopen.com/static/2bb2fd94e6e842bdb30fdaa2677ee47c/5a190/1x.png)

* Jest expects by default that the names of test files contain *.test*. In this course, we will follow the convention of naming our tests files with the extension *.test.js*.

---

### b) Testing the backend

* We will now start writing tests for the backend. Since the backend does not contain any complicated logic, it doesn't make sense to write [unit tests](https://en.wikipedia.org/wiki/Unit_testing) for it. The only potential thing we could unit test is the *toJSON* method that is used for formatting notes.
* In some situations, it can be beneficial to implement some of the backend tests by mocking the database instead of using a real database. One library that could be used for this is [mongodb-memory-server](https://github.com/nodkz/mongodb-memory-server).
* Since our application's backend is still relatively simple, we will make the decision to test the entire application through its REST API, so that the database is also included. This kind of testing where multiple components of the system are being tested as a group, is called [integration testing](https://en.wikipedia.org/wiki/Integration_testing).

#### Test environment

* In one of the previous chapters of the course material, we mentioned that when your backend server is running in Heroku, it is in *production* mode.

* The convention in Node is to define the execution mode of the application with the *NODE_ENV* environment variable. In our current application, we only load the environment variables defined in the *.env* file if the application is *not* in production mode.

* It is common practice to define separate modes for development and testing.

* Next, let's change the scripts in our *package.json* so that when tests are run, *NODE_ENV* gets the value *test*:

  ```json
  {
    // ...
    "scripts": {
      "start": "NODE_ENV=production node index.js",
      "dev": "NODE_ENV=development nodemon index.js",
      "build:ui": "rm -rf build && cd ../../../2/luento/notes && npm run build && cp -r build ../../../3/luento/notes-backend",
      "deploy": "git push heroku master",
      "deploy:full": "npm run build:ui && git add . && git commit -m uibuild && git push && npm run deploy",
      "logs:prod": "heroku logs --tail",
      "lint": "eslint .",
      "test": "NODE_ENV=test jest --verbose --runInBand"
    },
    // ...
  }
  ```

* We also added the [runInBand](https://jestjs.io/docs/cli#--runinband) option to the npm script that executes the tests. This option will prevent Jest from running tests in parallel; we will discuss its significance once our tests start using the database.

* We specified the mode of the application to be *development* in the *npm run dev* script that uses nodemon. We also specified that the default *npm start* command will define the mode as *production*.

* There is a slight issue in the way that we have specified the mode of the application in our scripts: it will not work on Windows. We can correct this by installing the [cross-env](https://www.npmjs.com/package/cross-env) package as a development dependency with the command:

  ```
  npm install --save-dev cross-env
  ```

* We can then achieve cross-platform compatibility by using the cross-env library in our npm scripts defined in *package.json*:

  ```javascript
  {
    // ...
    "scripts": {
      "start": "cross-env NODE_ENV=production node index.js",
      "dev": "cross-env NODE_ENV=development nodemon index.js",
      // ...
      "test": "cross-env NODE_ENV=test jest --verbose --runInBand",
    },
    // ...
  }
  ```

* **NB**: If you are deploying this application to heroku, keep in mind that if cross-env is saved as a development dependency, it would cause an application error on your web server. To fix this, change cross-env to a production dependency by running this in the command line:

  ```
  npm i cross-env -P
  ```

* Now we can modify the way that our application runs in different modes. As an example of this, we could define the application to use a separate test database when it is running tests.

* We can create our separate test database in MongoDB Atlas. This is not an optimal solution in situations where there are many people developing the same application. Test execution in particular typically requires a single database instance is not used by tests that are running concurrently.

* It would be better to run our tests using a database that is installed and running in the developer's local machine. The optimal solution would be to have every test execution use its own separate database. This is "relatively simple" to achieve by [running Mongo in-memory](https://docs.mongodb.com/manual/core/inmemory/) or by using [Docker](https://www.docker.com/) containers. We will not complicate things and will instead continue to use the MongoDB Atlas database.

* Let's make some changes to the module that defines the application's configuration:

  ```javascript
  require('dotenv').config()
  
  const PORT = process.env.PORT
  
  const MONGODB_URI = process.env.NODE_ENV === 'test' 
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI
  
  module.exports = {
    MONGODB_URI,
    PORT
  }
  ```

* The *.env* file has *separate variables* for the database addresses of the development and test databases:

  ```
  MONGODB_URI=mongodb+srv://fullstack:<password>@cluster0.o1opl.mongodb.net/noteApp?retryWrites=true&w=majority
  PORT=3001
  
  TEST_MONGODB_URI=mongodb+srv://fullstack:<password>@cluster0.o1opl.mongodb.net/testNoteApp?retryWrites=true&w=majority
  ```

* The *config* module that we have implemented slightly resembles the [node-config](https://github.com/lorenwest/node-config) package. Writing our own implementation is justified since our application is simple, and also because it teaches us valuable lessons.

* These are the only changes we need to make to our application's code.

#### supertest

* Let's use the [supertest](https://github.com/visionmedia/supertest) package to help us write our tests for testing the API.

* We will install the package as a development dependency:

  ```
  npm install --save-dev supertest
  ```

* Let's write our first test in the *tests/note_api.test.js* file:

  ```javascript
  const mongoose = require('mongoose')
  const supertest = require('supertest')
  const app = require('../app')
  
  const api = supertest(app)
  
  test('notes are returned as json', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
  
  afterAll(() => {
    mongoose.connection.close()
  })
  ```

* The test imports the Express application from the *app.js* module and wraps it with the *supertest* function into a so-called [superagent](https://github.com/visionmedia/superagent) object. This object is assigned to the *api* variable and tests can use it for making HTTP requests to the backend.

* Our test makes an HTTP GET request to the *api/notes* url and verifies that the request is responded to with the status code 200. The test also verifies that the *Content-Type* header is set to *application/json*, indicating that the data is in the desired format. (If you're not familiar with the RegEx syntax of */application/json/*, you can learn more [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions).)

* The test contains some details that we will explore [a bit later on](https://fullstackopen.com/en/part4/testing_the_backend#async-await). The arrow function that defines the test is preceded by the *async* keyword and the method call for the *api* object is preceded by the *await* keyword. We will write a few tests and then take a closer look at this async/await magic. Do not concern yourself with them for now, just be assured that the example tests work correctly. The async/await syntax is related to the fact that making a request to the API is an *asynchronous* operation. The [Async/await syntax](https://jestjs.io/docs/asynchronous) can be used for writing asynchronous code with the appearance of synchronous code.

* Once all the tests (there is currently only one) have finished running we have to close the database connection used by Mongoose. This can be easily achieved with the [afterAll](https://jestjs.io/docs/api#afterallfn-timeout) method:

  ```javascript
  afterAll(() => {
    mongoose.connection.close()
  })
  ```

* When running your tests you may run across the following console warning:

  ![fullstack content](https://fullstackopen.com/static/7532c5c3fb1d0e3adfdb44969c26ab14/5a190/8.png)

* The problem is quite likely caused by the Mongoose version 6.x, the problem does not appear when the version 5.x is used. Actually [Mongoose documentation](https://mongoosejs.com/docs/jest.html) does not recommend testing Mongoose applications with Jest.

* One way to get rid of this is to run tests with option *--forceExit*:

  ```javascript
  {
    // ..
    "scripts": {
      "start": "cross-env NODE_ENV=production node index.js",
      "dev": "cross-env NODE_ENV=development nodemon index.js",
      "lint": "eslint .",
      "test": "cross-env NODE_ENV=test jest --verbose --runInBand --forceExit"
    },
    // ...
  }
  ```

* Another error you may come across is your test takes longer than the default Jest test timeout of 5000 ms. This can be solved by adding a third parameter to the test function:

  ```javascript
  test('notes are returned as json', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  }, 100000)
  ```

* This third parameter sets the timeout to be 100000 ms. A long timeout ensures that our test won't fail due to the time it takes to run. (A long timeout may not be what you want for tests based on performance or speed, but this is fine for our example tests).

* One tiny but important detail: at the [beginning](https://fullstackopen.com/en/part4/structure_of_backend_application_introduction_to_testing#project-structure) of this part we extracted the Express application into the *app.js* file, and the role of the *index.js* file was changed to launch the application at the specified port with Node's built-in *http* object:

  ```javascript
  const app = require('./app') // the actual Express app
  const http = require('http')
  const config = require('./utils/config')
  const logger = require('./utils/logger')
  
  const server = http.createServer(app)
  
  server.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`)
  })
  ```

* The tests only use the express application defined in the *app.js* file:

  ```javascript
  const mongoose = require('mongoose')
  const supertest = require('supertest')
  const app = require('../app')
  
  const api = supertest(app)
  
  // ...
  ```

* The documentation for supertest says the following:

  _if the server is not already listening for connections then it is bound to an ephemeral port for you so there is no need to keep track of ports._

* In other words, supertest takes care that the application being tested is started at the port that it uses internally.

* Let's write a few more tests:

  ```javascript
  test('there are two notes', async () => {
    const response = await api.get('/api/notes')
  
    expect(response.body).toHaveLength(2)
  })
  
  test('the first note is about HTTP methods', async () => {
    const response = await api.get('/api/notes')
  
    expect(response.body[0].content).toBe('HTML is easy')
  })
  ```

* Both tests store the response of the request to the *response* variable, and unlike the previous test that used the methods provided by *supertest* for verifying the status code and headers, this time we are inspecting the response data stored in *response.body* property. Our tests verify the format and content of the response data with the [expect](https://jestjs.io/docs/expect#expectvalue) method of Jest.

* The benefit of using the async/await syntax is starting to become evident. Normally we would have to use callback functions to access the data returned by promises, but with the new syntax things are a lot more comfortable:

  ```javascript
  const response = await api.get('/api/notes')
  
  // execution gets here only after the HTTP request is complete
  // the result of HTTP request is saved in variable response
  expect(response.body).toHaveLength(2)
  ```

* The middleware that outputs information about the HTTP requests is obstructing the test execution output. Let us modify the logger so that it does not print to the console in test mode:

  ```javascript
  const info = (...params) => {
    if (process.env.NODE_ENV !== 'test') { 
      console.log(...params)
    }
  }
  
  const error = (...params) => {
    if (process.env.NODE_ENV !== 'test') { 
      console.error(...params)
    }
  }
  
  module.exports = {
    info, error
  }
  ```

#### Initializing the database before tests

