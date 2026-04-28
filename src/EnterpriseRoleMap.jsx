// ═══════════════════════════════════════════════════════════════
// LEP HUB — Enterprise Role Map
// Three-Circle Venn: Business · Family · Ownership
// Interactive visualization of who sits where in the family enterprise
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo } from 'react';

// ─── CIRCLE DEFINITIONS ──────────────────────────────────────
const CIRCLES = {
  business: { id: 'business', label: 'Business', color: '#2d5a3d', icon: '📊', description: 'Operating roles — who runs the business day-to-day' },
  family: { id: 'family', label: 'Family', color: '#E05B6F', icon: '🌳', description: 'Family members — blood, marriage, and chosen family' },
  ownership: { id: 'ownership', label: 'Ownership', color: '#1a3a5c', icon: '🏛️', description: 'Ownership stakes — who holds equity, voting rights, or governance seats' },
};

const BUSINESS_ROLES = [
  'CEO / President', 'COO', 'CFO', 'VP Operations', 'VP Sales', 'VP Marketing',
  'Director', 'Manager', 'Employee', 'Advisor', 'Consultant', 'Board Member',
  'Board Chair', 'Independent Director', 'Other',
];

const FAMILY_ROLES = [
  'Founder / Patriarch', 'Founder / Matriarch', 'Spouse', 'Son', 'Daughter',
  'Son-in-law', 'Daughter-in-law', 'Grandchild', 'Sibling', 'Uncle / Aunt',
  'Cousin', 'Family Council Chair', 'Family Council Member', 'Next-Gen Leader', 'Other',
];

const OWNERSHIP_ROLES = [
  'Majority Owner', 'Minority Owner', 'Equal Partner', 'Trust Beneficiary',
  'Trustee', 'Board Member', 'Board Chair', 'Advisory Board', 'Silent Partner',
  'Future Heir', 'Other',
];

// ─── THREE-CIRCLE GEOMETRY ───────────────────────────────────
// Positions for the Venn diagram regions
const VENN = {
  width: 700,
  height: 500,
  // Circle centers (overlapping Venn)
  circles: {
    business: { cx: 280, cy: 190, r: 155 },
    family: { cx: 420, cy: 190, r: 155 },
    ownership: { cx: 350, cy: 330, r: 155 },
  },
  // Node placement zones for each region
  zones: {
    'business-only': { x: 200, y: 130, label: 'Business Only' },
    'family-only': { x: 500, y: 130, label: 'Family Only' },
    'ownership-only': { x: 350, y: 420, label: 'Ownership Only' },
    'business-family': { x: 350, y: 120, label: 'Business + Family' },
    'business-ownership': { x: 250, y: 310, label: 'Business + Ownership' },
    'family-ownership': { x: 450, y: 310, label: 'Family + Ownership' },
    'all-three': { x: 350, y: 240, label: 'All Three Circles' },
  },
};

// Determine which zone a member belongs to
function getZone(circles) {
  const b = circles.includes('business');
  const f = circles.includes('family');
  const o = circles.includes('ownership');
  if (b && f && o) return 'all-three';
  if (b && f) return 'business-family';
  if (b && o) return 'business-ownership';
  if (f && o) return 'family-ownership';
  if (b) return 'business-only';
  if (f) return 'family-only';
  if (o) return 'ownership-only';
  return null;
}

// Spread nodes within a zone so they don't overlap
function spreadNodes(nodes, centerX, centerY) {
  const count = nodes.length;
  if (count === 0) return [];
  if (count === 1) return [{ ...nodes[0], nx: centerX, ny: centerY }];

  const radius = Math.min(22 + count * 6, 60);
  return nodes.map((node, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    return {
      ...node,
      nx: centerX + radius * Math.cos(angle),
      ny: centerY + radius * Math.sin(angle),
    };
  });
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function EnterpriseRoleMap({ familyProfile, setFamilyProfile }) {
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'roles' | 'manage'
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(null); // member id
  const [hoveredZone, setHoveredZone] = useState(null);

  const members = familyProfile?.members || [];

  // ─── ROLE DATA (stored in localStorage alongside familyProfile) ───
  const [roleAssignments, setRoleAssignments] = useState(() => {
    try {
      const saved = localStorage.getItem('lep_role_assignments');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('lep_role_assignments', JSON.stringify(roleAssignments));
  }, [roleAssignments]);

  // Get a member's circles and roles
  const getMemberCircles = (memberId) => {
    const assignment = roleAssignments[memberId] || {};
    const circles = [];
    if (assignment.businessRole) circles.push('business');
    // All family profile members are in the family circle by default
    circles.push('family');
    if (assignment.ownershipRole || (members.find(m => m.id === memberId)?.ownershipPct > 0)) circles.push('ownership');
    return [...new Set(circles)];
  };

  const getMemberName = (m) => `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'Unnamed';
  const getInitials = (m) => {
    const f = (m.firstName || '')[0] || '';
    const l = (m.lastName || '')[0] || '';
    return (f + l).toUpperCase() || '?';
  };

  // ─── COMPUTE NODE POSITIONS ─────────────────────────────────
  const mappedMembers = useMemo(() => {
    const byZone = {};
    members.forEach(m => {
      const circles = getMemberCircles(m.id);
      if (circles.length === 0) return;
      const zone = getZone(circles);
      if (!zone) return;
      if (!byZone[zone]) byZone[zone] = [];
      byZone[zone].push({ ...m, circles, zone });
    });

    const positioned = [];
    Object.entries(byZone).forEach(([zone, nodes]) => {
      const zoneConfig = VENN.zones[zone];
      if (!zoneConfig) return;
      positioned.push(...spreadNodes(nodes, zoneConfig.x, zoneConfig.y));
    });
    return positioned;
  }, [members, roleAssignments]);

  // ─── ROLE ASSIGNMENT ────────────────────────────────────────
  const updateRole = (memberId, field, value) => {
    setRoleAssignments(prev => ({
      ...prev,
      [memberId]: { ...(prev[memberId] || {}), [field]: value },
    }));
  };

  // ─── STATS ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    let bCount = 0, fCount = 0, oCount = 0, allThree = 0, noRole = 0;
    members.forEach(m => {
      const c = getMemberCircles(m.id);
      if (c.includes('business')) bCount++;
      if (c.includes('family')) fCount++;
      if (c.includes('ownership')) oCount++;
      if (c.length === 3) allThree++;
      if (c.length <= 1 && !roleAssignments[m.id]?.businessRole && !roleAssignments[m.id]?.ownershipRole) noRole++;
    });
    return { business: bCount, family: fCount, ownership: oCount, allThree, noRole, total: members.length };
  }, [members, roleAssignments]);

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#2B4C6F', marginBottom: 6 }}>Enterprise Role Map</h1>
        <p style={{ fontSize: '0.9rem', color: '#7A8BA0' }}>
          The three-circle model — who sits where across Business, Family, and Ownership.
        </p>
      </header>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Members', value: stats.total, color: '#7A8BA0' },
          { label: 'In Business', value: stats.business, color: CIRCLES.business.color },
          { label: 'In Family', value: stats.family, color: CIRCLES.family.color },
          { label: 'In Ownership', value: stats.ownership, color: CIRCLES.ownership.color },
          { label: 'All 3 Circles', value: stats.allThree, color: '#E05B6F' },
        ].map(s => (
          <div key={s.label} style={{ flex: '1 1 100px', background: 'white', borderRadius: 10, padding: '14px 18px', border: '1px solid #DDE3EB', borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.72rem', color: '#7A8BA0', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '2px solid #DDE3EB' }}>
        {[
          { id: 'map', label: 'Visual Map' },
          { id: 'roles', label: 'Role Directory' },
          { id: 'manage', label: 'Assign Roles' },
        ].map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSelectedMember(null); }}
            style={{
              padding: '10px 20px', border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600,
              background: 'none', color: activeTab === tab.id ? '#2B4C6F' : '#7A8BA0',
              borderBottom: activeTab === tab.id ? '2px solid #2B4C6F' : '2px solid transparent',
              marginBottom: -2, transition: 'all 0.15s',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── VISUAL MAP TAB ─── */}
      {activeTab === 'map' && (
        <div>
          {members.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7A8BA0' }}>
              <p style={{ fontSize: '2rem', marginBottom: 12 }}>👥</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>No family members yet</p>
              <p style={{ fontSize: '0.88rem' }}>Add members in "My Family" first, then come here to map their roles across the three circles.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {/* SVG Venn Diagram */}
              <div style={{ flex: '1 1 700px', background: 'white', borderRadius: 12, border: '1px solid #DDE3EB', overflow: 'hidden' }}>
                <svg viewBox={`0 0 ${VENN.width} ${VENN.height}`} style={{ width: '100%', height: 'auto' }}>
                  {/* Circle fills */}
                  <defs>
                    <clipPath id="clip-business"><circle cx={VENN.circles.business.cx} cy={VENN.circles.business.cy} r={VENN.circles.business.r} /></clipPath>
                    <clipPath id="clip-family"><circle cx={VENN.circles.family.cx} cy={VENN.circles.family.cy} r={VENN.circles.family.r} /></clipPath>
                    <clipPath id="clip-ownership"><circle cx={VENN.circles.ownership.cx} cy={VENN.circles.ownership.cy} r={VENN.circles.ownership.r} /></clipPath>
                  </defs>

                  {/* Circle backgrounds */}
                  <circle cx={VENN.circles.business.cx} cy={VENN.circles.business.cy} r={VENN.circles.business.r}
                    fill={CIRCLES.business.color} fillOpacity={0.08} stroke={CIRCLES.business.color} strokeWidth={2} strokeOpacity={0.4} />
                  <circle cx={VENN.circles.family.cx} cy={VENN.circles.family.cy} r={VENN.circles.family.r}
                    fill={CIRCLES.family.color} fillOpacity={0.08} stroke={CIRCLES.family.color} strokeWidth={2} strokeOpacity={0.4} />
                  <circle cx={VENN.circles.ownership.cx} cy={VENN.circles.ownership.cy} r={VENN.circles.ownership.r}
                    fill={CIRCLES.ownership.color} fillOpacity={0.08} stroke={CIRCLES.ownership.color} strokeWidth={2} strokeOpacity={0.4} />

                  {/* Circle labels */}
                  <text x={175} y={55} textAnchor="middle" fontSize={14} fontWeight={700} fill={CIRCLES.business.color} fontFamily="Inter, sans-serif">
                    {CIRCLES.business.icon} BUSINESS
                  </text>
                  <text x={525} y={55} textAnchor="middle" fontSize={14} fontWeight={700} fill={CIRCLES.family.color} fontFamily="Inter, sans-serif">
                    {CIRCLES.family.icon} FAMILY
                  </text>
                  <text x={350} y={490} textAnchor="middle" fontSize={14} fontWeight={700} fill={CIRCLES.ownership.color} fontFamily="Inter, sans-serif">
                    {CIRCLES.ownership.icon} OWNERSHIP
                  </text>

                  {/* Member nodes */}
                  {mappedMembers.map(m => {
                    const isSelected = selectedMember === m.id;
                    const zoneColor = m.circles.length === 3 ? '#E05B6F' :
                      m.circles.length === 2 ? '#34597A' :
                      CIRCLES[m.circles[0]]?.color || '#7A8BA0';
                    return (
                      <g key={m.id} onClick={() => setSelectedMember(isSelected ? null : m.id)} style={{ cursor: 'pointer' }}>
                        {/* Node circle */}
                        <circle cx={m.nx} cy={m.ny} r={isSelected ? 20 : 16}
                          fill={isSelected ? zoneColor : 'white'}
                          stroke={zoneColor} strokeWidth={isSelected ? 3 : 2}
                          style={{ transition: 'all 0.2s' }}
                        />
                        {/* Initials */}
                        <text x={m.nx} y={m.ny + 1} textAnchor="middle" dominantBaseline="middle"
                          fontSize={isSelected ? 10 : 9} fontWeight={700}
                          fill={isSelected ? 'white' : zoneColor}
                          fontFamily="Inter, sans-serif"
                          style={{ pointerEvents: 'none' }}>
                          {getInitials(m)}
                        </text>
                        {/* Name label (on hover/select) */}
                        {isSelected && (
                          <text x={m.nx} y={m.ny + 30} textAnchor="middle"
                            fontSize={10} fontWeight={600} fill="#34597A"
                            fontFamily="Inter, sans-serif"
                            style={{ pointerEvents: 'none' }}>
                            {getMemberName(m)}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Selected member detail panel */}
              {selectedMember && (() => {
                const m = members.find(mem => mem.id === selectedMember);
                if (!m) return null;
                const assignment = roleAssignments[m.id] || {};
                const circles = getMemberCircles(m.id);
                return (
                  <div style={{ flex: '0 0 280px', background: 'white', borderRadius: 12, border: '1px solid #DDE3EB', padding: 20 }}>
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#2B4C6F', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, margin: '0 auto 10px' }}>
                        {getInitials(m)}
                      </div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#2B4C6F', marginBottom: 4 }}>{getMemberName(m)}</h3>
                      <p style={{ fontSize: '0.82rem', color: '#7A8BA0' }}>Generation {m.generation}</p>
                    </div>

                    {/* Circle badges */}
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                      {circles.map(c => (
                        <span key={c} style={{ fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: CIRCLES[c].color + '15', color: CIRCLES[c].color }}>
                          {CIRCLES[c].icon} {CIRCLES[c].label}
                        </span>
                      ))}
                    </div>

                    {/* Roles */}
                    <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                      {assignment.businessRole && (
                        <div style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                          <span style={{ color: '#7A8BA0', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Business Role</span>
                          <div style={{ fontWeight: 600, marginTop: 2 }}>{assignment.businessRole}</div>
                          {assignment.businessTitle && <div style={{ color: '#7A8BA0', fontSize: '0.78rem' }}>{assignment.businessTitle}</div>}
                        </div>
                      )}
                      <div style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ color: '#7A8BA0', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Family Role</span>
                        <div style={{ fontWeight: 600, marginTop: 2 }}>{assignment.familyRole || m.role || 'Family Member'}</div>
                      </div>
                      {(assignment.ownershipRole || m.ownershipPct > 0) && (
                        <div style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                          <span style={{ color: '#7A8BA0', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ownership</span>
                          <div style={{ fontWeight: 600, marginTop: 2 }}>{assignment.ownershipRole || 'Owner'}</div>
                          {m.ownershipPct > 0 && <div style={{ color: '#7A8BA0', fontSize: '0.78rem' }}>{m.ownershipPct}% equity</div>}
                        </div>
                      )}
                      {assignment.governanceSeat && (
                        <div style={{ padding: '8px 0' }}>
                          <span style={{ color: '#7A8BA0', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Governance</span>
                          <div style={{ fontWeight: 600, marginTop: 2 }}>{assignment.governanceSeat}</div>
                        </div>
                      )}
                    </div>

                    <button onClick={() => { setShowAssignModal(m.id); setActiveTab('manage'); }}
                      style={{ width: '100%', marginTop: 14, padding: '8px', background: '#2B4C6F', color: 'white', border: 'none', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                      Edit Roles
                    </button>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ─── ROLE DIRECTORY TAB ─── */}
      {activeTab === 'roles' && (
        <div>
          {Object.entries(CIRCLES).map(([key, circle]) => {
            const circleMembers = members.filter(m => getMemberCircles(m.id).includes(key));
            return (
              <div key={key} style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: '1.2rem' }}>{circle.icon}</span>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: circle.color }}>{circle.label} Circle</h3>
                  <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: 10, color: '#7A8BA0' }}>{circleMembers.length}</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#7A8BA0', marginBottom: 12 }}>{circle.description}</p>

                {circleMembers.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#cbd5e1', fontSize: '0.85rem', background: 'white', borderRadius: 10, border: '1px solid #DDE3EB' }}>
                    No members in this circle yet
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                    {circleMembers.map(m => {
                      const assignment = roleAssignments[m.id] || {};
                      const roleInCircle = key === 'business' ? assignment.businessRole :
                        key === 'family' ? (assignment.familyRole || m.role || 'Family Member') :
                        (assignment.ownershipRole || (m.ownershipPct > 0 ? `${m.ownershipPct}% Owner` : 'Stakeholder'));
                      const allCircles = getMemberCircles(m.id);
                      return (
                        <div key={m.id} onClick={() => { setSelectedMember(m.id); setActiveTab('map'); }}
                          style={{ background: 'white', borderRadius: 10, padding: '14px 18px', border: '1px solid #DDE3EB', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s' }}>
                          <div style={{ width: 38, height: 38, borderRadius: '50%', background: circle.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                            {getInitials(m)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#34597A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getMemberName(m)}</div>
                            <div style={{ fontSize: '0.78rem', color: '#7A8BA0' }}>{roleInCircle}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 3 }}>
                            {allCircles.map(c => (
                              <span key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: CIRCLES[c].color }} />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── ASSIGN ROLES TAB ─── */}
      {activeTab === 'manage' && (
        <div>
          <div style={{ background: '#F5F7FA', borderRadius: 12, padding: 20, marginBottom: 20, border: '1px solid #DDE3EB' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#34597A', marginBottom: 4 }}>Assign Roles Across Three Circles</h3>
            <p style={{ fontSize: '0.85rem', color: '#7A8BA0' }}>
              Every family member starts in the Family circle. Assign Business and Ownership roles to place them in the right intersections on the map.
            </p>
          </div>

          {members.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#7A8BA0' }}>
              <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>No family members to assign</p>
              <p style={{ fontSize: '0.88rem' }}>Add members in "My Family" first.</p>
            </div>
          ) : (
            members.map(m => {
              const assignment = roleAssignments[m.id] || {};
              const circles = getMemberCircles(m.id);
              const isExpanded = showAssignModal === m.id;

              return (
                <div key={m.id} style={{ background: 'white', borderRadius: 10, border: '1px solid #DDE3EB', marginBottom: 8, overflow: 'hidden' }}>
                  <div onClick={() => setShowAssignModal(isExpanded ? null : m.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', cursor: 'pointer' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#2B4C6F', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                      {getInitials(m)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#34597A' }}>{getMemberName(m)}</div>
                      <div style={{ fontSize: '0.78rem', color: '#7A8BA0' }}>
                        Gen {m.generation} · {circles.length} circle{circles.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {circles.map(c => (
                        <span key={c} style={{ fontSize: '0.68rem', fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: CIRCLES[c].color + '15', color: CIRCLES[c].color }}>{CIRCLES[c].label}</span>
                      ))}
                    </div>
                    <span style={{ color: '#7A8BA0', fontSize: '0.85rem', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>▾</span>
                  </div>

                  {isExpanded && (
                    <div style={{ padding: '0 20px 20px', borderTop: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, paddingTop: 16 }}>
                        {/* Business Role */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: CIRCLES.business.color, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {CIRCLES.business.icon} Business Role
                          </label>
                          <select value={assignment.businessRole || ''} onChange={(e) => updateRole(m.id, 'businessRole', e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.85rem' }}>
                            <option value="">— Not in Business —</option>
                            {BUSINESS_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                          {assignment.businessRole && (
                            <input placeholder="Job title (optional)" value={assignment.businessTitle || ''}
                              onChange={(e) => updateRole(m.id, 'businessTitle', e.target.value)}
                              style={{ width: '100%', marginTop: 6, padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: '0.82rem', boxSizing: 'border-box' }} />
                          )}
                        </div>

                        {/* Family Role */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: CIRCLES.family.color, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {CIRCLES.family.icon} Family Role
                          </label>
                          <select value={assignment.familyRole || m.role || ''} onChange={(e) => updateRole(m.id, 'familyRole', e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.85rem' }}>
                            <option value="">— Select —</option>
                            {FAMILY_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>

                        {/* Ownership Role */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: CIRCLES.ownership.color, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {CIRCLES.ownership.icon} Ownership Role
                          </label>
                          <select value={assignment.ownershipRole || ''} onChange={(e) => updateRole(m.id, 'ownershipRole', e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.85rem' }}>
                            <option value="">— Not an Owner —</option>
                            {OWNERSHIP_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>

                        {/* Governance Seat */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#7A8BA0', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            ⚖️ Governance Seat
                          </label>
                          <select value={assignment.governanceSeat || ''} onChange={(e) => updateRole(m.id, 'governanceSeat', e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.85rem' }}>
                            <option value="">— None —</option>
                            <option value="Board Chair">Board Chair</option>
                            <option value="Board Member">Board Member</option>
                            <option value="Independent Director">Independent Director</option>
                            <option value="Family Council Chair">Family Council Chair</option>
                            <option value="Family Council Member">Family Council Member</option>
                            <option value="Advisory Board">Advisory Board</option>
                            <option value="Trustee">Trustee</option>
                          </select>
                        </div>
                      </div>

                      {/* Notes */}
                      <div style={{ marginTop: 12 }}>
                        <input placeholder="Notes about this person's role (optional)"
                          value={assignment.notes || ''} onChange={(e) => updateRole(m.id, 'notes', e.target.value)}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.82rem', boxSizing: 'border-box' }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
