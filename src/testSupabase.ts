// src/testSupabase.ts  (temporary test)
import { supabase } from "./supabaseClient";

async function runAuthTest() {
  try {
    // test reading vehicles
    const { data: v } = await supabase.from("vehicles").select("*").limit(1);
    console.log("VEHICLES:", v);

    // try server-side signup (will create a user in Supabase Auth)
    const email = "testuser@example.com";
    const password = "Test@1234";
    const { data, error } = await supabase.auth.signUp({ email, password });
    console.log("SIGNUP RESULT:", data, error);
  } catch (err) {
    console.error("TEST ERROR:", err);
  }
}

runAuthTest();
