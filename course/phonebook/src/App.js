import { useState } from 'react';

const Filter = ({ filter, handleFilterChange }) => {
  return (
    <div>
      filter shown with
      <input value={filter} onChange={handleFilterChange} />
    </div>
  );
};

const PersonForm = ({ handleFormSubmission, newName, handleNameChange, newPhone, handlePhoneChange }) => {
  return (
    <form onSubmit={handleFormSubmission}>
      <div>
        name: <input value={newName} onChange={handleNameChange} />
      </div>
      <div>
        number: <input value={newPhone} onChange={handlePhoneChange} />
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
        return <li key={person.name}>{person.name} {person.phone}</li>;
      })}
    </ul>
  );
};

const App = () => {
  const [persons, setPersons] = useState([
    { name: 'Arto Hellas', phone: '040-1234567' }
  ]);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [filter, setFilter] = useState('');

  const handleFormSubmission = (event) => {
    event.preventDefault();

    if (persons.find(person => person.name === newName)) {
      alert(`${newName} is already added to phonebook`);
    } else {
      setPersons(persons.concat({ name: newName, phone: newPhone }));
      setNewName('');
      setNewPhone('');
    }
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value);
  }

  const handlePhoneChange = (event) => {
    setNewPhone(event.target.value);
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
        newPhone={newPhone}
        handlePhoneChange={handlePhoneChange}
      />
      <h3>Numbers</h3>
      <Persons filteredPersons={filteredPersons} filter={filter} />
    </div>
  )
}

export default App;
