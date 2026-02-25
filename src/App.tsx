import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { getQuestions, LANGUAGES, type Language } from './data/questions'
import { getDialogStrings } from './data/dialogTranslations'
import { SpinningWheel } from './components/SpinningWheel'

const LOGO_URL = '/bisk-logo.png'
const ANSWER_DISPLAY_SECONDS = 6

function App() {
  const [language, setLanguage] = useState<Language>('en')
  const [started, setStarted] = useState(false)
  const [wheelOpen, setWheelOpen] = useState<'easy' | 'hard' | false>(false)
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [usedNumbers, setUsedNumbers] = useState<Set<number>>(() => new Set())
  const [showingAnswer, setShowingAnswer] = useState(false)
  const [answerCountdown, setAnswerCountdown] = useState(ANSWER_DISPLAY_SECONDS)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const questions = useMemo(() => getQuestions(language), [language])
  const TOTAL = questions.length
  const selectedQuestion = selectedNumber != null ? questions[selectedNumber - 1] : null
  const dialogT = getDialogStrings(language)

  const closeModal = useCallback(() => {
    setShowingAnswer(false)
    setSelectedNumber(null)
    setLanguage('en')
  }, [])

  const markUsedAndClose = useCallback(() => {
    if (selectedNumber != null) {
      setUsedNumbers((prev) => new Set(prev).add(selectedNumber))
    }
    setShowingAnswer(false)
    setSelectedNumber(null)
    setLanguage('en')
  }, [selectedNumber])

  const resetUsed = useCallback(() => setUsedNumbers(new Set()), [])

  // ESC to close modal (same as Back — keep for later)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedNumber != null) {
          if (showingAnswer) markUsedAndClose()
          else closeModal()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNumber, showingAnswer, closeModal, markUsedAndClose])

  // Lock body scroll when modal open
  useEffect(() => {
    if (selectedNumber != null) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [selectedNumber])

  // Focus close button when modal opens (accessibility)
  useEffect(() => {
    if (selectedNumber != null && !showingAnswer) {
      const t = setTimeout(() => closeButtonRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [selectedNumber, showingAnswer])

  // When showing answer: countdown display + close after 6s
  useEffect(() => {
    if (!showingAnswer || selectedNumber == null) return
    setAnswerCountdown(ANSWER_DISPLAY_SECONDS)
    const closeTimer = setTimeout(markUsedAndClose, ANSWER_DISPLAY_SECONDS * 1000)
    const countInterval = setInterval(() => {
      setAnswerCountdown((c) => (c <= 1 ? 0 : c - 1))
    }, 1000)
    return () => {
      clearTimeout(closeTimer)
      clearInterval(countInterval)
    }
  }, [showingAnswer, selectedNumber, markUsedAndClose])

  const isRtl = language === 'ku' || language === 'ar'

  // First page: landing with logo
  if (!started) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-x-hidden px-4">
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" aria-hidden>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='%23c3b091' stroke-width='0.5'/%3E%3C/svg%3E")`,
            }}
          />
        </div>
        <img
          src={LOGO_URL}
          alt="British International Schools in Kurdistan"
          className="relative z-10 w-40 sm:w-52 md:w-64 h-auto object-contain mb-8 drop-shadow-md"
        />
        <h1 className="font-heading relative z-10 m-0 mb-3 text-3xl sm:text-4xl md:text-5xl font-bold text-islamic-heading tracking-tight text-center">
          Islamic Trivia
        </h1>
        <p className="font-sans relative z-10 m-0 mb-10 text-base sm:text-lg text-islamic-muted text-center max-w-md">
          Choose a number — then answer the question
        </p>
        <button
          type="button"
          onClick={() => setStarted(true)}
          className="relative z-10 py-3 px-8 rounded-xl font-semibold text-islamic-card bg-islamic-accent hover:bg-islamic-accent/90 active:scale-[0.99] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-islamic-accent"
        >
          Start
        </button>
      </div>
    )
  }

  // Trivia page: board with corner logo
  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-x-hidden">
      {/* Corner logo */}
      <button
        type="button"
        onClick={() => setStarted(false)}
        className="absolute top-3 left-3 z-20 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-transparent hover:opacity-90 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-islamic-accent p-0"
        aria-label="British International Schools in Kurdistan — back to start"
      >
        <img
          src={LOGO_URL}
          alt=""
          className="w-full h-full object-contain"
        />
      </button>

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='%23c3b091' stroke-width='0.5'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <header className="relative z-10 text-center pt-8 pb-6 px-4">
        <h1 className="font-heading m-0 mb-2 text-3xl sm:text-4xl md:text-5xl font-bold text-islamic-heading tracking-tight drop-shadow-sm">
          Islamic Trivia
        </h1>
        <p className="font-sans m-0 text-base sm:text-lg text-islamic-muted max-w-md mx-auto">
          Choose a number — then answer the question
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
          <span className="text-sm text-islamic-muted/90">
            <span className="font-semibold text-islamic-accent">{usedNumbers.size}</span>
            <span className="ml-1">of {TOTAL} used</span>
          </span>
          {usedNumbers.size > 0 && (
            <button
              type="button"
              onClick={resetUsed}
              className="text-sm font-medium text-islamic-muted hover:text-islamic-heading underline underline-offset-2 transition-colors"
            >
              Reset used
            </button>
          )}
        </div>
      </header>

      <main className="relative z-10 w-full flex-1 flex flex-col items-center px-3 sm:px-6 pb-10">
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => setWheelOpen('easy')}
            className="py-3 px-6 rounded-xl font-semibold bg-islamic-accent text-islamic-card hover:bg-islamic-accent/90 active:scale-[0.99] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-islamic-accent"
          >
            Spin wheel
          </button>
          <button
            type="button"
            onClick={() => setWheelOpen('hard')}
            className="py-3 px-6 rounded-xl font-semibold text-islamic-heading border-2 border-[#8B4513] bg-[#5c2e1f] hover:bg-[#6d3828] active:scale-[0.99] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B4513]"
          >
            Hard level
          </button>
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-7 lg:grid-cols-10 gap-1.5 sm:gap-2 w-full max-w-4xl mx-auto">
          {questions.map(({ id }) => {
            const used = usedNumbers.has(id)
            const isHard = id > 70
            return (
              <button
                key={id}
                type="button"
                disabled={used}
                className={`
                  aspect-square min-w-0 text-sm sm:text-base lg:text-lg font-bold rounded-xl
                  flex items-center justify-center transition-all duration-200
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                  ${used
                    ? 'bg-islamic-cell/50 border-2 border-islamic-cell-border/50 text-islamic-muted/70 cursor-default line-through'
                    : isHard
                      ? 'border-2 border-[#8B4513] bg-[#5c2e1f] text-islamic-heading cursor-pointer hover:scale-105 hover:shadow-xl hover:bg-[#6d3828] hover:border-[#a0522d] active:scale-[0.98] focus-visible:outline-[#8B4513]'
                      : 'bg-islamic-cell border-2 border-islamic-cell-border text-islamic-heading cursor-pointer hover:scale-105 hover:shadow-xl hover:bg-islamic-cell-hover hover:border-islamic-accent active:scale-[0.98] focus-visible:outline-islamic-accent'
                  }
                `}
                onClick={() => !used && setSelectedNumber(id)}
                aria-label={used ? `Question ${id} (already used)` : `Question ${id}`}
                aria-pressed={selectedNumber === id}
              >
                {id}
              </button>
            )
          })}
        </div>
      </main>

      {wheelOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/70 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label={wheelOpen === 'hard' ? 'Hard level wheel' : 'Spinning wheel'}
          onClick={() => setWheelOpen(false)}
        >
          <button
            type="button"
            onClick={() => setWheelOpen(false)}
            className="fixed top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-black/40 text-islamic-heading hover:bg-islamic-accent/40 flex items-center justify-center text-xl z-[101] transition-colors"
            aria-label="Close wheel"
          >
            ✕
          </button>
          <div
            className="flex flex-col items-center gap-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {wheelOpen === 'hard' && (
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-islamic-heading m-0">
                Hard level
              </h2>
            )}
            <SpinningWheel
              usedNumbers={usedNumbers}
              onSpinComplete={(n) => {
                setWheelOpen(false)
                setSelectedNumber(n)
              }}
              large
              minNumber={wheelOpen === 'hard' ? 71 : 1}
              maxNumber={wheelOpen === 'hard' ? 100 : 70}
              variant={wheelOpen === 'hard' ? 'hard' : 'default'}
            />
          </div>
        </div>
      )}

      {selectedQuestion && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="question-title"
          onClick={closeModal}
        >
          <div
            className="relative bg-islamic-card text-islamic-text-on-light rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-xl animate-slide-up overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative top border: khaki + gold, or hard (brown) */}
            <div
              className={`h-1 sm:h-1.5 ${selectedQuestion.id <= 70 ? 'bg-gradient-to-r from-islamic-khaki-dark/80 via-islamic-accent to-islamic-khaki-dark/80' : ''}`}
              style={selectedQuestion.id > 70 ? { background: 'linear-gradient(to right, #5c2e1f, #8B4513, #5c2e1f)' } : undefined}
            />

            <div className="p-6 sm:p-8" dir={isRtl ? 'rtl' : 'ltr'}>
              <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                <span className="font-heading font-bold text-lg sm:text-xl flex items-center gap-2">
                  {selectedQuestion.id > 70 && (
                    <span className="px-2 py-0.5 rounded text-sm bg-[#8B4513]/20 text-[#8B4513]">
                      {dialogT.hardLevel}
                    </span>
                  )}
                  <span className={selectedQuestion.id > 70 ? 'text-[#8B4513]' : 'text-islamic-accent'}>
                    {showingAnswer ? dialogT.correctAnswer : `${dialogT.questionLabel} ${selectedQuestion.id}`}
                  </span>
                </span>
                <button
                  ref={closeButtonRef}
                  type="button"
                  className="w-10 h-10 rounded-xl bg-black/10 text-islamic-text-on-light/70 hover:bg-islamic-accent/20 hover:text-islamic-accent flex items-center justify-center text-xl transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-islamic-accent"
                  onClick={showingAnswer ? markUsedAndClose : closeModal}
                  aria-label={showingAnswer ? dialogT.closeNowAria : dialogT.backKeepLaterAria}
                >
                  ✕
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {LANGUAGES.map(({ code, label }) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLanguage(code)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      language === code
                        ? 'bg-islamic-accent text-islamic-card'
                        : 'bg-black/10 text-islamic-text-on-light/80 hover:bg-islamic-accent/20 hover:text-islamic-accent'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {showingAnswer ? (
                <>
                  <p className="font-sans m-0 mb-4 text-xl sm:text-2xl leading-relaxed font-semibold text-islamic-text-on-light">
                    {selectedQuestion.answer || dialogT.noAnswer}
                  </p>
                  <p className="font-sans m-0 mb-6 text-sm text-islamic-muted">
                    {dialogT.closingIn} {answerCountdown} {answerCountdown !== 1 ? dialogT.seconds : dialogT.second}…
                  </p>
                  <button
                    type="button"
                    className="w-full py-3 px-5 rounded-xl font-semibold bg-islamic-accent text-islamic-card hover:bg-islamic-accent/90 active:scale-[0.99] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-islamic-accent"
                    onClick={markUsedAndClose}
                  >
                    {dialogT.closeNow}
                  </button>
                </>
              ) : (
                <>
                  <h2
                    id="question-title"
                    className="font-sans m-0 mb-8 text-xl sm:text-2xl leading-relaxed font-semibold text-islamic-text-on-light"
                  >
                    {selectedQuestion.question || dialogT.noQuestionPlaceholder}
                  </h2>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      className="flex-1 order-2 sm:order-1 py-3 px-5 rounded-xl font-semibold bg-islamic-accent text-islamic-card hover:bg-islamic-accent/90 active:scale-[0.99] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-islamic-accent"
                      onClick={() => setShowingAnswer(true)}
                    >
                      {dialogT.doneNextStudent}
                    </button>
                    <button
                      type="button"
                      className="flex-1 order-1 sm:order-2 py-3 px-5 rounded-xl font-semibold border-2 border-islamic-accent text-islamic-accent bg-transparent hover:bg-islamic-accent/10 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-islamic-accent"
                      onClick={closeModal}
                    >
                      {dialogT.backKeepLater}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
