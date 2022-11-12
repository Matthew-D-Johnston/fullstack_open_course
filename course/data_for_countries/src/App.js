import { useState, useEffect } from 'react';
import axios from 'axios';

const DisplayCountries = (props) => {
  if (props.countryFilter === '') {
    return <ul></ul>;
  } else {
    const filteredCountries = props.filterCountryList(props.countryFilter);

    if (filteredCountries.length > 10) {
      return <p>Too many matches, specify another filter</p>
    } else if (filteredCountries.length === 1) {
      const country = filteredCountries[0];
      
      return (
        <div>
          <h2>{country.name}</h2>
          <p>capital {country.capital}</p>
          <p>area {country.area}</p>
          <h3>languages:</h3>
          <ul>
            {country.languages.map(language => {
              return <li key={language.name}>{language.name}</li>;
            })}
          </ul>
          <img src={country.flags.png} alt="country flag"></img>
        </div>
      )
    } else {
      return (
        <ul>
          {filteredCountries.map(country => {
            return <li key={country.name}>{country.name}<button onClick={props.handleShowButtonClick}>show</button></li>;
          })}
        </ul>
      );
    }
  }
};

const ShowCountryData = ({ showCountry, countries }) => {
  if (showCountry === '') {
    return;
  } else {
    const countryData = countries.find(country => country.name === showCountry);
    return (
      <div>
        <h2>{countryData.name}</h2>
        <p>capital {countryData.capital}</p>
        <p>area {countryData.area}</p>
        <h3>languages:</h3>
        <ul>
          {countryData.languages.map(language => {
            return <li key={language.name}>{language.name}</li>;
          })}
        </ul>
        <img src={countryData.flags.png} alt="country flag"></img>
      </div>
    );
  }
};

const App = () => {
  const [countries, setCountries] = useState([]);
  const [countryFilter, setCountryFilter] = useState('');
  const [showCountry, setShowCountry] = useState('');

  useEffect(() => {
    axios
      .get('https://restcountries.com/v2/all')
      .then(response => {
        setCountries(response.data);
      })
  }, []);

  const handleCountryFilterChange = (event) => {
    setCountryFilter(event.target.value);
    setShowCountry('');
  }

  const handleShowButtonClick = (event) => {
    const countryText = event.target.closest('li').textContent;
    const countryName = countryText.slice(0, countryText.length - 4);
    setShowCountry(countryName);
    console.log(showCountry);
  }

  const filterCountryList = (filter) => {
    const regex = new RegExp(filter, 'i');
    return countries.filter(country => {
      return !!country.name.match(regex);
    });
  }

  return (
    <div>
      <div>
        find countries
        <input value={countryFilter} onChange={handleCountryFilterChange} />
      </div>
      <DisplayCountries 
        countryFilter={countryFilter}
        filterCountryList={filterCountryList}
        handleShowButtonClick={handleShowButtonClick}
      />
      <ShowCountryData showCountry={showCountry} countries={countries} />
    </div>
  );
};

export default App;
