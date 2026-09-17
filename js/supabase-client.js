// Shared Supabase client for QT Training public site + admin dashboard.
// Loaded as an ES module. Uses the anon/publishable key — safe for the browser
// because every table is protected by row-level security policies.

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://krkvhkilntvkbmxtccrf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtya3Zoa2lsbnR2a2JteHRjY3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NjQzMTgsImV4cCI6MjEwNTI0MDMxOH0._CEjsXCgWcTDk7tF5MXCMOetZ2_bVscAceFndEMG-ms";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
