// ═══════════════════════════════════════════════════════════════
// LEP HUB — Backend Integration Layer
// Netlify Identity (Auth) + Supabase (Database) + Stripe (Payments)
// Database falls back to localStorage when not configured
// ═══════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';
import { loadStripe } from '@stripe/stripe-js';

// ─── CONFIGURATION ────────────────────────────────────────────
// To activate: replace these with your real keys
// Supabase: Create project at https://supabase.com → Settings → API
// Stripe: Get keys at https://dashboard.stripe.com/apikeys

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const STRIPE_PRICE_MEMBERSHIP = import.meta.env.VITE_STRIPE_PRICE_MEMBERSHIP || '';

// ─── FEATURE FLAGS ────────────────────────────────────────────
export const hasSupabase = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
export const hasStripe = !!STRIPE_PUBLISHABLE_KEY;

// ─── SUPABASE CLIENT ──────────────────────────────────────────
export const supabase = hasSupabase
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
  : null;

// ─── STRIPE CLIENT ────────────────────────────────────────────
let stripePromise = null;
export const getStripe = () => {
  if (!hasStripe) return null;
  if (!stripePromise) stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  return stripePromise;
};

export { auth } from './identityAuth.js';


// ═══════════════════════════════════════════════════════════════
// DATABASE MODULE — Supabase Postgres with localStorage fallback
// ═══════════════════════════════════════════════════════════════

export const db = {
  // Save any data key for current user
  async save(key, data, userId) {
    if (hasSupabase && userId) {
      const { error } = await supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          data_key: key,
          data_value: data,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,data_key' });
      if (error) console.error(`DB save error (${key}):`, error);
      return;
    }
    // localStorage fallback
    try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
  },

  // Load any data key for current user
  async load(key, userId, defaultValue = null) {
    if (hasSupabase && userId) {
      const { data, error } = await supabase
        .from('user_data')
        .select('data_value')
        .eq('user_id', userId)
        .eq('data_key', key)
        .single();
      if (error || !data) return defaultValue;
      return data.data_value;
    }
    // localStorage fallback
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch { return defaultValue; }
  },

  // Delete a data key
  async remove(key, userId) {
    if (hasSupabase && userId) {
      await supabase.from('user_data').delete().eq('user_id', userId).eq('data_key', key);
      return;
    }
    localStorage.removeItem(key);
  },

  // Load profile (Supabase: from profiles table)
  async getProfile(userId) {
    if (hasSupabase && userId) {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      return data;
    }
    return null;
  },

  // Update profile
  async updateProfile(userId, updates) {
    if (hasSupabase && userId) {
      const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
      if (error) console.error('Profile update error:', error);
    }
  }
};


// ═══════════════════════════════════════════════════════════════
// PAYMENTS MODULE — Stripe Checkout + Subscription Management
// ═══════════════════════════════════════════════════════════════

export const payments = {
  // Redirect to Stripe Checkout for membership ($500/year)
  async checkout(userEmail, userId) {
    if (!hasStripe) {
      console.log('Stripe not configured — membership simulated');
      // Simulate membership in localStorage
      const currentUser = JSON.parse(localStorage.getItem('lep_current_user') || '{}');
      currentUser.tier = 'member';
      localStorage.setItem('lep_current_user', JSON.stringify(currentUser));
      return { simulated: true, tier: 'member' };
    }

    const stripe = await getStripe();
    const priceId = STRIPE_PRICE_MEMBERSHIP;

    const { error } = await stripe.redirectToCheckout({
      lineItems: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      successUrl: `${window.location.origin}?checkout=success&tier=member`,
      cancelUrl: `${window.location.origin}?checkout=cancel`,
      customerEmail: userEmail,
      clientReferenceId: userId,
    });

    if (error) throw error;
  },

  // Open Stripe Customer Portal (manage subscription)
  async openPortal() {
    if (!hasStripe) {
      alert('Stripe not configured. In production, this opens Stripe Customer Portal.');
      return;
    }
    // In production: call serverless function → create portal session → redirect
    window.open('https://billing.stripe.com/p/login/test', '_blank');
  },

  // Check for checkout success on page load
  checkReturnFromCheckout() {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get('checkout');
    const tier = params.get('tier');
    if (checkout === 'success' && tier) {
      window.history.replaceState({}, '', window.location.pathname);
      return { success: true, tier };
    }
    if (checkout === 'cancel') {
      window.history.replaceState({}, '', window.location.pathname);
      return { success: false };
    }
    return null;
  },

  // Tier gating — members get everything, non-members get membership page only
  hasAccess(tier, feature) {
    if (tier === 'member' || tier === 'pro' || tier === 'enterprise') return true;
    return ['assessment', 'dashboard', 'membership'].includes(feature);
  },

  TIER_DETAILS: {
    free: { name: 'Free', price: 'Free', color: '#64748b' },
    member: { name: 'Stride Member', price: '$500/yr', color: '#2D5A3D' },
  }
};


// ═══════════════════════════════════════════════════════════════
// SUPABASE SCHEMA — Run this SQL in Supabase SQL Editor to set up
// ═══════════════════════════════════════════════════════════════
/*
-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  org_name TEXT DEFAULT '',
  role TEXT DEFAULT 'owner',
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User data table (key-value store per user for all app data)
CREATE TABLE user_data (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  data_key TEXT NOT NULL,
  data_value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, data_key)
);

-- Row Level Security (users can only see their own data)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own data" ON user_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON user_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON user_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own data" ON user_data FOR DELETE USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_user_data_lookup ON user_data(user_id, data_key);
*/
