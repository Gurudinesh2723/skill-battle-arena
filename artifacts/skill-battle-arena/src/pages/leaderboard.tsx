import React from "react";
import { Link } from "wouter";
import { useGetLeaderboard, useGetLeaderboardSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Star, Users, ArrowUpRight, Crown } from "lucide-react";
import { motion } from "framer-motion";

export default function Leaderboard() {
  const { data: summary, isLoading: summaryLoading } = useGetLeaderboardSummary();
  const { data: leaderboard, isLoading: leaderboardLoading } = useGetLeaderboard({ limit: 100 });

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-6xl space-y-8 animate-in fade-in">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest flex items-center justify-center gap-4">
          <Trophy className="w-10 h-10 text-accent drop-shadow-neon-accent" />
          Global Rankings
          <Trophy className="w-10 h-10 text-accent drop-shadow-neon-accent" />
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto font-mono text-sm">
          The most formidable minds in the arena. Climb the ranks by winning matches and maintaining high accuracy.
        </p>
      </div>

      {/* Summary Stats */}
      {summaryLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-lg bg-muted/50" />)}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 text-center">
              <Users className="w-6 h-6 text-primary mx-auto mb-2 opacity-50" />
              <div className="text-2xl font-black">{summary.totalPlayers.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground uppercase font-mono mt-1">Total Fighters</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 text-center">
              <Medal className="w-6 h-6 text-secondary mx-auto mb-2 opacity-50" />
              <div className="text-2xl font-black text-secondary">{summary.topScore.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground uppercase font-mono mt-1">Highest Score</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 text-center">
              <Target className="w-6 h-6 text-accent mx-auto mb-2 opacity-50" />
              <div className="text-2xl font-black">{Math.round(summary.avgScore).toLocaleString()}</div>
              <div className="text-xs text-muted-foreground uppercase font-mono mt-1">Avg Score</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 text-center">
              <Swords className="w-6 h-6 text-primary mx-auto mb-2 opacity-50" />
              <div className="text-2xl font-black">{summary.totalMatchesPlayed.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground uppercase font-mono mt-1">Matches Fought</div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Leaderboard Table */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-xs uppercase font-mono text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-semibold w-24 text-center">Rank</th>
                <th className="px-6 py-4 font-semibold">Fighter</th>
                <th className="px-6 py-4 font-semibold text-right">Rating</th>
                <th className="px-6 py-4 font-semibold text-right">Score</th>
                <th className="px-6 py-4 font-semibold text-right">Victories</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/10">
                    <td colSpan={5} className="px-6 py-4">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : leaderboard?.map((entry, idx) => {
                const isTop3 = entry.rank <= 3;
                let rankVisual = <span className="font-mono text-lg">{entry.rank}</span>;
                
                if (entry.rank === 1) rankVisual = <Crown className="w-6 h-6 text-accent mx-auto drop-shadow-neon-accent" />;
                else if (entry.rank === 2) rankVisual = <span className="text-xl font-bold text-gray-300">2</span>;
                else if (entry.rank === 3) rankVisual = <span className="text-xl font-bold text-amber-600">3</span>;

                return (
                  <motion.tr 
                    key={entry.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`border-b border-border/10 hover:bg-muted/20 transition-colors ${entry.rank === 1 ? 'bg-primary/5' : ''}`}
                  >
                    <td className="px-6 py-4 text-center font-black">
                      {rankVisual}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/profile/${entry.userId}`} className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded bg-background border border-border/50 flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          {entry.username.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-lg group-hover:text-primary transition-colors">
                          {entry.username}
                        </span>
                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-mono font-bold text-secondary">{entry.skillRating}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-mono font-bold">{entry.totalScore.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-mono font-bold text-green-500">{entry.wins}</div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {leaderboard && leaderboard.length === 0 && (
          <div className="p-12 text-center text-muted-foreground font-mono">
            No fighters found in the arena.
          </div>
        )}
      </Card>
    </div>
  );
}

// Ensure icons are imported
import { Target, Swords } from "lucide-react";
