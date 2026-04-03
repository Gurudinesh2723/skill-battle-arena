import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useListCategories, useCreateMatch } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Swords, Zap, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Play() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: categories, isLoading: categoriesLoading } = useListCategories();
  const createMatchMutation = useCreateMatch();

  const [selectedCategory, setSelectedCategory] = useState<string>("random");
  const [questionCount, setQuestionCount] = useState<number>(10);

  // Parse category from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat) setSelectedCategory(cat);
  }, []);

  if (!user) {
    setLocation("/");
    return null;
  }

  const handleStartMatch = () => {
    createMatchMutation.mutate({
      data: {
        category: selectedCategory === "random" ? null : selectedCategory,
        questionCount
      }
    }, {
      onSuccess: (match) => {
        setLocation(`/game/${match.id}`);
      },
      onError: (err) => {
        toast({ title: "Failed to initialize arena", description: err.error, variant: "destructive" });
      }
    });
  };

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-4xl flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full"
      >
        <Card className="border-primary/30 bg-card/80 backdrop-blur-xl shadow-[0_0_50px_rgba(0,255,255,0.05)] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[64px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-[64px] pointer-events-none" />
          
          <CardHeader className="text-center border-b border-border/50 pb-8 pt-10">
            <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4 border border-primary/50">
              <Swords className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-black uppercase tracking-widest drop-shadow-neon">Configure Battle</CardTitle>
            <CardDescription className="text-lg">Set the parameters for your next match</CardDescription>
          </CardHeader>
          
          <CardContent className="p-8 space-y-8 relative z-10">
            <div className="space-y-4">
              <Label className="text-base uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" /> Select Arena (Category)
              </Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-14 text-lg bg-background/50 border-primary/30 focus:ring-primary focus:border-primary">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="random" className="font-bold text-primary">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" /> Mixed / Random
                    </div>
                  </SelectItem>
                  {categories?.map(c => (
                    <SelectItem key={c.name} value={c.name}>{c.name} ({c.questionCount} Qs)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-base uppercase tracking-wider text-muted-foreground">Match Length</Label>
              <ToggleGroup 
                type="single" 
                value={questionCount.toString()} 
                onValueChange={(v) => v && setQuestionCount(parseInt(v))}
                className="justify-start gap-4"
              >
                {[5, 10, 20].map(num => (
                  <ToggleGroupItem 
                    key={num} 
                    value={num.toString()} 
                    className={`h-14 px-8 text-lg font-bold border ${questionCount === num ? 'border-primary bg-primary/20 text-primary' : 'border-border bg-background/50 text-muted-foreground hover:border-primary/50'}`}
                  >
                    {num} Questions
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div className="pt-8">
              <Button 
                onClick={handleStartMatch} 
                disabled={createMatchMutation.isPending || categoriesLoading}
                className="w-full h-16 text-xl font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:shadow-[0_0_30px_rgba(0,255,255,0.6)] transition-all"
              >
                {createMatchMutation.isPending ? "Initializing..." : "Start Match"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
