# wordle-solver
A simple app to give me a crutch because I take way too long to make guesses and Brian beats me way too consistently. The bot is designed to help with filtering out impossible words based on existing hints to strategically remove all elements of skill from the puzzle 😋.

## Usage
After following the deployment guide found in the generated create-react-app portion of the readme, get the app running and pul it up alongside the Wordle (Found [here](https://www.nytimes.com/games/wordle/index.html))

Then, alternate between making a guess in the Wordle and entering the hints resulting from that guess into the app. Clicking on the box cycles the color between gray, yellow, and green respective to the hint provided from the Wordle. In this case, the colors represent the following:
- If a letter is green, then it means that the solution contains that letter at the index it was found to be green in (therefore, 5 green letters represents the correct solution because all letters are in the correct place).
- If a letter is yellow, then it means that the solution contains that letter, but at a different index.
- If a letter is gray, then it means that the solution does not contain that letter.

These rules become a bit muddled with duplicate letters in the same guess, but we'll discuss that later.
Once the guess is entered into the row, click the "Calculate Solutions" button to reveal all of the possible words meeting the existing hint criteria. Once one of the possible words has been attempted in the Wordle, add a new row in the app and provide those hints to the bot.
Repeat until the Wordle has been solved.


<!-- <div align="center">
  <img src="https://github.com/emw8105/wordle-solver/blob/main/images/usage%20screenrecording.gif" alt="UI Usage Gif">
  <p>An example of entering a guess into the program</p>
</div> -->



For ease of usage (primary during development), the "Remove Row" and "Clear Rows" buttons were added, the "Remove Row" button removes the bottommost row and the "Clear Rows" button resets the app back to the initial blank singular row to start over.

## Design
While this seemed like an easy endeavor at first, the rules of the Wordle are slightly more complex than initial appearances suggest. Take for example the word "SASSY". In this case, if one of the S's was green, another yellow, and the remaining one gray, this suggests that there exist 2 S's in the solution word, and the green one is in the correct place while the yellow one needs to move to a different position. This complicates simple checks where all words with the gray letter are removed and all words that don't contain the green letter are also removed, thereby removing every word (either it has it or it doesn't). 

What the program needs to do is consider its hint color respective to the other hints revealed for the letters in its respective guess. As a result, a complex series of index checks is performed in the calculateSolutions() function to ensure that the hints aren't stepping over each other's toes. A series of extensive comments have been added to outline what exactly the program is accomplishing at each step to make this process a bit more clear.

Additionally, the resulting solution bank is compiled from a dump of publicized possible Wordle solutions (~2500 possible words). There is an additional extended list (~12000 words) which contains all of the possible words that can be entered as an acceptable guess, but the large majority of them are not possible solutions. As such, this program only uses the list of possible solutions when filtering.


# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
