import { cpuUsage } from 'process';
import { ColorPiece } from '../enums/color-piece.enum';
import { ImgPiece } from '../enums/img-piece.enum';
import { Piece } from '../interface/piece.interface';
import { EnemyPiece } from './enemy-piece.class';

export class Board extends EnemyPiece {
  public pieces: Piece[] = [];

  fillPieces(row: number = 0): number {
    if (row == 8) return;
    for (let column = 0; column <= 7; column++) {
      if (this.isValidBox(row, column) && (column <= 2 || column >= 5))
        this.addPiece(row, column);
    }
    row++;
    return this.fillPieces(row);
  }

  findPieceByPosition(position: string): Piece {
    return this.pieces.find((piece) => piece.position == position);
  }

  moveLeft(row: number, column: number, isPieceRed: boolean): string {
    return isPieceRed
      ? this.contactRowAndColumn(row - 1, column - 1)
      : this.contactRowAndColumn(row - 1, column + 1);
  }

  moveRight(row: number, column: number, isPieceRed: boolean): string {
    return isPieceRed
      ? this.contactRowAndColumn(row + 1, column - 1)
      : this.contactRowAndColumn(row + 1, column + 1);
  }

  contactRowAndColumn(row: number, column: number): string {
    return `${row}-${column}`;
  }
  addPiece(row: number, column: number): void {
    this.pieces.push({
      position: this.contactRowAndColumn(row, column),
      color: column <= 2 ? ColorPiece.white : ColorPiece.red,
      king: false,
    });
  }

  removePieceByIndex(index: number): void {
    this.pieces.splice(index, 1);
  }

  findIndexpieceByPosition(position: string): number {
    return this.pieces.findIndex((piece) => piece.position == position);
  }

  isValidBox(row: number, column: number): boolean {
    return (
      (row % 2 == 0 && column % 2 != 0) || (row % 2 != 0 && column % 2 == 0)
    );
  }

  showPicture(div: HTMLElement): boolean {
    const position = div.getAttribute('id');
    return this.pieces.some((piece) => {
      return piece.position == position;
    });
  }

  showPiece(position: string): string {
    const { color, king } = this.pieces.find(
      (piece) => piece.position == position
    );
    return king ? this.imgPieceKing(color) : this.imgPiece(color);
  }

  imgPiece(color: string): string {
    return `../assets/${
      color == ColorPiece.white ? ImgPiece.white : ImgPiece.red
    }`;
  }

  imgPieceKing(color: string): string {
    return `../assets/${
      color == ColorPiece.white ? ImgPiece.kingWhite : ImgPiece.kingRed
    }`;
  }

  countPieceBoardByColor(color: string): number {
    return this.pieces.filter((piece) => piece.color == color).length;
  }
}
