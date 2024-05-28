import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// component that represents a single letter box, includes a letter and a color
function WordBox({ letter, onLetterChange, color, onColorChange, inputRef, onInput }) {
  const colors = ['grey', 'yellow', 'green'];

  const handleClick = () => {
    const currentColorIndex = colors.indexOf(color);
    const nextColorIndex = (currentColorIndex + 1) % colors.length;
    console.log(colors[nextColorIndex])
    onColorChange(colors[nextColorIndex]);
  };

  const handleInputChange = (event) => {
    const newLetter = event.target.value ? event.target.value.toUpperCase() : ' ';
    onLetterChange(newLetter);
    if (newLetter.length >= 1) { // if the box is full
      onInput(); // call the onInput function passed as prop
    }
  };

  return (
    <input
      type="text"
      value={letter}
      onChange={handleInputChange}
      onClick={handleClick}
      className={`word-box ${color}`}
      maxLength="2" // or any number you want
    />
  );
}

// component that represents a row of letter boxes to store a word
function WordRow({ word, onWordChange }) {
  const letters = word.split('');
  const [colors, setColors] = useState(Array(letters.length).fill('grey'));
  const inputsRef = useRef([]); // create a ref for the inputs

  const handleInput = (index) => {
    if (index < letters.length - 1 && inputsRef.current[index + 1]) { // check if the ref is defined
      inputsRef.current[index + 1].focus(); // move the focus to the next box
    }
  };

  const handleColorChange = (index, newColor) => {
    const newColors = [...colors];
    newColors[index] = newColor;
    setColors(newColors);
  };

  const handleLetterChange = (index, newLetter) => {
    const newLetters = [...letters];
    if (newLetter.length > 1) {
      newLetters[index] = newLetter.slice(-1); // take only the last character of the input
    } else {
      newLetters[index] = newLetter;
    }
    onWordChange(newLetters.join('')); // join the letters back into a word
  };

  // render a WordBox for each letter in the word
  return (
    <div className="word-row">
      {letters.map((letter, index) => (
        <WordBox
          key={index}
          letter={letter}
          onLetterChange={(newLetter) => handleLetterChange(index, newLetter)}
          color={colors[index]}
          onColorChange={(newColor) => handleColorChange(index, newColor)}
          inputRef={el => inputsRef.current[index] = el} // pass the ref to the WordBox
          onInput={() => handleInput(index)} // pass the handleInput function to the WordBox
        />
      ))}
    </div>
  );
}

// main App component, renders a WordRow for each guess and has buttons to add a new row and calculate solutions
function App() {
  // guesses is an array of strings where each string represents a guess, updated by the handleWordChange func
  const [guesses, setGuesses] = React.useState(['     ']); // Initialize with a string of five spaces
  const [dictionary, setDictionary] = useState([]);

  const addRow = () => {
    if (guesses.length < 6) {
      setGuesses([...guesses, '     ']);
    }
  };

  const handleWordChange = (index, newWord) => {
    const newGuesses = [...guesses];
    newGuesses[index] = newWord;
    setGuesses(newGuesses);
  };

  // fetch the dictionary file when the component mounts
  useEffect(() => {
    fetch('/data/dictionary.txt')
      .then(response => response.text())
      .then(data => {
        const words = data.split('\n'); // split the file contents into an array of words
        setDictionary(words);
        console.log(words); // log the dictionary to the console
      });
  }, []);

  const calculateSolutions = () => {
    console.log('Calculating solutions...');

    if (dictionary.length === 0) {
      console.log('Dictionary is not loaded yet.');
      return;
    }
  
    if (dictionary.some(word => word === undefined)) {
      console.log('There are undefined words in the dictionary.');
      return;
    }
  
    const lastGuess = guesses[guesses.length - 1]; // this is a string, not an object

    const solutions = dictionary.filter(word => {
    for (let i = 0; i < word.length; i++) {
      const letter = word[i];
      const guessLetter = lastGuess[i]; // access the i-th character of the string

      // you need to determine the color of the i-th guess letter here
      // for now, let's assume it's always 'grey'
      const color = 'grey';

      if (color === 'grey' && letter === guessLetter) {
        return false; // discard words with grey letters
      }

      if (color === 'green' && letter !== guessLetter) {
        return false; // discard words without the green letter in the same index
      }

      if (color === 'yellow' && !word.includes(guessLetter)) {
        return false; // discard words without the yellow letter in any index
      }
    }

    return true; // keep the word if it passed all checks
  });

  console.log(solutions); // output the solutions
  };

  return (
    <div className="App">
      <h1>Wordle Solver</h1>
      {guesses.map((guess, index) => (
        <WordRow
          key={index}
          word={guess}
          onWordChange={newWord => handleWordChange(index, newWord)}
        />
      ))}
      <button className="button" onClick={addRow}>Add Row</button>
      <button className="button" onClick={calculateSolutions}>Calculate Solutions</button>
    </div>
  );
}

export default App;
