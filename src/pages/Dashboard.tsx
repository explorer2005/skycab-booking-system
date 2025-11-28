import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogOut, Plane } from "lucide-react";
import BookingForm from "@/components/BookingForm";
import MyBookings from "@/components/MyBookings";
import LiveTracking from "@/components/LiveTracking";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-blue via-background to-dark-blue">
        <div className="text-primary text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-blue via-background to-dark-blue">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,255,255,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(168,85,247,0.08),transparent_50%)]" />
      
      <nav className="relative border-b border-primary/30 bg-card/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-primary">SkyCab</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">{user?.email}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-primary/30 hover:bg-primary/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-8">
            <BookingForm userId={user?.id || ""} />
            <MyBookings userId={user?.id || ""} />
          </div>
          <div>
            <LiveTracking />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
