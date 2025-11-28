import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "lucide-react";

interface Vehicle {
  id: string;
  name: string;
  vehicle_type: string;
  lat: number;
  lng: number;
  status: string;
}

const LiveTracking = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();

    const channel = supabase
      .channel("vehicles-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vehicles",
        },
        () => {
          fetchVehicles();
        }
      )
      .subscribe();

    const interval = setInterval(() => {
      updateVehiclePositions();
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("name");

    if (!error && data) {
      setVehicles(data);
    }
    setLoading(false);
  };

  const updateVehiclePositions = async () => {
    const updates = vehicles.map((vehicle) => ({
      id: vehicle.id,
      lat: parseFloat((vehicle.lat + (Math.random() - 0.5) * 0.01).toFixed(8)),
      lng: parseFloat((vehicle.lng + (Math.random() - 0.5) * 0.01).toFixed(8)),
    }));

    for (const update of updates) {
      await supabase
        .from("vehicles")
        .update({ lat: update.lat, lng: update.lng })
        .eq("id", update.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "occupied":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "maintenance":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  if (loading) {
    return (
      <Card className="border-primary/30 shadow-[0_0_20px_rgba(0,255,255,0.15)] bg-card/95 backdrop-blur-sm">
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">Loading vehicles...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 shadow-[0_0_20px_rgba(0,255,255,0.15)] bg-card/95 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          Live Vehicle Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video bg-muted/10 rounded-lg border border-primary/20 p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
          <div className="relative h-full">
            {vehicles.map((vehicle, idx) => (
              <div
                key={vehicle.id}
                className="absolute w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_rgba(0,255,255,0.5)] animate-pulse"
                style={{
                  left: `${20 + idx * 15}%`,
                  top: `${30 + (idx % 3) * 20}%`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="p-3 border border-primary/20 rounded-lg bg-muted/5 flex items-center justify-between hover:bg-muted/10 transition-colors"
            >
              <div>
                <p className="font-medium text-foreground">{vehicle.name}</p>
                <p className="text-xs text-muted-foreground">
                  {vehicle.vehicle_type.replace("_", " ").toUpperCase()} • {vehicle.lat.toFixed(4)}, {vehicle.lng.toFixed(4)}
                </p>
              </div>
              <Badge className={getStatusColor(vehicle.status)}>
                {vehicle.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveTracking;
