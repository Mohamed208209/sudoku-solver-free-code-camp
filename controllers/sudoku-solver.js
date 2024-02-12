class SudokuSolver {

  validate(puzzleString) {
    // Check to see if the string is the right length
    //if (puzzleString.length !== 81) return false;

    // Check to see if all the values are . or 0-9
    //let searchVal = puzzleString.search(/[^.0-9]/g);
    let numerals = puzzleString.match(/[1-9]/g);
    let periods = puzzleString.match(/[.]/g)

    let test1 = periods ? periods.length : 0;
    let test2 = numerals ? numerals.length : 0; 

    //console.log(test1, test2);
    //console.log(test1 + test2 === 81);

    return test1 + test2 === 81;

    //if (searchVal === -1) return true;
    //else return false;

    //return test;

  }

  createNewPuzzle(puzzleString, row, column, value) {
    const rowMod = row - 1;
    const colMod = column - 1;
    const index = rowMod * 9 + colMod;

    //console.log(index, puzzleString[index]);

    // Add the new value to the string in the correct position
    const puzzleArray = puzzleString.split("");
    puzzleArray[index] = value;
    const newPuzzle = puzzleArray.join("");

    return newPuzzle;
  }

  duplicateCheck(puzzleString) {
    return puzzleString.split("").every((val, index, array) => {
      if (val === ".") return true;
      
      let slicedArray = array.slice(0, index).concat(array.slice(index + 1));
      //console.log(">>", val, slicedArray);
      
      return slicedArray.indexOf(val) == -1;
    });
  }

  checkRowPlacement(puzzleString, row, column, value) {
    
    const newPuzzle = this.createNewPuzzle(puzzleString, row, column, value);

    // Extract the row that the value pertains to
    let rowStr = newPuzzle.substr((row - 1) * 9, 9);
    
    //console.log(puzzleString.substr(rowMod * 9, 9));
    //console.log(rowStr);

    // Make sure there are no duplicates in the string
    return this.duplicateCheck(rowStr);
  }

  checkColPlacement(puzzleString, row, column, value) {
    const newPuzzle = this.createNewPuzzle(puzzleString, row, column, value);

    let colStr = "";
    let currentRow = 0;

    while (currentRow < 9) {
      colStr += newPuzzle[currentRow * 9 + (column - 1)];
      currentRow += 1;
    }

    //console.log(colStr);
    
    // Make sure there are no duplicates in the string
    return this.duplicateCheck(colStr);
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    const newPuzzle = this.createNewPuzzle(puzzleString, row, column, value);

    const vertSection = Math.ceil(row / 3) - 1; // 0, 1, or 2
    const horzSection = Math.ceil(column / 3) - 1; // 0, 1, or 2

    const startingIndex = vertSection * 27 + horzSection * 3;
    //console.log(vertSection, horzSection, startingIndex);

    var rowCount = 0;
    var currentIndex = startingIndex;
    let regionStr = "";

    while (rowCount < 3) {
      currentIndex = startingIndex + rowCount * 9;
      regionStr += newPuzzle.substr(currentIndex, 3);
      //console.log(regionStr);
      rowCount++;
    }

    //console.log(regionStr);

    return this.duplicateCheck(regionStr);
  }

  solve(puzzleString) {
    if (!this.validate(puzzleString)) {
      return null;
    }
    // Return the string if the first test is passed and there are no periods in the string
    else if (puzzleString.split("").indexOf(".") < 0) {
      // Make sure the values in the puzzle are correct and there are no conflicts
      const puzzleCheck = puzzleString.split("").every((val, index, array) => {
        let row = Math.floor(index / 9);
        let column = index % 9;
        return this.checkColPlacement(puzzleString, row + 1, column + 1,val)
                && this.checkColPlacement(puzzleString, row + 1, column + 1, val)
                && this.checkRegionPlacement(puzzleString, row + 1, column + 1, val);
      });
      
      // Return null if the puzzle check is false
      if (!puzzleCheck) return null;

      // Otherwise return the string input
      return puzzleString;

    }
    else {

      let coordinatesDict = {};

      let row = 0;
      let column = 0;
      let index = 0;
  
      // Create a dictionary for the row
      while (row < 9) {

        // Reset the column if it's "maxed out"
        if (column > 8) {
          column = 0;
          row++;
        }

        // Calculate the index of the value in the string using the row and column
        index = row * 9 + column;
        
        // Process the puzzle properly depending on whether the current value is "." or a number
        if (puzzleString[index] === ".") {
          // Test different values for the current coordinate in the sudoku
          for (let j = 1; j < 10; j++) {
            if (this.checkRowPlacement(puzzleString, row + 1, column + 1, j) 
                && this.checkColPlacement(puzzleString, row + 1, column + 1, j)
                && this.checkRegionPlacement(puzzleString, row + 1, column + 1, j)) {
                  if (!coordinatesDict[index]) coordinatesDict[index] = [j];
                  else coordinatesDict[index].push(j);
                }
          }
        } 

        // Increment the column
        column++;
      }
  
      //console.log(coordinatesDict);
      //console.log(Object.values(coordinatesDict));

      // Return the string if there are no possible values to be chosen from in the dictionary
      if (Object.entries(coordinatesDict).length === 0 && puzzleString.split("").indexOf(".") < 0) {
        return puzzleString;
      }

      // Return null if the dictionary doesn't contain any coordinate keys mapped to 1 value
      if (!Object.values(coordinatesDict).map(val => val ? val.length : 0).includes(1) && puzzleString.includes(".")) {
        console.log
        return null;
      };

      return this.solve(this.createNewPuzzleDict(puzzleString, coordinatesDict))

    }

  }

  createNewPuzzleDict(puzzleString, dictionary) {
    // Add the new value to the string in the correct position
    const puzzleArray = puzzleString.split("");
    
    // Iterate through the entries in the object
    // Replace the periods with numbers if the array value only has one value 
    Object.entries(dictionary).forEach(([key, value]) => {
      if (value.length == 1) {
        puzzleArray[key] = value;
      }
    });

    const newPuzzle = puzzleArray.join("");

    return newPuzzle;
  }
}


module.exports = SudokuSolver;