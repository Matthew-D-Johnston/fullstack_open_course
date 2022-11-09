import { useState } from 'react'

const App = () => {
  const anecdotes = [
    'If it hurts, do it more often.',
    'Adding manpower to a late software project makes it later!',
    'The first 90 percent of the code accounts for the first 10 percent of the development time...The remaining 10 percent of the code accounts for the other 90 percent of the development time.',
    'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    'Premature optimization is the root of all evil.',
    'Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.',
    'Programming without an extremely heavy use of console.log is same as if a doctor would refuse to use x-rays or blood tests when diagnosing patients.'
  ];
  
  const initialVotes = {};
  anecdotes.forEach(anecdote => initialVotes[anecdote] = 0);

  const randomNumberGenerator = (upperLimit) => {
    return Math.floor(Math.random() * upperLimit);
  };

  const handleClickForNextAnecdote = () => {
    setSelected(randomNumberGenerator(anecdotes.length));
  }

  const handleClickForVote = () => {
    let newVotes = {
      ...votes
    };
    console.log(newVotes);
    newVotes[anecdotes[selected]] += 1;
    setVotes(newVotes);
  }

  const anecdoteWithMostVotes = () => {
    let anecdoteRankings = Object.values(votes).sort((a, b) => b - a);
    let mostVotes = anecdoteRankings[0];
    let anecdoteIndex = Object.values(votes).indexOf(mostVotes);
    return Object.keys(votes)[anecdoteIndex];
  }
   
  const [selected, setSelected] = useState(0);
  const [votes, setVotes] = useState(initialVotes);

  return (
    <div>
      <h1>Anecdote of the day</h1>
      <p>{anecdotes[selected]}</p>
      <p>has {votes[anecdotes[selected]]} votes</p>
      <button onClick={handleClickForVote}>vote</button>
      <button onClick={handleClickForNextAnecdote}>next anecdote</button>
      <h1>Anecdote with most votes</h1>
      <p>{anecdoteWithMostVotes()}</p>
      <p>has {votes[anecdoteWithMostVotes()]} votes</p>
    </div>
  );
};

export default App;
