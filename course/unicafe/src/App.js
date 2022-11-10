import { useState } from 'react';

const Button = ({ onClick, text}) => {
  return (
    <button onClick={onClick}>{text}</button>
  );
};

const StatisticLine = ({ text, value, suffix }) => {
  return (
    <tr>
      <td>{text}</td>
      <td>{value} {suffix}</td>
    </tr>
  )
}

const Statistics = ({ good, neutral, bad }) => {
  let all = good + neutral + bad;
  let average;
  let positive;

  if (all > 0) {
    average = ((good * 1) + (bad * -1)) / all;
    positive = (good / all) * 100;

    return (
      <table>
        <tbody>
          <StatisticLine text="good" value={good} />
          <StatisticLine text="neutral" value={neutral} />
          <StatisticLine text="bad" value={bad} />
          <StatisticLine text="all" value={all} />
          <StatisticLine text="average" value={average} />
          <StatisticLine text="positive" value={positive} suffix="%" />
        </tbody>
      </table>
    );
  } else {
    return (
      <div>
        <p>No feedback given</p>
      </div>
    );
  }
}

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
      <Statistics good={good} neutral={neutral} bad={bad} />
    </div>
  );
};

export default App;
