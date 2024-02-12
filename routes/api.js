'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  
  // Function taken from https://newbedev.com/express-logging-response-body
  function logResponseBody(req, res, next) {
    var oldWrite = res.write,
        oldEnd = res.end;
  
    var chunks = [];
  
    res.write = function (chunk) {
      chunks.push(chunk);
  
      return oldWrite.apply(res, arguments);
    };
  
    res.end = function (chunk) {
      if (chunk)
        chunks.push(chunk);
  
      var body = Buffer.concat(chunks).toString('utf8');
      console.log(req.path, body);
  
      oldEnd.apply(res, arguments);
    };
  
    next();
  }

  function logRequestInfo(req, res, next) {
    console.log();
    console.log('Request Type: ', req.method);
    console.log(`Request Data Sent: `, req.body);

    next();
  }

  //app.use(logRequestInfo);
  //app.use(logResponseBody);
  

  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {
      // Get the information sent to the route
      const puzzle = req.body.puzzle;
      const coordinate = req.body.coordinate;
      const value = req.body.value;
      //console.log(puzzle, coordinate, value);

      // Make sure puzzle, coordinate, and value are submitted in the POST request
      if (!puzzle || !coordinate || !value) return res.json({ "error": "Required field(s) missing" });

      // Make sure the puzzle passes validate
      if (!solver.validate(puzzle)) {
        if (puzzle.length !== 81) return res.json({ "error": "Expected puzzle to be 81 characters long" });
        else return res.json({ "error": "Invalid characters in puzzle" });
      }

      // Make sure the coordinate is of valid length (2 characters) and the letter is not A-I
      if (!coordinate.toString().match(/^[A-I]{1}[1-9]{1}$/)) return res.json({ "error": "Invalid coordinate" });

      // Make sure that the characters are numbers between 0 and 8
      if (!value.toString().match(/^[1-9]$/)) return res.json({ "error": "Invalid value" });

      const row = coordinate.charCodeAt(0) - 64;
      const column = coordinate.substr(1);
      //console.log(row, column);

      const rowOk = solver.checkRowPlacement(puzzle, row, column, value);
      const colOk = solver.checkColPlacement(puzzle, row, column, value);
      const regOk = solver.checkRegionPlacement(puzzle, row, column, value);

      const jsonResponse = {};

      if (rowOk && colOk && regOk) jsonResponse["valid"] = true;
      else {
        jsonResponse["valid"] = false;
        jsonResponse["conflict"] = [];
        if (!rowOk) jsonResponse["conflict"].push("row");
        if (!colOk) jsonResponse["conflict"].push("column");
        if (!regOk) jsonResponse["conflict"].push("region");
      }

      return res.json(jsonResponse);

    });
    
  app.route('/api/solve')
    .post((req, res) => {
      const puzzle = req.body.puzzle;

      // Makes sure puzzle is sent with the request
      if (!puzzle) return res.json({ "error": "Required field missing" });

      // Check to see if the puzzle is valid
      if (!solver.validate(puzzle)) {
        if (puzzle.length !== 81) return res.json({ "error": "Expected puzzle to be 81 characters long" });
        else return res.json({ "error": "Invalid characters in puzzle" });
      }

      const solution = solver.solve(puzzle);

      if (!solution) return res.json({ "error": "Puzzle cannot be solved" });

      return res.json({ "solution": solution });

    });
};
