import React, { useState, useRef, useEffect } from 'react';
import './App.css';

// TDL:
// - Add a button to remove a row, maybe move add/remove somewhere else so they aren't moved around when rows are added/removed
// - Add a button to clear all rows
// - Add a check for calculating solutions when a row doesnt have every box filled
// - Fix logic for calculating solutions when a row has duplicate letters
// - Brainstorm solutions for frontend box clicking
// - Add a readme


// component that represents a single letter box, includes a letter and a color
function WordBox({ letter, onLetterChange, color, onColorChange, onInput }) {
  const colors = ['gray', 'yellow', 'green'];

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
  const [colors, setColors] = useState(Array.isArray(guess.colors) ? guess.colors : []); // provide a default value for guess.colors
  const inputsRef = useRef([]); // create a ref for the inputs

  useEffect(() => {
    setColors(guess.colors); // update colors when guess.colors changes
  }, [guess.colors]);

  const handleInput = (index) => {
    if (index < letters.length - 1 && inputsRef.current[index + 1]) { // check if the ref is defined
      inputsRef.current[index + 1].focus(); // move the focus to the next box
    }
  };

  const handleColorChange = (index, newColor) => {
    const newColors = Array.isArray(colors) ? [...colors] : []; // check if colors is an array before spreading it
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
          color={colors && colors[index]} // check if colors is defined before accessing its elements
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
  const [guesses, setGuesses] = React.useState([{ word: '     ', colors: ['gray', 'gray', 'gray', 'gray', 'gray'] }]);
  const [dictionary, setDictionary] = useState([]);
  const [solutions, setSolutions] = useState([]);

  const addRow = () => {
    if (guesses.length < 6) {
      setGuesses([...guesses, { word: '     ', colors: ['gray', 'gray', 'gray', 'gray', 'gray'] }]);
    }
  };

  const removeRow = () => {
    if (guesses.length > 0) {
      const newGuesses = guesses.slice(0, -1);
      setGuesses(newGuesses);
    }
  };

  const clearRows = () => {
    const clearedGuess = { word: '     ', colors: ['gray', 'gray', 'gray', 'gray', 'gray'] };
    setGuesses([clearedGuess]);
  };

  const handleWordChange = (index, newWord, newColors) => {
    const newGuesses = [...guesses];
    newGuesses[index] = { word: newWord, colors: newColors };
    setGuesses(newGuesses);
  };

  // fetch the dictionary file when the component mounts
  useEffect(() => {
    fetch('/data/solutions.txt')
      .then(response => response.text())
      .then(data => {
        const words = data.split('\n'); // split the file contents into an array of words
        setDictionary(words);
        console.log(words); // log the dictionary to the console
      });
  }, []);


  const calculateSolutions = () => {
    console.log(`Calculating solutions... from ${dictionary.length} words`);
  
    if (dictionary.length === 0) {
      console.log('Dictionary is not loaded yet.');
      return;
    }
  
    if (dictionary.some(word => word === undefined)) {
      console.log('There are undefined words in the dictionary.');
      return;
    }
    
    // each word in the dictionary is followed by a newline character, so we need to remove it, and then convert to uppercase
    let solutions = dictionary.map(word => word.replace('\r', '').toUpperCase());

    /* 
    the hints from each guess need to be evaluated respective to the other letters in the guess
    for example, if the guess is 'SASSY' and the hints are ['yellow', 'gray', 'gray', 'green', 'gray'],
    the duplicate S's changes the hint that would otherwise be evaluated differently if each letter was evaluated irrespectively of the guess
    in this case, we have a yellow S and a gray S, which wouldn't be possible if the letters weren't repeated within the same guess
    as such, the solution is obtained by filtering the solutions based on the hints of each guess one guess at a time
    */

    // split the guess into an array of objects containing the letter and color
    // create a map for each guess that maps each letter to an array of objects containing the color and index of the letter
    // ex: 'SASSY' -> [{ S: [{ color: 'gray', index: 0 }, { color: 'yellow', index: 2 }, { color: 'green', index: 3 }], A: [{ color: 'gray', index: 2 }], Y: [{ color: 'gray', index: 3 }] }]
    let guessMaps = guesses.map(guess => {
      let map = new Map();
      guess.word.split('').forEach((letter, index) => {
        // check if guess.colors is an array and it has an element at the index index
        let color = Array.isArray(guess.colors) && guess.colors.length > index ? guess.colors[index] : undefined;
        if (map.has(letter)) {
          map.get(letter).push({ color, index });
        } else {
          map.set(letter, [{ color, index }]);
        }
      });
      return map;
    });
    
    // filter the solutions based on the guess maps
    // iterate over each guess map and check if the word is a valid solution
    solutions = solutions.filter(word => {
      for (let guessMap of guessMaps) {
        // iterate over each letter in the guess map
        for (let [letter, hints] of guessMap) {
          // get the indices of the letter in the guess word along with the indices of the green, yellow, and gray hints

          // create a new global regex to match all instances of the letter in the word, the ...matchAll converts the returned iterator to an array
          // the resulting array is mapped to get the index of each match and saved in wordIndices
          let wordIndices = [...word.matchAll(new RegExp(letter, 'g'))].map(match => match.index); 

          // filter the hints to get the indices of the green, yellow, and gray hints
          let greenIndices = hints.filter(hint => hint.color === 'green').map(hint => hint.index);
          let yellowIndices = hints.filter(hint => hint.color === 'yellow').map(hint => hint.index);
          let grayIndices = hints.filter(hint => hint.color === 'gray').map(hint => hint.index);
    
          let greenCount = greenIndices.length;
          let yellowCount = yellowIndices.length;
          let grayCount = grayIndices.length;

          let letterCount = wordIndices.length;

          // this check ensures that the indices of the green hints match the indicies of the letter in the word
          if (greenCount > letterCount || greenIndices.some(index => !wordIndices.includes(index))) {
            return false;
          }

          // this check ensures that words containing the yellow letters don't have the same index, as
          // the yellow letters suggest a letter is in the word, but not in the same position
          if (yellowCount > letterCount - greenCount || yellowIndices.some(index => wordIndices.includes(index))) {
            return false;
          }

          // this check ensures that the num gray hints is not less than the num occurences of the letter in the word minus the num green hints and yellow hints
          // basically, it's ensuring that the gray hints are not suggesting that a letter is not in the word when it is by double checking the existing hints in the guess
          if (grayCount < letterCount - greenCount - yellowCount) {
            return false;
          }
        }
      }

      // if the word made it through the filtering checks, then it is a possible solution
      return true;
    });

    console.log('Current possible solutions:', solutions);
    setSolutions(solutions);
  };

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Wordle Solver</h1>
      {guesses.map((guess, index) => (
        <WordRow key={index} guess={guess} onWordChange={(newWord, newColors) => handleWordChange(index, newWord, newColors)} />
      ))}
      <h2>Possible Solutions:</h2>
      <div style={{ maxWidth: '700px', height: '200px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
        {solutions.join(' ')}
      </div>
    </div>
    <div style={{ position: 'absolute', right: '15%', top: '10%', display: 'flex', flexDirection: 'column' }}>
      <button className="button" onClick={addRow}>Add Row</button>
      <button className="button" onClick={removeRow}>Remove Row</button>
      <button className="button" onClick={clearRows}>Clear Rows</button>
      <button className="button" onClick={calculateSolutions}>Calculate Solutions</button>
    </div>
  </div>
  );
}

export default App;
