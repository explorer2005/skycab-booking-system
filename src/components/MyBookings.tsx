import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, ArrowRight } from "lucide-react";

interface Booking {
  id: string;
  pickup: string;
  drop: string;
  vehicle_type: string;
  status: string;
  fare: number;
  created_at: string;
}

interface MyBookingsProps {
  userId: string;
}

const MyBookings = ({ userId }: MyBookingsProps) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();

    const channel = supabase
      .channel("bookings-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setBookings(data);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "requested":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "accepted":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "in_transit":
        return "bg-primary/20 text-primary border-primary/30";
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  if (loading) {
    return (
      <Card className="border-primary/30 shadow-[0_0_20px_rgba(0,255,255,0.15)] bg-card/95 backdrop-blur-sm">
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">Loading bookings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 shadow-[0_0_20px_rgba(0,255,255,0.15)] bg-card/95 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <Clock className="h-5 w-5" />
          My Bookings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {bookings.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No bookings yet</p>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="p-4 border border-primary/20 rounded-lg bg-muted/5 space-y-2 hover:bg-muted/10 transition-colors"
            >
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status.replace("_", " ").toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(booking.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-foreground">{booking.pickup}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{booking.drop}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {booking.vehicle_type.replace("_", " ").toUpperCase()}
                </span>
                <span className="text-primary font-bold">${booking.fare}</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default MyBookings;
