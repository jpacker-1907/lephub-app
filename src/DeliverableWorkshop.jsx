import React, { useState, useEffect } from 'react';

const TEMPLATES = {
  familyCharter: {
    id: 'familyCharter',
    title: 'Family Charter',
    description: 'Statement of values, mission, and operating principles that guide your family enterprise.',
    icon: '📋',
    sections: [
      { id: 'mission', title: 'Family Mission', description: 'What does your family enterprise stand for?', questions: ['What is the core purpose of our family enterprise?', 'What impact do we want to have on our business and community?', 'What legacy do we want to leave?'] },
      { id: 'values', title: 'Core Values', description: 'List the 3-5 values that define your family.', questions: ['What values have guided our family historically?', 'What values are non-negotiable for us?', 'How do these values show up in our decision-making?'] },
      { id: 'principles', title: 'Operating Principles', description: 'How will we conduct ourselves in the business?', questions: ['What principles will guide our daily operations?', 'How do we treat employees and stakeholders?', 'What standards of integrity do we commit to?'] },
      { id: 'decisionMaking', title: 'Decision-Making Process', description: 'How will we make major decisions as a family?', questions: ['What decisions require family input?', 'Who has final authority on different types of decisions?', 'How do we ensure all voices are heard?'] },
      { id: 'conflict', title: 'Conflict Resolution', description: 'How will we address disagreements constructively?', questions: ['What is our process for addressing family conflicts?', 'Who can mediate disputes?', 'When do we involve outside advisors?'] },
      { id: 'communication', title: 'Communication Commitments', description: 'Commitments to open and honest communication.', questions: ['How often will we communicate formally and informally?', 'What topics require transparent disclosure?', 'How do we handle difficult conversations?'] },
    ],
  },
  employmentPolicy: {
    id: 'employmentPolicy',
    title: 'Employment Policy',
    description: 'Rules and standards for family members working in the business.',
    icon: '👔',
    sections: [
      { id: 'eligibility', title: 'Eligibility Requirements', description: 'Who can work in the business and under what conditions?', questions: ['What is the minimum age or education level?', 'What skills or experience are required?', 'Are there probation periods?'] },
      { id: 'compensation', title: 'Compensation Philosophy', description: 'How do we set salaries and benefits for family members?', questions: ['Are family members paid market rates?', 'How are bonuses and incentives structured?', 'What benefits do family employees receive?'] },
      { id: 'performance', title: 'Performance Standards', description: 'What performance expectations apply to family employees?', questions: ['What are the key performance metrics?', 'How often are reviews conducted?', 'What happens if performance falls short?'] },
      { id: 'reporting', title: 'Reporting Relationships', description: 'Who reports to whom in the organizational structure?', questions: ['Who supervises family members?', 'How do we handle conflicts of interest with management?', 'What is the appeal process?'] },
      { id: 'entryExit', title: 'Entry/Exit Criteria', description: 'Under what circumstances can family members join or leave?', questions: ['What triggers departure from a role?', 'What is the notice period?', 'Are there non-compete or confidentiality agreements?'] },
      { id: 'nonFamily', title: 'Non-Family Employee Protections', description: 'How do we protect non-family employees from unfair treatment?', questions: ['What guarantees do non-family employees have?', 'How do we prevent family favoritism?', 'What grievance processes exist?'] },
    ],
  },
  governanceStructure: {
    id: 'governanceStructure',
    title: 'Governance Structure',
    description: 'Define who sits on what boards, councils, and committees.',
    icon: '🏛️',
    sections: [
      { id: 'board', title: 'Board of Directors', description: 'Composition, terms, and responsibilities of the board.', questions: ['How many board seats are there?', 'How many inside vs. outside directors?', 'What are board term lengths?', 'What are the key responsibilities?'] },
      { id: 'familyCouncil', title: 'Family Council', description: 'Members, meeting cadence, and charter for family governance.', questions: ['Who can participate in the family council?', 'How often does it meet?', 'What decisions does it make?', 'What is the succession plan for council leadership?'] },
      { id: 'ownershipGroup', title: 'Ownership Group', description: 'Voting rights, meetings, and owner responsibilities.', questions: ['Who holds voting shares?', 'How are voting rights exercised?', 'What is the annual meeting cadence?', 'What matters require owner approval?'] },
      { id: 'advisory', title: 'Advisory Board', description: 'External advisors who guide the family and business.', questions: ['Who are our key external advisors?', 'What expertise do they bring?', 'How often do we consult with them?', 'What is their compensation structure?'] },
    ],
  },
  communicationProtocol: {
    id: 'communicationProtocol',
    title: 'Communication Protocol',
    description: 'Guidelines for how the family communicates about business and family matters.',
    icon: '💬',
    sections: [
      { id: 'cadence', title: 'Meeting Cadence', description: 'Frequency and types of family and business meetings.', questions: ['What regular meetings will we hold?', 'Who attends each type of meeting?', 'What is the agenda-setting process?', 'How are minutes documented?'] },
      { id: 'informationSharing', title: 'Information Sharing Policy', description: 'What information gets shared, with whom, and how?', questions: ['What financial information is shared broadly?', 'Who gets access to strategic plans?', 'How do we handle confidential information?', 'What is the communication timeline for major announcements?'] },
      { id: 'escalation', title: 'Conflict Escalation Process', description: 'Steps for raising and resolving concerns.', questions: ['When should a concern be raised?', 'Who should it be raised with first?', 'What is the escalation path?', 'When do we involve outside mediators?'] },
      { id: 'confidentiality', title: 'Confidentiality Guidelines', description: 'What stays private and what can be shared.', questions: ['What information is confidential?', 'What is the penalty for breaking confidentiality?', 'Are there exceptions for legal/tax compliance?', 'How do we handle information after someone leaves?'] },
      { id: 'technology', title: 'Technology & Tools', description: 'Platforms and channels for family communication.', questions: ['What platforms will we use for different types of communication?', 'Who has access to shared drives and documents?', 'What is our email/messaging etiquette?', 'How do we archive important communications?'] },
    ],
  },
  successionTimeline: {
    id: 'successionTimeline',
    title: 'Succession Timeline',
    description: 'Phased transition plan for leadership and ownership.',
    icon: '🗓️',
    sections: [
      { id: 'currentState', title: 'Current State Assessment', description: 'Where are we now in the transition process?', questions: ['Who currently leads the business?', 'What are their key responsibilities?', 'What are the biggest leadership gaps or risks?', 'What is the timeline for transition?'] },
      { id: 'phase1', title: 'Phase 1 (1-2 years)', description: 'Immediate priorities and preparations.', questions: ['What capabilities need to be built?', 'What mentoring relationships need to start?', 'What organizational changes are needed?', 'What are the key milestones?'] },
      { id: 'phase2', title: 'Phase 2 (3-5 years)', description: 'Gradual increase in successor responsibilities.', questions: ['What additional roles will the successor take on?', 'How will we measure readiness for the next phase?', 'What risks do we need to mitigate?', 'What external support might be needed?'] },
      { id: 'phase3', title: 'Phase 3 (5-10 years)', description: 'Transition completion and founder transition.', questions: ['When does full leadership transfer occur?', 'What advisory role might the founder have?', 'How do we handle the emotional transition?', 'What legacy projects might the founder pursue?'] },
      { id: 'milestones', title: 'Key Milestones', description: 'Critical checkpoints and decision points.', questions: ['What are the non-negotiable milestones?', 'How will we measure progress?', 'Who evaluates readiness at each stage?', 'What triggers a change to the plan?'] },
      { id: 'responsible', title: 'Responsible Parties', description: 'Who owns which aspects of the transition.', questions: ['Who drives the overall succession planning?', 'Who mentors the successor?', 'Who evaluates progress?', 'Who communicates with the broader family?'] },
    ],
  },
  buySellAgreement: {
    id: 'buySellAgreement',
    title: 'Buy-Sell Agreement Prep',
    description: 'Key decisions to make before engaging an attorney.',
    icon: '📑',
    sections: [
      { id: 'triggeringEvents', title: 'Triggering Events', description: 'What events would force a buy-sell transaction?', questions: ['Does death trigger a buy-sell?', 'Does disability?', 'Does divorce or bankruptcy?', 'What about departure from the business?', 'What happens if someone wants to sell shares?'] },
      { id: 'valuation', title: 'Valuation Methodology', description: 'How will shares be valued in a buy-sell event?', questions: ['Will we use a formula-based approach?', 'Will we get an independent appraisal?', 'How often will valuation be updated?', 'What adjustments might apply?'] },
      { id: 'funding', title: 'Funding Mechanism', description: 'How will the purchase be financed?', questions: ['Will we use life insurance proceeds?', 'Will the company have a cash reserve?', 'Will there be a note to the departing owner?', 'What is the repayment term?'] },
      { id: 'restrictions', title: 'Transfer Restrictions', description: 'Who can buy shares and under what conditions?', questions: ['Can shares be sold to non-family members?', 'Do remaining owners have right of first refusal?', 'Are there tag-along or drag-along rights?', 'What about redemption by the company?'] },
      { id: 'keyDecisions', title: 'Key Decision Points', description: 'Critical questions to resolve with counsel.', questions: ['What form should the agreement take?', 'How frequently should we review and update it?', 'How do we handle valuation disputes?', 'What happens if someone refuses to participate?', 'What are the tax implications?'] },
    ],
  },
};

const DeliverableWorkshop = () => {
  const [deliverables, setDeliverables] = useState([]);
  const [activeTab, setActiveTab] = useState('myDeliverables');
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('lep_workshop_deliverables');
    if (saved) {
      try {
        setDeliverables(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load deliverables', e);
      }
    }
  }, []);

  // Save to localStorage whenever deliverables change
  useEffect(() => {
    localStorage.setItem('lep_workshop_deliverables', JSON.stringify(deliverables));
  }, [deliverables]);

  const startNewDeliverable = (templateId) => {
    const template = TEMPLATES[templateId];
    const newDeliverable = {
      id: `del_${Date.now()}`,
      templateId,
      title: template.title,
      status: 'Not Started',
      sections: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    template.sections.forEach((section) => {
      newDeliverable.sections[section.id] = { content: '', completed: false };
    });

    setDeliverables([...deliverables, newDeliverable]);
    setSelectedDeliverable(newDeliverable);
    setCurrentSectionIndex(0);
    setActiveTab(null);
  };

  const updateSectionContent = (sectionId, content, completed) => {
    const updated = { ...selectedDeliverable };
    updated.sections[sectionId] = { content, completed };
    updated.updatedAt = new Date().toISOString();
    setSelectedDeliverable(updated);
    setDeliverables(deliverables.map((d) => (d.id === updated.id ? updated : d)));
  };

  const updateDeliverableStatus = (status) => {
    const updated = { ...selectedDeliverable, status };
    setSelectedDeliverable(updated);
    setDeliverables(deliverables.map((d) => (d.id === updated.id ? updated : d)));
  };

  const goToSection = (index) => {
    setCurrentSectionIndex(Math.max(0, Math.min(index, TEMPLATES[selectedDeliverable.templateId].sections.length - 1)));
  };

  const getProgressPercentage = (deliverable) => {
    const template = TEMPLATES[deliverable.templateId];
    const completed = template.sections.filter((s) => deliverable.sections[s.id]?.completed).length;
    return Math.round((completed / template.sections.length) * 100);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Not Started': '#7A8BA0',
      'In Progress': '#E05B6F',
      'In Review': '#2B4C6F',
      'Finalized': '#2B8A5E',
    };
    return colors[status] || '#7A8BA0';
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Editing View
  if (selectedDeliverable) {
    const template = TEMPLATES[selectedDeliverable.templateId];
    const currentSection = template.sections[currentSectionIndex];
    const sectionData = selectedDeliverable.sections[currentSection.id];
    const progress = getProgressPercentage(selectedDeliverable);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#F5F7FA' }}>
        {/* Top bar */}
        <div style={{
          backgroundColor: '#1A2A3F',
          color: 'white',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #DDE3EB',
        }}>
          <div>
            <h1 style={{ margin: '0 0 4px 0', fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '20px' }}>
              {selectedDeliverable.title}
            </h1>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>
              {currentSectionIndex + 1} of {template.sections.length} sections
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              value={selectedDeliverable.status}
              onChange={(e) => updateDeliverableStatus(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.3)',
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '14px',
                fontFamily: 'system-ui',
                cursor: 'pointer',
              }}
            >
              <option>Not Started</option>
              <option>In Progress</option>
              <option>In Review</option>
              <option>Finalized</option>
            </select>
            <button
              onClick={() => {
                setSelectedDeliverable(null);
                setActiveTab('myDeliverables');
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: 'system-ui',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.3)'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            >
              Back to List
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left sidebar */}
          <div style={{
            width: '240px',
            backgroundColor: 'white',
            borderRight: '1px solid #DDE3EB',
            overflowY: 'auto',
            padding: '16px',
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#7A8BA0', fontFamily: 'system-ui' }}>
              Sections
            </h3>
            {template.sections.map((section, idx) => {
              const isCompleted = selectedDeliverable.sections[section.id]?.completed;
              const isActive = idx === currentSectionIndex;
              return (
                <button
                  key={section.id}
                  onClick={() => goToSection(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '10px 12px',
                    marginBottom: '4px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isActive ? '#EFF2F7' : 'transparent',
                    color: '#1A2A3F',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontFamily: 'system-ui',
                    textAlign: 'left',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#F5F7FA';
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{ fontSize: '14px' }}>{isCompleted ? '✓' : '○'}</span>
                  <span style={{ flex: 1 }}>{section.title}</span>
                </button>
              );
            })}
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #DDE3EB' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 600, color: '#7A8BA0' }}>
                Progress
              </p>
              <div style={{
                width: '100%',
                height: '6px',
                backgroundColor: '#DDE3EB',
                borderRadius: '3px',
                overflow: 'hidden',
              }}>
                <div
                  style={{
                    height: '100%',
                    backgroundColor: '#2B4C6F',
                    width: `${progress}%`,
                    transition: 'width 0.3s',
                  }}
                />
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#7A8BA0' }}>
                {progress}% complete
              </p>
            </div>
          </div>

          {/* Main content area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ maxWidth: '700px', width: '100%' }}>
              <h2 style={{
                fontSize: '24px',
                fontFamily: "'Instrument Serif', Georgia, serif",
                color: '#1A2A3F',
                margin: '0 0 8px 0',
              }}>
                {currentSection.title}
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#7A8BA0',
                margin: '0 0 24px 0',
                lineHeight: '1.5',
              }}>
                {currentSection.description}
              </p>

              <label style={{ display: 'block', marginBottom: '12px', fontSize: '12px', fontWeight: 600, color: '#1A2A3F', textTransform: 'uppercase', fontFamily: 'system-ui' }}>
                Your Content
              </label>
              <textarea
                value={sectionData.content}
                onChange={(e) => updateSectionContent(currentSection.id, e.target.value, sectionData.completed)}
                style={{
                  width: '100%',
                  minHeight: '200px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #DDE3EB',
                  fontFamily: 'system-ui',
                  fontSize: '14px',
                  fontColor: '#1A2A3F',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#2B4C6F'}
                onBlur={(e) => e.target.style.borderColor = '#DDE3EB'}
                placeholder="Write your content here..."
              />

              <div style={{ marginTop: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontFamily: 'system-ui', color: '#1A2A3F' }}>
                  <input
                    type="checkbox"
                    checked={sectionData.completed}
                    onChange={(e) => updateSectionContent(currentSection.id, sectionData.content, e.target.checked)}
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                  Mark section as complete
                </label>
              </div>

              {/* Guiding Questions */}
              <details style={{
                marginTop: '28px',
                padding: '16px',
                backgroundColor: '#F5F7FA',
                borderRadius: '8px',
                border: '1px solid #DDE3EB',
              }}>
                <summary style={{
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: '#1A2A3F',
                  fontSize: '14px',
                  fontFamily: 'system-ui',
                  userSelect: 'none',
                }}>
                  Guiding Questions
                </summary>
                <ul style={{
                  margin: '12px 0 0 0',
                  paddingLeft: '20px',
                  fontSize: '13px',
                  color: '#7A8BA0',
                  lineHeight: '1.6',
                }}>
                  {currentSection.questions.map((q, idx) => (
                    <li key={idx} style={{ marginBottom: '8px' }}>{q}</li>
                  ))}
                </ul>
              </details>
            </div>
          </div>
        </div>

        {/* Bottom navigation */}
        <div style={{
          backgroundColor: 'white',
          borderTop: '1px solid #DDE3EB',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <button
            onClick={() => goToSection(currentSectionIndex - 1)}
            disabled={currentSectionIndex === 0}
            style={{
              padding: '10px 16px',
              borderRadius: '6px',
              border: '1px solid #DDE3EB',
              backgroundColor: 'white',
              color: currentSectionIndex === 0 ? '#DDE3EB' : '#1A2A3F',
              cursor: currentSectionIndex === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontFamily: 'system-ui',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              if (currentSectionIndex > 0) {
                e.target.style.backgroundColor = '#F5F7FA';
                e.target.style.borderColor = '#2B4C6F';
              }
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.borderColor = '#DDE3EB';
            }}
          >
            ← Previous
          </button>
          <span style={{ fontSize: '13px', color: '#7A8BA0' }}>
            {currentSectionIndex + 1} of {template.sections.length}
          </span>
          <button
            onClick={() => goToSection(currentSectionIndex + 1)}
            disabled={currentSectionIndex === template.sections.length - 1}
            style={{
              padding: '10px 16px',
              borderRadius: '6px',
              border: '1px solid #DDE3EB',
              backgroundColor: currentSectionIndex === template.sections.length - 1 ? 'white' : 'white',
              color: currentSectionIndex === template.sections.length - 1 ? '#DDE3EB' : '#1A2A3F',
              cursor: currentSectionIndex === template.sections.length - 1 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontFamily: 'system-ui',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              if (currentSectionIndex < template.sections.length - 1) {
                e.target.style.backgroundColor = '#F5F7FA';
                e.target.style.borderColor = '#2B4C6F';
              }
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.borderColor = '#DDE3EB';
            }}
          >
            Next →
          </button>
        </div>
      </div>
    );
  }

  // Tab view
  return (
    <div style={{ backgroundColor: '#F5F7FA', minHeight: '100vh', padding: '32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '32px',
          fontFamily: "'Instrument Serif', Georgia, serif",
          color: '#1A2A3F',
          margin: '0 0 8px 0',
        }}>
          Deliverable Workshop
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#7A8BA0',
          margin: '0 0 32px 0',
        }}>
          Build governance documents between meetings with guided templates.
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', borderBottom: '2px solid #DDE3EB' }}>
          <button
            onClick={() => setActiveTab('myDeliverables')}
            style={{
              padding: '12px 0',
              border: 'none',
              backgroundColor: 'transparent',
              color: activeTab === 'myDeliverables' ? '#2B4C6F' : '#7A8BA0',
              fontSize: '16px',
              fontFamily: 'system-ui',
              fontWeight: activeTab === 'myDeliverables' ? 600 : 400,
              cursor: 'pointer',
              borderBottom: activeTab === 'myDeliverables' ? '3px solid #2B4C6F' : 'none',
              marginBottom: '-2px',
              transition: 'all 0.2s',
            }}
          >
            My Deliverables
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            style={{
              padding: '12px 0',
              border: 'none',
              backgroundColor: 'transparent',
              color: activeTab === 'templates' ? '#2B4C6F' : '#7A8BA0',
              fontSize: '16px',
              fontFamily: 'system-ui',
              fontWeight: activeTab === 'templates' ? 600 : 400,
              cursor: 'pointer',
              borderBottom: activeTab === 'templates' ? '3px solid #2B4C6F' : 'none',
              marginBottom: '-2px',
              transition: 'all 0.2s',
            }}
          >
            Templates
          </button>
        </div>

        {/* My Deliverables Tab */}
        {activeTab === 'myDeliverables' && (
          <div>
            {deliverables.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '64px 32px',
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #DDE3EB',
              }}>
                <p style={{ fontSize: '16px', color: '#7A8BA0', margin: '0 0 16px 0' }}>
                  No deliverables yet. Start with a template to begin building governance documents.
                </p>
                <button
                  onClick={() => setActiveTab('templates')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#2B4C6F',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: 'system-ui',
                    fontWeight: 500,
                    transition: 'background-color 0.2s',
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#1A2A3F'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#2B4C6F'}
                >
                  View Templates
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '20px',
              }}>
                {deliverables.map((del) => {
                  const progress = getProgressPercentage(del);
                  return (
                    <div
                      key={del.id}
                      onClick={() => {
                        setSelectedDeliverable(del);
                        setCurrentSectionIndex(0);
                      }}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        border: '1px solid #DDE3EB',
                        padding: '20px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <h3 style={{
                          fontSize: '16px',
                          fontFamily: "'Instrument Serif', Georgia, serif",
                          color: '#1A2A3F',
                          margin: 0,
                          flex: 1,
                        }}>
                          {del.title}
                        </h3>
                        <div style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: getStatusColor(del.status) + '15',
                          color: getStatusColor(del.status),
                          fontSize: '11px',
                          fontWeight: 600,
                          fontFamily: 'system-ui',
                          whiteSpace: 'nowrap',
                        }}>
                          {del.status}
                        </div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '6px',
                        }}>
                          <span style={{ fontSize: '12px', color: '#7A8BA0', fontFamily: 'system-ui' }}>
                            Progress
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#1A2A3F', fontFamily: 'system-ui' }}>
                            {progress}%
                          </span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '6px',
                          backgroundColor: '#DDE3EB',
                          borderRadius: '3px',
                          overflow: 'hidden',
                        }}>
                          <div
                            style={{
                              height: '100%',
                              backgroundColor: '#2B4C6F',
                              width: `${progress}%`,
                              transition: 'width 0.3s',
                            }}
                          />
                        </div>
                      </div>

                      <p style={{
                        fontSize: '12px',
                        color: '#7A8BA0',
                        margin: 0,
                        fontFamily: 'system-ui',
                      }}>
                        Last edited {formatDate(del.updatedAt)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}>
            {Object.values(TEMPLATES).map((template) => (
              <div
                key={template.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid #DDE3EB',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>
                  {template.icon}
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  color: '#1A2A3F',
                  margin: '0 0 8px 0',
                }}>
                  {template.title}
                </h3>
                <p style={{
                  fontSize: '13px',
                  color: '#7A8BA0',
                  margin: '0 0 16px 0',
                  lineHeight: '1.5',
                  flex: 1,
                  fontFamily: 'system-ui',
                }}>
                  {template.description}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#2B4C6F',
                  margin: '0 0 16px 0',
                  fontFamily: 'system-ui',
                  fontWeight: 500,
                }}>
                  {template.sections.length} sections
                </p>
                <button
                  onClick={() => startNewDeliverable(template.id)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#2B4C6F',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: 'system-ui',
                    fontWeight: 500,
                    transition: 'background-color 0.2s',
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#1A2A3F'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#2B4C6F'}
                >
                  Start
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliverableWorkshop;
