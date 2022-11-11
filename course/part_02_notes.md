## Fullstack Open Course — Part 2

### a) Rendering a collection, modules

#### Rendering Collections

Let's start with the following example (the file _App.js_):

```javascript
const App = (props) => {
  const { notes } = props

  return (
    <div>
      <h1>Notes</h1>
      <ul>
        <li>{notes[0].content}</li>
        <li>{notes[1].content}</li>
        <li>{notes[2].content}</li>
      </ul>
    </div>
  )
}

export default App
```

The file _index.js_ looks like:

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'

const notes = [
  {
    id: 1,
    content: 'HTML is easy',
    date: '2019-05-30T17:30:31.098Z',
    important: true
  },
  {
    id: 2,
    content: 'Browser can execute only JavaScript',
    date: '2019-05-30T18:39:34.091Z',
    important: false
  },
  {
    id: 3,
    content: 'GET and POST are the most important methods of HTTP protocol',
    date: '2019-05-30T19:20:14.298Z',
    important: true
  }
]

ReactDOM.createRoot(document.getElementById('root')).render(
  <App notes={notes} />
)
```

The example above works due to the fact that there are exactly three notes in the array.  

A single note is rendered by accessing the objects in the array by referring to a hard-coded index number:

```javascript
<li>{notes[1].content}</li>
```

This is, of course, not practical. We can improve on this by generating React elements from the array objects using the map function.  

```javascript
notes.map(note => <li>{note.content}</li>);
```

The result is an array of _li_ elements.

```javascript
[
  <li>HTML is easy</li>,
  <li>Browser can execute only JavaScript</li>,
  <li>GET and POST are the most important methods of HTTP protocol</li>,
]
```

Which can then be placed inside _ul_ tags:

```javascript
const App = (props) => {
  const { notes } = props

  return (
    <div>
      <h1>Notes</h1>
      <ul>
        {notes.map(note => 
          <li>
            {note.content}
          </li>
        )}
      </ul>
    </div>
  )
}
```

#### Key-attribute

Even though the application seems to be working, there is a nasty warning in the console:

```
Warning: Each child in a list should have a unique "key" prop.

Check the render method of `App`. See https://reactjs.org/link/warning-keys for more information.
    at li
    at App (http://localhost:3000/static/js/bundle.js:23:5)
```

As the error message suggests; the list items, i.e. the elements generated by the `map` method, must each have a unique key value: an attribute called _key_.  

Let's add the keys:

```javascript
const App = (props) => {
  const { notes } = props

  return (
    <div>
      <h1>Notes</h1>
      <ul>
        {notes.map(note => 
          <li key={note.id}>
            {note.content}
          </li>
        )}
      </ul>
    </div>
  )
}
```

And the error message disappears.  

React uses the key attributes of objects in an array to determine how to update the view generated by a component when the component is re-rendered.

#### Refactoring Modules

We'll separate displaying a single note into its own component _Note_:

```javascript
const Note = ({ note }) => {
  return (
    <li>{note.content}</li>
  )
}

const App = ({ notes }) => {
  return (
    <div>
      <h1>Notes</h1>
      <ul>
        {notes.map(note => 
          <Note key={note.id} note={note} />
        )}
      </ul>
    </div>
  )
}
```

Note that the _key_ attribute must now be defined for the _Note_ components, and not for the _li_ tags like before.  

A whole React application can be written in a single file. Although that is, of course, not very practical. Common practice is to declare each component in their own file as an _ES6-module_.  

We have been using modules the whole time. The first few lines of the file _index.js_:

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'
```

import three modules, enabling them to be used in that file. The module _React_ is placed into the variable `React`, the module _react-dom_ into the variable `ReactDOM`, and the module that defines the main component of the app is placed into the variable `App`

Let's move our _Note_ component into its own module.  

In smaller applications, components are usually placed in a directory called _components_, which is in turn placed within the _src_ directory. The convention is to name the file after the component.  

Now, we'll create a directory called _components_ for our application and place a file named _Note.js_ inside. The contents of the Note.js file are as follows:

```javascript
const Note = ({ note }) => {
  return (
    <li>{note.content}</li>
  )
}

export default Note
```

The last line of the module exports the declared module, the variable _Note_.  

Now the file that is using the component—_App.js_—can import the module:  

```javascript
import Note from './components/Note'

const App = ({ notes }) => {
  // ...
}
```

The component exported by the module is now available for use in the variable _Note_, just as it was earlier.  

Note that when importing our own components, their location must be given _in relation to the importing file_:

```
'./components/Note'
```

The period—.—in the beginning refers to the current directory, so the module's location is a file called _Note.js_ in the _components_ sub-directory of the current directory. The filename extension `.js` can be omitted.  

---

### b) Forms

Let's continue expanding our application by allowing users to add new notes.  

In order to get our page to update when new notes are added it's best to store the notes in the _App_ component's state. Let's import the `useState` function and use it to define a piece of state that gets initialized with the initial notes array passed in the props.  

```javascript
import { useState } from 'react'
import Note from './components/Note'

const App = (props) => {
  const [notes, setNotes] = useState(props.notes)

  return (
    <div>
      <h1>Notes</h1>
      <ul>
        {notes.map(note => 
          <Note key={note.id} note={note} />
        )}
      </ul>
    </div>
  )
}

export default App
```

Next, let's add an HTML form to the component that will be used for adding new notes.

```javascript
const App = (props) => {
  const [notes, setNotes] = useState(props.notes)

  const addNote = (event) => {
    event.preventDefault()
    console.log('button clicked', event.target)
  }

  return (
    <div>
      <h1>Notes</h1>
      <ul>
        {notes.map(note => 
          <Note key={note.id} note={note} />
        )}
      </ul>
      <form onSubmit={addNote}>
        <input />
        <button type="submit">save</button>
      </form>   
    </div>
  )
}
```

We have added the `addNote` function as an event handler to the form element that will be called when the form is submitted, by clicking the submit button.  

How do we access the data contained in the form's _input_ element?  

#### Controlled component

There are many ways to accomplish this; the first method we will take a look at is through the use of so-called controlled components.  

Let's add a new piece of state called `newNote` for storing the user-submitted input and let's set it as the _input_ element's _value_ attribute:

```javascript
const App = (props) => {
  const [notes, setNotes] = useState(props.notes)
  const [newNote, setNewNote] = useState(
    'a new note...'
  ) 

  const addNote = (event) => {
    event.preventDefault()
    console.log('button clicked', event.target)
  }

  return (
    <div>
      <h1>Notes</h1>
      <ul>
        {notes.map(note => 
          <Note key={note.id} note={note} />
        )}
      </ul>
      <form onSubmit={addNote}>
        <input value={newNote} />
        <button type="submit">save</button>
      </form>   
    </div>
  )
}
```

The placeholder text stored as the initial value of the `newNote` state appears in the _input_ element, but the input text can't be edited. The console displays a warning that gives us a clue as to what might be wrong:

![fullstack content](https://fullstackopen.com/static/2905b1f4edfe786a70566fe4a7a3a0e9/5a190/7e.png)

Since we assigned a piece of the _App_ component's state as the _value_ attribute of the input element, the _App_ component now controls the behaviour of the input element.  

In order to enable editing of the input element, we have to register an _event handler_ that synchronizes the changes made to the input with the component's state:  

```javascript
const App = (props) => {
  const [notes, setNotes] = useState(props.notes)
  const [newNote, setNewNote] = useState(
    'a new note...'
  ) 

  // ...

  const handleNoteChange = (event) => {
    console.log(event.target.value)
    setNewNote(event.target.value)
  }

  return (
    <div>
      <h1>Notes</h1>
      <ul>
        {notes.map(note => 
          <Note key={note.id} note={note} />
        )}
      </ul>
      <form onSubmit={addNote}>
        <input
          value={newNote}
          onChange={handleNoteChange}
        />
        <button type="submit">save</button>
      </form>   
    </div>
  )
}
```

We have now registered an event handler to the _onChange_ attribute of the form's _input_ element:

```javascript
<input
	value={newNote}
	onChange={handleNoteChange}
/>
```

The event handler is called every time _a change occurs in the input element_. The event handler function receives the event object as its `event` parameter:  

```javascript
const handleNoteChange = (event) => {
  console.log(event.target.value)
  setNewNote(event.target.value)
}
```

The `target` property of the event object now corresponds to the controlled _input_ element, and `event.target.value` refers to the input value of that element.  

Note that we did not need to call the `event.preventDefault()` method lik we did in the _onSubmit_ event handler. This is because there is no default action that occurs on an input change, unlike on a form submission.  

Now the _App_ component's `newNote` state reflects the current value of the input, which means that we can complete the `addNote` function for creating new notes:

```javascript
const addNote = (event) => {
  event.preventDefault()
  const noteObject = {
    content: newNote,
    date: new Date().toISOString(),
    important: Math.random() < 0.5,
    id: notes.length + 1,
  }

  setNotes(notes.concat(noteObject))
  setNewNote('')
}
```

First, we create a new object for the note called `noteObject` that will receive its content from the component's `newNote` state. The unique identifier _id_ is generated based on the total number of notes. This method works for our application since notes are never deleted. With the help of the `Math.random()` function, our note has a 50% chance of being marked as important.  

---

### c) Getting data from server

* Create a file named _db.json_ in the root directory of the project.

  ```json
  {
    "notes": [
      {
        "id": 1,
        "content": "HTML is easy",
        "date": "2022-1-17T17:30:31.098Z",
        "important": true
      },
      {
        "id": 2,
        "content": "Browser can execute only JavaScript",
        "date": "2022-1-17T18:39:34.091Z",
        "important": false
      },
      {
        "id": 3,
        "content": "GET and POST are the most important methods of HTTP protocol",
        "date": "2022-1-17T19:20:14.298Z",
        "important": true
      }
    ]
  }
  ```

* JSON Server is a tool meant to be used during software development that can act as a server.

* JSON server can be installed globally using the command `num install -g json-server`.  

* After installing, run the following command to run the json-server. The _json-server_ starts running on port 3000 by default; but since projects created using create-react-app reserve port 3000, we must define an alternate port, such as port 3001, for the json-server. The --watch option automatically looks for any saved changes to db.json.

  ```
  json-server --port 3001 --watch db.json
  ```

  However, a global installation is not necessary. From the root directory of your app, we can run the _json-server_ using the command `npx`:

  ```
  npx json-server --port 3001 --watch db.json
  ```

* Let's navigate to the address http://localhost:3001/notes in the browser. We can see that _json-server_ serves the notes we previously wrote to the file in JSON format:

  ![fullstack content](https://fullstackopen.com/static/37694498d0930f7b32df06ee8de181e6/5a190/14e.png)

* Going forward, the idea will be to save the notes to the server, which in this case means saving them to the json-server. The React code fetches the notes from the server and renders them to the screen. Whenever a new note is added to the application, the React code also sends it to the server to make the new note persist in "memory".  
* json-server stores all the data in the _db.json_ file, which resides on the server. In the real world, data would be stored in some kind of database. However, json-server is a handy tool that enables the use of server-side functionality in the development phase without the need to program any of it.  

#### npm

* We will be using the axis library for communication between the browser and server. It functions like fetch, but is somewhat more pleasant to use. Another good reason to use axios is to get familiar with adding external librairies, so-called _npm packages_, to React projects.

* Nowadays, practically all Javascript projects are defined using the node package manager, aka npm. 

* We can instal axios from the command line:

  ```
  npm install axios
  ```

  npm-commands should always be run in the project root directory, which is where the _package.json_ file can be found.

* In addition to adding axios to the dependencies, the `npm install` command also _downloaded_ the library code. As with other dependencies, the code can be found in the _node_modules_ directory located in the root. As one might have noticed, _node_modules_ contains a fair amount of interesting stuff.  

* Let's make another addition. Install _json-server_ as a development dependency (only used during development) by executing the command:  

  ```
  npm install json-server --save-dev
  ```

* and making a small addition to the _scripts_ part of the _package.json_ file:

  ```json
  {
    // ... 
    "scripts": {
      "start": "react-scripts start",
      "build": "react-scripts build",
      "test": "react-scripts test",
      "eject": "react-scripts eject",
      "server": "json-server -p3001 --watch db.json"
    },
  }
  ```

* We can now conveniently, without parameter definitions, start the json-server from the project root directory with the command:  

  ```
  npm run server
  ```

* We used the command `npm install` twice, but with slight differences:

  ```
  npm install axios
  npm install json-server --save-dev
  ```

  There is a fine difference in the parameters. _axios_ is installed as a runtime dependency of the application, because the execution of the program requires the existence of the library. Onm the other hand, _json-server_ was installed as a development dependency (`--save-dev`), since the program itself doesn't require it. It is used for assistance during software development. There will be more on different dependencies in the next part of the course.  

#### Axios and promises

* Now we are ready to use axios. Going forward, json-server is assumed to be running on port 3001.

* The library can be brought into use the same way other libraries, e.g. React, are, i.e., by using an appropriate `import` statement.

* Add the following to the file _index.js_:

  ```javascript
  import axios from 'axios'
  
  const promise = axios.get('http://localhost:3001/notes')
  console.log(promise)
  
  const promise2 = axios.get('http://localhost:3001/foobar')
  console.log(promise2)
  ```

* If you open http://localhost:3000 in the browser, this should be printed to the console:

  ![fullstack content](https://fullstackopen.com/static/823a2e7f414c99cb849a42470e4f372d/5a190/16b.png)

* Axios' method `get` returns a promise.

* The documentation on Mozilla's site states the following about promises:

  _A Promise is an object representing the eventual completion or failure of an asynchronous operation_.

* In other words, a promise is an object that represents an asynchronous operation. A promise can have three distinct states:  

  1. The promise is _pending_: It means that the final value (one of the following two) is not available yet.
  2. The promise is _fulfilled_: It means that the operation has been completed and the final value is available, which generally is a successful operation. This state is sometimes also called _resolved_.
  3. The promise is _rejected_: It means that an error prevented the final value from being determined, which generally represents a failed operation.

* The first promise in our example is _fulfilled_, representing a successful `axios.get('http://localhost:3001/notes')` request. The second one, however, is _rejected_, and the console tells us the reason. It looks like we were trying to make an HTTP GET request to a non-existent address.  

* If, and when, we want to access the result of the operation represented by the promise, we must register an event handler to the promise. This is achieved using the method `then`:  

  ```javascript
  const promise = axios.get('http://localhost:3001/notes')
  
  promise.then(response => {
    console.log(response)
  })
  ```

* The following is printed to the console:

  ![fullstack content](https://fullstackopen.com/static/ea48db35e4b6b6ee75bd0b7795ea958c/5a190/17e.png)

* The JavaScript runtime environment calls the callback function registered by the `then` method providing it with a `response` object as a parameter. The `response` object contains all the essential data related to the response of an HTTP GET request, which would include the returned _data_, _status code_, and _headers_.

* Storing the promise object in a variable is generally unnecessary, and it's instead common to chain the `then` method call to the axios method call, so that it follows it directly:  

  ```javascript
  axios.get('http://localhost:3001/notes').then(response => {
    const notes = response.data;
    console.log(notes);
  });
  ```

  A more readable way to format _chained_ method calls is to place each call on its own line:

  ```javascript
  axios
    .get('http://localhost:3001/notes')
    .then(response => {
      const notes = response.data
      console.log(notes)
    })
  ```

* The data returned by the server is plain text, basically just one long string. The axios library is still able to parse the data into a JavaScript array, since the server has specified that the data format is _application/json; charset=utf-8_ (see previous image) using the _content-type_ header.  

* We can finally begin using the data fetched from the server.

* Let's try and request the notes from our local server and render them, initially as the App component. Please note that this approach has many issues, as we're rendering the entire _App_ component only when we successfully retrieve a response:

  ```javascript
  import React from 'react'
  import ReactDOM from 'react-dom/client'
  import axios from 'axios'
  
  import App from './App'
  
  axios.get('http://localhost:3001/notes').then(response => {
    const notes = response.data
    ReactDOM.createRoot(document.getElementById('root')).render(<App notes={notes} />)
  })
  ```

* This method could be acceptable in some circumstances, but it's somewhat problematic. Let's instead move the fetching of the data into the _App_ component.  

* What's not immediately obvious, however, is where the command `axios.get` should be placed within the component.

#### Effect-hooks

* Effect hooks as per the official docs:

  _The Effect Hook lets you perform side effects on function components. Data fetching, setting up a subscription, and manually changing the DOM in React components are all examples of side effects._

* As such, effect hooks are precisely the right tool to use when fetching data from a server.  

* Let's remove the fetching of data from _index.js_. Since we're gonna be retrieving the notes from the server, there is no longer a need to pass data as props to the _App_ component. So _index.js_ can be simplified to:

  ```javascript
  ReactDOM.createRoot(document.getElementById('root')).render(<App />)
  ```

* The _App_ component changes as follows:

  ```javascript
  import { useState, useEffect } from 'react'
  import axios from 'axios'
  import Note from './components/Note'
  
  const App = () => {
    const [notes, setNotes] = useState([])
    const [newNote, setNewNote] = useState('')
    const [showAll, setShowAll] = useState(true)
  
    useEffect(() => {
      console.log('effect')
      axios
        .get('http://localhost:3001/notes')
        .then(response => {
          console.log('promise fulfilled')
          setNotes(response.data)
        })
    }, [])
    console.log('render', notes.length, 'notes')
  
    // ...
  }
  ```

* We have also added a few helpful prints, which clarify the progression of the execution.

* This is printed to the console:

  ```
  render 0 notes
  effect
  promise fulfilled
  render 3 notes
  ```

* First, the body of the function defining the component is executed and the component is rendered for the first time. At this point _render 0 notes_ is printed, meaning data hasn't been fetched from the server yet.  

* The following function, or effect in React parlance:  

  ```javascript
  () => {
    console.log('effect')
    axios
      .get('http://localhost:3001/notes')
      .then(response => {
        console.log('promise fulfilled')
        setNotes(response.data)
      })
  }
  ```

  is executed immediately after rendering. The execution of the function results in _effect_ being printed to the console, and the command `axios.get` initiates the fetching of data from the server as well as registers the following function as an _event handler_ for the operation:  

  ```javascript
  response => {
    console.log('promise fulfilled')
    setNotes(response.data)
  })
  ```

* When data arrives from the server, the JavaScript runtime calls the function registered as the event handler, which prints _promise fulfilled_ to the console and stores the notes received from the server into the state using the function `setNotes(response.data)`.

* As always, a call to a state-updating function triggers the re-rendering of the component. As a result, _render 3 notes_ is printed to the console, and the notes fetched from the server are rendered to the screen.

* Finally, let's take a look at the definition of the effect hook as a whole:

  ```javascript
  useEffect(() => {
    console.log('effect')
    axios
      .get('http://localhost:3001/notes').then(response => {
        console.log('promise fulfilled')
        setNotes(response.data)
      })
  }, [])
  ```

  Let's rewrite the code a bit differently.

  ```javascript
  const hook = () => {
    console.log('effect')
    axios
      .get('http://localhost:3001/notes')
      .then(response => {
        console.log('promise fulfilled')
        setNotes(response.data)
      })
  }
  
  useEffect(hook, [])
  ```

* Now we can see more clearly that the function `useEffect` actually takes _two parameters_. The first is a function, the _effect_ itself. According to the documentation:

  _By default, effects run after every completed render, but you can choose to fire it only when certain values have changed_.

* So by default the effect is _always_ run after the component has been rendered. In our case, however, we only want to execute the effect along with the first render.

* The second parameter of `useEffect` is used to specify how often the effect is run. If the second parameter is an empty array `[]`, then the effect is only run along with the first render of the component.

* There are many possible use cases for an effect hook other than fetching data from the server. However, this use is sufficient for us, for now.

* We still have a problem in our application. When adding new notes, they are not stored on the server.

#### The development runtime environment

* The configuration for the whole application has steadily grown more complex. Let's review what happens and where. The following image describes the makeup of the application

  ![fullstack content](https://fullstackopen.com/static/0e3766361ce9d08f0c4fdd39152cf493/5a190/18e.png)

* The JavaScript code making up our React application is run in the browser. The browser gets the JavaScript from the _React dev server_, which is the application that runs after running the command `npm start`. The dev-server transforms the JavaScript into a format understood by the browser. Among other things, it stitches together JavaScript from different files into one file.  
* The Reac application running in the browser fetches the JSON formatted data from _json-server_ running on port 3001 on the machine. The server we query the data from—_json-server_—gets its data from the file _db.json_.
* At this point in development, all the parts of the application happen to reside on the software developer's machine, otherwise known as localhost. The situation changes when the application is deployed to the internet.

---
