import { useState } from 'react';

const Button = ({ onClick, text}) => {
  return (
    <button onClick={onClick}>{text}</button>
  );
};

const Display = ({ text, value, suffix }) => {
  return (
    <p>{text} {value} {suffix}</p>
  );
};

const App = () => {
  const [good, setGood] = useState(0);
  const [neutral, setNeutral] = useState(0);
  const [bad, setBad] = useState(0);

  return (
    <div>
      <h1>give feedback</h1>
      <Button onClick={() => setGood(good + 1)} text='good' />
      <Button onClick={() => setNeutral(neutral + 1)} text='neutral' />
      <Button onClick={() => setBad(bad + 1)} text='bad' />
      <h1>statistics</h1>
      <Display text='good' value={good} />
      <Display text='neutral' value={neutral} />
      <Display text='bad' value={bad} />
      <Display text='all' value={good + neutral + bad} />
      <Display text='average' value={((good * 1) + (neutral * 0) + (bad * -1)) / (good + neutral + bad)} />
      <Display text='positive' value={(good / (good + neutral + bad)) * 100} suffix='%' />
    </div>
  );
};

export default App;
