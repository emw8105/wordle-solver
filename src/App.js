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
  const [guesses, setGuesses] = React.useState([{ word: '     ', colors: ['gray', 'gray', 'gray', 'gray', 'gray'] }]);
  const [dictionary, setDictionary] = useState([]);
  const [solutions, setSolutions] = useState([]);

  const addRow = () => {
    if (guesses.length < 6) {
      setGuesses([...guesses, { word: '     ', colors: ['gray', 'gray', 'gray', 'gray', 'gray'] }]);
    }
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

  const getColor = (letter, index) => {
    for (let guess of guesses) {
      if (guess.word[index] === letter) {
        return guess.colors[index];
      }
    }
    return 'gray'; // default color if the letter is not found
  };


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
  
    const grayLetters = [];
    const yellowLetters = [];
    const greenLetters = [];
  
    guesses.forEach((guess) => {
      if (!guess.colors) {
        console.log('Skipping guess without colors:', guess);
        return;
      }
      
      guess.colors.forEach((color, colorIndex) => {
        const letter = guess.word[colorIndex];
        if (letter === ' ') {
          console.log('Skipping space at color index: ', colorIndex)
          return; // skip spaces
        }
        if (color === 'gray') {
          grayLetters.push(letter);
        } else if (color === 'yellow') {
          yellowLetters.push({ letter: letter, index: colorIndex });
        } else if (color === 'green') {
          greenLetters.push({ letter: letter, index: colorIndex });
        }
      });
    });

    console.log('Gray letters:', grayLetters);
    console.log('Yellow letters:', yellowLetters);
    console.log('Green letters:', greenLetters);
    
    // each word in the dictionary is followed by a newline character, so we need to remove it, and then convert to uppercase
    let solutions = dictionary.map(word => word.replace('\r', '').toUpperCase());

    // new logic will need to do something like this
    // each guess will need to be evaluated separately as the hints in a guess are dependent on each other
    let guessMaps = guesses.map(guess => {
      let map = new Map();
      guess.word.split('').forEach((letter, index) => {
        let color = guess.colors[index];
        if (map.has(letter)) {
          map.get(letter).push({ color, index });
        } else {
          map.set(letter, [{ color, index }]);
        }
      });
      return map;
    });
    
    solutions = solutions.filter(word => {
      for (let guessMap of guessMaps) {
        for (let [letter, hints] of guessMap) {
          let wordIndices = [...word.matchAll(new RegExp(letter, 'g'))].map(match => match.index);
          let greenIndices = hints.filter(hint => hint.color === 'green').map(hint => hint.index);
          let yellowIndices = hints.filter(hint => hint.color === 'yellow').map(hint => hint.index);
          let grayIndices = hints.filter(hint => hint.color === 'gray').map(hint => hint.index);
    
          if (greenIndices.some(index => !wordIndices.includes(index)) || greenIndices.length > wordIndices.length) {
            return false;
          }
          if (yellowIndices.some(index => wordIndices.includes(index)) || yellowIndices.length > wordIndices.length - greenIndices.length) {
            return false;
          }
          if (grayIndices.some(index => wordIndices.includes(index))) {
            return false;
          }
        }
      }
      return true;
    });

    // IMPROVED LOGIC - But doesn't handle multi-letters within guesses, just from sets of all guesses
    // remove duplicate hints across each guess
    // let uniqueGreenLetters = [...new Set(greenLetters.map(JSON.stringify))].map(JSON.parse);
    // let uniqueYellowLetters = [...new Set(yellowLetters.map(JSON.stringify))].map(JSON.parse);
    // let uniqueGrayLetters = [...new Set(grayLetters.map(JSON.stringify))].map(JSON.parse);

    // // check for multi-letter possibilities
    // let multiGreenLetters = uniqueGreenLetters.filter(({ letter }) => 
    //   uniqueGreenLetters.filter(l => l.letter === letter).length > 1
    // );
    // let multiYellowLetters = uniqueYellowLetters.filter(({ letter }) => 
    //   uniqueYellowLetters.filter(l => l.letter === letter).length > 1
    // );
    // let multiGrayLetters = uniqueGrayLetters.filter(({ letter }) => 
    //   uniqueGrayLetters.filter(l => l.letter === letter).length > 1
    // );

    // // remove multi-letter possibilities from unique letters
    // uniqueGreenLetters = uniqueGreenLetters.filter(({ letter }) => 
    //   !multiGreenLetters.some(l => l.letter === letter)
    // );
    // uniqueYellowLetters = uniqueYellowLetters.filter(({ letter }) => 
    //   !multiYellowLetters.some(l => l.letter === letter)
    // );
    // uniqueGrayLetters = uniqueGrayLetters.filter(({ letter }) => 
    //   !multiGrayLetters.some(l => l.letter === letter)
    // );

    // // filter solutions based on new logic
    // solutions = solutions.filter(word => 
    //   uniqueGreenLetters.every(({ letter, index }) => word[index] === letter) &&
    //   uniqueYellowLetters.every(({ letter, index }) => word.includes(letter) && word.indexOf(letter) !== index) &&
    //   multiGreenLetters.every(({ letter }) => word.split(letter).length - 1 >= 2) &&
    //   multiYellowLetters.every(({ letter }) => word.split(letter).length - 1 >= 2) &&
    //   !uniqueGrayLetters.some(({ letter }) => word.includes(letter)) &&
    //   multiGrayLetters.every(({ letter }) => word.split(letter).length - 1 < 2)
    // );


    // OLD LOGIC
    // // filter out words that contain gray letters
    // solutions = solutions.filter(word => !grayLetters.some(letter => word.includes(letter)));
    
    // // filter out words that don't contain all yellow letters
    // solutions = solutions.filter(word => 
    //   yellowLetters.every(({ letter, index }) => 
    //     word.includes(letter) && word.indexOf(letter) !== index
    //   )
    // );
    
    // // filter out words that don't contain all green letters at the correct indices
    // solutions = solutions.filter(word => greenLetters.every(({ letter, index }) => word[index] === letter));
    
    // solutions = solutions.filter(word => 
    //   !yellowLetters.some(letter => 
    //     word[word.indexOf(letter)] === letter && greenLetters.some(green => green.letter === letter)
    //   )
    // );

    console.log('Current possible solutions:', solutions);
    setSolutions(solutions);
  };

  return (
    <div className="App">
      <h1>Wordle Solver</h1>
      {guesses.map((guess, index) => (
        <WordRow key={index} guess={guess} onWordChange={(newWord, newColors) => handleWordChange(index, newWord, newColors)} />
      ))}
      <button className="button" onClick={addRow}>Add Row</button>
      <button className="button" onClick={calculateSolutions}>Calculate Solutions</button>

      <h2>Possible Solutions:</h2>
      <div style={{ width: '100%', height: '200px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
        {solutions.join(' ')}
      </div>
    </div>
  );
}

export default App;
