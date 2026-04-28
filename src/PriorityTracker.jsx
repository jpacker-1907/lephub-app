// ═══════════════════════════════════════════════════════════════
// LEP HUB — Priority Tracker (Three-Circle Rocks)
// Drop-in React component for the LEP Hub app
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import {
  rocks,
  checkins,
  milestones,
  rocksDashboard,
  ROCK_DOMAINS,
  ROCK_STATUSES,
  getCurrentQuarter,
  getWeekKey,
} from './rocksBackend';

// ─── STYLES ───────────────────────────────────────────────────
// Inline styles following the existing App.jsx pattern
// Matches the LEP Hub design language: dark greens, warm tones, clean type

const STYLES = {
  container: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '32px 24px',
    fontFamily: "'Inter', -apple-system, sans-serif",
    color: '#1a1a1a',
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1a1a1a',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  headerSub: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 6,
  },
  // Tab navigation
  tabs: {
    display: 'flex',
    gap: 4,
    marginBottom: 28,
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: 0,
  },
  tab: (active) => ({
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: active ? 600 : 400,
    color: active ? '#2d5a3d' : '#64748b',
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid #2d5a3d' : '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.15s',
    marginBottom: -1,
  }),
  // Stats bar
  statsBar: {
    display: 'flex',
    gap: 16,
    marginBottom: 28,
    flexWrap: 'wrap',
  },
  statCard: (color) => ({
    flex: '1 1 140px',
    padding: '16px 20px',
    borderRadius: 12,
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderLeft: `4px solid ${color}`,
  }),
  statValue: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1a1a1a',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  // Domain columns
  domainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: 20,
    marginBottom: 32,
  },
  domainColumn: (color) => ({
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
  }),
  domainHeader: (color) => ({
    padding: '14px 20px',
    background: color + '0d', // 5% opacity
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  domainTitle: (color) => ({
    fontSize: 15,
    fontWeight: 600,
    color: color,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  }),
  domainCount: {
    fontSize: 12,
    color: '#94a3b8',
    background: '#f1f5f9',
    padding: '2px 8px',
    borderRadius: 10,
  },
  // Rock cards
  rockCard: (isExpanded) => ({
    padding: '14px 20px',
    borderBottom: '1px solid #f1f5f9',
    cursor: 'pointer',
    transition: 'background 0.1s',
    background: isExpanded ? '#fafbfc' : '#fff',
  }),
  rockTitle: {
    fontSize: 14,
    fontWeight: 500,
    color: '#1a1a1a',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  rockMeta: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  },
  statusDot: (color) => ({
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: color,
    marginRight: 4,
  }),
  // Expanded rock detail
  rockDetail: {
    padding: '12px 20px 16px',
    background: '#fafbfc',
    borderBottom: '1px solid #f1f5f9',
  },
  rockDescription: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 1.5,
    marginBottom: 12,
  },
  // Milestones
  milestoneRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '4px 0',
    fontSize: 13,
  },
  milestoneCheckbox: (checked) => ({
    width: 16,
    height: 16,
    borderRadius: 4,
    border: checked ? 'none' : '1.5px solid #cbd5e1',
    background: checked ? '#2d5a3d' : '#fff',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: 10,
    flexShrink: 0,
  }),
  milestoneText: (checked) => ({
    color: checked ? '#94a3b8' : '#334155',
    textDecoration: checked ? 'line-through' : 'none',
  }),
  // Check-in controls
  checkinBar: {
    display: 'flex',
    gap: 6,
    marginTop: 12,
  },
  checkinBtn: (active, color) => ({
    padding: '5px 12px',
    fontSize: 12,
    fontWeight: active ? 600 : 400,
    borderRadius: 6,
    border: active ? `1.5px solid ${color}` : '1px solid #e2e8f0',
    background: active ? color + '15' : '#fff',
    color: active ? color : '#64748b',
    cursor: 'pointer',
    transition: 'all 0.15s',
  }),
  // Add rock form
  addBtn: {
    width: '100%',
    padding: '10px',
    border: '1px dashed #cbd5e1',
    borderRadius: 8,
    background: 'none',
    color: '#94a3b8',
    fontSize: 13,
    cursor: 'pointer',
    marginTop: 4,
    transition: 'all 0.15s',
  },
  formOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  formCard: {
    background: '#fff',
    borderRadius: 16,
    padding: '28px 32px',
    width: '100%',
    maxWidth: 480,
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1a1a1a',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 500,
    color: '#64748b',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    fontSize: 14,
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  textarea: {
    width: '100%',
    padding: '10px 14px',
    fontSize: 14,
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    outline: 'none',
    minHeight: 80,
    resize: 'vertical',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    fontSize: 14,
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    outline: 'none',
    background: '#fff',
    boxSizing: 'border-box',
  },
  btnRow: {
    display: 'flex',
    gap: 10,
    marginTop: 20,
    justifyContent: 'flex-end',
  },
  btnPrimary: {
    padding: '10px 24px',
    fontSize: 14,
    fontWeight: 600,
    background: '#2d5a3d',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
  btnSecondary: {
    padding: '10px 24px',
    fontSize: 14,
    fontWeight: 500,
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
  // Weekly check-in view
  weeklyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  streakBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    background: '#2d5a3d0d',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 500,
    color: '#2d5a3d',
  },
  weeklyCard: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    marginBottom: 12,
    overflow: 'hidden',
  },
  weeklyCardHeader: (color) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    borderLeft: `4px solid ${color}`,
  }),
  weeklyCardBody: {
    padding: '0 20px 16px',
  },
  noteInput: {
    width: '100%',
    padding: '8px 12px',
    fontSize: 13,
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    outline: 'none',
    marginTop: 8,
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  // Quarter score view
  scoreGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 20,
  },
  scoreCard: (color) => ({
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    padding: 24,
    borderTop: `4px solid ${color}`,
    textAlign: 'center',
  }),
  scoreNumber: (color) => ({
    fontSize: 48,
    fontWeight: 700,
    color: color,
    lineHeight: 1,
    marginBottom: 4,
  }),
  scoreLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  rockListScored: {
    marginTop: 16,
    textAlign: 'left',
  },
  scoredRock: (done) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 0',
    fontSize: 13,
    color: done ? '#2d5a3d' : '#ef4444',
  }),
  // Empty state
  emptyState: {
    textAlign: 'center',
    padding: '48px 24px',
    color: '#94a3b8',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#475569',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    maxWidth: 360,
    margin: '0 auto',
    lineHeight: 1.5,
  },
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function PriorityTracker({ user }) {
  const [activeTab, setActiveTab] = useState('plan'); // 'plan' | 'checkin' | 'score'
  const [currentRocks, setCurrentRocks] = useState([]);
  const [weekCheckins, setWeekCheckins] = useState({});
  const [healthScores, setHealthScores] = useState(null);
  const [quarterScore, setQuarterScore] = useState(null);
  const [expandedRock, setExpandedRock] = useState(null);
  const [rockMilestones, setRockMilestones] = useState({});
  const [showForm, setShowForm] = useState(null); // null or domain string
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [checkinNotes, setCheckinNotes] = useState({});

  const userId = user?.id;
  const { quarter, year } = getCurrentQuarter();

  // ─── DATA LOADING ─────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [rocksList, weekData, health, score, streakVal] = await Promise.all([
        rocks.getCurrent(userId),
        checkins.getCurrentWeek(userId),
        rocksDashboard.getHealthScores(userId),
        rocks.scoreQuarter(userId, quarter, year),
        checkins.getStreak(userId),
      ]);

      setCurrentRocks(rocksList);
      setHealthScores(health);
      setQuarterScore(score);
      setStreak(streakVal);

      // Map week check-ins by rock_id
      const weekMap = {};
      weekData.forEach(c => { weekMap[c.rock_id] = c; });
      setWeekCheckins(weekMap);

      // Load milestones for each rock
      const msMap = {};
      for (const rock of rocksList) {
        msMap[rock.id] = await milestones.getForRock(rock.id);
      }
      setRockMilestones(msMap);
    } catch (err) {
      console.error('PriorityTracker load error:', err);
    }
    setLoading(false);
  }, [userId, quarter, year]);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── ACTIONS ──────────────────────────────────────────────
  const handleCreateRock = async (formData) => {
    await rocks.create(formData, userId);
    setShowForm(null);
    loadData();
  };

  const handleDeleteRock = async (rockId) => {
    await rocks.remove(rockId, userId);
    setExpandedRock(null);
    loadData();
  };

  const handleMarkComplete = async (rockId) => {
    await rocks.update(rockId, { status: 'completed' }, userId);
    loadData();
  };

  const handleDropRock = async (rockId) => {
    await rocks.update(rockId, { status: 'dropped' }, userId);
    loadData();
  };

  const handleCheckin = async (rockId, status) => {
    const note = checkinNotes[rockId] || '';
    await checkins.create(rockId, status, note, userId);
    // Also update the rock's overall status
    await rocks.update(rockId, { status }, userId);
    loadData();
  };

  const handleToggleMilestone = async (msId) => {
    await milestones.toggle(msId, userId);
    loadData();
  };

  const handleAddMilestone = async (rockId, title) => {
    await milestones.create(rockId, title, null, userId);
    loadData();
  };

  // ─── GROUP ROCKS BY DOMAIN ────────────────────────────────
  const rocksByDomain = {
    business: currentRocks.filter(r => r.domain === 'business'),
    family: currentRocks.filter(r => r.domain === 'family'),
    ownership: currentRocks.filter(r => r.domain === 'ownership'),
  };

  const activeRocks = currentRocks.filter(r => !['completed', 'dropped'].includes(r.status));

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div style={STYLES.container}>
        <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
          Loading priorities...
        </div>
      </div>
    );
  }

  return (
    <div style={STYLES.container}>
      {/* ─── HEADER ─────────────────────────────────── */}
      <div style={STYLES.header}>
        <h1 style={STYLES.headerTitle}>Priority Tracker</h1>
        <p style={STYLES.headerSub}>Q{quarter} {year} — 90-Day Priorities Across Your Enterprise</p>
      </div>

      {/* ─── STATS BAR ──────────────────────────────── */}
      {healthScores && (
        <div style={STYLES.statsBar}>
          <div style={STYLES.statCard('#2d5a3d')}>
            <div style={STYLES.statValue}>{healthScores.totalActive}</div>
            <div style={STYLES.statLabel}>Active Rocks</div>
          </div>
          <div style={STYLES.statCard(ROCK_DOMAINS.business.color)}>
            <div style={STYLES.statValue}>{healthScores.business}%</div>
            <div style={STYLES.statLabel}>Business</div>
          </div>
          <div style={STYLES.statCard(ROCK_DOMAINS.family.color)}>
            <div style={STYLES.statValue}>{healthScores.family}%</div>
            <div style={STYLES.statLabel}>Family</div>
          </div>
          <div style={STYLES.statCard(ROCK_DOMAINS.ownership.color)}>
            <div style={STYLES.statValue}>{healthScores.ownership}%</div>
            <div style={STYLES.statLabel}>Ownership</div>
          </div>
          <div style={STYLES.statCard('#8b5e3c')}>
            <div style={STYLES.statValue}>{streak}w</div>
            <div style={STYLES.statLabel}>Check-in Streak</div>
          </div>
        </div>
      )}

      {/* ─── TABS ───────────────────────────────────── */}
      <div style={STYLES.tabs}>
        <button style={STYLES.tab(activeTab === 'plan')} onClick={() => setActiveTab('plan')}>
          Quarterly Plan
        </button>
        <button style={STYLES.tab(activeTab === 'checkin')} onClick={() => setActiveTab('checkin')}>
          Weekly Check-in
        </button>
        <button style={STYLES.tab(activeTab === 'score')} onClick={() => setActiveTab('score')}>
          Quarter Score
        </button>
      </div>

      {/* ─── TAB CONTENT ────────────────────────────── */}
      {activeTab === 'plan' && (
        <QuarterlyPlanView
          rocksByDomain={rocksByDomain}
          weekCheckins={weekCheckins}
          rockMilestones={rockMilestones}
          expandedRock={expandedRock}
          setExpandedRock={setExpandedRock}
          onAddRock={(domain) => setShowForm(domain)}
          onDeleteRock={handleDeleteRock}
          onMarkComplete={handleMarkComplete}
          onDropRock={handleDropRock}
          onToggleMilestone={handleToggleMilestone}
          onAddMilestone={handleAddMilestone}
        />
      )}

      {activeTab === 'checkin' && (
        <WeeklyCheckinView
          activeRocks={activeRocks}
          weekCheckins={weekCheckins}
          streak={streak}
          checkinNotes={checkinNotes}
          setCheckinNotes={setCheckinNotes}
          onCheckin={handleCheckin}
        />
      )}

      {activeTab === 'score' && (
        <QuarterScoreView
          quarterScore={quarterScore}
          rocksByDomain={rocksByDomain}
        />
      )}

      {/* ─── ADD ROCK MODAL ─────────────────────────── */}
      {showForm && (
        <AddRockForm
          domain={showForm}
          onSubmit={handleCreateRock}
          onClose={() => setShowForm(null)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// QUARTERLY PLAN VIEW — Three columns, one per domain
// ═══════════════════════════════════════════════════════════════

function QuarterlyPlanView({
  rocksByDomain, weekCheckins, rockMilestones, expandedRock,
  setExpandedRock, onAddRock, onDeleteRock, onMarkComplete,
  onDropRock, onToggleMilestone, onAddMilestone,
}) {
  return (
    <div style={STYLES.domainGrid}>
      {Object.entries(ROCK_DOMAINS).map(([key, domain]) => (
        <div key={key} style={STYLES.domainColumn(domain.color)}>
          <div style={STYLES.domainHeader(domain.color)}>
            <span style={STYLES.domainTitle(domain.color)}>
              {domain.icon} {domain.label}
            </span>
            <span style={STYLES.domainCount}>
              {rocksByDomain[key]?.length || 0}
            </span>
          </div>

          {rocksByDomain[key]?.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#cbd5e1', fontSize: 13 }}>
              No {domain.label.toLowerCase()} priorities yet
            </div>
          ) : (
            rocksByDomain[key].map(rock => (
              <RockCard
                key={rock.id}
                rock={rock}
                domain={domain}
                checkin={weekCheckins[rock.id]}
                milestones={rockMilestones[rock.id] || []}
                isExpanded={expandedRock === rock.id}
                onToggleExpand={() => setExpandedRock(expandedRock === rock.id ? null : rock.id)}
                onDelete={() => onDeleteRock(rock.id)}
                onComplete={() => onMarkComplete(rock.id)}
                onDrop={() => onDropRock(rock.id)}
                onToggleMilestone={onToggleMilestone}
                onAddMilestone={(title) => onAddMilestone(rock.id, title)}
              />
            ))
          )}

          <div style={{ padding: '8px 12px' }}>
            <button style={STYLES.addBtn} onClick={() => onAddRock(key)}>
              + Add {domain.label} Priority
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ROCK CARD — Individual priority with expand/collapse
// ═══════════════════════════════════════════════════════════════

function RockCard({
  rock, domain, checkin, milestones: ms, isExpanded,
  onToggleExpand, onDelete, onComplete, onDrop,
  onToggleMilestone, onAddMilestone,
}) {
  const [newMilestone, setNewMilestone] = useState('');
  const status = ROCK_STATUSES[rock.status] || ROCK_STATUSES.not_started;
  const completedMs = ms.filter(m => m.completed).length;
  const isDone = rock.status === 'completed';
  const isDropped = rock.status === 'dropped';

  return (
    <>
      <div
        style={{
          ...STYLES.rockCard(isExpanded),
          opacity: isDropped ? 0.5 : 1,
        }}
        onClick={onToggleExpand}
      >
        <div style={STYLES.rockTitle}>
          <span style={STYLES.statusDot(status.color)} />
          <span style={{ textDecoration: isDone ? 'line-through' : isDropped ? 'line-through' : 'none' }}>
            {rock.title}
          </span>
        </div>
        <div style={STYLES.rockMeta}>
          <span>{status.label}</span>
          {rock.owner_name && <span>· {rock.owner_name}</span>}
          {rock.is_family_rock && <span style={{ color: domain.color }}>· Family Rock</span>}
          {ms.length > 0 && <span>· {completedMs}/{ms.length} milestones</span>}
        </div>
      </div>

      {isExpanded && (
        <div style={STYLES.rockDetail}>
          {rock.description && (
            <div style={STYLES.rockDescription}>{rock.description}</div>
          )}

          {/* Milestones */}
          {ms.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Milestones
              </div>
              {ms.map(m => (
                <div key={m.id} style={STYLES.milestoneRow}>
                  <div
                    style={STYLES.milestoneCheckbox(m.completed)}
                    onClick={(e) => { e.stopPropagation(); onToggleMilestone(m.id); }}
                  >
                    {m.completed && '✓'}
                  </div>
                  <span style={STYLES.milestoneText(m.completed)}>{m.title}</span>
                </div>
              ))}
            </div>
          )}

          {/* Add milestone */}
          {!isDone && !isDropped && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newMilestone.trim()) {
                  onAddMilestone(newMilestone.trim());
                  setNewMilestone('');
                }
              }}
              style={{ display: 'flex', gap: 8, marginBottom: 12 }}
            >
              <input
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                placeholder="Add a milestone..."
                style={{ ...STYLES.input, flex: 1, padding: '6px 10px', fontSize: 13 }}
                onClick={(e) => e.stopPropagation()}
              />
              <button type="submit" style={{ ...STYLES.btnPrimary, padding: '6px 12px', fontSize: 12 }}>
                Add
              </button>
            </form>
          )}

          {/* Action buttons */}
          {!isDone && !isDropped && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={(e) => { e.stopPropagation(); onComplete(); }}
                style={{ ...STYLES.btnPrimary, padding: '6px 14px', fontSize: 12 }}
              >
                ✓ Mark Complete
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDrop(); }}
                style={{ ...STYLES.btnSecondary, padding: '6px 14px', fontSize: 12, color: '#94a3b8' }}
              >
                Drop Rock
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                style={{ ...STYLES.btnSecondary, padding: '6px 14px', fontSize: 12, color: '#ef4444' }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// WEEKLY CHECK-IN VIEW — Monday morning pulse
// ═══════════════════════════════════════════════════════════════

function WeeklyCheckinView({ activeRocks, weekCheckins, streak, checkinNotes, setCheckinNotes, onCheckin }) {
  const weekKey = getWeekKey();
  const totalRocks = activeRocks.length;
  const checkedIn = Object.keys(weekCheckins).length;

  if (activeRocks.length === 0) {
    return (
      <div style={STYLES.emptyState}>
        <div style={STYLES.emptyIcon}>📋</div>
        <div style={STYLES.emptyTitle}>No active priorities</div>
        <div style={STYLES.emptyText}>
          Set your quarterly priorities in the "Quarterly Plan" tab first, then come back here each week to check in.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={STYLES.weeklyHeader}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>
            Week of {new Date(weekKey + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>
            {checkedIn} of {totalRocks} priorities checked in
          </div>
        </div>
        {streak > 0 && (
          <div style={STYLES.streakBadge}>
            🔥 {streak} week streak
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2, marginBottom: 20 }}>
        <div style={{
          height: '100%',
          width: `${totalRocks > 0 ? (checkedIn / totalRocks) * 100 : 0}%`,
          background: '#2d5a3d',
          borderRadius: 2,
          transition: 'width 0.3s',
        }} />
      </div>

      {Object.entries(ROCK_DOMAINS).map(([domainKey, domain]) => {
        const domainRocks = activeRocks.filter(r => r.domain === domainKey);
        if (domainRocks.length === 0) return null;

        return (
          <div key={domainKey} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: domain.color, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              {domain.icon} {domain.label}
            </div>
            {domainRocks.map(rock => {
              const currentCheckin = weekCheckins[rock.id];
              const currentStatus = currentCheckin?.status || null;

              return (
                <div key={rock.id} style={STYLES.weeklyCard}>
                  <div style={STYLES.weeklyCardHeader(domain.color)}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a' }}>{rock.title}</div>
                      {rock.owner_name && (
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{rock.owner_name}</div>
                      )}
                    </div>
                    {currentStatus && (
                      <span style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: ROCK_STATUSES[currentStatus]?.color || '#94a3b8',
                      }}>
                        {ROCK_STATUSES[currentStatus]?.label || ''}
                      </span>
                    )}
                  </div>
                  <div style={STYLES.weeklyCardBody}>
                    <div style={STYLES.checkinBar}>
                      {['on_track', 'at_risk', 'off_track'].map(s => (
                        <button
                          key={s}
                          style={STYLES.checkinBtn(currentStatus === s, ROCK_STATUSES[s].color)}
                          onClick={() => onCheckin(rock.id, s)}
                        >
                          {ROCK_STATUSES[s].icon} {ROCK_STATUSES[s].label}
                        </button>
                      ))}
                    </div>
                    <input
                      style={STYLES.noteInput}
                      placeholder="Quick note — what happened this week?"
                      value={checkinNotes[rock.id] || currentCheckin?.note || ''}
                      onChange={(e) => setCheckinNotes(prev => ({ ...prev, [rock.id]: e.target.value }))}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// QUARTER SCORE VIEW — End-of-quarter binary scoring
// ═══════════════════════════════════════════════════════════════

function QuarterScoreView({ quarterScore, rocksByDomain }) {
  if (!quarterScore || quarterScore.total === 0) {
    return (
      <div style={STYLES.emptyState}>
        <div style={STYLES.emptyIcon}>📊</div>
        <div style={STYLES.emptyTitle}>No data yet</div>
        <div style={STYLES.emptyText}>
          Quarterly scores will appear here once you have priorities set and marked as complete or not.
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Overall score */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 64, fontWeight: 700, color: '#2d5a3d', lineHeight: 1 }}>
          {quarterScore.completionRate}%
        </div>
        <div style={{ fontSize: 15, color: '#64748b', marginTop: 4 }}>
          Overall Completion — {quarterScore.completed} of {quarterScore.active} priorities done
        </div>
      </div>

      {/* Domain breakdown */}
      <div style={STYLES.scoreGrid}>
        {Object.entries(ROCK_DOMAINS).map(([key, domain]) => {
          const domainScore = quarterScore.byDomain[key];
          const domainRocks = rocksByDomain[key] || [];

          return (
            <div key={key} style={STYLES.scoreCard(domain.color)}>
              <div style={{ fontSize: 13, fontWeight: 600, color: domain.color, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {domain.icon} {domain.label}
              </div>
              <div style={STYLES.scoreNumber(domain.color)}>
                {domainScore?.rate || 0}%
              </div>
              <div style={STYLES.scoreLabel}>
                {domainScore?.completed || 0} of {domainScore?.active || 0} done
              </div>

              <div style={STYLES.rockListScored}>
                {domainRocks.filter(r => r.status !== 'dropped').map(rock => (
                  <div key={rock.id} style={STYLES.scoredRock(rock.status === 'completed')}>
                    <span>{rock.status === 'completed' ? '✓' : '✕'}</span>
                    <span>{rock.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ADD ROCK FORM — Modal for creating new priorities
// ═══════════════════════════════════════════════════════════════

function AddRockForm({ domain, onSubmit, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [isFamilyRock, setIsFamilyRock] = useState(false);

  const domainInfo = ROCK_DOMAINS[domain];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      domain,
      ownerName: ownerName.trim(),
      isFamilyRock,
    });
  };

  return (
    <div style={STYLES.formOverlay} onClick={onClose}>
      <div style={STYLES.formCard} onClick={(e) => e.stopPropagation()}>
        <div style={STYLES.formTitle}>
          {domainInfo.icon} New {domainInfo.label} Priority
        </div>

        <form onSubmit={handleSubmit}>
          <div style={STYLES.inputGroup}>
            <label style={STYLES.label}>Priority Title *</label>
            <input
              style={STYLES.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                domain === 'business' ? 'e.g., Launch new product line by end of quarter' :
                domain === 'family' ? 'e.g., Complete family charter first draft' :
                'e.g., Review and update buy-sell agreement'
              }
              autoFocus
            />
          </div>

          <div style={STYLES.inputGroup}>
            <label style={STYLES.label}>Description</label>
            <textarea
              style={STYLES.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does 'done' look like? How will you know this is complete?"
            />
          </div>

          <div style={STYLES.inputGroup}>
            <label style={STYLES.label}>Owner</label>
            <input
              style={STYLES.input}
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Who's accountable for this priority?"
            />
          </div>

          {(domain === 'family' || domain === 'ownership') && (
            <div style={{ ...STYLES.inputGroup, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={isFamilyRock}
                onChange={(e) => setIsFamilyRock(e.target.checked)}
                id="familyRock"
              />
              <label htmlFor="familyRock" style={{ fontSize: 13, color: '#475569', cursor: 'pointer' }}>
                This is a shared family/ownership priority (not owned by one person)
              </label>
            </div>
          )}

          <div style={STYLES.btnRow}>
            <button type="button" style={STYLES.btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" style={STYLES.btnPrimary}>
              Add Priority
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
