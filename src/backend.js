// ═══════════════════════════════════════════════════════════════
// LEP HUB — Backend Integration Layer
// Supabase (Auth + Database) + Stripe (Payments)
// Falls back to localStorage when not configured
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
const STRIPE_PRICE_PRO = import.meta.env.VITE_STRIPE_PRICE_PRO || '';
const STRIPE_PRICE_ENTERPRISE = import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE || '';

// ─── FEATURE FLAGS ────────────────────────────────────────────
export const hasSupabase = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
export const hasStripe = !!STRIPE_PUBLISHABLE_KEY;

// ─── SUPABASE CLIENT ──────────────────────────────────────────
export const supabase = hasSupabase
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// ─── STRIPE CLIENT ────────────────────────────────────────────
let stripePromise = null;
export const getStripe = () => {
  if (!hasStripe) return null;
  if (!stripePromise) stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  return stripePromise;
};

// ═══════════════════════════════════════════════════════════════
// AUTH MODULE — Supabase Auth with localStorage fallback
// ═══════════════════════════════════════════════════════════════

export const auth = {
  // Sign up new user
  async signUp({ email, password, name, orgName, role }) {
    if (hasSupabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, orgName, role }
        }
      });
      if (error) throw error;
      // Create profile row
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email,
          name,
          org_name: orgName,
          role,
          tier: 'free',
          created_at: new Date().toISOString(),
        });
      }
      // Return normalized user object (Supabase puts custom fields in user_metadata)
      const u = data.user;
      const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '';
      return { user: { id: u.id, email: u.email, name, orgName, role, tier: 'free', initials }, session: data.session };
    }

    // localStorage fallback
    const users = JSON.parse(localStorage.getItem('lep_users') || '[]');
    if (users.find(u => u.email === email.toLowerCase().trim())) {
      throw new Error('An account with that email already exists.');
    }
    const newUser = {
      id: 'user_' + Date.now(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      orgName: orgName?.trim() || '',
      role,
      tier: 'free',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem('lep_users', JSON.stringify(users));
    const userObj = { ...newUser };
    delete userObj.password;
    userObj.initials = newUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    localStorage.setItem('lep_current_user', JSON.stringify(userObj));
    return { user: userObj };
  },

  // Sign in existing user
  async signIn({ email, password }) {
    if (hasSupabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Fetch profile for normalized user object
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      if (profile) {
        const initials = profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : '';
        return { user: { id: profile.id, email: profile.email, name: profile.name, orgName: profile.org_name, role: profile.role, tier: profile.tier || 'free', initials }, session: data.session };
      }
      // Fallback to user_metadata if profile not found
      const meta = data.user.user_metadata || {};
      const initials = meta.name ? meta.name.split(' ').map(n => n[0]).join('').toUpperCase() : '';
      return { user: { id: data.user.id, email: data.user.email, name: meta.name || '', orgName: meta.orgName || '', role: meta.role || 'owner', tier: 'free', initials }, session: data.session };
    }

    // localStorage fallback
    const users = JSON.parse(localStorage.getItem('lep_users') || '[]');
    const user = users.find(u => u.email === email.toLowerCase().trim());
    if (!user) throw new Error('No account found with that email.');
    if (user.password !== password) throw new Error('Incorrect password.');
    user.lastLogin = new Date().toISOString();
    localStorage.setItem('lep_users', JSON.stringify(users));
    const userObj = { ...user };
    delete userObj.password;
    userObj.initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    localStorage.setItem('lep_current_user', JSON.stringify(userObj));
    return { user: userObj };
  },

  // Sign out
  async signOut() {
    if (hasSupabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('lep_current_user');
  },

  // Get current user
  async getCurrentUser() {
    if (hasSupabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return profile ? { ...profile, initials: profile.name?.split(' ').map(n => n[0]).join('').toUpperCase() } : null;
    }

    // localStorage fallback
    try {
      const saved = localStorage.getItem('lep_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  },

  // Password reset
  async resetPassword(email) {
    if (hasSupabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    }
    // localStorage: no-op (simulated)
  },

  // Listen for auth changes (Supabase only)
  onAuthStateChange(callback) {
    if (hasSupabase) {
      return supabase.auth.onAuthStateChange(callback);
    }
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
};


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
  // Redirect to Stripe Checkout for subscription
  async checkout(tier, userEmail, userId) {
    if (!hasStripe) {
      console.log('Stripe not configured — upgrade simulated');
      // Simulate upgrade in localStorage
      const currentUser = JSON.parse(localStorage.getItem('lep_current_user') || '{}');
      currentUser.tier = tier;
      localStorage.setItem('lep_current_user', JSON.stringify(currentUser));
      return { simulated: true, tier };
    }

    const stripe = await getStripe();
    const priceId = tier === 'pro' ? STRIPE_PRICE_PRO : STRIPE_PRICE_ENTERPRISE;

    // In production, this would call a serverless function to create a Checkout Session
    // For now, we use Stripe's client-only Checkout (requires Stripe Dashboard config)
    const { error } = await stripe.redirectToCheckout({
      lineItems: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      successUrl: `${window.location.origin}?checkout=success&tier=${tier}`,
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

  // Tier gating — check if user has access to a feature
  hasAccess(tier, feature) {
    const FREE_FEATURES = ['assessment', 'dashboard', 'family-profile-basic'];
    const PRO_FEATURES = [...FREE_FEATURES, 'lep-journey', 'family-dynamics', 'valuation-engine', 'meetings', 'vault', 'decision-engine', 'pillars'];
    const ENTERPRISE_FEATURES = [...PRO_FEATURES, 'advisor-portal', 'multi-entity', 'api-access', 'custom-reporting'];

    if (tier === 'enterprise') return ENTERPRISE_FEATURES.includes(feature) || true; // enterprise gets everything
    if (tier === 'pro') return PRO_FEATURES.includes(feature);
    return FREE_FEATURES.includes(feature);
  },

  TIER_DETAILS: {
    free: { name: 'Explorer', price: 'Free', color: '#64748b' },
    pro: { name: 'Pro', price: '$99/mo', color: '#2d5a3d' },
    enterprise: { name: 'Enterprise', price: '$499/mo', color: '#1a3a5c' },
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
