import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Plane, Zap, Shield, Clock } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session) {
          navigate("/dashboard");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        navigate("/dashboard");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-blue via-background to-dark-blue">
        <div className="text-primary text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-blue via-background to-dark-blue overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,255,255,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(168,85,247,0.1),transparent_50%)]" />
      
      <div className="relative">
        <header className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10 border-2 border-primary">
              <Plane className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-primary">SkyCab</span>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate("/auth")}
              variant="outline"
              className="border-primary/30 hover:bg-primary/10"
            >
              Login
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(0,255,255,0.3)]"
            >
              Sign Up
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4 animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold text-primary tracking-tight">
                The Future of
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  Urban Transport
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                Book your flying taxi in seconds. Experience the sky like never before.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button
                onClick={() => navigate("/auth")}
                size="lg"
                className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_30px_rgba(0,255,255,0.4)] hover:shadow-[0_0_40px_rgba(0,255,255,0.6)] transition-all"
              >
                <Plane className="mr-2 h-5 w-5" />
                Start Flying Now
              </Button>
              <Button
                onClick={() => navigate("/admin")}
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-primary/30 hover:bg-primary/10"
              >
                Admin Portal
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-20">
              <div className="p-6 border border-primary/30 rounded-xl bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">Ultra Fast</h3>
                <p className="text-muted-foreground">
                  Skip the traffic. Reach your destination 10x faster.
                </p>
              </div>

              <div className="p-6 border border-primary/30 rounded-xl bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
                <div className="w-12 h-12 rounded-full bg-secondary/10 border-2 border-secondary flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-2">100% Safe</h3>
                <p className="text-muted-foreground">
                  AI-powered navigation with autonomous safety systems.
                </p>
              </div>

              <div className="p-6 border border-primary/30 rounded-xl bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">24/7 Available</h3>
                <p className="text-muted-foreground">
                  Book anytime, anywhere. Your sky chariot awaits.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
