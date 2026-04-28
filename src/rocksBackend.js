// ═══════════════════════════════════════════════════════════════
// LEP HUB — Priority Tracker (Rocks) Backend Module
// Three-Circle Rocks: Business, Family, Ownership
// Follows existing backend.js patterns: Supabase + localStorage fallback
// ═══════════════════════════════════════════════════════════════

import { supabase, hasSupabase } from './backend';

// ─── HELPERS ──────────────────────────────────────────────────
const generateId = () => 'rock_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
const checkinId = () => 'ci_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
const milestoneId = () => 'ms_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);

const getCurrentQuarter = () => {
  const now = new Date();
  return { quarter: Math.ceil((now.getMonth() + 1) / 3), year: now.getFullYear() };
};

const getWeekKey = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay() + 1); // Monday
  return d.toISOString().split('T')[0];
};

// ─── DOMAINS ──────────────────────────────────────────────────
export const ROCK_DOMAINS = {
  business: {
    id: 'business',
    label: 'Business',
    color: '#2d5a3d',
    icon: '📊',
    description: 'Operational and strategic business priorities',
    pillar: 'MOMENTUM',
  },
  family: {
    id: 'family',
    label: 'Family',
    color: '#8b5e3c',
    icon: '🌳',
    description: 'Family alignment, development, and communication',
    pillar: 'ROOTS',
  },
  ownership: {
    id: 'ownership',
    label: 'Ownership',
    color: '#1a3a5c',
    icon: '🏛️',
    description: 'Governance, structure, and ownership decisions',
    pillar: 'ORDER',
  },
};

export const ROCK_STATUSES = {
  on_track: { label: 'On Track', color: '#22c55e', icon: '●' },
  off_track: { label: 'Off Track', color: '#ef4444', icon: '●' },
  at_risk: { label: 'At Risk', color: '#f59e0b', icon: '●' },
  not_started: { label: 'Not Started', color: '#94a3b8', icon: '○' },
  completed: { label: 'Done', color: '#2d5a3d', icon: '✓' },
  dropped: { label: 'Dropped', color: '#64748b', icon: '✕' },
};

// ═══════════════════════════════════════════════════════════════
// ROCKS CRUD — Core data operations
// ═══════════════════════════════════════════════════════════════

export const rocks = {
  // ─── CREATE ───────────────────────────────────────────────
  async create(rock, userId) {
    const newRock = {
      id: generateId(),
      user_id: userId,
      title: rock.title,
      description: rock.description || '',
      domain: rock.domain, // 'business' | 'family' | 'ownership'
      owner_name: rock.ownerName || '',
      owner_id: rock.ownerId || userId,
      quarter: rock.quarter || getCurrentQuarter().quarter,
      year: rock.year || getCurrentQuarter().year,
      status: 'not_started',
      is_family_rock: rock.isFamilyRock || false, // belongs to the family, not one person
      pillar_tag: rock.pillarTag || ROCK_DOMAINS[rock.domain]?.pillar || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null,
    };

    if (hasSupabase && userId) {
      const { data, error } = await supabase.from('rocks').insert(newRock).select().single();
      if (error) throw error;
      return data;
    }

    // localStorage fallback
    const all = JSON.parse(localStorage.getItem('lep_rocks') || '[]');
    all.push(newRock);
    localStorage.setItem('lep_rocks', JSON.stringify(all));
    return newRock;
  },

  // ─── READ ─────────────────────────────────────────────────
  async getByQuarter(userId, quarter, year) {
    if (hasSupabase && userId) {
      const { data, error } = await supabase
        .from('rocks')
        .select('*')
        .eq('user_id', userId)
        .eq('quarter', quarter)
        .eq('year', year)
        .order('domain')
        .order('created_at');
      if (error) throw error;
      return data || [];
    }

    const all = JSON.parse(localStorage.getItem('lep_rocks') || '[]');
    return all.filter(r => r.user_id === userId && r.quarter === quarter && r.year === year);
  },

  async getCurrent(userId) {
    const { quarter, year } = getCurrentQuarter();
    return this.getByQuarter(userId, quarter, year);
  },

  async getById(rockId, userId) {
    if (hasSupabase && userId) {
      const { data, error } = await supabase
        .from('rocks')
        .select('*')
        .eq('id', rockId)
        .eq('user_id', userId)
        .single();
      if (error) throw error;
      return data;
    }

    const all = JSON.parse(localStorage.getItem('lep_rocks') || '[]');
    return all.find(r => r.id === rockId) || null;
  },

  async getAll(userId) {
    if (hasSupabase && userId) {
      const { data, error } = await supabase
        .from('rocks')
        .select('*')
        .eq('user_id', userId)
        .order('year', { ascending: false })
        .order('quarter', { ascending: false })
        .order('domain');
      if (error) throw error;
      return data || [];
    }

    const all = JSON.parse(localStorage.getItem('lep_rocks') || '[]');
    return all.filter(r => r.user_id === userId);
  },

  // ─── UPDATE ───────────────────────────────────────────────
  async update(rockId, updates, userId) {
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (updates.status === 'completed') {
      updatedData.completed_at = new Date().toISOString();
    }

    if (hasSupabase && userId) {
      const { data, error } = await supabase
        .from('rocks')
        .update(updatedData)
        .eq('id', rockId)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const all = JSON.parse(localStorage.getItem('lep_rocks') || '[]');
    const idx = all.findIndex(r => r.id === rockId);
    if (idx === -1) throw new Error('Rock not found');
    all[idx] = { ...all[idx], ...updatedData };
    localStorage.setItem('lep_rocks', JSON.stringify(all));
    return all[idx];
  },

  // ─── DELETE ───────────────────────────────────────────────
  async remove(rockId, userId) {
    if (hasSupabase && userId) {
      const { error } = await supabase
        .from('rocks')
        .delete()
        .eq('id', rockId)
        .eq('user_id', userId);
      if (error) throw error;
      return;
    }

    const all = JSON.parse(localStorage.getItem('lep_rocks') || '[]');
    localStorage.setItem('lep_rocks', JSON.stringify(all.filter(r => r.id !== rockId)));
  },

  // ─── QUARTERLY SCORING ────────────────────────────────────
  async scoreQuarter(userId, quarter, year) {
    const quarterRocks = await this.getByQuarter(userId, quarter, year);

    const total = quarterRocks.length;
    const completed = quarterRocks.filter(r => r.status === 'completed').length;
    const dropped = quarterRocks.filter(r => r.status === 'dropped').length;
    const active = total - dropped;

    const byDomain = {};
    Object.keys(ROCK_DOMAINS).forEach(domain => {
      const domainRocks = quarterRocks.filter(r => r.domain === domain);
      const domainCompleted = domainRocks.filter(r => r.status === 'completed').length;
      const domainActive = domainRocks.filter(r => r.status !== 'dropped').length;
      byDomain[domain] = {
        total: domainRocks.length,
        completed: domainCompleted,
        active: domainActive,
        rate: domainActive > 0 ? Math.round((domainCompleted / domainActive) * 100) : 0,
      };
    });

    return {
      quarter,
      year,
      total,
      completed,
      dropped,
      active,
      completionRate: active > 0 ? Math.round((completed / active) * 100) : 0,
      byDomain,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
// WEEKLY CHECK-INS — Status updates on each rock
// ═══════════════════════════════════════════════════════════════

export const checkins = {
  async create(rockId, status, note, userId) {
    const newCheckin = {
      id: checkinId(),
      rock_id: rockId,
      user_id: userId,
      week_key: getWeekKey(),
      status, // 'on_track' | 'off_track' | 'at_risk'
      note: note || '',
      created_at: new Date().toISOString(),
    };

    if (hasSupabase && userId) {
      // Upsert: one check-in per rock per week
      const { data, error } = await supabase
        .from('rock_checkins')
        .upsert(newCheckin, { onConflict: 'rock_id,week_key' })
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const all = JSON.parse(localStorage.getItem('lep_checkins') || '[]');
    // Replace existing check-in for same rock + week
    const filtered = all.filter(c => !(c.rock_id === rockId && c.week_key === newCheckin.week_key));
    filtered.push(newCheckin);
    localStorage.setItem('lep_checkins', JSON.stringify(filtered));
    return newCheckin;
  },

  async getForRock(rockId, userId) {
    if (hasSupabase && userId) {
      const { data, error } = await supabase
        .from('rock_checkins')
        .select('*')
        .eq('rock_id', rockId)
        .order('week_key', { ascending: false });
      if (error) throw error;
      return data || [];
    }

    const all = JSON.parse(localStorage.getItem('lep_checkins') || '[]');
    return all.filter(c => c.rock_id === rockId).sort((a, b) => b.week_key.localeCompare(a.week_key));
  },

  async getCurrentWeek(userId) {
    const weekKey = getWeekKey();

    if (hasSupabase && userId) {
      const { data, error } = await supabase
        .from('rock_checkins')
        .select('*')
        .eq('user_id', userId)
        .eq('week_key', weekKey);
      if (error) throw error;
      return data || [];
    }

    const all = JSON.parse(localStorage.getItem('lep_checkins') || '[]');
    return all.filter(c => c.user_id === userId && c.week_key === weekKey);
  },

  // Get check-in streak: how many consecutive weeks has this user checked in?
  async getStreak(userId) {
    const allRocks = await rocks.getCurrent(userId);
    if (allRocks.length === 0) return 0;

    const allCheckins = [];
    for (const rock of allRocks) {
      const rc = await this.getForRock(rock.id, userId);
      allCheckins.push(...rc);
    }

    const weekKeys = [...new Set(allCheckins.map(c => c.week_key))].sort().reverse();
    let streak = 0;
    const now = new Date();
    let checkWeek = new Date(now);
    checkWeek.setDate(checkWeek.getDate() - checkWeek.getDay() + 1);
    checkWeek.setHours(0, 0, 0, 0);

    for (let i = 0; i < 52; i++) {
      const key = checkWeek.toISOString().split('T')[0];
      if (weekKeys.includes(key)) {
        streak++;
        checkWeek.setDate(checkWeek.getDate() - 7);
      } else {
        break;
      }
    }

    return streak;
  },
};

// ═══════════════════════════════════════════════════════════════
// MILESTONES — Sub-steps within a rock
// ═══════════════════════════════════════════════════════════════

export const milestones = {
  async create(rockId, title, dueDate, userId) {
    const newMilestone = {
      id: milestoneId(),
      rock_id: rockId,
      user_id: userId,
      title,
      due_date: dueDate || null,
      completed: false,
      completed_at: null,
      created_at: new Date().toISOString(),
    };

    if (hasSupabase && userId) {
      const { data, error } = await supabase
        .from('rock_milestones')
        .insert(newMilestone)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const all = JSON.parse(localStorage.getItem('lep_milestones') || '[]');
    all.push(newMilestone);
    localStorage.setItem('lep_milestones', JSON.stringify(all));
    return newMilestone;
  },

  async getForRock(rockId) {
    if (hasSupabase) {
      const { data, error } = await supabase
        .from('rock_milestones')
        .select('*')
        .eq('rock_id', rockId)
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data || [];
    }

    const all = JSON.parse(localStorage.getItem('lep_milestones') || '[]');
    return all.filter(m => m.rock_id === rockId);
  },

  async toggle(milestoneId, userId) {
    if (hasSupabase && userId) {
      const { data: existing } = await supabase
        .from('rock_milestones')
        .select('completed')
        .eq('id', milestoneId)
        .single();

      const { data, error } = await supabase
        .from('rock_milestones')
        .update({
          completed: !existing.completed,
          completed_at: !existing.completed ? new Date().toISOString() : null,
        })
        .eq('id', milestoneId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const all = JSON.parse(localStorage.getItem('lep_milestones') || '[]');
    const idx = all.findIndex(m => m.id === milestoneId);
    if (idx === -1) throw new Error('Milestone not found');
    all[idx].completed = !all[idx].completed;
    all[idx].completed_at = all[idx].completed ? new Date().toISOString() : null;
    localStorage.setItem('lep_milestones', JSON.stringify(all));
    return all[idx];
  },

  async remove(milestoneId, userId) {
    if (hasSupabase && userId) {
      await supabase.from('rock_milestones').delete().eq('id', milestoneId);
      return;
    }

    const all = JSON.parse(localStorage.getItem('lep_milestones') || '[]');
    localStorage.setItem('lep_milestones', JSON.stringify(all.filter(m => m.id !== milestoneId)));
  },
};

// ═══════════════════════════════════════════════════════════════
// DASHBOARD INTEGRATION — Health scores for the main dashboard
// ═══════════════════════════════════════════════════════════════

export const rocksDashboard = {
  async getHealthScores(userId) {
    const { quarter, year } = getCurrentQuarter();
    const score = await rocks.scoreQuarter(userId, quarter, year);
    const streak = await checkins.getStreak(userId);
    const currentRocks = await rocks.getCurrent(userId);
    const weekCheckins = await checkins.getCurrentWeek(userId);

    const checkedInRocks = new Set(weekCheckins.map(c => c.rock_id));
    const activeRocks = currentRocks.filter(r => !['completed', 'dropped'].includes(r.status));
    const checkinRate = activeRocks.length > 0
      ? Math.round((checkedInRocks.size / activeRocks.length) * 100)
      : 0;

    return {
      overall: score.completionRate,
      business: score.byDomain.business?.rate || 0,
      family: score.byDomain.family?.rate || 0,
      ownership: score.byDomain.ownership?.rate || 0,
      streak,
      weeklyCheckinRate: checkinRate,
      totalActive: activeRocks.length,
      totalCompleted: score.completed,
      quarter: `Q${quarter} ${year}`,
    };
  },

  // For meeting agenda integration: rocks that need attention
  async getFlaggedRocks(userId) {
    const currentRocks = await rocks.getCurrent(userId);
    const flagged = [];

    for (const rock of currentRocks) {
      if (['completed', 'dropped'].includes(rock.status)) continue;
      const history = await checkins.getForRock(rock.id, userId);
      const lastCheckin = history[0];

      if (!lastCheckin) {
        flagged.push({ ...rock, flag: 'no_checkin', message: 'No check-ins yet' });
      } else if (lastCheckin.status === 'off_track') {
        flagged.push({ ...rock, flag: 'off_track', message: 'Off track — needs discussion' });
      } else if (lastCheckin.status === 'at_risk') {
        flagged.push({ ...rock, flag: 'at_risk', message: 'At risk — monitor closely' });
      }
    }

    return flagged;
  },
};

export { getCurrentQuarter, getWeekKey };
