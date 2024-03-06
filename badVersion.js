class CheckersBoard {
  constructor() {
    this.boardElement = document.getElementById("board");
    this.squares = [];
    this.currentPlayer = 'black';
    this.createBoard();
    this.createPieces();
  }

  createBoard() {
    for (let row = 0; row < 8; row++) {
      this.squares[row] = [];
      for (let col = 0; col < 8; col++) {
        const square = document.createElement("div");
        square.classList.add("square", (row + col) % 2 === 0 ? "light" : "dark");
        square.dataset.row = row;
        square.dataset.col = col;
        square.addEventListener("click", this.handleSquareClick.bind(this));
        this.squares[row][col] = square;
        this.boardElement.appendChild(square);
      }
    }
  }
  createPieces() {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 !== 0) {
          const redPiece = new Piece("red");
          this.placePiece(redPiece, row, col);
        }
      }
    }
    for (let row = 5; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 !== 0) {
          const blackPiece = new Piece("black");
          this.placePiece(blackPiece, row, col);
        }
      }
    }
  }
  placePiece(piece, row, col) {
    piece.placePiece(row, col);
    const pieceElement = piece.createPieceElement();
    this.squares[row][col].appendChild(pieceElement);
    pieceElement.addEventListener("click", this.handlePieceClick.bind(this, piece, row, col));
    // console.log('Piece placed at', row, col);
  }

  handleSquareClick(event) {
    const clickedSquare = event.target;
    const row = parseInt(clickedSquare.dataset.row);
    const col = parseInt(clickedSquare.dataset.col);
    // Check if the clicked square is one of the highlighted legal moves
    if (clickedSquare.classList.contains('highlight')) {
      // Move the piece to the clicked square
      const piece = this.selectedPiece;
      // console.log(piece + 'hello');
      const currentRow = piece.row;
      const currentCol = piece.col;

      // Check if the move involves capturing (jumping over)
      console.log(row, 'row');
      console.log(currentRow, 'currentRow');
      console.log(Math.abs(row - currentRow), 'abs of row - currentRow');
      if (Math.abs(row - currentRow) === 2) {
        console.log('Capturing Move Detected');
        // Calculate the position of the captured piece
        const capturedRow = (row + currentRow) / 2;
        const capturedCol = (col + currentCol) / 2;

        // Remove the captured piece from the board
        // const capturedSquare = this.squares[capturedRow][capturedCol];
        // console.log(capturedSquare, 'Captured Square');
        // capturedSquare.innerHTML = '';
        const capturedPiece = this.getPieceAtPosition(capturedRow, capturedCol);
        console.log(capturedPiece, 'Captured Piece');
        capturedPiece.placePiece(-1, -1); // Place the captured piece off the board
      }

      // Move the piece to the clicked square
      this.movePiece(piece, row, col);


      // Reset highlights and switch players
      this.clearHighlights();
      this.switchPlayer();
    }

    this.selectedPiece = null;
    // console.log(`Clicked on square (${row}, ${col})`);
  }
  handlePieceClick(piece, row, col, event) {
    let moves = [];
    event.stopPropagation();
    this.selectedPiece = piece;
    //movement
    if (this.currentPlayer === piece.color) {
      moves = this.getMoves(piece, row, col);
      // console.log(this.getMoves(piece, row, col));
    }
    // Check if the piece can be promoted to a king
    if ((piece.color === "red" && row === 7) || (piece.color === "black" && row === 0)){
      piece.allHail();
    }
    if(moves.length > 0){
      this.clearHighlights();
      this.highlightLegalMoves(moves);
    }


    const clickedSquare = this.squares[row][col];
    const isPieceThere = clickedSquare.querySelector(`.piece.${piece.color}-piece`) !== null;
    console.log(`Piece present: ${isPieceThere}`);

    console.log('Selected Piece:', this.selectedPiece);
    console.log('Available Moves:', moves);
    console.log('Current Player:', this.currentPlayer);

    // For now, let's just log the piece color, position, and whether it's a king
      console.log(`Clicked on ${piece.color} piece at (${row}, ${col}) - King: ${piece.isKing ? 'Yes' : 'No'}`);

  }
  
  switchPlayer(){
    // console.log(this.currentPlayer);
    if(this.currentPlayer === 'black')
      this.currentPlayer = 'red';
    else
      this.currentPlayer = 'black';
    // console.log(this.currentPlayer);
  }
  
  movePiece(piece, targetRow, targetCol) {
    // Remove the piece from the current position
    const currentSquare = this.squares[piece.currentRow][piece.currentCol];
    currentSquare.innerHTML = '';

    // Remove the click event listener
    piece.pieceElement.removeEventListener('click', this.handlePieceClick);

    // Move the piece to the new position
    const targetSquare = this.squares[targetRow][targetCol];
    targetSquare.appendChild(piece.pieceElement);

    // Add the click event listener to the new position
    piece.pieceElement.addEventListener('click', this.handlePieceClick.bind(this, piece, targetRow, targetCol));

    // Update the piece's current position
    piece.currentRow = targetRow;
    piece.currentCol = targetCol;
  }

  getPieceAtPosition(row, col) {
    return this.squares[row][col].querySelector('.piece');
  }

  getMoves(piece, row, col) {
    const availableMoves = [];
    const captureMoves = [];

    // Check possible moves based on the piece's color
    if (piece.color === 'red' || piece.isKing) {
      if (this.isValidMove(piece, row + 1, col + 1)) {
        availableMoves.push([row + 1, col + 1]);
        console.log('+1+1 available');
      }
      if (this.isValidMove(piece, row + 1, col - 1)) {
        availableMoves.push([row + 1, col - 1]);
        console.log('+1-1 available');
      }
      if (this.canCapture(piece, row, col, row + 1, col + 1)) {
        captureMoves.push([row + 2, col + 2]);
        console.log('+2+2 capture available');
      }
      if (this.canCapture(piece, row, col, row + 1, col - 1)) {
        captureMoves.push([row + 2, col - 2]);
        console.log('+2-2 capture available');
      }
    }

    if (piece.color === 'black' || piece.isKing) {
      if (this.isValidMove(piece, row - 1, col + 1)) {
        availableMoves.push([row - 1, col + 1]);
        console.log('-1+1 available');
      }
      if (this.isValidMove(piece, row - 1, col - 1)) {
        availableMoves.push([row - 1, col - 1]);
        console.log('-1-1 available');
      }
      if (this.canCapture(piece, row, col, row - 1, col + 1)) {
        captureMoves.push([row - 2, col + 2]);
        console.log('-2+2 capture available');
      }
      if (this.canCapture(piece, row, col, row - 1, col - 1)) {
        captureMoves.push([row - 2, col - 2]);
        console.log('-2-2 capture available');
      }
    }
    console.log(captureMoves, 'captureMoves array');
    console.log(availableMoves, 'availableMoves array');
    if(captureMoves.length !== 0)
      return captureMoves;
    else
      return availableMoves;
  }
  // Helper function to check if a move is valid
  isValidMove(piece, targetRow, targetCol) {
    return this.withinBounds(targetRow, targetCol) && this.isPieceThere(targetRow, targetCol) !== piece.color && !this.blocked(targetRow, targetCol);
  };
  // Helper function to check if a square contains a piece
  isPieceThere(targetRow, targetCol) {
    const checkedSquare = this.squares[targetRow][targetCol];
    return checkedSquare.querySelector('.piece') !== null;
  };
  // Helper function to check if a move is within the board boundaries
  withinBounds(targetRow, targetCol) {
    return targetRow >= 0 && targetRow < 8 && targetCol >= 0 && targetCol < 8;
  };
  // Helper function to check if a move is blocked by another piece
  blocked(targetRow, targetCol) {
    return this.isPieceThere(targetRow, targetCol);
  };

  canCapture(piece, startRow, startCol, targetRow, targetCol) {
    console.log('canCapture is running');
    // Check if the target square is within bounds
    if (!this.withinBounds(targetRow, targetCol)) {
      return false;
    }

    // Check if the target square is empty
    if (this.isPieceThere(targetRow, targetCol)) {
      return false;
    }

    // Calculate the position of the captured piece
    const capturedRow = (startRow + targetRow) / 2;
    const capturedCol = (startCol + targetCol) / 2;

    // Check if there is an opposing piece to capture
    const capturedPiece = this.squares[capturedRow][capturedCol].querySelector('.piece');
    return capturedPiece !== null && capturedPiece.classList.contains(piece.color === 'red' ? 'black-piece' : 'red-piece');
  }
  
  highlightLegalMoves(moves) {
    // Clear previous highlights
    this.clearHighlights();

    // Highlight the new squares
    moves.forEach(([row, col]) => {
      this.highlightSquare(row, col);
    });
  }
  highlightSquare(row, col) {
    this.squares[row][col].classList.add("highlight");
  }
  clearHighlights() {
    document.querySelectorAll(".highlight").forEach((square) => {
      square.classList.remove("highlight");
    });
  }
}
class Piece {
  constructor(color) {
    this.color = color;
    this.isKing = false;
    this.currentRow = null;
    this.currentCol = null;
    this.pieceElement = this.createPieceElement();
  }

  createPieceElement() {
    const pieceElement = document.createElement("div");
    pieceElement.classList.add("piece", this.color === "red" ? "red-piece" : "black-piece");
    // Create a text node with the initial letter (S)
    let textNode = document.createTextNode("S");
     // Append the text node to the piece element
    piece
      Element.appendChild(textNode);
    return pieceElement;
  }
  placePiece(row, col) {
    this.currentRow = row;
    this.currentCol = col;
    // super.placePiece(row, col);
  }
  allHail(){
    this.isKing = true;
    if (this.pieceElement) {
      this.pieceElement.firstChild.nodeValue = "K";
    }
  }
}
document.addEventListener("DOMContentLoaded", function () {
    const checkersBoard = new CheckersBoard();
});