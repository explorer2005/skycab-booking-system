// src/bookings.js
import { supabase } from "./supabaseClient";

export async function createBooking({ user_id, pickup, dropoff, vehicle_type, fare }) {
  const { data, error } = await supabase
    .from("bookings")
    .insert([{ user_id, pickup, dropoff, vehicle_type, fare }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getUserBookings(user_id) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAllBookings() {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
