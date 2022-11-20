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

* Testing appears to be easy and our tests are currently passing. However, our tests are bad as they are dependent on the state of the database (that happens to be correct in my test database). In order to make our tests more robust, we have to reset the database and generate the needed test data in a controlled manner before we run the tests.

* Our tests are already using the [afterAll](https://jestjs.io/docs/api#afterallfn-timeout) function of Jest to close the connection to the database after the tests are finished executing. Jest offers many other [functions](https://jestjs.io/docs/setup-teardown) that can be used for executing operations once before any test is run, or every time before a test is run.

* Let's initialize the database *before every test* with the [beforeEach](https://jestjs.io/docs/en/api.html#beforeeachfn-timeout) function:

  ```javascript
  const mongoose = require('mongoose')
  const supertest = require('supertest')
  const app = require('../app')
  const api = supertest(app)
  const Note = require('../models/note')
  
  const initialNotes = [
    {
      content: 'HTML is easy',
      date: new Date(),
      important: false,
    },
    {
      content: 'Browser can execute only Javascript',
      date: new Date(),
      important: true,
    },
  ]
  
  beforeEach(async () => {
    await Note.deleteMany({})
    let noteObject = new Note(initialNotes[0])
    await noteObject.save()
    noteObject = new Note(initialNotes[1])
    await noteObject.save()
  })
  // ...
  ```

* The database is cleared out at the beginning, and after that we save the two notes stored in the *initialNotes* array to the database. By doing this, we ensure that the database is in the same state before every test is run.

* Let's also make the following changes to the last two tests:

  ```javascript
  test('all notes are returned', async () => {
    const response = await api.get('/api/notes')
  
    expect(response.body).toHaveLength(initialNotes.length)
  })
  
  test('a specific note is within the returned notes', async () => {
    const response = await api.get('/api/notes')
  
    const contents = response.body.map(r => r.content)
    expect(contents).toContain(
      'Browser can execute only Javascript'
    )
  })
  ```

* Pay special attention to the expect in the latter test. The `response.body.map(r => r.content)`command is used to create an array containing the content of every note returned by the API. The [toContain](https://jestjs.io/docs/expect#tocontainitem) method is used for checking that the note given to it as a parameter is in the list of notes returned by the API.

#### Running tests one by one

* The *npm test* command executes all of the tests for the application. When we are writing tests, it is usually wise to only execute one or two tests. Jest offers a few different ways of accomplishing this, one of which is the [only](https://jestjs.io/docs/en/api#testonlyname-fn-timeout) method. If tests are written across many files, this method is not great.

* A better option is to specify the tests that need to be run as parameters of the *npm test* command.

* The following command only runs the tests found in the *tests/note_api.test.js* file:

  ```
  npm test -- tests/note_api.test.js
  ```

* The *-t* option can be used for running tests with a specific name:

  ```
  npm test -- -t "a specific note is within the returned notes"
  ```

* The provided parameter can refer to the name of the test or the describe block. The parameter can also contain just a part of the name. The following command will run all of the tests that contain *notes* in their name:

  ```
  npm test -- -t 'notes'
  ```

* **NB**: When running a single test, the mongoose connection might stay open if no tests using the connection are run. The problem might be due to the fact that supertest primes the connection, but Jest does not run the afterAll portion of the code.

#### async/await

#### async/await in the backend

* Let's start to change the backend to async and await. As all of the asynchronous operations are currently done inside of a function, it is enough to change the route handler functions into async functions.

* The route for fetching all notes gets changed to the following:

  ```javascript
  notesRouter.get('/', async (request, response) => { 
    const notes = await Note.find({})
    response.json(notes)
  })
  ```

#### More tests and refactoring the backend

* When code gets refactored, there is always the risk of [regression](https://en.wikipedia.org/wiki/Regression_testing), meaning that existing functionality may break. Let's refactor the remaining operations by first writing a test for each route of the API.

* Let's start with the operation for adding a new note. Let's write a test that adds a new note and verifies that the amount of notes returned by the API increases, and that the newly added note is in the list.

  ```javascript
  test('a valid note can be added', async () => {
    const newNote = {
      content: 'async/await simplifies making async calls',
      important: true,
    }
  
    await api
      .post('/api/notes')
      .send(newNote)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const response = await api.get('/api/notes')
  
    const contents = response.body.map(r => r.content)
  
    expect(response.body).toHaveLength(initialNotes.length + 1)
    expect(contents).toContain(
      'async/await simplifies making async calls'
    )
  })
  ```

* Test actually fails since we are by accident returning the status code *200 OK* when a new note is created. Let us change that to *201 CREATED*:

  ```javascript
  notesRouter.post('/', (request, response, next) => {
    const body = request.body
  
    const note = new Note({
      content: body.content,
      important: body.important || false,
      date: new Date(),
    })
  
    note.save()
      .then(savedNote => {
        response.status(201).json(savedNote)
      })
      .catch(error => next(error))
  })
  ```

* Let's also write a test that verifies that a note without content will not be saved into the database.

  ```javascript
  test('note without content is not added', async () => {
    const newNote = {
      important: true
    }
  
    await api
      .post('/api/notes')
      .send(newNote)
      .expect(400)
  
    const response = await api.get('/api/notes')
  
    expect(response.body).toHaveLength(initialNotes.length)
  })
  ```

* Both tests check the state stored in the database after the saving operation, by fetching all the notes of the application.

  ```javascript
  const response = await api.get('/api/notes');
  ```

* The same verification steps will repeat in other tests later on, and it is a good idea to extract these steps into helper functions. Let's add the function into a new file called *tests/test_helper.js* that is in the same directory as the test file.

  ```javascript
  const Note = require('../models/note')
  
  const initialNotes = [
    {
      content: 'HTML is easy',
      date: new Date(),
      important: false
    },
    {
      content: 'Browser can execute only Javascript',
      date: new Date(),
      important: true
    }
  ]
  
  const nonExistingId = async () => {
    const note = new Note({ content: 'willremovethissoon', date: new Date() })
    await note.save()
    await note.remove()
  
    return note._id.toString()
  }
  
  const notesInDb = async () => {
    const notes = await Note.find({})
    return notes.map(note => note.toJSON())
  }
  
  module.exports = {
    initialNotes, nonExistingId, notesInDb
  }
  ```

* The module defines the *notesInDb* function that can be used for checking the notes stored in the database. The *initialNotes* array containing the initial database state is also in the module. We also define the *nonExistingId* function ahead of time, that can be used for creating a database object ID that does not belong to any note object in the database.

* Our tests can now use the helper module and be changed like this:

  ```javascript
  const supertest = require('supertest')
  const mongoose = require('mongoose')
  const helper = require('./test_helper')
  const app = require('../app')
  const api = supertest(app)
  
  const Note = require('../models/note')
  
  beforeEach(async () => {
    await Note.deleteMany({})
  
    let noteObject = new Note(helper.initialNotes[0])
    await noteObject.save()
  
    noteObject = new Note(helper.initialNotes[1])
    await noteObject.save()
  })
  
  test('notes are returned as json', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
  
  test('all notes are returned', async () => {
    const response = await api.get('/api/notes')
  
    expect(response.body).toHaveLength(helper.initialNotes.length)
  })
  
  test('a specific note is within the returned notes', async () => {
    const response = await api.get('/api/notes')
  
    const contents = response.body.map(r => r.content)
  
    expect(contents).toContain(
      'Browser can execute only Javascript'
    )
  })
  
  test('a valid note can be added ', async () => {
    const newNote = {
      content: 'async/await simplifies making async calls',
      important: true,
    }
  
    await api
      .post('/api/notes')
      .send(newNote)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const notesAtEnd = await helper.notesInDb()
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1)
  
    const contents = notesAtEnd.map(n => n.content)
    expect(contents).toContain(
      'async/await simplifies making async calls'
    )
  })
  
  test('note without content is not added', async () => {
    const newNote = {
      important: true
    }
  
    await api
      .post('/api/notes')
      .send(newNote)
      .expect(400)
  
    const notesAtEnd = await helper.notesInDb()
  
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length)
  })
  
  afterAll(() => {
    mongoose.connection.close()
  })
  ```

* The code using promises works and the tests pass. We are ready to refactor our code to use the async/await syntax.

* We make the following changes to the code that takes care of adding a new note(notice that the route handler definition is preceded by the *async* keyword):

  ```javascript
  notesRouter.post('/', async (request, response, next) => {
    const body = request.body
  
    const note = new Note({
      content: body.content,
      important: body.important || false,
      date: new Date(),
    })
  
    const savedNote = await note.save()
    response.status(201).json(savedNote)
  })
  ```

* There's a slight problem with our code: we don't handle error situations. How should we deal with them?

#### Error handling and async/await

* If there's an exception while handling the POST request we end up in a familiar situation:

  ![fullstack content](https://fullstackopen.com/static/58f3a7f3fa30d1a45c4330ee6f0c83d8/5a190/6.png)

* In other words we end up with an unhandled promise rejection, and the request never receives a response.

* With async/await the recommended way of dealing with exceptions is the old and familiar *try/catch* mechanism:

  ```javascript
  notesRouter.post('/', async (request, response, next) => {
    const body = request.body
  
    const note = new Note({
      content: body.content,
      important: body.important || false,
      date: new Date(),
    })
    try {
      const savedNote = await note.save()
      response.status(201).json(savedNote)
    } catch(exception) {
      next(exception)
    }
  })
  ```

* The catch block simply calls the *next* function, which passes the request handling to the error handling middleware.

* After making the change, all of our tests will pass once again.

* Next, let's write tests for fetching and removing an individual note:

  ```javascript
  test('a specific note can be viewed', async () => {
    const notesAtStart = await helper.notesInDb()
  
    const noteToView = notesAtStart[0]
  
    const resultNote = await api
      .get(`/api/notes/${noteToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    const processedNoteToView = JSON.parse(JSON.stringify(noteToView))
  
    expect(resultNote.body).toEqual(processedNoteToView)
  })
  
  test('a note can be deleted', async () => {
    const notesAtStart = await helper.notesInDb()
    const noteToDelete = notesAtStart[0]
  
    await api
      .delete(`/api/notes/${noteToDelete.id}`)
      .expect(204)
  
    const notesAtEnd = await helper.notesInDb()
  
    expect(notesAtEnd).toHaveLength(
      helper.initialNotes.length - 1
    )
  
    const contents = notesAtEnd.map(r => r.content)
  
    expect(contents).not.toContain(noteToDelete.content)
  })
  ```

* Both tests share a similar structure. In the initialization phase they fetch a note from the database. After this, the tests call the actual operation being tested, which is highlighted in the code block. Lastly, the tests verify that the outcome of the operation is as expected.

* In the first test, the note object we receive as the response body goes through JSON serialization and parsing. This processing will turn the note object's *date* property value's type from *Date* object into a string. Because of this we can't directly compare the equality of the *resultNote.body* and *noteToView* that is read from the database. Instead, we must first perform similar JSON serialization and parsing for the *noteToView* as the server is performing for the note object.

* The tests pass and we can safely refactor the tested routes to use async/await:

  ```javascript
  notesRouter.get('/:id', async (request, response, next) => {
    try {
      const note = await Note.findById(request.params.id)
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    } catch(exception) {
      next(exception)
    }
  })
  
  notesRouter.delete('/:id', async (request, response, next) => {
    try {
      await Note.findByIdAndRemove(request.params.id)
      response.status(204).end()
    } catch (exception) {
      next(exception)
    }
  })
  ```

#### Eliminating the try-catch

* Async/await unclutters the code a bit, but the 'price' is the *try/catch* structure required for catching exceptions. All of the route handlers follow the same structure

  ```javascript
  try {
    // do the async operations here
  } catch(exception) {
    next(exception)
  }
  ```

* One starts to wonder, if it would be possible to refactor the code to eliminate the *catch* from the methods?

* The [express-async-errors](https://github.com/davidbanham/express-async-errors) library has a solution for this.

* Let's install the library

  ```
  npm install express-async-errors
  ```

* Using the library is *very* easy. You introduce the library in *app.js*:

  ```javascript
  const config = require('./utils/config')
  const express = require('express')
  require('express-async-errors')
  const app = express()
  const cors = require('cors')
  const notesRouter = require('./controllers/notes')
  const middleware = require('./utils/middleware')
  const logger = require('./utils/logger')
  const mongoose = require('mongoose')
  
  // ...
  
  module.exports = app
  ```

* The 'magic' of the library allows us to eliminate the try-catch blocks completely. For example the route for deleting a note

  ```javascript
  notesRouter.delete('/:id', async (request, response, next) => {
    try {
      await Note.findByIdAndRemove(request.params.id)
      response.status(204).end()
    } catch (exception) {
      next(exception)
    }
  })
  ```

* becomes

  ```javascript
  notesRouter.delete('/:id', async (request, response) => {
    await Note.findByIdAndRemove(request.params.id)
    response.status(204).end()
  })
  ```

* Because of the library, we do not need the *next(exception)* call anymore. The library handles everything under the hood. If an exception occurs in an *async* route, the execution is automatically passed to the error handling middleware.

* The other routes become:

  ```javascript
  notesRouter.post('/', async (request, response) => {
    const body = request.body
  
    const note = new Note({
      content: body.content,
      important: body.important || false,
      date: new Date(),
    })
  
    const savedNote = await note.save()
    response.status(201).json(savedNote)
  })
  
  notesRouter.get('/:id', async (request, response) => {
    const note = await Note.findById(request.params.id)
    if (note) {
      response.json(note)
    } else {
      response.status(404).end()
    }
  })
  ```

#### Optimizing the beforeEach function

#### Refactoring tests

* Our test coverage is currently lacking. Some requests like *GET /api/notes/:id* and *DELETE /api/notes/:id* aren't tested when the request is sent with an invalid id. The grouping and organization of tests could also use some improvement, as all tests exist on the same "top level" in the test file. The readability of the test would improve if we group related tests with *describe* blocks.

* Below is an example of the test file after making some minor improvements:

  ```javascript
  const supertest = require('supertest')
  const mongoose = require('mongoose')
  const helper = require('./test_helper')
  const app = require('../app')
  const api = supertest(app)
  
  const Note = require('../models/note')
  
  beforeEach(async () => {
    await Note.deleteMany({})
    await Note.insertMany(helper.initialNotes)
  })
  
  describe('when there is initially some notes saved', () => {
    test('notes are returned as json', async () => {
      await api
        .get('/api/notes')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })
  
    test('all notes are returned', async () => {
      const response = await api.get('/api/notes')
  
      expect(response.body).toHaveLength(helper.initialNotes.length)
    })
  
    test('a specific note is within the returned notes', async () => {
      const response = await api.get('/api/notes')
  
      const contents = response.body.map(r => r.content)
  
      expect(contents).toContain(
        'Browser can execute only Javascript'
      )
    })
  })
  
  describe('viewing a specific note', () => {
    test('succeeds with a valid id', async () => {
      const notesAtStart = await helper.notesInDb()
  
      const noteToView = notesAtStart[0]
  
      const resultNote = await api
        .get(`/api/notes/${noteToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
        
      const processedNoteToView = JSON.parse(JSON.stringify(noteToView))
  
      expect(resultNote.body).toEqual(processedNoteToView)
    })
  
    test('fails with statuscode 404 if note does not exist', async () => {
      const validNonexistingId = await helper.nonExistingId()
  
      console.log(validNonexistingId)
  
      await api
        .get(`/api/notes/${validNonexistingId}`)
        .expect(404)
    })
  
    test('fails with statuscode 400 id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'
  
      await api
        .get(`/api/notes/${invalidId}`)
        .expect(400)
    })
  })
  
  describe('addition of a new note', () => {
    test('succeeds with valid data', async () => {
      const newNote = {
        content: 'async/await simplifies making async calls',
        important: true,
      }
  
      await api
        .post('/api/notes')
        .send(newNote)
        .expect(201)
        .expect('Content-Type', /application\/json/)
  
      const notesAtEnd = await helper.notesInDb()
      expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1)
  
      const contents = notesAtEnd.map(n => n.content)
      expect(contents).toContain(
        'async/await simplifies making async calls'
      )
    })
  
    test('fails with status code 400 if data invalid', async () => {
      const newNote = {
        important: true
      }
  
      await api
        .post('/api/notes')
        .send(newNote)
        .expect(400)
  
      const notesAtEnd = await helper.notesInDb()
  
      expect(notesAtEnd).toHaveLength(helper.initialNotes.length)
    })
  })
  
  describe('deletion of a note', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const notesAtStart = await helper.notesInDb()
      const noteToDelete = notesAtStart[0]
  
      await api
        .delete(`/api/notes/${noteToDelete.id}`)
        .expect(204)
  
      const notesAtEnd = await helper.notesInDb()
  
      expect(notesAtEnd).toHaveLength(
        helper.initialNotes.length - 1
      )
  
      const contents = notesAtEnd.map(r => r.content)
  
      expect(contents).not.toContain(noteToDelete.content)
    })
  })
  
  afterAll(() => {
    mongoose.connection.close()
  })
  ```

* The test output is grouped according to the *describe* blocks:

  ![fullstack content](https://fullstackopen.com/static/e01cd957a7650eae2082279222b7cb5a/5a190/7.png)

* There is still room for improvement, but it is time to move forward.
* This way of testing the API, by making HTTP requests and inspecting the database with Mongoose, is by no means the only nor the best way of conducting API-level integration tests for server applications. There is no universal best way of writing tests, as it all depends on the application being tested and available resources.

---

### c) User administration

* We want to add user authentication and authorization to our application. Users should be stored in the database and every note should be linked to the user who created it. Deleting and editing a note should only be allowed for the user who created it.

* Let's start by adding information about users to the database. There is a one-to-many relationship between the user (*User*) and notes (*Note*):

  ![img](https://yuml.me/a187045b.png)

* If we were working with a relational database the implementation would be straightforward. Both resources would have their separate database tables, and the id of the user who created a note would be stored in the notes table as a foreign key.
* When working with document databases the situation is a bit different, as there are many different ways of modeling the situation.
* The existing solution saves every note in the *notes collection* in the database. If we do not want to change this existing collection, then the natural choice is to save users in their own collection, *users* for example.
* Like with all document databases, we can use object id's in Mongo to reference documents in other collections. This is similar to using foreign keys in relational databases.
* Traditionally document databases like Mongo do not support *join queries* that are available in relational databases, used for aggregating data from multiple tables. However starting from version 3.2. Mongo has supported [lookup aggregation queries](https://docs.mongodb.com/manual/reference/operator/aggregation/lookup/). We will not be taking a look at this functionality in this course.
* If we need a functionality similar to join queries, we will implement it in our application code by making multiple queries. In certain situations Mongoose can take care of joining and aggregating data, which gives the appearance of a join query. However, even in these situations Mongoose makes multiple queries to the database in the background.

#### References across collections

* If we were using a relational database the note would contain a *reference key* to the user who created it. In document databases we can do the same thing.

* Let's assume that the *users* collection contains two users:

  ```javascript
  [
    {
      username: 'mluukkai',
      _id: 123456,
    },
    {
      username: 'hellas',
      _id: 141414,
    },
  ];
  ```

* The *notes* collection contains three notes that all have a *user* field that references a user in the *users* collection:

  ```javascript
  [
    {
      content: 'HTML is easy',
      important: false,
      _id: 221212,
      user: 123456,
    },
    {
      content: 'The most important operations of HTTP protocol are GET and POST',
      important: true,
      _id: 221255,
      user: 123456,
    },
    {
      content: 'A proper dinosaur codes with Java',
      important: false,
      _id: 221244,
      user: 141414,
    },
  ]
  ```

* Document databases do not demand the foreign key to be stored in the note resources, it could *also* be stored in the users collection, or even both:

  ```javascript
  [
    {
      username: 'mluukkai',
      _id: 123456,
      notes: [221212, 221255],
    },
    {
      username: 'hellas',
      _id: 141414,
      notes: [221244],
    },
  ]
  ```

* Since users can have many notes, the related ids are stored in an array in the *notes* field.

* Document databases also offer a radically different way of organizing the data: In some situations it might be beneficial to nest the entire notes array as a part of the documents in the users collection:

  ```javascript
  [
    {
      username: 'mluukkai',
      _id: 123456,
      notes: [
        {
          content: 'HTML is easy',
          important: false,
        },
        {
          content: 'The most important operations of HTTP protocol are GET and POST',
          important: true,
        },
      ],
    },
    {
      username: 'hellas',
      _id: 141414,
      notes: [
        {
          content:
            'A proper dinosaur codes with Java',
          important: false,
        },
      ],
    },
  ]
  ```

* In this schema, notes would be tightly nested under users and the database would not generate ids for them.

* The structure and schema of the database is not as self-evident as it was with relational databases. The chosen schema must be one which supports the use cases of the application the best. This is not a simple design decision to make, as all use cases of the applications are not known when the design decision is made.

* Paradoxically, schema-less databases like Mongo require developers to make far more radical design decisions about data organization at the beginning of the project than relational databases with schemas. On average, relational databases offer a more-or-less suitable way of organizing data for many applications.

#### Mongoose schema for users

* In this case, we make the decision to store the ids of the notes created by the user in the user document. Let's define the model for representing a user in the *models/user.js* file:

  ```javascript
  const mongoose = require('mongoose')
  
  const userSchema = new mongoose.Schema({
    username: String,
    name: String,
    passwordHash: String,
    notes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note'
      }
    ],
  })
  
  userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
      // the passwordHash should not be revealed
      delete returnedObject.passwordHash
    }
  })
  
  const User = mongoose.model('User', userSchema)
  
  module.exports = User
  ```

* The ids of the notes are stored within the user document as an array of Mongo ids. The definition is as follows:

  ```javascript
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note'
  }
  ```

* The type of the field is *ObjectId* that references *note*-style documents. Mongo does not inherently know that this is a field that references notes, the syntax is purely related to and defined by Mongoose.

* Let's expand the schema of the note defined in the *models/note.js* file so that the note contains information about the user who created it:

  ```javascript
  const noteSchema = new mongoose.Schema({
    content: {
      type: String,
      required: true,
      minlength: 5
    },
    date: Date,
    important: Boolean,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  })
  ```

* In stark contrast to the conventions of relational databases, *references are now stored in both documents*: the note references the user who created it, and the user has an array of references to all of the notes created by them.

#### Creating users

* Let's implement a route for creating new users. Users have a unique *username*, a *name* and something called a *passwordHash*. The password hash is the output of a [one-way hash function](https://en.wikipedia.org/wiki/Cryptographic_hash_function) applied to the user's password. It is never wise to store unencrypted plain text passwords in the database!

* Let's install the [bcrypt](https://github.com/kelektiv/node.bcrypt.js) package for generating the password hashes:

  ```
  npm install bcrypt
  ```

* Creating new users happens in compliance with the RESTful conventions discussed in [part 3](https://fullstackopen.com/en/part3/node_js_and_express#rest), by making an HTTP POST request to the *users* path.

* Let's define a separate *router* for dealing with users in a new *controllers/users.js* file. Let's take the router into use in our application in the *app.js* file, so that it handles requests made to the */api/users* url:

  ```javascript
  const usersRouter = require('./controllers/users')
  
  // ...
  
  app.use('/api/users', usersRouter)
  ```

* The contents of the file that defines the router are as follows:

  ```javascript
  const bcrypt = require('bcrypt')
  const usersRouter = require('express').Router()
  const User = require('../models/user')
  
  usersRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body
  
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
  
    const user = new User({
      username,
      name,
      passwordHash,
    })
  
    const savedUser = await user.save()
  
    response.status(201).json(savedUser)
  })
  
  module.exports = usersRouter
  ```

* The password sent in the request is *not* stored in the database. We store the *hash* of the password that is generated with the *bcrypt.hash* function.

* The fundamentals of [storing passwords](https://codahale.com/how-to-safely-store-a-password/) are outside the scope of this course material. We will not discuss what the magic number 10 assigned to the [saltRounds](https://github.com/kelektiv/node.bcrypt.js/#a-note-on-rounds) variable means, but you can read more about it in the linked material.

* Our current code does not contain any error handling or input validation for verifying that the username and password are in the desired format.

* The new feature can and should initially be tested manually with a tool like Postman. However testing things manually will quickly become too cumbersome, especially once we implement functionality that enforces usernames to be unique.

* It takes much less effort to write automated tests, and it will make the development of our application much easier.

* Our initial tests could look like this:

  ```javascript
  const bcrypt = require('bcrypt')
  const User = require('../models/user')
  
  //...
  
  describe('when there is initially one user in db', () => {
    beforeEach(async () => {
      await User.deleteMany({})
  
      const passwordHash = await bcrypt.hash('sekret', 10)
      const user = new User({ username: 'root', passwordHash })
  
      await user.save()
    })
  
    test('creation succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen',
      }
  
      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)
  
      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
  
      const usernames = usersAtEnd.map(u => u.username)
      expect(usernames).toContain(newUser.username)
    })
  })
  ```

* The tests use the *usersInDb()* helper function that we implemented in the *tests/test_helper.js* file. The function is used to help us verify the state of the database after a user is created:

  ```javascript
  const User = require('../models/user')
  
  // ...
  
  const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
  }
  
  module.exports = {
    initialNotes,
    nonExistingId,
    notesInDb,
    usersInDb,
  }
  ```

* The *beforeEach* block adds a user with the username *root* to the database. We can write a new test that verifies that a new user with the same username can not be created:

  ```javascript
  describe('when there is initially one user in db', () => {
    // ...
  
    test('creation fails with proper statuscode and message if username already taken', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'root',
        name: 'Superuser',
        password: 'salainen',
      }
  
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
  
      expect(result.body.error).toContain('username must be unique')
  
      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toEqual(usersAtStart)
    })
  })
  ```

* The test case obviously will not pass at this point. We are essentially practicing [test-driven development (TDD)](https://en.wikipedia.org/wiki/Test-driven_development), where tests for new functionality are written before the functionality is implemented.

* Mongoose does not have a built-in validator for checking the uniqueness of a field. In principle we could find a ready-made solution for this from the [mongoose-unique-validator](https://www.npmjs.com/package/mongoose-unique-validator) npm package but unfortunately at the time of writing (24th Jan 2022) mongoose-unique-validator does not work with Mongoose version 6.x, so we have to implement the uniqueness check by ourselves in the controller:

  ```javascript
  usersRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body
  
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return response.status(400).json({
        error: 'username must be unique'
      })
    }
  
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
  
    const user = new User({
      username,
      name,
      passwordHash,
    })
  
    const savedUser = await user.save()
  
    response.status(201).json(savedUser)
  })
  ```

* We could also implement other validations into the user creation. We could check that the username is long enough, that the username only consists of permitted characters, or that the password is strong enough. Implementing these functionalities is left as an optional exercise.

* Before we move onward, let's add an initial implementation of a route handler that returns all of the users in the database:

  ```javascript
  usersRouter.get('/', async (request, response) => {
    const users = await User.find({})
    response.json(users)
  })
  ```

* For making new users in a production or development environment, you may send a POST request to `/api/users/`via Postman or REST Client in the following format:

  ```javascript
  {
      "username": "root",
      "name": "Superuser",
      "password": "salainen"
  }
  ```

#### Creating a new note

* The code for creating a new note has to be updated so that the note is assigned to the user who created it.

* Let's expand our current implementation, so that the information about the user who created a note is sent in the *userId* field of the request body:

  ```javascript
  const User = require('../models/user')
  
  //...
  
  notesRouter.post('/', async (request, response, next) => {
    const body = request.body
  
    const user = await User.findById(body.userId)
  
    const note = new Note({
      content: body.content,
      important: body.important === undefined ? false : body.important,
      date: new Date(),
      user: user._id
    })
  
    const savedNote = await note.save()
    user.notes = user.notes.concat(savedNote._id)
    await user.save()
    
    response.json(savedNote)
  })
  ```

* It's worth noting that the *user* object also changes. The *id* of the note is stored in the *notes* field:

  ```javascript
  const user = await User.findById(body.userId)
  
  // ...
  
  user.notes = user.notes.concat(savedNote._id)
  await user.save()
  ```

* Let's try to create a new note:

  ![fullstack content](https://fullstackopen.com/static/a562436685978cc842c89a5d157a2938/5a190/10e.png)

* The operation appears to work. Let's add one more note and then visit the route for fetching all users:

  ![fullstack content](https://fullstackopen.com/static/c60c79686add78ebf57de1711c47fb47/5a190/11e.png)

* We can see that the user has two notes.

* Likewise, the ids of the users who created the notes can be seen when we visit the route for fetching all notes:

  ![fullstack content](https://fullstackopen.com/static/6798064b6620269dd272d7ee515aa4a9/5a190/12e.png)

#### Populate

* We would like our API to work in such a way, that when an HTTP GET request is made to the */api/users* route, the user objects would also contain the contents of the user's notes, and not just their id. In a relational database, this functionality would be implemented with a *join query*.

* As previously mentioned, document databases do not properly support join queries between collections, but the Mongoose library can do some of these joins for us. Mongoose accomplishes the join by doing multiple queries, which is different from join queries in relational databases which are *transactional*, meaning that the state of the database does not change during the time that the query is made. With join queries in Mongoose, nothing can guarantee that the state between the collections being joined is consistent, meaning that if we make a query that joins the user and notes collections, the state of the collections may change during the query.

* The Mongoose join is done with the [populate](http://mongoosejs.com/docs/populate.html) method. Let's update the route that returns all users first:

  ```javascript
  usersRouter.get('/', async (request, response) => {
    const users = await User
      .find({}).populate('notes')
  
    response.json(users)
  })
  ```

* The [populate](http://mongoosejs.com/docs/populate.html) method is chained after the *find* method making the initial query. The parameter given to the populate method defines that the *ids* referencing *note* objects in the *notes* field of the *user* document will be replaced by the referenced *note* documents.

* The result is almost exactly what we wanted:

  ![fullstack content](https://fullstackopen.com/static/27ee6cc31472f58384b7d7ae2027fe79/5a190/13ea.png)

* We can use the populate parameter for choosing the fields we want to include from the documents. The selection of fields is done with the Mongo [syntax](https://docs.mongodb.com/manual/tutorial/project-fields-from-query-results/#return-the-specified-fields-and-the-id-field-only):

  ```javascript
  usersRouter.get('/', async (request, response) => {
    const users = await User
      .find({}).populate('notes', { content: 1, date: 1 })
  
    response.json(users)
  });
  ```

* The result is now exactly like we want it to be:

  ![fullstack content](https://fullstackopen.com/static/f5f9a93f9de753a3ac6495d41582ce93/5a190/14ea.png)

* Let's also add a suitable population of user information to notes:

  ```javascript
  notesRouter.get('/', async (request, response) => {
    const notes = await Note
      .find({}).populate('user', { username: 1, name: 1 })
  
    response.json(notes)
  });
  ```

* Now the user's information is added to the *user* field of note objects.

  ![fullstack content](https://fullstackopen.com/static/ab1451e8dbee8ffbd723d68c0f621d05/5a190/15ea.png)

* It's important to understand that the database does not actually know that the ids stored in the *user* field of notes reference documents in the user collection.

* The functionality of the *populate* method of Mongoose is based on the fact that we have defined "types" to the references in the Mongoose schema with the *ref* option:

  ```javascript
  const noteSchema = new mongoose.Schema({
    content: {
      type: String,
      required: true,
      minlength: 5
    },
    date: Date,
    important: Boolean,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  })
  ```

---

### d) Token authentication

