import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

// WordBox component
function WordBox({ letter }) {
  return <div className="word-box">{letter}</div>;
}

// WordRow component
function WordRow({ word }) {
  return (
    <div className="word-row">
      {word.split('').map((letter, index) => (
        <WordBox key={index} letter={letter} />
      ))}
    </div>
  );
}

// Main App component
function App() {
  const [guesses, setGuesses] = React.useState(['not-found', 'found-yellow', 'found-green']);
  const [dictionary, setDictionary] = useState([]);

  useEffect(() => {
    const loadDictionary = async () => {
      const response = await axios.get('/data/dictionary.txt');
      const words = response.data.split('\n');
      setDictionary(words);
    };

    loadDictionary();
  }, []);

  return (
    <div className="App">
      {guesses.map((guess, index) => (
        <WordRow key={index} word={guess} />
      ))}
    </div>
  );
}

export default App;
