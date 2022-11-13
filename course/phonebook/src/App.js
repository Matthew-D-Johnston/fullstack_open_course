import { useState, useEffect } from 'react';
import axios from 'axios';
import personService from './services/persons';

const Notification = ({ message }) => {
  if (message === null) {
    return null;
  }

  return (
    <div className='notification'>
      {message}
    </div>
  );
};

const ErrorMessage = ({ message }) => {
  if (message === null) {
    return null;
  }

  return (
    <div className='error'>
      {message}
    </div>
  )
}

const Filter = ({ filter, handleFilterChange }) => {
  return (
    <div>
      filter shown with
      <input value={filter} onChange={handleFilterChange} />
    </div>
  );
};

const PersonForm = ({ handleFormSubmission, newName, handleNameChange, newNumber, handleNumberChange }) => {
  return (
    <form onSubmit={handleFormSubmission}>
      <div>
        name: <input value={newName} onChange={handleNameChange} />
      </div>
      <div>
        number: <input value={newNumber} onChange={handleNumberChange} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  );
};

const Persons = ({ filteredPersons, filter, handleDeletePerson }) => {
  return (
    <ul>
      {filteredPersons(filter).map(person => {
        return (
          <li key={person.id}>
            {person.name} {person.number}
            <button onClick={() => handleDeletePerson(person.id)}>delete</button>
          </li>
        );
      })}
    </ul>
  );
};

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [filter, setFilter] = useState('');
  const [notificationMessage, setNotificationMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons);
      });
  }, []);

  const handleFormSubmission = (event) => {
    event.preventDefault();

    const person = persons.find(person => person.name === newName);

    if (person) {
      if (window.confirm(`${person.name} is already added to phonebook, replace the old number with a new one?`)) {
        const updatedPerson = {
          ...person,
          number: newNumber
        }

        personService
          .update(person.id, updatedPerson)
          .then(returnedPerson => {
            setPersons(persons.map(p => p.id !== person.id ? p : returnedPerson));
            setNewName('');
            setNewNumber('');

            setNotificationMessage(`${person.name}'s number was successfully updated.`);
            setTimeout(() => {
              setNotificationMessage(null);
            }, 5000);
          })
          .catch(error => {
            setErrorMessage(`Information of ${person.name} has already been removed from server.`);
            setPersons(persons.filter(p => p.id !== person.id));
            setNewName('');
            setNewNumber('');
            setTimeout(() => {
              setErrorMessage(null);
            }, 5000);
          });
      }
    } else {
      let newPerson = {
        name: newName,
        number: newNumber
      };

      personService
        .create(newPerson)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson));
          setNewName('');
          setNewNumber('');

          setNotificationMessage('A new contact was successfully added to the phonebook.');
          setTimeout(() => {
            setNotificationMessage(null);
          }, 5000);
        });
    }
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value);
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value);
  }

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  }

  const filteredPersons = (filter) => {
    let regex = new RegExp(filter, 'i');
    return persons.filter(person => !!person.name.match(regex));
  }

  const handleDeletePerson = (id) => {
    const person = persons.find(person => person.id === id);
    
    if (window.confirm(`Delete ${person.name}?`)) {
      personService.deletePerson(id).then(response => {
        const newPersons = persons.filter(person => person.id !== id);
        setPersons(newPersons);
      });
    }
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notificationMessage} />
      <ErrorMessage message={errorMessage} />
      <Filter filter={filter} handleFilterChange={handleFilterChange} />
      <h3>Add a new</h3>
      <PersonForm
        handleFormSubmission={handleFormSubmission}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />
      <h3>Numbers</h3>
      <Persons
        filteredPersons={filteredPersons}
        filter={filter}
        handleDeletePerson={handleDeletePerson}
      />
    </div>
  )
}

export default App;
