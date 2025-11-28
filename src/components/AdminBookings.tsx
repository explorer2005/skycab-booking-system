import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Settings, MapPin, ArrowRight } from "lucide-react";

interface Booking {
  id: string;
  pickup: string;
  drop: string;
  vehicle_type: string;
  status: string;
  fare: number;
  created_at: string;
  profiles: {
    email: string;
  };
}

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();

    const channel = supabase
      .channel("admin-bookings-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*, profiles(email)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBookings(data as any);
    }
    setLoading(false);
  };

  const updateStatus = async (bookingId: string, newStatus: "requested" | "accepted" | "in_transit" | "completed" | "cancelled") => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (error) {
      toast.error("Failed to update booking status");
    } else {
      toast.success("Booking status updated");
    }
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
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
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
          <Settings className="h-5 w-5" />
          All Bookings Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-primary/20">
                <TableHead className="text-primary">User</TableHead>
                <TableHead className="text-primary">Route</TableHead>
                <TableHead className="text-primary">Vehicle</TableHead>
                <TableHead className="text-primary">Fare</TableHead>
                <TableHead className="text-primary">Status</TableHead>
                <TableHead className="text-primary">Date</TableHead>
                <TableHead className="text-primary">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id} className="border-primary/10">
                  <TableCell className="text-foreground">{booking.profiles?.email}</TableCell>
                  <TableCell className="text-foreground">
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3 text-primary" />
                      <span className="max-w-[100px] truncate">{booking.pickup}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="max-w-[100px] truncate">{booking.drop}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {booking.vehicle_type.replace("_", " ").toUpperCase()}
                  </TableCell>
                  <TableCell className="text-primary font-bold">${booking.fare}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(booking.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={booking.status}
                      onValueChange={(value) => updateStatus(booking.id, value as "requested" | "accepted" | "in_transit" | "completed" | "cancelled")}
                    >
                      <SelectTrigger className="w-[140px] h-8 border-primary/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="requested">Requested</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="in_transit">In Transit</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminBookings;
