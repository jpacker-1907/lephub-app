import React, { useState, useEffect } from 'react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import './App.css';

// ═══════════════════════════════════════════════════════════════
// LEP APP — Legacy Enterprise Platform v2
// With AI-Powered Document Generation
// ═══════════════════════════════════════════════════════════════

// ─── DATA: LEP Framework Structure ─────────────────────────────
const LEP_PILLARS = [
  {
    id: 'roots',
    name: 'ROOTS',
    icon: '🌳',
    color: '#2d5a3d',
    tagline: 'Know where you come from',
    description: 'Family history, core values, and shared identity',
    modules: [
      { id: 'family-story', name: 'Family Story', description: 'Document your origin story, key moments, and legacy milestones', hasContent: true },
      { id: 'core-values', name: 'Core Values', description: 'Define and ratify the values that guide your family enterprise', hasContent: true },
      { id: 'genogram', name: 'Family Genogram', description: 'Map your family system, relationships, and patterns', hasContent: true },
    ],
  },
  {
    id: 'order',
    name: 'ORDER',
    icon: '⚙️',
    color: '#1a3a5c',
    tagline: 'Structure creates freedom',
    description: 'Governance structures, policies, and accountability',
    modules: [
      { id: 'constitution', name: 'Family Constitution', description: 'Create or update your family charter and guiding principles' },
      { id: 'governance', name: 'Governance Design', description: 'Define councils, committees, roles, and decision-making authority' },
      { id: 'policies', name: 'Policies & Agreements', description: 'Employment, compensation, conflict resolution, and operating policies' },
    ],
  },
  {
    id: 'impact',
    name: 'IMPACT',
    icon: '📈',
    color: '#7c3aed',
    tagline: 'Measure what matters',
    description: 'Business strategy, financial health, and performance',
    modules: [
      { id: 'strategic-plan', name: 'Strategic Plan', description: 'Family enterprise vision, goals, and strategic priorities' },
      { id: 'financial-health', name: 'Financial Dashboard', description: 'Key metrics, reporting cadence, and financial transparency' },
      { id: 'performance', name: 'Performance Review', description: 'Business performance assessment and accountability' },
    ],
  },
  {
    id: 'continuity',
    name: 'CONTINUITY',
    icon: '🔄',
    color: '#0891b2',
    tagline: 'Plan for every scenario',
    description: 'Succession planning, contingency, and wealth transfer',
    modules: [
      { id: 'succession', name: 'Succession Plan', description: 'Leadership pipeline, timeline, criteria, and development' },
      { id: 'contingency', name: 'Contingency Protocols', description: 'Emergency scenarios, backup plans, and crisis response' },
      { id: 'estate', name: 'Estate & Wealth Transfer', description: 'Trusts, gifting strategies, and ownership transitions' },
    ],
  },
  {
    id: 'legacy',
    name: 'LEGACY',
    icon: '✦',
    color: '#d97706',
    tagline: 'Build for generations',
    description: 'Next-gen development, philanthropy, and long-term vision',
    modules: [
      { id: 'nextgen', name: 'Next Gen Program', description: 'Education, onboarding, mentorship, and leadership readiness' },
      { id: 'philanthropy', name: 'Philanthropy Strategy', description: 'Giving philosophy, foundations, and community impact' },
      { id: 'vision', name: 'Vision 2050', description: 'Long-term family vision and aspirational goals' },
    ],
  },
];

const MEETING_TYPES = [
  { id: 'board', name: 'Board Meeting', frequency: 'Quarterly', icon: '🏛️', pillars: ['impact', 'continuity'] },
  { id: 'shareholder', name: 'Shareholder Meeting', frequency: 'Annual', icon: '📊', pillars: ['impact', 'continuity'] },
  { id: 'family-council', name: 'Family Council', frequency: 'Monthly', icon: '👥', pillars: ['order', 'roots'] },
  { id: 'family-meeting', name: 'Family Meeting', frequency: 'Annual', icon: '🏠', pillars: ['roots', 'legacy'] },
  { id: 'nextgen', name: 'Next Gen Gathering', frequency: 'Semi-annual', icon: '🌱', pillars: ['legacy'] },
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
  roots: [
    { id: 'r1', text: 'Our family has a documented history and origin story that all members know.' },
    { id: 'r2', text: 'We have clearly defined and written core values that guide our decisions.' },
    { id: 'r3', text: 'Family members understand how they fit into the larger family system.' },
    { id: 'r4', text: 'We regularly share stories and traditions that reinforce our identity.' },
    { id: 'r5', text: 'New family members (spouses, etc.) are formally onboarded to our family culture.' },
  ],
  order: [
    { id: 'o1', text: 'We have a written family constitution or charter.' },
    { id: 'o2', text: 'Roles and responsibilities are clearly defined for family members in the business.' },
    { id: 'o3', text: 'We have formal governance structures (board, councils, committees).' },
    { id: 'o4', text: 'There are clear policies for employment, compensation, and conflict resolution.' },
    { id: 'o5', text: 'Decision-making authority is documented and understood by all.' },
  ],
  impact: [
    { id: 'i1', text: 'We have a written strategic plan for the family enterprise.' },
    { id: 'i2', text: 'Financial performance is regularly reviewed with appropriate stakeholders.' },
    { id: 'i3', text: 'Key metrics are tracked and reported on a consistent schedule.' },
    { id: 'i4', text: 'Business performance is benchmarked against industry standards.' },
    { id: 'i5', text: 'There is accountability for achieving strategic goals.' },
  ],
  continuity: [
    { id: 'c1', text: 'We have a written succession plan for key leadership positions.' },
    { id: 'c2', text: 'Potential successors have been identified and are being developed.' },
    { id: 'c3', text: 'Contingency plans exist for unexpected events (death, disability, divorce).' },
    { id: 'c4', text: 'Estate and wealth transfer plans are documented and communicated.' },
    { id: 'c5', text: 'Ownership transition timelines and criteria are clear.' },
  ],
  legacy: [
    { id: 'l1', text: 'Next generation members have a clear development pathway.' },
    { id: 'l2', text: 'We have a defined approach to family philanthropy.' },
    { id: 'l3', text: 'There is a long-term vision (10+ years) for the family enterprise.' },
    { id: 'l4', text: 'Younger family members are engaged and excited about the future.' },
    { id: 'l5', text: 'We actively prepare the next generation for leadership and ownership.' },
  ],
};

// ═══════════════════════════════════════════════════════════════
// ROOTS MODULE CONTENT
// ═══════════════════════════════════════════════════════════════

const ROOTS_MODULE_CONTENT = {
  'family-story': {
    title: 'Family Story',
    subtitle: 'Document your origin story, key moments, and legacy milestones',
    estimatedTime: '60-90 minutes',
    sections: [
      {
        id: 'origin',
        title: 'Origin Story',
        description: 'Every family enterprise has a founding story. Capture yours.',
        exercises: [
          {
            id: 'founder-story',
            question: 'Who founded the family enterprise, and what year did it begin?',
            type: 'textarea',
            placeholder: 'Describe the founder(s) and the founding moment...',
            helperText: 'Include names, dates, and the circumstances that led to starting the business.',
          },
          {
            id: 'why-started',
            question: 'What problem were they trying to solve or opportunity were they pursuing?',
            type: 'textarea',
            placeholder: 'What drove the founding decision...',
          },
          {
            id: 'early-struggles',
            question: 'What were the biggest challenges in the early years?',
            type: 'textarea',
            placeholder: 'Describe the obstacles overcome...',
          },
          {
            id: 'first-success',
            question: 'What was the first major milestone or success?',
            type: 'textarea',
            placeholder: 'The breakthrough moment...',
          },
        ],
      },
      {
        id: 'milestones',
        title: 'Key Milestones',
        description: 'Map the critical moments that shaped your family enterprise.',
        exercises: [
          {
            id: 'milestone-list',
            question: 'List 5-10 defining moments in your family enterprise history',
            type: 'milestone-builder',
            helperText: 'Include expansions, crises overcome, leadership transitions, major deals, etc.',
          },
        ],
      },
      {
        id: 'legacy-stories',
        title: 'Stories We Tell',
        description: 'The stories passed down become the culture. Which ones matter most?',
        exercises: [
          {
            id: 'hero-story',
            question: 'What\'s a story about a family member that exemplifies who we are?',
            type: 'textarea',
            placeholder: 'The story of...',
            helperText: 'This could be about sacrifice, integrity, innovation, or resilience.',
          },
          {
            id: 'crisis-story',
            question: 'What\'s a story about a time the family enterprise almost failed?',
            type: 'textarea',
            placeholder: 'The time we almost...',
            helperText: 'How the family came together in crisis.',
          },
          {
            id: 'values-story',
            question: 'What\'s a story that captures our core values in action?',
            type: 'textarea',
            placeholder: 'This story shows what we stand for...',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Family Story Document',
      description: 'A written narrative capturing your origin, milestones, and defining stories.',
    },
  },
  'core-values': {
    title: 'Core Values',
    subtitle: 'Define and ratify the values that guide your family enterprise',
    estimatedTime: '90-120 minutes',
    sections: [
      {
        id: 'current-values',
        title: 'Values Discovery',
        description: 'Before defining new values, understand what\'s already guiding you.',
        exercises: [
          {
            id: 'implicit-values',
            question: 'What values have guided your family enterprise, even if unwritten?',
            type: 'textarea',
            placeholder: 'The values we\'ve always operated by...',
            helperText: 'Think about what the founders would say matters most.',
          },
          {
            id: 'non-negotiables',
            question: 'What behaviors would cause someone to be asked to leave the business?',
            type: 'textarea',
            placeholder: 'We would never tolerate...',
            helperText: 'The inverse of your values reveals what truly matters.',
          },
          {
            id: 'proud-moments',
            question: 'When have you been most proud of how the family handled something?',
            type: 'textarea',
            placeholder: 'The moment we showed who we really are...',
          },
        ],
      },
      {
        id: 'values-definition',
        title: 'Values Definition',
        description: 'Name and define 3-5 core values for your family enterprise.',
        exercises: [
          {
            id: 'values-list',
            question: 'Define your family enterprise core values',
            type: 'values-builder',
            helperText: 'Each value needs a name, definition, and behavioral example.',
          },
        ],
      },
      {
        id: 'values-in-action',
        title: 'Values in Action',
        description: 'Values only matter if they\'re used. Define how.',
        exercises: [
          {
            id: 'hiring-values',
            question: 'How will these values influence who we hire?',
            type: 'textarea',
            placeholder: 'When evaluating candidates, we look for...',
          },
          {
            id: 'decision-values',
            question: 'How will these values guide difficult decisions?',
            type: 'textarea',
            placeholder: 'When we\'re unsure what to do, we ask ourselves...',
          },
          {
            id: 'values-recognition',
            question: 'How will we recognize and celebrate values-driven behavior?',
            type: 'textarea',
            placeholder: 'We will acknowledge values in action by...',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Family Values Charter',
      description: 'A ratified document listing your 3-5 core values with definitions.',
    },
  },
  'genogram': {
    title: 'Family Genogram',
    subtitle: 'Map your family system, relationships, and patterns',
    estimatedTime: '60-90 minutes',
    sections: [
      {
        id: 'family-mapping',
        title: 'Family Map',
        description: 'Create a visual map of your family system.',
        exercises: [
          {
            id: 'generations',
            question: 'How many generations are currently involved or connected to the enterprise?',
            type: 'select',
            options: ['2 generations', '3 generations', '4 generations', '5+ generations'],
          },
          {
            id: 'family-branches',
            question: 'List each branch of the family',
            type: 'branch-builder',
            helperText: 'Include the branch name, key members, and their roles.',
          },
        ],
      },
      {
        id: 'relationships',
        title: 'Relationship Patterns',
        description: 'Understand the dynamics that shape your family system.',
        exercises: [
          {
            id: 'strong-bonds',
            question: 'Which family relationships are particularly strong?',
            type: 'textarea',
            placeholder: 'The strongest bonds are between...',
            helperText: 'These alliances influence how decisions get made.',
          },
          {
            id: 'tension-areas',
            question: 'Where are there tensions or conflicts in the family system?',
            type: 'textarea',
            placeholder: 'There has historically been tension around...',
            helperText: 'Being honest about these patterns is essential.',
          },
          {
            id: 'triangles',
            question: 'Are there "triangles" where two people communicate through a third?',
            type: 'textarea',
            placeholder: 'Communication sometimes goes through...',
            helperText: 'Triangulation is common in family systems.',
          },
        ],
      },
      {
        id: 'roles-patterns',
        title: 'Roles & Patterns',
        description: 'Every family assigns informal roles. Name them.',
        exercises: [
          {
            id: 'peacemaker',
            question: 'Who plays the "peacemaker" role in the family?',
            type: 'textarea',
            placeholder: 'The person who smooths things over is...',
          },
          {
            id: 'truth-teller',
            question: 'Who plays the "truth teller" role?',
            type: 'textarea',
            placeholder: 'The person who says what others won\'t is...',
          },
          {
            id: 'decision-maker',
            question: 'Who is the de facto decision-maker, regardless of formal titles?',
            type: 'textarea',
            placeholder: 'The person whose opinion ultimately matters most is...',
          },
          {
            id: 'patterns',
            question: 'What patterns repeat across generations?',
            type: 'textarea',
            placeholder: 'We see recurring themes of...',
            helperText: 'Patterns might include conflict avoidance, entrepreneurship, etc.',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Family Genogram',
      description: 'A documented map of your family system including branches and patterns.',
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// AI DOCUMENT GENERATION
// ═══════════════════════════════════════════════════════════════

const DOCUMENT_PROMPTS = {
  'family-story': `You are a professional family enterprise consultant helping craft a Family Story Document.

Based on the family's responses below, write a polished, narrative document that tells their story in a compelling way. 

Guidelines:
- Write in third person ("The [Family Name] enterprise began...")
- Create a flowing narrative, not bullet points
- Include specific details they provided (names, dates, places)
- Organize into clear sections: Our Beginning, Key Milestones, The Stories That Define Us
- Make it feel warm and professional — something they'd be proud to share
- Keep it to about 2-3 pages worth of content
- End with a forward-looking statement about carrying the legacy forward

FAMILY RESPONSES:
`,
  'core-values': `You are a professional family enterprise consultant helping craft a Family Values Charter.

Based on the family's responses below, create a formal Values Charter document.

Guidelines:
- Write in first person plural ("We believe...", "Our family...")
- Start with a brief preamble about why values matter to this family
- For each value, include: the value name, a 2-3 sentence definition, and specific behavioral examples
- Add a section on "Living Our Values" that incorporates their responses about hiring, decisions, and recognition
- Make it feel both formal enough to be a governance document and warm enough to reflect family culture
- End with a commitment statement suitable for family members to sign

FAMILY RESPONSES:
`,
  'genogram': `You are a professional family enterprise consultant helping document a Family System Analysis.

Based on the family's responses below, create a narrative document describing their family system.

Guidelines:
- Write professionally but accessibly
- Describe the family structure and branches clearly
- Note relationship strengths and areas of potential tension diplomatically
- Describe the informal roles people play (peacemaker, truth-teller, etc.) 
- Identify patterns that repeat across generations
- Include observations about communication dynamics
- Offer brief, constructive insights about how these patterns might inform governance
- This is a working document, not a final deliverable — it should be useful for further discussion

FAMILY RESPONSES:
`,
};

async function generateDocumentWithAI(moduleId, data) {
  const prompt = DOCUMENT_PROMPTS[moduleId];
  if (!prompt) throw new Error('No prompt template for this module');
  
  // Format the family's responses
  let formattedData = '';
  
  if (moduleId === 'family-story') {
    formattedData = `
ORIGIN STORY:
- Founder: ${data['founder-story'] || 'Not provided'}
- Why Started: ${data['why-started'] || 'Not provided'}
- Early Struggles: ${data['early-struggles'] || 'Not provided'}
- First Success: ${data['first-success'] || 'Not provided'}

KEY MILESTONES:
${(data.milestones || []).map(m => `- ${m.year}: ${m.title} — ${m.description}`).join('\n') || 'None provided'}

STORIES WE TELL:
- Hero Story: ${data['hero-story'] || 'Not provided'}
- Crisis Story: ${data['crisis-story'] || 'Not provided'}
- Values Story: ${data['values-story'] || 'Not provided'}
`;
  } else if (moduleId === 'core-values') {
    formattedData = `
VALUES DISCOVERY:
- Implicit Values: ${data['implicit-values'] || 'Not provided'}
- Non-Negotiables: ${data['non-negotiables'] || 'Not provided'}
- Proud Moments: ${data['proud-moments'] || 'Not provided'}

DEFINED VALUES:
${(data.values || []).map((v, i) => `
Value ${i + 1}: ${v.name || 'Unnamed'}
Definition: ${v.definition || 'Not defined'}
Behavior: ${v.behavior || 'Not specified'}
`).join('\n') || 'None defined'}

VALUES IN ACTION:
- Hiring: ${data['hiring-values'] || 'Not provided'}
- Decision-Making: ${data['decision-values'] || 'Not provided'}
- Recognition: ${data['values-recognition'] || 'Not provided'}
`;
  } else if (moduleId === 'genogram') {
    formattedData = `
FAMILY STRUCTURE:
- Generations: ${data['generations'] || 'Not specified'}

FAMILY BRANCHES:
${(data.branches || []).map((b, i) => `
Branch ${i + 1}: ${b.name || 'Unnamed'}
Members: ${b.members || 'Not listed'}
Roles: ${b.roles || 'Not specified'}
`).join('\n') || 'None defined'}

RELATIONSHIP PATTERNS:
- Strong Bonds: ${data['strong-bonds'] || 'Not provided'}
- Tension Areas: ${data['tension-areas'] || 'Not provided'}
- Communication Triangles: ${data['triangles'] || 'Not provided'}

ROLES & PATTERNS:
- Peacemaker: ${data['peacemaker'] || 'Not identified'}
- Truth-Teller: ${data['truth-teller'] || 'Not identified'}
- Decision-Maker: ${data['decision-maker'] || 'Not identified'}
- Repeating Patterns: ${data['patterns'] || 'Not identified'}
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
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
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

function Nav({ currentView, setCurrentView, user }) {
  return (
    <nav className="app-nav">
      <div className="nav-brand">
        <span className="nav-logo">◆</span>
        <span className="nav-title">LEP</span>
      </div>
      
      <div className="nav-menu">
        <button 
          className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentView('dashboard')}
        >
          <span className="nav-icon">◇</span>
          Dashboard
        </button>
        <button 
          className={`nav-item ${currentView === 'assessment' ? 'active' : ''}`}
          onClick={() => setCurrentView('assessment')}
        >
          <span className="nav-icon">📊</span>
          Assessment
        </button>
        <button 
          className={`nav-item ${currentView === 'pillars' ? 'active' : ''}`}
          onClick={() => setCurrentView('pillars')}
        >
          <span className="nav-icon">🏛️</span>
          Pillars
        </button>
        <button 
          className={`nav-item ${currentView === 'meetings' ? 'active' : ''}`}
          onClick={() => setCurrentView('meetings')}
        >
          <span className="nav-icon">📅</span>
          Meetings
        </button>
        <button 
          className={`nav-item ${currentView === 'vault' ? 'active' : ''}`}
          onClick={() => setCurrentView('vault')}
        >
          <span className="nav-icon">🌁</span>
          Vault
        </button>
      </div>
      
      <div className="nav-user">
        <div className="user-avatar">{user?.initials || 'JP'}</div>
        <div className="user-info">
          <span className="user-name">{user?.name || 'Jason Packer'}</span>
          <span className="user-role">Administrator</span>
        </div>
      </div>
    </nav>
  );
}

function Dashboard({ scores, setCurrentView, setActivePillar }) {
  const totalScore = scores ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 5) : null;
  
  return (
    <div className="dashboard">
      <header className="page-header">
        <div>
          <h1>Welcome back</h1>
          <p className="subtitle">Here's where your family enterprise stands.</p>
        </div>
        {!scores && (
          <button className="btn btn-primary" onClick={() => setCurrentView('assessment')}>
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
                {totalScore >= 80 ? "Excellent! Your family enterprise has strong foundations." :
                 totalScore >= 60 ? "Good progress. Focus on your lower-scoring pillars." :
                 totalScore >= 40 ? "Room for growth. Consider working with a peer group." :
                 "Just getting started. The LEP journey will transform your family enterprise."}
              </p>
              <button className="btn btn-outline" onClick={() => setCurrentView('assessment')}>
                Retake Assessment
              </button>
            </div>
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
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h2>Start Your LEP Journey</h2>
          <p>Take the assessment to discover where your family enterprise stands across all 5 pillars.</p>
          <button className="btn btn-primary btn-lg" onClick={() => setCurrentView('assessment')}>
            Take the LEP Assessment
          </button>
        </div>
      )}
      
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-grid">
          <button className="action-card" onClick={() => setCurrentView('meetings')}>
            <span className="action-icon">📅</span>
            <span className="action-label">Schedule a Meeting</span>
          </button>
          <button className="action-card" onClick={() => setCurrentView('pillars')}>
            <span className="action-icon">📝</span>
            <span className="action-label">Work on a Module</span>
          </button>
          <button className="action-card" onClick={() => setCurrentView('vault')}>
            <span className="action-icon">📁</span>
            <span className="action-label">View Documents</span>
          </button>
          <a className="action-card" href="https://stridefba.com" target="_blank" rel="noopener noreferrer">
            <span className="action-icon">🤝</span>
            <span className="action-label">Join a Peer Group</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function Assessment({ onComplete }) {
  const [currentPillar, setCurrentPillar] = useState(0);
  const [answers, setAnswers] = useState({});
  
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
      </header>
      
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

function ModuleWorkbook({ moduleId, moduleData, onClose, onSave, savedData, onMarkComplete }) {
  const content = ROOTS_MODULE_CONTENT[moduleId];
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
          <p>Your {content.deliverable.title} has been saved to your downloads folder.</p>
          
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
    if (module.hasContent || pillar.id === 'roots') {
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
              <h2>{pillar.name}</h2>
              <p className="pillar-tagline">{pillar.tagline}</p>
            </div>
          </div>
          <p className="pillar-description">{pillar.description}</p>
        </div>
        
        <div className="modules-list">
          <h3>Modules</h3>
          {pillar.modules.map((module, i) => {
            const status = moduleProgress[module.id] || 'not-started';
            const hasContent = module.hasContent || pillar.id === 'roots';
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

function MeetingsView() {
  return (
    <div className="meetings-view">
      <header className="page-header">
        <div>
          <h1>Meeting Center</h1>
          <p className="subtitle">Schedule and track your governance meetings.</p>
        </div>
        <button className="btn btn-primary">+ Schedule Meeting</button>
      </header>
      
      <div className="meetings-grid">
        <div className="meetings-section">
          <h3>Meeting Types</h3>
          <div className="meeting-types">
            {MEETING_TYPES.map(meeting => (
              <div key={meeting.id} className="meeting-type-card">
                <span className="meeting-icon">{meeting.icon}</span>
                <div className="meeting-info">
                  <h4>{meeting.name}</h4>
                  <span className="meeting-frequency">{meeting.frequency}</span>
                </div>
                <button className="btn btn-outline btn-sm">View Template</button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="meetings-section">
          <h3>Committees</h3>
          <div className="committee-list">
            {COMMITTEE_TYPES.map(committee => (
              <div key={committee.id} className="committee-card">
                <span className="committee-icon">{committee.icon}</span>
                <span className="committee-name">{committee.name}</span>
                <button className="btn btn-ghost btn-sm">Configure</button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="upcoming-meetings">
        <h3>Upcoming Meetings</h3>
        <div className="empty-state-sm">
          <p>No meetings scheduled. Create your first meeting to get started.</p>
          <button className="btn btn-outline">+ Schedule Meeting</button>
        </div>
      </div>
    </div>
  );
}

function VaultView() {
  return (
    <div className="vault-view">
      <header className="page-header">
        <div>
          <h1>Document Vault</h1>
          <p className="subtitle">All your completed work, organized by pillar.</p>
        </div>
        <button className="btn btn-primary">+ Upload Document</button>
      </header>
      
      <div className="vault-grid">
        {LEP_PILLARS.map(pillar => (
          <div key={pillar.id} className="vault-folder" style={{'--pillar-color': pillar.color}}>
            <div className="folder-header">
              <span className="folder-icon">{pillar.icon}</span>
              <h4>{pillar.name}</h4>
            </div>
            <div className="folder-content">
              <p className="folder-empty">No documents yet</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [scores, setScores] = useState(null);
  const [activePillar, setActivePillar] = useState('roots');
  const [moduleProgress, setModuleProgress] = useState({});
  const [moduleData, setModuleData] = useState({});
  
  useEffect(() => {
    const savedScores = localStorage.getItem('lep_scores');
    const savedProgress = localStorage.getItem('lep_progress');
    const savedModuleData = localStorage.getItem('lep_module_data');
    if (savedScores) setScores(JSON.parse(savedScores));
    if (savedProgress) setModuleProgress(JSON.parse(savedProgress));
    if (savedModuleData) setModuleData(JSON.parse(savedModuleData));
  }, []);
  
  useEffect(() => { if (scores) localStorage.setItem('lep_scores', JSON.stringify(scores)); }, [scores]);
  useEffect(() => { localStorage.setItem('lep_progress', JSON.stringify(moduleProgress)); }, [moduleProgress]);
  useEffect(() => { localStorage.setItem('lep_module_data', JSON.stringify(moduleData)); }, [moduleData]);
  
  const handleAssessmentComplete = (newScores) => {
    setScores(newScores);
    setCurrentView('dashboard');
  };
  
  const user = { name: 'Jason Packer', initials: 'JP' };
  
  return (
    <div className="lep-app">
      <Nav currentView={currentView} setCurrentView={setCurrentView} user={user} />
      <main className="app-main">
        {currentView === 'dashboard' && <Dashboard scores={scores} setCurrentView={setCurrentView} setActivePillar={setActivePillar} />}
        {currentView === 'assessment' && <Assessment onComplete={handleAssessmentComplete} />}
        {currentView === 'pillars' && <PillarsView activePillar={activePillar} setActivePillar={setActivePillar} moduleProgress={moduleProgress} setModuleProgress={setModuleProgress} moduleData={moduleData} setModuleData={setModuleData} />}
        {currentView === 'meetings' && <MeetingsView />}
        {currentView === 'vault' && <VaultView />}
      </main>
    </div>
  );
}
