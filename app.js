document.addEventListener("DOMContentLoaded", function() {
//tek kad ucitamo lepo celu stranicu se pokrene
  loadStats();
 
  var myModalInfo = new bootstrap.Modal(document.getElementById("myModalInfo"));
  var myModalStats = new bootstrap.Modal(document.getElementById("myModalStats"));
  document.getElementById("btnHelp").onclick = function(){myModalInfo.show(); }
  document.getElementById("btnStats").onclick = function(){calcStats(); myModalStats.show(); }
  document.getElementById("btnNewGame").onclick = function() {startNewGame();};

    function startNewGame() {
      //potencijalno ne treba opet biranje
      var randomIndex = Math.floor(Math.random() * validWords.length);
      secretWord = validWords[randomIndex];
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          grid[r][c] = "";
        } 
      }
      currentRow = 0;
      currentCol = 0;
      attemptCounter = 1;
      for (var i = 0; i < board.children.length; i++) {
        board.children[i].textContent = "";
        board.children[i].className = "tile";
      }
      var keys = keyboard.querySelectorAll('.key');
      keys.forEach(function(btn){
        btn.className = "key";
      });
      board.removeAttribute("title");
    }

  function showAlert(type, message) {
    var alertNotInDict = document.getElementById('alertNotInDict');
    var alertWin = document.getElementById('alertWin');
    var alertLose = document.getElementById('alertLose');
   
    if (type === 'notindict') {
    alertNotInDict.textContent = message || 'Word is not in the dictionary!';
      alertNotInDict.style.display = 'block';
      setTimeout(function(){ alertNotInDict.style.display = 'none'; }, 2000);
    }
    if (type === 'win') {
    alertWin.textContent = message || 'You guessed the word!';
      alertWin.style.display = 'block';
      setTimeout(function(){ alertWin.style.display = 'none'; }, 2000);
    }
    if (type === 'lose') {
    alertLose.textContent = message || 'You lost! The secret word was: ' + secretWord;
      alertLose.style.display = 'block';
      setTimeout(function(){ alertLose.style.display = 'none'; }, 3000);
    }
  }

  var rows = 6, cols = 5;
  var LETTERS = [
    "A","B","C","D","E","F","G","H","I","J",
    "K","L","M","N","O","P","Q","R","S","T",
    "U","V","W","X","Y","Z"
  ];

  var validWords = [];
  if (window.WORDS) {
    for (var i = 0; i < window.WORDS.length; i++) {
      validWords.push(window.WORDS[i].toUpperCase());
    }
  }

  var secretWord;
  var randomIndex = Math.floor(Math.random() * validWords.length);
  secretWord = validWords[randomIndex];

  var grid = [];
  for (var r = 0; r < rows; r++) {
    var rowArr = [];
    for (var c = 0; c < cols; c++) {
      rowArr.push("");
    }
    grid.push(rowArr);
  }

  var currentRow = 0, currentCol = 0;
  var attemptCounter = 1;
  
  var board = document.getElementById("board");
  var keyboard = document.getElementById("keyboard");

  keyboard.addEventListener("click", function(e) {
    if (e.target.classList.contains("key")) {
      var k = e.target.dataset.key;
      handleKey(k);
    }
  });

  document.addEventListener("keydown", function(e){
    var k = e.key;
    if (k === "Enter") k = "enter";
    if (k === "Backspace" || k === "Delete") k = "delete";
    if (LETTERS.indexOf(k.toUpperCase()) !== -1) k = k.toUpperCase();
    if (["enter","delete"].concat(LETTERS).indexOf(k) !== -1) {
      e.preventDefault();
      handleKey(k);
    }
  });

  window.handleKey = function(k){
    
    if (currentRow >= rows) return;
    if (k === "enter") 
      return onEnter();
    if (k === "delete") 
      return onDelete();
    if (currentCol < cols && /^[A-Z]$/.test(k)) {
      grid[currentRow][currentCol] = k;
      var tile = board.children[currentRow*cols + currentCol];
      tile.textContent = k;
      tile.classList.add("filled");
      tile.classList.add("tile-animate");
      setTimeout(function(){ tile.classList.remove("tile-animate"); }, 180);
      currentCol++;
    }
  }

  function onDelete(){
    if (currentCol > 0) {
      currentCol--;
      grid[currentRow][currentCol] = "";
      var t = board.children[currentRow*cols + currentCol];
      t.textContent = "";
      t.classList.remove("filled");
      t.classList.add("tile-animate");
      setTimeout(function(){ t.classList.remove("tile-animate"); }, 180);
    }
  }

  function onEnter(){
    if (currentCol !== cols) return;
    var guess = "";
    for (var i = 0; i < cols; i++) {
      guess += grid[currentRow][i];
    }
    guess = guess.toUpperCase();
    if (validWords.indexOf(guess) === -1) {
      showAlert('notindict');
      return;
    }
    var res = [];
    var used = {};
    for (var i = 0; i < cols; i++) res.push("gray");
    for (var i = 0; i < cols; i++) {
      if (guess[i] === secretWord[i]) {
        res[i] = "green";
        used[i] = 1;
      }
    }
    for (var i = 0; i < cols; i++) {
      if (res[i] !== "green" && secretWord.indexOf(guess[i]) !== -1 && !used[i]) {
        res[i] = "yellow";
      }
    }
    
    for (var c = 0; c < cols; c++) {
      var t = board.children[currentRow*cols+c];
      //dodajemo boju tileu
      t.classList.add(res[c]);
      
      //dugme na digi tastaturi
      var btn = keyboard.querySelector('[data-key="'+grid[currentRow][c]+'"]');
      if (btn) btn.classList.add(res[c]);
      
      if (btn && res[c] === "gray" && secretWord.indexOf(grid[currentRow][c]) === -1) 
        {
          btn.classList.add("used-gray");
        }
    }
    if (guess === secretWord) {
      board.setAttribute("title","Secret word: " + secretWord);
      updateStats(attemptCounter);
      showAlert('win');
      currentRow = rows;
      return;
    }
    currentRow++;
    currentCol = 0;
    attemptCounter++;
    if (currentRow >= rows) {
      board.setAttribute("title","Secret word: " + secretWord);
      updateStats(0);
      showAlert('lose', 'You lost! Secret word was: ' + secretWord);
    }
  }
  
  var sessionStats = {};

  function readStats() {
  if (sessionStats) {
    return sessionStats;
  } else {
    return {};
  }
}

  function loadStats() {
  const data = localStorage.getItem("wordleStats");
  if (data) {
    sessionStats = JSON.parse(data);
  } else {
    sessionStats = {};
  }
}

  function saveStats() {
    localStorage.setItem("wordleStats", JSON.stringify(sessionStats));
  }

  function updateStats(result) {
  // zovemo kad pogodimo ili istrosimo sve pokusaje
  if (sessionStats[result]) {
    sessionStats[result]++;
  } else {
    sessionStats[result] = 1;
  }
  saveStats();
  calcStats();
}
  //globalno dostupna funkcija
  window.calcStats = function(){
      var s = readStats();
      var attempts = ["1","2","3","4","5","6","0"];
      var totalGamesPlayed = 0;
      attempts.forEach(function(k) {
        if (s[k] === undefined) {
          totalGamesPlayed += 0;
        } else {
          totalGamesPlayed += s[k];
        }
      });

      var maxHeight = 140; // px
      attempts.forEach(function(k) {
        var el = document.getElementById("stat" + k);
        if (el) {
          var value = s[k] === undefined ? 0 : s[k];
          var percent = totalGamesPlayed ? (value/totalGamesPlayed) : 0;
          el.style.height = (percent * maxHeight) + "px";
          el.textContent = value > 0 ? value : "";
        }
      });
  }
});