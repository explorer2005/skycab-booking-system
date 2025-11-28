import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { MapPin, DollarSign } from "lucide-react";

interface BookingFormProps {
  userId: string;
}

const BookingForm = ({ userId }: BookingFormProps) => {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [vehicleType, setVehicleType] = useState<"drone_taxi" | "air_taxi" | "vtol">("drone_taxi");
  const [fare, setFare] = useState(0);
  const [loading, setLoading] = useState(false);

  const calculateFare = () => {
    const baseRates = {
      drone_taxi: 50,
      air_taxi: 100,
      vtol: 150,
    };
    const distance = Math.random() * 20 + 5;
    const calculatedFare = baseRates[vehicleType] + distance * 10;
    setFare(Math.round(calculatedFare));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fare === 0) {
      toast.error("Please calculate fare first");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("bookings").insert({
      user_id: userId,
      pickup,
      drop,
      vehicle_type: vehicleType,
      fare,
      status: "requested",
    });

    if (error) {
      toast.error("Booking failed: " + error.message);
    } else {
      toast.success("Booking created successfully!");
      setPickup("");
      setDrop("");
      setFare(0);
    }
    setLoading(false);
  };

  return (
    <Card className="border-primary/30 shadow-[0_0_20px_rgba(0,255,255,0.15)] bg-card/95 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Book Your Flight
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pickup">Pickup Location</Label>
            <Input
              id="pickup"
              placeholder="Enter pickup location"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              required
              className="border-primary/30 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="drop">Drop Location</Label>
            <Input
              id="drop"
              placeholder="Enter drop location"
              value={drop}
              onChange={(e) => setDrop(e.target.value)}
              required
              className="border-primary/30 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicle">Vehicle Type</Label>
            <Select value={vehicleType} onValueChange={(value: any) => setVehicleType(value)}>
              <SelectTrigger className="border-primary/30 focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="drone_taxi">Drone Taxi (Fast, 2 passengers)</SelectItem>
                <SelectItem value="air_taxi">Air Taxi (Comfortable, 4 passengers)</SelectItem>
                <SelectItem value="vtol">VTOL (Luxury, 6 passengers)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            onClick={calculateFare}
            variant="outline"
            className="w-full border-primary/30 hover:bg-primary/10"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Calculate Fare
          </Button>

          {fare > 0 && (
            <div className="p-4 border border-primary/30 rounded-lg bg-primary/5 text-center">
              <p className="text-sm text-muted-foreground mb-1">Estimated Fare</p>
              <p className="text-3xl font-bold text-primary">${fare}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(0,255,255,0.3)]"
            disabled={loading || fare === 0}
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BookingForm;
