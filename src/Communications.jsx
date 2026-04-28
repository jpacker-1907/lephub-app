import React, { useState, useEffect } from 'react';

const Communications = () => {
  const [view, setView] = useState('gallery'); // gallery or compose
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [sentEmails, setSentEmails] = useState([]);
  const [currentDraft, setCurrentDraft] = useState(null);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [toast, setToast] = useState(null);

  // Load data from localStorage
  useEffect(() => {
    const savedDrafts = localStorage.getItem('lep_email_drafts');
    const savedSent = localStorage.getItem('lep_email_sent');
    if (savedDrafts) setDrafts(JSON.parse(savedDrafts));
    if (savedSent) setSentEmails(JSON.parse(savedSent));
  }, []);

  // Save drafts to localStorage
  useEffect(() => {
    localStorage.setItem('lep_email_drafts', JSON.stringify(drafts));
  }, [drafts]);

  useEffect(() => {
    localStorage.setItem('lep_email_sent', JSON.stringify(sentEmails));
  }, [sentEmails]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const createNewEmail = (category) => {
    const newDraft = initializeDraft(category);
    setSelectedCategory(category);
    setCurrentDraft(newDraft);
    setView('compose');
  };

  const initializeDraft = (category) => {
    const baseFields = {
      senderName: 'Jason Packer',
      subject: '',
      recipientGroup: 'All Members',
      customEmails: '',
    };

    switch (category) {
      case 'invitation':
        return {
          id: Date.now(),
          category,
          fields: {
            ...baseFields,
            recipientName: '',
            recipientEmail: '',
            personalMessage: '',
            strideDescription: 'Stride FBA is an exclusive membership for next-generation family office advisors and emerging leaders.',
            benefits: 'Access to curated educational content, networking events, and strategic business insights.',
          },
        };
      case 'newsletter':
        return {
          id: Date.now(),
          category,
          fields: {
            ...baseFields,
            subject: 'Stride FBA Monthly Update',
            headerMessage: '',
            showUpcoming: true,
            upcomingEvents: '',
            showSpotlight: true,
            spotlightName: '',
            spotlightQuote: '',
            showContent: true,
            contentTitle: '',
            contentDescription: '',
            showCommunity: true,
            communityUpdate: '',
          },
        };
      case 'followup':
        return {
          id: Date.now(),
          category,
          fields: {
            ...baseFields,
            meetingName: '',
            meetingDate: '',
            summary: '',
            actionItems: '',
            homework: '',
            contentReview: '',
            nextMeetingDate: '',
          },
        };
      case 'event':
        return {
          id: Date.now(),
          category,
          fields: {
            ...baseFields,
            eventName: '',
            eventDate: '',
            eventTime: '',
            eventLocation: '',
            description: '',
            speakerInfo: '',
            registrationLink: '',
          },
        };
      default:
        return null;
    }
  };

  const updateField = (field, value) => {
    setCurrentDraft({
      ...currentDraft,
      fields: {
        ...currentDraft.fields,
        [field]: value,
      },
    });
  };

  const getRecipientCount = () => {
    if (currentDraft.fields.recipientGroup === 'Custom') {
      return currentDraft.fields.customEmails.split(',').filter((e) => e.trim()).length;
    }
    return currentDraft.fields.recipientGroup === 'All Members' ? 150 : 75;
  };

  const saveDraft = () => {
    const updated = drafts.filter((d) => d.id !== currentDraft.id);
    updated.push({ ...currentDraft, updatedAt: new Date().toISOString() });
    setDrafts(updated);
    showToast('Draft saved');
  };

  const sendEmail = () => {
    const sent = {
      id: Date.now(),
      category: currentDraft.category,
      subject: currentDraft.fields.subject,
      recipientGroup: currentDraft.fields.recipientGroup,
      recipientCount: getRecipientCount(),
      sentAt: new Date().toISOString(),
    };
    setSentEmails([sent, ...sentEmails]);
    setDrafts(drafts.filter((d) => d.id !== currentDraft.id));
    setShowSendConfirm(false);
    setView('gallery');
    setCurrentDraft(null);
    showToast('Email queued for delivery');
  };

  const renderEmailPreview = () => {
    const styles = {
      container: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(26, 42, 63, 0.1)',
        border: '1px solid #DDE3EB',
        overflow: 'hidden',
      },
      header: {
        backgroundColor: '#1A2A3F',
        padding: '40px',
        textAlign: 'center',
        color: '#fff',
      },
      logo: {
        fontSize: '32px',
        fontWeight: 'bold',
        fontFamily: "'Instrument Serif', Georgia, serif",
        marginBottom: '20px',
      },
      content: {
        padding: '40px',
        fontFamily: 'system-ui',
        fontSize: '15px',
        lineHeight: '1.6',
        color: '#2B3E50',
      },
      button: {
        backgroundColor: '#E05B6F',
        color: '#fff',
        padding: '12px 32px',
        borderRadius: '8px',
        textDecoration: 'none',
        display: 'inline-block',
        marginTop: '20px',
        fontWeight: '600',
        border: 'none',
        cursor: 'pointer',
      },
      footer: {
        backgroundColor: '#F5F7FA',
        padding: '20px 40px',
        fontSize: '12px',
        color: '#7A8BA0',
        borderTop: '1px solid #DDE3EB',
      },
      section: {
        marginBottom: '30px',
      },
      sectionTitle: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1A2A3F',
        marginBottom: '12px',
        fontFamily: "'Instrument Serif', Georgia, serif",
      },
    };

    const f = currentDraft.fields;

    switch (currentDraft.category) {
      case 'invitation':
        return (
          <div style={styles.container}>
            <div style={styles.header}>
              <div style={styles.logo}>STRIDE</div>
              <p>Join Our Exclusive Community</p>
            </div>
            <div style={styles.content}>
              <p>Dear {f.recipientName || '[Recipient Name]'},</p>
              <div style={styles.section}>
                <p>{f.personalMessage || '[Your personal message here]'}</p>
              </div>
              <div style={styles.section}>
                <div style={styles.sectionTitle}>What is Stride?</div>
                <p>{f.strideDescription}</p>
              </div>
              <div style={styles.section}>
                <div style={styles.sectionTitle}>Member Benefits</div>
                <p>{f.benefits}</p>
              </div>
              <button style={styles.button}>Join Stride</button>
              <div style={styles.section}>
                <p>Best regards,<br /><strong>{f.senderName}</strong></p>
              </div>
            </div>
            <div style={styles.footer}>
              <p>You received this email because you've been invited to join Stride FBA. <a href="#" style={{ color: '#E05B6F', textDecoration: 'none' }}>Unsubscribe</a></p>
            </div>
          </div>
        );

      case 'newsletter':
        return (
          <div style={styles.container}>
            <div style={styles.header}>
              <div style={styles.logo}>STRIDE</div>
              <p>{f.subject || 'Monthly Update'}</p>
            </div>
            <div style={styles.content}>
              {f.showUpcoming && (
                <div style={styles.section}>
                  <div style={styles.sectionTitle}>Upcoming Events</div>
                  <p>{f.upcomingEvents || '[Events will appear here]'}</p>
                </div>
              )}
              {f.showSpotlight && (
                <div style={styles.section}>
                  <div style={styles.sectionTitle}>Member Spotlight</div>
                  <div style={{ backgroundColor: '#F5F7FA', padding: '16px', borderRadius: '8px', marginBottom: '12px' }}>
                    <img src="https://via.placeholder.com/80" alt="Member" style={{ borderRadius: '50%', width: '80px', height: '80px', marginBottom: '12px' }} />
                  </div>
                  <p><strong>{f.spotlightName || '[Member Name]'}</strong></p>
                  <p style={{ fontStyle: 'italic' }}>"{f.spotlightQuote || '[Member quote]'}"</p>
                </div>
              )}
              {f.showContent && (
                <div style={styles.section}>
                  <div style={styles.sectionTitle}>{f.contentTitle || 'Content Highlight'}</div>
                  <p>{f.contentDescription || '[Featured article or video]'}</p>
                </div>
              )}
              {f.showCommunity && (
                <div style={styles.section}>
                  <div style={styles.sectionTitle}>Community Update</div>
                  <p>{f.communityUpdate || '[Community news here]'}</p>
                </div>
              )}
              <button style={styles.button}>Learn More</button>
              <div style={styles.section}>
                <p>Best regards,<br /><strong>{f.senderName}</strong></p>
              </div>
            </div>
            <div style={styles.footer}>
              <p>You're receiving this as a valued Stride member. <a href="#" style={{ color: '#E05B6F', textDecoration: 'none' }}>Unsubscribe</a></p>
            </div>
          </div>
        );

      case 'followup':
        return (
          <div style={styles.container}>
            <div style={styles.header}>
              <div style={styles.logo}>STRIDE</div>
              <p>Meeting Follow-up</p>
            </div>
            <div style={styles.content}>
              <p>Dear Team,</p>
              <div style={styles.section}>
                <div style={styles.sectionTitle}>{f.meetingName || '[Meeting Name]'}</div>
                <p><strong>Date:</strong> {f.meetingDate || '[Meeting Date]'}</p>
              </div>
              <div style={styles.section}>
                <div style={styles.sectionTitle}>Summary</div>
                <p>{f.summary || '[Meeting summary]'}</p>
              </div>
              {f.actionItems && (
                <div style={styles.section}>
                  <div style={styles.sectionTitle}>Action Items</div>
                  <p>{f.actionItems}</p>
                </div>
              )}
              {f.homework && (
                <div style={styles.section}>
                  <div style={styles.sectionTitle}>Homework</div>
                  <p>{f.homework}</p>
                </div>
              )}
              {f.contentReview && (
                <div style={styles.section}>
                  <div style={styles.sectionTitle}>Content to Review</div>
                  <p>{f.contentReview}</p>
                </div>
              )}
              {f.nextMeetingDate && (
                <div style={styles.section}>
                  <p><strong>Next Meeting:</strong> {f.nextMeetingDate}</p>
                </div>
              )}
              <div style={styles.section}>
                <p>Best regards,<br /><strong>{f.senderName}</strong></p>
              </div>
            </div>
            <div style={styles.footer}>
              <p>This is a meeting follow-up. <a href="#" style={{ color: '#E05B6F', textDecoration: 'none' }}>Unsubscribe</a></p>
            </div>
          </div>
        );

      case 'event':
        return (
          <div style={styles.container}>
            <div style={styles.header}>
              <div style={styles.logo}>STRIDE</div>
              <p>Event Announcement</p>
            </div>
            <div style={styles.content}>
              <div style={styles.section}>
                <div style={styles.sectionTitle}>{f.eventName || '[Event Name]'}</div>
                <p><strong>Date:</strong> {f.eventDate || '[Date]'}<br />
                <strong>Time:</strong> {f.eventTime || '[Time]'}<br />
                <strong>Location:</strong> {f.eventLocation || '[Location]'}</p>
              </div>
              <div style={styles.section}>
                <div style={styles.sectionTitle}>About This Event</div>
                <p>{f.description || '[Event description]'}</p>
              </div>
              {f.speakerInfo && (
                <div style={styles.section}>
                  <div style={styles.sectionTitle}>Speakers & Panelists</div>
                  <p>{f.speakerInfo}</p>
                </div>
              )}
              <button style={styles.button}>Register Now</button>
              <div style={styles.section}>
                <p>Best regards,<br /><strong>{f.senderName}</strong></p>
              </div>
            </div>
            <div style={styles.footer}>
              <p>You received this because you're a valued Stride member. <a href="#" style={{ color: '#E05B6F', textDecoration: 'none' }}>Unsubscribe</a></p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderComposeForm = () => {
    const styles = {
      formGroup: {
        marginBottom: '24px',
      },
      label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '600',
        color: '#1A2A3F',
        marginBottom: '8px',
        fontFamily: "'Instrument Serif', Georgia, serif",
      },
      input: {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #DDE3EB',
        borderRadius: '8px',
        fontFamily: 'system-ui',
        fontSize: '14px',
        color: '#2B3E50',
        boxSizing: 'border-box',
      },
      textarea: {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #DDE3EB',
        borderRadius: '8px',
        fontFamily: 'system-ui',
        fontSize: '14px',
        color: '#2B3E50',
        minHeight: '80px',
        boxSizing: 'border-box',
        resize: 'vertical',
      },
      select: {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #DDE3EB',
        borderRadius: '8px',
        fontFamily: 'system-ui',
        fontSize: '14px',
        color: '#2B3E50',
        boxSizing: 'border-box',
      },
      checkbox: {
        marginRight: '8px',
      },
    };

    const f = currentDraft.fields;

    return (
      <div>
        {/* Common fields */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Subject Line</label>
          <input
            type="text"
            style={styles.input}
            value={f.subject}
            onChange={(e) => updateField('subject', e.target.value)}
            placeholder="Email subject"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Sender Name</label>
          <input
            type="text"
            style={styles.input}
            value={f.senderName}
            onChange={(e) => updateField('senderName', e.target.value)}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Recipient Group</label>
          <select
            style={styles.select}
            value={f.recipientGroup}
            onChange={(e) => updateField('recipientGroup', e.target.value)}
          >
            <option>All Members</option>
            <option>Senior Gen Group</option>
            <option>Next Gen Group</option>
            <option>Custom</option>
          </select>
        </div>

        {f.recipientGroup === 'Custom' && (
          <div style={styles.formGroup}>
            <label style={styles.label}>Custom Emails (comma-separated)</label>
            <textarea
              style={styles.textarea}
              value={f.customEmails}
              onChange={(e) => updateField('customEmails', e.target.value)}
              placeholder="email1@example.com, email2@example.com"
            />
          </div>
        )}

        {/* Category-specific fields */}
        {currentDraft.category === 'invitation' && (
          <>
            <div style={styles.formGroup}>
              <label style={styles.label}>Recipient Name</label>
              <input
                type="text"
                style={styles.input}
                value={f.recipientName}
                onChange={(e) => updateField('recipientName', e.target.value)}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Recipient Email</label>
              <input
                type="email"
                style={styles.input}
                value={f.recipientEmail}
                onChange={(e) => updateField('recipientEmail', e.target.value)}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Personal Message</label>
              <textarea
                style={styles.textarea}
                value={f.personalMessage}
                onChange={(e) => updateField('personalMessage', e.target.value)}
                placeholder="Write a personal note here..."
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Stride Description</label>
              <textarea
                style={styles.textarea}
                value={f.strideDescription}
                onChange={(e) => updateField('strideDescription', e.target.value)}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Member Benefits</label>
              <textarea
                style={styles.textarea}
                value={f.benefits}
                onChange={(e) => updateField('benefits', e.target.value)}
              />
            </div>
          </>
        )}

        {currentDraft.category === 'newsletter' && (
          <>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  style={styles.checkbox}
                  checked={f.showUpcoming}
                  onChange={(e) => updateField('showUpcoming', e.target.checked)}
                />
                Show Upcoming Events
              </label>
              {f.showUpcoming && (
                <textarea
                  style={{ ...styles.textarea, marginTop: '8px' }}
                  value={f.upcomingEvents}
                  onChange={(e) => updateField('upcomingEvents', e.target.value)}
                  placeholder="List upcoming events..."
                />
              )}
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  style={styles.checkbox}
                  checked={f.showSpotlight}
                  onChange={(e) => updateField('showSpotlight', e.target.checked)}
                />
                Show Member Spotlight
              </label>
              {f.showSpotlight && (
                <>
                  <input
                    type="text"
                    style={{ ...styles.input, marginTop: '8px' }}
                    value={f.spotlightName}
                    onChange={(e) => updateField('spotlightName', e.target.value)}
                    placeholder="Member name"
                  />
                  <textarea
                    style={{ ...styles.textarea, marginTop: '8px' }}
                    value={f.spotlightQuote}
                    onChange={(e) => updateField('spotlightQuote', e.target.value)}
                    placeholder="Member quote"
                  />
                </>
              )}
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  style={styles.checkbox}
                  checked={f.showContent}
                  onChange={(e) => updateField('showContent', e.target.checked)}
                />
                Show Content Highlight
              </label>
              {f.showContent && (
                <>
                  <input
                    type="text"
                    style={{ ...styles.input, marginTop: '8px' }}
                    value={f.contentTitle}
                    onChange={(e) => updateField('contentTitle', e.target.value)}
                    placeholder="Content title"
                  />
                  <textarea
                    style={{ ...styles.textarea, marginTop: '8px' }}
                    value={f.contentDescription}
                    onChange={(e) => updateField('contentDescription', e.target.value)}
                    placeholder="Content description"
                  />
                </>
              )}
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  style={styles.checkbox}
                  checked={f.showCommunity}
                  onChange={(e) => updateField('showCommunity', e.target.checked)}
                />
                Show Community Update
              </label>
              {f.showCommunity && (
                <textarea
                  style={{ ...styles.textarea, marginTop: '8px' }}
                  value={f.communityUpdate}
                  onChange={(e) => updateField('communityUpdate', e.target.value)}
                  placeholder="Community news..."
                />
              )}
            </div>
          </>
        )}

        {currentDraft.category === 'followup' && (
          <>
            <div style={styles.formGroup}>
              <label style={styles.label}>Meeting Name</label>
              <input
                type="text"
                style={styles.input}
                value={f.meetingName}
                onChange={(e) => updateField('meetingName', e.target.value)}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Meeting Date</label>
              <input
                type="date"
                style={styles.input}
                value={f.meetingDate}
                onChange={(e) => updateField('meetingDate', e.target.value)}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Summary</label>
              <textarea
                style={styles.textarea}
                value={f.summary}
                onChange={(e) => updateField('summary', e.target.value)}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Action Items</label>
              <textarea
                style={styles.textarea}
                value={f.actionItems}
                onChange={(e) => updateField('actionItems', e.target.value)}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Homework Assignments</label>
              <textarea
                style={styles.textarea}
                value={f.homework}
                onChange={(e) => updateField('homework', e.target.value)}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Content to Review</label>
              <textarea
                style={styles.textarea}
                value={f.contentReview}
                onChange={(e) => updateField('contentReview', e.target.value)}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Next Meeting Date</label>
              <input
                type="date"
                style={styles.input}
                value={f.nextMeetingDate}
                onChange={(e) => updateField('nextMeetingDate', e.target.value)}
              />
            </div>
          </>
        )}

        {currentDraft.category === 'event' && (
          <>
            <div style={styles.formGroup}>
              <label style={styles.label}>Event Name</label>
              <input
                type="text"
                style={styles.input}
                value={f.eventName}
                onChange={(e) => updateField('eventName', e.target.value)}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Event Date</label>
              <input
                type="date"
                style={styles.input}
                value={f.eventDate}
                onChange={(e) => updateField('eventDate', e.target.value)}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Event Time</label>
              <input
                type="time"
                style={styles.input}
                value={f.eventTime}
                onChange={(e) => updateField('eventTime', e.target.value)}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Event Location</label>
              <input
                type="text"
                style={styles.input}
                value={f.eventLocation}
                onChange={(e) => updateField('eventLocation', e.target.value)}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                style={styles.textarea}
                value={f.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Speakers & Panelists</label>
              <textarea
                style={styles.textarea}
                value={f.speakerInfo}
                onChange={(e) => updateField('speakerInfo', e.target.value)}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Registration Link</label>
              <input
                type="url"
                style={styles.input}
                value={f.registrationLink}
                onChange={(e) => updateField('registrationLink', e.target.value)}
              />
            </div>
          </>
        )}
      </div>
    );
  };

  if (view === 'gallery') {
    const styles = {
      container: {
        padding: '40px',
        maxWidth: '1400px',
        margin: '0 auto',
        fontFamily: 'system-ui',
        backgroundColor: '#F5F7FA',
        minHeight: '100vh',
      },
      title: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#1A2A3F',
        marginBottom: '12px',
        fontFamily: "'Instrument Serif', Georgia, serif",
      },
      subtitle: {
        fontSize: '15px',
        color: '#7A8BA0',
        marginBottom: '40px',
      },
      gallery: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '60px',
      },
      card: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(26, 42, 63, 0.1)',
        border: '1px solid #DDE3EB',
        padding: '32px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      },
      cardHover: {
        transform: 'translateY(-4px)',
        boxShadow: '0 4px 16px rgba(26, 42, 63, 0.15)',
      },
      icon: {
        fontSize: '48px',
        marginBottom: '16px',
      },
      cardTitle: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1A2A3F',
        marginBottom: '12px',
        fontFamily: "'Instrument Serif', Georgia, serif",
      },
      cardDescription: {
        fontSize: '14px',
        color: '#7A8BA0',
        marginBottom: '24px',
        lineHeight: '1.5',
      },
      button: {
        backgroundColor: '#E05B6F',
        color: '#fff',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
      },
      historySection: {
        marginTop: '60px',
      },
      historyTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#1A2A3F',
        marginBottom: '20px',
        fontFamily: "'Instrument Serif', Georgia, serif",
      },
      historyTable: {
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(26, 42, 63, 0.1)',
      },
      th: {
        padding: '16px',
        textAlign: 'left',
        backgroundColor: '#F5F7FA',
        borderBottom: '1px solid #DDE3EB',
        fontSize: '14px',
        fontWeight: '600',
        color: '#1A2A3F',
      },
      td: {
        padding: '16px',
        borderBottom: '1px solid #DDE3EB',
        fontSize: '14px',
        color: '#2B3E50',
      },
      emptyState: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        color: '#7A8BA0',
      },
    };

    const categories = [
      { id: 'invitation', title: 'Member Invitations', icon: '✉️', description: 'Invite prospects to join Stride FBA with a personalized message.' },
      { id: 'newsletter', title: 'Newsletters', icon: '📰', description: 'Send monthly updates with events, spotlights, and community news.' },
      { id: 'followup', title: 'Meeting Follow-ups', icon: '📝', description: 'Share post-meeting summaries, action items, and homework.' },
      { id: 'event', title: 'Event Announcements', icon: '🎉', description: 'Promote upcoming events with speaker info and registration links.' },
    ];

    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Communications</h1>
        <p style={styles.subtitle}>Create and send branded emails for Stride FBA</p>

        <div style={styles.gallery}>
          {categories.map((cat) => (
            <div key={cat.id} style={styles.card}>
              <div style={styles.icon}>{cat.icon}</div>
              <h2 style={styles.cardTitle}>{cat.title}</h2>
              <p style={styles.cardDescription}>{cat.description}</p>
              <button style={styles.button} onClick={() => createNewEmail(cat.id)}>
                Create Email
              </button>
            </div>
          ))}
        </div>

        {sentEmails.length > 0 && (
          <div style={styles.historySection}>
            <h2 style={styles.historyTitle}>Sent History</h2>
            <table style={styles.historyTable}>
              <thead>
                <tr>
                  <th style={styles.th}>Date Sent</th>
                  <th style={styles.th}>Subject</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Recipients</th>
                </tr>
              </thead>
              <tbody>
                {sentEmails.map((email) => (
                  <tr key={email.id}>
                    <td style={styles.td}>{new Date(email.sentAt).toLocaleDateString()}</td>
                    <td style={styles.td}>{email.subject}</td>
                    <td style={styles.td}>{email.category}</td>
                    <td style={styles.td}>{email.recipientCount} recipients</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // Compose view
  if (view === 'compose') {
    const styles = {
      container: {
        display: 'flex',
        height: '100vh',
        backgroundColor: '#F5F7FA',
      },
      leftPanel: {
        width: '40%',
        padding: '40px',
        overflowY: 'auto',
        backgroundColor: '#fff',
        borderRight: '1px solid #DDE3EB',
      },
      rightPanel: {
        width: '60%',
        padding: '40px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      },
      header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        borderBottom: '1px solid #DDE3EB',
        paddingBottom: '16px',
      },
      title: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#1A2A3F',
        fontFamily: "'Instrument Serif', Georgia, serif",
      },
      backButton: {
        backgroundColor: 'transparent',
        border: '1px solid #DDE3EB',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        color: '#2B3E50',
      },
      previewContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      },
      previewLabel: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#7A8BA0',
        textTransform: 'uppercase',
        marginBottom: '12px',
      },
      previewScroll: {
        flex: 1,
        overflowY: 'auto',
        borderRadius: '12px',
      },
      bottomBar: {
        display: 'flex',
        gap: '12px',
        marginTop: '24px',
        borderTop: '1px solid #DDE3EB',
        paddingTop: '24px',
      },
      saveButton: {
        backgroundColor: '#2B4C6F',
        color: '#fff',
        border: 'none',
        padding: '12px 32px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
      },
      sendButton: {
        backgroundColor: '#E05B6F',
        color: '#fff',
        border: 'none',
        padding: '12px 32px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        flex: 1,
      },
      modal: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(26, 42, 63, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      },
      modalContent: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '400px',
        textAlign: 'center',
      },
      modalTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#1A2A3F',
        marginBottom: '16px',
        fontFamily: "'Instrument Serif', Georgia, serif",
      },
      modalText: {
        fontSize: '15px',
        color: '#7A8BA0',
        marginBottom: '32px',
      },
      modalButtons: {
        display: 'flex',
        gap: '12px',
      },
      cancelButton: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        border: '1px solid #DDE3EB',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
      },
      confirmButton: {
        flex: 1,
        backgroundColor: '#E05B6F',
        color: '#fff',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
      },
      toast: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#1A2A3F',
        color: '#fff',
        padding: '12px 20px',
        borderRadius: '8px',
        fontSize: '14px',
        zIndex: 1001,
      },
    };

    return (
      <div style={styles.container}>
        <div style={styles.leftPanel}>
          <div style={styles.header}>
            <h2 style={styles.title}>Compose Email</h2>
            <button style={styles.backButton} onClick={() => setView('gallery')}>
              Back
            </button>
          </div>
          {renderComposeForm()}
        </div>

        <div style={styles.rightPanel}>
          <p style={styles.previewLabel}>Email Preview</p>
          <div style={styles.previewScroll}>{renderEmailPreview()}</div>
          <div style={styles.bottomBar}>
            <button style={styles.saveButton} onClick={saveDraft}>
              Save Draft
            </button>
            <button style={styles.sendButton} onClick={() => setShowSendConfirm(true)}>
              Send Email ({getRecipientCount()} recipients)
            </button>
          </div>
        </div>

        {showSendConfirm && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h3 style={styles.modalTitle}>Confirm Send</h3>
              <p style={styles.modalText}>
                Send this email to {getRecipientCount()} recipient{getRecipientCount() !== 1 ? 's' : ''}?
              </p>
              <div style={styles.modalButtons}>
                <button style={styles.cancelButton} onClick={() => setShowSendConfirm(false)}>
                  Cancel
                </button>
                <button style={styles.confirmButton} onClick={sendEmail}>
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && <div style={styles.toast}>{toast}</div>}
      </div>
    );
  }

  return null;
};

export default Communications;
