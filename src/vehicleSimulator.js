// src/vehicleSimulator.js
import { supabase } from "./supabaseClient";

function randomOffset() {
  return (Math.random() - 0.5) * 0.0015;
}

export async function startSimulation() {
  const { data: vehicles, error } = await supabase.from('vehicles').select('id, lat, lng');
  if (error || !vehicles) return;
  setInterval(async () => {
    for (const v of vehicles) {
      const newLat = Number(v.lat) + randomOffset();
      const newLng = Number(v.lng) + randomOffset();
      await supabase
        .from('vehicles')
        .update({ lat: newLat, lng: newLng, updated_at: new Date().toISOString() })
        .eq('id', v.id);
    }
  }, 5000);
}
