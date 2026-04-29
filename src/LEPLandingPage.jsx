import React, { useState, useEffect } from 'react';
import './LEPLandingPage.css';

// ═══════════════════════════════════════════════════════════════
// LEP LANDING PAGE — public marketing page for lephub.com
// Per creative brief: /LEP™ Page — Web Builder Creative Brief
// Unauthenticated visitors see this; "Member Login" button in the
// sticky header opens the existing AuthScreen.
// Forms use Netlify Forms (same-origin, CSP-compatible).
// ═══════════════════════════════════════════════════════════════

const DOWNLOAD_PDF_PATH = '/assets/LEP-Overview.pdf';

// Netlify expects application/x-www-form-urlencoded for AJAX submissions
function encodeFormData(data) {
  return Object.keys(data)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');
}

export default function LEPLandingPage({ onLogin, AuthScreen }) {
  const [showAuth, setShowAuth] = useState(false);

  // Google Fonts — ensure Playfair Display + Source Sans 3 are loaded
  useEffect(() => {
    if (document.getElementById('lep-google-fonts')) return;
    const preconnect1 = document.createElement('link');
    preconnect1.rel = 'preconnect';
    preconnect1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnect1);

    const preconnect2 = document.createElement('link');
    preconnect2.rel = 'preconnect';
    preconnect2.href = 'https://fonts.gstatic.com';
    preconnect2.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect2);

    const fontsLink = document.createElement('link');
    fontsLink.id = 'lep-google-fonts';
    fontsLink.rel = 'stylesheet';
    fontsLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Source+Sans+3:wght@400;600;700&display=swap';
    document.head.appendChild(fontsLink);
  }, []);

  if (showAuth && AuthScreen) {
    return (
      <div className="lep-landing-auth-wrapper">
        <button className="lep-back-link" onClick={() => setShowAuth(false)}>
          ← Back to LEP Framework
        </button>
        <AuthScreen onLogin={onLogin} />
      </div>
    );
  }

  return (
    <div className="lep-landing">
      {/* ────────── STICKY TOP HEADER ────────── */}
      <header className="top-header">
        <div className="top-header-inner">
          <div className="top-header-brand">
            <img src="/stride-logo.png" alt="Stride" width={36} height={36} style={{ objectFit: 'contain' }} />
            <div>
              <div className="wordmark">LEP<sup style={{ fontSize: '0.5em', marginLeft: '2px' }}>™</sup></div>
              <div className="tagline">Legacy Enterprise Process</div>
            </div>
          </div>
          <button className="member-login-btn" onClick={() => setShowAuth(true)}>
            Member Login
          </button>
        </div>
      </header>

      {/* ────────── SECTION 1 · HERO ────────── */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <span className="eyebrow">LEP™ · Legacy Enterprise Process</span>
              <h1>The Operating System Built for Family Enterprise</h1>
              <p className="subheadline">
                Five pillars. Five tools. One complete system — designed for the complexity only multigenerational family businesses face.
              </p>
              <div className="hero-ctas">
                <a href="#lep-inquiry" className="btn btn-primary">Start with a Discovery Conversation</a>
                <a href="#lep-inquiry" className="btn btn-outline-on-navy">Become a Certified Implementer</a>
              </div>
            </div>
            <figure className="hero-photo">
              <img
                src="/images/stride-retreat-facilitation.jpg"
                alt="Jason Packer facilitating an LEP retreat with family enterprise leaders"
                loading="eager"
              />
              <figcaption>LEP Retreat · Adirondack Pavilion</figcaption>
            </figure>
          </div>
          <div className="pillar-strip" aria-label="The Five Pillars of LEP">
            <div className="pillar-strip-item pillar-strip-1"><span className="num">01</span>ROOTS</div>
            <div className="pillar-strip-item pillar-strip-2"><span className="num">02</span>ORDER</div>
            <div className="pillar-strip-item pillar-strip-3"><span className="num">03</span>MOMENTUM</div>
            <div className="pillar-strip-item pillar-strip-4"><span className="num">04</span>CONTINUITY</div>
            <div className="pillar-strip-item pillar-strip-5"><span className="num">05</span>LEGACY</div>
          </div>
        </div>
      </section>

      {/* ────────── SECTION 2 · PROBLEM ────────── */}
      <section className="section problem-section">
        <div className="container">
          <div className="problem-inner">
            <span className="eyebrow">Why LEP Exists</span>
            <p className="pull-quote">
              Most family enterprises run on assumptions — about who decides, who leads next, and what the business is actually for. By the time those assumptions become conflicts, the cost is rarely just financial.
            </p>
            <div className="problem-body">
              <p>EOS, Scaling Up, and other operating frameworks were built for management teams. They don't touch governance. They don't address succession. They don't ask what the enterprise means to the people whose name is on it.</p>
              <p>LEP was built for all of that. It is the only operating system designed for the full complexity of family enterprise — ownership, family, management, and legacy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── SECTION 3 · FIVE PILLARS ────────── */}
      <section className="section pillars-section">
        <div className="container">
          <span className="eyebrow">The Five Pillars</span>
          <h2>Five Questions. Five Tools. One System.</h2>
          <p className="section-subtext">
            LEP addresses what no other framework touches — the full complexity of ownership, family, management, and legacy in a single integrated system.
          </p>

          <div className="pillar-stack-cards">
            <PillarCard
              className="p-roots" num="1" name="ROOTS" question="Who are we?"
              tool="Family Enterprise Charter™"
              desc="Your shared mission, values, vision, and the explicit commitments that hold your family together across generations."
            />
            <PillarCard
              className="p-order" num="2" name="ORDER" question="How do we decide?"
              tool="Council Map™"
              desc="Governance architecture, council design, and decision rights across Ownership, Family, and Management."
            />
            <PillarCard
              className="p-momentum" num="3" name="MOMENTUM" question="How do we grow?"
              tool="Enterprise Rhythm™"
              desc="Meeting cadence, built-in sales engine, and the rhythm that keeps the business running without the founder in every room."
            />
            <PillarCard
              className="p-continuity" num="4" name="CONTINUITY" question="Who leads next?"
              tool="Continuity Roadmap™"
              desc="Leadership and ownership succession mapped side by side — with milestones, contingency, and coordination with estate counsel."
            />
            <PillarCard
              className="p-legacy" num="5" name="LEGACY" question="What endures?"
              tool="Legacy Blueprint™"
              desc="Wealth philosophy, values transmission, philanthropic mission, and the generational intention for what you've built."
            />
          </div>
        </div>
      </section>

      {/* ────────── DOWNLOAD GATE ────────── */}
      <DownloadGate />

      {/* ────────── SECTION 4 · HOW IT WORKS ────────── */}
      <section className="section how-section">
        <div className="container">
          <span className="eyebrow">How It Works</span>
          <h2>Three Phases. One Engagement.</h2>
          <div className="how-grid">
            <div className="how-card how-card-1">
              <div className="step">01</div>
              <h4>Discovery</h4>
              <div className="meta">$2,500–$5,000</div>
              <p>A structured diagnostic across all five pillars. Surfaces where you are, what's most urgent, and the right sequence for your engagement. Includes a full debrief session.</p>
            </div>
            <div className="how-card how-card-2">
              <div className="step">02</div>
              <h4>Pillar Work</h4>
              <div className="meta">6–18 Months</div>
              <p>Facilitated sessions, one per pillar. Each session produces a completed LEP tool. ROOTS always comes first. The remaining sequence follows your Discovery results.</p>
            </div>
            <div className="how-card how-card-3">
              <div className="step">03</div>
              <h4>Integration &amp; Rhythm</h4>
              <div className="meta">Ongoing</div>
              <p>Quarterly retainer to keep the system alive — councils meeting, cadences holding, succession milestones advancing. Annual full-system review.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── SECTION · STRIDE IN ACTION (Photo Gallery) ────────── */}
      <section className="section in-action-section">
        <div className="container">
          <span className="eyebrow">Stride in Action</span>
          <h2>This is what LEP looks like in the room.</h2>
          <p className="section-subtext">
            Working sessions, retreats, and Stride Family Business Alliance gatherings — where the Five Pillars stop being a framework and start being a working system.
          </p>
          <div className="gallery-grid">
            <figure className="gallery-item gallery-feature">
              <img src="/images/stride-retreat-group.jpg" alt="Stride retreat group at the Adirondack pavilion" loading="lazy" />
              <figcaption>The cohort, end of a two-day LEP Roots retreat.</figcaption>
            </figure>
            <figure className="gallery-item">
              <img src="/images/stride-retreat-whiteboard.jpg" alt="Working session on group norms during an LEP retreat" loading="lazy" />
              <figcaption>Naming the rules of engagement — a Pillar Work session.</figcaption>
            </figure>
            <figure className="gallery-item">
              <img src="/images/stride-fba-march.jpg" alt="Stride FBA member event in March" loading="lazy" />
              <figcaption>Stride FBA · Quarterly member gathering.</figcaption>
            </figure>
            <figure className="gallery-item">
              <img src="/images/stride-fba-evening.jpg" alt="Stride FBA Evening of Comedy 2025" loading="lazy" />
              <figcaption>Stride FBA · Evening of Comedy, 2025.</figcaption>
            </figure>
            <figure className="gallery-item">
              <img src="/images/stride-retreat-teaching.jpg" alt="Jason Packer teaching at an LEP retreat" loading="lazy" />
              <figcaption>Teaching the Council Map — Pillar 02, Order.</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ────────── SECTION 5 · WHO + DIFFERENTIATOR ────────── */}
      <section className="section who-section">
        <div className="container">
          <div className="who-grid">
            <div className="who-col">
              <h3>Who This Is For</h3>
              <ul>
                <li>Family enterprises from G1 to G4+</li>
                <li>Revenue typically $10M–$500M+</li>
                <li>Businesses where family and enterprise are inseparable</li>
                <li>Leaders preparing for succession — or already in it</li>
                <li>Families navigating governance gaps, ownership transitions, or generational conflict</li>
                <li>Advisors who want a complete framework — not just a conversation tool</li>
              </ul>
            </div>
            <div className="who-col">
              <div className="subheading">Where EOS Ends, LEP Begins</div>
              <div className="contrast">
                <div className="not-this">NOT THIS</div>
                <div className="not-this-text">An operations framework that stops at the management layer</div>
                <div className="this-instead">THIS INSTEAD</div>
                <div className="this-instead-text">A complete system that addresses Ownership, Family, and Management in one integrated architecture</div>
              </div>
              <div className="contrast">
                <div className="not-this">NOT THIS</div>
                <div className="not-this-text">Succession as an afterthought</div>
                <div className="this-instead">THIS INSTEAD</div>
                <div className="this-instead-text">Continuity built into the system — leadership and ownership tracked side by side</div>
              </div>
              <div className="contrast">
                <div className="not-this">NOT THIS</div>
                <div className="not-this-text">A retreat, a conversation, or a one-time engagement</div>
                <div className="this-instead">THIS INSTEAD</div>
                <div className="this-instead-text">A living operating system that runs — and is reviewed — every year</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── SECTION · FOUNDER / OPERATOR CREDIBILITY ────────── */}
      <section className="section founder-section">
        <div className="container">
          <div className="founder-grid">
            <figure className="founder-photo">
              <img
                src="/images/hill-and-markes-family.jpg"
                alt="Four generations of the Packer family at Hill &amp; Markes, the family's wholesale distribution business in Amsterdam, NY"
                loading="lazy"
              />
              <figcaption>The Packer family at Hill &amp; Markes — Amsterdam, NY · est. 1906.</figcaption>
            </figure>
            <div className="founder-copy">
              <span className="eyebrow">Built by an operator who's lived it.</span>
              <h2>LEP wasn't designed in a classroom.</h2>
              <p>
                Jason Packer is a fourth-generation operator at Hill &amp; Markes, the wholesale distribution business his great-grandfather founded in 1906. LEP is the system he wished existed when his own family was navigating governance, succession, and the question of what the enterprise is actually for.
              </p>
              <p>
                Every pillar, every tool, every session has been pressure-tested with real family enterprises through Stride Family Business Alliance — not in theory.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── SECTION 6 · TWO AUDIENCE CTAs ────────── */}
      <section className="section two-ctas-section">
        <div className="container">
          <div className="two-ctas-grid">
            <div className="cta-panel">
              <span className="eyebrow">For Family Enterprises</span>
              <h3>Start with a Discovery Conversation</h3>
              <p>A complimentary 60-minute conversation with an LEP Implementer. No commitment. Just clarity about where your enterprise stands and what's possible.</p>
              <a href="#lep-inquiry" className="btn btn-primary">Schedule a Discovery Conversation →</a>
            </div>
            <div className="cta-panel">
              <span className="eyebrow">For Advisors &amp; Consultants</span>
              <h3>Become a Certified LEP Implementer</h3>
              <p>LEP certification equips family enterprise advisors with a complete, licensed framework. Join the founding cohort — limited availability.</p>
              <a href="#lep-inquiry" className="btn btn-outline-on-navy">Apply to the Implementer Program →</a>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── SECTION 7 · INQUIRY FORM ────────── */}
      <InquiryForm />

      {/* ────────── FOOTER STRIP ────────── */}
      <footer className="footer-strip">
        <div className="container">
          LEP™ and From Roots to Legacy™ are developed by Jason Packer and Stride Family Business Alliance. Learn more about Stride at <a href="https://stridefba.com">stridefba.com</a>
        </div>
      </footer>
    </div>
  );
}

// ─── Pillar Card ─────────────────────────────────────────────
function PillarCard({ className, num, name, question, tool, desc }) {
  return (
    <div className={`pillar-card ${className}`}>
      <div className="pillar-left">
        <div className="num">{num}</div>
        <div className="name">{name}</div>
      </div>
      <div className="pillar-middle">
        <div className="pillar-name">{name}</div>
        <div className="pillar-question">{question}</div>
      </div>
      <div className="pillar-right">
        <div className="tool-name">{tool}</div>
        <div className="desc">{desc}</div>
      </div>
    </div>
  );
}

// ─── Download Gate (Netlify Forms) ───────────────────────────
function DownloadGate() {
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeFormData({
          'form-name': 'lep-overview-download',
          firstName,
          email,
        }),
      });
      if (!response.ok) throw new Error('Failed');
      // Trigger PDF download
      const link = document.createElement('a');
      link.href = DOWNLOAD_PDF_PATH;
      link.download = 'LEP-Overview.pdf';
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setStatus('done');
    } catch (err) {
      setStatus('error');
    }
  }

  return (
    <section className="download-gate">
      <div className="container">
        <div className="download-grid">
          <div>
            <span className="eyebrow">Free Download</span>
            <h3>See LEP in One Page</h3>
            <p>Download the LEP Overview — a single-page summary of the Five Pillars, how the engagement works, and who LEP is built for.</p>
          </div>
          {status === 'done' ? (
            <p className="download-success">✓ Your download is starting. Thank you — we'll be in touch.</p>
          ) : (
            <form
              className="download-form"
              name="lep-overview-download"
              method="POST"
              data-netlify="true"
              netlify-honeypot="bot-field"
              onSubmit={handleSubmit}
            >
              <input type="hidden" name="form-name" value="lep-overview-download" />
              <p style={{ display: 'none' }}>
                <label>Do not fill this out: <input name="bot-field" /></label>
              </p>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                required
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending...' : 'Download the Overview'}
              </button>
              {status === 'error' && (
                <p style={{ width: '100%', color: '#D94F6B', fontSize: 14, marginTop: 8 }}>
                  Something went wrong. Please email jpacker@stridefba.com.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Inquiry Form (Netlify Forms) ───────────────────────────
function InquiryForm() {
  const [status, setStatus] = useState('idle');
  const [fields, setFields] = useState({
    firstName: '', lastName: '', email: '', organization: '',
    inquiryType: '', message: '',
  });

  function update(key, value) {
    setFields(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeFormData({ 'form-name': 'lephub-inquiry', ...fields }),
      });
      if (!response.ok) throw new Error('Failed');
      setStatus('done');
    } catch (err) {
      setStatus('error');
    }
  }

  return (
    <section className="section contact-section" id="lep-inquiry">
      <div className="container">
        <div className="contact-inner">
          <span className="eyebrow">Get In Touch</span>
          <h2>Start the Conversation</h2>
          <p className="lead">
            Whether you're a family enterprise exploring LEP for the first time, an advisor interested in Implementer certification, or an event organizer — this is the right place to start.
          </p>

          {status === 'done' ? (
            <div className="inquiry-success">
              Thank you — Jason or an LEP Implementer will be in touch within 2 business days.
            </div>
          ) : (
            <form
              className="form-grid"
              name="lephub-inquiry"
              method="POST"
              data-netlify="true"
              netlify-honeypot="bot-field"
              onSubmit={handleSubmit}
            >
              <input type="hidden" name="form-name" value="lephub-inquiry" />
              <p style={{ display: 'none' }}>
                <label>Do not fill this out: <input name="bot-field" /></label>
              </p>

              <div className="form-field">
                <label htmlFor="firstName">First Name</label>
                <input id="firstName" name="firstName" type="text" required
                  value={fields.firstName} onChange={e => update('firstName', e.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="lastName">Last Name</label>
                <input id="lastName" name="lastName" type="text" required
                  value={fields.lastName} onChange={e => update('lastName', e.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" required
                  value={fields.email} onChange={e => update('email', e.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="organization">Organization / Enterprise Name</label>
                <input id="organization" name="organization" type="text"
                  value={fields.organization} onChange={e => update('organization', e.target.value)} />
              </div>
              <div className="form-field full">
                <label htmlFor="inquiryType">I am a…</label>
                <select id="inquiryType" name="inquiryType" required
                  value={fields.inquiryType} onChange={e => update('inquiryType', e.target.value)}>
                  <option value="">Select one</option>
                  <option value="family_enterprise_leader">Family Enterprise Leader</option>
                  <option value="advisor_consultant">Advisor or Consultant</option>
                  <option value="event_organizer">Event Organizer</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-field full">
                <label htmlFor="message">What brings you here?</label>
                <textarea id="message" name="message" rows={4}
                  value={fields.message} onChange={e => update('message', e.target.value)} />
              </div>
              <div className="submit-row">
                <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending...' : 'Send My Inquiry'}
                </button>
                {status === 'error' && (
                  <p style={{ color: '#D94F6B', fontSize: 14, marginTop: 12 }}>
                    Something went wrong. Please email jpacker@stridefba.com.
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
