import React from "react";
import { useParams } from "wouter";
import { useGetUserById, useGetUserStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { User as UserIcon, Star, Medal, Swords, Target, Activity, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const userId = parseInt(id || "0", 10);

  const { data: profile, isLoading: profileLoading, error: profileError } = useGetUserById(userId);
  const { data: stats, isLoading: statsLoading } = useGetUserStats(userId);

  if (profileError) {
    return <div className="p-8 text-center text-destructive">Profile not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-5xl space-y-8">
      {/* Profile Header */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
        <CardContent className="pt-20 pb-8 px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
            <div className="w-32 h-32 rounded-2xl bg-background border-4 border-card shadow-2xl flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
              {profileLoading ? (
                <Skeleton className="w-full h-full rounded-xl" />
              ) : (
                <span className="text-5xl font-black text-primary drop-shadow-neon">
                  {profile?.username.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            
            <div className="flex-1 space-y-2">
              {profileLoading ? (
                <>
                  <Skeleton className="h-10 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </>
              ) : (
                <>
                  <h1 className="text-4xl font-black uppercase tracking-widest">{profile?.username}</h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-mono text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Joined {new Date(profile?.createdAt || "").toLocaleDateString()}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-4">
              {profileLoading ? (
                <>
                  <Skeleton className="h-16 w-24 rounded-lg" />
                  <Skeleton className="h-16 w-24 rounded-lg" />
                </>
              ) : (
                <>
                  <div className="bg-background/50 border border-border/50 rounded-lg p-3 text-center min-w-[100px]">
                    <div className="text-xs uppercase text-muted-foreground font-mono mb-1">Rating</div>
                    <div className="text-xl font-black text-accent">{profile?.skillRating}</div>
                  </div>
                  <div className="bg-background/50 border border-border/50 rounded-lg p-3 text-center min-w-[100px]">
                    <div className="text-xs uppercase text-muted-foreground font-mono mb-1">Score</div>
                    <div className="text-xl font-black text-primary">{profile?.totalScore}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Combat Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
        ) : stats ? (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-card/50 border-border/50 h-full">
                <CardContent className="p-6">
                  <Swords className="w-6 h-6 text-muted-foreground mb-4" />
                  <div className="text-3xl font-black">{stats.totalMatches}</div>
                  <div className="text-sm font-mono text-muted-foreground uppercase mt-1">Matches Fought</div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-card/50 border-border/50 h-full">
                <CardContent className="p-6">
                  <Medal className="w-6 h-6 text-green-500 mb-4" />
                  <div className="text-3xl font-black text-green-500">{stats.wins}</div>
                  <div className="text-sm font-mono text-muted-foreground uppercase mt-1">Victories</div>
                  <div className="text-xs mt-2 text-muted-foreground border-t border-border/50 pt-2">Win Rate: {Math.round((stats.wins / Math.max(1, stats.totalMatches)) * 100)}%</div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-card/50 border-border/50 h-full">
                <CardContent className="p-6">
                  <Target className="w-6 h-6 text-primary mb-4" />
                  <div className="text-3xl font-black text-primary">{stats.accuracyPercent}%</div>
                  <div className="text-sm font-mono text-muted-foreground uppercase mt-1">Global Accuracy</div>
                  <div className="text-xs mt-2 text-muted-foreground border-t border-border/50 pt-2">{stats.correctAnswers} Correct Answers</div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="bg-card/50 border-border/50 h-full">
                <CardContent className="p-6">
                  <Activity className="w-6 h-6 text-secondary mb-4" />
                  <div className="text-3xl font-black text-secondary">{stats.bestScore}</div>
                  <div className="text-sm font-mono text-muted-foreground uppercase mt-1">Highest Score</div>
                  <div className="text-xs mt-2 text-muted-foreground border-t border-border/50 pt-2 text-truncate truncate">Fav: {stats.favoriteCategory || "Mixed"}</div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : null}
      </div>

    </div>
  );
}
