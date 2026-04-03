import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useGetMatch, getGetMatchQueryKey, useSubmitAnswer, useFinishMatch } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Zap, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Game() {
  const { id } = useParams<{ id: string }>();
  const matchId = parseInt(id || "0", 10);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: match, isLoading, error } = useGetMatch(matchId, {
    query: {
      enabled: !!matchId,
      queryKey: getGetMatchQueryKey(matchId)
    }
  });

  const submitAnswerMutation = useSubmitAnswer();
  const finishMatchMutation = useFinishMatch();

  // Game state local to client
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<{correct: boolean, correctOption: number, explanation?: string | null} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Accumulated score state
  const scoreRef = useRef(0);
  const correctCountRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Initialize current question when match loads or index changes
  useEffect(() => {
    if (match && match.questions && match.questions[currentIndex]) {
      const q = match.questions[currentIndex];
      setTimeLeft(q.timeLimit);
      setSelectedOption(null);
      setAnswerResult(null);
      setIsSubmitting(false);
      startTimeRef.current = Date.now();

      // Start countdown
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [match, currentIndex]);

  const handleTimeUp = useCallback(() => {
    if (selectedOption === null && !isSubmitting && !answerResult) {
      handleAnswerSelect(-1); // -1 indicates timeout/no answer
    }
  }, [selectedOption, isSubmitting, answerResult]);

  const advanceQuestion = () => {
    if (!match) return;
    
    if (currentIndex + 1 < match.questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Finish match
      finishMatchMutation.mutate({
        id: matchId,
        data: {
          score: scoreRef.current,
          correctAnswers: correctCountRef.current,
          totalQuestions: match.questions.length
        }
      }, {
        onSuccess: (result) => {
          setLocation(`/result/${matchId}`);
        },
        onError: (err) => {
          toast({ title: "Error finishing match", description: err.error, variant: "destructive" });
        }
      });
    }
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (isSubmitting || answerResult || !match) return;
    
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    
    const q = match.questions[currentIndex];
    setSelectedOption(optionIndex);
    
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);

    submitAnswerMutation.mutate({
      id: matchId,
      data: {
        questionId: q.id,
        selectedOption: optionIndex,
        timeSpent
      }
    }, {
      onSuccess: (res) => {
        setAnswerResult({
          correct: res.correct,
          correctOption: res.correctOption,
          explanation: res.explanation
        });
        
        if (res.correct) {
          scoreRef.current += res.pointsEarned;
          correctCountRef.current += 1;
        }

        // Wait a moment so user sees the result, then advance
        setTimeout(() => {
          advanceQuestion();
        }, 2500);
      },
      onError: (err) => {
        toast({ title: "Error submitting answer", description: err.error, variant: "destructive" });
        setIsSubmitting(false);
      }
    });
  };

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center font-mono text-primary animate-pulse">Initializing Arena...</div>;
  }

  if (error || !match) {
    return <div className="flex-1 flex items-center justify-center text-destructive">Failed to load match.</div>;
  }

  if (match.status === "completed") {
    setLocation(`/result/${matchId}`);
    return null;
  }

  const currentQuestion = match.questions[currentIndex];
  if (!currentQuestion) return null;

  const progressPercent = ((currentIndex) / match.questions.length) * 100;
  const isDangerTime = timeLeft <= 5 && !answerResult;

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-4xl flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Header Stats */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
            Question <span className="text-foreground font-bold text-lg">{currentIndex + 1}</span> / {match.questions.length}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs uppercase text-muted-foreground font-mono">Score</span>
            <span className="font-mono text-2xl font-black text-primary drop-shadow-neon">{scoreRef.current}</span>
          </div>
          <div className={`flex items-center gap-2 text-2xl font-mono font-bold w-24 justify-end ${isDangerTime ? 'text-destructive animate-pulse' : 'text-secondary'}`}>
            <Timer className="w-6 h-6" />
            {timeLeft}s
          </div>
        </div>
      </div>

      <Progress value={progressPercent} className="h-2 mb-8 bg-muted" />

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQuestion.id}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-3xl"
          >
            <Card className="border-primary/20 bg-card/80 backdrop-blur-xl shadow-xl overflow-hidden relative mb-8">
              {isDangerTime && <div className="absolute inset-0 border-2 border-destructive animate-pulse pointer-events-none z-10 rounded-xl" />}
              <CardContent className="p-8 md:p-12 text-center min-h-[200px] flex flex-col justify-center">
                <div className="flex justify-center mb-6">
                  <span className="px-3 py-1 rounded-full bg-muted/50 text-xs font-mono uppercase tracking-widest border border-border/50 flex items-center gap-2">
                    <Zap className="w-3 h-3 text-accent" />
                    {currentQuestion.category} • {currentQuestion.difficulty}
                  </span>
                </div>
                <h2 className="text-2xl md:text-4xl font-bold leading-tight">
                  {currentQuestion.text}
                </h2>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option, idx) => {
                let btnStateClass = "bg-card/50 border-border/50 hover:bg-primary/10 hover:border-primary/50 text-foreground";
                let icon = null;

                if (answerResult) {
                  if (idx === answerResult.correctOption) {
                    btnStateClass = "bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]";
                    icon = <CheckCircle className="w-5 h-5 ml-auto" />;
                  } else if (idx === selectedOption) {
                    btnStateClass = "bg-destructive/20 border-destructive text-destructive shadow-[0_0_15px_rgba(239,68,68,0.3)]";
                    icon = <XCircle className="w-5 h-5 ml-auto" />;
                  } else {
                    btnStateClass = "bg-card/30 border-border/30 opacity-50";
                  }
                } else if (selectedOption === idx) {
                  btnStateClass = "bg-primary/20 border-primary text-primary animate-pulse";
                }

                return (
                  <motion.button
                    key={idx}
                    whileHover={!answerResult && !isSubmitting ? { scale: 1.02 } : {}}
                    whileTap={!answerResult && !isSubmitting ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswerSelect(idx)}
                    disabled={isSubmitting || answerResult !== null}
                    className={`w-full p-6 rounded-xl border-2 transition-all duration-200 text-lg font-medium text-left flex items-center ${btnStateClass}`}
                  >
                    <span className="w-8 h-8 rounded bg-background/50 border border-border/50 flex items-center justify-center mr-4 font-mono text-sm text-muted-foreground">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1">{option}</span>
                    {icon}
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation Area */}
            {answerResult?.explanation && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 p-4 rounded-xl bg-accent/10 border border-accent/20 text-accent-foreground text-sm"
              >
                <span className="font-bold uppercase tracking-widest text-xs opacity-70 block mb-1">Briefing</span>
                {answerResult.explanation}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
