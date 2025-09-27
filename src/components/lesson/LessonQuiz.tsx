import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EcoButton } from '@/components/ui/eco-button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, Award } from 'lucide-react'
import { toast } from 'sonner'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface LessonQuizProps {
  questions: QuizQuestion[]
  onQuizComplete: (score: number) => void
}

export function LessonQuiz({ questions, onQuizComplete }: LessonQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [answers, setAnswers] = useState<number[]>([])
  const [quizCompleted, setQuizCompleted] = useState(false)

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleNextQuestion = () => {
    if (selectedAnswer === null) {
      toast.error("Please select an answer")
      return
    }

    const newAnswers = [...answers, selectedAnswer]
    setAnswers(newAnswers)
    setShowResult(true)

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
        setShowResult(false)
      } else {
        // Quiz completed
        const score = newAnswers.reduce((acc, answer, index) => {
          return answer === questions[index].correctAnswer ? acc + 1 : acc
        }, 0)
        
        const percentage = Math.round((score / questions.length) * 100)
        setQuizCompleted(true)
        
        setTimeout(() => {
          onQuizComplete(percentage)
        }, 2000)
      }
    }, 2000)
  }

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100
  const isCorrect = selectedAnswer === currentQ?.correctAnswer

  if (quizCompleted) {
    const score = answers.reduce((acc, answer, index) => {
      return answer === questions[index].correctAnswer ? acc + 1 : acc
    }, 0)
    const percentage = Math.round((score / questions.length) * 100)

    return (
      <Card className="w-full">
        <CardContent className="text-center py-12">
          <div className="mb-6">
            <Award className="h-16 w-16 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Quiz Completed!</h3>
            <p className="text-muted-foreground">Great job completing the lesson quiz</p>
          </div>
          
          <div className="bg-primary/10 rounded-lg p-6 mb-6">
            <div className="text-3xl font-bold text-primary mb-2">{percentage}%</div>
            <p className="text-sm text-muted-foreground">
              You got {score} out of {questions.length} questions correct
            </p>
          </div>

          <Badge variant={percentage >= 70 ? "default" : "secondary"} className="text-sm px-4 py-2">
            {percentage >= 70 ? "Passed!" : "Keep Learning!"}
          </Badge>
        </CardContent>
      </Card>
    )
  }

  if (!currentQ) return null

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline">
            Question {currentQuestion + 1} of {questions.length}
          </Badge>
          <div className="text-sm text-muted-foreground">
            {Math.round(progress)}% Complete
          </div>
        </div>
        <Progress value={progress} className="h-2" />
        <CardTitle className="text-xl mt-4">{currentQ.question}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3 mb-6">
          {currentQ.options.map((option, index) => (
            <EcoButton
              key={index}
              variant={selectedAnswer === index ? "eco" : "outline"}
              className={`w-full text-left justify-start p-4 h-auto ${
                showResult ? (
                  index === currentQ.correctAnswer 
                    ? "bg-primary/10 border-primary text-primary" 
                    : selectedAnswer === index && index !== currentQ.correctAnswer
                      ? "bg-destructive/10 border-destructive text-destructive"
                      : ""
                ) : ""
              }`}
              onClick={() => !showResult && handleAnswerSelect(index)}
              disabled={showResult}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center flex-shrink-0">
                  {showResult && index === currentQ.correctAnswer && (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  {showResult && selectedAnswer === index && index !== currentQ.correctAnswer && (
                    <XCircle className="h-4 w-4" />
                  )}
                  {!showResult && selectedAnswer === index && (
                    <div className="w-3 h-3 rounded-full bg-current" />
                  )}
                </div>
                <span className="flex-1">{option}</span>
              </div>
            </EcoButton>
          ))}
        </div>

        {showResult && (
          <div className="bg-muted rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-medium mb-1">
                  {isCorrect ? "Correct!" : "Incorrect"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentQ.explanation}
                </p>
              </div>
            </div>
          </div>
        )}

        <EcoButton
          variant="eco"
          className="w-full"
          onClick={handleNextQuestion}
          disabled={selectedAnswer === null}
        >
          {currentQuestion < questions.length - 1 ? "Next Question" : "Complete Quiz"}
        </EcoButton>
      </CardContent>
    </Card>
  )
}