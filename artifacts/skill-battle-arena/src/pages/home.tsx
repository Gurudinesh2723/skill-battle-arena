import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLoginUser, useRegisterUser } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Swords, Zap, Trophy } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, isLoading, setToken } = useAuth();
  const { toast } = useToast();
  
  const loginMutation = useLoginUser();
  const registerMutation = useRegisterUser();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  }

  if (user) {
    setLocation("/dashboard");
    return null;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { email, password } }, {
      onSuccess: (data) => {
        setToken(data.token);
        setLocation("/dashboard");
      },
      onError: (err) => {
        toast({ title: "Login failed", description: err.error, variant: "destructive" });
      }
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({ data: { email, password, username } }, {
      onSuccess: (data) => {
        setToken(data.token);
        setLocation("/dashboard");
      },
      onError: (err) => {
        toast({ title: "Registration failed", description: err.error, variant: "destructive" });
      }
    });
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[128px] pointer-events-none" />
      
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center z-10">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium">
            <Zap className="w-4 h-4" />
            <span>Season 1 Live Now</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-tight">
            The Arena Where <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-neon">
              Knowledge
            </span> <br/>
            Is Your Weapon
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg">
            Test your wits against players worldwide. Climb the leaderboard, earn coins, and prove your intellectual dominance in fast-paced real-time trivia battles.
          </p>
          <div className="flex gap-4 pt-4">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-primary" />
              <span className="font-mono text-sm">PvP Battles</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" />
              <span className="font-mono text-sm">Global Rankings</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold uppercase tracking-wider">Enter the Arena</CardTitle>
              <CardDescription>Login or register to start battling</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input 
                        id="login-email" 
                        type="email" 
                        placeholder="player@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input 
                        id="login-password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-background/50"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_0_15px_rgba(0,255,255,0.4)]" disabled={loginMutation.isPending}>
                      {loginMutation.isPending ? "Connecting..." : "Initialize Link"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-username">Username</Label>
                      <Input 
                        id="reg-username" 
                        placeholder="PlayerOne"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input 
                        id="reg-email" 
                        type="email" 
                        placeholder="player@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <Input 
                        id="reg-password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-background/50"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold shadow-[0_0_15px_rgba(255,0,255,0.4)]" disabled={registerMutation.isPending}>
                      {registerMutation.isPending ? "Creating Profile..." : "Create Profile"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
