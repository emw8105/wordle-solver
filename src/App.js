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
function WordRow({ guess, onWordChange }) {
  const letters = guess.word.split('');
  const [colors, setColors] = useState(guess.colors); // initialize colors from guess
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
    onWordChange(letters.join(''), newColors); // pass the new colors to the parent component
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
  const [guesses, setGuesses] = React.useState([{ word: '     ', colors: ['grey', 'grey', 'grey', 'grey', 'grey'] }]);
  const [dictionary, setDictionary] = useState([]);

  const addRow = () => {
    if (guesses.length < 6) {
      setGuesses([...guesses, { word: '     ', colors: ['grey', 'grey', 'grey', 'grey', 'grey'] }]);
    }
  };

  const handleWordChange = (index, newWord, newColors) => {
    const newGuesses = [...guesses];
    newGuesses[index] = { word: newWord, colors: newColors };
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
  
    const greyLetters = [];
    const yellowLetters = [];
    const greenLetters = [];
  
    for (const guess of guesses) {
      console.log('Checking guess:', guess)
      if (!guess.word || !guess.word.trim()) { // Check if the word is not just spaces
        console.log('Skipping a guess without a word.');
        continue;
      }

      if (!guess.colors) { // Check if colors is defined
        console.log('Skipping a guess without colors.');
        continue;
      }
      
      console.log('Processing guess:', guess);
      for (let i = 0; i < guess.word.length; i++) {
        const letter = guess.word[i];
        const color = guess.colors[i];
      
        if (color === 'grey') {
          greyLetters.push(letter);
        } else if (color === 'yellow') {
          yellowLetters.push({ letter, index: i });
        } else if (color === 'green') {
          greenLetters.push({ letter, index: i });
        }
      }
    }

    console.log('Grey letters:', greyLetters);
    console.log('Yellow letters:', yellowLetters);
    console.log('Green letters:', greenLetters);

    const solutions = dictionary.filter(word => {
      for (const letter of greyLetters) {
        if (word.includes(letter)) {
          return false; // discard words that include grey letters
        }
      }
  
      for (const { letter, index } of yellowLetters) {
        if (word[index] === letter || !word.includes(letter)) {
          return false; // discard words that include yellow letters at the wrong index or don't include them at all
        }
      }
  
      for (const { letter, index } of greenLetters) {
        if (word[index] !== letter) {
          return false; // discard words that don't include green letters at the correct index
        }
      }
  
      return true; // keep the word if it passed all checks
    });
  
    console.log('Current possible solutions: ' + solutions); // output the solutions
  };

  return (
    <div className="App">
      <h1>Wordle Solver</h1>
      {guesses.map((guess, index) => (
        <WordRow key={index} guess={guess} onWordChange={(newWord, newColors) => handleWordChange(index, newWord, newColors)} />
      ))}
      <button className="button" onClick={addRow}>Add Row</button>
      <button className="button" onClick={calculateSolutions}>Calculate Solutions</button>
    </div>
  );
}

export default App;
