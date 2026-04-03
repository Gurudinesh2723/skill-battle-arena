import React from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Trophy, Swords, User, LogOut } from "lucide-react";
import { useLogoutUser } from "@workspace/api-client-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const logoutMutation = useLogoutUser();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        logout();
      }
    });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col text-foreground">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
            <Swords className="w-6 h-6 text-primary group-hover:text-secondary transition-colors" />
            <span className="font-bold text-lg tracking-tight uppercase tracking-widest text-primary drop-shadow-neon">
              Skill Arena
            </span>
          </Link>
          
          {user && (
            <nav className="flex items-center gap-6">
              <Link href="/leaderboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span>Rankings</span>
              </Link>
              <div className="flex items-center gap-4 border-l border-border/50 pl-6">
                <Link href={`/profile/${user.id}`} className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                  <User className="w-4 h-4 text-secondary" />
                  <span>{user.username}</span>
                </Link>
                <div className="flex items-center gap-2 text-sm font-mono text-accent">
                  <span className="opacity-50 text-xs">RATING</span>
                  <span>{user.skillRating}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </nav>
          )}
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
