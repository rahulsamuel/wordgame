'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Cell } from '@/app/game/types';
import { cn } from '@/lib/utils';

interface GameGridProps {
  grid: string[][];
  onWordSelect: (word: string, coords: Cell[]) => void;
  foundWordCoords: Cell[][];
  disabled?: boolean;
  hintCell: Cell | null;
}

export default function GameGrid({ grid, onWordSelect, foundWordCoords, disabled = false, hintCell }: GameGridProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState<Cell[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  const getCellFromEvent = (e: MouseEvent | Touch): Cell | null => {
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (target) {
      const row = target.getAttribute('data-row');
      const col = target.getAttribute('data-col');
      if (row && col) {
        return { row: parseInt(row, 10), col: parseInt(col, 10) };
      }
    }
    return null;
  };

  const handleInteractionStart = (row: number, col: number) => {
    if (disabled) return;
    setIsSelecting(true);
    setSelection([{ row, col }]);
  };

  const handleInteractionMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isSelecting) return;

    if (e.cancelable) e.preventDefault();

    const event = 'touches' in e ? e.touches[0] : e;
    const currentCell = getCellFromEvent(event);

    if (currentCell && selection.length > 0) {
      const startCell = selection[0];
      
      const lastCellInSelection = selection[selection.length - 1];
      if (lastCellInSelection.row === currentCell.row && lastCellInSelection.col === currentCell.col) {
        return;
      }
      
      const deltaX = Math.abs(currentCell.col - startCell.col);
      const deltaY = Math.abs(currentCell.row - startCell.row);
      const isStraightLine = deltaX === 0 || deltaY === 0 || deltaX === deltaY;

      if (isStraightLine) {
        const newSelection: Cell[] = [];
        const endCell = currentCell;
        const dx = endCell.col - startCell.col;
        const dy = endCell.row - startCell.row;
        const steps = Math.max(Math.abs(dx), Math.abs(dy));
        for (let i = 0; i <= steps; i++) {
          const iCol = startCell.col + Math.round((dx / steps) * i);
          const iRow = startCell.row + Math.round((dy / steps) * i);
          newSelection.push({ row: iRow, col: iCol });
        }
        setSelection(newSelection);
      }
    }
  }, [isSelecting, selection]);

  const handleInteractionEnd = useCallback(() => {
    if (!isSelecting) return;

    if (selection.length > 1) {
      const selectedWord = selection.map(cell => grid[cell.row][cell.col]).join('');
      const reversedWord = selectedWord.split('').reverse().join('');
      onWordSelect(selectedWord, selection);
      onWordSelect(reversedWord, [...selection].reverse());
    }

    setIsSelecting(false);
    setSelection([]);
  }, [isSelecting, selection, grid, onWordSelect]);

  useEffect(() => {
    const moveHandler = (e: MouseEvent) => handleInteractionMove(e);
    const touchMoveHandler = (e: TouchEvent) => handleInteractionMove(e);
    
    if (isSelecting) {
      window.addEventListener('mousemove', moveHandler);
      window.addEventListener('touchmove', touchMoveHandler, { passive: false });
      window.addEventListener('mouseup', handleInteractionEnd);
      window.addEventListener('touchend', handleInteractionEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('touchmove', touchMoveHandler);
      window.removeEventListener('mouseup', handleInteractionEnd);
      window.removeEventListener('touchend', handleInteractionEnd);
    };
  }, [isSelecting, handleInteractionMove, handleInteractionEnd]);


  const isCellSelected = (row: number, col: number) => 
    selection.some(cell => cell.row === row && cell.col === col);

  const isCellFound = (row: number, col: number) =>
    foundWordCoords.flat().some(cell => cell.row === row && cell.col === col);
  
  const getFoundCellColor = (row: number, col: number): string | undefined => {
    const index = foundWordCoords.findIndex(path => path.some(cell => cell.row === row && cell.col === col));
    if (index === -1) return undefined;
    const colors = ['bg-accent/70', 'bg-primary/70', 'bg-green-400/70', 'bg-blue-400/70', 'bg-purple-400/70', 'bg-orange-400/70', 'bg-pink-400/70'];
    return colors[index % colors.length];
  }
  
  const isHintCell = (row: number, col: number) =>
    hintCell?.row === row && hintCell?.col === col;

  if (!grid || grid.length === 0) {
    return <div className="aspect-square w-full bg-muted rounded-lg flex items-center justify-center">Loading grid...</div>;
  }

  const gridCols = grid[0]?.length || 1;

  return (
    <div 
      ref={gridRef}
      className="bg-card p-4 rounded-2xl shadow-lg select-none"
      style={{ touchAction: 'none' }}
    >
      <div
        className="grid aspect-square"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
        }}
      >
        {grid.map((rowItems, row) =>
          rowItems.map((letter, col) => {
            const foundColor = getFoundCellColor(row, col);
            return (
              <div
                key={`${row}-${col}`}
                className={cn(
                  "flex items-center justify-center aspect-square border-2 border-background rounded-lg text-lg md:text-2xl font-bold transition-all duration-150",
                  disabled ? 'cursor-not-allowed opacity-70' : 'cursor-grab',
                  foundColor,
                  !foundColor && isSelecting && isCellSelected(row, col) && "bg-primary text-primary-foreground scale-110 shadow-lg",
                  !foundColor && !isCellSelected(row, col) && "bg-secondary",
                  isCellFound(row,col) && "shadow-[0_0_15px_1px_hsl(var(--primary))]",
                  isHintCell(row, col) && "animate-blink bg-yellow-400/80 ring-4 ring-yellow-300/80"
                )}
                onMouseDown={() => handleInteractionStart(row, col)}
                onTouchStart={(e) => {
                  handleInteractionStart(row, col)
                }}
                data-row={row}
                data-col={col}
              >
                {letter}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
