## Fullstack Open Course — Part 6

### a) Flux-architecture and Redux

* So far, we have followed the state management conventions recommended by React. We have placed the state and the methods for handling it to [the root component](https://reactjs.org/docs/lifting-state-up.html) of the application. The state and its handler methods have then been passed to other components with props. This works up to a certain point, but when applications grow larger, state management becomes challenging.

#### Flux-architecture

* Facebook developed the [Flux](https://facebook.github.io/flux/docs/in-depth-overview/)- architecture to make state management easier. In Flux, the state is separated completely from the React-components into its own *stores*. State in the store is not changed directly, but with different *actions*.

* When an action changes the state of the store, the views are rerendered:

  ![img](https://facebook.github.io/flux/img/overview/flux-simple-f8-diagram-1300w.png)

* If some action on the application, for example pushing a button, causes the need to change the state, the change is made with an action. This causes rerendering the view again:

  ![img](https://facebook.github.io/flux/img/overview/flux-simple-f8-diagram-with-client-action-1300w.png)

* Flux offers a standard way for how and where the application's state is kept and how it is modified.

#### Redux

* Facebook has an implementation for Flux, but we will be using the [Redux](https://redux.js.org/) - library. It works with the same principle, but is a bit simpler. Facebook also uses Redux now instead of their original Flux.

* We will get to know Redux by implementing a counter application yet again:

  ![fullstack content](https://fullstackopen.com/static/840092f1209e6650c1989aaf0c143817/5a190/1.png)

* Create a new create-react-app-application and install redux with the command

  ```
  npm install redux
  ```

* As in Flux, in Redux the state is also stored in a [store](https://redux.js.org/basics/store).

* The whole state of the application is stored into *one* JavaScript-object in the store. Because our application only needs the value of the counter, we will save it straight to the store. If the state was more complicated, different things in the state would be saved as separate fields of the object.

* The state of the store is changed with [actions](https://redux.js.org/basics/actions). Actions are objects, which have at least a field determining the *type* of the action. Our application needs for example the following action:

  ```javascript
  {
    type: 'INCREMENT'
  }
  ```

* If there is data involved with the action, other fields can be declared as needed. However, our counting app is so simple that the actions are fine with just the type field.

#### Redux-notes

#### Pure functions, immutable

#### Array spread syntax

#### Uncontrolled form

#### Action creators

#### Forwarding Redux-Store to various components

---

### b) Many reducers