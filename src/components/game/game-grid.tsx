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

    const lastCell = selection[selection.length - 1];
    if (lastCell.row === row && lastCell.col === col) return;

    // Check if cell is adjacent to the last one
    const isAdjacent = Math.abs(lastCell.row - row) <= 1 && Math.abs(lastCell.col - col) <= 1;
    if (!isAdjacent) return;

    // Check if cell is already in selection
    const isAlreadySelected = selection.some(c => c.row === row && c.col === col);
    if(isAlreadySelected) return;

    // Ensure straight line
    if (selection.length > 1) {
      const first = selection[0];
      const second = selection[1];
      const dx = second.col - first.col;
      const dy = second.row - first.row;
      if (lastCell.row + dy !== row || lastCell.col + dx !== col) return;
    }
    
    setSelection(prev => [...prev, { row, col }]);
  };

  const handleInteractionEnd = () => {
    if (!isSelecting || disabled) return;
    
    if (selection.length > 1) {
      const selectedWord = selection.map(cell => grid[cell.row][cell.col]).join('');
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
    const colors = ['bg-accent/70', 'bg-primary/70', 'bg-green-400/70', 'bg-blue-400/70', 'bg-purple-400/70'];
    return colors[index % colors.length];
  }

  useEffect(() => {
    const gridElement = gridRef.current;
    if (gridElement) {
        gridElement.addEventListener('mouseup', handleInteractionEnd);
        gridElement.addEventListener('mouseleave', handleInteractionEnd);
    }
    
    return () => {
        if (gridElement) {
            gridElement.removeEventListener('mouseup', handleInteractionEnd);
            gridElement.removeEventListener('mouseleave', handleInteractionEnd);
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelecting]);

  if (!grid || grid.length === 0) {
    return <div className="aspect-square w-full bg-muted rounded-lg flex items-center justify-center">Loading grid...</div>;
  }

  const gridCols = grid[0]?.length || 1;

  return (
    <div 
      ref={gridRef}
      className="bg-card p-4 rounded-2xl shadow-lg select-none"
      style={{ touchAction: 'none' }}
      onMouseUp={handleInteractionEnd}
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
                    const touch = e.touches[0];
                    const element = document.elementFromPoint(touch.clientX, touch.clientY);
                    const elRow = element?.getAttribute('data-row');
                    const elCol = element?.getAttribute('data-col');
                    if(elRow && elCol) handleInteractionStart(parseInt(elRow), parseInt(elCol));
                }}
                onTouchMove={(e) => {
                    const touch = e.touches[0];
                    const element = document.elementFromPoint(touch.clientX, touch.clientY);
                    const elRow = element?.getAttribute('data-row');
                    const elCol = element?.getAttribute('data-col');
                    if(elRow && elCol) handleInteractionMove(parseInt(elRow), parseInt(elCol));
                }}
                onTouchEnd={handleInteractionEnd}
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
