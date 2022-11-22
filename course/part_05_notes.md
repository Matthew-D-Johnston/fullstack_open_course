## Fullstack Open Course — Part 5

### a) Login in frontend

* In the last two parts, we have mainly concentrated on the backend, and the frontend, that we developed in [part 2](https://fullstackopen.com/en/part2) does not yet support the user management we implemented to the backend in part 4.
* At the moment the frontend shows existing notes, and lets users change the state of a note from important to not important and vice versa. New notes cannot be added anymore because of the changes made to the backend in part 4: the backend now expects that a token verifying a user's identity is sent with the new note.
* We'll now implement a part of the required user management functionality in the frontend. Let's begin with user login. Throughout this part we will assume that new users will not be added from the frontend.

#### Handling login

* A login form has now been added to the top of the page. The form for adding new notes has also been moved to the bottom of the list of notes.

  ![fullstack content](https://fullstackopen.com/static/f735fe7db5ad5bbc1413d3ff617c6daa/5a190/1e.png)

* The code of the *App* component now looks as follows:

  ```javascript
  const App = () => {
    const [notes, setNotes] = useState([]) 
    const [newNote, setNewNote] = useState('')
    const [showAll, setShowAll] = useState(true)
    const [errorMessage, setErrorMessage] = useState(null)
    const [username, setUsername] = useState('') 
    const [password, setPassword] = useState('') 
  
    useEffect(() => {
      noteService
        .getAll().then(initialNotes => {
          setNotes(initialNotes)
        })
    }, [])
  
    // ...
  
    const handleLogin = (event) => {
      event.preventDefault()
      console.log('logging in with', username, password)
    }
  
    return (
      <div>
        <h1>Notes</h1>
  
        <Notification message={errorMessage} />
  
        <form onSubmit={handleLogin}>
          <div>
            username
              <input
              type="text"
              value={username}
              name="Username"
              onChange={({ target }) => setUsername(target.value)}
            />
          </div>
          <div>
            password
              <input
              type="password"
              value={password}
              name="Password"
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
          <button type="submit">login</button>
        </form>
  
        // ...
      </div>
    )
  }
  
  export default App
  ```

* The frontend will not display any notes if it's not connected to the backend. You can start the backend with *npm run dev* in its folder from Part 4. This will run the backend on port 3001. While that is active, in a separate terminal window you can start the frontend with *npm start*, and now you can see the notes that are saved in your MongoDB database from Part 4.

* The login form is handled the same way we handled forms in [part 2](https://fullstackopen.com/en/part2/forms). The app state has fields for *username* and *password* to store the data from the form. The form fields have event handlers, which synchronize changes in the field to the state of the *App* component. The event handlers are simple: An object is given to them as a parameter, and they destructure the field *target* from the object and save its value to the state.

  ```javascript
  ({ target }) => setUsername(target.value)
  ```

* The method *handleLogin*, which is responsible for handling the data in the form, is yet to be implemented.

* Logging in is done by sending an HTTP POST request to server address *api/login*. Let's separate the code responsible for this request to its own module, to file *services/login.js*.

* We'll use *async/await* syntax instead of promises for the HTTP request:

  ```javascript
  import axios from 'axios'
  const baseUrl = '/api/login'
  
  const login = async credentials => {
    const response = await axios.post(baseUrl, credentials)
    return response.data
  }
  
  export default { login }
  ```

* The method for handling the login can be implemented as follows:

  ```javascript
  import loginService from './services/login'
  
  const App = () => {
    // ...
    const [username, setUsername] = useState('') 
    const [password, setPassword] = useState('') 
    const [user, setUser] = useState(null)
    
    const handleLogin = async (event) => {
      event.preventDefault()
      
      try {
        const user = await loginService.login({
          username, password,
        })
        setUser(user)
        setUsername('')
        setPassword('')
      } catch (exception) {
        setErrorMessage('Wrong credentials')
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      }
    }
  
    // ...
  }
  ```

* If the login is successful, the form fields are emptied *and* the server response (including a *token* and the user details) is saved to the *user* field of the application's state.

* If the login fails, or running the function *loginService.login* results in an error, the user is notified.

* The user is not notified about a successful login in any way. Let's modify the application to show the login form only *if the user is not logged-in* so when *user === null*. The form for adding new notes is shown only if the *user is logged-in*, so *user* contains the user details.

* Let's add two helper functions to the *App* component for generating the forms:

  ```javascript
  const App = () => {
    // ...
  
    const loginForm = () => (
      <form onSubmit={handleLogin}>
        <div>
          username
            <input
            type="text"
            value={username}
            name="Username"
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password
            <input
            type="password"
            value={password}
            name="Password"
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>      
    )
  
    const noteForm = () => (
      <form onSubmit={addNote}>
        <input
          value={newNote}
          onChange={handleNoteChange}
        />
        <button type="submit">save</button>
      </form>  
    )
  
    return (
      // ...
    )
  }
  ```

* and conditionally render them:

  ```javascript
  const App = () => {
    // ...
  
    const loginForm = () => (
      // ...
    )
  
    const noteForm = () => (
      // ...
    )
  
    return (
      <div>
        <h1>Notes</h1>
  
        <Notification message={errorMessage} />
  
        {user === null && loginForm()}
        {user !== null && noteForm()}
  
        <div>
          <button onClick={() => setShowAll(!showAll)}>
            show {showAll ? 'important' : 'all'}
          </button>
        </div>
        <ul>
          {notesToShow.map((note, i) => 
            <Note
              key={i}
              note={note} 
              toggleImportance={() => toggleImportanceOf(note.id)}
            />
          )}
        </ul>
  
        <Footer />
      </div>
    )
  }
  ```

* A slightly odd looking, but commonly used [React trick](https://reactjs.org/docs/conditional-rendering.html#inline-if-with-logical--operator) is used to render the forms conditionally:

  ```javascript
  {
    user === null && loginForm()
  }
  ```

* If the first statement evaluates to false, or is [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy), the second statement (generating the form) is not executed at all.

* We can make this even more straightforward by using the [conditional operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator):

  ```javascript
  return (
    <div>
      <h1>Notes</h1>
  
      <Notification message={errorMessage}/>
  
      {user === null ?
        loginForm() :
        noteForm()
      }
  
      <h2>Notes</h2>
  
      // ...
  
    </div>
  )
  ```

* If *user === null* is [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy), *loginForm()* is executed. If not, *noteForm()* is.

* Let's do one more modification. If the user is logged-in, their name is shown on the screen:

  ```javascript
  return (
    <div>
      <h1>Notes</h1>
  
      <Notification message={errorMessage} />
  
      {user === null ?
        loginForm() :
        <div>
          <p>{user.name} logged-in</p>
          {noteForm()}
        </div>
      }
  
      <h2>Notes</h2>
  
      // ...
  
    </div>
  )
  ```

* The solution isn't perfect, but we'll leave it for now.

* Our main component *App* is at the moment way too large. The changes we did now are a clear sign that the forms should be refactored into their own components. However, we will leave that for an optional exercise.

#### Creating new notes

* The token returned with a successful login is saved to the application's state - the *user*'s field *token*:

  ```javascript
  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({
        username, password,
      })
  
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      // ...
    }
  }
  ```

* Let's fix creating new notes so it works with the backend. This means adding the token of the logged-in user to the Authorization header of the HTTP request.

* The *noteService* module changes like so:

  ```javascript
  import axios from 'axios'
  const baseUrl = '/api/notes'
  
  let token = null
  
  const setToken = newToken => {
    token = `bearer ${newToken}`
  }
  
  const getAll = () => {
    const request = axios.get(baseUrl)
    return request.then(response => response.data)
  }
  
  const create = async newObject => {
    const config = {
      headers: { Authorization: token },
    }
  
    const response = await axios.post(baseUrl, newObject, config)
    return response.data
  }
  
  const update = (id, newObject) => {
    const request = axios.put(`${ baseUrl }/${id}`, newObject)
    return request.then(response => response.data)
  }
  
  export default { getAll, create, update, setToken }
  ```

* The noteService module contains a private variable *token*. Its value can be changed with a function *setToken*, which is exported by the module. *create*, now with async/await syntax, sets the token to the *Authorization* header. The header is given to axios as the third parameter of the *post* method.

* The event handler responsible for login must be changed to call the method `noteService.setToken(user.token)`with a successful login:

  ```javascript
  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({
        username, password,
      })
  
      noteService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      // ...
    }
  }
  ```

* And now adding new notes works again!

#### Saving the token to the browser's local storage

* Our application has a flaw: when the page is rerendered, information of the user's login disappears. This also slows down development. For example when we test creating new notes, we have to login again every single time.

* This problem is easily solved by saving the login details to [local storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage). Local Storage is a [key-value](https://en.wikipedia.org/wiki/Key-value_database) database in the browser.

* It is very easy to use. A *value* corresponding to a certain *key* is saved to the database with method [setItem](https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem). For example:

  ```javascript
  window.localStorage.setItem('name', 'juha tauriainen')
  ```

* saves the string given as the second parameter as the value of key *name*.

* The value of a key can be found with method [getItem](https://developer.mozilla.org/en-US/docs/Web/API/Storage/getItem):

  ```javascript
  window.localStorage.getItem('name')
  ```

* and [removeItem](https://developer.mozilla.org/en-US/docs/Web/API/Storage/removeItem) removes a key.

* Values in the local storage are persisted even when the page is rerendered. The storage is [origin](https://developer.mozilla.org/en-US/docs/Glossary/Origin)-specific so each web application has its own storage.

* Let's extend our application so that it saves the details of a logged-in user to the local storage.

* Values saved to the storage are [DOMstrings](https://developer.mozilla.org/en-US/docs/Web/API/DOMString), so we cannot save a JavaScript object as it is. The object has to be parsed to JSON first, with the method *JSON.stringify*. Correspondingly, when a JSON object is read from the local storage, it has to be parsed back to JavaScript with *JSON.parse*.

* Changes to the login method are as follows:

  ```javascript
  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({
        username, password,
      })
  
      window.localStorage.setItem(
        'loggedNoteappUser', JSON.stringify(user)
      ) 
      noteService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      // ...
    }
  }
  ```

* The details of a logged-in user are now saved to the local storage, and they can be viewed on the console (by typing *window.localStorage* to the console):

  ![fullstack content](https://fullstackopen.com/static/a69b93f2f1d403c968a3118a612a559a/5a190/3e.png)

* You can also inspect the local storage using the developer tools. On Chrome, go to the *Application* tab and select *Local Storage* (more details [here](https://developers.google.com/web/tools/chrome-devtools/storage/localstorage)). On Firefox go to the *Storage* tab and select *Local Storage* (details [here](https://developer.mozilla.org/en-US/docs/Tools/Storage_Inspector)).

* We still have to modify our application so that when we enter the page, the application checks if user details of a logged-in user can already be found on the local storage. If they can, the details are saved to the state of the application and to *noteService*.

* The right way to do this is with an [effect hook](https://reactjs.org/docs/hooks-effect.html): a mechanism we first encountered in [part 2](https://fullstackopen.com/en/part2/getting_data_from_server#effect-hooks), and used to fetch notes from the server.

* We can have multiple effect hooks, so let's create a second one to handle the first loading of the page:

  ```javascript
  const App = () => {
    const [notes, setNotes] = useState([]) 
    const [newNote, setNewNote] = useState('')
    const [showAll, setShowAll] = useState(true)
    const [errorMessage, setErrorMessage] = useState(null)
    const [username, setUsername] = useState('') 
    const [password, setPassword] = useState('') 
    const [user, setUser] = useState(null) 
  
    useEffect(() => {
      noteService
        .getAll().then(initialNotes => {
          setNotes(initialNotes)
        })
    }, [])
  
    useEffect(() => {
      const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
      if (loggedUserJSON) {
        const user = JSON.parse(loggedUserJSON)
        setUser(user)
        noteService.setToken(user.token)
      }
    }, [])
  
    // ...
  }
  ```

* The empty array as the parameter of the effect ensures that the effect is executed only when the component is rendered [for the first time](https://reactjs.org/docs/hooks-reference.html#conditionally-firing-an-effect).

* Now a user stays logged-in in the application forever. We should probably add a *logout* functionality which removes the login details from the local storage. We will however leave it for an exercise.

* It's possible to log out a user using the console, and that is enough for now. You can log out with the command:

  ```javascript
  window.localStorage.removeItem('loggedNoteappUser')
  ```

#### A note on using local storage

---

### b) props.children and proptypes

#### Displaying the login form only when appropriate

* Let's modify the application so that the login form is not displayed by default:

  ![fullstack content](https://fullstackopen.com/static/da248f79ad2c71a9e834c174065dc694/5a190/10e.png)

* The login form appears when the user presses the *login* button:

  ![fullstack content](https://fullstackopen.com/static/bb9909156016418fc4cc9a1b60424f13/5a190/11e.png)

* The user can close the login form by clicking the *cancel* button.

* Let's start by extracting the login form into its own component:

  ```javascript
  const LoginForm = ({
     handleSubmit,
     handleUsernameChange,
     handlePasswordChange,
     username,
     password
    }) => {
    return (
      <div>
        <h2>Login</h2>
  
        <form onSubmit={handleSubmit}>
          <div>
            username
            <input
              value={username}
              onChange={handleUsernameChange}
            />
          </div>
          <div>
            password
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
            />
        </div>
          <button type="submit">login</button>
        </form>
      </div>
    )
  }
  
  export default LoginForm
  ```

* The state and all the functions related to it are defined outside of the component and are passed to the component as props.

* One fast way of implementing the functionality is to change the *loginForm* function of the *App* component like so:

  ```javascript
  const App = () => {
    const [loginVisible, setLoginVisible] = useState(false)
  
    // ...
  
    const loginForm = () => {
      const hideWhenVisible = { display: loginVisible ? 'none' : '' }
      const showWhenVisible = { display: loginVisible ? '' : 'none' }
  
      return (
        <div>
          <div style={hideWhenVisible}>
            <button onClick={() => setLoginVisible(true)}>log in</button>
          </div>
          <div style={showWhenVisible}>
            <LoginForm
              username={username}
              password={password}
              handleUsernameChange={({ target }) => setUsername(target.value)}
              handlePasswordChange={({ target }) => setPassword(target.value)}
              handleSubmit={handleLogin}
            />
            <button onClick={() => setLoginVisible(false)}>cancel</button>
          </div>
        </div>
      )
    }
  
    // ...
  }
  ```

* The *App* components state now contains the boolean *loginVisible*, that defines if the login form should be shown to the user or not.

#### The components children, aka. props.children

* The code related to managing the visibility of the login form could be considered to be its own logical entity, and for this reason it would be good to extract it from the *App* component into its own separate component.

* Our goal is to implement a new *Togglable* component that can be used in the following way:

  ```javascript
  <Togglable buttonLabel='login'>
    <LoginForm
      username={username}
      password={password}
      handleUsernameChange={({ target }) => setUsername(target.value)}
      handlePasswordChange={({ target }) => setPassword(target.value)}
      handleSubmit={handleLogin}
    />
  </Togglable>
  ```

* The way that the component is used is slightly different from our previous components. The component has both opening and closing tags which surround a *LoginForm* component. In React terminology *LoginForm* is a child component of *Togglable*.

* We can add any React elements we want between the opening and closing tags of *Togglable*, like this for example:

  ```javascript
  <Togglable buttonLabel="reveal">
    <p>this line is at start hidden</p>
    <p>also this is hidden</p>
  </Togglable>
  ```

* The code for the *Togglable* component is shown below:

  ```javascript
  import { useState } from 'react'
  
  const Togglable = (props) => {
    const [visible, setVisible] = useState(false)
  
    const hideWhenVisible = { display: visible ? 'none' : '' }
    const showWhenVisible = { display: visible ? '' : 'none' }
  
    const toggleVisibility = () => {
      setVisible(!visible)
    }
  
    return (
      <div>
        <div style={hideWhenVisible}>
          <button onClick={toggleVisibility}>{props.buttonLabel}</button>
        </div>
        <div style={showWhenVisible}>
          {props.children}
          <button onClick={toggleVisibility}>cancel</button>
        </div>
      </div>
    )
  }
  
  export default Togglable
  ```

* The new and interesting part of the code is [props.children](https://reactjs.org/docs/glossary.html#propschildren), that is used for referencing the child components of the component. The child components are the React elements that we define between the opening and closing tags of a component.

* This time the children are rendered in the code that is used for rendering the component itself:

  ```javascript
  <div style={showWhenVisible}>
    {props.children}
    <button onClick={toggleVisibility}>cancel</button>
  </div>
  ```

* Unlike the "normal" props we've seen before, *children* is automatically added by React and always exists. If a component is defined with an automatically closing */>* tag, like this:

  ```javascript
  <Note
    key={note.id}
    note={note}
    toggleImportance={() => toggleImportanceOf(note.id)}
  />
  ```

* Then *props.children* is an empty array.

* The *Togglable* component is reusable and we can use it to add similar visibility toggling functionality to the form that is used for creating new notes.

* Before we do that, let's extract the form for creating notes into its own component:

  ```javascript
  const NoteForm = ({ onSubmit, handleChange, value}) => {
    return (
      <div>
        <h2>Create a new note</h2>
  
        <form onSubmit={onSubmit}>
          <input
            value={value}
            onChange={handleChange}
          />
          <button type="submit">save</button>
        </form>
      </div>
    )
  }
  ```

* Next let's define the form component inside of a *Togglable* component:

  ```javascript
  <Togglable buttonLabel="new note">
    <NoteForm
      onSubmit={addNote}
      value={newNote}
      handleChange={handleNoteChange}
    />
  </Togglable>
  ```

#### State of the forms

* The state of the application currently is in the *App* component.

* React documentation says the [following](https://reactjs.org/docs/lifting-state-up.html) about where to place the state:

  _Often, several components need to reflect the same changing data. We recommend lifting the shared state up to their closest common ancestor._

* If we think about the state of the forms, so for example the contents of a new note before it has been created, the *App* component does not actually need it for anything. We could just as well move the state of the forms to the corresponding components.

* The component for a note changes like so:

  ```javascript
  import { useState } from 'react' 
  
  const NoteForm = ({ createNote }) => {
    const [newNote, setNewNote] = useState('') 
  
    const handleChange = (event) => {
      setNewNote(event.target.value)
    }
  
    const addNote = (event) => {
      event.preventDefault()
      createNote({
        content: newNote,
        important: Math.random() > 0.5,
      })
  
      setNewNote('')
    }
  
    return (
      <div>
        <h2>Create a new note</h2>
  
        <form onSubmit={addNote}>
          <input
            value={newNote}
            onChange={handleChange}
          />
          <button type="submit">save</button>
        </form>
      </div>
    )
  }
  
  export default NoteForm
  ```

* The *newNote* state attribute and the event handler responsible for changing it have been moved from the *App* component to the component responsible for the note form.

* There is only one prop left, the *createNote* function, which the form calls when a new note is created.

* The *App* component becomes simpler now that we have got rid of the *newNote* state and its event handler. The *addNote* function for creating new notes receives a new note as a parameter, and the function is the only prop we send to the form:

  ```javascript
  const App = () => {
    // ...
    const addNote = (noteObject) => {
      noteService
        .create(noteObject)
        .then(returnedNote => {
          setNotes(notes.concat(returnedNote))
        })
    }
    // ...
    const noteForm = () => (
      <Togglable buttonLabel='new note'>
        <NoteForm createNote={addNote} />
      </Togglable>
    )
  
    // ...
  }
  ```

#### References to components with ref

* Our current implementation is quite good, it has one aspect that could be improved.

* After a new note is created, it would make sense to hide the new note form. Currently the form stays visible. There is a slight problem with hiding the form. The visibility is controlled with the *visible* variable inside of the *Togglable* component. How can we access it outside of the component?

* There are many ways to implement closing the form from the parent component, but let's use the [ref](https://reactjs.org/docs/refs-and-the-dom.html) mechanism of React, which offers a reference to the component.

* Let's make the following changes to the *App* component:

  ```javascript
  import { useState, useEffect, useRef } from 'react'
  
  const App = () => {
    // ...
    const noteFormRef = useRef()
  
    const noteForm = () => (
      <Togglable buttonLabel='new note' ref={noteFormRef}>
        <NoteForm createNote={addNote} />
      </Togglable>
    )
  
    // ...
  }
  ```

* The [useRef](https://reactjs.org/docs/hooks-reference.html#useref) hook is used to create a *noteFormRef* ref, that is assigned to the *Togglable* component containing the creation note form. The *noteFormRef* variable acts as a reference to the component. This hook ensures the same reference (ref) is kept throughout re-renders of the component.

* We also make the following changes to the *Togglable* component:

  ```javascript
  import { useState, forwardRef, useImperativeHandle } from 'react'
  
  const Togglable = forwardRef((props, refs) => {
    const [visible, setVisible] = useState(false)
  
    const hideWhenVisible = { display: visible ? 'none' : '' }
    const showWhenVisible = { display: visible ? '' : 'none' }
  
    const toggleVisibility = () => {
      setVisible(!visible)
    }
  
    useImperativeHandle(refs, () => {
      return {
        toggleVisibility
      }
    })
  
    return (
      <div>
        <div style={hideWhenVisible}>
          <button onClick={toggleVisibility}>{props.buttonLabel}</button>
        </div>
        <div style={showWhenVisible}>
          {props.children}
          <button onClick={toggleVisibility}>cancel</button>
        </div>
      </div>
    )
  })
  
  export default Togglable
  ```

* The function that creates the component is wrapped inside of a [forwardRef](https://reactjs.org/docs/react-api.html#reactforwardref) function call. This way the component can access the ref that is assigned to it.

* The component uses the [useImperativeHandle](https://reactjs.org/docs/hooks-reference.html#useimperativehandle) hook to make its *toggleVisibility* function available outside of the component.

* We can now hide the form by calling *noteFormRef.current.toggleVisibility()* after a new note has been created:

  ```javascript
  const App = () => {
    // ...
    const addNote = (noteObject) => {
      noteFormRef.current.toggleVisibility()
      noteService
        .create(noteObject)
        .then(returnedNote => {     
          setNotes(notes.concat(returnedNote))
        })
    }
    // ...
  }
  ```

* To recap, the [useImperativeHandle](https://reactjs.org/docs/hooks-reference.html#useimperativehandle) function is a React hook, that is used for defining functions in a component which can be invoked from outside of the component.

* This trick works for changing the state of a component, but it looks a bit unpleasant. We could have accomplished the same functionality with slightly cleaner code using "old React" class-based components. We will take a look at these class components during part 7 of the course material. So far this is the only situation where using React hooks leads to code that is not cleaner than with class components.

* There are also [other use cases](https://reactjs.org/docs/refs-and-the-dom.html) for refs than accessing React components.

#### PropTypes

