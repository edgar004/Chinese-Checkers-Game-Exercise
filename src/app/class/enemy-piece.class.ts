import { PieceEnemy } from '../interface/piece-enemy';

export class EnemyPiece {
  public pieceEnemyDiagonallyLeft: PieceEnemy[] = [];
  public pieceEnemyDiagonallyRigth: PieceEnemy[] = [];
  isEnemyPiece(colorPiece1: string, colorPiece2: string) {
    return colorPiece1 != colorPiece2;
  }

  getEnemyPiece(
    movementPiece: string,
    pieceEnemyDiagonally: PieceEnemy[]
  ): PieceEnemy[] {
    return pieceEnemyDiagonally.filter(
      (piece) => piece.movementDirection == movementPiece
    );
  }
}
