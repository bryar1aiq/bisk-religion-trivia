import { useRef, useState, useCallback } from 'react'

const SPIN_DURATION_MS = 4000
const EXTRA_ROTATIONS = 5

const HARD_ACCENT = '#8B4513'
const HARD_CELL = '#5c2e1f'

interface SpinningWheelProps {
  usedNumbers: Set<number>
  onSpinComplete: (number: number) => void
  /** Use larger size when in a dialog */
  large?: boolean
  /** Number range on the wheel (default 1–70) */
  minNumber?: number
  maxNumber?: number
  /** 'hard' = hard level styling (different color) */
  variant?: 'default' | 'hard'
}

export function SpinningWheel({
  usedNumbers,
  onSpinComplete,
  large,
  minNumber = 1,
  maxNumber = 70,
  variant = 'default',
}: SpinningWheelProps) {
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const rotationRef = useRef(0)

  const totalInRange = maxNumber - minNumber + 1
  const availableNumbers = Array.from({ length: totalInRange }, (_, i) => minNumber + i).filter(
    (n) => !usedNumbers.has(n)
  )

  const segmentDeg = availableNumbers.length > 0 ? 360 / availableNumbers.length : 0

  const spin = useCallback(() => {
    if (availableNumbers.length === 0 || isSpinning) return

    const pickIndex = Math.floor(Math.random() * availableNumbers.length)
    const picked = availableNumbers[pickIndex]
    const segmentOffset = pickIndex * segmentDeg
    const newRotation = rotationRef.current + EXTRA_ROTATIONS * 360 + segmentOffset

    rotationRef.current = newRotation
    setRotation(newRotation)
    setIsSpinning(true)

    setTimeout(() => {
      setIsSpinning(false)
      onSpinComplete(picked)
    }, SPIN_DURATION_MS)
  }, [availableNumbers, segmentDeg, isSpinning, onSpinComplete])

  const radius = large ? 165 : 68
  const wheelSize = large ? 'w-80 h-80 sm:w-96 sm:h-96' : 'w-44 h-44 sm:w-52 sm:h-52'
  const numSize = large ? 'w-7 h-7 sm:w-8 sm:h-8 text-sm sm:text-base' : 'w-5 h-5 sm:w-6 sm:h-6 text-[10px] sm:text-xs'

  const isHard = variant === 'hard'
  const pointerColor = isHard ? HARD_ACCENT : 'var(--color-islamic-accent, #c9a227)'
  const cellBg = isHard ? HARD_CELL : 'rgba(45, 107, 86, 0.9)'

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {/* Pointer at top */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 z-20 w-0 h-0 ${large ? '-top-3' : '-top-2'}`}
          style={{
            borderLeft: large ? '16px solid transparent' : '12px solid transparent',
            borderRight: large ? '16px solid transparent' : '12px solid transparent',
            borderTop: large ? `28px solid ${pointerColor}` : `20px solid ${pointerColor}`,
          }}
        />
        <div
          className={`relative ${wheelSize} rounded-full border-4 overflow-hidden shadow-xl ${!isHard ? 'border-islamic-accent' : ''}`}
          style={{
            backgroundColor: isHard ? HARD_CELL : 'var(--color-islamic-cell, #1a4d3e)',
            ...(isHard ? { borderColor: HARD_ACCENT } : {}),
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              transform: `rotate(-${rotation}deg)`,
              transition: isSpinning
                ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1)`
                : 'none',
            }}
          >
            {availableNumbers.map((num, i) => {
              const angle = i * segmentDeg
              return (
                <div
                  key={num}
                  className={`absolute flex items-center justify-center font-bold rounded ${numSize}`}
                  style={{
                    left: '50%',
                    top: '50%',
                    transformOrigin: 'center center',
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px)`,
                    color: 'var(--color-islamic-heading, #e8e0c8)',
                    backgroundColor: cellBg,
                  }}
                >
                  {num}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={spin}
        disabled={isSpinning || availableNumbers.length === 0}
        className={`py-2 px-6 rounded-xl font-semibold text-islamic-card disabled:opacity-50 disabled:cursor-not-allowed transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
          isHard
            ? 'hover:opacity-90 focus-visible:outline-[#8B4513]'
            : 'bg-islamic-accent hover:bg-islamic-accent/90 focus-visible:outline-islamic-accent'
        }`}
        style={isHard ? { backgroundColor: HARD_ACCENT } : undefined}
      >
        {isSpinning ? 'Spinning…' : 'Spin'}
      </button>
      {availableNumbers.length === 0 && (
        <p className="text-sm text-islamic-muted">All numbers used — reset to spin again</p>
      )}
    </div>
  )
}
