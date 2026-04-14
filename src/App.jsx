import React, { useState, useEffect, useRef } from 'react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { auth, db, payments, hasSupabase, hasStripe } from './backend.js';
import './App.css';

// ═══════════════════════════════════════════════════════════════
// LEP HUB — Legacy Enterprise Platform v15
// Auth System + Commercialization Infrastructure
// ═══════════════════════════════════════════════════════════════

// ─── AUTH SYSTEM ──────────────────────────────────────────────
// Phase 1: Client-side auth with localStorage (production will use Supabase)
// This provides the full UX flow while we wire up the backend

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [role, setRole] = useState('owner');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await auth.signIn({ email, password });
      onLogin(user);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const { user } = await auth.signUp({ email, password, name: name.trim(), orgName: orgName.trim(), role });
      onLogin(user);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await auth.resetPassword(email);
      setResetSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #0a0f1c 0%, #1a2744 50%, #2d5a3d 100%)'}}>
      {/* Left panel — brand */}
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', color: 'white', maxWidth: '560px'}}>
        <div style={{marginBottom: '48px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px'}}>
            <span style={{fontSize: '32px', color: '#c9a962'}}>◆</span>
            <span style={{fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '36px'}}>LEP Hub</span>
          </div>
          <h1 style={{fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '2.8rem', fontWeight: 400, lineHeight: 1.15, marginBottom: '20px'}}>
            The platform for families who build to last.
          </h1>
          <p style={{fontSize: '1.05rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, maxWidth: '420px'}}>
            LEP Hub helps multigenerational family enterprises navigate succession, governance, and transition — together. One framework. Every generation.
          </p>
        </div>
        <div style={{display: 'flex', gap: '32px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)'}}>
          <div><strong style={{color: 'rgba(255,255,255,0.8)', fontSize: '1.4rem', display: 'block'}}>6</strong>Pillars</div>
          <div><strong style={{color: 'rgba(255,255,255,0.8)', fontSize: '1.4rem', display: 'block'}}>3</strong>Phases</div>
          <div><strong style={{color: 'rgba(255,255,255,0.8)', fontSize: '1.4rem', display: 'block'}}>1</strong>Family</div>
        </div>
      </div>

      {/* Right panel — auth form */}
      <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px'}}>
        <div style={{width: '100%', maxWidth: '420px', background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'}}>

          {mode === 'forgot' ? (
            <>
              <h2 style={{fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '1.6rem', color: '#0a0f1c', marginBottom: '8px'}}>Reset password</h2>
              {resetSent ? (
                <div style={{textAlign: 'center', padding: '24px 0'}}>
                  <div style={{fontSize: '2.5rem', marginBottom: '12px'}}>✉️</div>
                  <p style={{color: '#475569', marginBottom: '20px'}}>If an account exists for <strong>{email}</strong>, we've sent password reset instructions.</p>
                  <button onClick={() => { setMode('login'); setResetSent(false); }} style={{background: 'none', border: 'none', color: '#2d5a3d', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem'}}>Back to login</button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword}>
                  <p style={{color: '#64748b', fontSize: '0.9rem', marginBottom: '24px'}}>Enter your email and we'll send reset instructions.</p>
                  <label style={{display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px'}}>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@family.com" style={{width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.92rem', marginBottom: '20px', outline: 'none'}} />
                  <button type="submit" disabled={loading} style={{width: '100%', padding: '12px', background: 'linear-gradient(135deg, #2d5a3d, #4a7c5d)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', opacity: loading ? 0.6 : 1}}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
                  <p style={{textAlign: 'center', marginTop: '16px', fontSize: '0.85rem', color: '#64748b'}}>
                    <button type="button" onClick={() => setMode('login')} style={{background: 'none', border: 'none', color: '#2d5a3d', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem'}}>Back to login</button>
                  </p>
                </form>
              )}
            </>
          ) : (
            <>
              <h2 style={{fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '1.6rem', color: '#0a0f1c', marginBottom: '4px'}}>
                {mode === 'login' ? 'Welcome back' : 'Start your LEP journey'}
              </h2>
              <p style={{color: '#64748b', fontSize: '0.88rem', marginBottom: '28px'}}>
                {mode === 'login' ? 'Sign in to continue building your family enterprise legacy.' : 'Create your account to begin your family enterprise assessment.'}
              </p>

              {error && <div style={{background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', border: '1px solid #fee2e2'}}>{error}</div>}

              <form onSubmit={mode === 'login' ? handleLogin : handleSignup}>
                {mode === 'signup' && (
                  <>
                    <label style={{display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px'}}>Full Name *</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Jason Packer" style={{width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.92rem', marginBottom: '16px', outline: 'none'}} />

                    <label style={{display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px'}}>Family Enterprise Name</label>
                    <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="e.g., The Packer Family Enterprise" style={{width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.92rem', marginBottom: '16px', outline: 'none'}} />

                    <label style={{display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px'}}>Your Role</label>
                    <select value={role} onChange={e => setRole(e.target.value)} style={{width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.92rem', marginBottom: '16px', outline: 'none', background: 'white'}}>
                      <option value="owner">Current Owner / Patriarch / Matriarch</option>
                      <option value="next-gen">Next Generation Leader</option>
                      <option value="family-member">Family Member / Stakeholder</option>
                      <option value="advisor">Family Business Advisor</option>
                      <option value="board">Board Member / Trustee</option>
                    </select>
                  </>
                )}

                <label style={{display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px'}}>Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@family.com" style={{width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.92rem', marginBottom: '16px', outline: 'none'}} />

                <label style={{display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px'}}>Password *</label>
                <div style={{position: 'relative', marginBottom: mode === 'login' ? '8px' : '16px'}}>
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder={mode === 'login' ? 'Enter your password' : 'Min. 8 characters'} style={{width: '100%', padding: '11px 14px', paddingRight: '44px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.92rem', outline: 'none'}} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem'}}>{showPassword ? 'Hide' : 'Show'}</button>
                </div>

                {mode === 'login' && (
                  <p style={{textAlign: 'right', marginBottom: '20px'}}>
                    <button type="button" onClick={() => setMode('forgot')} style={{background: 'none', border: 'none', color: '#2d5a3d', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer'}}>Forgot password?</button>
                  </p>
                )}

                {mode === 'signup' && (
                  <p style={{fontSize: '0.78rem', color: '#94a3b8', marginBottom: '20px'}}>By creating an account, you agree to LEP Hub's Terms of Service and Privacy Policy.</p>
                )}

                <button type="submit" disabled={loading} style={{width: '100%', padding: '13px', background: 'linear-gradient(135deg, #2d5a3d, #4a7c5d)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', opacity: loading ? 0.6 : 1, transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(45,90,61,0.25)'}}>
                  {loading ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : (mode === 'login' ? 'Sign In' : 'Create Account')}
                </button>
              </form>

              <div style={{textAlign: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9'}}>
                <p style={{fontSize: '0.88rem', color: '#64748b'}}>
                  {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} style={{background: 'none', border: 'none', color: '#2d5a3d', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem'}}>
                    {mode === 'login' ? 'Start free' : 'Sign in'}
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 900px) {
          .auth-screen > div:first-child { display: none !important; }
          .auth-screen > div:last-child { flex: 1 !important; }
        }
      `}</style>
    </div>
  );
}

// ─── DATA: LEP Framework Structure ─────────────────────────────
const LEP_PILLARS = [
  {
    id: 'purpose-identity',
    name: 'PURPOSE & IDENTITY',
    toolName: 'The Foundation',
    icon: '🌟',
    color: '#2d5a3d',
    tagline: 'Know why you are together',
    description: 'Shared purpose, family values, and the narrative that binds generations',
    modules: [
      { id: 'shared-purpose', name: 'Shared Purpose, Values & Family Narrative', description: 'Articulate the why of being an enterprise family — values, mission, founding story, stewardship mindset, and generational recommitment', hasContent: true },
    ],
  },
  {
    id: 'family-system',
    name: 'FAMILY SYSTEM',
    toolName: 'The Relationships',
    icon: '👨‍👩‍👧‍👦',
    color: '#1a3a5c',
    tagline: 'Strengthen the family behind the business',
    description: 'Family dynamics, communication, transitions, and next-generation development',
    modules: [
      { id: 'family-dynamics', name: 'Family Dynamics & Relationships', description: 'Map relational health, patterns, alliances, and the family genogram — understanding the family as a system', hasContent: true },
      { id: 'communication', name: 'Communication & Family Meetings', description: 'Build structured dialogue — family meetings, shareholder communication, cross-generational conversation, and difficult topics', hasContent: true },
      { id: 'transitions', name: 'Family Transitions & Integration', description: 'Navigate entry and exit — next-gen onboarding, married-ins, divorce, departure, and re-transitions', hasContent: true },
      { id: 'nextgen-dev', name: 'Next-Generation Development', description: 'Prepare rising generations through exposure, education, mentorship, and leadership readiness', hasContent: true },
    ],
  },
  {
    id: 'ownership-governance',
    name: 'OWNERSHIP & GOVERNANCE',
    toolName: 'The Structure',
    icon: '⚖️',
    color: '#7c3aed',
    tagline: 'Build the architecture of trust',
    description: 'Ownership clarity, governance design, and decision-making frameworks',
    modules: [
      { id: 'ownership', name: 'Ownership Structure & Rights', description: 'Define who owns what, transfer mechanisms, control transition, liquidity, and exit rights', hasContent: true },
      { id: 'governance', name: 'Governance Architecture', description: 'Design the board, family council, family constitution, and evolving governance structures', hasContent: true },
      { id: 'decisions', name: 'Decision-Making & Conflict Resolution', description: 'Map decision rights, build resolution mechanisms, and break destructive family patterns', hasContent: true },
    ],
  },
  {
    id: 'business-operations',
    name: 'BUSINESS & OPERATIONS',
    toolName: 'The Enterprise',
    icon: '🏢',
    color: '#0891b2',
    tagline: 'Run the business like a business',
    description: 'Roles, compensation, and professionalizing the family enterprise',
    modules: [
      { id: 'roles', name: 'Roles, Responsibilities & Family Employment', description: 'Clarify who does what across family, business, and ownership — with formal employment policies', hasContent: true },
      { id: 'compensation', name: 'Compensation & Benefits', description: 'Define how family members are paid, distribution policies, and transparency practices', hasContent: true },
      { id: 'professionalize', name: 'Non-Family Leadership & Professionalizing', description: 'Engage non-family talent and transition from founder-led to professionally managed', hasContent: true },
    ],
  },
  {
    id: 'strategy-legacy',
    name: 'STRATEGY & LEGACY',
    toolName: 'The Future',
    icon: '🚀',
    color: '#d97706',
    tagline: 'Build for generations to come',
    description: 'Succession, strategy, estate planning, and philanthropy',
    modules: [
      { id: 'succession', name: 'Succession Planning', description: 'Plan intentional transitions of leadership, ownership, and authority across generations', hasContent: true },
      { id: 'strategy', name: 'Family Enterprise Strategy', description: 'Set ownership-level strategic direction — growth, risk, capital allocation, and family-business balance', hasContent: true },
      { id: 'estate', name: 'Estate Planning & Wealth Transfer', description: 'Align wealth transfer structures with family values and succession plans', hasContent: true },
      { id: 'philanthropy', name: 'Philanthropy & Social Impact', description: 'Connect family giving to enterprise values and next-generation engagement', hasContent: true },
    ],
  },
];

// ─── INDUSTRY CATEGORIES ──────────────────────────────────────
const INDUSTRY_PROFILES = {
  'Manufacturing': { icon: '🏭', pathways: ['pe-sale', 'esop', 'next-gen'], tip: 'Manufacturing businesses often command 5-8x EBITDA multiples. ESOP transitions are common due to workforce culture.' },
  'Distribution': { icon: '📦', pathways: ['pe-sale', 'private-credit', 'next-gen'], tip: 'Distribution companies attract PE interest due to recurring revenue. Private credit works well for asset-heavy operations.' },
  'Construction': { icon: '🔨', pathways: ['next-gen', 'esop', 'non-family-exec'], tip: 'Construction businesses are deeply tied to founder reputation. Next-gen transitions require long runway for relationship transfer.' },
  'Food & Beverage': { icon: '🍽️', pathways: ['pe-sale', 'patient-capital', 'next-gen'], tip: 'F&B brands carry emotional weight. Patient capital preserves brand identity while providing liquidity.' },
  'Real Estate': { icon: '🏠', pathways: ['patient-capital', 'next-gen', 'non-family-exec'], tip: 'Real estate families often prefer holding assets long-term. Family office structures work well here.' },
  'Technology': { icon: '💻', pathways: ['pe-sale', 'patient-capital', 'non-family-exec'], tip: 'Tech companies move fast. Strategic buyers often pay premiums. Non-family executives common for scaling.' },
  'Healthcare Services': { icon: '🏥', pathways: ['pe-sale', 'private-credit', 'non-family-exec'], tip: 'Healthcare PE is active. Regulatory complexity means professional management transition is common.' },
  'Retail': { icon: '🛍️', pathways: ['next-gen', 'esop', 'pe-sale'], tip: 'Retail families have deep community ties. ESOP can preserve culture while providing founder liquidity.' },
  'Professional Services': { icon: '💼', pathways: ['next-gen', 'non-family-exec', 'esop'], tip: 'People-based businesses depend on relationships. Gradual transitions over 3-5 years work best.' },
  'Agriculture': { icon: '🌾', pathways: ['next-gen', 'patient-capital', 'private-credit'], tip: 'Ag families are multi-generational by nature. Land and legacy are inseparable. Patient capital preserves both.' },
};

// ─── TRANSITION PATHWAYS ───────────────────────────────────────
const TRANSITION_PATHWAYS = [
  {
    id: 'pe-sale',
    name: 'Sell to Private Equity',
    icon: '🏦',
    color: '#7c3aed',
    shortDesc: 'Full exit to a private equity firm or strategic buyer',
    description: 'Evaluate whether a full exit is right for your family. Assess readiness, align family members, understand the emotional and financial implications, and prepare for life after the sale.',
    considerations: ['Valuation readiness', 'Family alignment on exit', 'Employee & community impact', 'Post-exit identity & purpose', 'Wealth governance after liquidity'],
    status: 'coming-soon',
  },
  {
    id: 'private-credit',
    name: 'Private Credit Succession',
    icon: '🏗️',
    color: '#0891b2',
    shortDesc: 'Use debt to fund an internal ownership transition',
    description: 'Keep the business in the family by using private credit to buy out the senior generation. Assess whether the business can support the debt and whether the next generation is ready to operate under leverage.',
    considerations: ['Debt capacity & affordability', 'Next-gen operational readiness', 'Senior gen retirement needs', 'Lender relationship management', 'Risk tolerance assessment'],
    status: 'coming-soon',
  },
  {
    id: 'patient-capital',
    name: 'Patient Capital / Family Office',
    icon: '🤝',
    color: '#2d5a3d',
    shortDesc: 'Bring in outside capital without giving up full control',
    description: 'Explore minority investment, growth equity, or family office partnerships that provide liquidity and expertise while preserving family control and culture.',
    considerations: ['Control vs. capital tradeoffs', 'Governance with outside investors', 'Timeline & exit expectations', 'Cultural alignment', 'Board composition changes'],
    status: 'coming-soon',
  },
  {
    id: 'esop',
    name: 'Employee Ownership (ESOP)',
    icon: '👥',
    color: '#d97706',
    shortDesc: 'Transfer ownership to the people who built the business',
    description: 'Employee Stock Ownership Plans offer tax advantages and a meaningful succession path. Evaluate whether your workforce, culture, and financials support an ESOP transition.',
    considerations: ['Tax advantages & structure', 'Valuation methodology', 'Employee readiness & culture', 'Ongoing governance requirements', 'Partial vs. full ESOP'],
    status: 'coming-soon',
  },
  {
    id: 'next-gen',
    name: 'Next-Gen Takeover',
    icon: '🌱',
    color: '#1a3a5c',
    shortDesc: 'Prepare the next generation to lead',
    description: 'The most common — and most complex — path. Define employment policies, leadership criteria, board composition, and development plans. Address the hard questions: merit vs. birthright, readiness timelines, and founder transition.',
    considerations: ['Family employment policy', 'Leadership qualification criteria', 'Board composition & governance', 'Founder role post-transition', 'Sibling/cousin dynamics'],
    status: 'coming-soon',
  },
  {
    id: 'non-family-exec',
    name: 'Non-Family Executive',
    icon: '👔',
    color: '#dc2626',
    shortDesc: 'Retain ownership, bring in professional management',
    description: 'Separate ownership from operations by hiring a non-family CEO or executive team. Define authority boundaries, family council roles, and compensation alignment.',
    considerations: ['Hiring criteria & search process', 'Authority boundaries & autonomy', 'Family council vs. board roles', 'Compensation & incentive alignment', 'Cultural preservation'],
    status: 'coming-soon',
  },
];

const MEETING_TYPES = [
  { id: 'board', name: 'Board Meeting', frequency: 'Quarterly', icon: '🏛️', pillars: ['business-operations', 'strategy-legacy'] },
  { id: 'shareholder', name: 'Shareholder Meeting', frequency: 'Annual', icon: '📊', pillars: ['business-operations', 'strategy-legacy'] },
  { id: 'family-council', name: 'Family Council', frequency: 'Monthly', icon: '👥', pillars: ['family-system', 'purpose-identity'] },
  { id: 'family-meeting', name: 'Family Meeting', frequency: 'Annual', icon: '🏠', pillars: ['purpose-identity', 'strategy-legacy'] },
  { id: 'nextgen', name: 'Next Gen Gathering', frequency: 'Semi-annual', icon: '🌱', pillars: ['strategy-legacy'] },
];

const COMMITTEE_TYPES = [
  { id: 'investment', name: 'Investment Committee', icon: '💰' },
  { id: 'compensation', name: 'Compensation Committee', icon: '💵' },
  { id: 'philanthropy', name: 'Philanthropy Committee', icon: '❤️' },
  { id: 'governance', name: 'Governance Committee', icon: '⚖️' },
  { id: 'nominating', name: 'Nominating Committee', icon: '🗳️' },
];

// ─── ASSESSMENT QUESTIONS ──────────────────────────────────────
const ASSESSMENT_QUESTIONS = {
  'purpose-identity': [
    { id: 'sp1', text: 'Our family has articulated a shared set of values that actively guide business decisions.' },
    { id: 'sp2', text: 'There is a documented family narrative or founding story known and embraced across generations.' },
    { id: 'sp3', text: 'Family members genuinely enjoy working together and choose to be in enterprise together.' },
    { id: 'sp4', text: 'Each generation has explicitly recommitted to the family enterprise rather than assuming continuity.' },
    { id: 'sp5', text: 'The family views itself as stewards of a legacy for future generations, not just owners of a current asset.' },
    { id: 'sp6', text: 'There is constructive, thoughtful conflict on issues of concern rather than avoidance.' },
    { id: 'sp7', text: 'The family has a written purpose or mission statement that goes beyond financial returns.' },
    { id: 'sp8', text: 'The shared purpose is a living conversation revisited regularly, not a static document.' },
    { id: 'sp9', text: 'The family has a process for evolving its narrative as new generations bring their own perspectives.' },
    { id: 'sp10', text: 'The family\'s stated values align with how decisions are actually made in the enterprise.' },
  ],
  'family-dynamics': [
    { id: 'fd1', text: 'The family has completed a genogram that maps relational dynamics, not just family structure.' },
    { id: 'fd2', text: 'The family can identify recurring patterns in how they relate (avoidance, dominance, triangulation, alliance).' },
    { id: 'fd3', text: 'There are no unresolved conflicts or emotional cutoffs between family members affecting business.' },
    { id: 'fd4', text: 'The family understands how its relational history shapes current business behavior.' },
    { id: 'fd5', text: 'Intergenerational patterns (secrecy, authoritarianism, distrust) have been identified and are being addressed.' },
    { id: 'fd6', text: 'All family members feel they can be authentic in family business settings.' },
    { id: 'fd7', text: 'The family has worked with a therapist, facilitator, or advisor who understands family systems.' },
    { id: 'fd8', text: 'The emotional health of the family is treated as a priority alongside the financial health of the business.' },
    { id: 'fd9', text: 'Relationships between branches are actively maintained as the family grows.' },
    { id: 'fd10', text: 'Family members are encouraged to develop their own identities, even when differing from tradition.' },
  ],
  'communication': [
    { id: 'cm1', text: 'The family holds regular, structured family meetings with defined agendas.' },
    { id: 'cm2', text: 'There is a formal communication rhythm for the ownership group about business performance.' },
    { id: 'cm3', text: 'Senior and next generation have structured dialogue opportunities beyond casual conversation.' },
    { id: 'cm4', text: 'The family has a way to surface difficult topics before they become crises.' },
    { id: 'cm5', text: 'There is a process for hard conversations rather than avoidance until things explode.' },
    { id: 'cm6', text: 'All family members, including those not in the business, are kept appropriately informed.' },
    { id: 'cm7', text: 'There is alignment on how the family communicates about the enterprise externally.' },
    { id: 'cm8', text: 'Family meetings address relational and emotional topics, not only business matters.' },
    { id: 'cm9', text: 'Meeting outcomes are documented with clear action items, owners, and deadlines.' },
    { id: 'cm10', text: 'There is a mechanism for raising issues between formal meetings.' },
  ],
  'transitions': [
    { id: 'tr1', text: 'The family has explicitly aligned on the long-term future of the enterprise (keep, grow, or sell).' },
    { id: 'tr2', text: 'The family has defined the scope of entry for each transitioning member (ownership, operating, or both).' },
    { id: 'tr3', text: 'There is a formal role design with real accountability for incoming family members.' },
    { id: 'tr4', text: 'Incoming members receive a structured introduction to the family\'s values and operating culture.' },
    { id: 'tr5', text: 'There is a formal education and development path with milestones for transitioning members.' },
    { id: 'tr6', text: 'Incoming members have structured exposure to ownership, governance, and shareholder activities.' },
    { id: 'tr7', text: 'The family has addressed the leadership succession question — family or non-family leader.' },
    { id: 'tr8', text: 'There is a written family employment and shareholder entry policy.' },
    { id: 'tr9', text: 'The senior generation has emotionally processed what this transition means for their identity.' },
    { id: 'tr10', text: 'The incoming generation feels genuinely welcomed, not merely tolerated.' },
    { id: 'tr11', text: 'The family has considered the systemic impact of transitions on all family members.' },
    { id: 'tr12', text: 'There is a dedicated process for onboarding married-ins and spouses into the family enterprise.' },
    { id: 'tr13', text: 'Outside work experience is a requirement or strong recommendation before joining the family business.' },
    { id: 'tr14', text: 'There is a transition governance committee with defined authority and evaluation cadence.' },
    { id: 'tr15', text: 'Transitions have been communicated to non-family leadership to preserve confidence.' },
    { id: 'tr16', text: 'The family has a pathway for re-transitions (reentry, exit, or reversal).' },
  ],
  'nextgen-dev': [
    { id: 'nd1', text: 'The family has a structured approach to exposing the rising generation to the business from an early age.' },
    { id: 'nd2', text: 'Outside work experience is required or strongly encouraged before joining the family business.' },
    { id: 'nd3', text: 'There is a formal education path building financial literacy, governance understanding, and industry knowledge.' },
    { id: 'nd4', text: 'Mentoring relationships are in place with both family and non-family mentors.' },
    { id: 'nd5', text: 'The next generation has opportunities to participate in governance (junior advisory board, family council).' },
    { id: 'nd6', text: 'The family has discussed and communicated what readiness looks like for next-gen entry.' },
    { id: 'nd7', text: 'Next-gen members are developing leadership skills and confidence independent of the family name.' },
    { id: 'nd8', text: 'There is support for those who choose not to join the business, without stigma or loss of standing.' },
    { id: 'nd9', text: 'The family has addressed emotional preparation — legacy expectations, navigating family dynamics, and building independent confidence.' },
  ],
  'ownership': [
    { id: 'ow1', text: 'The family has mapped the current ownership structure in detail (who holds what, what type, what control).' },
    { id: 'ow2', text: 'The senior generation has explicitly communicated their intent for ownership transfer — to whom, when, and how.' },
    { id: 'ow3', text: 'The family has addressed the emotional barriers to ownership transfer (fear of losing control, trust).' },
    { id: 'ow4', text: 'The family has defined what ownership means — rights, responsibilities, and expectations.' },
    { id: 'ow5', text: 'There is a transfer mechanism that reflects family values, not just tax efficiency.' },
    { id: 'ow6', text: 'Control transition is happening progressively with defined milestones.' },
    { id: 'ow7', text: 'The family has liquidity and exit mechanisms for shareholders who want out.' },
    { id: 'ow8', text: 'There are redemption policies and an agreed valuation methodology.' },
    { id: 'ow9', text: 'Everything is documented in shareholder agreements and buy-sell agreements.' },
    { id: 'ow10', text: 'The next generation feels trusted and included in ownership conversations.' },
    { id: 'ow11', text: 'The family has considered how the ownership structure affects non-operating family members and fairness.' },
    { id: 'ow12', text: 'Informal promises about future ownership are acknowledged and either formalized or explicitly addressed.' },
  ],
  'governance': [
    { id: 'gv1', text: 'The family enterprise has a functioning board (advisory, fiduciary, or independent).' },
    { id: 'gv2', text: 'The board includes independent non-family members who bring outside perspective.' },
    { id: 'gv3', text: 'There is a family council or assembly that gives the family a voice separate from the business.' },
    { id: 'gv4', text: 'The family has developed a constitution or governance charter.' },
    { id: 'gv5', text: 'Governance structures are appropriate for the current generation and complexity of the enterprise.' },
    { id: 'gv6', text: 'There is a plan for how governance will evolve as the family grows and ownership disperses.' },
    { id: 'gv7', text: 'The family understands the difference between board, family council, and management roles.' },
    { id: 'gv8', text: 'Governance meetings are held regularly with documented outcomes and follow-through.' },
    { id: 'gv9', text: 'The board conducts regular self-evaluations of its effectiveness and composition.' },
    { id: 'gv10', text: 'The governance structure has been tested by a real disagreement or crisis — and held.' },
  ],
  'decisions': [
    { id: 'dc1', text: 'The family clearly understands how decisions are actually made today (not just how they think they are).' },
    { id: 'dc2', text: 'The family has examined their genogram for relational patterns that influence decision-making.' },
    { id: 'dc3', text: 'Decision rights are formally defined — who decides what at each level (ownership, board, management, family).' },
    { id: 'dc4', text: 'There is a documented decision-making process for each governing body (voting, quorum, escalation).' },
    { id: 'dc5', text: 'Every family member feels their voice is heard, especially those who historically defer or stay quiet.' },
    { id: 'dc6', text: 'There is a mechanism for recognizing and surfacing conflict early, before positions harden.' },
    { id: 'dc7', text: 'There are pre-agreed conflict resolution mechanisms in place (internal facilitation, mediation, arbitration).' },
    { id: 'dc8', text: 'The family has identified and committed to breaking destructive decision-making patterns.' },
    { id: 'dc9', text: 'There is an escalation path for when a governing body cannot reach a decision.' },
    { id: 'dc10', text: 'Nuclear option provisions (buyout, forced sale) are defined in advance as a safety mechanism.' },
  ],
  'roles': [
    { id: 'ro1', text: 'Every family member can clearly articulate their role in the family, the business, and the ownership group.' },
    { id: 'ro2', text: 'There is a written family employment policy defining who can work in the business and under what conditions.' },
    { id: 'ro3', text: 'Family employees are held to the same performance standards as non-family employees.' },
    { id: 'ro4', text: 'There is a formal process for evaluating family member performance, separate from family dynamics.' },
    { id: 'ro5', text: 'Roles are based on qualifications and business need, not family position and expectation.' },
    { id: 'ro6', text: 'Each family member in the business has a defined reporting line and accountability structure.' },
    { id: 'ro7', text: 'The family has addressed what happens when a family member in the business is underperforming.' },
    { id: 'ro8', text: 'There is clarity about roles for family members who are owners but not employees.' },
    { id: 'ro9', text: 'There is a clear policy for whether and how spouses or in-laws can work in the family business.' },
    { id: 'ro10', text: 'There is a predefined process for addressing underperformance that everyone knows about in advance.' },
  ],
  'compensation': [
    { id: 'co1', text: 'The family has articulated a compensation philosophy — how family members in the business are paid relative to market.' },
    { id: 'co2', text: 'Family member salaries are benchmarked against comparable non-family roles in the industry.' },
    { id: 'co3', text: 'There is a clear and fair distribution policy for shareholders who do not work in the business.' },
    { id: 'co4', text: 'The family has addressed the interaction between compensation (for workers) and distributions (for owners).' },
    { id: 'co5', text: 'There is transparency about compensation within the family rather than suspicion and resentment.' },
    { id: 'co6', text: 'The family has addressed compensation for in-laws who work in the business.' },
    { id: 'co7', text: 'Board fees and governance compensation are defined and appropriate.' },
    { id: 'co8', text: 'The compensation structure is documented rather than informal with different assumptions.' },
    { id: 'co9', text: 'Family member compensation has been reviewed or benchmarked by an independent third party.' },
    { id: 'co10', text: 'The family has addressed non-cash perquisites — who gets them, on what basis, and is it transparent.' },
  ],
  'professionalize': [
    { id: 'pr1', text: 'The family enterprise has non-family executives in senior leadership roles.' },
    { id: 'pr2', text: 'Non-family leaders feel valued, empowered, and confident in their future with the company.' },
    { id: 'pr3', text: 'The family has addressed how the business will transition from founder-led to professionally managed.' },
    { id: 'pr4', text: 'There are formal HR practices that apply equally to family and non-family employees.' },
    { id: 'pr5', text: 'There is no risk of losing key non-family talent due to uncertainty about succession or direction.' },
    { id: 'pr6', text: 'The business has implemented professional financial reporting and strategic planning processes.' },
    { id: 'pr7', text: 'Non-family leaders have a voice in strategic decisions appropriate to their role.' },
    { id: 'pr8', text: 'There is a path for non-family leaders to ascend to CEO or top roles if they are the best candidate.' },
    { id: 'pr9', text: 'Non-family leaders are given appropriate transparency about succession plans affecting their roles.' },
  ],
  'succession': [
    { id: 'su1', text: 'The family has identified who will succeed the current leader — and it is explicit, not assumed.' },
    { id: 'su2', text: 'There is a documented succession plan with a timeline and milestones.' },
    { id: 'su3', text: 'Potential successors are being actively developed through defined roles, mentoring, and stretch assignments.' },
    { id: 'su4', text: 'The family has addressed succession at the board and governance level, not just the CEO seat.' },
    { id: 'su5', text: 'The outgoing leader has emotionally processed what succession means for their identity and role.' },
    { id: 'su6', text: 'The incoming leader feels prepared and supported, not just appointed.' },
    { id: 'su7', text: 'There is a contingency plan if the intended successor cannot or will not serve.' },
    { id: 'su8', text: 'There is openness to a non-family CEO if no family member is the right choice.' },
    { id: 'su9', text: 'The succession timeline is realistic given the ages, health, and readiness of those involved.' },
    { id: 'su10', text: 'The family has planned for emergency succession — what happens if the current leader cannot serve tomorrow.' },
  ],
  'strategy': [
    { id: 'st1', text: 'The ownership group has collectively defined a strategic direction — growth, stability, or exit.' },
    { id: 'st2', text: 'There is alignment among owners on risk tolerance and willingness to invest for the future.' },
    { id: 'st3', text: 'The family has separated business strategy (management\'s job) from enterprise strategy (owners\' job).' },
    { id: 'st4', text: 'There is a capital allocation framework balancing reinvestment with distributions.' },
    { id: 'st5', text: 'The family has discussed diversification — staying in the current industry vs. expanding.' },
    { id: 'st6', text: 'When family needs and business needs conflict, there is a structured way to navigate the tension.' },
    { id: 'st7', text: 'The ownership group has discussed the long-term vision — where the enterprise should be in 10 years.' },
    { id: 'st8', text: 'Strategic decisions are made with input from all relevant stakeholders, not dominated by one voice.' },
    { id: 'st9', text: 'The family has a process for resolving strategic deadlock when owners fundamentally disagree.' },
    { id: 'st10', text: 'If significant assets exist outside the business, there is a coordinated total wealth strategy.' },
  ],
  'estate': [
    { id: 'es1', text: 'The family has a current estate plan that reflects the current ownership structure and succession plan.' },
    { id: 'es2', text: 'The estate plan has been reviewed recently and the family\'s situation has not changed since.' },
    { id: 'es3', text: 'The family has had explicit conversations about how wealth and ownership transfer at death.' },
    { id: 'es4', text: 'Estate planning structures are aligned with family values, not just tax optimization.' },
    { id: 'es5', text: 'There is a gifting strategy or ownership transfer program already underway.' },
    { id: 'es6', text: 'The family has addressed the emotional barriers to estate planning — avoidance and fear of mortality.' },
    { id: 'es7', text: 'All relevant family members understand the estate plan and how it affects them.' },
    { id: 'es8', text: 'Next-gen family members are involved in estate planning conversations at an appropriate level.' },
    { id: 'es9', text: 'The plan addresses equalization for heirs with different levels of involvement in the business.' },
    { id: 'es10', text: 'The family has discussed the difference between equal and equitable distribution and made a conscious choice.' },
  ],
  'philanthropy': [
    { id: 'ph1', text: 'The family has a shared approach to philanthropy rather than only giving individually.' },
    { id: 'ph2', text: 'There is a family foundation, donor-advised fund, or other structured giving vehicle.' },
    { id: 'ph3', text: 'The family has connected its philanthropic mission to its enterprise values and narrative.' },
    { id: 'ph4', text: 'Philanthropy is used as an engagement pathway for next-generation family members.' },
    { id: 'ph5', text: 'The family discusses social impact and community responsibility as part of its enterprise identity.' },
    { id: 'ph6', text: 'The family has considered how the business itself creates social impact beyond check-writing.' },
    { id: 'ph7', text: 'There is a governance structure for philanthropic decisions — who decides where the money goes.' },
    { id: 'ph8', text: 'Philanthropy has been a source of alignment and shared purpose rather than disagreement.' },
    { id: 'ph9', text: 'The family uses philanthropic activities as a development opportunity for next-gen governance skills.' },
  ],
};

// ═══════════════════════════════════════════════════════════════
// MODULE CONTENT FOR ALL AREAS
// ═══════════════════════════════════════════════════════════════

const SHARED_PURPOSE_MODULE_CONTENT = {
  'shared-purpose': {
    title: 'Shared Purpose, Values & Family Narrative',
    subtitle: 'Articulate the why of being an enterprise family — values, mission, founding story, stewardship mindset, and generational recommitment',
    estimatedTime: '120-150 minutes',
    sections: [
      {
        id: 'purpose-discovery',
        title: 'Purpose Discovery',
        description: 'What brings this family together?',
        exercises: [
          {
            id: 'founding-story',
            question: 'Tell the founding story — who started it, when, and what problem were they solving?',
            type: 'textarea',
            placeholder: 'Our family enterprise began when...',
            helperText: 'Include founder background, the problem or opportunity, early challenges overcome.',
          },
          {
            id: 'why-together',
            question: 'Why do we choose to work together? What value does the family enterprise create?',
            type: 'textarea',
            placeholder: 'We work together to...',
            helperText: 'Financial value, family cohesion, community impact, legacy, stewardship.',
          },
        ],
      },
      {
        id: 'values-definition',
        title: 'Core Values Definition',
        description: 'What principles guide us?',
        exercises: [
          {
            id: 'core-values',
            question: 'Define 4-6 core values that guide the family enterprise',
            type: 'textarea',
            placeholder: 'Our core values are:\n1.\n2.\n3.',
            helperText: 'Examples: integrity, stewardship, innovation, family first, community responsibility.',
          },
          {
            id: 'values-in-practice',
            question: 'Give examples of these values in action within your family or business',
            type: 'textarea',
            placeholder: 'An example of [value] in action is...',
          },
        ],
      },
      {
        id: 'stewardship',
        title: 'Stewardship & Generational Thinking',
        description: 'How do we view our responsibility to future generations?',
        exercises: [
          {
            id: 'stewardship-approach',
            question: 'Do we view ourselves as stewards of a legacy or owners of an asset to be exploited?',
            type: 'textarea',
            placeholder: 'We see our role as stewards who...',
            helperText: 'Consider your long-term vision, impact on future generations, responsibility to stakeholders.',
          },
          {
            id: 'recommitment',
            question: 'How can each generation actively recommit to the family enterprise, rather than assuming continuity?',
            type: 'textarea',
            placeholder: 'Each generation should...',
            helperText: 'Regular conversations, explicit choice, intentional involvement.',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Family Purpose & Values Statement',
      description: 'A document articulating your shared purpose, core values, and stewardship philosophy.',
    },
  },
};

const FAMILY_DYNAMICS_MODULE_CONTENT = {
  'family-dynamics': {
    title: 'Family Dynamics & Relationships',
    subtitle: 'Map relational health, patterns, alliances, and the family genogram — understanding the family as a system',
    estimatedTime: '120-150 minutes',
    sections: [
      {
        id: 'genogram-mapping',
        title: 'Family Genogram',
        description: 'Create a visual and relational map of your family system.',
        exercises: [
          {
            id: 'family-structure',
            question: 'Map your family structure — how many generations, branches, and family members?',
            type: 'textarea',
            placeholder: 'Our family includes [# generations], with branches including...',
            helperText: 'Include all adult family members and their primary relationships.',
          },
        ],
      },
      {
        id: 'relationship-patterns',
        title: 'Relationship Patterns & Dynamics',
        description: 'Understand the patterns that shape how your family operates.',
        exercises: [
          {
            id: 'strong-bonds',
            question: 'Which relationships are particularly strong? What makes them strong?',
            type: 'textarea',
            placeholder: 'Strong relationships include...',
            helperText: 'Trust, shared values, frequent communication, mutual support.',
          },
          {
            id: 'tensions',
            question: 'Where are there tensions, conflicts, or unresolved issues?',
            type: 'textarea',
            placeholder: 'Areas of tension include...',
            helperText: 'Be honest. This is private information for your family only.',
          },
          {
            id: 'patterns',
            question: 'What patterns repeat? (Triangulation, alliances, avoidance, dominance)',
            type: 'textarea',
            placeholder: 'We notice patterns of...',
            helperText: 'Example: When conflict arises, people align in predictable ways.',
          },
          {
            id: 'generational-patterns',
            question: 'What patterns repeat across generations?',
            type: 'textarea',
            placeholder: 'We see recurring themes of...',
            helperText: 'Entrepreneurship, conflict avoidance, secrecy, authoritarianism, etc.',
          },
        ],
      },
      {
        id: 'emotional-health',
        title: 'Emotional Health & Safety',
        description: 'Is the family psychologically safe and emotionally healthy?',
        exercises: [
          {
            id: 'safety',
            question: 'Do all family members feel emotionally safe? Can people be authentic?',
            type: 'textarea',
            placeholder: 'Family members feel safe when...',
            helperText: 'Psychological safety, freedom to disagree, no fear of judgment or retaliation.',
          },
          {
            id: 'cutoffs',
            question: 'Are there any emotional cutoffs or serious rifts affecting the business?',
            type: 'textarea',
            placeholder: 'There are unresolved issues between...',
            helperText: 'Previous divorces, conflicts, estrangements that affect today.',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Family Dynamics Assessment',
      description: 'A documented analysis of family relationships, patterns, and emotional health.',
    },
  },
};

const COMMUNICATION_MODULE_CONTENT = {
  'communication': {
    title: 'Communication & Family Meetings',
    subtitle: 'Build structured dialogue — family meetings, shareholder communication, cross-generational conversation, and difficult topics',
    estimatedTime: '90-120 minutes',
    sections: [
      {
        id: 'meeting-structures',
        title: 'Formal Meeting Structures',
        description: 'Design regular, structured conversation forums.',
        exercises: [
          {
            id: 'meeting-types',
            question: 'What meeting forums will you establish? (Family meetings, shareholder meetings, family council)',
            type: 'textarea',
            placeholder: 'We will hold the following meetings:\n1. Family Meeting - [frequency]\n2.',
            helperText: 'Consider family meetings, board meetings, owner meetings, council meetings.',
          },
          {
            id: 'meeting-cadence',
            question: 'How frequently will each meeting occur?',
            type: 'select',
            options: ['Monthly', 'Quarterly', 'Semi-annually', 'Annually', 'As-needed'],
          },
        ],
      },
      {
        id: 'agenda-and-process',
        title: 'Agenda & Process Design',
        description: 'How will meetings be structured?',
        exercises: [
          {
            id: 'agenda-structure',
            question: 'What will family meetings cover? Business? Relationships? Values?',
            type: 'textarea',
            placeholder: 'Family meeting agendas will include...',
            helperText: 'Both business updates AND relational/emotional topics are important.',
          },
          {
            id: 'facilitation',
            question: 'Who will facilitate family meetings? An insider or external facilitator?',
            type: 'textarea',
            placeholder: 'Family meetings will be facilitated by...',
            helperText: 'Consider benefits of external facilitator for objectivity, especially in early years.',
          },
        ],
      },
      {
        id: 'difficult-topics',
        title: 'Surfacing Difficult Topics',
        description: 'How will hard conversations happen?',
        exercises: [
          {
            id: 'difficult-process',
            question: 'How will the family surface and discuss difficult or sensitive topics?',
            type: 'textarea',
            placeholder: 'For difficult topics, we will...',
            helperText: 'Create psychological safety, one-on-one pre-conversations, facilitated sessions.',
          },
          {
            id: 'between-meetings',
            question: 'How will family members raise issues or concerns between formal meetings?',
            type: 'textarea',
            placeholder: 'Between meetings, family members can...',
            helperText: 'One-on-one conversations, council representative, emergency meeting process.',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Family Communication Plan',
      description: 'A framework for regular, structured family communication and difficult conversations.',
    },
  },
};

const TRANSITIONS_MODULE_CONTENT = {
  'transitions': {
    title: 'Family Transitions & Integration',
    subtitle: 'Navigate entry and exit — next-gen onboarding, married-ins, divorce, departure, and re-transitions',
    estimatedTime: '120-150 minutes',
    sections: [
      {
        id: 'transition-scope',
        title: 'Scope of Entry & Exit',
        description: 'What does transition mean for your family?',
        exercises: [
          {
            id: 'long-term-vision',
            question: 'What is the family\'s explicit long-term vision? Keep it, grow it, or eventually sell?',
            type: 'textarea',
            placeholder: 'Our family intends to...',
            helperText: 'This affects who we bring in and how we develop them.',
          },
          {
            id: 'ownership-vs-operating',
            question: 'For each family member entering, define their scope: ownership, operations, or both?',
            type: 'textarea',
            placeholder: '[Family Member] will have scope of...',
            helperText: 'Not all family members need operating roles; some may be pure owners.',
          },
        ],
      },
      {
        id: 'entry-process',
        title: 'Formal Entry Process',
        description: 'How will family members properly join?',
        exercises: [
          {
            id: 'entry-criteria',
            question: 'What criteria must be met to enter the business? (Education, outside work, values alignment)',
            type: 'textarea',
            placeholder: 'To enter the business, family members must...',
            helperText: 'Outside work experience highly recommended. Educational requirements. Values fit.',
          },
          {
            id: 'role-design',
            question: 'How will roles be designed? Based on qualifications or family position?',
            type: 'textarea',
            placeholder: 'Roles will be designed based on...',
            helperText: 'Roles should match business need and individual capability, not birthright.',
          },
          {
            id: 'onboarding',
            question: 'What does a formal onboarding process look like?',
            type: 'textarea',
            placeholder: 'New family members will be onboarded through...',
            helperText: 'Family history, governance orientation, stakeholder meetings, apprenticeship period.',
          },
        ],
      },
      {
        id: 'development-and-readiness',
        title: 'Development & Readiness Assessment',
        description: 'How will you develop and assess readiness?',
        exercises: [
          {
            id: 'education-path',
            question: 'What education and development path is expected?',
            type: 'textarea',
            placeholder: 'Family members should have...',
            helperText: 'Finance literacy, governance understanding, industry knowledge, leadership skills.',
          },
          {
            id: 'readiness-milestones',
            question: 'What milestones indicate readiness for increased responsibility?',
            type: 'textarea',
            placeholder: 'Readiness milestones include...',
            helperText: 'Time in role, peer feedback, mentor evaluation, demonstrated competence.',
          },
        ],
      },
      {
        id: 'married-ins-and-exit',
        title: 'Married-Ins, Divorce & Exit',
        description: 'How will you handle these sensitive transitions?',
        exercises: [
          {
            id: 'married-ins',
            question: 'How will married-ins be integrated? What rights and roles do they have?',
            type: 'textarea',
            placeholder: 'Married-ins will be...',
            helperText: 'Equal treatment or different treatment? What if marriage ends?',
          },
          {
            id: 'exit-process',
            question: 'If someone leaves (voluntarily or otherwise), what is the process?',
            type: 'textarea',
            placeholder: 'Exit process includes...',
            helperText: 'Ownership redemption, role transition, knowledge transfer, relationship preservation.',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Family Transition & Integration Policy',
      description: 'A comprehensive policy for entry, development, and exit of family members.',
    },
  },
};

const NEXTGEN_DEV_MODULE_CONTENT = {
  'nextgen-dev': {
    title: 'Next-Generation Development',
    subtitle: 'Prepare rising generations through exposure, education, mentorship, and leadership readiness',
    estimatedTime: '90-120 minutes',
    sections: [
      {
        id: 'early-exposure',
        title: 'Early Exposure & Family Business Education',
        description: 'How will next-gen learn about the enterprise?',
        exercises: [
          {
            id: 'exposure-activities',
            question: 'What activities will expose next-gen to the business from early on?',
            type: 'textarea',
            placeholder: 'Next-gen exposure includes...',
            helperText: 'Family business events, facility tours, stakeholder meetings, summer work.',
          },
          {
            id: 'business-education',
            question: 'What formal education is recommended or required?',
            type: 'textarea',
            placeholder: 'We encourage next-gen to pursue...',
            helperText: 'Business school, accounting, engineering, or industry-specific education.',
          },
        ],
      },
      {
        id: 'outside-work',
        title: 'Outside Work Experience',
        description: 'Is outside experience required?',
        exercises: [
          {
            id: 'outside-requirement',
            question: 'Should next-gen work outside the family business first? For how long?',
            type: 'textarea',
            placeholder: 'Outside work experience is...',
            helperText: 'Highly recommended 3-5 years to build skills, networks, and credibility independent of family name.',
          },
        ],
      },
      {
        id: 'mentorship-and-governance',
        title: 'Mentorship & Governance Participation',
        description: 'How will next-gen be mentored and involved in governance?',
        exercises: [
          {
            id: 'mentoring-structure',
            question: 'What mentoring relationships will be established?',
            type: 'textarea',
            placeholder: 'Mentoring will include...',
            helperText: 'Family mentors AND external mentors. One-on-one and peer group mentoring.',
          },
          {
            id: 'governance-participation',
            question: 'How will next-gen participate in governance early on?',
            type: 'textarea',
            placeholder: 'Next-gen will participate through...',
            helperText: 'Junior advisory board, family council participation, observation rights, committee service.',
          },
        ],
      },
      {
        id: 'emotional-preparation',
        title: 'Emotional & Psychological Preparation',
        description: 'How will you prepare next-gen for family dynamics?',
        exercises: [
          {
            id: 'family-dynamics-prep',
            question: 'How will next-gen understand and navigate family dynamics?',
            type: 'textarea',
            placeholder: 'We help next-gen navigate dynamics by...',
            helperText: 'Open conversations, family therapy, external coaching, mentoring.',
          },
          {
            id: 'legacy-expectations',
            question: 'How will you help next-gen develop their own identity separate from family legacy?',
            type: 'textarea',
            placeholder: 'We support individual identity by...',
            helperText: 'Encouraging independent thought, supporting divergent paths, building confidence.',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Next-Generation Development Program',
      description: 'A comprehensive program for exposing, educating, and developing next-gen leaders.',
    },
  },
};

const OWNERSHIP_MODULE_CONTENT = {
  'ownership': {
    title: 'Ownership Structure & Rights',
    subtitle: 'Define who owns what, transfer mechanisms, control transition, liquidity, and exit rights',
    estimatedTime: '120-150 minutes',
    sections: [
      {
        id: 'current-structure',
        title: 'Current Ownership Mapping',
        description: 'What is the actual ownership structure today?',
        exercises: [
          {
            id: 'ownership-map',
            question: 'Map current ownership: who owns what percentage, what type of equity, with what rights?',
            type: 'textarea',
            placeholder: '[Family Member]: [%] ownership, [type], [specific rights]',
            helperText: 'Voting vs. non-voting, preferred vs. common, with what control and veto rights.',
          },
          {
            id: 'implicit-promises',
            question: 'Are there any informal promises or expectations about future ownership that need to be addressed?',
            type: 'textarea',
            placeholder: 'Informal expectations include...',
            helperText: 'Often a source of conflict if not surfaced and explicitly addressed.',
          },
        ],
      },
      {
        id: 'transfer-mechanism',
        title: 'Ownership Transfer Mechanism',
        description: 'How will ownership be transferred?',
        exercises: [
          {
            id: 'transfer-intent',
            question: 'What is the senior generation\'s explicit intent for ownership transfer? To whom, when, and how?',
            type: 'textarea',
            placeholder: 'Our intent for ownership transfer is...',
            helperText: 'Name intended recipients and approximate timeline.',
          },
          {
            id: 'transfer-method',
            question: 'What method will be used? Gifting, sale, trust transfer, gradual shift?',
            type: 'textarea',
            placeholder: 'Ownership will transfer through...',
            helperText: 'Gifting, buy-sell, put/call options, gradualization of control.',
          },
        ],
      },
      {
        id: 'control-transition',
        title: 'Control Transition',
        description: 'How will operating control shift?',
        exercises: [
          {
            id: 'control-plan',
            question: 'How will operating control progressively transition to the next generation?',
            type: 'textarea',
            placeholder: 'Control will transition through...',
            helperText: 'Defined milestones, veto rights retained, increasing operational authority.',
          },
          {
            id: 'emotional-barriers',
            question: 'What emotional barriers exist to ownership transfer? (Fear of losing control, trust issues)',
            type: 'textarea',
            placeholder: 'Emotional barriers include...',
            helperText: 'Acknowledging these is the first step to addressing them.',
          },
        ],
      },
      {
        id: 'liquidity-and-exit',
        title: 'Liquidity & Exit Rights',
        description: 'What happens if a shareholder wants out?',
        exercises: [
          {
            id: 'liquidity-mechanism',
            question: 'What liquidity mechanisms exist for shareholders who want to exit?',
            type: 'textarea',
            placeholder: 'Liquidity options include...',
            helperText: 'Redemption policy, put rights, dividend policy, forced sale mechanism.',
          },
          {
            id: 'valuation',
            question: 'How will the business be valued for these transactions?',
            type: 'textarea',
            placeholder: 'Valuation method is...',
            helperText: 'Fair market value, formula approach, appraiser determination, negotiated.',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Ownership Structure & Transfer Plan',
      description: 'A detailed map of ownership today and a plan for intentional transfer across generations.',
    },
  },
};

const GOVERNANCE_MODULE_CONTENT = {
  'governance': {
    title: 'Governance Architecture',
    subtitle: 'Design the board, family council, family constitution, and evolving governance structures',
    estimatedTime: '120-150 minutes',
    sections: [
      {
        id: 'governance-bodies',
        title: 'Governance Bodies',
        description: 'What governance structures will you establish?',
        exercises: [
          {
            id: 'board-design',
            question: 'Will you have a board? What type (fiduciary, advisory, family council)?',
            type: 'textarea',
            placeholder: 'Our governance will include...',
            helperText: 'Fiduciary board (legal responsibility), Advisory board (advice only), Family council (family focus).',
          },
          {
            id: 'composition',
            question: 'Who will serve on each body? Family, non-family, inside, outside?',
            type: 'textarea',
            placeholder: 'Board composition will be...',
            helperText: 'Independent directors bring outside perspective and credibility.',
          },
        ],
      },
      {
        id: 'family-council',
        title: 'Family Council Structure',
        description: 'How will the family have voice separate from the business?',
        exercises: [
          {
            id: 'council-role',
            question: 'What will the family council be responsible for?',
            type: 'textarea',
            placeholder: 'Family council will handle...',
            helperText: 'Family policies, values, next-gen education, conflict resolution, philanthropy.',
          },
          {
            id: 'council-composition',
            question: 'Who will be on the family council and how will they be selected?',
            type: 'textarea',
            placeholder: 'Family council will consist of...',
            helperText: 'All adult family members or elected representatives.',
          },
        ],
      },
      {
        id: 'constitution',
        title: 'Family Constitution',
        description: 'Will you document governance principles?',
        exercises: [
          {
            id: 'constitution-content',
            question: 'What should be included in a family constitution?',
            type: 'textarea',
            placeholder: 'Constitution will address...',
            helperText: 'Vision, values, family policies, ownership principles, governance structure, conflict resolution.',
          },
        ],
      },
      {
        id: 'evolution',
        title: 'Governance Evolution',
        description: 'How will governance change as the family grows?',
        exercises: [
          {
            id: 'complexity-planning',
            question: 'How will governance structure change as ownership disperses and family grows?',
            type: 'textarea',
            placeholder: 'As family/ownership grows, governance will evolve to...',
            helperText: 'From founder-led to board-led, from few owners to many, from one generation to several.',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Family Governance Architecture',
      description: 'A comprehensive governance structure including board design, family council, and constitution.',
    },
  },
};

const DECISIONS_MODULE_CONTENT = {
  'decisions': {
    title: 'Decision-Making & Conflict Resolution',
    subtitle: 'Map decision rights, build resolution mechanisms, and break destructive family patterns',
    estimatedTime: '120-150 minutes',
    sections: [
      {
        id: 'decision-mapping',
        title: 'Decision Rights Mapping',
        description: 'Who decides what?',
        exercises: [
          {
            id: 'current-reality',
            question: 'How are major decisions actually made today? Who has real power?',
            type: 'textarea',
            placeholder: 'Currently, decisions are made by...',
            helperText: 'Often different from formal structures. Be honest about informal power.',
          },
          {
            id: 'decision-levels',
            question: 'Define decision rights by level: ownership decisions, board decisions, management decisions, family decisions',
            type: 'textarea',
            placeholder: 'Ownership (who owns decides): ...\nBoard (board decides): ...',
            helperText: 'Strategic direction, major investments, CEO hiring, family policies, asset sales.',
          },
        ],
      },
      {
        id: 'patterns-and-dysfunction',
        title: 'Family Patterns & Decision Dysfunction',
        description: 'What destructive patterns affect decisions?',
        exercises: [
          {
            id: 'dysfunctional-patterns',
            question: 'What patterns show up in family decision-making? (Dominance, avoidance, triangulation, alliances)',
            type: 'textarea',
            placeholder: 'Destructive patterns include...',
            helperText: 'One person dominates. Some voices never heard. Decisions made in private then announced.',
          },
          {
            id: 'genogram-influence',
            question: 'How do family genogram patterns (relationships, history, roles) influence decisions?',
            type: 'textarea',
            placeholder: 'Relational patterns influence decisions when...',
            helperText: 'Example: If there\'s mistrust of a family member, their ideas are dismissed.',
          },
          {
            id: 'breaking-patterns',
            question: 'What will you commit to change about decision-making patterns?',
            type: 'textarea',
            placeholder: 'We will break patterns by...',
            helperText: 'Structured processes, external facilitation, psychological safety, formal voice mechanisms.',
          },
        ],
      },
      {
        id: 'conflict-resolution',
        title: 'Conflict Resolution Mechanisms',
        description: 'How will disagreements be handled?',
        exercises: [
          {
            id: 'early-surfacing',
            question: 'How will you identify and surface conflicts early before they harden?',
            type: 'textarea',
            placeholder: 'Early surfacing will happen through...',
            helperText: 'Regular family meetings, open feedback, trust, safe forum for disagreement.',
          },
          {
            id: 'resolution-process',
            question: 'What is your conflict resolution process? (Direct conversation, mediation, arbitration, voting)',
            type: 'textarea',
            placeholder: 'Conflict resolution will follow...',
            helperText: 'Step 1: Direct conversation. Step 2: Facilitation. Step 3: Arbitration.',
          },
          {
            id: 'nuclear_option',
            question: 'What is the "nuclear option" if fundamental disagreement occurs? (Buyout, forced sale, dissolution)',
            type: 'textarea',
            placeholder: 'If irresolvable conflict occurs, we will...',
            helperText: 'Buyout, put/call options, forced sale to third party.',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Decision-Making & Conflict Resolution Framework',
      description: 'A clear map of decision rights and a proven process for resolving conflicts.',
    },
  },
};

const ROLES_MODULE_CONTENT = {
  'roles': {
    title: 'Roles, Responsibilities & Family Employment',
    subtitle: 'Clarify who does what across family, business, and ownership — with formal employment policies',
    estimatedTime: '90-120 minutes',
    sections: [
      {
        id: 'role-clarity',
        title: 'Role Clarity',
        description: 'Does everyone know what role they play?',
        exercises: [
          {
            id: 'three-circles',
            question: 'For each family member, define their role in the family, business, and ownership circles',
            type: 'textarea',
            placeholder: '[Family Member] - Family: [role], Business: [role/position], Ownership: [role]',
            helperText: 'Not all family members need to be in all circles.',
          },
        ],
      },
      {
        id: 'employment-policy',
        title: 'Family Employment Policy',
        description: 'What are the rules for family working in the business?',
        exercises: [
          {
            id: 'employment-criteria',
            question: 'What criteria must be met to be employed in the family business?',
            type: 'textarea',
            placeholder: 'Employment criteria include...',
            helperText: 'Education, outside work experience, interview process, values alignment.',
          },
          {
            id: 'performance-standards',
            question: 'Will family employees be held to the same performance standards as non-family?',
            type: 'textarea',
            placeholder: 'Performance standards will be...',
            helperText: 'Yes, and documented. This builds credibility with non-family staff.',
          },
          {
            id: 'reporting',
            question: 'What are reporting relationships? Can a family member report to another family member?',
            type: 'textarea',
            placeholder: 'Reporting relationships will be...',
            helperText: 'Consider conflicts and perception issues.',
          },
        ],
      },
      {
        id: 'in_laws_and_spouses',
        title: 'In-Laws & Spouses',
        description: 'What policy for spouses and married-ins working in the business?',
        exercises: [
          {
            id: 'married_in_policy',
            question: 'Can spouses and married-ins work in the business? Under what conditions?',
            type: 'textarea',
            placeholder: 'In-law employment policy is...',
            helperText: 'Same standards, special approval, business need requirement.',
          },
        ],
      },
      {
        id: 'underperformance',
        title: 'Addressing Underperformance',
        description: 'What happens if a family member is underperforming?',
        exercises: [
          {
            id: 'underperformance_process',
            question: 'What is the process for addressing underperformance? Can they be fired?',
            type: 'textarea',
            placeholder: 'Underperformance process includes...',
            helperText: 'Clear expectations, feedback, improvement plan, then termination if needed.',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Family Employment & Roles Policy',
      description: 'A clear policy defining roles, employment criteria, and expectations for family in the business.',
    },
  },
};

const COMPENSATION_MODULE_CONTENT = {
  'compensation': {
    title: 'Compensation & Benefits',
    subtitle: 'Define how family members are paid, distribution policies, and transparency practices',
    estimatedTime: '90-120 minutes',
    sections: [
      {
        id: 'compensation-philosophy',
        title: 'Compensation Philosophy',
        description: 'What principles guide family member compensation?',
        exercises: [
          {
            id: 'philosophy',
            question: 'What is your philosophy on family member compensation?',
            type: 'textarea',
            placeholder: 'Our compensation philosophy is...',
            helperText: 'Market-based? Equal? Performance-based? Needs-based?',
          },
          {
            id: 'benchmarking',
            question: 'Will family member salaries be benchmarked against market rates for their role?',
            type: 'textarea',
            placeholder: 'Benchmarking will be...',
            helperText: 'Highly recommended to ensure credibility with non-family staff.',
          },
        ],
      },
      {
        id: 'distribution-policy',
        title: 'Distribution Policy',
        description: 'How are profits distributed to shareholders?',
        exercises: [
          {
            id: 'distribution_philosophy',
            question: 'What is your approach to distributing profits to shareholders?',
            type: 'textarea',
            placeholder: 'Distribution approach is...',
            helperText: 'Dividend policy, discretionary, tied to performance, reinvestment vs. payout.',
          },
          {
            id: 'fairness_for_non_working',
            question: 'How do you ensure fairness between family members who work in the business vs. those who don\'t?',
            type: 'textarea',
            placeholder: 'We ensure fairness by...',
            helperText: 'Equal distributions, separate compensation for work, transparency.',
          },
        ],
      },
      {
        id: 'transparency',
        title: 'Compensation Transparency',
        description: 'Will compensation be transparent?',
        exercises: [
          {
            id: 'transparency_level',
            question: 'What level of compensation transparency will exist within the family?',
            type: 'textarea',
            placeholder: 'Transparency will include...',
            helperText: 'No transparency, summary only, or full disclosure. More transparency = more trust.',
          },
        ],
      },
      {
        id: 'benefits_and_perks',
        title: 'Benefits & Perquisites',
        description: 'How will benefits and perks be handled?',
        exercises: [
          {
            id: 'perks',
            question: 'Are there company perks (cars, housing, club memberships)? Who gets them and why?',
            type: 'textarea',
            placeholder: 'Perquisites include...',
            helperText: 'Document who gets what to avoid resentment.',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Compensation & Distribution Policy',
      description: 'A transparent policy governing compensation for working family members and distributions to all shareholders.',
    },
  },
};

const PROFESSIONALIZE_MODULE_CONTENT = {
  'professionalize': {
    title: 'Non-Family Leadership & Professionalizing',
    subtitle: 'Engage non-family talent and transition from founder-led to professionally managed',
    estimatedTime: '90-120 minutes',
    sections: [
      {
        id: 'non_family_leadership',
        title: 'Non-Family Executive Strategy',
        description: 'How will you engage professional non-family leaders?',
        exercises: [
          {
            id: 'current_structure',
            question: 'What non-family executives currently lead the business?',
            type: 'textarea',
            placeholder: 'Current non-family leadership includes...',
            helperText: 'CEO, CFO, COO, department heads.',
          },
          {
            id: 'succession_path',
            question: 'Is there a path for the next non-family CEO? What would need to happen?',
            type: 'textarea',
            placeholder: 'A non-family CEO could take over if...',
            helperText: 'Succession readiness, family alignment, board support.',
          },
        ],
      },
      {
        id: 'talent_retention',
        title: 'Talent Retention & Engagement',
        description: 'How will you retain key non-family talent?',
        exercises: [
          {
            id: 'retention_risks',
            question: 'What risks do non-family leaders face that could cause them to leave?',
            type: 'textarea',
            placeholder: 'Retention risks include...',
            helperText: 'Uncertainty about succession, family interference, limited advancement.',
          },
          {
            id: 'retention_strategy',
            question: 'What will you do to make non-family leaders feel secure and valued?',
            type: 'textarea',
            placeholder: 'Retention strategy includes...',
            helperText: 'Clear path forward, transparency, autonomy, competitive pay, equity plans.',
          },
        ],
      },
      {
        id: 'professional_practices',
        title: 'Professional Business Practices',
        description: 'How will you professionalize the business?',
        exercises: [
          {
            id: 'practices',
            question: 'What professional practices need to be implemented? (Financial reporting, strategic planning, HR)',
            type: 'textarea',
            placeholder: 'Professionalization will include...',
            helperText: 'FP&A, strategic planning, formal HR, board governance, external audit.',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Professional Leadership & Transition Plan',
      description: 'A strategy for engaging professional leadership and transitioning the business from founder-led to professionally managed.',
    },
  },
};

const SUCCESSION_MODULE_CONTENT = {
  'succession': {
    title: 'Succession Planning',
    subtitle: 'Plan intentional transitions of leadership, ownership, and authority across generations',
    estimatedTime: '120-150 minutes',
    sections: [
      {
        id: 'successor_identification',
        title: 'Successor Identification',
        description: 'Who will lead next?',
        exercises: [
          {
            id: 'next_leader',
            question: 'Who is the intended successor for the CEO role? Is this explicit or assumed?',
            type: 'textarea',
            placeholder: 'Our intended CEO successor is...',
            helperText: 'Be explicit. Don\'t assume. The lack of clarity creates huge problems.',
          },
          {
            id: 'family_vs_nonfamily',
            question: 'Is your preference for a family member or would a non-family CEO be acceptable?',
            type: 'textarea',
            placeholder: 'Our preference is...',
            helperText: 'Be honest. What matters most: family legacy or business continuity?',
          },
          {
            id: 'selection_criteria',
            question: 'What criteria will be used to select the successor?',
            type: 'textarea',
            placeholder: 'Selection criteria include...',
            helperText: 'Business acumen, values alignment, stakeholder relationships, leadership ability, age/readiness.',
          },
        ],
      },
      {
        id: 'development_plan',
        title: 'Successor Development',
        description: 'How will the successor be prepared?',
        exercises: [
          {
            id: 'development_activities',
            question: 'What development activities are planned for the successor?',
            type: 'textarea',
            placeholder: 'Successor development includes...',
            helperText: 'Mentoring, stretch assignments, executive education, exposure to stakeholders.',
          },
          {
            id: 'timeline',
            question: 'What is the realistic timeline for transition? (3-5 years is typical)',
            type: 'textarea',
            placeholder: 'Our transition timeline is...',
            helperText: 'Gradual transitions work better than sudden changes.',
          },
        ],
      },
      {
        id: 'emotional_transition',
        title: 'Emotional & Identity Transition',
        description: 'What does succession mean for the current leader?',
        exercises: [
          {
            id: 'current_leader_process',
            question: 'Has the current leader emotionally processed what succession means for their identity and role?',
            type: 'textarea',
            placeholder: 'The current leader will need to...',
            helperText: 'Find new meaning beyond the CEO role. Define post-succession involvement.',
          },
          {
            id: 'incoming_leader_readiness',
            question: 'Is the incoming leader fully prepared and supported emotionally?',
            type: 'textarea',
            placeholder: 'The incoming leader needs...',
            helperText: 'Confidence, family support, credibility with non-family staff.',
          },
        ],
      },
      {
        id: 'contingency',
        title: 'Contingency Planning',
        description: 'What if the plan changes?',
        exercises: [
          {
            id: 'contingency_plans',
            question: 'What is your contingency plan if the intended successor cannot or will not serve?',
            type: 'textarea',
            placeholder: 'Backup successors are...',
            helperText: 'Have a backup. Have an external search option.',
          },
          {
            id: 'emergency_succession',
            question: 'Do you have an emergency succession plan if something happens to the current leader tomorrow?',
            type: 'textarea',
            placeholder: 'Emergency succession would involve...',
            helperText: 'Interim leadership, temporary decision authority, then formal search.',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Leadership Succession Plan',
      description: 'A detailed plan for intentional leadership transition including successor development and contingency planning.',
    },
  },
};

const STRATEGY_MODULE_CONTENT = {
  'strategy': {
    title: 'Family Enterprise Strategy',
    subtitle: 'Set ownership-level strategic direction — growth, risk, capital allocation, and family-business balance',
    estimatedTime: '120-150 minutes',
    sections: [
      {
        id: 'strategic_direction',
        title: 'Strategic Direction',
        description: 'What is the ownership\'s vision for the business?',
        exercises: [
          {
            id: 'growth_vs_stability',
            question: 'Is the family\'s intent to grow the business, maintain stability, or eventually exit?',
            type: 'textarea',
            placeholder: 'Our strategic intent is to...',
            helperText: 'Aggressive growth, steady state, harvest, or build-to-sell.',
          },
          {
            id: 'ten_year_vision',
            question: 'Where should the enterprise be in 10 years?',
            type: 'textarea',
            placeholder: 'In 10 years, we want to be...',
            helperText: 'Size, markets, products, family involvement.',
          },
        ],
      },
      {
        id: 'risk_and_capital',
        title: 'Risk Tolerance & Capital Allocation',
        description: 'How much risk and investment are you willing to take?',
        exercises: [
          {
            id: 'risk_tolerance',
            question: 'What is the family\'s risk tolerance? Conservative, moderate, or aggressive?',
            type: 'textarea',
            placeholder: 'Our risk tolerance is...',
            helperText: 'This affects investment decisions, market expansion, leverage.',
          },
          {
            id: 'capital_allocation',
            question: 'How should profits be allocated? Reinvestment vs. distributions?',
            type: 'textarea',
            placeholder: 'Capital allocation will be...',
            helperText: 'Growth investments, debt paydown, shareholder distributions.',
          },
        ],
      },
      {
        id: 'family_business_tension',
        title: 'Family vs. Business Needs',
        description: 'When they conflict, how will you decide?',
        exercises: [
          {
            id: 'conflict_framework',
            question: 'When family needs and business needs conflict, what framework will guide decisions?',
            type: 'textarea',
            placeholder: 'We will navigate conflicts by...',
            helperText: 'Example: If a family member wants a distribution but business needs investment.',
          },
        ],
      },
      {
        id: 'strategic_decisions',
        title: 'Strategic Decision-Making',
        description: 'Who makes strategic decisions?',
        exercises: [
          {
            id: 'decision_process',
            question: 'What is the process for making major strategic decisions?',
            type: 'textarea',
            placeholder: 'Strategic decisions will be made by...',
            helperText: 'Ownership group, board, management. Who initiates, advises, decides?',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Family Enterprise Strategic Plan',
      description: 'A document articulating the ownership\'s strategic vision, risk tolerance, and decision process.',
    },
  },
};

const ESTATE_MODULE_CONTENT = {
  'estate': {
    title: 'Estate Planning & Wealth Transfer',
    subtitle: 'Align wealth transfer structures with family values and succession plans',
    estimatedTime: '120-150 minutes',
    sections: [
      {
        id: 'wealth_transfer_vision',
        title: 'Wealth Transfer Vision',
        description: 'What is the family\'s vision for wealth transfer?',
        exercises: [
          {
            id: 'transfer_vision',
            question: 'Describe your vision for wealth transfer across generations. To whom, when, how much?',
            type: 'textarea',
            placeholder: 'Our wealth transfer vision is...',
            helperText: 'Consider equal vs. unequal, business vs. liquid assets, timing.',
          },
          {
            id: 'emotional_barriers',
            question: 'What emotional barriers exist around estate planning and mortality?',
            type: 'textarea',
            placeholder: 'Emotional barriers include...',
            helperText: 'Fear, avoidance, guilt, concerns about preparedness of heirs.',
          },
        ],
      },
      {
        id: 'legal_structures',
        title: 'Legal & Tax Structures',
        description: 'What structures will you use?',
        exercises: [
          {
            id: 'structures',
            question: 'What legal structures are planned? (Trusts, holding companies, partnerships, foundations)',
            type: 'textarea',
            placeholder: 'Our estate structures will include...',
            helperText: 'Revocable trust, irrevocable trusts, FLP, C-corp, family partnership.',
          },
          {
            id: 'advisor_team',
            question: 'Who is on your advisor team? (Attorney, CPA, financial advisor)',
            type: 'textarea',
            placeholder: 'Our advisor team includes...',
            helperText: 'Coordinate across advisors to align estate and business plans.',
          },
        ],
      },
      {
        id: 'gifting_strategy',
        title: 'Gifting & Transfer Strategy',
        description: 'How will transfer happen?',
        exercises: [
          {
            id: 'gifting_plan',
            question: 'Will you use annual gifts, lifetime gifts, or testamentary transfers?',
            type: 'textarea',
            placeholder: 'Our gifting strategy is...',
            helperText: 'Annual exclusions, lifetime gift tax exemption, discount strategies.',
          },
          {
            id: 'equalization',
            question: 'How will you handle equalization for heirs with different involvement in the business?',
            type: 'textarea',
            placeholder: 'We will address equalization by...',
            helperText: 'Some heirs get business, others get liquid assets of equal value.',
          },
        ],
      },
      {
        id: 'family_alignment',
        title: 'Family Alignment & Transparency',
        description: 'Have you communicated the plan?',
        exercises: [
          {
            id: 'communication',
            question: 'Do heirs understand the estate plan and how it affects them?',
            type: 'textarea',
            placeholder: 'Communication about the plan includes...',
            helperText: 'Consider family meeting where plan is explained.',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Estate Planning & Wealth Transfer Strategy',
      description: 'A comprehensive plan for transferring wealth and business across generations aligned with family values.',
    },
  },
};

const PHILANTHROPY_MODULE_CONTENT = {
  'philanthropy': {
    title: 'Philanthropy & Social Impact',
    subtitle: 'Connect family giving to enterprise values and next-generation engagement',
    estimatedTime: '90-120 minutes',
    sections: [
      {
        id: 'giving_philosophy',
        title: 'Giving Philosophy',
        description: 'What guides your family\'s philanthropy?',
        exercises: [
          {
            id: 'mission',
            question: 'What is your family\'s philanthropic mission or purpose?',
            type: 'textarea',
            placeholder: 'Our philanthropic mission is...',
            helperText: 'Aligned with family values and enterprise identity.',
          },
          {
            id: 'causes',
            question: 'What causes or impact areas matter most to your family?',
            type: 'textarea',
            placeholder: 'We focus on...',
            helperText: 'Education, health, poverty, environment, arts, workforce development.',
          },
        ],
      },
      {
        id: 'structure_and_governance',
        title: 'Structure & Governance',
        description: 'How will philanthropy be organized?',
        exercises: [
          {
            id: 'structure',
            question: 'What philanthropic vehicle will you use?',
            type: 'select',
            options: ['Family Foundation', 'Donor-Advised Fund', 'Direct Giving', 'Social Enterprise'],
          },
          {
            id: 'governance',
            question: 'Who will govern philanthropic decisions?',
            type: 'textarea',
            placeholder: 'Governance will involve...',
            helperText: 'Family foundation board, grants committee, professional staff.',
          },
        ],
      },
      {
        id: 'next_gen_engagement',
        title: 'Next-Gen Engagement',
        description: 'How will philanthropy develop the next generation?',
        exercises: [
          {
            id: 'engagement',
            question: 'How will next-gen family members be involved in philanthropic decisions?',
            type: 'textarea',
            placeholder: 'Next-gen will be involved through...',
            helperText: 'Committee service, site visits, grantee meetings, voting.',
          },
        ],
      },
      {
        id: 'impact_measurement',
        title: 'Impact & Alignment',
        description: 'How will you measure impact and ensure alignment with values?',
        exercises: [
          {
            id: 'impact',
            question: 'How will you measure philanthropic impact?',
            type: 'textarea',
            placeholder: 'Impact measurement includes...',
            helperText: 'Grants awarded, lives impacted, community outcomes.',
          },
          {
            id: 'business_alignment',
            question: 'How does family philanthropy connect to the enterprise and its values?',
            type: 'textarea',
            placeholder: 'Alignment is reflected in...',
            helperText: 'Community where business operates, values reflected in giving.',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Family Philanthropy Strategy',
      description: 'A comprehensive approach to family giving aligned with values and next-generation engagement.',
    },
  },
};

// Merge all module content into one object
const ALL_MODULE_CONTENT = {
  ...SHARED_PURPOSE_MODULE_CONTENT,
  ...FAMILY_DYNAMICS_MODULE_CONTENT,
  ...COMMUNICATION_MODULE_CONTENT,
  ...TRANSITIONS_MODULE_CONTENT,
  ...NEXTGEN_DEV_MODULE_CONTENT,
  ...OWNERSHIP_MODULE_CONTENT,
  ...GOVERNANCE_MODULE_CONTENT,
  ...DECISIONS_MODULE_CONTENT,
  ...ROLES_MODULE_CONTENT,
  ...COMPENSATION_MODULE_CONTENT,
  ...PROFESSIONALIZE_MODULE_CONTENT,
  ...SUCCESSION_MODULE_CONTENT,
  ...STRATEGY_MODULE_CONTENT,
  ...ESTATE_MODULE_CONTENT,
  ...PHILANTHROPY_MODULE_CONTENT,
};

// ═══════════════════════════════════════════════════════════════
// AI DOCUMENT GENERATION
// ═══════════════════════════════════════════════════════════════

const DOCUMENT_PROMPTS = {
  'shared-purpose': `You are a family enterprise consultant. Create a Family Purpose & Values Statement from the responses below. Include founding story, core values with definitions and examples, and stewardship philosophy. Use first person plural. Keep concise.

RESPONSES:
`,
  'family-dynamics': `You are a family enterprise consultant. Create a Family Dynamics Assessment from the responses below. Describe family structure, relationship patterns, emotional dynamics, and generational patterns. Professional, compassionate tone. Keep concise.

RESPONSES:
`,
  'communication': `You are a family enterprise consultant. Create a Family Communication Plan from the responses below. Cover meeting structures, agendas, facilitation, and process for difficult conversations. Keep concise.

RESPONSES:
`,
  'transitions': `You are a family enterprise consultant. Create a Family Transition & Integration Policy from the responses below. Cover entry criteria, onboarding, development, assessment, and exit processes. Keep concise.

RESPONSES:
`,
  'nextgen-dev': `You are a family enterprise consultant. Create a Next Generation Development Program from the responses below. Cover education, outside experience, mentorship, and governance participation. Keep concise.

RESPONSES:
`,
  'ownership': `You are a family enterprise consultant. Create an Ownership Structure & Transfer Plan from the responses below. Cover current ownership, transfer intent, mechanisms, and control transition. Keep concise.

RESPONSES:
`,
  'governance': `You are a family enterprise consultant. Create a Family Governance Architecture document from the responses below. Cover governance bodies, family council, composition, constitution, and evolution planning. Keep concise.

RESPONSES:
`,
  'decisions': `You are a family enterprise consultant. Create a Decision-Making & Conflict Resolution Framework from the responses below. Cover decision rights mapping, family patterns, conflict resolution processes, and nuclear options. Keep concise.

RESPONSES:
`,
  'roles': `You are a family enterprise consultant. Create a Family Employment & Roles Policy from the responses below. Cover role clarity, employment criteria, performance standards, and underperformance process. Keep concise.

RESPONSES:
`,
  'compensation': `You are a family enterprise consultant. Create a Compensation & Distribution Policy from the responses below. Cover compensation philosophy, benchmarking, distribution approach, and transparency. Keep concise.

RESPONSES:
`,
  'professionalize': `You are a family enterprise consultant. Create a Professional Leadership & Transition Plan from the responses below. Cover non-family executives, talent retention, and professionalization strategies. Keep concise.

RESPONSES:
`,
  'succession': `You are a family enterprise consultant. Create a Leadership Succession Plan from the responses below. Cover successor identification, selection criteria, development plan, emotional transition, and contingency planning. Keep concise.

RESPONSES:
`,
  'strategy': `You are a family enterprise consultant. Create a Family Enterprise Strategic Plan from the responses below. Cover strategic direction, risk tolerance, capital allocation, and decision-making process. Keep concise.

RESPONSES:
`,
  'estate': `You are a family enterprise consultant. Create an Estate Planning & Wealth Transfer Strategy from the responses below. Cover transfer vision, legal structures, gifting strategy, and family alignment. Note: requires professional guidance. Keep concise.

RESPONSES:
`,
  'philanthropy': `You are a family enterprise consultant. Create a Family Philanthropy Strategy from the responses below. Cover giving philosophy, causes, structure, governance, next-gen engagement, and impact measurement. Keep concise.

RESPONSES:
`,
};

async function generateDocumentWithAI(moduleId, data) {
  const prompt = DOCUMENT_PROMPTS[moduleId];
  if (!prompt) throw new Error('No prompt template for this module');

  // Format the family's responses based on module type
  let formattedData = '';

  if (moduleId === 'shared-purpose') {
    formattedData = `
FOUNDING STORY:
- Story: ${data['founding-story'] || 'Not provided'}
- Why Together: ${data['why-together'] || 'Not provided'}

CORE VALUES:
- Values: ${data['core-values'] || 'Not provided'}
- In Practice: ${data['values-in-practice'] || 'Not provided'}

STEWARDSHIP:
- Stewardship Approach: ${data['stewardship-approach'] || 'Not provided'}
- Generational Recommitment: ${data['recommitment'] || 'Not provided'}
`;
  } else if (moduleId === 'family-dynamics') {
    formattedData = `
FAMILY STRUCTURE:
- Family Structure: ${data['family-structure'] || 'Not provided'}

RELATIONSHIPS:
- Strong Bonds: ${data['strong-bonds'] || 'Not provided'}
- Tensions: ${data['tensions'] || 'Not provided'}
- Patterns: ${data['patterns'] || 'Not provided'}
- Generational Patterns: ${data['generational-patterns'] || 'Not provided'}

EMOTIONAL HEALTH:
- Safety: ${data['safety'] || 'Not provided'}
- Cutoffs: ${data['cutoffs'] || 'Not provided'}
`;
  } else if (moduleId === 'communication') {
    formattedData = `
MEETING STRUCTURES:
- Meeting Types: ${data['meeting-types'] || 'Not provided'}
- Meeting Cadence: ${data['meeting-cadence'] || 'Not provided'}

AGENDA & PROCESS:
- Agenda Structure: ${data['agenda-structure'] || 'Not provided'}
- Facilitation: ${data['facilitation'] || 'Not provided'}

DIFFICULT TOPICS:
- Difficult Process: ${data['difficult-process'] || 'Not provided'}
- Between-Meeting Process: ${data['between-meetings'] || 'Not provided'}
`;
  } else if (moduleId === 'transitions') {
    formattedData = `
SCOPE:
- Long-Term Vision: ${data['long-term-vision'] || 'Not provided'}
- Scope of Entry: ${data['ownership-vs-operating'] || 'Not provided'}

ENTRY PROCESS:
- Entry Criteria: ${data['entry-criteria'] || 'Not provided'}
- Role Design: ${data['role-design'] || 'Not provided'}
- Onboarding: ${data['onboarding'] || 'Not provided'}

DEVELOPMENT:
- Education Path: ${data['education-path'] || 'Not provided'}
- Readiness Milestones: ${data['readiness-milestones'] || 'Not provided'}

EXIT & SPECIAL CASES:
- Married-Ins: ${data['married-ins'] || 'Not provided'}
- Exit Process: ${data['exit-process'] || 'Not provided'}
`;
  } else if (moduleId === 'nextgen-dev') {
    formattedData = `
EARLY EXPOSURE:
- Exposure Activities: ${data['exposure-activities'] || 'Not provided'}
- Business Education: ${data['business-education'] || 'Not provided'}

OUTSIDE WORK:
- Outside Experience: ${data['outside-requirement'] || 'Not provided'}

MENTORSHIP & GOVERNANCE:
- Mentoring Structure: ${data['mentoring-structure'] || 'Not provided'}
- Governance Participation: ${data['governance-participation'] || 'Not provided'}

EMOTIONAL PREPARATION:
- Family Dynamics: ${data['family-dynamics-prep'] || 'Not provided'}
- Identity Development: ${data['legacy-expectations'] || 'Not provided'}
`;
  } else if (moduleId === 'ownership') {
    formattedData = `
CURRENT STRUCTURE:
- Ownership Map: ${data['ownership-map'] || 'Not provided'}
- Implicit Promises: ${data['implicit-promises'] || 'Not provided'}

TRANSFER MECHANISM:
- Transfer Intent: ${data['transfer-intent'] || 'Not provided'}
- Transfer Method: ${data['transfer-method'] || 'Not provided'}

CONTROL TRANSITION:
- Control Plan: ${data['control-plan'] || 'Not provided'}
- Emotional Barriers: ${data['emotional-barriers'] || 'Not provided'}

LIQUIDITY & EXIT:
- Liquidity Mechanisms: ${data['liquidity-mechanism'] || 'Not provided'}
- Valuation Method: ${data['valuation'] || 'Not provided'}
`;
  } else if (moduleId === 'governance') {
    formattedData = `
GOVERNANCE BODIES:
- Board Design: ${data['board-design'] || 'Not provided'}
- Composition: ${data['composition'] || 'Not provided'}

FAMILY COUNCIL:
- Council Role: ${data['council-role'] || 'Not provided'}
- Council Composition: ${data['council-composition'] || 'Not provided'}

CONSTITUTION:
- Constitution Content: ${data['constitution-content'] || 'Not provided'}

EVOLUTION:
- Governance Evolution: ${data['complexity-planning'] || 'Not provided'}
`;
  } else if (moduleId === 'decisions') {
    formattedData = `
DECISION MAPPING:
- Current Reality: ${data['current-reality'] || 'Not provided'}
- Decision Levels: ${data['decision-levels'] || 'Not provided'}

PATTERNS & DYSFUNCTION:
- Dysfunctional Patterns: ${data['dysfunctional-patterns'] || 'Not provided'}
- Genogram Influence: ${data['genogram-influence'] || 'Not provided'}
- Breaking Patterns: ${data['breaking-patterns'] || 'Not provided'}

CONFLICT RESOLUTION:
- Early Surfacing: ${data['early-surfacing'] || 'Not provided'}
- Resolution Process: ${data['resolution-process'] || 'Not provided'}
- Nuclear Option: ${data['nuclear_option'] || 'Not provided'}
`;
  } else if (moduleId === 'roles') {
    formattedData = `
ROLE CLARITY:
- Three Circles: ${data['three-circles'] || 'Not provided'}

EMPLOYMENT POLICY:
- Employment Criteria: ${data['employment-criteria'] || 'Not provided'}
- Performance Standards: ${data['performance-standards'] || 'Not provided'}
- Reporting: ${data['reporting'] || 'Not provided'}

IN-LAWS & SPOUSES:
- Married-In Policy: ${data['married_in_policy'] || 'Not provided'}

UNDERPERFORMANCE:
- Underperformance Process: ${data['underperformance_process'] || 'Not provided'}
`;
  } else if (moduleId === 'compensation') {
    formattedData = `
PHILOSOPHY:
- Compensation Philosophy: ${data['philosophy'] || 'Not provided'}
- Benchmarking: ${data['benchmarking'] || 'Not provided'}

DISTRIBUTION:
- Distribution Approach: ${data['distribution_philosophy'] || 'Not provided'}
- Fairness: ${data['fairness_for_non_working'] || 'Not provided'}

TRANSPARENCY:
- Transparency Level: ${data['transparency_level'] || 'Not provided'}

BENEFITS:
- Perks: ${data['perks'] || 'Not provided'}
`;
  } else if (moduleId === 'professionalize') {
    formattedData = `
NON-FAMILY LEADERSHIP:
- Current Structure: ${data['current_structure'] || 'Not provided'}
- Non-Family CEO Path: ${data['succession_path'] || 'Not provided'}

TALENT RETENTION:
- Retention Risks: ${data['retention_risks'] || 'Not provided'}
- Retention Strategy: ${data['retention_strategy'] || 'Not provided'}

PROFESSIONAL PRACTICES:
- Professionalization: ${data['practices'] || 'Not provided'}
`;
  } else if (moduleId === 'succession') {
    formattedData = `
SUCCESSOR IDENTIFICATION:
- Intended Successor: ${data['next_leader'] || 'Not provided'}
- Family vs. Non-Family: ${data['family_vs_nonfamily'] || 'Not provided'}
- Selection Criteria: ${data['selection_criteria'] || 'Not provided'}

DEVELOPMENT:
- Development Activities: ${data['development_activities'] || 'Not provided'}
- Timeline: ${data['timeline'] || 'Not provided'}

EMOTIONAL TRANSITION:
- Current Leader: ${data['current_leader_process'] || 'Not provided'}
- Incoming Leader: ${data['incoming_leader_readiness'] || 'Not provided'}

CONTINGENCY:
- Contingency Plans: ${data['contingency_plans'] || 'Not provided'}
- Emergency Succession: ${data['emergency_succession'] || 'Not provided'}
`;
  } else if (moduleId === 'strategy') {
    formattedData = `
STRATEGIC DIRECTION:
- Growth Intent: ${data['growth_vs_stability'] || 'Not provided'}
- 10-Year Vision: ${data['ten_year_vision'] || 'Not provided'}

RISK & CAPITAL:
- Risk Tolerance: ${data['risk_tolerance'] || 'Not provided'}
- Capital Allocation: ${data['capital_allocation'] || 'Not provided'}

FAMILY VS BUSINESS:
- Conflict Framework: ${data['conflict_framework'] || 'Not provided'}

STRATEGIC DECISIONS:
- Decision Process: ${data['decision_process'] || 'Not provided'}
`;
  } else if (moduleId === 'estate') {
    formattedData = `
WEALTH TRANSFER VISION:
- Transfer Vision: ${data['transfer_vision'] || 'Not provided'}
- Emotional Barriers: ${data['emotional_barriers'] || 'Not provided'}

LEGAL & TAX STRUCTURES:
- Structures: ${data['structures'] || 'Not provided'}
- Advisor Team: ${data['advisor_team'] || 'Not provided'}

GIFTING STRATEGY:
- Gifting Plan: ${data['gifting_plan'] || 'Not provided'}
- Equalization: ${data['equalization'] || 'Not provided'}

FAMILY ALIGNMENT:
- Communication: ${data['communication'] || 'Not provided'}
`;
  } else if (moduleId === 'philanthropy') {
    formattedData = `
GIVING PHILOSOPHY:
- Philanthropic Mission: ${data['mission'] || 'Not provided'}
- Causes: ${data['causes'] || 'Not provided'}

STRUCTURE & GOVERNANCE:
- Structure: ${data['structure'] || 'Not provided'}
- Governance: ${data['governance'] || 'Not provided'}

NEXT-GEN ENGAGEMENT:
- Engagement: ${data['engagement'] || 'Not provided'}

IMPACT & ALIGNMENT:
- Impact Measurement: ${data['impact'] || 'Not provided'}
- Business Alignment: ${data['business_alignment'] || 'Not provided'}
`;
  }

  const fullPrompt = prompt + formattedData;

  // Call Netlify function (which proxies to Claude API)
  const response = await fetch('/.netlify/functions/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [
        { role: 'user', content: fullPrompt }
      ],
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate document');
  }

  const result = await response.json();
  return result.content[0].text;
}

function parseNarrativeToDocx(narrative, title) {
  const lines = narrative.split('\n').filter(line => line.trim());
  const children = [];

  // Title
  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Date
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Prepared: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
          italics: true,
          size: 22,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    })
  );

  // Process content
  for (const line of lines) {
    const trimmed = line.trim();

    // Check if it's a heading (starts with # or is ALL CAPS or ends with :)
    if (trimmed.startsWith('#')) {
      const headingText = trimmed.replace(/^#+\s*/, '');
      children.push(
        new Paragraph({
          text: headingText,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );
    } else if (trimmed.startsWith('##')) {
      const headingText = trimmed.replace(/^##\s*/, '');
      children.push(
        new Paragraph({
          text: headingText,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        })
      );
    } else if (trimmed.match(/^[A-Z][A-Z\s]+:?$/) || trimmed.match(/^[A-Z][a-z]+(\s[A-Z][a-z]+)*:$/)) {
      // Section headers like "OUR BEGINNING" or "Key Milestones:"
      children.push(
        new Paragraph({
          text: trimmed.replace(/:$/, ''),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      // Bullet point
      children.push(
        new Paragraph({
          text: trimmed.substring(2),
          bullet: { level: 0 },
          spacing: { after: 100 },
        })
      );
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      // Bold text (standalone)
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmed.replace(/\*\*/g, ''),
              bold: true,
            }),
          ],
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (trimmed) {
      // Regular paragraph - handle inline bold/italic
      const runs = [];
      let remaining = trimmed;

      // Simple parsing for **bold** and *italic*
      const parts = remaining.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/);
      for (const part of parts) {
        if (part.startsWith('**') && part.endsWith('**')) {
          runs.push(new TextRun({ text: part.slice(2, -2), bold: true }));
        } else if (part.startsWith('*') && part.endsWith('*')) {
          runs.push(new TextRun({ text: part.slice(1, -1), italics: true }));
        } else if (part) {
          runs.push(new TextRun({ text: part }));
        }
      }

      children.push(
        new Paragraph({
          children: runs.length ? runs : [new TextRun(trimmed)],
          spacing: { after: 200 },
        })
      );
    }
  }

  // Footer
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '───────────────────────────────────────',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 600 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Generated by LEP Hub • stridefba.com',
          italics: true,
          size: 20,
          color: '666666',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 100 },
    })
  );

  return new Document({
    sections: [{
      properties: {},
      children,
    }],
  });
}

async function downloadDocument(moduleId, data, title) {
  // Generate narrative with AI
  const narrative = await generateDocumentWithAI(moduleId, data);

  // Convert to Word document
  const doc = parseNarrativeToDocx(narrative, title);

  // Generate and download
  const blob = await Packer.toBlob(doc);
  const filename = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
  saveAs(blob, filename);

  return narrative; // Return for preview
}


// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

function Nav({ currentView, setCurrentView, user, scores, onLogout, currentUser }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navItems = [
    { id: 'dashboard', icon: '◇', name: 'Home' },
    { id: 'family-profile', icon: '◎', name: 'Family Profile' },
    { id: 'lep-journey', icon: '◆', name: 'LEP Journey' },
    { id: 'family-dynamics', icon: '❤', name: 'Family Dynamics' },
    { id: 'meetings', icon: '▢', name: 'Meetings' },
    { id: 'vault', icon: '▤', name: 'Vault' },
    { id: 'pillars', icon: '▣', name: 'Pillars' },
    { id: 'education', icon: '📚', name: 'Education' },
    { id: 'workbook', icon: '📝', name: 'Workbook' },
    { id: 'community', icon: '💬', name: 'Community' },
  ];

  return (
    <>
      <button
        className="mobile-nav-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{display: 'none', position: 'fixed', top: '16px', left: '16px', zIndex: 1001, background: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 14px', fontSize: '1.1rem', cursor: 'pointer'}}
      >
        {mobileOpen ? '✕' : '☰'}
      </button>
      <style>{`
        @media (max-width: 768px) {
          .mobile-nav-toggle { display: block !important; }
          .app-nav { transform: translateX(${mobileOpen ? '0' : '-100%'}); transition: transform 0.3s ease; position: fixed !important; z-index: 1000; height: 100vh; }
          .app-main { margin-left: 0 !important; padding: 16px !important; padding-top: 60px !important; }
          .pathway-grid, .action-grid, .pillar-grid { grid-template-columns: 1fr !important; }
          .page-header { flex-direction: column; align-items: flex-start !important; gap: 12px; }
          .score-hero { flex-direction: column; text-align: center; }
          .score-summary { text-align: center; }
          .dashboard-actions { justify-content: center; }
          .assessment-card { padding: 16px !important; }
          .rating-scale { gap: 4px !important; }
          .transition-banner { padding: 20px !important; }
          h1 { font-size: 1.4rem !important; }
        }
        @media (max-width: 480px) {
          .app-main { padding: 12px !important; padding-top: 56px !important; }
          .pathway-card { padding: 16px !important; }
          .score-circle svg { width: 100px; height: 100px; }
        }
      `}</style>
    <nav className="app-nav">
      <div className="nav-brand">
        <span className="nav-logo">◆</span>
        <span className="nav-title">LEP Hub</span>
      </div>

      <div className="nav-menu" style={{marginTop: '8px'}}>
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => { setCurrentView(item.id); setMobileOpen(false); }}
          >
            <span className="nav-icon" style={{fontFamily: 'system-ui', fontSize: '0.9rem'}}>{item.icon}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </div>

      <div style={{flex: 1}} />

      <div className="nav-user" style={{position: 'relative', cursor: 'pointer'}} onClick={() => setShowUserMenu(!showUserMenu)}>
        <div className="user-avatar">{user?.initials || 'JP'}</div>
        <div className="user-info">
          <span className="user-name">{user?.name || 'User'}</span>
          <span className="user-role">{currentUser?.tier === 'enterprise' ? 'Enterprise' : currentUser?.tier === 'pro' ? 'Pro' : 'Free Plan'}</span>
        </div>
        <span style={{color: '#64748b', fontSize: '0.7rem', marginLeft: 'auto'}}>▾</span>

        {showUserMenu && (
          <div style={{position: 'absolute', bottom: '100%', left: 0, right: 0, background: '#1a2744', borderRadius: '10px', padding: '6px', marginBottom: '8px', boxShadow: '0 -4px 20px rgba(0,0,0,0.4)', zIndex: 200}}>
            <button onClick={(e) => { e.stopPropagation(); setCurrentView('settings'); setShowUserMenu(false); setMobileOpen(false); }} style={{width: '100%', padding: '10px 14px', background: 'none', border: 'none', color: '#e2e8f0', fontSize: '0.85rem', textAlign: 'left', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'}}>
              ⚙ Settings
            </button>
            <button onClick={(e) => { e.stopPropagation(); if (onLogout) onLogout(); }} style={{width: '100%', padding: '10px 14px', background: 'none', border: 'none', color: '#f87171', fontSize: '0.85rem', textAlign: 'left', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'}}>
              ↪ Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
    </>
  );
}

function Dashboard({ scores, setCurrentView, setActivePillar, vaultDocuments, onGenerateLepReport }) {
  const totalScore = scores ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 5) : null;
  const [showScoreMethod, setShowScoreMethod] = useState(false);

  // Sub-dimension hints per category
  const pillarSubDims = {
    'purpose-identity': ['Shared Purpose, Values & Narrative'],
    'family-system': ['Family Dynamics', 'Communication', 'Transitions', 'Next-Gen Dev'],
    'ownership-governance': ['Ownership', 'Governance', 'Decision-Making'],
    'business-operations': ['Roles & Employment', 'Compensation', 'Professionalization'],
    'strategy-legacy': ['Succession', 'Strategy', 'Estate Planning', 'Philanthropy'],
  };

  return (
    <div className="dashboard">
      <header className="page-header">
        <div>
          <h1>Welcome back</h1>
          <p className="subtitle">Decision infrastructure for your family enterprise transition.</p>
        </div>
        {!scores && (
          <button className="btn btn-primary" onClick={() => setCurrentView('lep-journey')}>
            Take Assessment
          </button>
        )}
      </header>

      {scores ? (
        <>
          <div className="score-hero">
            <div className="score-circle">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="54" fill="none"
                  stroke="url(#scoreGradient)" strokeWidth="8"
                  strokeDasharray={`${totalScore * 3.39} 339`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2d5a3d" />
                    <stop offset="100%" stopColor="#4a7c5d" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="score-value">
                <span className="score-number">{totalScore}</span>
                <span className="score-label">LEP Score</span>
              </div>
            </div>
            <div className="score-summary">
              <h2>Your LEP Score: {totalScore}/100</h2>
              <p>
                {totalScore >= 80 ? "Your family enterprise has strong foundations across all five pillars." :
                 totalScore >= 60 ? "Good foundations. Your lower-scoring pillars show where to focus next." :
                 totalScore >= 40 ? "You've started the work most families never begin. Keep going." :
                 "Every great family enterprise journey starts with awareness. You're here."}
              </p>
              {/* v6: Score transparency — how it's calculated */}
              <button onClick={() => setShowScoreMethod(!showScoreMethod)} style={{background: 'none', border: 'none', color: '#64748b', fontSize: '0.78rem', cursor: 'pointer', padding: '4px 0', marginTop: '6px', textDecoration: 'underline', textDecorationStyle: 'dotted'}}>
                {showScoreMethod ? 'Hide' : 'How is this calculated?'}
              </button>
              {showScoreMethod && (
                <div style={{background: '#f8fafc', borderRadius: '8px', padding: '12px 16px', marginTop: '8px', fontSize: '0.82rem', color: '#475569', lineHeight: '1.6', border: '1px solid #e5e7eb'}}>
                  Your LEP Score is the average of five pillar scores (Roots, Order, Impact, Continuity, Legacy), each rated 0–100 based on your assessment responses. Each pillar has 5 questions scored 1–5, then normalized to a 0–100 scale. Higher scores indicate stronger family enterprise foundations in that dimension.
                </div>
              )}
              <div className="dashboard-actions" style={{marginTop: '16px'}}>
                <button className="btn btn-primary" onClick={() => setCurrentView('lep-journey')}>
                  Continue LEP Journey
                </button>
                <button className="btn btn-outline" onClick={() => onGenerateLepReport(scores)}>
                  Generate Report
                </button>
              </div>
            </div>
          </div>

          {/* v6: Annual Health Report CTA — #2 most requested feature (33.1%) */}
          <div style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '12px', padding: '24px 28px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'}}>
            <div>
              <h3 style={{fontSize: '1rem', fontWeight: '700', color: 'white', marginBottom: '4px'}}>Annual Family Enterprise Health Report</h3>
              <p style={{fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', maxWidth: '500px', lineHeight: '1.5'}}>
                A comprehensive annual review of your family enterprise health — pillar trends, risk areas, and recommended actions for the year ahead.
              </p>
            </div>
            <button onClick={() => onGenerateLepReport(scores)} style={{background: 'white', color: '#0f172a', padding: '10px 24px', borderRadius: '8px', fontWeight: '600', fontSize: '0.88rem', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap'}}>
              Generate Health Report
            </button>
          </div>

          <div className="pillar-scores">
            <h3>Pillar Breakdown</h3>
            <div className="pillar-grid">
              {LEP_PILLARS.map(pillar => (
                <div
                  key={pillar.id}
                  className="pillar-score-card"
                  style={{'--pillar-color': pillar.color}}
                  onClick={() => { setActivePillar(pillar.id); setCurrentView('pillars'); }}
                >
                  <div className="pillar-score-header">
                    <span className="pillar-icon">{pillar.icon}</span>
                    <span className="pillar-name">{pillar.name}</span>
                  </div>
                  <div className="pillar-score-bar">
                    <div className="pillar-score-fill" style={{width: `${scores[pillar.id]}%`}}></div>
                  </div>
                  <div className="pillar-score-value">{scores[pillar.id]}%</div>
                  {/* v6: Sub-dimension hints (10.3% requested pillar breakdown) */}
                  <div style={{display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap'}}>
                    {(pillarSubDims[pillar.id] || []).map(sub => (
                      <span key={sub} style={{fontSize: '0.65rem', color: '#94a3b8', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px'}}>{sub}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center', padding: '40px 20px'}}>
          <p style={{fontSize: '1.6rem', fontWeight: '300', color: '#374151', lineHeight: '1.5', maxWidth: '560px', marginBottom: '48px', letterSpacing: '-0.01em'}}>
            The most important decision your family will ever make deserves more than a spreadsheet.
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => setCurrentView('lep-journey')}
            style={{padding: '16px 48px', fontSize: '1.05rem', borderRadius: '12px', fontWeight: '600', letterSpacing: '0.02em'}}
          >
            Begin
          </button>
          {/* v6: Quick-start option — 10.1% requested shorter assessment */}
          <p style={{fontSize: '0.82rem', color: '#94a3b8', marginTop: '16px'}}>
            Full assessment takes ~15 minutes
          </p>
        </div>
      )}

      <div className="quick-actions">
        <div className="action-grid">
          <button className="action-card" onClick={() => setCurrentView('lep-journey')}>
            <span className="action-icon">◆</span>
            <span className="action-label">LEP Journey</span>
          </button>
          <button className="action-card" onClick={() => setCurrentView('family-dynamics')}>
            <span className="action-icon">❤</span>
            <span className="action-label">Family Dynamics</span>
          </button>
          <button className="action-card" onClick={() => setCurrentView('pillars')}>
            <span className="action-icon">▣</span>
            <span className="action-label">Pillars</span>
          </button>
          <button className="action-card" onClick={() => setCurrentView('vault')}>
            <span className="action-icon">▤</span>
            <span className="action-label">Vault</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Assessment({ onComplete }) {
  const [currentPillar, setCurrentPillar] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedIndustry, setSelectedIndustry] = useState(() => {
    try { return localStorage.getItem('lep_industry') || ''; } catch { return ''; }
  });

  // v6: Industry context for assessment — #1 edit request (10.3%)
  const industryContext = {
    'Manufacturing': 'Consider supply chain dependencies, key-person risk in operations, and workforce transition needs.',
    'Real Estate': 'Think about property portfolio structure, tenant relationships, and development pipeline continuity.',
    'Agriculture': 'Reflect on land stewardship, seasonal workforce management, and multi-generation land trusts.',
    'Construction': 'Consider bonding capacity transfer, project pipeline, and relationship-dependent revenue.',
    'Healthcare Services': 'Think about regulatory compliance, credentialing, and patient relationship continuity.',
    'Technology': 'Reflect on IP ownership, key developer retention, and product roadmap beyond founders.',
    'Financial Services': 'Consider client book portability, compliance obligations, and fiduciary succession.',
    'Retail': 'Think about location leases, brand identity, and community relationships.',
    'Professional Services': 'Consider client relationship transfer, partner buyout structures, and institutional knowledge.',
    'Food & Beverage': 'Reflect on brand equity, recipe/process IP, and supplier relationships.',
  };

  useEffect(() => {
    // Load saved assessment answers
    const savedAnswers = localStorage.getItem('lep_assessment_answers');
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
  }, []);

  useEffect(() => {
    // Save assessment answers as user progresses
    localStorage.setItem('lep_assessment_answers', JSON.stringify(answers));
  }, [answers]);

  const pillars = LEP_PILLARS;
  const pillar = pillars[currentPillar];
  const questions = ASSESSMENT_QUESTIONS[pillar.id];

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const pillarComplete = questions.every(q => answers[q.id] !== undefined);

  const nextPillar = () => {
    if (currentPillar < pillars.length - 1) {
      setCurrentPillar(currentPillar + 1);
    } else {
      const scores = {};
      pillars.forEach(p => {
        const qs = ASSESSMENT_QUESTIONS[p.id];
        const total = qs.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
        scores[p.id] = Math.round((total / (qs.length * 5)) * 100);
      });
      // Clear assessment answers after completion
      localStorage.removeItem('lep_assessment_answers');
      onComplete(scores);
    }
  };

  const prevPillar = () => {
    if (currentPillar > 0) setCurrentPillar(currentPillar - 1);
  };

  return (
    <div className="assessment">
      <header className="page-header">
        <div>
          <h1>LEP Assessment</h1>
          <p className="subtitle">Rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree)</p>
        </div>
        {/* v6: Industry selector — tailors context per industry (#1 edit request) */}
        <select
          value={selectedIndustry}
          onChange={(e) => { setSelectedIndustry(e.target.value); try { localStorage.setItem('lep_industry', e.target.value); } catch {} }}
          style={{padding: '8px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.85rem', color: '#374151', background: 'white', maxWidth: '200px'}}
        >
          <option value="">Your Industry</option>
          {Object.entries(INDUSTRY_PROFILES).map(([name, p]) => (
            <option key={name} value={name}>{p.icon} {name}</option>
          ))}
        </select>
      </header>

      {/* v6: Industry-specific context hint */}
      {selectedIndustry && industryContext[selectedIndustry] && (
        <div style={{background: '#f0f9ff', borderRadius: '8px', padding: '10px 16px', marginBottom: '16px', border: '1px solid #0891b222', fontSize: '0.82rem', color: '#0c4a6e', lineHeight: '1.5'}}>
          <strong>{INDUSTRY_PROFILES[selectedIndustry]?.icon} {selectedIndustry}:</strong> {industryContext[selectedIndustry]}
        </div>
      )}

      <div className="assessment-progress">
        {pillars.map((p, i) => (
          <div
            key={p.id}
            className={`progress-step ${i === currentPillar ? 'active' : ''} ${i < currentPillar ? 'complete' : ''}`}
            style={{'--pillar-color': p.color}}
          >
            <span className="progress-icon">{p.icon}</span>
            <span className="progress-label">{p.name}</span>
          </div>
        ))}
      </div>

      <div className="assessment-card" style={{'--pillar-color': pillar.color}}>
        <div className="assessment-pillar-header">
          <span className="pillar-icon">{pillar.icon}</span>
          <div>
            <h2>{pillar.name}</h2>
            <p>{pillar.description}</p>
          </div>
        </div>

        <div className="questions">
          {questions.map((q, i) => (
            <div key={q.id} className="question">
              <p className="question-text">{i + 1}. {q.text}</p>
              <div className="rating-scale">
                {[1, 2, 3, 4, 5].map(value => (
                  <button
                    key={value}
                    className={`rating-btn ${answers[q.id] === value ? 'selected' : ''}`}
                    onClick={() => handleAnswer(q.id, value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <div className="rating-labels">
                <span>Strongly Disagree</span>
                <span>Strongly Agree</span>
              </div>
            </div>
          ))}
        </div>

        <div className="assessment-nav">
          <button
            className="btn btn-outline"
            onClick={prevPillar}
            disabled={currentPillar === 0}
          >
            ← Previous
          </button>
          <button
            className="btn btn-primary"
            onClick={nextPillar}
            disabled={!pillarComplete}
          >
            {currentPillar === pillars.length - 1 ? 'Complete Assessment' : 'Next Pillar →'}
          </button>
        </div>
      </div>
    </div>
  );
}

function LEPReportGenerator({ scores, onClose, onReportGenerated }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportContent, setReportContent] = useState(null);
  const [error, setError] = useState(null);

  const generateLepReport = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      // Create comprehensive assessment prompt
      const scoreDetails = LEP_PILLARS.map(p => {
        const pillars = ASSESSMENT_QUESTIONS[p.id];
        const answersKey = p.id.charAt(0); // 'r', 'o', 'i', 'c', 'l'
        const allAnswers = Object.entries(ASSESSMENT_QUESTIONS[p.id]).map(([key, question]) => {
          return { question: question.text, rating: 'Not assessed' };
        });
        return `${p.name}: ${scores[p.id]}%`;
      }).join('\n');

      const prompt = `Family enterprise consultant. Write a brief LEP Assessment Report. Sections: Executive Summary, Pillar Analysis (strengths and improvements for each), and 3 Next Steps. Professional tone.

Overall Score: ${Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 5)}/100
${scoreDetails}`;

      const response = await fetch('/.netlify/functions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 600,
          messages: [
            { role: 'user', content: prompt }
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const result = await response.json();
      const reportText = result.content[0].text;

      // Convert to DOCX and download
      const doc = parseNarrativeToDocx(reportText, 'LEP Assessment Report');
      const blob = await Packer.toBlob(doc);
      const filename = `LEP_Assessment_Report_${new Date().toISOString().split('T')[0]}.docx`;
      saveAs(blob, filename);

      // Store in vault
      const vaultEntry = {
        id: `report_${Date.now()}`,
        title: 'LEP Assessment Report',
        pillar: 'assessment',
        date: new Date().toISOString(),
        preview: reportText.split('\n').slice(0, 5).join('\n'),
        fullContent: reportText,
      };

      const existingVault = JSON.parse(localStorage.getItem('lep_vault') || '[]');
      existingVault.unshift(vaultEntry);
      localStorage.setItem('lep_vault', JSON.stringify(existingVault));

      setReportContent(reportText);
      onReportGenerated();
    } catch (err) {
      console.error('Report generation error:', err);
      setError('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (reportContent) {
    return (
      <div className="module-workbook">
        <div className="workbook-header">
          <button className="btn btn-ghost" onClick={onClose}>← Back</button>
          <h2>LEP Assessment Report Generated</h2>
        </div>

        <div className="generation-success">
          <div className="success-icon">✓</div>
          <h2>Report Generated & Downloaded!</h2>
          <p>Your LEP Assessment Report has been saved to your downloads folder and added to your Vault.</p>

          <div className="preview-section">
            <h3>Report Preview</h3>
            <div className="document-preview">
              {reportContent.split('\n').slice(0, 20).map((line, i) => (
                <p key={i}>{line || <br />}</p>
              ))}
              <p><em>... (full report in download) ...</em></p>
            </div>
          </div>

          <div className="success-actions">
            <button className="btn btn-primary" onClick={onClose}>
              Done — Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="module-workbook">
      <div className="workbook-header">
        <button className="btn btn-ghost" onClick={onClose}>← Back</button>
        <h2>Generate LEP Report</h2>
      </div>

      <div className="generation-prompt">
        <h2>Generate Your LEP Assessment Report</h2>
        <p>Your assessment is complete! Generate a comprehensive executive report based on your scores across all five pillars.</p>

        <div className="score-summary">
          <h3>Your Scores</h3>
          <div className="score-grid">
            {LEP_PILLARS.map(pillar => (
              <div key={pillar.id} className="score-box">
                <span className="score-icon">{pillar.icon}</span>
                <span className="score-label">{pillar.name}</span>
                <span className="score-number">{scores[pillar.id]}%</span>
              </div>
            ))}
          </div>
          <div className="overall-score">
            <p>Overall Score: <strong>{Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 5)}/100</strong></p>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button
          className="btn btn-primary btn-lg"
          onClick={generateLepReport}
          disabled={isGenerating}
        >
          {isGenerating ? '⏳ Generating Report...' : '✨ Generate LEP Report'}
        </button>
      </div>
    </div>
  );
}

function ModuleWorkbook({ moduleId, moduleData, onClose, onSave, savedData, onMarkComplete }) {
  const content = ALL_MODULE_CONTENT[moduleId];
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState(savedData || {});
  const [milestones, setMilestones] = useState(savedData?.milestones || []);
  const [values, setValues] = useState(savedData?.values || [{ name: '', definition: '', behavior: '' }]);
  const [branches, setBranches] = useState(savedData?.branches || [{ name: '', members: '', roles: '' }]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState(null);
  const [error, setError] = useState(null);

  if (!content) {
    return (
      <div className="module-workbook">
        <div className="workbook-header">
          <button className="btn btn-ghost" onClick={onClose}>← Back to Pillars</button>
          <h2>{moduleData.name}</h2>
        </div>
        <div className="workbook-coming-soon">
          <div className="coming-soon-icon">🚧</div>
          <h3>Module Coming Soon</h3>
          <p>This module is currently in development. Check back soon!</p>
          <button className="btn btn-primary" onClick={onClose}>Return to Pillars</button>
        </div>
      </div>
    );
  }

  const section = content.sections[currentSection];
  const totalSections = content.sections.length;
  const isLastSection = currentSection === totalSections - 1;

  const handleResponseChange = (exerciseId, value) => {
    setResponses(prev => ({ ...prev, [exerciseId]: value }));
  };

  const getAllData = () => {
    return { ...responses, milestones, values, branches, lastSaved: new Date().toISOString() };
  };

  const handleSaveProgress = () => {
    onSave(moduleId, getAllData());
  };

  const handleGenerateDocument = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const data = getAllData();
      onSave(moduleId, data); // Save first
      const narrative = await downloadDocument(moduleId, data, content.deliverable.title);

      // Store in vault
      const vaultEntry = {
        id: `${moduleId}_${Date.now()}`,
        title: content.deliverable.title,
        pillar: LEP_PILLARS.find(p => p.modules.some(m => m.id === moduleId))?.id || 'roots',
        date: new Date().toISOString(),
        preview: narrative.split('\n').slice(0, 3).join('\n'),
        fullContent: narrative,
      };

      const existingVault = JSON.parse(localStorage.getItem('lep_vault') || '[]');
      existingVault.unshift(vaultEntry);
      localStorage.setItem('lep_vault', JSON.stringify(existingVault));

      setGeneratedPreview(narrative);
      onMarkComplete(moduleId);
    } catch (err) {
      console.error('Generation error:', err);
      setError('Failed to generate document. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const addMilestone = () => setMilestones([...milestones, { year: '', title: '', description: '' }]);
  const updateMilestone = (i, field, value) => { const u = [...milestones]; u[i] = { ...u[i], [field]: value }; setMilestones(u); };
  const removeMilestone = (i) => setMilestones(milestones.filter((_, idx) => idx !== i));

  const addValue = () => setValues([...values, { name: '', definition: '', behavior: '' }]);
  const updateValue = (i, field, value) => { const u = [...values]; u[i] = { ...u[i], [field]: value }; setValues(u); };
  const removeValue = (i) => setValues(values.filter((_, idx) => idx !== i));

  const addBranch = () => setBranches([...branches, { name: '', members: '', roles: '' }]);
  const updateBranch = (i, field, value) => { const u = [...branches]; u[i] = { ...u[i], [field]: value }; setBranches(u); };
  const removeBranch = (i) => setBranches(branches.filter((_, idx) => idx !== i));

  const renderExercise = (exercise) => {
    switch (exercise.type) {
      case 'textarea':
        return (
          <div key={exercise.id} className="exercise">
            <label className="exercise-question">{exercise.question}</label>
            {exercise.helperText && <p className="exercise-helper">{exercise.helperText}</p>}
            <textarea
              className="exercise-textarea"
              placeholder={exercise.placeholder}
              value={responses[exercise.id] || ''}
              onChange={(e) => handleResponseChange(exercise.id, e.target.value)}
              rows={4}
            />
          </div>
        );
      case 'select':
        return (
          <div key={exercise.id} className="exercise">
            <label className="exercise-question">{exercise.question}</label>
            <select
              className="exercise-select"
              value={responses[exercise.id] || ''}
              onChange={(e) => handleResponseChange(exercise.id, e.target.value)}
            >
              <option value="">Select...</option>
              {exercise.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        );
      case 'milestone-builder':
        return (
          <div key={exercise.id} className="exercise">
            <label className="exercise-question">{exercise.question}</label>
            {exercise.helperText && <p className="exercise-helper">{exercise.helperText}</p>}
            <div className="milestone-list">
              {milestones.map((m, i) => (
                <div key={i} className="milestone-item">
                  <input type="text" className="milestone-year" placeholder="Year" value={m.year} onChange={(e) => updateMilestone(i, 'year', e.target.value)} />
                  <input type="text" className="milestone-title" placeholder="Milestone title" value={m.title} onChange={(e) => updateMilestone(i, 'title', e.target.value)} />
                  <input type="text" className="milestone-desc" placeholder="Brief description" value={m.description} onChange={(e) => updateMilestone(i, 'description', e.target.value)} />
                  <button className="btn-icon" onClick={() => removeMilestone(i)}>✕</button>
                </div>
              ))}
              <button className="btn btn-outline btn-sm" onClick={addMilestone}>+ Add Milestone</button>
            </div>
          </div>
        );
      case 'values-builder':
        return (
          <div key={exercise.id} className="exercise">
            <label className="exercise-question">{exercise.question}</label>
            {exercise.helperText && <p className="exercise-helper">{exercise.helperText}</p>}
            <div className="values-list">
              {values.map((v, i) => (
                <div key={i} className="value-item">
                  <div className="value-number">{i + 1}</div>
                  <div className="value-fields">
                    <input type="text" className="value-name" placeholder="Value name (e.g., Integrity)" value={v.name} onChange={(e) => updateValue(i, 'name', e.target.value)} />
                    <textarea className="value-definition" placeholder="What this value means to us..." value={v.definition} onChange={(e) => updateValue(i, 'definition', e.target.value)} rows={2} />
                    <textarea className="value-behavior" placeholder="What this looks like in action..." value={v.behavior} onChange={(e) => updateValue(i, 'behavior', e.target.value)} rows={2} />
                  </div>
                  <button className="btn-icon" onClick={() => removeValue(i)}>✕</button>
                </div>
              ))}
              <button className="btn btn-outline btn-sm" onClick={addValue}>+ Add Value</button>
            </div>
          </div>
        );
      case 'branch-builder':
        return (
          <div key={exercise.id} className="exercise">
            <label className="exercise-question">{exercise.question}</label>
            {exercise.helperText && <p className="exercise-helper">{exercise.helperText}</p>}
            <div className="branch-list">
              {branches.map((b, i) => (
                <div key={i} className="branch-item">
                  <div className="branch-header">
                    <span className="branch-label">Branch {i + 1}</span>
                    <button className="btn-icon" onClick={() => removeBranch(i)}>✕</button>
                  </div>
                  <input type="text" className="branch-name" placeholder="Branch name" value={b.name} onChange={(e) => updateBranch(i, 'name', e.target.value)} />
                  <textarea className="branch-members" placeholder="List family members..." value={b.members} onChange={(e) => updateBranch(i, 'members', e.target.value)} rows={2} />
                  <textarea className="branch-roles" placeholder="Their roles..." value={b.roles} onChange={(e) => updateBranch(i, 'roles', e.target.value)} rows={2} />
                </div>
              ))}
              <button className="btn btn-outline btn-sm" onClick={addBranch}>+ Add Branch</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Show preview if document was generated
  if (generatedPreview) {
    return (
      <div className="module-workbook">
        <div className="workbook-header">
          <button className="btn btn-ghost" onClick={onClose}>← Back to Pillars</button>
          <div className="workbook-progress">Document Generated ✓</div>
        </div>

        <div className="generation-success">
          <div className="success-icon">✓</div>
          <h2>Document Downloaded!</h2>
          <p>Your {content.deliverable.title} has been saved to your downloads folder and added to your Vault.</p>

          <div className="preview-section">
            <h3>Preview</h3>
            <div className="document-preview">
              {generatedPreview.split('\n').map((line, i) => (
                <p key={i}>{line || <br />}</p>
              ))}
            </div>
          </div>

          <div className="success-actions">
            <button className="btn btn-outline" onClick={() => setGeneratedPreview(null)}>
              ← Edit Responses
            </button>
            <button className="btn btn-primary" onClick={onClose}>
              Done — Return to Pillars
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="module-workbook">
      <div className="workbook-header">
        <button className="btn btn-ghost" onClick={onClose}>← Back to Pillars</button>
        <div className="workbook-progress">Section {currentSection + 1} of {totalSections}</div>
      </div>

      <div className="workbook-title-section">
        <h1>{content.title}</h1>
        <p className="workbook-subtitle">{content.subtitle}</p>
        <div className="workbook-meta">
          <span className="meta-item">⏱️ {content.estimatedTime}</span>
          <span className="meta-item">🌄 Deliverable: {content.deliverable.title}</span>
        </div>
      </div>

      <div className="section-tabs">
        {content.sections.map((s, i) => (
          <button
            key={s.id}
            className={`section-tab ${i === currentSection ? 'active' : ''} ${i < currentSection ? 'complete' : ''}`}
            onClick={() => setCurrentSection(i)}
          >
            <span className="section-number">{i + 1}</span>
            <span className="section-name">{s.title}</span>
          </button>
        ))}
      </div>

      <div className="workbook-content">
        <div className="section-header">
          <h2>{section.title}</h2>
          <p>{section.description}</p>
        </div>
        <div className="exercises">
          {section.exercises.map(ex => renderExercise(ex))}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="workbook-nav">
        <button className="btn btn-outline" onClick={() => setCurrentSection(Math.max(0, currentSection - 1))} disabled={currentSection === 0}>
          ← Previous Section
        </button>
        <button className="btn btn-secondary" onClick={handleSaveProgress}>💾 Save Progress</button>
        {!isLastSection ? (
          <button className="btn btn-primary" onClick={() => setCurrentSection(currentSection + 1)}>Next Section →</button>
        ) : (
          <button
            className="btn btn-generate"
            onClick={handleGenerateDocument}
            disabled={isGenerating}
          >
            {isGenerating ? '⏳ Generating...' : '✨ Generate Document'}
          </button>
        )}
      </div>
    </div>
  );
}

function PillarsView({ activePillar, setActivePillar, moduleProgress, setModuleProgress, moduleData, setModuleData }) {
  const [activeModule, setActiveModule] = useState(null);
  const pillar = LEP_PILLARS.find(p => p.id === activePillar) || LEP_PILLARS[0];

  const handleModuleClick = (module) => {
    if (module.hasContent) {
      setActiveModule(module);
    } else {
      setModuleProgress(prev => ({ ...prev, [module.id]: prev[module.id] === 'complete' ? 'not-started' : 'complete' }));
    }
  };

  const handleSaveModuleData = (moduleId, data) => {
    setModuleData(prev => ({ ...prev, [moduleId]: data }));
    setModuleProgress(prev => ({ ...prev, [moduleId]: 'in-progress' }));
  };

  const handleMarkComplete = (moduleId) => {
    setModuleProgress(prev => ({ ...prev, [moduleId]: 'complete' }));
  };

  if (activeModule) {
    return (
      <ModuleWorkbook
        moduleId={activeModule.id}
        moduleData={activeModule}
        savedData={moduleData[activeModule.id]}
        onClose={() => setActiveModule(null)}
        onSave={handleSaveModuleData}
        onMarkComplete={handleMarkComplete}
      />
    );
  }

  return (
    <div className="pillars-view">
      <header className="page-header">
        <div>
          <h1>LEP Pillars</h1>
          <p className="subtitle">Work through each pillar at your own pace.</p>
        </div>
      </header>

      <div className="pillar-tabs">
        {LEP_PILLARS.map(p => (
          <button
            key={p.id}
            className={`pillar-tab ${activePillar === p.id ? 'active' : ''}`}
            style={{'--pillar-color': p.color}}
            onClick={() => setActivePillar(p.id)}
          >
            <span className="pillar-icon">{p.icon}</span>
            <span className="pillar-name">{p.name}</span>
          </button>
        ))}
      </div>

      <div className="pillar-content" style={{'--pillar-color': pillar.color}}>
        <div className="pillar-header">
          <div className="pillar-title">
            <span className="pillar-icon-lg">{pillar.icon}</span>
            <div>
              <h2>{pillar.name} <span style={{fontSize: '0.6em', fontWeight: '400', color: pillar.color, opacity: 0.8}}>— {pillar.toolName}</span></h2>
              <p className="pillar-tagline">{pillar.tagline}</p>
            </div>
          </div>
          <p className="pillar-description">{pillar.description}</p>
        </div>

        <div className="modules-list">
          <h3>Modules</h3>
          {pillar.modules.map((module, i) => {
            const status = moduleProgress[module.id] || 'not-started';
            const hasContent = module.hasContent;
            return (
              <div key={module.id} className={`module-card ${status}`}>
                <div className="module-number">{i + 1}</div>
                <div className="module-info">
                  <h4>{module.name}</h4>
                  <p>{module.description}</p>
                  {hasContent && <span className="module-badge">Interactive Workbook</span>}
                </div>
                <div className="module-actions">
                  {status === 'complete' ? (
                    <button className="btn btn-outline" onClick={() => handleModuleClick(module)}>✓ Complete — Review</button>
                  ) : status === 'in-progress' ? (
                    <button className="btn btn-primary" onClick={() => handleModuleClick(module)}>Continue →</button>
                  ) : (
                    <button className="btn btn-primary" onClick={() => handleModuleClick(module)}>Start Module</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MEETINGS — LEP Governance Meeting System
// ═══════════════════════════════════════════════════════════════

const MEETING_TEMPLATES = {
  board: {
    name: 'Board Meeting', icon: '🏛️', frequency: 'Quarterly', duration: '90 min', color: '#1a3a5c',
    agenda: [
      { id: 'opening', name: 'Opening & Check-In', duration: '5 min', desc: 'Personal check-in. How is each board member doing — personally and professionally?' },
      { id: 'pulse-check', name: 'Pulse Check', duration: '10 min', desc: 'Review key metrics: revenue, EBITDA, cash position, succession milestones, LEP scores.' },
      { id: 'priorities', name: '90-Day Priorities Review', duration: '10 min', desc: 'Are the quarterly priorities on track, off track, or done? Red/yellow/green status.' },
      { id: 'headlines', name: 'Headlines & Updates', duration: '10 min', desc: 'Good news, bad news, key developments — one headline per person, no discussion yet.' },
      { id: 'resolve', name: 'Resolve (Identify, Clarify, Act)', duration: '40 min', desc: 'The core of the meeting. Surface the most important issues, clarify openly, resolve with clear action items.' },
      { id: 'action-items', name: 'Action Items & Accountability', duration: '10 min', desc: 'Recap all action items. Who owns what? By when? Read back for confirmation.' },
      { id: 'closing', name: 'Closing & Rating', duration: '5 min', desc: 'Rate this meeting 1-10. What worked? What didn\'t? Cascade any messages.' },
    ],
  },
  'family-council': {
    name: 'Family Council', icon: '👥', frequency: 'Monthly', duration: '60 min', color: '#2d5a3d',
    agenda: [
      { id: 'opening', name: 'Opening & Gratitude', duration: '5 min', desc: 'Start with something positive. What are we grateful for as a family this month?' },
      { id: 'policy-review', name: 'Policy & Governance Review', duration: '10 min', desc: 'Any policies that need updating? Family employment, compensation, conflict resolution.' },
      { id: 'family-updates', name: 'Family Member Updates', duration: '10 min', desc: 'Each member shares one update — personal or professional. No interruptions.' },
      { id: 'resolve', name: 'Resolve (Identify, Clarify, Act)', duration: '25 min', desc: 'Family issues on the table. Address them with structure, not emotion.' },
      { id: 'action-items', name: 'Action Items', duration: '5 min', desc: 'Who does what by when. Write it down. Read it back.' },
      { id: 'closing', name: 'Closing & Connection', duration: '5 min', desc: 'End on a positive note. What\'s one thing you appreciate about someone in the room?' },
    ],
  },
  shareholder: {
    name: 'Shareholder Meeting', icon: '📊', frequency: 'Annual', duration: '120 min', color: '#7c3aed',
    agenda: [
      { id: 'call-to-order', name: 'Call to Order & Quorum', duration: '5 min', desc: 'Confirm quorum. Record attendance. Approve prior meeting minutes.' },
      { id: 'financial-report', name: 'Financial Report', duration: '20 min', desc: 'Annual financials: revenue, profit, distributions, valuation update, debt position.' },
      { id: 'state-of-enterprise', name: 'State of the Enterprise', duration: '20 min', desc: 'CEO/President report. Strategic direction, market position, competitive landscape.' },
      { id: 'succession-update', name: 'Succession & Continuity Update', duration: '15 min', desc: 'Where we stand on leadership pipeline, key-person risk, and transition timeline.' },
      { id: 'resolve', name: 'Resolve (Identify, Clarify, Act)', duration: '30 min', desc: 'Major ownership issues. Distribution policy changes. Governance amendments. Buy-sell agreements.' },
      { id: 'votes', name: 'Formal Votes & Resolutions', duration: '15 min', desc: 'Any motions requiring formal vote. Record results. Document dissents.' },
      { id: 'action-items', name: 'Action Items & Adjournment', duration: '10 min', desc: 'Assign action items. Set next meeting date. Formal adjournment.' },
    ],
  },
  'family-meeting': {
    name: 'Family Meeting', icon: '🏠', frequency: 'Annual', duration: '180 min', color: '#d97706',
    agenda: [
      { id: 'welcome', name: 'Welcome & Values Recitation', duration: '10 min', desc: 'Read the family mission statement and core values together.' },
      { id: 'family-story', name: 'Family Story Moment', duration: '15 min', desc: 'A family member shares a story about the enterprise — past, present, or future.' },
      { id: 'state-of-family', name: 'State of the Family', duration: '20 min', desc: 'How are we doing as a family? Not the business — the family.' },
      { id: 'philanthropy', name: 'Philanthropy & Giving Update', duration: '15 min', desc: 'Where our giving went. Impact stories. Decisions for next year.' },
      { id: 'nextgen', name: 'Next-Gen Spotlight', duration: '20 min', desc: 'Younger family members present or share. Development updates. Education plans.' },
      { id: 'resolve', name: 'Open Forum', duration: '40 min', desc: 'Resolve format. Any family member can raise any topic. Everything is on the table.' },
      { id: 'vision', name: 'Vision & Looking Ahead', duration: '15 min', desc: 'What does the next year look like? 5 years? What do we want to be known for?' },
      { id: 'closing', name: 'Closing Ritual', duration: '10 min', desc: 'End with a tradition — a reading, a toast, a moment of gratitude, or a family pledge.' },
    ],
  },
  nextgen: {
    name: 'Next-Gen Gathering', icon: '🌱', frequency: 'Semi-Annual', duration: '90 min', color: '#0891b2',
    agenda: [
      { id: 'icebreaker', name: 'Icebreaker & Connection', duration: '10 min', desc: 'Fun opening activity. Build relationships between next-gen members.' },
      { id: 'education', name: 'Education Session', duration: '25 min', desc: 'A topic relevant to next-gen development: financial literacy, governance, leadership, industry knowledge.' },
      { id: 'guest-speaker', name: 'Guest Speaker or Case Study', duration: '15 min', desc: 'Invite an outside perspective — another family enterprise next-gen, an advisor, or a professor.' },
      { id: 'discussion', name: 'Open Discussion', duration: '20 min', desc: 'What are you curious about? Worried about? Excited about? Safe space — no senior gen in the room.' },
      { id: 'development', name: 'Personal Development Check-In', duration: '10 min', desc: 'Each member shares one thing they\'re working on and one way they need support.' },
      { id: 'closing', name: 'Closing & Next Steps', duration: '10 min', desc: 'Action items. Set the next gathering date. End with energy.' },
    ],
  },
};

// ─── TRANSCRIPT PARSER ─────────────────────────────────────
function parseTranscript(transcript, template) {
  const lines = transcript.split('\n').filter(l => l.trim());
  const result = { agendaNotes: {}, actionItems: [], issues: [] };

  // Keywords that signal action items
  const actionPatterns = [
    /(?:action item|to.?do|task|follow up|need(?:s)? to|will|should|must|assign(?:ed)?|commit(?:ted)?)\s*[:\-]?\s*(.+)/i,
    /(\w+)\s+(?:will|needs to|should|is going to)\s+(.+?)(?:\s+by\s+(.+))?$/i,
  ];

  // Keywords that signal issues for the resolution queue
  const issuePatterns = [
    /(?:issue|problem|concern|challenge|risk|flag|blocker|conflict)\s*[:\-]?\s*(.+)/i,
    /(?:we need to (?:address|resolve|fix|discuss))\s+(.+)/i,
  ];

  // Map agenda items to keywords for smart routing
  const agendaKeywords = {};
  if (template) {
    template.agenda.forEach(item => {
      const kw = [];
      const name = item.name.toLowerCase();
      const desc = item.desc.toLowerCase();
      if (name.includes('check-in') || name.includes('opening') || name.includes('welcome')) kw.push('check-in', 'feeling', 'grateful', 'gratitude', 'personal', 'welcome');
      if (name.includes('pulse') || name.includes('scorecard') || name.includes('metric')) kw.push('revenue', 'metric', 'kpi', 'number', 'score', 'ebitda', 'cash', 'profit', 'growth');
      if (name.includes('priorit') || name.includes('90-day') || name.includes('rock')) kw.push('priority', 'goal', 'milestone', 'progress', 'track', 'quarter', 'initiative', 'on track', 'off track');
      if (name.includes('headline') || name.includes('update')) kw.push('update', 'news', 'announce', 'headline', 'report', 'development');
      if (name.includes('resolve') || name.includes('forum') || desc.includes('issue')) kw.push('issue', 'discuss', 'resolve', 'debate', 'disagree', 'concern', 'conflict', 'challenge');
      if (name.includes('action') || name.includes('accountability')) kw.push('action', 'to-do', 'assign', 'deadline', 'responsible', 'owner', 'accountab');
      if (name.includes('closing') || name.includes('rating') || name.includes('ritual')) kw.push('closing', 'wrap', 'rating', 'rate', 'appreciate', 'adjourn', 'conclude');
      if (name.includes('financial') || name.includes('report')) kw.push('financial', 'revenue', 'profit', 'loss', 'budget', 'dividend', 'distribution');
      if (name.includes('succession') || name.includes('continuity')) kw.push('succession', 'successor', 'transition', 'leadership', 'pipeline', 'retire', 'continuity');
      if (name.includes('philanthropy') || name.includes('giving')) kw.push('philanthropy', 'giving', 'donation', 'charity', 'foundation', 'impact', 'community');
      if (name.includes('next-gen') || name.includes('spotlight')) kw.push('next gen', 'younger', 'intern', 'education', 'development', 'mentee', 'learning');
      if (name.includes('vote') || name.includes('resolution')) kw.push('vote', 'motion', 'resolution', 'approve', 'second', 'quorum', 'ratify');
      if (name.includes('policy') || name.includes('governance')) kw.push('policy', 'governance', 'bylaw', 'constitution', 'employment', 'compensation');
      if (name.includes('vision') || name.includes('looking ahead')) kw.push('vision', 'future', 'plan', 'long-term', 'strategy', 'next year', 'five year');
      if (name.includes('story') || name.includes('legacy')) kw.push('story', 'legacy', 'history', 'founder', 'tradition', 'memory', 'generation');
      if (name.includes('icebreaker') || name.includes('connection')) kw.push('icebreaker', 'fun', 'game', 'introduce', 'bond', 'connect');
      if (name.includes('education') || name.includes('case study') || name.includes('speaker')) kw.push('learn', 'education', 'teach', 'speaker', 'case study', 'example', 'lesson', 'guest');
      agendaKeywords[item.id] = kw;
    });
  }

  let currentAgendaItem = template?.agenda?.[0]?.id || null;

  lines.forEach(line => {
    const lower = line.toLowerCase();

    // Check for agenda section transitions
    if (template) {
      let bestMatch = null;
      let bestScore = 0;
      Object.entries(agendaKeywords).forEach(([itemId, keywords]) => {
        const score = keywords.filter(kw => lower.includes(kw)).length;
        if (score > bestScore) { bestScore = score; bestMatch = itemId; }
      });
      if (bestScore >= 2) currentAgendaItem = bestMatch;
    }

    // Check for action items
    let isAction = false;
    for (const pattern of actionPatterns) {
      const m = line.match(pattern);
      if (m) {
        const text = m[2] ? `${m[1]} will ${m[2]}` : m[1];
        const ownerMatch = text.match(/^(\w+)\s+(?:will|needs|should)/i);
        result.actionItems.push({
          id: Date.now() + Math.random(),
          text: text.trim(),
          owner: ownerMatch ? ownerMatch[1] : '',
          due: m[3] || '',
          done: false,
        });
        isAction = true;
        break;
      }
    }

    // Check for issues
    let isIssue = false;
    for (const pattern of issuePatterns) {
      const m = line.match(pattern);
      if (m) {
        result.issues.push({
          id: Date.now() + Math.random(),
          text: m[1].trim(),
          priority: lower.includes('urgent') || lower.includes('critical') ? 'high' : lower.includes('minor') || lower.includes('low') ? 'low' : 'medium',
          date: new Date().toISOString().split('T')[0],
          resolved: false,
        });
        isIssue = true;
        break;
      }
    }

    // Route to agenda section notes
    if (!isAction && currentAgendaItem) {
      const existing = result.agendaNotes[currentAgendaItem] || '';
      result.agendaNotes[currentAgendaItem] = existing ? existing + '\n' + line : line;
    }
  });

  return result;
}

function FamilyProfileView({ familyProfile, setFamilyProfile }) {
  const [activeTab, setActiveTab] = useState('members');
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editingEntityId, setEditingEntityId] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  // Helper to get member by ID
  const getMember = (id) => familyProfile.members?.find(m => m.id === id);
  const getEntity = (id) => familyProfile.entities?.find(e => e.id === id);

  // Helper to get member name
  const getMemberName = (id) => {
    const member = getMember(id);
    return member ? `${member.firstName} ${member.lastName}`.trim() || `Member ${id}` : `Member ${id}`;
  };

  // Update a member
  const updateMember = (id, updates) => {
    setFamilyProfile(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === id ? { ...m, ...updates } : m)
    }));
  };

  // Add a new member
  const addMember = () => {
    const newMember = {
      id: Date.now(),
      firstName: '',
      lastName: '',
      role: '',
      generation: 1,
      parentId: null,
      spouseId: null,
      birthYear: '',
      email: '',
      phone: '',
      ownershipPct: 0,
      isActive: true,
      isBoard: false,
      tags: [],
    };
    setFamilyProfile(prev => ({
      ...prev,
      members: [...(prev.members || []), newMember]
    }));
  };

  // Delete a member
  const deleteMember = (id) => {
    if (confirm('Remove this family member from the profile?')) {
      setFamilyProfile(prev => ({
        ...prev,
        members: prev.members.filter(m => m.id !== id)
      }));
      setEditingMemberId(null);
    }
  };

  // Update enterprise info
  const updateEnterprise = (field, value) => {
    setFamilyProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add entity
  const addEntity = () => {
    const newEntity = {
      id: Date.now(),
      name: '',
      type: 'operating-company',
      owners: [],
      description: '',
      color: '#0f172a'
    };
    setFamilyProfile(prev => ({
      ...prev,
      entities: [...(prev.entities || []), newEntity]
    }));
  };

  // Update entity
  const updateEntity = (id, updates) => {
    setFamilyProfile(prev => ({
      ...prev,
      entities: prev.entities.map(e => e.id === id ? { ...e, ...updates } : e)
    }));
  };

  // Delete entity
  const deleteEntity = (id) => {
    if (confirm('Delete this entity?')) {
      setFamilyProfile(prev => ({
        ...prev,
        entities: prev.entities.filter(e => e.id !== id)
      }));
      setEditingEntityId(null);
    }
  };

  // Entity type colors
  const entityTypeColors = {
    'operating-company': '#2d5a3d',
    'holding-company': '#1a3a5c',
    'trust': '#7c3aed',
    'foundation': '#d97706',
    'llc': '#0891b2',
    'partnership': '#dc2626',
    'estate': '#6b21a8',
  };

  // Role colors
  const roleColors = {
    'CEO': '#2d5a3d',
    'President': '#0891b2',
    'COO': '#1a3a5c',
    'CFO': '#0891b2',
    'Board Chair': '#d97706',
    'Board Member': '#d97706',
    'Shareholder': '#7c3aed',
    'Next-Gen': '#06b6d4',
    'Spouse': '#64748b',
    'Partner': '#64748b',
    'Advisor': '#7c3aed',
  };

  // Helper to generate genogram layout
  const getGenogramLayout = () => {
    const generations = {};
    const members = familyProfile.members || [];

    members.forEach(member => {
      const gen = member.generation || 1;
      if (!generations[gen]) generations[gen] = [];
      generations[gen].push(member);
    });

    return generations;
  };

  // SVG Genogram rendering
  const renderGenogram = () => {
    const generations = getGenogramLayout();
    const members = familyProfile.members || [];
    const genCount = Object.keys(generations).length;
    const genLabels = ['G1', 'G2', 'G3', 'G4'];

    if (members.length === 0) {
      return (
        <div style={{padding: '40px', textAlign: 'center', color: '#94a3b8'}}>
          <p>Add family members to see the genogram visualization.</p>
        </div>
      );
    }

    const boxWidth = 120;
    const boxHeight = 80;
    const genHeight = 200;
    const horSpacing = 160;
    const genSpacing = 180;

    const maxMembersPerGen = Math.max(...Object.values(generations).map(g => g.length));
    const svgWidth = Math.max(800, maxMembersPerGen * horSpacing + 100);
    const svgHeight = Math.max(600, genCount * genSpacing + 100);

    return (
      <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', margin: '16px 0'}}>
        {/* Draw spouse lines */}
        {members.map(member => {
          if (!member.spouseId || member.id > member.spouseId) return null;
          const spouse = getMember(member.spouseId);
          if (!spouse) return null;

          const gen = member.generation || 1;
          const y = 80 + (gen - 1) * genSpacing;
          const membersInGen = generations[gen] || [];
          const x1 = 50 + membersInGen.indexOf(member) * horSpacing + boxWidth / 2;
          const x2 = 50 + membersInGen.indexOf(spouse) * horSpacing + boxWidth / 2;

          return (
            <line key={`spouse-${member.id}-${spouse.id}`} x1={x1} y1={y + boxHeight / 2} x2={x2} y2={y + boxHeight / 2}
              stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
          );
        })}

        {/* Draw parent-child lines */}
        {members.map(member => {
          if (!member.parentId) return null;
          const parent = getMember(member.parentId);
          if (!parent) return null;

          const parentGen = parent.generation || 1;
          const childGen = member.generation || 1;
          const parentY = 80 + (parentGen - 1) * genSpacing;
          const childY = 80 + (childGen - 1) * genSpacing;

          const parentMembers = generations[parentGen] || [];
          const childMembers = generations[childGen] || [];
          const parentX = 50 + parentMembers.indexOf(parent) * horSpacing + boxWidth / 2;
          const childX = 50 + childMembers.indexOf(member) * horSpacing + boxWidth / 2;

          return (
            <g key={`parent-${member.id}}`}>
              <line x1={parentX} y1={parentY + boxHeight} x2={parentX} y2={parentY + boxHeight + (childY - parentY - boxHeight) / 2}
                stroke="#64748b" strokeWidth="2" />
              <line x1={parentX} y1={parentY + boxHeight + (childY - parentY - boxHeight) / 2} x2={childX} y2={parentY + boxHeight + (childY - parentY - boxHeight) / 2}
                stroke="#64748b" strokeWidth="2" />
              <line x1={childX} y1={parentY + boxHeight + (childY - parentY - boxHeight) / 2} x2={childX} y2={childY}
                stroke="#64748b" strokeWidth="2" />
            </g>
          );
        })}

        {/* Draw member boxes */}
        {Object.entries(generations).map(([gen, genMembers]) => {
          const y = 80 + (parseInt(gen) - 1) * genSpacing;
          return genMembers.map((member, idx) => {
            const x = 50 + idx * horSpacing;
            const bgColor = roleColors[member.role] || '#0f172a';
            const isManaging = member.tags?.includes('managing');
            const isPassive = member.tags?.includes('passive');
            const isNextGen = member.tags?.includes('next-gen');
            const isAdvisor = member.tags?.includes('advisor');
            const isInLaw = member.tags?.includes('in-law');

            let color = '#64748b';
            if (isManaging) color = '#2d5a3d';
            else if (isPassive) color = '#0891b2';
            else if (isNextGen) color = '#06b6d4';
            else if (isInLaw) color = '#94a3b8';
            else if (isAdvisor) color = '#7c3aed';

            return (
              <g key={member.id} onClick={() => setSelectedMember(member)} style={{cursor: 'pointer'}}>
                <rect x={x} y={y} width={boxWidth} height={boxHeight} fill={color} opacity="0.15" stroke={color} strokeWidth="2" rx="6" />
                <text x={x + boxWidth / 2} y={y + 20} textAnchor="middle" fontSize="12" fontWeight="700" fill="#0f172a">
                  {member.firstName}
                </text>
                <text x={x + boxWidth / 2} y={y + 35} textAnchor="middle" fontSize="11" fill="#64748b">
                  {member.lastName}
                </text>
                <text x={x + boxWidth / 2} y={y + 50} textAnchor="middle" fontSize="10" fill="#94a3b8">
                  {member.role || 'Role'}
                </text>
                {member.ownershipPct > 0 && (
                  <text x={x + boxWidth / 2} y={y + 65} textAnchor="middle" fontSize="9" fill="#0f172a" fontWeight="600">
                    {member.ownershipPct}%
                  </text>
                )}
              </g>
            );
          });
        })}

        {/* Generation labels */}
        {Object.keys(generations).map((gen, idx) => (
          <text key={`gen-label-${gen}`} x="20" y={100 + (parseInt(gen) - 1) * genSpacing} fontSize="14" fontWeight="700" fill="#64748b">
            {genLabels[parseInt(gen) - 1]}
          </text>
        ))}
      </svg>
    );
  };

  // SVG Ownership Map rendering
  const renderOwnershipMap = () => {
    const entities = familyProfile.entities || [];
    const members = familyProfile.members || [];

    if (entities.length === 0 && members.length === 0) {
      return (
        <div style={{padding: '40px', textAlign: 'center', color: '#94a3b8'}}>
          <p>Add entities and members to see the ownership structure.</p>
        </div>
      );
    }

    const boxWidth = 140;
    const boxHeight = 60;
    const entityY = 40;
    const memberY = 300;
    const horSpacing = 200;
    const svgWidth = Math.max(900, Math.max(entities.length, members.length) * horSpacing + 100);
    const svgHeight = 500;

    return (
      <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', margin: '16px 0'}}>
        {/* Section labels */}
        <text x="20" y="30" fontSize="12" fontWeight="700" fill="#64748b" textTransform="uppercase">Entities</text>
        <text x="20" y="290" fontSize="12" fontWeight="700" fill="#64748b" textTransform="uppercase">Members</text>

        {/* Draw ownership lines from entities to members */}
        {entities.map((entity, entityIdx) => {
          const entityX = 60 + entityIdx * horSpacing + boxWidth / 2;
          const entityOwners = entity.owners || [];
          return entityOwners.map(ownership => {
            const member = getMember(ownership.memberId);
            if (!member) return null;
            const memberIdx = members.indexOf(member);
            const memberX = 60 + memberIdx * horSpacing + boxWidth / 2;
            return (
              <g key={`ownership-${entity.id}-${ownership.memberId}`}>
                <line x1={entityX} y1={entityY + boxHeight} x2={memberX} y2={memberY}
                  stroke="#94a3b8" strokeWidth="2" opacity="0.6" />
                <text x={(entityX + memberX) / 2} y={(entityY + boxHeight + memberY) / 2 - 5} fontSize="11" fill="#64748b" fontWeight="600">
                  {ownership.pct}%
                </text>
              </g>
            );
          });
        })}

        {/* Entity boxes */}
        {entities.map((entity, idx) => {
          const x = 60 + idx * horSpacing;
          const color = entityTypeColors[entity.type] || '#0f172a';
          return (
            <rect key={`entity-${entity.id}`} x={x} y={entityY} width={boxWidth} height={boxHeight}
              fill={color} opacity="0.12" stroke={color} strokeWidth="2" rx="6" onClick={() => setEditingEntityId(entity.id)} style={{cursor: 'pointer'}}
            >
              <title>{entity.name}</title>
            </rect>
          );
        })}

        {/* Entity labels */}
        {entities.map((entity, idx) => {
          const x = 60 + idx * horSpacing;
          return (
            <g key={`entity-label-${entity.id}`}>
              <text x={x + boxWidth / 2} y={entityY + 25} textAnchor="middle" fontSize="11" fontWeight="700" fill="#0f172a">
                {entity.name.length > 14 ? entity.name.substring(0, 12) + '...' : entity.name}
              </text>
              <text x={x + boxWidth / 2} y={entityY + 42} textAnchor="middle" fontSize="9" fill="#64748b">
                {entity.type.replace('-', ' ')}
              </text>
            </g>
          );
        })}

        {/* Member boxes */}
        {members.map((member, idx) => {
          const x = 60 + idx * horSpacing;
          const color = roleColors[member.role] || '#0f172a';
          return (
            <rect key={`member-${member.id}`} x={x} y={memberY} width={boxWidth} height={boxHeight}
              fill={color} opacity="0.12" stroke={color} strokeWidth="2" rx="6"
            />
          );
        })}

        {/* Member labels */}
        {members.map((member, idx) => {
          const x = 60 + idx * horSpacing;
          return (
            <g key={`member-label-${member.id}`}>
              <text x={x + boxWidth / 2} y={memberY + 22} textAnchor="middle" fontSize="10" fontWeight="700" fill="#0f172a">
                {member.firstName}
              </text>
              <text x={x + boxWidth / 2} y={memberY + 36} textAnchor="middle" fontSize="10" fontWeight="700" fill="#0f172a">
                {member.lastName}
              </text>
              <text x={x + boxWidth / 2} y={memberY + 50} textAnchor="middle" fontSize="8" fill="#64748b">
                {member.role || 'Member'}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="family-profile-view">
      <header className="page-header">
        <div>
          <h1>Family Profile</h1>
          <p className="subtitle">Central data hub for family structure, ownership, and governance.</p>
        </div>
      </header>

      {/* Tab bar */}
      <div style={{display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '2px solid #e5e7eb', paddingBottom: '0'}}>
        {[
          { id: 'members', label: 'Members & Enterprise' },
          { id: 'genogram', label: 'Family Genogram' },
          { id: 'ownership', label: 'Ownership & Entities' },
        ].map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSelectedMember(null); }}
            style={{
              padding: '10px 20px', border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600',
              background: 'none', color: activeTab === tab.id ? '#0f172a' : '#94a3b8',
              borderBottom: activeTab === tab.id ? '2px solid #0f172a' : '2px solid transparent',
              marginBottom: '-2px', transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Members & Enterprise */}
      {activeTab === 'members' && (
        <div>
          {/* Enterprise Section */}
          <div style={{background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '28px', border: '1px solid #e5e7eb'}}>
            <h3 style={{fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', marginBottom: '20px'}}>Enterprise Information</h3>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px'}}>
              {[
                { key: 'enterpriseName', label: 'Enterprise Name', type: 'text' },
                { key: 'founded', label: 'Founded', type: 'number' },
                { key: 'industry', label: 'Industry', type: 'text' },
                { key: 'headquarters', label: 'Headquarters', type: 'text' },
                { key: 'annualRevenue', label: 'Annual Revenue', type: 'text' },
                { key: 'employeeCount', label: 'Employee Count', type: 'number' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={familyProfile[field.key] || ''}
                    onChange={(e) => updateEnterprise(field.key, e.target.value)}
                    style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.9rem'}}
                    placeholder={field.label}
                  />
                </div>
              ))}
              <div>
                <label style={{display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                  Generations Involved
                </label>
                <input
                  type="number"
                  min="1" max="5"
                  value={familyProfile.generations || 1}
                  onChange={(e) => updateEnterprise('generations', parseInt(e.target.value))}
                  style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.9rem'}}
                />
              </div>
            </div>
          </div>

          {/* Members Section */}
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <h3 style={{fontSize: '0.95rem', fontWeight: '700', color: '#0f172a'}}>Family Members ({familyProfile.members?.length || 0})</h3>
              <button onClick={addMember}
                style={{background: '#0f172a', color: 'white', padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700'}}>
                + Add Member
              </button>
            </div>

            <div style={{display: 'grid', gap: '16px'}}>
              {(familyProfile.members || []).map(member => (
                <div key={member.id} style={{background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #e5e7eb'}}>
                  {editingMemberId === member.id ? (
                    // Edit mode
                    <div>
                      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '16px'}}>
                        <input type="text" placeholder="First Name" value={member.firstName} onChange={(e) => updateMember(member.id, {firstName: e.target.value})}
                          style={{padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.85rem'}} />
                        <input type="text" placeholder="Last Name" value={member.lastName} onChange={(e) => updateMember(member.id, {lastName: e.target.value})}
                          style={{padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.85rem'}} />
                        <select value={member.role} onChange={(e) => updateMember(member.id, {role: e.target.value})}
                          style={{padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.85rem'}}>
                          <option value="">Select Role</option>
                          {['CEO', 'President', 'COO', 'CFO', 'Board Chair', 'Board Member', 'Shareholder', 'Next-Gen', 'Spouse', 'Partner', 'Advisor', 'Other'].map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                        <select value={member.generation} onChange={(e) => updateMember(member.id, {generation: parseInt(e.target.value)})}
                          style={{padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.85rem'}}>
                          <option value="">Select Generation</option>
                          {[1, 2, 3, 4].map(gen => (
                            <option key={gen} value={gen}>G{gen}</option>
                          ))}
                        </select>
                        <input type="number" placeholder="Birth Year" value={member.birthYear} onChange={(e) => updateMember(member.id, {birthYear: e.target.value})}
                          style={{padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.85rem'}} />
                        <input type="email" placeholder="Email" value={member.email} onChange={(e) => updateMember(member.id, {email: e.target.value})}
                          style={{padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.85rem'}} />
                        <input type="tel" placeholder="Phone" value={member.phone} onChange={(e) => updateMember(member.id, {phone: e.target.value})}
                          style={{padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.85rem'}} />
                        <input type="number" placeholder="Ownership %" min="0" max="100" value={member.ownershipPct} onChange={(e) => updateMember(member.id, {ownershipPct: parseFloat(e.target.value)})}
                          style={{padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.85rem'}} />
                        <select value={member.parentId || ''} onChange={(e) => updateMember(member.id, {parentId: e.target.value ? parseInt(e.target.value) : null})}
                          style={{padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.85rem'}}>
                          <option value="">Select Parent</option>
                          {familyProfile.members.filter(m => m.id !== member.id && m.generation < member.generation).map(m => (
                            <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                          ))}
                        </select>
                        <select value={member.spouseId || ''} onChange={(e) => updateMember(member.id, {spouseId: e.target.value ? parseInt(e.target.value) : null})}
                          style={{padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.85rem'}}>
                          <option value="">Select Spouse</option>
                          {familyProfile.members.filter(m => m.id !== member.id).map(m => (
                            <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                          ))}
                        </select>
                        <input type="text" placeholder="Tags (comma-separated)" value={Array.isArray(member.tags) ? member.tags.join(', ') : member.tags}
                          onChange={(e) => updateMember(member.id, {tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)})}
                          style={{gridColumn: 'span 2', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.85rem'}} />
                      </div>
                      <div style={{display: 'flex', gap: '8px'}}>
                        <button onClick={() => setEditingMemberId(null)}
                          style={{background: '#2d5a3d', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600'}}>
                          Save
                        </button>
                        <button onClick={() => deleteMember(member.id)}
                          style={{background: '#dc2626', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600'}}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div onClick={() => setEditingMemberId(member.id)} style={{cursor: 'pointer'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                        <div>
                          <h4 style={{fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', marginBottom: '4px'}}>
                            {member.firstName} {member.lastName}
                          </h4>
                          <p style={{fontSize: '0.85rem', color: '#64748b', marginBottom: '8px'}}>
                            {member.role || 'No role'} • G{member.generation}
                          </p>
                          {member.email && <p style={{fontSize: '0.8rem', color: '#94a3b8'}}>{member.email}</p>}
                        </div>
                        <div style={{textAlign: 'right'}}>
                          {member.ownershipPct > 0 && <span style={{display: 'inline-block', background: '#f0fdf4', color: '#2d5a3d', padding: '4px 12px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px'}}>{member.ownershipPct}% owner</span>}
                          {member.isBoard && <span style={{display: 'inline-block', background: '#fff7ed', color: '#d97706', padding: '4px 12px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: '600', marginLeft: '4px'}}>Board</span>}
                        </div>
                      </div>
                      {member.tags && member.tags.length > 0 && (
                        <div style={{marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '4px'}}>
                          {member.tags.map(tag => (
                            <span key={tag} style={{background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '100px', fontSize: '0.75rem'}}>{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Family Genogram */}
      {activeTab === 'genogram' && (
        <div>
          <div style={{background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb'}}>
            <h3 style={{fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', marginBottom: '16px'}}>Family Structure & Relationships</h3>
            {renderGenogram()}
            {selectedMember && (
              <div style={{marginTop: '20px', background: '#f8fafc', borderRadius: '8px', padding: '16px', border: '1px solid #e5e7eb'}}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <div>
                    <h4 style={{fontSize: '0.9rem', fontWeight: '700', color: '#0f172a'}}>{selectedMember.firstName} {selectedMember.lastName}</h4>
                    <p style={{fontSize: '0.85rem', color: '#64748b'}}>G{selectedMember.generation} • {selectedMember.role}</p>
                    {selectedMember.parentId && <p style={{fontSize: '0.8rem', color: '#94a3b8'}}>Parent: {getMemberName(selectedMember.parentId)}</p>}
                    {selectedMember.spouseId && <p style={{fontSize: '0.8rem', color: '#94a3b8'}}>Spouse: {getMemberName(selectedMember.spouseId)}</p>}
                  </div>
                  <button onClick={() => setSelectedMember(null)} style={{background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem'}}>✕</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Ownership & Entity Map */}
      {activeTab === 'ownership' && (
        <div>
          <div style={{background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', marginBottom: '28px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <h3 style={{fontSize: '0.95rem', fontWeight: '700', color: '#0f172a'}}>Entities ({familyProfile.entities?.length || 0})</h3>
              <button onClick={addEntity}
                style={{background: '#0f172a', color: 'white', padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700'}}>
                + Add Entity
              </button>
            </div>

            <div style={{display: 'grid', gap: '12px', marginBottom: '20px'}}>
              {(familyProfile.entities || []).map(entity => (
                <div key={entity.id} style={{background: '#f8fafc', borderRadius: '8px', padding: '12px', border: `2px solid ${entityTypeColors[entity.type] || '#0f172a'}22`}}>
                  {editingEntityId === entity.id ? (
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px'}}>
                      <input type="text" placeholder="Entity Name" value={entity.name} onChange={(e) => updateEntity(entity.id, {name: e.target.value})}
                        style={{gridColumn: 'span 2', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.85rem'}} />
                      <select value={entity.type} onChange={(e) => updateEntity(entity.id, {type: e.target.value})}
                        style={{padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.85rem'}}>
                        <option value="operating-company">Operating Company</option>
                        <option value="holding-company">Holding Company</option>
                        <option value="trust">Trust</option>
                        <option value="foundation">Foundation</option>
                        <option value="llc">LLC</option>
                        <option value="partnership">Partnership</option>
                        <option value="estate">Estate</option>
                      </select>
                      <input type="text" placeholder="Description" value={entity.description} onChange={(e) => updateEntity(entity.id, {description: e.target.value})}
                        style={{gridColumn: 'span 2', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.85rem'}} />
                      <div style={{gridColumn: 'span 3', display: 'flex', gap: '8px'}}>
                        <button onClick={() => setEditingEntityId(null)}
                          style={{background: '#2d5a3d', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600'}}>
                          Save
                        </button>
                        <button onClick={() => deleteEntity(entity.id)}
                          style={{background: '#dc2626', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600'}}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div onClick={() => setEditingEntityId(entity.id)} style={{cursor: 'pointer'}}>
                      <h4 style={{fontSize: '0.9rem', fontWeight: '700', color: entityTypeColors[entity.type] || '#0f172a'}}>{entity.name}</h4>
                      <p style={{fontSize: '0.8rem', color: '#64748b'}}>{entity.type.replace('-', ' ')}{entity.description && ` • ${entity.description}`}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {renderOwnershipMap()}
          </div>
        </div>
      )}
    </div>
  );
}

function LEPJourneyView({ onAssessmentComplete, scores, setCurrentView, familyProfile }) {
  const [phase, setPhase] = useState(() => {
    if (!scores) return 1;
    return 1;
  });

  const phases = [
    { id: 1, name: 'Assess', subtitle: 'Where are we today?', icon: '◈', desc: 'Take the LEP Assessment to understand your family enterprise health across all six pillars.', unlocked: true },
    { id: 2, name: 'Explore', subtitle: 'What are our options?', icon: '◆', desc: 'Review transition pathways matched to your assessment results and family situation.', unlocked: !!scores },
    { id: 3, name: 'Decide', subtitle: 'How do we commit?', icon: '⚙', desc: 'Walk through the Decision Engine to align your family and create a 90-day action plan.', unlocked: !!scores },
  ];

  return (
    <div>
      <header className="page-header">
        <div>
          <h1>LEP Journey</h1>
          <p className="subtitle">Your guided path from awareness to action. Three phases. One family. One future.</p>
        </div>
      </header>

      <div style={{background: '#f8fafc', borderRadius: '12px', padding: '20px 28px', marginBottom: '24px', border: '1px solid #e5e7eb'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '0', marginBottom: '16px'}}>
          {phases.map((p, i) => (
            <React.Fragment key={p.id}>
              <div
                onClick={() => p.unlocked && setPhase(p.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', cursor: p.unlocked ? 'pointer' : 'default',
                  opacity: p.unlocked ? 1 : 0.4, flex: 1,
                }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: '700', flexShrink: 0,
                  background: phase === p.id ? '#0f172a' : p.unlocked ? '#e2e8f0' : '#f1f5f9',
                  color: phase === p.id ? 'white' : p.unlocked ? '#475569' : '#94a3b8',
                  border: phase === p.id ? '2px solid #0f172a' : '2px solid transparent',
                  transition: 'all 0.2s',
                }}>
                  {p.id}
                </div>
                <div>
                  <div style={{fontSize: '0.88rem', fontWeight: '700', color: phase === p.id ? '#0f172a' : '#64748b'}}>{p.name}</div>
                  <div style={{fontSize: '0.72rem', color: '#94a3b8'}}>{p.subtitle}</div>
                </div>
              </div>
              {i < phases.length - 1 && (
                <div style={{flex: '0 0 40px', height: '2px', background: phases[i+1].unlocked ? '#0f172a' : '#e2e8f0', margin: '0 8px', transition: 'background 0.3s'}} />
              )}
            </React.Fragment>
          ))}
        </div>
        <p style={{fontSize: '0.82rem', color: '#64748b', lineHeight: '1.5'}}>{phases.find(p => p.id === phase)?.desc}</p>
      </div>

      {phase === 1 && <Assessment onComplete={(newScores) => { onAssessmentComplete(newScores); setPhase(2); }} />}
      {phase === 2 && (scores ? <TransitionsView setCurrentView={(v) => { if (v === 'decision-engine') setPhase(3); else setCurrentView(v); }} /> : (
        <div style={{textAlign: 'center', padding: '60px 20px', color: '#94a3b8'}}>
          <div style={{fontSize: '2.5rem', marginBottom: '12px'}}>◈</div>
          <h2 style={{fontSize: '1.1rem', fontWeight: '600', color: '#64748b', marginBottom: '8px'}}>Complete Phase 1 First</h2>
          <p>Take the LEP Assessment to unlock Transition Pathways.</p>
          <button onClick={() => setPhase(1)} style={{marginTop: '16px', background: '#0f172a', color: 'white', padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600'}}>Go to Assessment</button>
        </div>
      ))}
      {phase === 3 && (scores ? <DecisionEngineView setCurrentView={(v) => { if (v === 'transitions') setPhase(2); else setCurrentView(v); }} scores={scores} /> : (
        <div style={{textAlign: 'center', padding: '60px 20px', color: '#94a3b8'}}>
          <div style={{fontSize: '2.5rem', marginBottom: '12px'}}>⚙</div>
          <h2 style={{fontSize: '1.1rem', fontWeight: '600', color: '#64748b', marginBottom: '8px'}}>Complete Phase 1 First</h2>
          <p>Take the LEP Assessment to unlock the Decision Engine.</p>
          <button onClick={() => setPhase(1)} style={{marginTop: '16px', background: '#0f172a', color: 'white', padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600'}}>Go to Assessment</button>
        </div>
      ))}
    </div>
  );
}

function FamilyDynamicsView({ familyProfile }) {
  const [activeTab, setActiveTab] = useState('relationships');
  const [relationshipRatings, setRelationshipRatings] = useState(() => {
    try { const s = localStorage.getItem('lep_dynamics_relationships'); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });
  const [communicationStyles, setCommunicationStyles] = useState(() => {
    try { const s = localStorage.getItem('lep_dynamics_styles'); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });
  const [styleAssessments, setStyleAssessments] = useState(() => {
    try { const s = localStorage.getItem('lep_dynamics_style_assessments'); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });
  const [conflicts, setConflicts] = useState(() => {
    try { const s = localStorage.getItem('lep_dynamics_conflicts'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [showNewConflict, setShowNewConflict] = useState(false);
  const [newConflictForm, setNewConflictForm] = useState({
    description: '',
    category: 'Values',
    involved: [],
    whatsTried: '',
    desiredResolution: '',
    status: 'active',
  });

  useEffect(() => {
    localStorage.setItem('lep_dynamics_relationships', JSON.stringify(relationshipRatings));
  }, [relationshipRatings]);

  useEffect(() => {
    localStorage.setItem('lep_dynamics_styles', JSON.stringify(communicationStyles));
  }, [communicationStyles]);

  useEffect(() => {
    localStorage.setItem('lep_dynamics_style_assessments', JSON.stringify(styleAssessments));
  }, [styleAssessments]);

  useEffect(() => {
    localStorage.setItem('lep_dynamics_conflicts', JSON.stringify(conflicts));
  }, [conflicts]);

  const members = familyProfile?.members || [];
  const getMemberId = (name) => name?.toLowerCase().replace(/\s+/g, '-') || '';

  // Relationship Map Tab
  const relationshipMapRender = () => {
    if (members.length === 0) {
      return (
        <div style={{textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e5e7eb'}}>
          <div style={{fontSize: '2.5rem', marginBottom: '12px'}}>◎</div>
          <h3 style={{fontSize: '1.05rem', fontWeight: '600', color: '#475569', marginBottom: '8px'}}>No Family Members Added</h3>
          <p style={{fontSize: '0.9rem', color: '#64748b', marginBottom: '16px', maxWidth: '400px'}}>Add family members in Family Profile to start mapping relationships and understanding family dynamics.</p>
        </div>
      );
    }

    const cohesionScores = Object.values(relationshipRatings).filter(v => v);
    const avgCohesion = cohesionScores.length > 0 ? Math.round((cohesionScores.reduce((a, b) => a + b, 0) / cohesionScores.length / 5) * 100) : 0;

    const colorMap = { 1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#86efac', 5: '#22c55e' };
    const labelMap = { 1: 'Strained', 2: 'Distant', 3: 'Neutral', 4: 'Positive', 5: 'Strong' };

    return (
      <div>
        <div style={{background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)', borderRadius: '12px', padding: '24px 28px', marginBottom: '28px', border: '1px solid #0284c7'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'space-between'}}>
            <div>
              <h3 style={{fontSize: '0.95rem', fontWeight: '700', color: '#0c4a6e', marginBottom: '4px'}}>Family Cohesion Score</h3>
              <p style={{fontSize: '0.85rem', color: '#0369a1'}}>Average relationship quality across all family members</p>
            </div>
            <div style={{fontSize: '2.5rem', fontWeight: '700', color: '#0284c7'}}>{avgCohesion}%</div>
          </div>
        </div>

        <div style={{background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '28px', marginBottom: '28px', overflowX: 'auto'}}>
          <h3 style={{fontSize: '0.95rem', fontWeight: '700', color: '#1f2937', marginBottom: '20px'}}>Relationship Heat Map</h3>
          <div style={{minWidth: '600px', display: 'inline-block', width: '100%'}}>
            <div style={{display: 'grid', gridTemplateColumns: `80px repeat(${members.length}, 80px)`, gap: '0px'}}>
              <div style={{background: '#f3f4f6', padding: '12px', fontWeight: '700', fontSize: '0.75rem', color: '#6b7280', textAlign: 'center', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb'}}></div>
              {members.map(m => (
                <div key={m.name} style={{background: '#f3f4f6', padding: '12px', fontWeight: '700', fontSize: '0.7rem', color: '#6b7280', textAlign: 'center', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{m.name}</div>
              ))}
              {members.map(m1 => (
                <React.Fragment key={m1.name}>
                  <div style={{background: '#f3f4f6', padding: '12px', fontWeight: '700', fontSize: '0.7rem', color: '#6b7280', textAlign: 'center', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{m1.name}</div>
                  {members.map(m2 => {
                    if (m1.name === m2.name) {
                      return (
                        <div key={`${m1.name}-${m2.name}`} style={{padding: '12px', textAlign: 'center', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', background: '#f0f9ff', fontWeight: '600', fontSize: '0.7rem', color: '#64748b'}}>—</div>
                      );
                    }
                    const key = [getMemberId(m1.name), getMemberId(m2.name)].sort().join('_');
                    const rating = relationshipRatings[key];
                    return (
                      <div
                        key={`${m1.name}-${m2.name}`}
                        onClick={() => {
                          const newRating = rating ? (rating === 5 ? 0 : rating + 1) : 1;
                          if (newRating === 0) {
                            const updated = {...relationshipRatings};
                            delete updated[key];
                            setRelationshipRatings(updated);
                          } else {
                            setRelationshipRatings({...relationshipRatings, [key]: newRating});
                          }
                        }}
                        style={{
                          padding: '12px', textAlign: 'center', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb',
                          background: rating ? colorMap[rating] : '#f9fafb', cursor: 'pointer', fontWeight: '600', fontSize: '0.75rem',
                          color: rating ? (rating >= 4 ? 'white' : 'white') : '#9ca3af', transition: 'all 0.2s',
                          border: rating ? `1px solid ${colorMap[rating]}` : '1px solid #e5e7eb'
                        }}
                        title={rating ? labelMap[rating] : 'Click to rate'}
                      >
                        {rating || '—'}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div style={{marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '16px', flexWrap: 'wrap'}}>
            {Object.entries(colorMap).map(([val, color]) => (
              <div key={val} style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#64748b'}}>
                <div style={{width: '20px', height: '20px', background: color, borderRadius: '4px'}}></div>
                {labelMap[val]}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Communication Styles Tab
  const communicationStylesRender = () => {
    if (members.length === 0) {
      return (
        <div style={{textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e5e7eb'}}>
          <div style={{fontSize: '2.5rem', marginBottom: '12px'}}>◎</div>
          <h3 style={{fontSize: '1.05rem', fontWeight: '600', color: '#475569', marginBottom: '8px'}}>No Family Members Added</h3>
          <p style={{fontSize: '0.9rem', color: '#64748b'}}>Add family members to assess communication styles.</p>
        </div>
      );
    }

    const styleQuestions = [
      { id: 1, q: 'When facing a major business decision, I prefer to...', options: [{ text: 'Decide quickly and move on', style: 'Driver' }, { text: 'Gather all data first', style: 'Analyst' }, { text: 'Discuss with everyone involved', style: 'Collaborator' }, { text: 'Consider the emotional impact', style: 'Guardian' }] },
      { id: 2, q: 'In a family disagreement, I tend to...', options: [{ text: 'State my position directly', style: 'Driver' }, { text: 'Analyze the facts', style: 'Analyst' }, { text: 'Seek compromise', style: 'Collaborator' }, { text: 'Avoid confrontation', style: 'Guardian' }] },
      { id: 3, q: 'My biggest priority for the enterprise is...', options: [{ text: 'Growth and results', style: 'Driver' }, { text: 'Systems and stability', style: 'Analyst' }, { text: 'Harmony and consensus', style: 'Collaborator' }, { text: 'Legacy and values', style: 'Guardian' }] },
      { id: 4, q: 'When giving feedback to family members, I...', options: [{ text: 'Am direct and candid', style: 'Driver' }, { text: 'Focus on specifics and evidence', style: 'Analyst' }, { text: 'Frame it positively', style: 'Collaborator' }, { text: 'Wait for the right moment', style: 'Guardian' }] },
      { id: 5, q: 'I get frustrated when family members...', options: [{ text: 'Move too slowly', style: 'Driver' }, { text: 'Make emotional decisions', style: 'Analyst' }, { text: 'Don\'t listen to everyone', style: 'Collaborator' }, { text: 'Prioritize profits over people', style: 'Guardian' }] },
      { id: 6, q: 'My communication superpower is...', options: [{ text: 'Getting to the point', style: 'Driver' }, { text: 'Being thorough', style: 'Analyst' }, { text: 'Building bridges', style: 'Collaborator' }, { text: 'Reading the room', style: 'Guardian' }] },
    ];

    const styleDescriptions = {
      Driver: { icon: '⚡', desc: 'Results-oriented, decisive, action-focused' },
      Analyst: { icon: '🔬', desc: 'Data-driven, systematic, thorough' },
      Collaborator: { icon: '🤝', desc: 'Consensus-builder, inclusive, bridge-maker' },
      Guardian: { icon: '🛡️', desc: 'Relationship-protector, values-driven, empathetic' },
    };

    const calculateStyle = (memberId) => {
      const answers = styleAssessments[memberId] || {};
      const styleCounts = { Driver: 0, Analyst: 0, Collaborator: 0, Guardian: 0 };
      Object.values(answers).forEach(style => {
        styleCounts[style]++;
      });
      const dominant = Object.keys(styleCounts).reduce((a, b) => styleCounts[a] > styleCounts[b] ? a : b);
      return dominant;
    };

    const styleComposition = {};
    members.forEach(m => {
      const style = calculateStyle(getMemberId(m.name));
      styleComposition[style] = (styleComposition[style] || 0) + 1;
    });

    const memberStyles = members.map(m => ({ name: m.name, style: calculateStyle(getMemberId(m.name)) }));

    return (
      <div>
        <div style={{background: '#f8fafc', borderRadius: '12px', padding: '24px 28px', marginBottom: '28px', border: '1px solid #e5e7eb'}}>
          <h3 style={{fontSize: '0.95rem', fontWeight: '700', color: '#1f2937', marginBottom: '16px'}}>Team Composition</h3>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'}}>
            {Object.entries(styleDescriptions).map(([style, data]) => (
              <div key={style} style={{background: 'white', borderRadius: '10px', padding: '16px', border: '1px solid #e5e7eb', textAlign: 'center'}}>
                <div style={{fontSize: '1.8rem', marginBottom: '8px'}}>{data.icon}</div>
                <h4 style={{fontSize: '0.9rem', fontWeight: '700', color: '#1f2937', marginBottom: '4px'}}>{style}</h4>
                <p style={{fontSize: '0.8rem', color: '#64748b', marginBottom: '12px'}}>{data.desc}</p>
                <div style={{fontSize: '1.5rem', fontWeight: '700', color: '#0f172a'}}>{styleComposition[style] || 0}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '28px', marginBottom: '28px'}}>
          <h3 style={{fontSize: '0.95rem', fontWeight: '700', color: '#1f2937', marginBottom: '24px'}}>Individual Assessments</h3>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px'}}>
            {members.map(m => {
              const memberId = getMemberId(m.name);
              const assessmentAnswers = styleAssessments[memberId] || {};
              const isAssessmentComplete = Object.keys(assessmentAnswers).length === 6;
              const currentStyle = memberStyles.find(ms => ms.name === m.name)?.style;
              return (
                <div key={m.name} style={{background: '#f8fafc', borderRadius: '10px', padding: '20px', border: '1px solid #e5e7eb'}}>
                  <h4 style={{fontSize: '0.9rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px'}}>{m.name}</h4>
                  {isAssessmentComplete ? (
                    <div>
                      <div style={{fontSize: '2rem', marginBottom: '8px'}}>{styleDescriptions[currentStyle]?.icon}</div>
                      <div style={{fontSize: '0.88rem', fontWeight: '700', color: '#0f172a', marginBottom: '4px'}}>{currentStyle}</div>
                      <p style={{fontSize: '0.8rem', color: '#64748b', marginBottom: '12px'}}>{styleDescriptions[currentStyle]?.desc}</p>
                      <button
                        onClick={() => {
                          const newAssessments = {...styleAssessments};
                          delete newAssessments[memberId];
                          setStyleAssessments(newAssessments);
                        }}
                        style={{width: '100%', background: 'white', border: '1px solid #e5e7eb', color: '#475569', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600'}}
                      >
                        Retake Assessment
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p style={{fontSize: '0.82rem', color: '#64748b', marginBottom: '12px'}}>Complete the assessment</p>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                        {styleQuestions.map(q => (
                          <div key={q.id}>
                            <p style={{fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '6px'}}>Q{q.id}</p>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                              {q.options.map((opt, idx) => (
                                <label key={idx} style={{display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.75rem', padding: '4px 6px', borderRadius: '4px', background: assessmentAnswers[q.id] === opt.style ? '#dbeafe' : 'transparent'}}>
                                  <input
                                    type="radio"
                                    name={`${memberId}-q${q.id}`}
                                    checked={assessmentAnswers[q.id] === opt.style}
                                    onChange={() => {
                                      const newAnswers = {...assessmentAnswers, [q.id]: opt.style};
                                      setStyleAssessments({...styleAssessments, [memberId]: newAnswers});
                                    }}
                                    style={{width: '12px', height: '12px', cursor: 'pointer'}}
                                  />
                                  <span style={{color: '#374151'}}>{opt.text.substring(0, 20)}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{background: '#fef3c7', borderRadius: '12px', padding: '20px', border: '1px solid #fcd34d', marginBottom: '28px'}}>
          <p style={{fontSize: '0.85rem', color: '#92400e', lineHeight: '1.6'}}>
            <strong>Potential Clash Zones:</strong> Driver + Guardian can create tension around speed vs. relationships. Analyst + Collaborator may struggle between data and consensus. The diversity of styles is your family's strength — understanding how each communicates helps prevent unnecessary conflict.
          </p>
        </div>
      </div>
    );
  };

  // Conflict Tracker Tab
  const conflictTrackerRender = () => {
    const activeConflicts = conflicts.filter(c => c.status === 'active');
    const monitoringConflicts = conflicts.filter(c => c.status === 'monitoring');
    const resolvedConflicts = conflicts.filter(c => c.status === 'resolved');

    const categoryColors = {
      'Values': '#8b5cf6',
      'Money/Compensation': '#f59e0b',
      'Control/Power': '#ef4444',
      'Recognition': '#06b6d4',
      'Fairness/Equity': '#10b981',
      'Succession': '#6366f1',
      'Communication': '#ec4899',
      'Boundaries': '#14b8a6',
    };

    const conflictItem = (conflict) => (
      <div key={conflict.id} style={{background: 'white', borderRadius: '10px', padding: '16px', border: `2px solid ${categoryColors[conflict.category] || '#e5e7eb'}`, marginBottom: '12px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px'}}>
          <div>
            <h4 style={{fontSize: '0.9rem', fontWeight: '700', color: '#1f2937', marginBottom: '4px'}}>{conflict.description}</h4>
            <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap'}}>
              <span style={{background: categoryColors[conflict.category], color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600'}}>{conflict.category}</span>
              <span style={{fontSize: '0.75rem', color: '#94a3b8'}}>{new Date(conflict.dateCreated).toLocaleDateString()}</span>
            </div>
          </div>
          <div style={{display: 'flex', gap: '4px'}}>
            <button
              onClick={() => {
                const updated = conflicts.map(c => c.id === conflict.id ? {...c, status: c.status === 'active' ? 'monitoring' : c.status === 'monitoring' ? 'resolved' : 'active'} : c);
                setConflicts(updated);
              }}
              style={{background: '#f0f9ff', color: '#0284c7', border: '1px solid #0284c7', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '600'}}
            >
              {conflict.status === 'active' ? 'To Monitor' : conflict.status === 'monitoring' ? 'Resolve' : 'Reopen'}
            </button>
            <button
              onClick={() => setConflicts(conflicts.filter(c => c.id !== conflict.id))}
              style={{background: '#fee2e2', color: '#dc2626', border: '1px solid #dc2626', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '600'}}
            >
              Delete
            </button>
          </div>
        </div>
        <div style={{fontSize: '0.82rem', color: '#64748b', marginBottom: '8px', lineHeight: '1.5'}}>
          <strong>Involved:</strong> {conflict.involved.join(', ') || 'Not specified'}
        </div>
        {conflict.whatsTried && (
          <div style={{fontSize: '0.82rem', color: '#64748b', marginBottom: '8px', lineHeight: '1.5'}}>
            <strong>What's been tried:</strong> {conflict.whatsTried}
          </div>
        )}
        {conflict.desiredResolution && (
          <div style={{fontSize: '0.82rem', color: '#64748b', marginBottom: '8px', lineHeight: '1.5'}}>
            <strong>Desired resolution:</strong> {conflict.desiredResolution}
          </div>
        )}
      </div>
    );

    return (
      <div>
        {activeConflicts.length > 0 && (
          <div style={{marginBottom: '28px'}}>
            <h3 style={{fontSize: '0.95rem', fontWeight: '700', color: '#dc2626', marginBottom: '16px'}}>Active Conflicts ({activeConflicts.length})</h3>
            {activeConflicts.map(c => conflictItem(c))}
          </div>
        )}

        {monitoringConflicts.length > 0 && (
          <div style={{marginBottom: '28px', opacity: 0.7}}>
            <h3 style={{fontSize: '0.95rem', fontWeight: '700', color: '#f59e0b', marginBottom: '16px'}}>Monitoring ({monitoringConflicts.length})</h3>
            {monitoringConflicts.map(c => conflictItem(c))}
          </div>
        )}

        {resolvedConflicts.length > 0 && (
          <div style={{marginBottom: '28px'}}>
            <h3 style={{fontSize: '0.95rem', fontWeight: '700', color: '#10b981', marginBottom: '16px'}}>Resolved ({resolvedConflicts.length})</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px'}}>
              {resolvedConflicts.map(c => (
                <div key={c.id} style={{background: '#f0fdf4', borderRadius: '8px', padding: '12px', border: '1px solid #86efac', opacity: 0.7}}>
                  <div style={{fontSize: '0.82rem', fontWeight: '700', color: '#166534', marginBottom: '4px'}}>{c.description}</div>
                  <div style={{fontSize: '0.7rem', color: '#64748b'}}>{new Date(c.dateCreated).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!showNewConflict ? (
          <button
            onClick={() => setShowNewConflict(true)}
            style={{background: '#0f172a', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', marginTop: '20px'}}
          >
            + Log New Conflict
          </button>
        ) : (
          <div style={{background: '#f8fafc', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb', marginTop: '20px'}}>
            <h3 style={{fontSize: '0.95rem', fontWeight: '700', color: '#1f2937', marginBottom: '16px'}}>Log Conflict</h3>
            <div style={{marginBottom: '16px'}}>
              <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px'}}>Description</label>
              <textarea
                value={newConflictForm.description}
                onChange={(e) => setNewConflictForm({...newConflictForm, description: e.target.value})}
                placeholder="Describe the tension or unresolved issue..."
                style={{width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', fontFamily: 'inherit', fontSize: '0.9rem', minHeight: '100px', boxSizing: 'border-box'}}
              />
            </div>
            <div style={{marginBottom: '16px'}}>
              <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px'}}>Category</label>
              <select
                value={newConflictForm.category}
                onChange={(e) => setNewConflictForm({...newConflictForm, category: e.target.value})}
                style={{width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.9rem', boxSizing: 'border-box'}}
              >
                {['Values', 'Money/Compensation', 'Control/Power', 'Recognition', 'Fairness/Equity', 'Succession', 'Communication', 'Boundaries'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div style={{marginBottom: '16px'}}>
              <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px'}}>Who's Involved?</label>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                {members.map(m => (
                  <label key={m.name} style={{display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '6px 10px', background: newConflictForm.involved.includes(m.name) ? '#dbeafe' : '#f0f9ff', borderRadius: '6px', border: `1px solid ${newConflictForm.involved.includes(m.name) ? '#0284c7' : '#e0f2fe'}`, fontSize: '0.85rem'}}>
                    <input
                      type="checkbox"
                      checked={newConflictForm.involved.includes(m.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewConflictForm({...newConflictForm, involved: [...newConflictForm.involved, m.name]});
                        } else {
                          setNewConflictForm({...newConflictForm, involved: newConflictForm.involved.filter(n => n !== m.name)});
                        }
                      }}
                      style={{cursor: 'pointer'}}
                    />
                    {m.name}
                  </label>
                ))}
              </div>
            </div>
            <div style={{marginBottom: '16px'}}>
              <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px'}}>What's Been Tried?</label>
              <textarea
                value={newConflictForm.whatsTried}
                onChange={(e) => setNewConflictForm({...newConflictForm, whatsTried: e.target.value})}
                placeholder="What approaches or conversations have already happened?"
                style={{width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', fontFamily: 'inherit', fontSize: '0.9rem', minHeight: '80px', boxSizing: 'border-box'}}
              />
            </div>
            <div style={{marginBottom: '16px'}}>
              <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px'}}>Desired Resolution</label>
              <textarea
                value={newConflictForm.desiredResolution}
                onChange={(e) => setNewConflictForm({...newConflictForm, desiredResolution: e.target.value})}
                placeholder="What would resolution look like for this family?"
                style={{width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', fontFamily: 'inherit', fontSize: '0.9rem', minHeight: '80px', boxSizing: 'border-box'}}
              />
            </div>
            <div style={{display: 'flex', gap: '10px'}}>
              <button
                onClick={() => {
                  setConflicts([...conflicts, {
                    id: Date.now().toString(),
                    ...newConflictForm,
                    dateCreated: new Date().toISOString(),
                  }]);
                  setNewConflictForm({description: '', category: 'Values', involved: [], whatsTried: '', desiredResolution: '', status: 'active'});
                  setShowNewConflict(false);
                }}
                style={{background: '#0f172a', color: 'white', padding: '10px 24px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem'}}
              >
                Log Conflict
              </button>
              <button
                onClick={() => {
                  setNewConflictForm({description: '', category: 'Values', involved: [], whatsTried: '', desiredResolution: '', status: 'active'});
                  setShowNewConflict(false);
                }}
                style={{background: '#f1f5f9', color: '#475569', padding: '10px 24px', borderRadius: '6px', border: '1px solid #e2e8f0', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem'}}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Alignment Score Tab
  const alignmentScoreRender = () => {
    const relationshipScores = Object.values(relationshipRatings).filter(v => v);
    const relationshipScore = relationshipScores.length > 0 ? Math.round((relationshipScores.reduce((a, b) => a + b, 0) / relationshipScores.length / 5) * 100) : 0;

    const styleDiversity = (() => {
      const styleComposition = {};
      members.forEach(m => {
        const memberId = getMemberId(m.name);
        const style = (() => {
          const answers = styleAssessments[memberId] || {};
          const styleCounts = { Driver: 0, Analyst: 0, Collaborator: 0, Guardian: 0 };
          Object.values(answers).forEach(st => styleCounts[st]++);
          return Object.keys(styleCounts).reduce((a, b) => styleCounts[a] > styleCounts[b] ? a : b);
        })();
        styleComposition[style] = (styleComposition[style] || 0) + 1;
      });
      const uniqueStyles = Object.keys(styleComposition).length;
      return Math.round((uniqueStyles / 4) * 100);
    })();

    const conflictLoad = (() => {
      const activeCount = conflicts.filter(c => c.status === 'active').length;
      const totalMembers = members.length || 1;
      const conflictRatio = Math.min(activeCount / (totalMembers * 2), 1);
      return Math.round((1 - conflictRatio) * 100);
    })();

    const overallScore = Math.round((relationshipScore * 0.35 + styleDiversity * 0.25 + conflictLoad * 0.4) / 1);

    return (
      <div>
        <div style={{background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', borderRadius: '12px', padding: '32px 28px', marginBottom: '28px', border: '1px solid #2d5a3d'}}>
          <div style={{textAlign: 'center', marginBottom: '24px'}}>
            <div style={{fontSize: '4rem', fontWeight: '700', color: '#166534', marginBottom: '12px'}}>{overallScore}%</div>
            <h2 style={{fontSize: '1.2rem', fontWeight: '700', color: '#1a3a1a', marginBottom: '8px'}}>Family Alignment Score</h2>
            <p style={{fontSize: '0.9rem', color: '#4b5563', maxWidth: '500px'}}>Your family's overall alignment across relationships, communication compatibility, and conflict resolution capacity.</p>
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '28px'}}>
          <div style={{background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb'}}>
            <div style={{fontSize: '0.9rem', fontWeight: '700', color: '#1f2937', marginBottom: '16px'}}>Relationship Cohesion</div>
            <div style={{height: '8px', background: '#e5e7eb', borderRadius: '4px', marginBottom: '12px', overflow: 'hidden'}}>
              <div style={{height: '100%', background: '#059669', width: `${relationshipScore}%`, transition: 'width 0.3s'}}></div>
            </div>
            <div style={{fontSize: '1.5rem', fontWeight: '700', color: '#059669', marginBottom: '4px'}}>{relationshipScore}%</div>
            <p style={{fontSize: '0.8rem', color: '#64748b'}}>Average relationship quality</p>
          </div>

          <div style={{background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb'}}>
            <div style={{fontSize: '0.9rem', fontWeight: '700', color: '#1f2937', marginBottom: '16px'}}>Communication Diversity</div>
            <div style={{height: '8px', background: '#e5e7eb', borderRadius: '4px', marginBottom: '12px', overflow: 'hidden'}}>
              <div style={{height: '100%', background: '#0284c7', width: `${styleDiversity}%`, transition: 'width 0.3s'}}></div>
            </div>
            <div style={{fontSize: '1.5rem', fontWeight: '700', color: '#0284c7', marginBottom: '4px'}}>{styleDiversity}%</div>
            <p style={{fontSize: '0.8rem', color: '#64748b'}}>Diversity of styles present</p>
          </div>

          <div style={{background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb'}}>
            <div style={{fontSize: '0.9rem', fontWeight: '700', color: '#1f2937', marginBottom: '16px'}}>Conflict Health</div>
            <div style={{height: '8px', background: '#e5e7eb', borderRadius: '4px', marginBottom: '12px', overflow: 'hidden'}}>
              <div style={{height: '100%', background: '#f59e0b', width: `${conflictLoad}%`, transition: 'width 0.3s'}}></div>
            </div>
            <div style={{fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b', marginBottom: '4px'}}>{conflictLoad}%</div>
            <p style={{fontSize: '0.8rem', color: '#64748b'}}>Low active conflict count</p>
          </div>
        </div>

        <div style={{background: '#fef3c7', borderRadius: '12px', padding: '20px', border: '1px solid #fcd34d'}}>
          <p style={{fontSize: '0.85rem', color: '#92400e', lineHeight: '1.6'}}>
            <strong>Recommendations:</strong> {
              relationshipScore < 60 ? "Consider a family retreat or facilitated conversation to strengthen relationships. " : ""
            }
            {
              styleDiversity < 50 ? "Limited communication diversity in your family. Focus on understanding different perspectives. " : ""
            }
            {
              conflictLoad < 50 ? "Your family has significant unresolved tension. Schedule a structured conversation or bring in a facilitator. " : ""
            }
            {
              relationshipScore >= 60 && styleDiversity >= 50 && conflictLoad >= 50 ? "Your family shows strong alignment. Keep building on this foundation through regular check-ins and communication." : ""
            }
          </p>
        </div>
      </div>
    );
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <h1>Family Dynamics</h1>
          <p className="subtitle">Understand relationships, communication styles, conflicts, and family alignment.</p>
        </div>
      </header>

      <div style={{display: 'flex', gap: '12px', borderBottom: '1px solid #e5e7eb', marginBottom: '28px', overflowX: 'auto'}}>
        {[
          { id: 'relationships', name: 'Relationships', icon: '◎' },
          { id: 'communication', name: 'Communication', icon: '💬' },
          { id: 'conflicts', name: 'Conflicts', icon: '⚡' },
          { id: 'alignment', name: 'Alignment', icon: '🎯' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 16px', borderBottom: activeTab === tab.id ? '3px solid #0f172a' : '3px solid transparent',
              background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: activeTab === tab.id ? '700' : '500',
              color: activeTab === tab.id ? '#0f172a' : '#64748b', transition: 'all 0.2s', whiteSpace: 'nowrap'
            }}
          >
            {tab.icon} {tab.name}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'relationships' && relationshipMapRender()}
        {activeTab === 'communication' && communicationStylesRender()}
        {activeTab === 'conflicts' && conflictTrackerRender()}
        {activeTab === 'alignment' && alignmentScoreRender()}
      </div>
    </div>
  );
}

function MeetingsView({ familyProfile }) {
  const [meetings, setMeetings] = useState(() => {
    try { const s = localStorage.getItem('lep_meetings'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [showNewMeeting, setShowNewMeeting] = useState(false);
  const [issuesList, setIssuesList] = useState(() => {
    try { const s = localStorage.getItem('lep_issues'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [newIssue, setNewIssue] = useState('');
  const [activeTab, setActiveTab] = useState('meetings'); // meetings | issues | actions

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [liveText, setLiveText] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [processingDone, setProcessingDone] = useState(false);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // Auto-save
  useEffect(() => { localStorage.setItem('lep_meetings', JSON.stringify(meetings)); }, [meetings]);
  useEffect(() => { localStorage.setItem('lep_issues', JSON.stringify(issuesList)); }, [issuesList]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch(e) {} }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert('Speech recognition is not supported in this browser. Please use Chrome.'); return; }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = '';
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += t + '. ';
        } else {
          interim += t;
        }
      }
      if (finalText) {
        setTranscript(prev => prev + finalText + '\n');
      }
      setLiveText(interim);
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') return; // Normal — just no audio detected
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone access in your browser settings.');
        stopRecording();
      }
    };

    recognition.onend = () => {
      // Auto-restart if still recording (speech recognition stops after silence)
      // Use recognitionRef as signal — if it's still set, we're still recording
      if (recognitionRef.current === recognition) {
        try { recognition.start(); } catch(e) {}
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setIsPaused(false);
    setRecordingTime(0);
    setTranscript('');
    setLiveText('');
    setProcessingDone(false);

    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const pauseRecording = () => {
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch(e) {} }
    setIsPaused(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const resumeRecording = () => {
    if (recognitionRef.current) { try { recognitionRef.current.start(); } catch(e) {} }
    setIsPaused(false);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch(e) {} recognitionRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setIsRecording(false);
    setIsPaused(false);
    setLiveText('');
    setShowTranscript(true);
  };

  const processTranscript = (meetingId) => {
    const meeting = meetings.find(m => m.id === meetingId);
    const tmpl = meeting ? MEETING_TEMPLATES[meeting.type] : null;
    const parsed = parseTranscript(transcript, tmpl);

    // Merge parsed results into meeting
    const mergedNotes = { ...(meeting.agendaNotes || {}) };
    Object.entries(parsed.agendaNotes).forEach(([key, val]) => {
      mergedNotes[key] = mergedNotes[key] ? mergedNotes[key] + '\n--- From Recording ---\n' + val : val;
    });

    const mergedActions = [...(meeting.actionItems || []), ...parsed.actionItems];

    updateMeeting(meetingId, {
      agendaNotes: mergedNotes,
      actionItems: mergedActions,
      transcript: (meeting.transcript || '') + '\n' + transcript,
    });

    // Add issues to the resolution queue
    if (parsed.issues.length > 0) {
      setIssuesList(prev => [...prev, ...parsed.issues]);
    }

    setProcessingDone(true);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // All action items across all meetings
  const allActions = meetings.flatMap(m => (m.actionItems || []).map(a => ({ ...a, meetingId: m.id, meetingName: `${MEETING_TEMPLATES[m.type]?.name || m.type} — ${m.date}` })));
  const openActions = allActions.filter(a => !a.done);

  const createMeeting = (type) => {
    const template = MEETING_TEMPLATES[type];
    const meeting = {
      id: Date.now(),
      type,
      date: new Date().toISOString().split('T')[0],
      status: 'in-progress',
      attendees: '',
      agendaNotes: {},
      actionItems: [],
      rating: null,
      minutes: '',
    };
    setMeetings(prev => [meeting, ...prev]);
    setActiveMeeting(meeting.id);
    setShowNewMeeting(false);
  };

  const updateMeeting = (id, updates) => {
    setMeetings(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const addActionItem = (meetingId) => {
    const item = { id: Date.now(), text: '', owner: '', due: '', done: false };
    setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, actionItems: [...(m.actionItems || []), item] } : m));
  };

  const updateActionItem = (meetingId, itemId, updates) => {
    setMeetings(prev => prev.map(m => m.id === meetingId ? {
      ...m, actionItems: (m.actionItems || []).map(a => a.id === itemId ? { ...a, ...updates } : a)
    } : m));
  };

  const meeting = meetings.find(m => m.id === activeMeeting);
  const template = meeting ? MEETING_TEMPLATES[meeting.type] : null;

  return (
    <div className="meetings-view">
      <header className="page-header">
        <div>
          <h1>Meeting Center</h1>
          <p className="subtitle">Structured governance meetings. Agenda. Issues. Action items. Accountability.</p>
        </div>
      </header>

      {/* Tab bar */}
      <div style={{display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '2px solid #e5e7eb', paddingBottom: '0'}}>
        {[
          { id: 'meetings', label: 'Meetings', count: meetings.length },
          { id: 'issues', label: 'Resolution Queue', count: issuesList.filter(i => !i.resolved).length },
          { id: 'actions', label: 'Action Items', count: openActions.length },
        ].map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setActiveMeeting(null); }}
            style={{
              padding: '10px 20px', border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600',
              background: 'none', color: activeTab === tab.id ? '#0f172a' : '#94a3b8',
              borderBottom: activeTab === tab.id ? '2px solid #0f172a' : '2px solid transparent',
              marginBottom: '-2px', transition: 'all 0.15s',
            }}
          >
            {tab.label} {tab.count > 0 && <span style={{background: activeTab === tab.id ? '#0f172a' : '#e5e7eb', color: activeTab === tab.id ? 'white' : '#64748b', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '100px', marginLeft: '6px'}}>{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* ─── MEETINGS TAB ─── */}
      {activeTab === 'meetings' && !activeMeeting && (
        <div>
          {/* New meeting selector */}
          <div style={{marginBottom: '28px'}}>
            <button onClick={() => setShowNewMeeting(!showNewMeeting)}
              style={{background: '#0f172a', color: 'white', padding: '10px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600'}}>
              + New Meeting
            </button>
          </div>

          {showNewMeeting && (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px', marginBottom: '28px'}}>
              {Object.entries(MEETING_TEMPLATES).map(([key, tmpl]) => (
                <div key={key} onClick={() => createMeeting(key)}
                  style={{background: 'white', borderRadius: '12px', padding: '20px', border: `2px solid ${tmpl.color}22`, cursor: 'pointer', transition: 'all 0.15s', ':hover': {borderColor: tmpl.color}}}
                >
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px'}}>
                    <span style={{fontSize: '1.5rem'}}>{tmpl.icon}</span>
                    <div>
                      <h4 style={{fontSize: '0.92rem', fontWeight: '700', color: tmpl.color}}>{tmpl.name}</h4>
                      <span style={{fontSize: '0.75rem', color: '#94a3b8'}}>{tmpl.frequency} · {tmpl.duration}</span>
                    </div>
                  </div>
                  <p style={{fontSize: '0.78rem', color: '#64748b'}}>{tmpl.agenda.length} agenda items</p>
                </div>
              ))}
            </div>
          )}

          {/* Meeting history */}
          {meetings.length === 0 ? (
            <div style={{textAlign: 'center', padding: '60px 20px', color: '#94a3b8'}}>
              <p style={{fontSize: '1.1rem', marginBottom: '8px'}}>No meetings yet.</p>
              <p style={{fontSize: '0.88rem'}}>Click "+ New Meeting" to start your first governance meeting with a structured agenda.</p>
            </div>
          ) : (
            <div>
              <h3 style={{fontSize: '0.85rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px'}}>Meeting History</h3>
              {meetings.map(m => {
                const tmpl = MEETING_TEMPLATES[m.type];
                const actionCount = (m.actionItems || []).length;
                const doneCount = (m.actionItems || []).filter(a => a.done).length;
                return (
                  <div key={m.id} onClick={() => setActiveMeeting(m.id)}
                    style={{background: 'white', borderRadius: '10px', padding: '16px 20px', marginBottom: '8px', border: '1px solid #e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.15s'}}
                  >
                    <span style={{fontSize: '1.4rem'}}>{tmpl?.icon || '📋'}</span>
                    <div style={{flex: 1}}>
                      <h4 style={{fontSize: '0.92rem', fontWeight: '700', color: '#1a3a5c'}}>{tmpl?.name || m.type}</h4>
                      <span style={{fontSize: '0.78rem', color: '#94a3b8'}}>{m.date}</span>
                    </div>
                    {actionCount > 0 && (
                      <span style={{fontSize: '0.75rem', background: doneCount === actionCount ? '#f0fdf4' : '#fffbeb', color: doneCount === actionCount ? '#2d5a3d' : '#d97706', padding: '3px 10px', borderRadius: '100px', fontWeight: '600'}}>
                        {doneCount}/{actionCount} actions
                      </span>
                    )}
                    {m.rating && <span style={{fontSize: '0.75rem', color: '#94a3b8'}}>{m.rating}/10</span>}
                    <span style={{color: '#94a3b8', fontSize: '0.85rem'}}>→</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── ACTIVE MEETING VIEW ─── */}
      {activeTab === 'meetings' && activeMeeting && meeting && template && (
        <div>
          <button onClick={() => setActiveMeeting(null)} style={{background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '16px', padding: 0}}>
            ← Back to all meetings
          </button>

          <div style={{background: `linear-gradient(135deg, ${template.color} 0%, ${template.color}dd 100%)`, borderRadius: '12px', padding: '24px', color: 'white', marginBottom: '24px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'}}>
              <div>
                <h2 style={{fontSize: '1.3rem', fontWeight: '700', color: 'white', marginBottom: '4px'}}>{template.icon} {template.name}</h2>
                <p style={{fontSize: '0.88rem', opacity: 0.8}}>{meeting.date} · {template.duration} · {template.frequency}</p>
              </div>
              <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', minWidth: '250px'}}>
                {familyProfile && familyProfile.members && familyProfile.members.length > 0 ? (
                  familyProfile.members.map(member => {
                    const attendeeList = meeting.attendees ? meeting.attendees.split(',').map(a => a.trim()).filter(a => a) : [];
                    const memberName = `${member.firstName} ${member.lastName}`.trim();
                    const isAttending = attendeeList.includes(String(member.id)) || attendeeList.includes(memberName);
                    return (
                      <label key={member.id} style={{display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'white', fontSize: '0.85rem', background: isAttending ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '6px', transition: 'all 0.2s'}}>
                        <input type="checkbox" checked={isAttending} onChange={(e) => {
                          const attendeeList = meeting.attendees ? meeting.attendees.split(',').map(a => a.trim()).filter(a => a) : [];
                          const idx = attendeeList.indexOf(String(member.id));
                          if (e.target.checked && idx === -1) {
                            attendeeList.push(String(member.id));
                          } else if (!e.target.checked && idx !== -1) {
                            attendeeList.splice(idx, 1);
                          }
                          updateMeeting(meeting.id, { attendees: attendeeList.join(', ') });
                        }} style={{cursor: 'pointer'}} />
                        {member.firstName} {member.lastName}
                      </label>
                    );
                  })
                ) : (
                  <input type="text" placeholder="Add family members to profile for quick selection..." value={meeting.attendees || ''}
                    onChange={(e) => updateMeeting(meeting.id, { attendees: e.target.value })}
                    style={{padding: '0', border: 'none', background: 'transparent', color: 'white', fontSize: '0.85rem', flex: 1, minWidth: '150px'}}
                    disabled
                  />
                )}
              </div>
            </div>
          </div>

          {/* ─── MEETING RECORDER ─── */}
          <div style={{background: isRecording ? '#fef2f2' : '#f0fdf4', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px', border: `2px solid ${isRecording ? '#fca5a5' : '#bbf7d0'}`, transition: 'all 0.3s'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                {isRecording && (
                  <div style={{width: '12px', height: '12px', borderRadius: '50%', background: isPaused ? '#fbbf24' : '#dc2626', animation: isPaused ? 'none' : 'pulse 1.5s infinite', flexShrink: 0}} />
                )}
                <div>
                  <h4 style={{fontSize: '0.9rem', fontWeight: '700', color: '#1a3a5c', marginBottom: '2px'}}>
                    {isRecording ? (isPaused ? 'Recording Paused' : 'Recording...') : processingDone ? 'Recording Processed' : 'Meeting Recorder'}
                  </h4>
                  <p style={{fontSize: '0.75rem', color: '#64748b'}}>
                    {isRecording ? `${formatTime(recordingTime)} — Speak naturally, we\'ll capture notes and action items.` :
                     processingDone ? 'Transcript has been processed into your agenda notes, action items, and resolution queue.' :
                     'Record your meeting to auto-populate agenda notes, action items, and issues.'}
                  </p>
                </div>
              </div>
              <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                {isRecording && <span style={{fontSize: '1rem', fontFamily: 'monospace', fontWeight: '700', color: '#dc2626', minWidth: '50px'}}>{formatTime(recordingTime)}</span>}
                {!isRecording && !transcript && (
                  <button onClick={startRecording}
                    style={{background: '#dc2626', color: 'white', padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px'}}>
                    <span style={{width: '10px', height: '10px', borderRadius: '50%', background: 'white', flexShrink: 0}} /> Start Recording
                  </button>
                )}
                {isRecording && !isPaused && (
                  <>
                    <button onClick={pauseRecording}
                      style={{background: '#fbbf24', color: '#78350f', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600'}}>
                      Pause
                    </button>
                    <button onClick={stopRecording}
                      style={{background: '#0f172a', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600'}}>
                      Stop
                    </button>
                  </>
                )}
                {isRecording && isPaused && (
                  <>
                    <button onClick={resumeRecording}
                      style={{background: '#dc2626', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600'}}>
                      Resume
                    </button>
                    <button onClick={stopRecording}
                      style={{background: '#0f172a', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600'}}>
                      Stop
                    </button>
                  </>
                )}
                {!isRecording && transcript && !processingDone && (
                  <>
                    <button onClick={() => processTranscript(meeting.id)}
                      style={{background: '#2d5a3d', color: 'white', padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700'}}>
                      Process Recording
                    </button>
                    <button onClick={() => setShowTranscript(!showTranscript)}
                      style={{background: 'white', color: '#64748b', padding: '8px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600'}}>
                      {showTranscript ? 'Hide' : 'View'} Transcript
                    </button>
                  </>
                )}
                {processingDone && (
                  <button onClick={() => { setTranscript(''); setProcessingDone(false); setShowTranscript(false); setRecordingTime(0); }}
                    style={{background: 'white', color: '#64748b', padding: '8px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600'}}>
                    New Recording
                  </button>
                )}
              </div>
            </div>

            {/* Live transcription preview */}
            {isRecording && (liveText || transcript) && (
              <div style={{marginTop: '12px', background: 'rgba(255,255,255,0.7)', borderRadius: '8px', padding: '10px 14px', maxHeight: '80px', overflow: 'auto', fontSize: '0.82rem', color: '#374151', lineHeight: '1.5'}}>
                {transcript.split('\n').slice(-3).map((line, i) => (
                  <div key={i} style={{opacity: 0.7}}>{line}</div>
                ))}
                {liveText && <div style={{color: '#dc2626', fontStyle: 'italic'}}>{liveText}</div>}
              </div>
            )}

            {/* Full transcript view */}
            {showTranscript && !isRecording && transcript && (
              <div style={{marginTop: '12px'}}>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  rows="8"
                  style={{width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.82rem', fontFamily: 'inherit', lineHeight: '1.6', resize: 'vertical', background: 'white'}}
                  placeholder="Transcript will appear here..."
                />
                <p style={{fontSize: '0.72rem', color: '#94a3b8', marginTop: '6px'}}>
                  You can edit the transcript before processing. The system will extract action items, issues, and route notes to the right agenda sections.
                </p>
              </div>
            )}
          </div>

          {/* Agenda items */}
          {template.agenda.map((item, idx) => (
            <div key={item.id} style={{background: 'white', borderRadius: '10px', padding: '16px 20px', marginBottom: '8px', border: '1px solid #e5e7eb'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <span style={{background: template.color, color: 'white', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '700', flexShrink: 0}}>{idx + 1}</span>
                  <div>
                    <h4 style={{fontSize: '0.92rem', fontWeight: '700', color: '#1a3a5c'}}>{item.name}</h4>
                    <p style={{fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px'}}>{item.desc}</p>
                  </div>
                </div>
                <span style={{fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600', whiteSpace: 'nowrap', marginLeft: '12px'}}>{item.duration}</span>
              </div>
              <textarea
                rows="2"
                placeholder={item.id === 'resolve' ? 'Issue 1: ...\nIssue 2: ...' : 'Notes...'}
                value={(meeting.agendaNotes || {})[item.id] || ''}
                onChange={(e) => updateMeeting(meeting.id, { agendaNotes: { ...(meeting.agendaNotes || {}), [item.id]: e.target.value } })}
                style={{width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.85rem', resize: 'vertical', fontFamily: 'inherit', marginTop: '8px', lineHeight: '1.5', background: '#fafafa'}}
              />
            </div>
          ))}

          {/* Action Items section */}
          <div style={{background: '#f8fafc', borderRadius: '12px', padding: '20px', marginTop: '20px', marginBottom: '16px', border: '1px solid #e5e7eb'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
              <h3 style={{fontSize: '1rem', fontWeight: '700', color: '#1a3a5c'}}>Action Items</h3>
              <button onClick={() => addActionItem(meeting.id)}
                style={{background: '#0f172a', color: 'white', padding: '6px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600'}}>
                + Add
              </button>
            </div>
            {(meeting.actionItems || []).length === 0 ? (
              <p style={{fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', padding: '12px 0'}}>No action items yet. Add one above.</p>
            ) : (
              <div style={{display: 'grid', gap: '6px'}}>
                {(meeting.actionItems || []).map(item => (
                  <div key={item.id} style={{display: 'flex', gap: '8px', alignItems: 'center', background: 'white', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb'}}>
                    <input type="checkbox" checked={item.done}
                      onChange={(e) => updateActionItem(meeting.id, item.id, { done: e.target.checked })}
                      style={{width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2d5a3d', flexShrink: 0}}
                    />
                    <input type="text" placeholder="Action item..." value={item.text}
                      onChange={(e) => updateActionItem(meeting.id, item.id, { text: e.target.value })}
                      style={{flex: 1, padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.85rem', textDecoration: item.done ? 'line-through' : 'none', color: item.done ? '#94a3b8' : '#1e293b'}}
                    />
                    <input type="text" placeholder="Owner" value={item.owner}
                      onChange={(e) => updateActionItem(meeting.id, item.id, { owner: e.target.value })}
                      style={{width: '100px', padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.82rem'}}
                    />
                    <input type="date" value={item.due}
                      onChange={(e) => updateActionItem(meeting.id, item.id, { due: e.target.value })}
                      style={{padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.82rem'}}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Meeting rating */}
          <div style={{background: 'white', borderRadius: '10px', padding: '16px 20px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap'}}>
            <span style={{fontSize: '0.88rem', fontWeight: '600', color: '#1a3a5c'}}>Rate this meeting:</span>
            <div style={{display: 'flex', gap: '4px'}}>
              {[1,2,3,4,5,6,7,8,9,10].map(v => (
                <button key={v} onClick={() => updateMeeting(meeting.id, { rating: v })}
                  style={{
                    width: '32px', height: '32px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                    fontSize: '0.82rem', fontWeight: '600',
                    background: meeting.rating === v ? '#0f172a' : meeting.rating && v <= meeting.rating ? '#0f172a' : '#f1f5f9',
                    color: meeting.rating && v <= meeting.rating ? 'white' : '#64748b',
                  }}
                >{v}</button>
              ))}
            </div>
            {meeting.rating && <span style={{fontSize: '0.82rem', color: meeting.rating >= 8 ? '#2d5a3d' : meeting.rating >= 6 ? '#d97706' : '#dc2626', fontWeight: '600'}}>
              {meeting.rating >= 8 ? 'Great meeting!' : meeting.rating >= 6 ? 'Good — room to improve.' : 'Below standard — let\'s fix it.'}
            </span>}
          </div>
        </div>
      )}

      {/* ─── RESOLUTION QUEUE TAB (Identify, Clarify, Act) ─── */}
      {activeTab === 'issues' && (
        <div>
          <div style={{background: '#f8fafc', borderRadius: '12px', padding: '20px', marginBottom: '20px', border: '1px solid #e5e7eb'}}>
            <h3 style={{fontSize: '1rem', fontWeight: '700', color: '#1a3a5c', marginBottom: '8px'}}>Resolve — Identify, Clarify, Act</h3>
            <p style={{fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', marginBottom: '16px'}}>
              The master resolution queue. Any family member can add an issue anytime. Issues get prioritized and resolved in your next meeting using the ICA process: Identify the real issue, Clarify it openly, Act with a clear commitment.
            </p>
            <div style={{display: 'flex', gap: '8px'}}>
              <input type="text" placeholder="Add an issue..." value={newIssue}
                onChange={(e) => setNewIssue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && newIssue.trim()) { setIssuesList(prev => [...prev, { id: Date.now(), text: newIssue.trim(), priority: 'medium', addedBy: '', date: new Date().toISOString().split('T')[0], resolved: false, resolution: '' }]); setNewIssue(''); }}}
                style={{flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem'}}
              />
              <select id="issue-priority" style={{padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.85rem'}}>
                <option value="high">High</option>
                <option value="medium" selected>Medium</option>
                <option value="low">Low</option>
              </select>
              <button onClick={() => {
                if (newIssue.trim()) {
                  const priority = document.getElementById('issue-priority')?.value || 'medium';
                  setIssuesList(prev => [...prev, { id: Date.now(), text: newIssue.trim(), priority, addedBy: '', date: new Date().toISOString().split('T')[0], resolved: false, resolution: '' }]);
                  setNewIssue('');
                }
              }} style={{background: '#0f172a', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', whiteSpace: 'nowrap'}}>
                + Add
              </button>
            </div>
          </div>

          {/* Open issues */}
          <h4 style={{fontSize: '0.82rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px'}}>
            Open Issues ({issuesList.filter(i => !i.resolved).length})
          </h4>
          {issuesList.filter(i => !i.resolved).length === 0 ? (
            <p style={{fontSize: '0.88rem', color: '#94a3b8', textAlign: 'center', padding: '32px 0'}}>No open issues. That's either great news or no one's been honest yet.</p>
          ) : (
            issuesList.filter(i => !i.resolved).map(issue => (
              <div key={issue.id} style={{background: 'white', borderRadius: '10px', padding: '14px 18px', marginBottom: '6px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px'}}>
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                  background: issue.priority === 'high' ? '#dc2626' : issue.priority === 'medium' ? '#d97706' : '#94a3b8',
                }} />
                <span style={{flex: 1, fontSize: '0.88rem', color: '#1e293b'}}>{issue.text}</span>
                <span style={{fontSize: '0.72rem', color: '#94a3b8'}}>{issue.date}</span>
                <button onClick={() => setIssuesList(prev => prev.map(i => i.id === issue.id ? { ...i, resolved: true } : i))}
                  style={{background: '#f0fdf4', color: '#2d5a3d', padding: '4px 12px', borderRadius: '6px', border: '1px solid #2d5a3d33', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600'}}>
                  Resolve
                </button>
              </div>
            ))
          )}

          {/* Resolved issues */}
          {issuesList.filter(i => i.resolved).length > 0 && (
            <div style={{marginTop: '24px'}}>
              <h4 style={{fontSize: '0.82rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px'}}>
                Resolved ({issuesList.filter(i => i.resolved).length})
              </h4>
              {issuesList.filter(i => i.resolved).map(issue => (
                <div key={issue.id} style={{background: '#fafafa', borderRadius: '8px', padding: '10px 14px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <span style={{color: '#2d5a3d', fontSize: '0.85rem'}}>✓</span>
                  <span style={{flex: 1, fontSize: '0.82rem', color: '#94a3b8', textDecoration: 'line-through'}}>{issue.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── ACTION ITEMS TAB ─── */}
      {activeTab === 'actions' && (
        <div>
          <div style={{background: '#f8fafc', borderRadius: '12px', padding: '20px', marginBottom: '20px', border: '1px solid #e5e7eb'}}>
            <h3 style={{fontSize: '1rem', fontWeight: '700', color: '#1a3a5c', marginBottom: '4px'}}>Action Items — All Meetings</h3>
            <p style={{fontSize: '0.85rem', color: '#64748b'}}>
              Every action item from every meeting, in one place. {openActions.length} open, {allActions.length - openActions.length} completed.
            </p>
          </div>

          {openActions.length === 0 && allActions.length === 0 ? (
            <p style={{fontSize: '0.88rem', color: '#94a3b8', textAlign: 'center', padding: '40px 0'}}>No action items yet. They'll appear here as you run meetings.</p>
          ) : (
            <div>
              {openActions.length > 0 && (
                <div style={{marginBottom: '24px'}}>
                  <h4 style={{fontSize: '0.82rem', fontWeight: '700', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px'}}>Open ({openActions.length})</h4>
                  {openActions.map(item => (
                    <div key={`${item.meetingId}-${item.id}`} style={{background: 'white', borderRadius: '8px', padding: '12px 16px', marginBottom: '6px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <input type="checkbox" checked={false}
                        onChange={() => updateActionItem(item.meetingId, item.id, { done: true })}
                        style={{width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2d5a3d', flexShrink: 0}}
                      />
                      <div style={{flex: 1}}>
                        <span style={{fontSize: '0.88rem', color: '#1e293b'}}>{item.text || '(no description)'}</span>
                        <div style={{fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px'}}>{item.meetingName}</div>
                      </div>
                      {item.owner && <span style={{fontSize: '0.78rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: '#475569'}}>{item.owner}</span>}
                      {item.due && <span style={{fontSize: '0.78rem', color: new Date(item.due) < new Date() ? '#dc2626' : '#94a3b8', fontWeight: new Date(item.due) < new Date() ? '600' : '400'}}>{item.due}</span>}
                    </div>
                  ))}
                </div>
              )}

              {allActions.filter(a => a.done).length > 0 && (
                <div>
                  <h4 style={{fontSize: '0.82rem', fontWeight: '700', color: '#2d5a3d', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px'}}>Completed ({allActions.filter(a => a.done).length})</h4>
                  {allActions.filter(a => a.done).map(item => (
                    <div key={`${item.meetingId}-${item.id}`} style={{background: '#fafafa', borderRadius: '6px', padding: '8px 14px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <span style={{color: '#2d5a3d'}}>✓</span>
                      <span style={{fontSize: '0.82rem', color: '#94a3b8', textDecoration: 'line-through', flex: 1}}>{item.text}</span>
                      {item.owner && <span style={{fontSize: '0.72rem', color: '#94a3b8'}}>{item.owner}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const VAULT_CATEGORIES = [
  { id: 'financial', name: 'Financial', icon: '💰', color: '#2d5a3d', accepts: ['P&L / Income Statement', 'Balance Sheet', 'Cash Flow Statement', 'Tax Returns', 'Valuation Reports', 'Distribution Records', 'Budget / Forecast'] },
  { id: 'legal', name: 'Legal & Governance', icon: '⚖️', color: '#7c3aed', accepts: ['Operating Agreement', 'Buy-Sell Agreement', 'Shareholder Agreement', 'Family Constitution', 'Bylaws', 'Trust Documents', 'Estate Plans'] },
  { id: 'succession', name: 'Succession & Transition', icon: '🔄', color: '#d97706', accepts: ['Succession Plan', 'Leadership Development Plan', 'Transition Timeline', 'Key Person Assessment', 'Exit Strategy', 'Continuity Plan'] },
  { id: 'family', name: 'Family', icon: '👥', color: '#0891b2', accepts: ['Family Meeting Minutes', 'Family Employment Policy', 'Compensation Policy', 'Conflict Resolution Policy', 'Code of Conduct', 'Family History / Legacy'] },
  { id: 'reports', name: 'LEP Reports', icon: '📊', color: '#64748b', accepts: ['Assessment Reports', 'Health Reports', 'Decision Engine Output', 'Pillar Analysis'] },
];

function parseFinancialCSV(text) {
  const lines = text.trim().split('\n').map(l => l.split(',').map(c => c.trim().replace(/^"|"$/g, '')));
  if (lines.length < 2) return null;
  const headers = lines[0];
  const rows = lines.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i] || ''; });
    return obj;
  });
  return { headers, rows };
}

function analyzeFinancialData(parsed) {
  if (!parsed || !parsed.rows.length) return null;
  const numericCols = parsed.headers.filter(h => {
    return parsed.rows.some(r => {
      const v = (r[h] || '').replace(/[$,%()]/g, '').trim();
      return !isNaN(parseFloat(v)) && v !== '';
    });
  });

  const analysis = { metrics: [], trends: [], alerts: [] };

  numericCols.forEach(col => {
    const values = parsed.rows.map(r => {
      const raw = (r[col] || '').replace(/[$,%()]/g, '').trim();
      return parseFloat(raw);
    }).filter(v => !isNaN(v));
    if (values.length === 0) return;
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const latest = values[values.length - 1];
    const prior = values.length > 1 ? values[values.length - 2] : null;
    const change = prior ? ((latest - prior) / Math.abs(prior) * 100) : null;

    analysis.metrics.push({ name: col, latest, avg: Math.round(avg * 100) / 100, min, max, change: change ? Math.round(change * 10) / 10 : null, count: values.length });

    if (change !== null) {
      if (change > 20) analysis.trends.push({ metric: col, direction: 'up', pct: change, note: `${col} increased ${Math.abs(change).toFixed(1)}% — strong positive trend.` });
      else if (change < -20) analysis.trends.push({ metric: col, direction: 'down', pct: change, note: `${col} declined ${Math.abs(change).toFixed(1)}% — review recommended.` });
    }

    if (col.toLowerCase().includes('debt') && latest > avg * 1.5) analysis.alerts.push(`${col} is significantly above average — elevated risk.`);
    if (col.toLowerCase().includes('cash') && latest < avg * 0.5) analysis.alerts.push(`${col} is well below average — liquidity concern.`);
    if (col.toLowerCase().includes('margin') && latest < 10) analysis.alerts.push(`${col} at ${latest}% — below healthy threshold for most family enterprises.`);
  });

  return analysis;
}

function VaultView({ vaultDocuments }) {
  const [expandedPillar, setExpandedPillar] = useState(null);
  const [activeVaultTab, setActiveVaultTab] = useState('uploaded'); // uploaded | generated | analysis
  const [uploadedDocs, setUploadedDocs] = useState(() => {
    try { const s = localStorage.getItem('lep_vault_uploads'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [dragOver, setDragOver] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [uploadCategory, setUploadCategory] = useState('financial');
  const [uploadSubtype, setUploadSubtype] = useState('');

  useEffect(() => { localStorage.setItem('lep_vault_uploads', JSON.stringify(uploadedDocs)); }, [uploadedDocs]);

  // Group documents by pillar (for generated docs)
  const documentsByPillar = {};
  LEP_PILLARS.forEach(p => { documentsByPillar[p.id] = []; });
  documentsByPillar['assessment'] = [];
  vaultDocuments.forEach(doc => { if (documentsByPillar[doc.pillar]) documentsByPillar[doc.pillar].push(doc); });

  const handleDownloadDocument = (doc) => {
    const doc_instance = parseNarrativeToDocx(doc.fullContent, doc.title);
    Packer.toBlob(doc_instance).then(blob => {
      const filename = `${doc.title.replace(/\s+/g, '_')}_${doc.date.split('T')[0]}.docx`;
      saveAs(blob, filename);
    });
  };

  const handleFileUpload = (files) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const isCSV = file.name.endsWith('.csv');
        const isPDF = file.name.endsWith('.pdf');
        const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
        const isText = file.name.endsWith('.txt') || file.name.endsWith('.md');

        let parsedData = null;
        let textContent = '';

        if (isCSV || isText) {
          textContent = content;
          if (isCSV) parsedData = parseFinancialCSV(content);
        }

        const doc = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type || (isCSV ? 'text/csv' : isPDF ? 'application/pdf' : isExcel ? 'application/excel' : 'text/plain'),
          category: uploadCategory,
          subtype: uploadSubtype || VAULT_CATEGORIES.find(c => c.id === uploadCategory)?.accepts[0] || 'Other',
          uploadDate: new Date().toISOString(),
          textContent: textContent.substring(0, 50000),
          parsedData,
          hasAnalysis: !!parsedData,
          ext: file.name.split('.').pop().toLowerCase(),
        };

        setUploadedDocs(prev => [doc, ...prev]);

        if (parsedData) {
          setSelectedDoc(doc);
          setAnalysisResult(analyzeFinancialData(parsedData));
          setActiveVaultTab('analysis');
        }
      };

      if (file.name.endsWith('.csv') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
        // Store metadata only for binary files
        const doc = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          category: uploadCategory,
          subtype: uploadSubtype || VAULT_CATEGORIES.find(c => c.id === uploadCategory)?.accepts[0] || 'Other',
          uploadDate: new Date().toISOString(),
          textContent: '',
          parsedData: null,
          hasAnalysis: false,
          ext: file.name.split('.').pop().toLowerCase(),
        };
        setUploadedDocs(prev => [doc, ...prev]);
      }
    });
  };

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleFileUpload(e.dataTransfer.files); };
  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => { setDragOver(false); };

  const analyzeDoc = (doc) => {
    setSelectedDoc(doc);
    if (doc.parsedData) {
      setAnalysisResult(analyzeFinancialData(doc.parsedData));
    } else if (doc.textContent) {
      const parsed = parseFinancialCSV(doc.textContent);
      if (parsed) setAnalysisResult(analyzeFinancialData(parsed));
      else setAnalysisResult({ metrics: [], trends: [], alerts: ['Could not parse structured data from this file. Upload a CSV with headers for full analysis.'] });
    } else {
      setAnalysisResult({ metrics: [], trends: [], alerts: ['Binary files (PDF, Excel) require server-side parsing. CSV files can be analyzed immediately.'] });
    }
    setActiveVaultTab('analysis');
  };

  const uploadedByCategory = {};
  VAULT_CATEGORIES.forEach(c => { uploadedByCategory[c.id] = uploadedDocs.filter(d => d.category === c.id); });

  const fileInputRef = React.createRef();
  const totalDocs = uploadedDocs.length + vaultDocuments.length;
  const docHealth = totalDocs === 0 ? 0 : Math.min(100, Math.round((totalDocs / 15) * 100));

  return (
    <div className="vault-view">
      <header className="page-header">
        <div>
          <h1>Document Vault</h1>
          <p className="subtitle">Upload, organize, and analyze your family enterprise documents. Your secure digital filing cabinet.</p>
        </div>
      </header>

      {/* Document Health Score */}
      <div style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', borderRadius: '12px', padding: '20px 28px', marginBottom: '24px', color: 'white', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap'}}>
        <div style={{textAlign: 'center', minWidth: '80px'}}>
          <div style={{fontSize: '2rem', fontWeight: '800', lineHeight: 1}}>{docHealth}%</div>
          <div style={{fontSize: '0.72rem', opacity: 0.7, marginTop: '4px'}}>Document Health</div>
        </div>
        <div style={{flex: 1, minWidth: '200px'}}>
          <div style={{height: '8px', background: 'rgba(255,255,255,0.15)', borderRadius: '100px', overflow: 'hidden'}}>
            <div style={{height: '100%', width: `${docHealth}%`, background: docHealth >= 70 ? '#4ade80' : docHealth >= 40 ? '#fbbf24' : '#f87171', borderRadius: '100px', transition: 'width 0.5s'}} />
          </div>
          <p style={{fontSize: '0.78rem', opacity: 0.7, marginTop: '6px'}}>
            {totalDocs} document{totalDocs !== 1 ? 's' : ''} stored. {docHealth < 40 ? 'Upload key financial and legal documents to improve coverage.' : docHealth < 70 ? 'Good start. Add succession and governance documents for comprehensive coverage.' : 'Strong document coverage across your enterprise.'}
          </p>
        </div>
        <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
          {VAULT_CATEGORIES.slice(0, 4).map(cat => {
            const count = (uploadedByCategory[cat.id] || []).length;
            return (
              <div key={cat.id} style={{textAlign: 'center', minWidth: '50px'}}>
                <div style={{fontSize: '1rem'}}>{cat.icon}</div>
                <div style={{fontSize: '0.85rem', fontWeight: '700'}}>{count}</div>
                <div style={{fontSize: '0.6rem', opacity: 0.6}}>{cat.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '2px solid #e5e7eb'}}>
        {[
          { id: 'uploaded', label: 'Uploaded Documents', count: uploadedDocs.length },
          { id: 'generated', label: 'Generated Reports', count: vaultDocuments.length },
          { id: 'analysis', label: 'Analysis', count: analysisResult ? 1 : 0 },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveVaultTab(tab.id)}
            style={{padding: '10px 20px', border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600', background: 'none', color: activeVaultTab === tab.id ? '#0f172a' : '#94a3b8', borderBottom: activeVaultTab === tab.id ? '2px solid #0f172a' : '2px solid transparent', marginBottom: '-2px', transition: 'all 0.15s'}}>
            {tab.label} {tab.count > 0 && <span style={{background: activeVaultTab === tab.id ? '#0f172a' : '#e5e7eb', color: activeVaultTab === tab.id ? 'white' : '#64748b', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '100px', marginLeft: '6px'}}>{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* ─── UPLOADED DOCUMENTS TAB ─── */}
      {activeVaultTab === 'uploaded' && (
        <div>
          {/* Upload zone */}
          <div
            onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? '#2d5a3d' : '#d1d5db'}`, borderRadius: '12px', padding: '40px', textAlign: 'center', cursor: 'pointer',
              background: dragOver ? '#f0fdf4' : '#fafafa', transition: 'all 0.2s', marginBottom: '20px',
            }}>
            <div style={{fontSize: '2.5rem', marginBottom: '8px'}}>📄</div>
            <h3 style={{fontSize: '1rem', fontWeight: '700', color: '#1a3a5c', marginBottom: '6px'}}>Drop files here or click to upload</h3>
            <p style={{fontSize: '0.82rem', color: '#94a3b8'}}>CSV, PDF, Excel, Word, Text — up to 10MB per file</p>
            <input ref={fileInputRef} type="file" multiple accept=".csv,.pdf,.xlsx,.xls,.doc,.docx,.txt,.md" onChange={(e) => handleFileUpload(e.target.files)} style={{display: 'none'}} />
          </div>

          {/* Category & subtype selector */}
          <div style={{display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap'}}>
            {VAULT_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => { setUploadCategory(cat.id); setUploadSubtype(''); }}
                style={{padding: '8px 16px', borderRadius: '8px', border: `1px solid ${uploadCategory === cat.id ? cat.color : '#e5e7eb'}`, background: uploadCategory === cat.id ? cat.color + '11' : 'white', color: uploadCategory === cat.id ? cat.color : '#64748b', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s'}}>
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          {/* Subtype chips */}
          {VAULT_CATEGORIES.find(c => c.id === uploadCategory) && (
            <div style={{display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap'}}>
              {VAULT_CATEGORIES.find(c => c.id === uploadCategory).accepts.map(sub => (
                <button key={sub} onClick={() => setUploadSubtype(sub)}
                  style={{padding: '5px 12px', borderRadius: '100px', border: `1px solid ${uploadSubtype === sub ? '#0f172a' : '#e5e7eb'}`, background: uploadSubtype === sub ? '#0f172a' : 'white', color: uploadSubtype === sub ? 'white' : '#64748b', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.15s'}}>
                  {sub}
                </button>
              ))}
            </div>
          )}

          {/* Uploaded documents by category */}
          {uploadedDocs.length === 0 ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>
              <p style={{fontSize: '1rem', marginBottom: '6px'}}>No documents uploaded yet.</p>
              <p style={{fontSize: '0.85rem'}}>Start by uploading your financial statements, legal agreements, or governance documents.</p>
            </div>
          ) : (
            <div>
              {VAULT_CATEGORIES.map(cat => {
                const docs = uploadedByCategory[cat.id] || [];
                if (docs.length === 0) return null;
                return (
                  <div key={cat.id} style={{marginBottom: '20px'}}>
                    <h3 style={{fontSize: '0.82rem', fontWeight: '700', color: cat.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <span>{cat.icon}</span> {cat.name} <span style={{background: '#e5e7eb', color: '#64748b', fontSize: '0.7rem', padding: '1px 8px', borderRadius: '100px'}}>{docs.length}</span>
                    </h3>
                    {docs.map(doc => (
                      <div key={doc.id} style={{background: 'white', borderRadius: '10px', padding: '14px 18px', marginBottom: '6px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.15s'}}>
                        <span style={{fontSize: '1.3rem'}}>
                          {doc.ext === 'csv' ? '📊' : doc.ext === 'pdf' ? '📕' : doc.ext === 'xlsx' || doc.ext === 'xls' ? '📗' : doc.ext === 'docx' || doc.ext === 'doc' ? '📘' : '📄'}
                        </span>
                        <div style={{flex: 1}}>
                          <h4 style={{fontSize: '0.9rem', fontWeight: '600', color: '#1a3a5c'}}>{doc.name}</h4>
                          <div style={{display: 'flex', gap: '12px', marginTop: '2px'}}>
                            <span style={{fontSize: '0.75rem', color: '#94a3b8'}}>{doc.subtype}</span>
                            <span style={{fontSize: '0.75rem', color: '#94a3b8'}}>{(doc.size / 1024).toFixed(0)} KB</span>
                            <span style={{fontSize: '0.75rem', color: '#94a3b8'}}>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {doc.hasAnalysis && (
                          <button onClick={() => analyzeDoc(doc)}
                            style={{background: '#2d5a3d', color: 'white', padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600'}}>
                            Analyze
                          </button>
                        )}
                        <button onClick={() => setUploadedDocs(prev => prev.filter(d => d.id !== doc.id))}
                          style={{background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem', padding: '4px 8px'}}>✕</button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── GENERATED REPORTS TAB ─── */}
      {activeVaultTab === 'generated' && (
        <div>
          {vaultDocuments.length === 0 ? (
            <div style={{textAlign: 'center', padding: '60px 20px', color: '#94a3b8'}}>
              <div style={{fontSize: '2.5rem', marginBottom: '12px'}}>📁</div>
              <h2 style={{fontSize: '1.1rem', fontWeight: '600', color: '#64748b', marginBottom: '6px'}}>No Generated Reports Yet</h2>
              <p style={{fontSize: '0.88rem'}}>Complete your Assessment or generate a Health Report to see documents here.</p>
            </div>
          ) : (
            <div className="vault-grid">
              {LEP_PILLARS.map(pillar => {
                const docs = documentsByPillar[pillar.id] || [];
                return (
                  <div key={pillar.id} className="vault-folder" style={{'--pillar-color': pillar.color}}>
                    <div className="folder-header" onClick={() => setExpandedPillar(expandedPillar === pillar.id ? null : pillar.id)}>
                      <span className="folder-icon">{pillar.icon}</span>
                      <h4>{pillar.name}</h4>
                      <span className="folder-count">{docs.length}</span>
                    </div>
                    {expandedPillar === pillar.id && (
                      <div className="folder-content">
                        {docs.length > 0 ? (
                          <div className="document-list">
                            {docs.map(doc => (
                              <div key={doc.id} className="document-item">
                                <div className="document-info">
                                  <h5>{doc.title}</h5>
                                  <p className="document-date">{new Date(doc.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                  <p className="document-preview">{doc.preview}</p>
                                </div>
                                <button className="btn btn-outline btn-sm" onClick={() => handleDownloadDocument(doc)}>Download</button>
                              </div>
                            ))}
                          </div>
                        ) : (<p className="folder-empty">No documents yet</p>)}
                      </div>
                    )}
                  </div>
                );
              })}
              {documentsByPillar['assessment'].length > 0 && (
                <div className="vault-folder" style={{'--pillar-color': '#666666'}}>
                  <div className="folder-header" onClick={() => setExpandedPillar(expandedPillar === 'assessment' ? null : 'assessment')}>
                    <span className="folder-icon">📊</span>
                    <h4>Assessment Reports</h4>
                    <span className="folder-count">{documentsByPillar['assessment'].length}</span>
                  </div>
                  {expandedPillar === 'assessment' && (
                    <div className="folder-content">
                      <div className="document-list">
                        {documentsByPillar['assessment'].map(doc => (
                          <div key={doc.id} className="document-item">
                            <div className="document-info">
                              <h5>{doc.title}</h5>
                              <p className="document-date">{new Date(doc.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                              <p className="document-preview">{doc.preview}</p>
                            </div>
                            <button className="btn btn-outline btn-sm" onClick={() => handleDownloadDocument(doc)}>Download</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── ANALYSIS TAB ─── */}
      {activeVaultTab === 'analysis' && (
        <div>
          {!analysisResult ? (
            <div style={{textAlign: 'center', padding: '60px 20px', color: '#94a3b8'}}>
              <div style={{fontSize: '2.5rem', marginBottom: '12px'}}>📈</div>
              <h2 style={{fontSize: '1.1rem', fontWeight: '600', color: '#64748b', marginBottom: '6px'}}>No Analysis Yet</h2>
              <p style={{fontSize: '0.88rem'}}>Upload a CSV financial statement and click "Analyze" to see insights here.</p>
            </div>
          ) : (
            <div>
              {selectedDoc && (
                <div style={{background: '#f8fafc', borderRadius: '10px', padding: '16px 20px', marginBottom: '20px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <span style={{fontSize: '1.3rem'}}>📊</span>
                  <div>
                    <h3 style={{fontSize: '0.95rem', fontWeight: '700', color: '#1a3a5c'}}>Analyzing: {selectedDoc.name}</h3>
                    <span style={{fontSize: '0.78rem', color: '#94a3b8'}}>{selectedDoc.subtype} — uploaded {new Date(selectedDoc.uploadDate).toLocaleDateString()}</span>
                  </div>
                </div>
              )}

              {/* Alerts */}
              {analysisResult.alerts.length > 0 && (
                <div style={{marginBottom: '20px'}}>
                  <h3 style={{fontSize: '0.85rem', fontWeight: '700', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px'}}>Alerts</h3>
                  {analysisResult.alerts.map((alert, i) => (
                    <div key={i} style={{background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', marginBottom: '6px', fontSize: '0.85rem', color: '#991b1b'}}>
                      {alert}
                    </div>
                  ))}
                </div>
              )}

              {/* Metrics */}
              {analysisResult.metrics.length > 0 && (
                <div style={{marginBottom: '20px'}}>
                  <h3 style={{fontSize: '0.85rem', fontWeight: '700', color: '#1a3a5c', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px'}}>Key Metrics</h3>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px'}}>
                    {analysisResult.metrics.map((m, i) => (
                      <div key={i} style={{background: 'white', borderRadius: '10px', padding: '16px', border: '1px solid #e5e7eb'}}>
                        <div style={{fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px'}}>{m.name}</div>
                        <div style={{fontSize: '1.5rem', fontWeight: '800', color: '#0f172a'}}>{typeof m.latest === 'number' ? m.latest.toLocaleString() : m.latest}</div>
                        <div style={{display: 'flex', gap: '12px', marginTop: '8px', fontSize: '0.75rem', color: '#64748b'}}>
                          <span>Avg: {m.avg?.toLocaleString()}</span>
                          {m.change !== null && (
                            <span style={{color: m.change >= 0 ? '#2d5a3d' : '#dc2626', fontWeight: '600'}}>
                              {m.change >= 0 ? '+' : ''}{m.change}%
                            </span>
                          )}
                        </div>
                        <div style={{fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px'}}>Range: {m.min?.toLocaleString()} — {m.max?.toLocaleString()} ({m.count} periods)</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trends */}
              {analysisResult.trends.length > 0 && (
                <div style={{marginBottom: '20px'}}>
                  <h3 style={{fontSize: '0.85rem', fontWeight: '700', color: '#1a3a5c', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px'}}>Trends</h3>
                  {analysisResult.trends.map((t, i) => (
                    <div key={i} style={{background: t.direction === 'up' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${t.direction === 'up' ? '#bbf7d0' : '#fecaca'}`, borderRadius: '8px', padding: '12px 16px', marginBottom: '6px', fontSize: '0.85rem', color: t.direction === 'up' ? '#166534' : '#991b1b', display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <span style={{fontSize: '1.1rem'}}>{t.direction === 'up' ? '📈' : '📉'}</span>
                      {t.note}
                    </div>
                  ))}
                </div>
              )}

              {/* Raw data preview */}
              {selectedDoc?.parsedData && (
                <div style={{marginBottom: '20px'}}>
                  <h3 style={{fontSize: '0.85rem', fontWeight: '700', color: '#1a3a5c', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px'}}>Data Preview (first 10 rows)</h3>
                  <div style={{overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '10px'}}>
                    <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem'}}>
                      <thead>
                        <tr style={{background: '#f8fafc'}}>
                          {selectedDoc.parsedData.headers.map((h, i) => (
                            <th key={i} style={{padding: '10px 14px', textAlign: 'left', fontWeight: '700', color: '#1a3a5c', borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap'}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDoc.parsedData.rows.slice(0, 10).map((row, ri) => (
                          <tr key={ri} style={{background: ri % 2 === 0 ? 'white' : '#fafafa'}}>
                            {selectedDoc.parsedData.headers.map((h, ci) => (
                              <td key={ci} style={{padding: '8px 14px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap'}}>{row[h]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SETTINGS VIEW ──────────────────────────────────────────
function SettingsView({ currentUser, onLogout, onTierChange }) {
  const [upgrading, setUpgrading] = useState(false);
  const TIERS = [
    { id: 'free', name: 'Explorer', price: 'Free', features: ['LEP Assessment', 'LEP Score & Dashboard', 'Family Profile (Basic)', '1 Family Member'], color: '#64748b', current: currentUser?.tier === 'free' },
    { id: 'pro', name: 'Pro', price: '$99/mo', features: ['Everything in Explorer', 'Full LEP Journey (3 Phases)', 'Family Dynamics Module', 'Valuation Engine', 'Document Vault', 'Up to 10 Family Members', 'Meeting Recorder & Notes', 'Priority Support'], color: '#2d5a3d', current: currentUser?.tier === 'pro', recommended: true },
    { id: 'enterprise', name: 'Enterprise', price: '$499/mo', features: ['Everything in Pro', 'Unlimited Family Members', 'Advisor Portal Access', 'Multi-Entity Management', 'Custom Reporting', 'White-Glove Onboarding', 'Dedicated Account Manager', 'API Access'], color: '#1a3a5c', current: currentUser?.tier === 'enterprise' },
  ];

  const handleUpgrade = async (tierId) => {
    setUpgrading(true);
    try {
      const result = await payments.checkout(tierId, currentUser?.email, currentUser?.id);
      if (result?.simulated) {
        // localStorage mode — instant upgrade
        if (onTierChange) onTierChange(tierId);
      }
      // If Stripe is configured, user gets redirected to Stripe Checkout
    } catch (err) {
      alert('Upgrade failed: ' + (err.message || 'Please try again.'));
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div style={{maxWidth: '900px'}}>
      <div className="page-header"><div><h1>Settings</h1><p className="subtitle">Manage your account, team, and subscription.</p></div></div>

      {/* Account Info */}
      <div style={{background: 'white', borderRadius: '12px', padding: '28px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
        <h3 style={{fontSize: '1rem', fontWeight: 600, color: '#1a2744', marginBottom: '20px'}}>Account</h3>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
          <div><span style={{fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px'}}>Name</span><span style={{fontWeight: 500}}>{currentUser?.name}</span></div>
          <div><span style={{fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px'}}>Email</span><span style={{fontWeight: 500}}>{currentUser?.email}</span></div>
          <div><span style={{fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px'}}>Enterprise</span><span style={{fontWeight: 500}}>{currentUser?.orgName || 'Not set'}</span></div>
          <div><span style={{fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px'}}>Role</span><span style={{fontWeight: 500, textTransform: 'capitalize'}}>{currentUser?.role?.replace('-', ' ') || 'Owner'}</span></div>
        </div>
      </div>

      {/* Subscription Tiers */}
      <div style={{background: 'white', borderRadius: '12px', padding: '28px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
        <h3 style={{fontSize: '1rem', fontWeight: 600, color: '#1a2744', marginBottom: '6px'}}>Subscription</h3>
        <p style={{fontSize: '0.85rem', color: '#64748b', marginBottom: '24px'}}>Choose the plan that fits your family enterprise.</p>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px'}}>
          {TIERS.map(tier => (
            <div key={tier.id} style={{border: tier.current ? `2px solid ${tier.color}` : '1.5px solid #e2e8f0', borderRadius: '12px', padding: '24px', position: 'relative', background: tier.current ? `${tier.color}08` : 'white'}}>
              {tier.recommended && <div style={{position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#2d5a3d', color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '3px 12px', borderRadius: '10px', letterSpacing: '0.5px'}}>RECOMMENDED</div>}
              <h4 style={{fontSize: '1.1rem', fontWeight: 700, color: tier.color, marginBottom: '4px'}}>{tier.name}</h4>
              <div style={{fontSize: '1.6rem', fontWeight: 700, color: '#0a0f1c', marginBottom: '16px'}}>{tier.price}</div>
              <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                {tier.features.map((f, i) => <li key={i} style={{fontSize: '0.82rem', color: '#475569', padding: '4px 0', display: 'flex', alignItems: 'flex-start', gap: '8px'}}><span style={{color: tier.color, flexShrink: 0}}>✓</span>{f}</li>)}
              </ul>
              <button onClick={() => !tier.current && handleUpgrade(tier.id)} style={{width: '100%', marginTop: '20px', padding: '10px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: tier.current ? 'default' : 'pointer', background: tier.current ? '#f1f5f9' : tier.color, color: tier.current ? '#64748b' : 'white', border: 'none', opacity: upgrading ? 0.6 : 1}} disabled={tier.current || upgrading}>
                {tier.current ? 'Current Plan' : upgrading ? 'Processing...' : `Upgrade to ${tier.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Status */}
      <div style={{background: 'white', borderRadius: '12px', padding: '28px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
        <h3 style={{fontSize: '1rem', fontWeight: 600, color: '#1a2744', marginBottom: '16px'}}>Platform</h3>
        <div style={{display: 'flex', gap: '24px', flexWrap: 'wrap'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <div style={{width: '8px', height: '8px', borderRadius: '50%', background: hasSupabase ? '#22c55e' : '#f59e0b'}} />
            <span style={{fontSize: '0.85rem', color: '#475569'}}>{hasSupabase ? 'Cloud database active' : 'Local storage (upgrade to cloud by adding Supabase)'}</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <div style={{width: '8px', height: '8px', borderRadius: '50%', background: hasStripe ? '#22c55e' : '#f59e0b'}} />
            <span style={{fontSize: '0.85rem', color: '#475569'}}>{hasStripe ? 'Payments active' : 'Payments ready (add Stripe keys to activate)'}</span>
          </div>
        </div>
        {currentUser?.tier !== 'free' && (
          <button onClick={() => payments.openPortal()} style={{marginTop: '16px', padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer'}}>
            Manage Subscription
          </button>
        )}
      </div>

      {/* Danger Zone */}
      <div style={{background: 'white', borderRadius: '12px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: '3px solid #f87171'}}>
        <h3 style={{fontSize: '1rem', fontWeight: 600, color: '#dc2626', marginBottom: '12px'}}>Danger Zone</h3>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div><p style={{fontWeight: 500, marginBottom: '2px'}}>Sign out of LEP Hub</p><p style={{fontSize: '0.82rem', color: '#94a3b8'}}>You can sign back in at any time.</p></div>
          <button onClick={onLogout} style={{padding: '8px 20px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'}}>Sign Out</button>
        </div>
      </div>
    </div>
  );
}

// ─── TRANSITIONS VIEW ──────────────────────────────────────────
function TransitionsView({ setCurrentView }) {
  const [selectedPathway, setSelectedPathway] = useState(null);
  const [showFamilyVoice, setShowFamilyVoice] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [showDisclaimers, setShowDisclaimers] = useState(false);
  const [dismissedOnboarding, setDismissedOnboarding] = useState(() => {
    try { return localStorage.getItem('lep_onboarding_done') === 'true'; } catch { return false; }
  });

  const onboardingSteps = [
    { title: 'Welcome to Your Transition Journey', desc: 'LEP Hub walks you through the most important decision your family will ever make — step by step. No jargon. No pressure. Just clarity.', icon: '👋' },
    { title: 'Start With the Family Voice', desc: 'Before any numbers, strategies, or advisors — every family member gets heard. The Family Voice Assessment gives each person space to share what the business means to them.', icon: '🗣️' },
    { title: 'Explore Six Pathways', desc: 'From PE sale to next-gen takeover, each pathway has its own financial, emotional, and relational dimensions. Click any card below to learn more.', icon: '🧭' },
    { title: 'Use the Decision Engine', desc: 'When you\'re ready, the 6-phase Decision Engine guides your family through readiness, alignment, financial reality, and pathway matching. Estimated time: 4-6 weeks.', icon: '⚙️' },
  ];

  const dismissOnboarding = () => {
    setDismissedOnboarding(true);
    try { localStorage.setItem('lep_onboarding_done', 'true'); } catch {}
  };

  return (
    <div className="transitions-view">
      <header className="page-header">
        <div>
          <h1>Transitions</h1>
          <p className="subtitle">Every pathway has financial, emotional, and relational dimensions. Explore them all.</p>
        </div>
      </header>

      {/* ─── GUIDED ONBOARDING (one-time, permanently dismissible) ── */}
      {!dismissedOnboarding && (
        <div style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '16px', padding: '32px', color: 'white', marginBottom: '32px', position: 'relative'}}>
          <button onClick={() => { dismissOnboarding(); }} style={{position: 'absolute', top: '12px', right: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '1.2rem'}}>✕</button>
          <div style={{display: 'flex', gap: '8px', marginBottom: '20px'}}>
            {onboardingSteps.map((_, i) => (
              <div key={i} onClick={() => setOnboardingStep(i)} style={{
                height: '4px', flex: 1, borderRadius: '2px', cursor: 'pointer',
                background: i <= onboardingStep ? '#4ade80' : 'rgba(255,255,255,0.15)',
                transition: 'background 0.3s ease',
              }} />
            ))}
          </div>
          <div style={{display: 'flex', alignItems: 'flex-start', gap: '16px'}}>
            <span style={{fontSize: '2.5rem'}}>{onboardingSteps[onboardingStep].icon}</span>
            <div style={{flex: 1}}>
              <h2 style={{fontSize: '1.3rem', fontWeight: '700', color: 'white', marginBottom: '8px'}}>{onboardingSteps[onboardingStep].title}</h2>
              <p style={{fontSize: '0.95rem', opacity: 0.85, lineHeight: '1.6', maxWidth: '600px'}}>{onboardingSteps[onboardingStep].desc}</p>
            </div>
          </div>
          <div style={{display: 'flex', gap: '12px', marginTop: '20px'}}>
            {onboardingStep > 0 && (
              <button onClick={() => setOnboardingStep(onboardingStep - 1)} style={{background: 'rgba(255,255,255,0.1)', color: 'white', padding: '8px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '0.85rem'}}>← Back</button>
            )}
            {onboardingStep < onboardingSteps.length - 1 ? (
              <button onClick={() => setOnboardingStep(onboardingStep + 1)} style={{background: '#4ade80', color: '#0f172a', padding: '8px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600'}}>Next →</button>
            ) : (
              <button onClick={() => { dismissOnboarding(); }} style={{background: '#4ade80', color: '#0f172a', padding: '8px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600'}}>Got It — Let's Go →</button>
            )}
            <button onClick={() => { dismissOnboarding(); }} style={{background: 'none', color: 'rgba(255,255,255,0.5)', padding: '8px 16px', border: 'none', cursor: 'pointer', fontSize: '0.82rem'}}>Skip tour</button>
          </div>
        </div>
      )}

      {/* Advisor panel removed — Steve: features that aren't real yet are noise */}

      {/* ─── INDUSTRY FILTER — Clean Dropdown ─────────────── */}
      <div style={{marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px'}}>
        <select
          value={selectedIndustry || ''}
          onChange={(e) => setSelectedIndustry(e.target.value || null)}
          style={{padding: '8px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.88rem', color: '#374151', background: 'white', cursor: 'pointer', minWidth: '200px'}}
        >
          <option value="">All Industries</option>
          {Object.entries(INDUSTRY_PROFILES).map(([name, profile]) => (
            <option key={name} value={name}>{profile.icon} {name}</option>
          ))}
        </select>
        {selectedIndustry && INDUSTRY_PROFILES[selectedIndustry] && (
          <p style={{fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: '1.4', flex: 1}}>
            {INDUSTRY_PROFILES[selectedIndustry].tip}
          </p>
        )}
      </div>

      {/* Pre-Exit Readiness Banner */}
      <div className="transition-banner" style={{background: 'linear-gradient(135deg, #1a3a5c 0%, #2d5a3d 100%)', borderRadius: '12px', padding: '28px 32px', color: 'white', marginBottom: '32px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'}}>
          <div>
            <h2 style={{fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px', color: 'white'}}>Are You Ready for a Transition?</h2>
            <p style={{opacity: 0.9, fontSize: '0.95rem', maxWidth: '600px', lineHeight: '1.5'}}>
              Whether PE is knocking, the next generation is stepping up, or you're exploring your options — start with the Family Voice Assessment. Every family member gets heard before any decision is made.
            </p>
          </div>
          <button
            className="btn"
            style={{background: 'white', color: '#1a3a5c', fontWeight: '600', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', border: 'none', whiteSpace: 'nowrap'}}
            onClick={() => setShowFamilyVoice(true)}
          >
            Start Family Voice Assessment →
          </button>
        </div>
      </div>

      {/* Family Voice Assessment Modal */}
      {showFamilyVoice && (
        <div style={{background: '#f8fafc', border: '2px solid #2d5a3d', borderRadius: '12px', padding: '32px', marginBottom: '32px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h2 style={{fontSize: '1.2rem', fontWeight: '700'}}>🗣️ Family Voice Assessment</h2>
            <button onClick={() => setShowFamilyVoice(false)} style={{background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer'}}>×</button>
          </div>
          <p style={{color: '#64748b', marginBottom: '24px', lineHeight: '1.7', fontSize: '0.95rem'}}>
            Before any transition decision, every family member needs to be heard. Not a vote — a hearing. Complete this individually, then bring the results together as a family.
          </p>
          <div style={{display: 'grid', gap: '16px'}}>
            {[
              'What does this business mean to you personally?',
              'What would you lose if the business were sold tomorrow?',
              'What would you gain?',
              'What role do you see yourself playing in the family enterprise in 5 years?',
              'What is your biggest fear about the future of the business?',
              'What is your biggest hope?',
              'Do you feel your voice has been heard in decisions about the business?',
            ].map((question, i) => (
              <div key={i} style={{background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb'}}>
                <label style={{display: 'block', fontWeight: '600', fontSize: '0.9rem', marginBottom: '8px', color: '#1a3a5c'}}>
                  {i + 1}. {question}
                </label>
                <textarea
                  rows="2"
                  placeholder="Share your thoughts..."
                  style={{width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'inherit'}}
                />
              </div>
            ))}
          </div>
          <div style={{marginTop: '20px', display: 'flex', gap: '12px'}}>
            <button className="btn btn-primary" style={{padding: '10px 24px'}}>Save My Responses</button>
            <button className="btn btn-outline" style={{padding: '10px 24px'}} onClick={() => setShowFamilyVoice(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Six Pathways */}
      <h2 style={{fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', color: '#1a3a5c'}}>
        Six Pathways
        {selectedIndustry && <span style={{fontSize: '0.82em', fontWeight: '400', color: '#64748b'}}> for {selectedIndustry}</span>}
      </h2>
      <div className="pathway-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px', marginBottom: '32px'}}>
        {TRANSITION_PATHWAYS.map(pathway => {
          const isRecommended = selectedIndustry && INDUSTRY_PROFILES[selectedIndustry]?.pathways.includes(pathway.id);
          const isDimmed = selectedIndustry && !isRecommended;
          return (
          <div
            key={pathway.id}
            className="pathway-card"
            style={{
              background: isRecommended ? `${pathway.color}06` : 'white',
              borderRadius: '12px',
              padding: '24px',
              border: selectedPathway === pathway.id ? `2px solid ${pathway.color}` : isRecommended ? `2px solid ${pathway.color}33` : '1px solid #e5e7eb',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: selectedPathway === pathway.id ? `0 4px 16px ${pathway.color}15` : 'none',
              opacity: isDimmed ? 0.45 : 1,
              position: 'relative',
            }}
            onClick={() => setSelectedPathway(selectedPathway === pathway.id ? null : pathway.id)}
          >
            {isRecommended && (
              <span style={{position: 'absolute', top: '10px', right: '10px', background: pathway.color, color: 'white', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '100px', fontWeight: '600'}}>Recommended</span>
            )}
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px'}}>
              <span style={{fontSize: '1.8rem'}}>{pathway.icon}</span>
              <div>
                <h3 style={{fontSize: '1rem', fontWeight: '700', color: pathway.color, marginBottom: '2px'}}>{pathway.name}</h3>
                <p style={{fontSize: '0.82rem', color: '#64748b'}}>{pathway.shortDesc}</p>
              </div>
            </div>

            {selectedPathway === pathway.id && (
              <div style={{marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb'}}>
                <p style={{fontSize: '0.88rem', color: '#374151', lineHeight: '1.6', marginBottom: '16px'}}>{pathway.description}</p>
                <h4 style={{fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px'}}>Key Considerations</h4>
                <ul style={{listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '6px'}}>
                  {pathway.considerations.map((c, i) => (
                    <li key={i} style={{
                      background: `${pathway.color}10`,
                      color: pathway.color,
                      padding: '4px 10px',
                      borderRadius: '100px',
                      fontSize: '0.78rem',
                      fontWeight: '500',
                    }}>{c}</li>
                  ))}
                </ul>
                {/* v6: Tax implications note — 10% requested state-specific tax info */}
                <div style={{background: '#fffbeb', borderRadius: '8px', padding: '10px 14px', marginTop: '14px', border: '1px solid #f59e0b22'}}>
                  <p style={{fontSize: '0.78rem', color: '#92400e', lineHeight: '1.5', margin: 0}}>
                    <strong>Tax Note:</strong> {pathway.id === 'esop' ? 'ESOPs offer significant tax advantages — Section 1042 rollover can defer capital gains indefinitely. S-corp ESOPs may eliminate federal income tax entirely.'
                      : pathway.id === 'pe-sale' ? 'Capital gains treatment varies by structure. QSB stock (Section 1202) may exclude up to $10M in gains. Installment sales can spread tax liability.'
                      : pathway.id === 'next-gen' ? 'Gift and estate tax planning is critical. Annual exclusions, GRATs, and FLPs can minimize transfer taxes. Start planning 3-5 years before transition.'
                      : pathway.id === 'patient-capital' ? 'Minority interest discounts can reduce gift tax exposure by 20-35%. Qualified opportunity zones may provide additional tax deferral.'
                      : pathway.id === 'private-credit' ? 'Interest deductibility under Section 163(j) limits business interest to 30% of adjusted taxable income. Structure matters.'
                      : 'Compensation structure and non-compete agreements have significant tax implications. Consult tax counsel for optimal structuring.'}
                    {' '}Consult your tax advisor.
                  </p>
                </div>
                {/* v6: Case study teaser — 10.2% want real examples */}
                <div style={{background: '#f8fafc', borderRadius: '8px', padding: '10px 14px', marginTop: '8px', border: '1px solid #e5e7eb'}}>
                  <p style={{fontSize: '0.78rem', color: '#475569', lineHeight: '1.5', margin: 0}}>
                    <strong>Real Family Story:</strong> {pathway.id === 'esop' ? 'A 3rd-generation manufacturing family used a leveraged ESOP to provide $12M in liquidity while keeping the company culture intact.'
                      : pathway.id === 'pe-sale' ? 'After 40 years, the founding family sold to PE, negotiated earnouts, and transitioned into a family office managing the proceeds.'
                      : pathway.id === 'next-gen' ? 'Three siblings created a family employment policy with clear qualification criteria — two joined the business, one served on the board.'
                      : pathway.id === 'patient-capital' ? 'A family brought in a family office as minority investor, gaining a board seat and operational expertise while retaining 70% control.'
                      : pathway.id === 'private-credit' ? 'The next generation used mezzanine financing to buy out their parents over 7 years, preserving the business through a structured transition.'
                      : 'A non-family CEO was hired after the family defined clear authority boundaries and created a family council to maintain oversight.'}
                    {' '}<em style={{color: '#94a3b8'}}>Names anonymized.</em>
                  </p>
                </div>
                <button
                  className="btn"
                  style={{
                    marginTop: '16px',
                    background: pathway.color,
                    color: 'white',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    opacity: 0.9,
                  }}
                >
                  Explore This Pathway →
                </button>
              </div>
            )}
          </div>
          );
        })}
      </div>

      {/* ─── DECISION ENGINE ────────────────────────────────── */}
      <div style={{background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', borderRadius: '16px', padding: '32px', marginBottom: '32px', color: 'white'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
          <span style={{fontSize: '2rem'}}>🧭</span>
          <div>
            <h2 style={{fontSize: '1.3rem', fontWeight: '700', color: 'white', marginBottom: '4px'}}>Transition Decision Engine</h2>
            <p style={{fontSize: '0.88rem', opacity: 0.8}}>A structured process to determine the right pathway for your family</p>
          </div>
        </div>
        <p style={{fontSize: '0.92rem', lineHeight: '1.7', opacity: 0.9, marginBottom: '24px', maxWidth: '750px'}}>
          Most families get handed a term sheet before they've had a single honest conversation about what they want. The Decision Engine changes that. Six phases — from readiness through roadmap — ensuring every voice is heard and every dimension is weighed before a single advisor enters the room.
        </p>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px'}}>
          {[
            { phase: '1', name: 'Readiness Assessment', desc: 'Are you ready to even have this conversation?', icon: '🔍' },
            { phase: '2', name: 'Family Voice', desc: 'Every member heard. Not a vote — a hearing.', icon: '🗣️' },
            { phase: '3', name: 'Financial Reality', desc: 'What the numbers actually say — and don\'t.', icon: '📊' },
            { phase: '4', name: 'Pathway Matching', desc: 'Which paths fit your family\'s unique DNA?', icon: '🧬' },
            { phase: '5', name: 'Decision Protocol', desc: 'How your family will actually decide.', icon: '⚖️' },
            { phase: '6', name: 'Pre-Transition Roadmap', desc: 'The 90-day plan before any deal begins.', icon: '🗺️' },
          ].map(p => (
            <div key={p.phase} style={{background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                <span style={{fontSize: '1.2rem'}}>{p.icon}</span>
                <span style={{fontSize: '0.75rem', fontWeight: '700', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em'}}>Phase {p.phase}</span>
              </div>
              <h4 style={{fontSize: '0.88rem', fontWeight: '700', marginBottom: '4px', color: 'white'}}>{p.name}</h4>
              <p style={{fontSize: '0.78rem', opacity: 0.7, lineHeight: '1.4'}}>{p.desc}</p>
            </div>
          ))}
        </div>
        <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
          <button onClick={() => setCurrentView('decision-engine')} style={{background: 'white', color: '#1e293b', padding: '10px 24px', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', border: 'none', cursor: 'pointer'}}>
            Begin Decision Process →
          </button>
          <span style={{fontSize: '0.82rem', opacity: 0.6}}>Estimated time: 4–6 weeks with your family</span>
        </div>
      </div>

      {/* ─── VALUATION ENGINE ────────────────────────────────── */}
      <div style={{background: 'white', borderRadius: '16px', padding: '32px', marginBottom: '32px', border: '2px solid #7c3aed22'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
          <span style={{background: 'linear-gradient(135deg, #7c3aed, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2rem', fontWeight: '800'}}>$</span>
          <div>
            <h2 style={{fontSize: '1.3rem', fontWeight: '700', color: '#1a3a5c', marginBottom: '4px'}}>LEP Valuation Engine</h2>
            <p style={{fontSize: '0.88rem', color: '#64748b'}}>The first valuation tool that values the family — not just the business</p>
          </div>
        </div>
        <p style={{fontSize: '0.92rem', lineHeight: '1.7', color: '#374151', marginBottom: '24px', maxWidth: '750px'}}>
          Traditional valuations miss what matters most. The LEP Valuation Engine combines EBITDA-based business valuation with a proprietary Family Health Multiplier — adjusting enterprise value by -60% to +65% based on your family's strength across all five LEP pillars.
        </p>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px'}}>
          {[
            { name: 'Business Valuation', desc: 'Industry multiples, EBITDA, comparable transactions, DCF modeling', icon: '🏢', color: '#1a3a5c' },
            { name: 'LEP Multiplier', desc: 'Family health score adjusts value based on five pillar assessment', icon: '👨‍👩‍👧‍👦', color: '#2d5a3d' },
            { name: 'Continuity Risk Index', desc: 'Key-person, succession gap, and governance risk scoring', icon: '⚠️', color: '#dc2626' },
            { name: 'Family Net Worth', desc: 'Total family picture — business equity, real estate, investments, liquidity', icon: '💎', color: '#7c3aed' },
            { name: 'Pathway Impact Modeling', desc: 'See how each transition pathway changes your valuation & net worth', icon: '📈', color: '#0891b2' },
            { name: 'Pattern Intelligence', desc: 'Anonymized benchmarks from LEP\'s family database', icon: '🧠', color: '#d97706' },
          ].map(mod => (
            <div key={mod.name} style={{background: '#f8fafc', borderRadius: '10px', padding: '18px', border: '1px solid #e5e7eb'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                <span style={{fontSize: '1.3rem'}}>{mod.icon}</span>
                <h4 style={{fontSize: '0.88rem', fontWeight: '700', color: mod.color}}>{mod.name}</h4>
              </div>
              <p style={{fontSize: '0.8rem', color: '#64748b', lineHeight: '1.5'}}>{mod.desc}</p>
            </div>
          ))}
        </div>
        <div style={{background: '#f5f3ff', borderRadius: '10px', padding: '16px 20px', marginBottom: '20px', border: '1px solid #7c3aed22'}}>
          <p style={{fontSize: '0.85rem', color: '#5b21b6', lineHeight: '1.6'}}>
            <strong>Why this changes everything:</strong> A family with a $20M EBITDA business and strong LEP scores could see their adjusted enterprise value increase by $6.5M+ over a family in crisis with identical financials. Buyers, advisors, and families deserve to see the full picture.
          </p>
        </div>
        <button style={{background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white', padding: '10px 24px', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', border: 'none', cursor: 'pointer'}}>
          Start Your Valuation →
        </button>
      </div>

      {/* ─── ESTATE PLAN MODULE ────────────────────────────────── */}
      <div style={{background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', borderRadius: '16px', padding: '32px', marginBottom: '32px', border: '1px solid #2d5a3d22'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
          <span style={{fontSize: '2rem'}}>🏛️</span>
          <div>
            <h2 style={{fontSize: '1.3rem', fontWeight: '700', color: '#1a3a5c', marginBottom: '4px'}}>Estate Plan Architecture</h2>
            <p style={{fontSize: '0.88rem', color: '#64748b'}}>Legal, financial, and relational infrastructure for your transition</p>
          </div>
        </div>
        <p style={{fontSize: '0.92rem', lineHeight: '1.7', color: '#374151', marginBottom: '24px', maxWidth: '750px'}}>
          Your estate plan isn't just a legal document — it's the architecture that holds your family's transition together. LEP's Estate Plan module helps you inventory what you have, identify what's missing, and have the hard conversations most families avoid.
        </p>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px'}}>
          {[
            { name: 'Document Inventory', desc: 'Wills, trusts, buy-sell agreements, insurance policies — know what you have and what\'s expired', icon: '📋' },
            { name: 'Pathway-Specific Requirements', desc: 'Each transition path has unique legal needs. See exactly what your chosen pathway requires.', icon: '📎' },
            { name: 'Secure Document Vault', desc: 'Encrypted storage for your most sensitive family enterprise documents', icon: '🔐' },
            { name: 'Hard Conversations Guide', desc: 'Structured frameworks for the discussions families avoid — incapacity, unequal inheritance, disinheritance', icon: '💬' },
            { name: 'Pre-Transition Roadmap', desc: 'Timeline-based checklist: what to update, when, and which advisors to involve', icon: '📅' },
            { name: 'Education Library', desc: 'Plain-language guides on trusts, GRATs, FLPs, QSBs, ESOPs, and more', icon: '📚' },
          ].map(item => (
            <div key={item.name} style={{background: 'white', borderRadius: '10px', padding: '18px', border: '1px solid #e5e7eb'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                <span style={{fontSize: '1.2rem'}}>{item.icon}</span>
                <h4 style={{fontSize: '0.88rem', fontWeight: '700', color: '#2d5a3d'}}>{item.name}</h4>
              </div>
              <p style={{fontSize: '0.8rem', color: '#64748b', lineHeight: '1.5'}}>{item.desc}</p>
            </div>
          ))}
        </div>
        <div style={{background: '#fff7ed', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', border: '1px solid #f59e0b33'}}>
          <p style={{fontSize: '0.82rem', color: '#92400e', lineHeight: '1.5'}}>
            <strong>Important:</strong> LEP Hub provides organizational tools and educational resources — not legal or tax advice. Always work with qualified attorneys and tax professionals for estate planning decisions.
          </p>
        </div>
        <button style={{background: '#2d5a3d', color: 'white', padding: '10px 24px', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', border: 'none', cursor: 'pointer'}}>
          Start Estate Plan Review →
        </button>
      </div>

      {/* The Grief Framework Teaser */}
      <div style={{background: '#fffbeb', border: '1px solid #f59e0b33', borderRadius: '12px', padding: '28px 32px', marginBottom: '32px'}}>
        <h2 style={{fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px', color: '#92400e'}}>🕊️ The Human Side of Transitions</h2>
        <p style={{fontSize: '0.92rem', color: '#78350f', lineHeight: '1.6', maxWidth: '700px'}}>
          A family business doesn't have cells, blood, or tissue — but it is a living, breathing entity. When it changes hands, the family grieves. LEP's Seven Stages of Family Enterprise Loss helps families navigate the emotional journey — from rupture through rebuilding — with the same rigor they bring to the financial side.
        </p>
        <p style={{fontSize: '0.85rem', color: '#92400e', fontWeight: '600', marginTop: '12px'}}>
          Built from lived experience. Grounded in family systems therapy. Coming soon to LEP Hub.
        </p>
      </div>

      {/* Comparison tool removed — Steve: ship it when it's real */}

      {/* ─── COMPLIANCE DISCLAIMERS — Collapsible ────────────── */}
      <div style={{background: '#fafafa', borderRadius: '12px', padding: '14px 20px', border: '1px solid #e5e7eb'}}>
        <div onClick={() => setShowDisclaimers(!showDisclaimers)} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'}}>
          <span style={{fontSize: '0.78rem', color: '#64748b'}}>
            ⚖️ <strong>Important Disclosures</strong> — LEP Hub provides educational tools, not financial, legal, or tax advice. <span style={{color: '#94a3b8'}}>SOC 2 Type II compliant.</span>
          </span>
          <span style={{fontSize: '0.75rem', color: '#94a3b8', marginLeft: '12px'}}>{showDisclaimers ? '▲' : '▼'}</span>
        </div>
        {showDisclaimers && (
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #e5e7eb'}}>
            <div style={{fontSize: '0.72rem', color: '#64748b', lineHeight: '1.4'}}>
              <strong style={{color: '#475569'}}>Not Financial Advice.</strong> Nothing on this platform constitutes investment, financial, legal, or tax advice. Consult qualified professionals.
            </div>
            <div style={{fontSize: '0.72rem', color: '#64748b', lineHeight: '1.4'}}>
              <strong style={{color: '#475569'}}>Not Legal Advice.</strong> Estate planning tools are for organizational purposes only. Work with licensed attorneys.
            </div>
            <div style={{fontSize: '0.72rem', color: '#64748b', lineHeight: '1.4'}}>
              <strong style={{color: '#475569'}}>Valuations Are Estimates.</strong> Formal valuations should be conducted by accredited appraisers (ASA, ABV, CVA).
            </div>
            <div style={{fontSize: '0.72rem', color: '#64748b', lineHeight: '1.4'}}>
              <strong style={{color: '#475569'}}>Data Privacy.</strong> End-to-end encrypted. You retain full ownership. SOC 2 Type II compliant.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DECISION ENGINE — 6-Phase Interactive Transition Process
// ═══════════════════════════════════════════════════════════════

const DE_PHASES = [
  { id: 1, name: 'Readiness', icon: '🔍', desc: 'Are you ready to even have this conversation?' },
  { id: 2, name: 'Family Voice', icon: '🗣️', desc: 'Every member heard. Not a vote — a hearing.' },
  { id: 3, name: 'Financial Reality', icon: '📊', desc: 'What the numbers actually say.' },
  { id: 4, name: 'Pathway Match', icon: '🧬', desc: 'Which paths fit your family?' },
  { id: 5, name: 'Decision Protocol', icon: '⚖️', desc: 'How your family will decide.' },
  { id: 6, name: 'Roadmap', icon: '🗺️', desc: 'Your 90-day pre-transition plan.' },
];

const READINESS_QUESTIONS = [
  { id: 'r1', text: 'The family has discussed the possibility of a transition openly.', category: 'Emotional' },
  { id: 'r2', text: 'Key family members agree that now is the right time to explore options.', category: 'Emotional' },
  { id: 'r3', text: 'We understand the difference between selling a business and transitioning a family enterprise.', category: 'Emotional' },
  { id: 'r4', text: 'The senior generation has articulated what life after transition looks like for them.', category: 'Emotional' },
  { id: 'r5', text: 'Our financials are organized, audited, and ready for outside review.', category: 'Financial' },
  { id: 'r6', text: 'We know the approximate value of the business within a reasonable range.', category: 'Financial' },
  { id: 'r7', text: 'Key-person dependencies have been identified and documented.', category: 'Financial' },
  { id: 'r8', text: 'We have or are willing to engage qualified legal, tax, and financial advisors.', category: 'Professional' },
  { id: 'r9', text: 'The next generation (if involved) has been given a voice in the process.', category: 'Relational' },
  { id: 'r10', text: 'We are prepared for the process to take 12-24 months.', category: 'Professional' },
  { id: 'r11', text: 'Family relationships are stable enough to withstand difficult conversations.', category: 'Relational' },
  { id: 'r12', text: 'There is no active crisis forcing an immediate decision.', category: 'Relational' },
];

const FAMILY_VOICE_PROMPTS = [
  { id: 'fv1', text: 'What does this business mean to you personally — beyond the financial?' },
  { id: 'fv2', text: 'If the business were sold tomorrow, what would you grieve most?' },
  { id: 'fv3', text: 'What would you gain if the transition happened?' },
  { id: 'fv4', text: 'What role do you see yourself playing in 5 years — in the family and the enterprise?' },
  { id: 'fv5', text: 'What is your single biggest fear about this transition?' },
  { id: 'fv6', text: 'What is your single biggest hope?' },
  { id: 'fv7', text: 'Have you felt heard in past family business decisions? What would make this time different?' },
  { id: 'fv8', text: 'Is there anything you\'ve been afraid to say about the business or the family? Say it here.' },
];

const FINANCIAL_INPUTS = [
  { id: 'fi1', label: 'Estimated Business Value', type: 'currency', placeholder: '$0', help: 'Rough estimate is fine — formal valuation comes later' },
  { id: 'fi2', label: 'Annual Revenue', type: 'currency', placeholder: '$0' },
  { id: 'fi3', label: 'Annual EBITDA', type: 'currency', placeholder: '$0', help: 'Earnings before interest, taxes, depreciation, and amortization' },
  { id: 'fi4', label: 'Total Debt', type: 'currency', placeholder: '$0' },
  { id: 'fi5', label: 'Family Members Dependent on Business Income', type: 'number', placeholder: '0' },
  { id: 'fi6', label: 'Senior Generation Retirement Needs (Annual)', type: 'currency', placeholder: '$0' },
  { id: 'fi7', label: 'Years Until Desired Transition', type: 'number', placeholder: '0' },
  { id: 'fi8', label: 'Existing Estate Plan?', type: 'select', options: ['No', 'Basic (wills only)', 'Moderate (trusts + wills)', 'Comprehensive (trusts, FLPs, buy-sell, insurance)'] },
];

const DECISION_METHODS = [
  { id: 'consensus', name: 'Full Consensus', desc: 'Everyone must agree. Slowest but strongest buy-in.', icon: '🤝', fit: 'Best for small families (2-4 decision-makers) with strong relationships.' },
  { id: 'supermajority', name: 'Supermajority (75%)', desc: 'Three-quarters must agree. Protects minority voice.', icon: '⚖️', fit: 'Best for families with 5-8 members and some disagreement.' },
  { id: 'majority', name: 'Simple Majority', desc: 'Over half decides. Efficient but can leave people behind.', icon: '📊', fit: 'Best for large families or when time pressure exists.' },
  { id: 'patriarch', name: 'Founder Authority + Input', desc: 'Senior generation decides after hearing all voices.', icon: '👑', fit: 'Best when the founder has strong trust and transition is imminent.' },
  { id: 'board', name: 'Board/Council Decision', desc: 'Elected or appointed body decides on behalf of the family.', icon: '🏛️', fit: 'Best for 3rd+ generation families with formal governance.' },
];

function DecisionEngineView({ setCurrentView, scores }) {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [engineData, setEngineData] = useState(() => {
    try { const saved = localStorage.getItem('lep_decision_engine'); return saved ? JSON.parse(saved) : {}; } catch { return {}; }
  });

  // Auto-save
  useEffect(() => {
    localStorage.setItem('lep_decision_engine', JSON.stringify(engineData));
  }, [engineData]);

  const updateField = (key, value) => setEngineData(prev => ({ ...prev, [key]: value }));

  // Readiness score calculation
  const readinessScore = (() => {
    const answers = engineData.readiness || {};
    const answered = Object.values(answers).filter(v => v !== undefined);
    if (answered.length === 0) return null;
    const total = answered.reduce((s, v) => s + v, 0);
    return Math.round((total / (answered.length * 5)) * 100);
  })();

  const readinessComplete = Object.keys(engineData.readiness || {}).length === READINESS_QUESTIONS.length;
  const voiceComplete = (engineData.familyMembers || []).length > 0 && (engineData.familyMembers || []).every(m => m.responses && Object.keys(m.responses).length >= 4);
  const financialComplete = Object.keys(engineData.financial || {}).length >= 5;
  const pathwaySelected = !!engineData.selectedPathway;
  const decisionMethodSelected = !!engineData.decisionMethod;

  const phaseUnlocked = (phase) => {
    if (phase === 1) return true;
    if (phase === 2) return readinessComplete;
    if (phase === 3) return voiceComplete || readinessComplete; // allow skip-ahead if readiness done
    if (phase === 4) return financialComplete || readinessComplete;
    if (phase === 5) return pathwaySelected || readinessComplete;
    if (phase === 6) return decisionMethodSelected || readinessComplete;
    return false;
  };

  const phaseComplete = (phase) => {
    if (phase === 1) return readinessComplete;
    if (phase === 2) return voiceComplete;
    if (phase === 3) return financialComplete;
    if (phase === 4) return pathwaySelected;
    if (phase === 5) return decisionMethodSelected;
    if (phase === 6) return !!engineData.roadmapGenerated;
    return false;
  };

  return (
    <div className="decision-engine-view">
      <header className="page-header">
        <div>
          <h1>Decision Engine</h1>
          <p className="subtitle">Six phases to clarity. No jargon. No pressure.</p>
        </div>
        <button className="btn btn-outline" onClick={() => setCurrentView('transitions')} style={{fontSize: '0.85rem'}}>
          ← Back to Transitions
        </button>
      </header>

      {/* Phase Navigation */}
      <div style={{display: 'flex', gap: '4px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '4px'}}>
        {DE_PHASES.map(phase => {
          const unlocked = phaseUnlocked(phase.id);
          const complete = phaseComplete(phase.id);
          const active = currentPhase === phase.id;
          return (
            <button
              key={phase.id}
              onClick={() => unlocked && setCurrentPhase(phase.id)}
              style={{
                flex: '1 0 auto', minWidth: '120px', padding: '12px 16px', borderRadius: '10px', border: 'none',
                background: active ? '#0f172a' : complete ? '#2d5a3d' : unlocked ? 'white' : '#f1f5f9',
                color: active ? 'white' : complete ? 'white' : unlocked ? '#374151' : '#94a3b8',
                cursor: unlocked ? 'pointer' : 'default', transition: 'all 0.2s',
                opacity: unlocked ? 1 : 0.5,
                boxShadow: active ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                border: active ? 'none' : '1px solid #e5e7eb',
              }}
            >
              <div style={{fontSize: '1.2rem', marginBottom: '4px'}}>{complete ? '✓' : phase.icon}</div>
              <div style={{fontSize: '0.75rem', fontWeight: '600'}}>{phase.name}</div>
            </button>
          );
        })}
      </div>

      {/* ─── PHASE 1: READINESS ─── */}
      {currentPhase === 1 && (
        <div>
          <div style={{background: '#f8fafc', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #e5e7eb'}}>
            <h2 style={{fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px'}}>🔍 Phase 1: Readiness Assessment</h2>
            <p style={{fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6', maxWidth: '650px'}}>
              Before any transition conversation, your family needs to know: are we actually ready for this? Rate each statement honestly. There are no wrong answers — only clarity.
            </p>
            {readinessScore !== null && (
              <div style={{marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '12px', background: readinessScore >= 70 ? '#f0fdf4' : readinessScore >= 40 ? '#fffbeb' : '#fef2f2', padding: '8px 16px', borderRadius: '8px', border: `1px solid ${readinessScore >= 70 ? '#2d5a3d33' : readinessScore >= 40 ? '#f59e0b33' : '#dc262633'}`}}>
                <span style={{fontSize: '1.4rem', fontWeight: '700', color: readinessScore >= 70 ? '#2d5a3d' : readinessScore >= 40 ? '#d97706' : '#dc2626'}}>{readinessScore}</span>
                <span style={{fontSize: '0.85rem', color: '#475569'}}>
                  {readinessScore >= 70 ? 'Your family shows strong readiness signals.' : readinessScore >= 40 ? 'Some areas need attention before proceeding.' : 'Significant groundwork needed. That\'s okay — that\'s why you\'re here.'}
                </span>
              </div>
            )}
          </div>

          {['Emotional', 'Financial', 'Professional', 'Relational'].map(cat => (
            <div key={cat} style={{marginBottom: '24px'}}>
              <h3 style={{fontSize: '0.85rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px'}}>{cat} Readiness</h3>
              {READINESS_QUESTIONS.filter(q => q.category === cat).map(q => (
                <div key={q.id} style={{background: 'white', borderRadius: '10px', padding: '16px 20px', marginBottom: '8px', border: '1px solid #e5e7eb'}}>
                  <p style={{fontSize: '0.9rem', color: '#1e293b', marginBottom: '10px', lineHeight: '1.5'}}>{q.text}</p>
                  <div style={{display: 'flex', gap: '6px'}}>
                    {[1,2,3,4,5].map(v => (
                      <button key={v} onClick={() => updateField('readiness', { ...(engineData.readiness || {}), [q.id]: v })}
                        style={{
                          width: '40px', height: '40px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                          fontSize: '0.9rem', fontWeight: '600', transition: 'all 0.15s',
                          background: (engineData.readiness || {})[q.id] === v ? '#0f172a' : '#f1f5f9',
                          color: (engineData.readiness || {})[q.id] === v ? 'white' : '#64748b',
                        }}
                      >{v}</button>
                    ))}
                    <span style={{fontSize: '0.72rem', color: '#94a3b8', alignSelf: 'center', marginLeft: '8px'}}>1 = Not at all → 5 = Absolutely</span>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {readinessComplete && (
            <div style={{textAlign: 'center', padding: '24px 0'}}>
              <button onClick={() => setCurrentPhase(2)} style={{background: '#0f172a', color: 'white', padding: '12px 32px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600'}}>
                Continue to Family Voice →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── PHASE 2: FAMILY VOICE ─── */}
      {currentPhase === 2 && (
        <div>
          <div style={{background: '#f8fafc', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #e5e7eb'}}>
            <h2 style={{fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px'}}>🗣️ Phase 2: Family Voice</h2>
            <p style={{fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6', maxWidth: '650px'}}>
              Before any numbers, strategies, or advisors — every family member gets heard. This isn't a vote. It's a hearing. Add each family member and have them respond individually.
            </p>
          </div>

          {/* Add family member */}
          <div style={{display: 'flex', gap: '8px', marginBottom: '20px'}}>
            <input
              type="text"
              placeholder="Family member name..."
              id="new-member-name"
              style={{flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem'}}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  const members = [...(engineData.familyMembers || []), { name: e.target.value.trim(), responses: {} }];
                  updateField('familyMembers', members);
                  e.target.value = '';
                }
              }}
            />
            <select id="new-member-role" style={{padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem'}}>
              <option>Role...</option>
              <option>Founder/Senior Gen</option>
              <option>Next Gen</option>
              <option>Spouse</option>
              <option>In-Law</option>
              <option>Board Member</option>
            </select>
            <button onClick={() => {
              const nameInput = document.getElementById('new-member-name');
              const roleInput = document.getElementById('new-member-role');
              if (nameInput.value.trim()) {
                const members = [...(engineData.familyMembers || []), { name: nameInput.value.trim(), role: roleInput.value, responses: {} }];
                updateField('familyMembers', members);
                nameInput.value = '';
              }
            }} style={{background: '#0f172a', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600', whiteSpace: 'nowrap'}}>
              + Add
            </button>
          </div>

          {/* Member tabs */}
          {(engineData.familyMembers || []).length > 0 && (
            <div>
              <div style={{display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap'}}>
                {(engineData.familyMembers || []).map((member, mi) => {
                  const responseCount = Object.keys(member.responses || {}).length;
                  return (
                    <button key={mi}
                      onClick={() => updateField('activeVoiceMember', mi)}
                      style={{
                        padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        background: engineData.activeVoiceMember === mi ? '#0f172a' : responseCount >= 4 ? '#2d5a3d' : '#f1f5f9',
                        color: engineData.activeVoiceMember === mi || responseCount >= 4 ? 'white' : '#374151',
                        fontSize: '0.85rem', fontWeight: '600',
                      }}
                    >
                      {member.name} {responseCount >= 4 ? '✓' : `(${responseCount}/${FAMILY_VOICE_PROMPTS.length})`}
                    </button>
                  );
                })}
              </div>

              {engineData.activeVoiceMember !== undefined && (engineData.familyMembers || [])[engineData.activeVoiceMember] && (
                <div>
                  <h3 style={{fontSize: '1rem', fontWeight: '700', marginBottom: '16px', color: '#1a3a5c'}}>
                    {(engineData.familyMembers || [])[engineData.activeVoiceMember].name}'s Voice
                    {(engineData.familyMembers || [])[engineData.activeVoiceMember].role && (
                      <span style={{fontSize: '0.8rem', fontWeight: '400', color: '#64748b', marginLeft: '8px'}}>({(engineData.familyMembers || [])[engineData.activeVoiceMember].role})</span>
                    )}
                  </h3>
                  {FAMILY_VOICE_PROMPTS.map(prompt => (
                    <div key={prompt.id} style={{background: 'white', borderRadius: '10px', padding: '16px 20px', marginBottom: '10px', border: '1px solid #e5e7eb'}}>
                      <label style={{display: 'block', fontWeight: '600', fontSize: '0.88rem', marginBottom: '8px', color: '#1a3a5c', lineHeight: '1.5'}}>{prompt.text}</label>
                      <textarea
                        rows="3"
                        placeholder="Share openly — this is confidential to the family..."
                        value={((engineData.familyMembers || [])[engineData.activeVoiceMember]?.responses || {})[prompt.id] || ''}
                        onChange={(e) => {
                          const members = [...(engineData.familyMembers || [])];
                          if (!members[engineData.activeVoiceMember].responses) members[engineData.activeVoiceMember].responses = {};
                          members[engineData.activeVoiceMember].responses[prompt.id] = e.target.value;
                          updateField('familyMembers', members);
                        }}
                        style={{width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.88rem', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5'}}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {voiceComplete && (
            <div style={{textAlign: 'center', padding: '24px 0'}}>
              <button onClick={() => setCurrentPhase(3)} style={{background: '#0f172a', color: 'white', padding: '12px 32px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600'}}>
                Continue to Financial Reality →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── PHASE 3: FINANCIAL REALITY ─── */}
      {currentPhase === 3 && (
        <div>
          <div style={{background: '#f8fafc', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #e5e7eb'}}>
            <h2 style={{fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px'}}>📊 Phase 3: Financial Reality</h2>
            <p style={{fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6', maxWidth: '650px'}}>
              Rough numbers are fine — this isn't a formal valuation. The goal is to understand your starting position so the pathway matching can be grounded in reality, not wishful thinking.
            </p>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px', marginBottom: '24px'}}>
            {FINANCIAL_INPUTS.map(fi => (
              <div key={fi.id} style={{background: 'white', borderRadius: '10px', padding: '16px 20px', border: '1px solid #e5e7eb'}}>
                <label style={{display: 'block', fontWeight: '600', fontSize: '0.88rem', marginBottom: '6px', color: '#1a3a5c'}}>{fi.label}</label>
                {fi.help && <p style={{fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px'}}>{fi.help}</p>}
                {fi.type === 'select' ? (
                  <select
                    value={(engineData.financial || {})[fi.id] || ''}
                    onChange={(e) => updateField('financial', { ...(engineData.financial || {}), [fi.id]: e.target.value })}
                    style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem'}}
                  >
                    <option value="">Select...</option>
                    {fi.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder={fi.placeholder}
                    value={(engineData.financial || {})[fi.id] || ''}
                    onChange={(e) => updateField('financial', { ...(engineData.financial || {}), [fi.id]: e.target.value })}
                    style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem'}}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Financial Health Snapshot */}
          {financialComplete && (
            <div style={{background: '#f0fdf4', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #2d5a3d22'}}>
              <h3 style={{fontSize: '1rem', fontWeight: '700', color: '#2d5a3d', marginBottom: '12px'}}>Financial Snapshot</h3>
              <p style={{fontSize: '0.88rem', color: '#374151', lineHeight: '1.6'}}>
                Based on your inputs, your family enterprise has the financial profile to support multiple transition pathways. The next phase will match you to the options that fit your specific situation.
              </p>
              <div style={{marginTop: '16px', textAlign: 'center'}}>
                <button onClick={() => setCurrentPhase(4)} style={{background: '#0f172a', color: 'white', padding: '12px 32px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600'}}>
                  Continue to Pathway Matching →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── PHASE 4: PATHWAY MATCHING ─── */}
      {currentPhase === 4 && (
        <div>
          <div style={{background: '#f8fafc', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #e5e7eb'}}>
            <h2 style={{fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px'}}>🧬 Phase 4: Pathway Matching</h2>
            <p style={{fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6', maxWidth: '650px'}}>
              Based on your readiness, family voice, and financial reality — here are the pathways that fit your family's DNA. Select the one that resonates most. You can always revisit.
            </p>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px'}}>
            {TRANSITION_PATHWAYS.map(pathway => {
              const selected = engineData.selectedPathway === pathway.id;
              return (
                <div key={pathway.id}
                  onClick={() => updateField('selectedPathway', pathway.id)}
                  style={{
                    background: selected ? `${pathway.color}08` : 'white',
                    borderRadius: '12px', padding: '20px', cursor: 'pointer',
                    border: selected ? `2px solid ${pathway.color}` : '1px solid #e5e7eb',
                    transition: 'all 0.2s', position: 'relative',
                  }}
                >
                  {selected && <span style={{position: 'absolute', top: '10px', right: '12px', background: pathway.color, color: 'white', fontSize: '0.7rem', padding: '2px 10px', borderRadius: '100px', fontWeight: '600'}}>Selected</span>}
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px'}}>
                    <span style={{fontSize: '1.6rem'}}>{pathway.icon}</span>
                    <h3 style={{fontSize: '0.95rem', fontWeight: '700', color: pathway.color}}>{pathway.name}</h3>
                  </div>
                  <p style={{fontSize: '0.82rem', color: '#64748b', lineHeight: '1.5'}}>{pathway.shortDesc}</p>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '10px'}}>
                    {pathway.considerations.slice(0, 3).map((c, i) => (
                      <span key={i} style={{fontSize: '0.7rem', background: `${pathway.color}10`, color: pathway.color, padding: '2px 8px', borderRadius: '100px'}}>{c}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Why this pathway */}
          {pathwaySelected && (
            <div style={{background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '24px', border: '1px solid #e5e7eb'}}>
              <label style={{display: 'block', fontWeight: '600', fontSize: '0.9rem', marginBottom: '8px', color: '#1a3a5c'}}>Why does this pathway resonate with your family?</label>
              <textarea
                rows="3"
                placeholder="In your own words..."
                value={engineData.pathwayReason || ''}
                onChange={(e) => updateField('pathwayReason', e.target.value)}
                style={{width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.88rem', resize: 'vertical', fontFamily: 'inherit'}}
              />
              <div style={{marginTop: '16px', textAlign: 'center'}}>
                <button onClick={() => setCurrentPhase(5)} style={{background: '#0f172a', color: 'white', padding: '12px 32px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600'}}>
                  Continue to Decision Protocol →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── PHASE 5: DECISION PROTOCOL ─── */}
      {currentPhase === 5 && (
        <div>
          <div style={{background: '#f8fafc', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #e5e7eb'}}>
            <h2 style={{fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px'}}>⚖️ Phase 5: Decision Protocol</h2>
            <p style={{fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6', maxWidth: '650px'}}>
              Before your family decides *what* to do, you need to agree on *how* you'll decide. This prevents the most common source of conflict in family transitions — not the decision itself, but the process.
            </p>
          </div>

          <div style={{display: 'grid', gap: '12px', marginBottom: '24px'}}>
            {DECISION_METHODS.map(method => {
              const selected = engineData.decisionMethod === method.id;
              return (
                <div key={method.id}
                  onClick={() => updateField('decisionMethod', method.id)}
                  style={{
                    background: selected ? '#0f172a' : 'white',
                    borderRadius: '12px', padding: '20px', cursor: 'pointer',
                    border: selected ? '2px solid #0f172a' : '1px solid #e5e7eb',
                    transition: 'all 0.2s', display: 'flex', alignItems: 'flex-start', gap: '16px',
                  }}
                >
                  <span style={{fontSize: '1.8rem', flexShrink: 0}}>{method.icon}</span>
                  <div>
                    <h3 style={{fontSize: '0.95rem', fontWeight: '700', color: selected ? 'white' : '#1a3a5c', marginBottom: '4px'}}>{method.name}</h3>
                    <p style={{fontSize: '0.85rem', color: selected ? 'rgba(255,255,255,0.8)' : '#64748b', lineHeight: '1.5', marginBottom: '6px'}}>{method.desc}</p>
                    <p style={{fontSize: '0.78rem', color: selected ? 'rgba(255,255,255,0.6)' : '#94a3b8', fontStyle: 'italic'}}>{method.fit}</p>
                  </div>
                  {selected && <span style={{marginLeft: 'auto', color: '#4ade80', fontSize: '1.2rem', flexShrink: 0}}>✓</span>}
                </div>
              );
            })}
          </div>

          {/* Ground rules */}
          {decisionMethodSelected && (
            <div style={{background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '24px', border: '1px solid #e5e7eb'}}>
              <label style={{display: 'block', fontWeight: '600', fontSize: '0.9rem', marginBottom: '8px', color: '#1a3a5c'}}>Ground Rules — What does your family commit to during this process?</label>
              <p style={{fontSize: '0.78rem', color: '#94a3b8', marginBottom: '8px'}}>Examples: "No side conversations — everything gets said in the room." "We commit to hearing each other without interrupting." "If we reach an impasse, we'll bring in a facilitator."</p>
              <textarea
                rows="4"
                placeholder="Our family commits to..."
                value={engineData.groundRules || ''}
                onChange={(e) => updateField('groundRules', e.target.value)}
                style={{width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.88rem', resize: 'vertical', fontFamily: 'inherit'}}
              />
              <div style={{marginTop: '16px', textAlign: 'center'}}>
                <button onClick={() => setCurrentPhase(6)} style={{background: '#0f172a', color: 'white', padding: '12px 32px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600'}}>
                  Continue to Roadmap →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── PHASE 6: ROADMAP ─── */}
      {currentPhase === 6 && (() => {
        const selectedPW = TRANSITION_PATHWAYS.find(p => p.id === engineData.selectedPathway);
        const selectedDM = DECISION_METHODS.find(m => m.id === engineData.decisionMethod);
        const memberCount = (engineData.familyMembers || []).length;

        const roadmapItems = [
          { week: '1-2', title: 'Family Alignment Meeting', desc: `Gather all ${memberCount || 'family'} members. Present the Decision Engine results. Agree on the ${selectedDM?.name || 'decision'} method. Establish ground rules.`, category: 'Family' },
          { week: '2-3', title: 'Advisor Assembly', desc: `Engage qualified professionals: M&A attorney, tax advisor, wealth planner, and a family business consultant. Brief them on your ${selectedPW?.name || 'chosen pathway'}.`, category: 'Professional' },
          { week: '3-4', title: 'Formal Valuation', desc: 'Commission an independent business valuation from an accredited appraiser (ASA, ABV, or CVA). This grounds all negotiations in reality.', category: 'Financial' },
          { week: '4-6', title: 'Estate & Tax Review', desc: 'Review all estate documents with legal counsel. Identify gaps, expired instruments, and tax optimization opportunities specific to your pathway.', category: 'Legal' },
          { week: '5-7', title: 'Stakeholder Communication', desc: 'Develop messaging for key stakeholders — employees, customers, partners, community. Timing is critical: too early creates anxiety, too late creates distrust.', category: 'Communication' },
          { week: '6-8', title: 'Successor/Buyer Preparation', desc: selectedPW?.id === 'next-gen' ? 'Formalize the next-gen development plan. Define leadership criteria, timeline, and mentorship structure.'
            : selectedPW?.id === 'pe-sale' ? 'Prepare the confidential information memorandum (CIM). Identify 3-5 target buyers. Engage an investment banker if deal size warrants.'
            : selectedPW?.id === 'esop' ? 'Engage an ESOP trustee and legal counsel. Begin the feasibility study. Model the leveraged vs. non-leveraged structure.'
            : 'Begin detailed planning for your chosen pathway. Identify the key milestones and dependencies.', category: 'Execution' },
          { week: '8-10', title: 'Family Council Formation', desc: 'Establish the governance structure that will oversee the transition. Define roles, meeting cadence, and decision authority.', category: 'Governance' },
          { week: '10-12', title: 'Go/No-Go Decision', desc: `Using the ${selectedDM?.name || 'agreed'} method, the family makes its formal decision. If go — execute. If not — revisit Phase 4 with new information.`, category: 'Decision' },
          { week: '12-13', title: 'Transition Launch', desc: 'Execute the plan. Begin the formal transition process with all advisors aligned, family informed, and governance in place.', category: 'Execution' },
        ];

        return (
          <div>
            <div style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '12px', padding: '24px', marginBottom: '24px', color: 'white'}}>
              <h2 style={{fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', color: 'white'}}>🗺️ Phase 6: Your 90-Day Pre-Transition Roadmap</h2>
              <p style={{fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.6', maxWidth: '650px'}}>
                This is your family's personalized roadmap — generated from your readiness scores, family voice responses, financial inputs, and chosen pathway ({selectedPW?.name || 'TBD'}).
              </p>
            </div>

            {/* Summary cards */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px'}}>
              <div style={{background: '#f0fdf4', borderRadius: '10px', padding: '14px', border: '1px solid #2d5a3d22'}}>
                <div style={{fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase'}}>Readiness Score</div>
                <div style={{fontSize: '1.6rem', fontWeight: '700', color: '#2d5a3d'}}>{readinessScore || '—'}/100</div>
              </div>
              <div style={{background: '#f0f9ff', borderRadius: '10px', padding: '14px', border: '1px solid #0891b222'}}>
                <div style={{fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase'}}>Family Members</div>
                <div style={{fontSize: '1.6rem', fontWeight: '700', color: '#0891b2'}}>{memberCount}</div>
              </div>
              <div style={{background: '#faf5ff', borderRadius: '10px', padding: '14px', border: '1px solid #7c3aed22'}}>
                <div style={{fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase'}}>Pathway</div>
                <div style={{fontSize: '1rem', fontWeight: '700', color: '#7c3aed'}}>{selectedPW?.name || '—'}</div>
              </div>
              <div style={{background: '#fffbeb', borderRadius: '10px', padding: '14px', border: '1px solid #d9770622'}}>
                <div style={{fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase'}}>Decision Method</div>
                <div style={{fontSize: '1rem', fontWeight: '700', color: '#d97706'}}>{selectedDM?.name || '—'}</div>
              </div>
            </div>

            {/* Roadmap timeline */}
            <div style={{position: 'relative', paddingLeft: '24px', marginBottom: '32px'}}>
              <div style={{position: 'absolute', left: '10px', top: 0, bottom: 0, width: '2px', background: '#e5e7eb'}} />
              {roadmapItems.map((item, i) => (
                <div key={i} style={{position: 'relative', marginBottom: '16px', paddingLeft: '24px'}}>
                  <div style={{position: 'absolute', left: '-8px', top: '4px', width: '16px', height: '16px', borderRadius: '50%', background: '#0f172a', border: '3px solid white', boxShadow: '0 0 0 1px #e5e7eb'}} />
                  <div style={{background: 'white', borderRadius: '10px', padding: '16px 20px', border: '1px solid #e5e7eb'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px'}}>
                      <h4 style={{fontSize: '0.92rem', fontWeight: '700', color: '#1a3a5c'}}>{item.title}</h4>
                      <span style={{fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600'}}>Week {item.week}</span>
                    </div>
                    <p style={{fontSize: '0.85rem', color: '#475569', lineHeight: '1.6'}}>{item.desc}</p>
                    <span style={{display: 'inline-block', marginTop: '8px', fontSize: '0.7rem', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '4px'}}>{item.category}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Mark complete + export */}
            <div style={{background: '#f8fafc', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb', textAlign: 'center'}}>
              <h3 style={{fontSize: '1.1rem', fontWeight: '700', color: '#1a3a5c', marginBottom: '8px'}}>Your family has a plan.</h3>
              <p style={{fontSize: '0.88rem', color: '#64748b', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto 20px'}}>
                Save this roadmap, share it with your family and advisors, and begin the most important transition of your family enterprise's history.
              </p>
              <div style={{display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap'}}>
                <button onClick={() => { updateField('roadmapGenerated', true); }} style={{background: '#2d5a3d', color: 'white', padding: '12px 28px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.92rem', fontWeight: '600'}}>
                  Mark Complete ✓
                </button>
                <button onClick={() => setCurrentView('dashboard')} style={{background: 'white', color: '#374151', padding: '12px 28px', borderRadius: '10px', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '0.92rem', fontWeight: '600'}}>
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EDUCATION HUB VIEW
// ═══════════════════════════════════════════════════════════════

function EducationHub() {
  const [selectedCategory, setSelectedCategory] = useState('purpose-identity');
  const [expandedArea, setExpandedArea] = useState(null);
  const [educationProgress, setEducationProgress] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem('lep_education_progress');
    if (saved) setEducationProgress(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('lep_education_progress', JSON.stringify(educationProgress));
  }, [educationProgress]);

  const getAreasForCategory = (categoryId) => {
    const category = LEP_PILLARS.find(p => p.id === categoryId);
    return category ? category.modules : [];
  };

  const markAreaAsRead = (areaId) => {
    setEducationProgress(prev => ({ ...prev, [areaId]: true }));
  };

  const completedCount = Object.values(educationProgress).filter(Boolean).length;
  const totalAreas = 15;

  const areas = getAreasForCategory(selectedCategory);

  return (
    <div style={{padding: '28px'}}>
      <header style={{marginBottom: '32px'}}>
        <h1 style={{fontSize: '2rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px'}}>Education Hub</h1>
        <p style={{fontSize: '0.95rem', color: '#64748b', marginBottom: '20px', maxWidth: '600px'}}>
          Explore comprehensive educational content across all 15 areas of the LEP framework. Learn at your own pace and track your progress.
        </p>
        <div style={{background: '#f0fdf4', borderRadius: '10px', padding: '12px 16px', display: 'inline-block', border: '1px solid #2d5a3d22'}}>
          <span style={{fontSize: '0.85rem', color: '#15803d', fontWeight: '600'}}>Progress: {completedCount} of {totalAreas} areas completed</span>
        </div>
      </header>

      {/* Category tabs */}
      <div style={{display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px'}}>
        {LEP_PILLARS.map(pillar => (
          <button
            key={pillar.id}
            onClick={() => { setSelectedCategory(pillar.id); setExpandedArea(null); }}
            style={{
              padding: '10px 16px',
              background: selectedCategory === pillar.id ? pillar.color : 'transparent',
              color: selectedCategory === pillar.id ? 'white' : '#475569',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: selectedCategory === pillar.id ? '600' : '500',
              transition: 'all 0.2s'
            }}
          >
            {pillar.icon} {pillar.name.split(' ').slice(0, 2).join(' ')}
          </button>
        ))}
      </div>

      {/* Areas grid */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px'}}>
        {areas.map(area => {
          const content = ALL_MODULE_CONTENT[area.id];
          const isExpanded = expandedArea === area.id;
          const isRead = educationProgress[area.id];

          return (
            <div
              key={area.id}
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isExpanded ? '0 10px 30px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.05)'
              }}
              onClick={() => setExpandedArea(isExpanded ? null : area.id)}
            >
              <div style={{padding: '20px', background: '#f8fafc', borderBottom: isExpanded ? '1px solid #e5e7eb' : 'none'}}>
                <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px'}}>
                  <div style={{flex: 1}}>
                    <h3 style={{fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '6px'}}>{area.name}</h3>
                    <p style={{fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5'}}>{area.description}</p>
                  </div>
                  <div style={{minWidth: '24px', height: '24px', borderRadius: '50%', background: isRead ? '#2d5a3d' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: '700'}}>
                    {isRead ? '✓' : '○'}
                  </div>
                </div>
              </div>

              {isExpanded && content && (
                <div style={{padding: '20px', maxHeight: '500px', overflowY: 'auto'}}>
                  {content.subtitle && (
                    <p style={{fontSize: '0.85rem', color: '#64748b', marginBottom: '16px', fontStyle: 'italic'}}>
                      {content.subtitle}
                    </p>
                  )}

                  {content.sections && content.sections.map(section => (
                    <div key={section.id} style={{marginBottom: '20px'}}>
                      <h4 style={{fontSize: '0.95rem', fontWeight: '700', color: '#1a3a5c', marginBottom: '8px'}}>
                        {section.title}
                      </h4>
                      <p style={{fontSize: '0.85rem', color: '#475569', lineHeight: '1.6', marginBottom: '12px'}}>
                        {section.description}
                      </p>
                      {section.exercises && section.exercises.length > 0 && (
                        <div style={{background: '#f0fdf4', borderRadius: '8px', padding: '12px', fontSize: '0.8rem', color: '#15803d', borderLeft: '3px solid #2d5a3d'}}>
                          {section.exercises.length} key concept{section.exercises.length !== 1 ? 's' : ''} to explore
                        </div>
                      )}
                    </div>
                  ))}

                  {!isRead && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markAreaAsRead(area.id); }}
                      style={{width: '100%', padding: '12px', background: '#2d5a3d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', marginTop: '16px'}}
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// WORKBOOK VIEW
// ═══════════════════════════════════════════════════════════════

function WorkbookView() {
  const [selectedCategory, setSelectedCategory] = useState('purpose-identity');
  const [expandedArea, setExpandedArea] = useState(null);
  const [workbookData, setWorkbookData] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem('lep_workbook_data');
    if (saved) setWorkbookData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('lep_workbook_data', JSON.stringify(workbookData));
  }, [workbookData]);

  const getAreasForCategory = (categoryId) => {
    const category = LEP_PILLARS.find(p => p.id === categoryId);
    return category ? category.modules : [];
  };

  const updateAreaResponse = (areaId, exerciseId, value) => {
    setWorkbookData(prev => ({
      ...prev,
      [areaId]: {
        ...prev[areaId],
        [exerciseId]: value,
        lastUpdated: new Date().toISOString()
      }
    }));
  };

  const getAreaCompletion = (areaId) => {
    const data = workbookData[areaId];
    return data ? Object.keys(data).length : 0;
  };

  const areas = getAreasForCategory(selectedCategory);
  const completedAreas = areas.filter(a => getAreaCompletion(a.id) > 0).length;

  return (
    <div style={{padding: '28px'}}>
      <header style={{marginBottom: '32px'}}>
        <h1 style={{fontSize: '2rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px'}}>Workbook</h1>
        <p style={{fontSize: '0.95rem', color: '#64748b', marginBottom: '20px', maxWidth: '600px'}}>
          Reflective exercises to deepen your family's thinking across all 15 areas. Save your progress as you work.
        </p>
        <div style={{display: 'flex', gap: '12px'}}>
          <div style={{background: '#f0f9ff', borderRadius: '10px', padding: '12px 16px', border: '1px solid #0891b222'}}>
            <span style={{fontSize: '0.85rem', color: '#0c4a6e', fontWeight: '600'}}>{completedAreas} of {areas.length} areas started</span>
          </div>
          <div style={{background: '#fef3c7', borderRadius: '10px', padding: '12px 16px', border: '1px solid #d9770622'}}>
            <span style={{fontSize: '0.85rem', color: '#854d0e', fontWeight: '600'}}>Auto-saved to browser</span>
          </div>
        </div>
      </header>

      {/* Category tabs */}
      <div style={{display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px'}}>
        {LEP_PILLARS.map(pillar => (
          <button
            key={pillar.id}
            onClick={() => { setSelectedCategory(pillar.id); setExpandedArea(null); }}
            style={{
              padding: '10px 16px',
              background: selectedCategory === pillar.id ? pillar.color : 'transparent',
              color: selectedCategory === pillar.id ? 'white' : '#475569',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: selectedCategory === pillar.id ? '600' : '500',
              transition: 'all 0.2s'
            }}
          >
            {pillar.icon} {pillar.name.split(' ').slice(0, 2).join(' ')}
          </button>
        ))}
      </div>

      {/* Areas grid */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '20px'}}>
        {areas.map(area => {
          const content = ALL_MODULE_CONTENT[area.id];
          const isExpanded = expandedArea === area.id;
          const exercisesCount = getAreaCompletion(area.id);
          const totalExercises = content?.sections?.reduce((sum, s) => sum + (s.exercises?.length || 0), 0) || 0;

          return (
            <div
              key={area.id}
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'all 0.2s',
                boxShadow: isExpanded ? '0 10px 30px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{padding: '20px', background: '#f8fafc', borderBottom: isExpanded ? '1px solid #e5e7eb' : 'none', cursor: 'pointer'}} onClick={() => setExpandedArea(isExpanded ? null : area.id)}>
                <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px'}}>
                  <div style={{flex: 1}}>
                    <h3 style={{fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '6px'}}>{area.name}</h3>
                    <p style={{fontSize: '0.8rem', color: '#94a3b8'}}>
                      {exercisesCount > 0 ? `${exercisesCount} of ${totalExercises} exercises completed` : `${totalExercises} exercises`}
                    </p>
                  </div>
                  <span style={{fontSize: '1.2rem'}}>{isExpanded ? '▼' : '▶'}</span>
                </div>
              </div>

              {isExpanded && content && (
                <div style={{padding: '20px', maxHeight: '600px', overflowY: 'auto'}}>
                  {content.sections && content.sections.map(section => (
                    <div key={section.id} style={{marginBottom: '24px'}}>
                      <h4 style={{fontSize: '0.95rem', fontWeight: '700', color: '#1a3a5c', marginBottom: '4px'}}>
                        {section.title}
                      </h4>
                      <p style={{fontSize: '0.8rem', color: '#64748b', marginBottom: '12px'}}>{section.description}</p>

                      {section.exercises && section.exercises.map(exercise => (
                        <div key={exercise.id} style={{marginBottom: '16px'}}>
                          <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '6px'}}>
                            {exercise.question}
                          </label>
                          {exercise.type === 'textarea' ? (
                            <textarea
                              value={workbookData[area.id]?.[exercise.id] || ''}
                              onChange={(e) => updateAreaResponse(area.id, exercise.id, e.target.value)}
                              placeholder={exercise.placeholder}
                              style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'system-ui', minHeight: '80px', outline: 'none', resize: 'vertical'}}
                            />
                          ) : (
                            <input
                              type="text"
                              value={workbookData[area.id]?.[exercise.id] || ''}
                              onChange={(e) => updateAreaResponse(area.id, exercise.id, e.target.value)}
                              placeholder={exercise.placeholder}
                              style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', outline: 'none'}}
                            />
                          )}
                          {exercise.helperText && (
                            <p style={{fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px', fontStyle: 'italic'}}>
                              Tip: {exercise.helperText}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMMUNITY VIEW
// ═══════════════════════════════════════════════════════════════

function CommunityView() {
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [newReply, setNewReply] = useState('');
  const [expandedPost, setExpandedPost] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('lep_community_posts');
    if (saved) {
      setPosts(JSON.parse(saved));
    } else {
      // Pre-seed with example posts
      const examplePosts = [
        {
          id: '1',
          author: 'Sarah Mitchell',
          title: 'How do we approach the conversation about next-gen readiness?',
          body: 'We have three next-gen members interested in the business, but we\'re unsure how to assess their readiness. Has anyone created formal assessment criteria? We\'d love to hear what\'s worked for other families.',
          category: 'family-system',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          replies: [
            { id: 'r1', author: 'James Chen', text: 'We used a combination of board interviews and external assessment. Worth the investment to get objective perspective.', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
          ]
        },
        {
          id: '2',
          author: 'Margaret Thompson',
          title: 'Succession planning: founder identity vs. business continuity',
          body: 'Our founder is struggling with the idea of stepping back. The business and his identity are deeply intertwined. How have other families navigated this emotional dimension of succession?',
          category: 'strategy-legacy',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          replies: []
        },
        {
          id: '3',
          author: 'David Williams',
          title: 'Governance structures that actually work',
          body: 'We\'re establishing our first formal board. Any recommendations on size, composition, or how to handle family members vs. outside directors?',
          category: 'ownership-governance',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          replies: [
            { id: 'r2', author: 'Patricia Gonzalez', text: 'Start with a smaller board (5-7 people) with clear role clarity. We added independent directors early and it raised the caliber of our conversations significantly.', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
            { id: 'r3', author: 'Robert Khan', text: 'Agree. Also critical: define decision-making authority upfront. Ambiguity creates friction.', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
          ]
        }
      ];
      setPosts(examplePosts);
      localStorage.setItem('lep_community_posts', JSON.stringify(examplePosts));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lep_community_posts', JSON.stringify(posts));
  }, [posts]);

  const createPost = () => {
    if (!newTitle.trim() || !newBody.trim()) return;

    const post = {
      id: String(Date.now()),
      author: 'You',
      title: newTitle,
      body: newBody,
      category: selectedCategory,
      timestamp: new Date().toISOString(),
      replies: []
    };

    setPosts([post, ...posts]);
    setNewTitle('');
    setNewBody('');
    setShowNewPost(false);
  };

  const addReply = (postId) => {
    if (!newReply.trim()) return;

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          replies: [
            ...post.replies,
            {
              id: String(Date.now()),
              author: 'You',
              text: newReply,
              timestamp: new Date().toISOString()
            }
          ]
        };
      }
      return post;
    }));

    setNewReply('');
    setReplyingTo(null);
  };

  const categories = [
    { id: 'general', name: 'General', color: '#64748b' },
    ...LEP_PILLARS.map(p => ({ id: p.id, name: p.name.split(' ').slice(0, 2).join(' '), color: p.color }))
  ];

  const filteredPosts = selectedCategory === 'general' ? posts : posts.filter(p => p.category === selectedCategory);
  const sortedPosts = [...filteredPosts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div style={{padding: '28px', maxWidth: '900px', margin: '0 auto'}}>
      <header style={{marginBottom: '32px'}}>
        <h1 style={{fontSize: '2rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px'}}>Community</h1>
        <p style={{fontSize: '0.95rem', color: '#64748b', marginBottom: '20px'}}>
          Discuss challenges, share experiences, and learn from other families navigating their enterprise journey.
        </p>
        <button
          onClick={() => setShowNewPost(!showNewPost)}
          style={{background: '#2d5a3d', color: 'white', padding: '12px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem'}}
        >
          {showNewPost ? 'Cancel' : '+ New Discussion'}
        </button>
      </header>

      {showNewPost && (
        <div style={{background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', marginBottom: '32px'}}>
          <h3 style={{fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '16px'}}>Start a Discussion</h3>

          <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '6px'}}>Topic</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', marginBottom: '16px', outline: 'none'}}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '6px'}}>Title</label>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What's on your mind?"
            style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', marginBottom: '16px', outline: 'none'}}
          />

          <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '6px'}}>Message</label>
          <textarea
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder="Share your question or experience..."
            style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', minHeight: '120px', marginBottom: '16px', outline: 'none', fontFamily: 'system-ui', resize: 'vertical'}}
          />

          <div style={{display: 'flex', gap: '12px'}}>
            <button
              onClick={createPost}
              style={{background: '#2d5a3d', color: 'white', padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem'}}
            >
              Post Discussion
            </button>
            <button
              onClick={() => setShowNewPost(false)}
              style={{background: 'white', color: '#334155', padding: '10px 24px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem'}}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Category filter */}
      <div style={{display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap'}}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              padding: '8px 14px',
              background: selectedCategory === cat.id ? cat.color : 'transparent',
              color: selectedCategory === cat.id ? 'white' : '#64748b',
              border: `1px solid ${selectedCategory === cat.id ? cat.color : '#e5e7eb'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: selectedCategory === cat.id ? '600' : '500',
              transition: 'all 0.2s'
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Posts feed */}
      <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
        {sortedPosts.length === 0 ? (
          <div style={{background: '#f8fafc', borderRadius: '12px', padding: '32px', textAlign: 'center', border: '1px solid #e5e7eb'}}>
            <p style={{fontSize: '0.95rem', color: '#64748b', marginBottom: '12px'}}>No discussions yet in this category.</p>
            <button
              onClick={() => setShowNewPost(true)}
              style={{background: 'none', border: 'none', color: '#2d5a3d', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', textDecoration: 'underline'}}
            >
              Start one now
            </button>
          </div>
        ) : (
          sortedPosts.map(post => (
            <div
              key={post.id}
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: expandedPost === post.id ? '0 10px 30px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.05)'
              }}
              onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
            >
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px'}}>
                <h3 style={{fontSize: '1rem', fontWeight: '700', color: '#0f172a', flex: 1}}>{post.title}</h3>
                <span style={{fontSize: '0.75rem', background: categories.find(c => c.id === post.category)?.color + '22', color: categories.find(c => c.id === post.category)?.color, padding: '4px 10px', borderRadius: '4px', fontWeight: '600', whiteSpace: 'nowrap'}}>
                  {categories.find(c => c.id === post.category)?.name}
                </span>
              </div>

              <div style={{display: 'flex', gap: '12px', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '12px'}}>
                <span>{post.author}</span>
                <span>•</span>
                <span>{new Date(post.timestamp).toLocaleDateString()}</span>
              </div>

              <p style={{fontSize: '0.9rem', color: '#475569', lineHeight: '1.6', marginBottom: expandedPost === post.id ? '16px' : '0px'}}>
                {post.body}
              </p>

              {expandedPost === post.id && (
                <div style={{marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb'}}>
                  {post.replies && post.replies.length > 0 && (
                    <div style={{marginBottom: '20px'}}>
                      <h4 style={{fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '12px'}}>{post.replies.length} replies</h4>
                      {post.replies.map(reply => (
                        <div key={reply.id} style={{background: '#f8fafc', borderRadius: '8px', padding: '12px', marginBottom: '8px'}}>
                          <div style={{display: 'flex', gap: '8px', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px'}}>
                            <span style={{fontWeight: '600', color: '#334155'}}>{reply.author}</span>
                            <span>•</span>
                            <span>{new Date(reply.timestamp).toLocaleDateString()}</span>
                          </div>
                          <p style={{fontSize: '0.85rem', color: '#475569'}}>{reply.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {replyingTo === post.id ? (
                    <div style={{background: '#f0fdf4', borderRadius: '8px', padding: '12px', border: '1px solid #2d5a3d22'}}>
                      <textarea
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        placeholder="Share your thoughts..."
                        style={{width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem', minHeight: '60px', marginBottom: '8px', outline: 'none', fontFamily: 'system-ui', resize: 'vertical'}}
                      />
                      <div style={{display: 'flex', gap: '8px'}}>
                        <button
                          onClick={(e) => { e.stopPropagation(); addReply(post.id); }}
                          style={{background: '#2d5a3d', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem'}}
                        >
                          Reply
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setReplyingTo(null); setNewReply(''); }}
                          style={{background: 'white', color: '#334155', padding: '8px 16px', borderRadius: '6px', border: '1px solid #e2e8f0', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem'}}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); setReplyingTo(post.id); }}
                      style={{background: 'white', color: '#2d5a3d', padding: '8px 16px', borderRadius: '6px', border: '1px solid #2d5a3d', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem'}}
                    >
                      Reply
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function App() {
  // ─── AUTH STATE ─────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    auth.getCurrentUser().then(user => {
      if (user) setCurrentUser(user);
      setAuthChecked(true);
    }).catch(() => setAuthChecked(true));

    // Check for Stripe checkout return
    const checkoutResult = payments.checkReturnFromCheckout();
    if (checkoutResult?.success) {
      // Update tier after successful checkout
      auth.getCurrentUser().then(user => {
        if (user) setCurrentUser({ ...user, tier: checkoutResult.tier });
      });
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser({
      id: user.id, email: user.email, name: user.name,
      orgName: user.orgName || user.org_name, role: user.role,
      tier: user.tier || 'free',
      initials: user.initials || user.name?.split(' ').map(n => n[0]).join('').toUpperCase()
    });
  };

  const handleLogout = async () => {
    await auth.signOut();
    setCurrentUser(null);
  };

  if (!authChecked) {
    return <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0f1c'}}><div style={{color: '#c9a962', fontSize: '2rem', fontFamily: "'Instrument Serif', Georgia, serif"}}>◆ LEP Hub</div></div>;
  }

  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return <AppShell currentUser={currentUser} onLogout={handleLogout} />;
}

// ─── APP SHELL (post-auth) ────────────────────────────────────
function AppShell({ currentUser, onLogout }) {
  const [currentView, setCurrentView] = useState('dashboard');
  const [scores, setScores] = useState(null);
  const [activePillar, setActivePillar] = useState('roots');
  const [moduleProgress, setModuleProgress] = useState({});
  const [moduleData, setModuleData] = useState({});
  const [vaultDocuments, setVaultDocuments] = useState([]);
  const [showLepReportGenerator, setShowLepReportGenerator] = useState(false);
  const [familyProfile, setFamilyProfile] = useState({
    enterpriseName: '',
    founded: '',
    industry: '',
    headquarters: '',
    annualRevenue: '',
    employeeCount: '',
    generations: 1,
    members: [],
    entities: [],
  });

  useEffect(() => {
    const savedScores = localStorage.getItem('lep_scores');
    const savedProgress = localStorage.getItem('lep_progress');
    const savedModuleData = localStorage.getItem('lep_module_data');
    const savedVault = localStorage.getItem('lep_vault');
    const savedFamilyProfile = localStorage.getItem('lep_family_profile');

    if (savedScores) setScores(JSON.parse(savedScores));
    if (savedProgress) setModuleProgress(JSON.parse(savedProgress));
    if (savedModuleData) setModuleData(JSON.parse(savedModuleData));
    if (savedVault) setVaultDocuments(JSON.parse(savedVault));
    if (savedFamilyProfile) setFamilyProfile(JSON.parse(savedFamilyProfile));
  }, []);

  useEffect(() => { if (scores) localStorage.setItem('lep_scores', JSON.stringify(scores)); }, [scores]);
  useEffect(() => { localStorage.setItem('lep_progress', JSON.stringify(moduleProgress)); }, [moduleProgress]);
  useEffect(() => { localStorage.setItem('lep_module_data', JSON.stringify(moduleData)); }, [moduleData]);
  useEffect(() => { localStorage.setItem('lep_family_profile', JSON.stringify(familyProfile)); }, [familyProfile]);

  const handleAssessmentComplete = (newScores) => {
    setScores(newScores);
    setCurrentView('dashboard');
  };

  const handleGenerateLepReport = (assessmentScores) => {
    setShowLepReportGenerator(true);
  };

  const handleReportGenerated = () => {
    const savedVault = localStorage.getItem('lep_vault');
    if (savedVault) {
      setVaultDocuments(JSON.parse(savedVault));
    }
  };

  const user = { name: currentUser.name || '', initials: currentUser.initials || (currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U') };

  if (showLepReportGenerator) {
    return (
      <div className="lep-app">
        <Nav currentView={currentView} setCurrentView={setCurrentView} user={user} onLogout={onLogout} currentUser={currentUser} />
        <main className="app-main">
          <LEPReportGenerator
            scores={scores}
            onClose={() => setShowLepReportGenerator(false)}
            onReportGenerated={handleReportGenerated}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="lep-app">
      <Nav currentView={currentView} setCurrentView={setCurrentView} user={user} onLogout={onLogout} currentUser={currentUser} />
      <main className="app-main">
        {currentView === 'dashboard' && <Dashboard scores={scores} setCurrentView={setCurrentView} setActivePillar={setActivePillar} vaultDocuments={vaultDocuments} onGenerateLepReport={handleGenerateLepReport} />}
        {(currentView === 'lep-journey' || currentView === 'assessment' || currentView === 'transitions' || currentView === 'decision-engine') && <LEPJourneyView onAssessmentComplete={handleAssessmentComplete} scores={scores} setCurrentView={setCurrentView} familyProfile={familyProfile} />}
        {currentView === 'family-dynamics' && <FamilyDynamicsView familyProfile={familyProfile} />}
        {currentView === 'pillars' && <PillarsView activePillar={activePillar} setActivePillar={setActivePillar} moduleProgress={moduleProgress} setModuleProgress={setModuleProgress} moduleData={moduleData} setModuleData={setModuleData} />}
        {currentView === 'family-profile' && <FamilyProfileView familyProfile={familyProfile} setFamilyProfile={setFamilyProfile} />}
        {currentView === 'meetings' && <MeetingsView familyProfile={familyProfile} />}
        {currentView === 'vault' && <VaultView vaultDocuments={vaultDocuments} />}
        {currentView === 'education' && <EducationHub />}
        {currentView === 'workbook' && <WorkbookView />}
        {currentView === 'community' && <CommunityView />}
        {currentView === 'settings' && <SettingsView currentUser={currentUser} onLogout={onLogout} onTierChange={(tier) => {
          const updated = { ...currentUser, tier };
          setCurrentUser(updated);
          localStorage.setItem('lep_current_user', JSON.stringify(updated));
          if (hasSupabase) db.updateProfile(currentUser.id, { tier });
        }} />}
      </main>
    </div>
  );
}
