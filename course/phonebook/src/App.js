import { useState, useEffect } from 'react';
import axios from 'axios';

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

const Persons = ({ filteredPersons, filter }) => {
  return (
    <ul>
      {filteredPersons(filter).map(person => {
        return <li key={person.id}>{person.name} {person.number}</li>;
      })}
    </ul>
  );
};

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    axios
      .get('http://localhost:3001/persons')
      .then(response => {
        setPersons(response.data);
      });
  }, []);

  const handleFormSubmission = (event) => {
    event.preventDefault();

    if (persons.find(person => person.name === newName)) {
      alert(`${newName} is already added to phonebook`);
    } else {
      setPersons(persons.concat({ name: newName, number: newNumber, id: persons.length + 1 }));
      setNewName('');
      setNewNumber('');
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

  return (
    <div>
      <h2>Phonebook</h2>
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
      <Persons filteredPersons={filteredPersons} filter={filter} />
    </div>
  )
}

export default App;
