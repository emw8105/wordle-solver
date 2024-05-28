import React, { useState, useRef } from 'react';
import axios from 'axios';
import './App.css';

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

function App() {
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

  const calculateSolutions = () => {
    // ...
    // 
    console.log('Calculating solutions...');
  };

  return (
    <div className="App">
      {guesses.map((guess, index) => (
        <WordRow
          key={index}
          word={guess}
          onWordChange={newWord => handleWordChange(index, newWord)}
        />
      ))}
      <button onClick={addRow}>Add Row</button>
      <button onClick={calculateSolutions}>Calculate Solutions</button>
    </div>
  );
}

export default App;
