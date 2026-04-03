import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useGetUserStats, useListMatches, useListCategories, useListQuestions } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Swords, Zap, Medal, Star, Clock, Target, ArrowRight, BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    setLocation("/");
    return null;
  }

  const { data: stats, isLoading: statsLoading } = useGetUserStats(user.id);
  const { data: matches, isLoading: matchesLoading } = useListMatches();
  const { data: categories, isLoading: categoriesLoading } = useListCategories();
  const { data: practiceQuestions, isLoading: questionsLoading } = useListQuestions({ limit: 1 });

  return (
    <div className="container mx-auto p-4 lg:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Hero Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="md:col-span-2 relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 p-6 flex flex-col justify-center"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[64px] pointer-events-none" />
          <h2 className="text-2xl font-bold uppercase tracking-wider mb-2">Welcome Back, {user.username}</h2>
          <p className="text-muted-foreground mb-6">Ready to defend your rating in the arena?</p>
          <div className="flex gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_0_15px_rgba(0,255,255,0.4)]" onClick={() => setLocation("/play")}>
              <Swords className="w-5 h-5 mr-2" />
              Enter Arena
            </Button>
            <Button size="lg" variant="outline" className="border-secondary/50 text-secondary hover:bg-secondary/10" onClick={() => setLocation("/leaderboard")}>
              <Trophy className="w-5 h-5 mr-2" />
              View Rankings
            </Button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="h-full border-primary/20 bg-card/50 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-mono flex items-center gap-2">
                <Star className="w-4 h-4 text-accent" /> Skill Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-accent drop-shadow-neon-accent">{user.skillRating}</div>
              <div className="text-xs text-muted-foreground mt-2 uppercase tracking-widest">Global Rank: Top 10%</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="h-full border-secondary/20 bg-card/50 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-mono flex items-center gap-2">
                <Medal className="w-4 h-4 text-secondary" /> Total Coins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-secondary drop-shadow-neon-secondary">{user.coins}</div>
              <div className="text-xs text-muted-foreground mt-2 uppercase tracking-widest">Available to spend</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Categories */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold uppercase tracking-wider flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" /> Combat Stats
              </h3>
            </div>
            
            {statsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-lg bg-muted/50" />)}
              </div>
            ) : stats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">{stats.totalMatches}</div>
                    <div className="text-xs text-muted-foreground uppercase mt-1">Matches</div>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-500">{stats.wins}</div>
                    <div className="text-xs text-muted-foreground uppercase mt-1">Victories</div>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{stats.accuracyPercent}%</div>
                    <div className="text-xs text-muted-foreground uppercase mt-1">Accuracy</div>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-accent">{stats.bestScore}</div>
                    <div className="text-xs text-muted-foreground uppercase mt-1">Best Score</div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-5 h-5 text-secondary" /> Active Arenas
                </h3>
              </div>

              {categoriesLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => <Skeleton key={i} className="h-24 rounded-lg bg-muted/50" />)}
                </div>
              ) : categories ? (
                <div className="space-y-4">
                  {categories.slice(0, 3).map((category, idx) => (
                    <motion.div key={category.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 * idx }}>
                      <Card className="group hover:border-primary/50 transition-colors cursor-pointer bg-card/50 backdrop-blur-xl" onClick={() => setLocation(`/play?category=${encodeURIComponent(category.name)}`)}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-lg mb-1">{category.name}</div>
                            <div className="text-sm text-muted-foreground">{category.questionCount} Questions</div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : null}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold uppercase tracking-wider flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-accent" /> Daily Target
                </h3>
              </div>
              <Card className="bg-card/50 border-accent/20 h-[calc(100%-2rem)] flex flex-col">
                <CardHeader>
                  <CardTitle className="text-sm font-mono text-muted-foreground uppercase">Sample Question</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center">
                  {questionsLoading ? (
                    <Skeleton className="h-16 w-full" />
                  ) : practiceQuestions && practiceQuestions.length > 0 ? (
                    <div>
                      <p className="font-bold text-lg mb-4">{practiceQuestions[0].text}</p>
                      <div className="text-xs text-muted-foreground uppercase tracking-widest">
                        Category: {practiceQuestions[0].category}
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center">No questions available.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        </div>

        {/* Right Column: Recent Matches */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" /> Recent History
            </h3>
            <Link href={`/profile/${user.id}`} className="text-xs text-primary hover:underline">View All</Link>
          </div>

          {matchesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-lg bg-muted/50" />)}
            </div>
          ) : matches && matches.length > 0 ? (
            <div className="space-y-3">
              {matches.slice(0, 5).map((match, idx) => (
                <motion.div key={match.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * idx }}>
                  <Card className="bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm">{match.category || "Mixed Category"}</div>
                        <div className="text-xs text-muted-foreground mt-1">{new Date(match.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-primary">{match.score} pts</div>
                        <div className="text-xs text-muted-foreground">{match.correctAnswers}/{match.totalQuestions} correct</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="bg-card/50 border-border/50 border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Swords className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No matches fought yet.</p>
                <p className="text-sm">Enter the arena to build your legacy.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
