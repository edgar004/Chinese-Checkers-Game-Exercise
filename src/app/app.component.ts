import { Component } from '@angular/core';
import { Board } from './class/board.class';
import { ClassCssPiece } from './enums/class-css.eum';
import { ColorPiece } from './enums/color-piece.enum';
import { MovementPiece } from './enums/movement-piece.enum';
import { PieceEnemy } from './interface/piece-enemy';
import { Piece } from './interface/piece.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  numbers = [0, 1, 2, 3, 4, 5, 6, 7];
  selectedPiece = '';
  selectedColor = '';
  turn = 'red';

  constructor(public board: Board) {}

  ngOnInit(): void {
    this.board.fillPieces();
  }

  validMovementByColor(index: number = 0) {
    if (index == this.board.pieces.length) return;
    const piece = this.board.pieces[index];
    if (piece.color == this.selectedColor) {
      this.possibleMovements({
        position: piece.position,
        movesColor: piece.color,
      });
    }
    index++;
    this.validMovementByColor(index);
  }

  showPiece(row: string, column: string) {
    const position = this.board.contactRowAndColumn(+row, +column);
    return this.board.showPiece(position);
  }

  possibleMovements({
    position,
    color,
    movement,
    movesColor,
  }: {
    position?: string;
    color?: string;
    movement?: string;
    movesColor?: string;
  }) {
    const piece = this.board.findPieceByPosition(position);

    // If there is no piece in that position, it means that the method was called via recursion.
    if (piece) this.selectedPiece = position;

    const isPieceRed = this.isPieceRed(piece, color);
    const [row, column] = position.split('-');

    const positionLeft = this.board.moveLeft(+row, +column, isPieceRed);
    const positionRight = this.board.moveRight(+row, +column, isPieceRed);

    const pieceLeft = this.board.findPieceByPosition(positionLeft);
    const pieceRight = this.board.findPieceByPosition(positionRight);

    if (!color && !movesColor) this.changeClassName();

    const enemyMovementLeft = this.generateMovement(
      MovementPiece.leftDiagonalForward,
      pieceLeft,
      positionLeft,
      color,
      movement
    );

    const enemyMovementRight = this.generateMovement(
      MovementPiece.rightDiagonalForward,
      pieceRight,
      positionRight,
      color,
      movement
    );

    /**
     * If the user chose to eat on the left diagonal, in the.board.pieceEnemyDiagonallyLeft
     * vector I keep all the enemy pieces on the left but on the left diagonal path they can see
     *  enemy pieces on the right that can also eat.
     *
     * Therefore in the left diagonal I also keep movement to the right and
     * the same logic applies to.board.pieceEnemyDiagonallyRigth.
     */

    this.eatenEnemyPieces(enemyMovementLeft, enemyMovementRight, movement);
  }

  //TODO:optimize the code
  eatenEnemyPieces(
    enemyMovementLeft: PieceEnemy,
    enemyMovementRight: PieceEnemy,
    movement: string
  ) {
    //TODO:Refactor the conditions so as not to repeat it
    if (enemyMovementLeft && movement == MovementPiece.leftDiagonalForward) {
      this.board.pieceEnemyDiagonallyLeft.push(enemyMovementLeft);
    }

    if (enemyMovementLeft && movement == MovementPiece.rightDiagonalForward) {
      this.board.pieceEnemyDiagonallyRigth.push(enemyMovementLeft);
    }

    if (enemyMovementRight && movement == MovementPiece.leftDiagonalForward) {
      this.board.pieceEnemyDiagonallyLeft.push(enemyMovementRight);
    }

    if (enemyMovementRight && movement == MovementPiece.rightDiagonalForward) {
      this.board.pieceEnemyDiagonallyRigth.push(enemyMovementRight);
    }

    if (!movement) {
      if (
        enemyMovementLeft &&
        enemyMovementLeft.movementDirection == MovementPiece.leftDiagonalForward
      ) {
        this.board.pieceEnemyDiagonallyLeft.push(enemyMovementLeft);
      }

      if (
        enemyMovementLeft &&
        enemyMovementLeft.movementDirection ==
          MovementPiece.rightDiagonalForward
      ) {
        this.board.pieceEnemyDiagonallyRigth.push(enemyMovementLeft);
      }

      if (
        enemyMovementRight &&
        enemyMovementRight.movementDirection ==
          MovementPiece.leftDiagonalForward
      ) {
        this.board.pieceEnemyDiagonallyLeft.push(enemyMovementRight);
      }

      if (
        enemyMovementRight &&
        enemyMovementRight.movementDirection ==
          MovementPiece.rightDiagonalForward
      ) {
        this.board.pieceEnemyDiagonallyRigth.push(enemyMovementRight);
      }
    }
  }

  isPieceRed(piece: Piece, colorPiece: string) {
    return piece
      ? piece.color == ColorPiece.red
      : colorPiece == ColorPiece.red
      ? true
      : false;
  }

  movementDirection(
    movementDirection: string,
    row: number,
    column: number,
    isPieceWhite: boolean
  ): string {
    return movementDirection === MovementPiece.leftDiagonalForward
      ? this.board.moveLeft(row, column, isPieceWhite)
      : this.board.moveRight(row, column, isPieceWhite);
  }

  generateMovement(
    movementDirection: string,
    piece: Piece,
    position: string,
    color: string,
    movement: string
  ) {
    if (!piece && !color) {
      const div = document.getElementById(position);
      if (div) div.className = ClassCssPiece.possibleMovement;
    } else if (piece) {
      /*If the piece variable is undefine it means that the position that was generated
       is a square with no piece on the board.
       Therefore the color of piece is empty
       */
      return this.possibleJumps(movementDirection, piece, movement);
    }
  }

  possibleJumps(movementDirection: string, piece: Piece, movement: string) {
    const pieceK = this.board.findPieceByPosition(this.selectedPiece);
    const colorPience = pieceK.color;

    if (this.board.isEnemyPiece(piece.color, colorPience)) {
      const [row, column] = piece.position.split('-');
      const isPieceWhite = piece.color != ColorPiece.red;

      /*
      If the piece is enemy, it has to generate the jump to the next available square
        */
      const positionPiece = this.movementDirection(
        movementDirection,
        +row,
        +column,
        isPieceWhite
      );

      const pieced = this.board.findPieceByPosition(positionPiece);

      /**
          If the piece does not exist, it means that there is a frame available
          that I have to mark as possible movement
         */
      if (!pieced) {
        const divBoard = document.getElementById(positionPiece);

        if (divBoard) {
          divBoard.className = ClassCssPiece.possibleMovement;
          const { color } = this.board.pieces.find(
            (piece) => piece.position == this.selectedPiece
          );

          if (!movement) {
            movement = movementDirection;
          }

          /**
              I call the method recursively in case the piece can continue to eat
             */
          this.possibleMovements({
            position: positionPiece,
            color,
            movement,
          });

          return { position: piece.position, movementDirection: movement };
        }
      }
    }
  }

  changeClassName() {
    const divs = Array.from(
      document.getElementsByClassName(ClassCssPiece.possibleMovement)
    );
    divs.forEach((element) => {
      element.className = ClassCssPiece.brown;
    });
  }

  isPieceKing(color: string, column: number) {
    return (
      (color == ColorPiece.red && column == 0) ||
      (color == ColorPiece.white && column == 7)
    );
  }

  possibleMovementPiece(div: HTMLElement) {
    if (this.selectedColor) {
      alert(
        'You cannot carry out a movement if you chose an option from the select, please choose the option to select and you will be able to carry out the movement'
      );
      return;
    }
    const classActive = div.className;
    if (classActive != ClassCssPiece.possibleMovement) return;
    const newPositionPiece = div.getAttribute('id');

    const indexpiece = this.board.findIndexpieceByPosition(this.selectedPiece);
    const { color } = this.board.pieces[indexpiece];
    if (color != this.turn) {
      alert(`The turn is for the pieces ${this.turn}.`);
      return;
    }

    this.turn = this.turn == ColorPiece.red ? ColorPiece.white : ColorPiece.red;

    const [row, column] = newPositionPiece.split('-');
    /**
     * I move the position where the piece was found and add it where the user wants to move it
     */
    this.movePiece(indexpiece, newPositionPiece, color);

    const enemyLeftDiagonalForward = this.board.getEnemyPiece(
      MovementPiece.leftDiagonalForward,
      this.board.pieceEnemyDiagonallyLeft
    );
    const enemyRightDiagonalForward = this.board.getEnemyPiece(
      MovementPiece.rightDiagonalForward,
      this.board.pieceEnemyDiagonallyRigth
    );

    const moveLeft = this.board.moveLeft(
      +row,
      +column,
      color !== ColorPiece.red
    );

    const moveRight = this.board.moveRight(
      +row,
      +column,
      color !== ColorPiece.red
    );

    let enemysLeftDiagonalForward = enemyLeftDiagonalForward.find(
      (piece) => piece.position == moveRight
    );

    let enemysRightDiagonalForward = enemyRightDiagonalForward.find(
      (piece) => piece.position == moveLeft
    );

    if (!enemysLeftDiagonalForward && !enemysRightDiagonalForward) {
      enemysLeftDiagonalForward = enemyLeftDiagonalForward.find(
        (piece) => piece.position == moveLeft
      );
      enemysRightDiagonalForward = enemyRightDiagonalForward.find(
        (piece) => piece.position == moveRight
      );
    }

    if (enemysLeftDiagonalForward) {
      for (
        let i = this.board.pieceEnemyDiagonallyLeft.length - 1;
        i >= 0;
        i--
      ) {
        const index = this.board.findIndexpieceByPosition(
          this.board.pieceEnemyDiagonallyLeft[i].position
        );

        if (
          this.board.moveLeft(+row, +column, color == ColorPiece.red) ==
          this.board.pieceEnemyDiagonallyLeft[i].position
        )
          break;

        this.board.removePieceByIndex(index);
      }
    } else if (enemysRightDiagonalForward) {
      for (
        let i = this.board.pieceEnemyDiagonallyRigth.length - 1;
        i >= 0;
        i--
      ) {
        const index = this.board.findIndexpieceByPosition(
          this.board.pieceEnemyDiagonallyRigth[i].position
        );

        if (
          this.board.moveRight(+row, +column, color == ColorPiece.red) ==
          this.board.pieceEnemyDiagonallyRigth[i].position
        )
          break;
        this.board.removePieceByIndex(index);
      }
    }

    if (this.board.countPieceBoardByColor(ColorPiece.red) == 0) {
      alert('White piece winner');
    } else if (this.board.countPieceBoardByColor(ColorPiece.white) == 0) {
      alert('Red piece winner');
    }
  }

  movePiece(indexpiece: number, newPositionPiece: string, color: string) {
    this.board.removePieceByIndex(indexpiece);
    this.changeClassName();

    const [, column] = newPositionPiece.split('-');
    this.board.pieces.push({
      position: newPositionPiece,
      color,
      king: this.isPieceKing(color, +column),
    });
  }

  clearEnemyPiece() {
    this.board.pieceEnemyDiagonallyLeft = [];
    this.board.pieceEnemyDiagonallyRigth = [];
  }

  clearColorMovesValid() {
    this.changeClassName();
    this.clearEnemyPiece();
  }
}
