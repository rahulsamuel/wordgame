
'use client';

import { useState, useRef, useEffect } from 'react';
import type { Cell } from '@/app/game/types';
import { cn } from '@/lib/utils';

interface GameGridProps {
  grid: string[][];
  onWordSelect: (word: string, coords: Cell[]) => void;
  foundWordCoords: Cell[][];
  disabled?: boolean;
}

export default function GameGrid({ grid, onWordSelect, foundWordCoords, disabled = false }: GameGridProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState<Cell[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleInteractionStart = (row: number, col: number) => {
    if (disabled) return;
    setIsSelecting(true);
    setSelection([{ row, col }]);
  };

  const handleInteractionMove = (row: number, col: number) => {
    if (!isSelecting || disabled) return;

    const startCell = selection[0];
    if (!startCell) return;
    
    // Check if the move creates a valid straight line (horizontal, vertical, or diagonal)
    const deltaX = Math.abs(col - startCell.col);
    const deltaY = Math.abs(row - startCell.row);
    const isStraightLine = deltaX === 0 || deltaY === 0 || deltaX === deltaY;

    if (!isStraightLine) {
        return; // Ignore moves that are not in a straight line from the start
    }

    const newSelection: Cell[] = [];
    const endCell = { row, col };

    const dx = endCell.col - startCell.col;
    const dy = endCell.row - startCell.row;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));

    for (let i = 0; i <= steps; i++) {
        const iCol = startCell.col + (dx / steps) * i;
        const iRow = startCell.row + (dy / steps) * i;
        newSelection.push({ row: Math.round(iRow), col: Math.round(iCol) });
    }
    
    setSelection(newSelection);
  };


  const handleInteractionEnd = () => {
    if (!isSelecting || !selection.length) return;
    
    if (selection.length > 1) {
      const selectedWord = selection.map(cell => grid[cell.row][cell.col]).join('');
      // The AI can sometimes generate words backward, so we check both directions
      const reversedWord = selectedWord.split('').reverse().join('');
      onWordSelect(selectedWord, selection);
      onWordSelect(reversedWord, selection.slice().reverse());
    }

    setIsSelecting(false);
    setSelection([]);
  };

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

  useEffect(() => {
    // These listeners handle interaction ending anywhere on the page, making it more robust.
    if (isSelecting) {
        window.addEventListener('mouseup', handleInteractionEnd);
        window.addEventListener('touchend', handleInteractionEnd);
    }
    
    return () => {
        window.removeEventListener('mouseup', handleInteractionEnd);
        window.removeEventListener('touchend', handleInteractionEnd);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelecting]);

  if (!grid || grid.length === 0) {
    return <div className="aspect-square w-full bg-muted rounded-lg flex items-center justify-center">Loading grid...</div>;
  }

  const gridCols = grid[0]?.length || 1;

  // Helper to get the grid cell from a mouse or touch event
  const getCellFromEvent = (e: React.MouseEvent | React.Touch) => {
    const element = document.elementFromPoint(e.clientX, e.clientY);
    const row = element?.getAttribute('data-row');
    const col = element?.getAttribute('data-col');
    if (row && col) {
        return { row: parseInt(row), col: parseInt(col) };
    }
    return null;
  }

  return (
    <div 
      ref={gridRef}
      className="bg-card p-4 rounded-2xl shadow-lg select-none"
      style={{ touchAction: 'none' }} // Prevents default touch actions like scrolling
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
                  disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer',
                  foundColor,
                  !foundColor && isCellSelected(row, col) && "bg-primary text-primary-foreground scale-110 shadow-lg",
                  !foundColor && !isCellSelected(row, col) && "bg-secondary",
                  isCellFound(row,col) && "shadow-[0_0_15px_1px_hsl(var(--primary))]"
                )}
                onMouseDown={() => handleInteractionStart(row, col)}
                onMouseEnter={() => handleInteractionMove(row, col)}
                onTouchStart={(e) => {
                    const cell = getCellFromEvent(e.touches[0]);
                    if(cell) handleInteractionStart(cell.row, cell.col);
                }}
                onTouchMove={(e) => {
                    e.preventDefault(); // Prevent scrolling while selecting a word
                    const cell = getCellFromEvent(e.touches[0]);
                    if(cell) handleInteractionMove(cell.row, cell.col);
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
