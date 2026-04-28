import React, { useState, useEffect } from 'react';

const FacilitatorDashboard = ({ setCurrentView }) => {
  const [meetings, setMeetings] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [contentAssignments, setContentAssignments] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Color palette
  const colors = {
    navy: '#1A2A3F',
    teal: '#2B4C6F',
    accent: '#E05B6F',
    green: '#2D5A3D',
    lightBg: '#F5F7FA',
    border: '#DDE3EB',
    muted: '#7A8BA0',
    white: '#FFFFFF',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
  };

  // Load data from localStorage
  useEffect(() => {
    const savedMeetings = localStorage.getItem('lep_meetings');
    const savedDeliverables = localStorage.getItem('lep_workshop_deliverables');
    const savedAssignments = localStorage.getItem('lep_content_assignments');

    if (savedMeetings) {
      try {
        setMeetings(JSON.parse(savedMeetings));
      } catch (e) {
        console.error('Failed to load meetings', e);
      }
    }
    if (savedDeliverables) {
      try {
        setDeliverables(JSON.parse(savedDeliverables));
      } catch (e) {
        console.error('Failed to load deliverables', e);
      }
    }
    if (savedAssignments) {
      try {
        setContentAssignments(JSON.parse(savedAssignments));
      } catch (e) {
        console.error('Failed to load content assignments', e);
      }
    }

    // Update current time
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Helper: Get greeting based on time of day
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Helper: Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Helper: Get upcoming meetings (next 7 days)
  const getUpcomingMeetings = () => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return meetings
      .filter((m) => new Date(m.date) >= now && new Date(m.date) <= nextWeek)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  };

  // Helper: Get action items and group by status
  const getActionItems = () => {
    const now = new Date();
    const allItems = [];

    meetings.forEach((meeting) => {
      if (meeting.actionItems && Array.isArray(meeting.actionItems)) {
        meeting.actionItems.forEach((item) => {
          allItems.push({
            ...item,
            meetingId: meeting.id,
            meetingTitle: meeting.title,
          });
        });
      }
    });

    const grouped = {
      overdue: [],
      thisWeek: [],
      upcoming: [],
    };

    allItems.forEach((item) => {
      const dueDate = new Date(item.dueDate);
      const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

      if (daysUntilDue < 0) {
        grouped.overdue.push(item);
      } else if (daysUntilDue <= 7) {
        grouped.thisWeek.push(item);
      } else {
        grouped.upcoming.push(item);
      }
    });

    return grouped;
  };

  // Helper: Get family progress with traffic light
  const getFamilyProgress = () => {
    return deliverables.map((fam) => {
      const deliv = fam.deliverables || [];
      const inProgress = deliv.filter((d) => d.status === 'in-progress').length;
      const lastActivity = fam.lastActivity ? new Date(fam.lastActivity) : null;
      const now = new Date();
      let trafficLight = 'green';

      if (lastActivity) {
        const daysSinceActivity = Math.floor(
          (now - lastActivity) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceActivity > 21) {
          trafficLight = 'red';
        } else if (daysSinceActivity > 7) {
          trafficLight = 'yellow';
        }
      } else {
        trafficLight = 'red';
      }

      return {
        ...fam,
        inProgressCount: inProgress,
        trafficLight,
        lastActivityDate: lastActivity
          ? lastActivity.toLocaleDateString()
          : 'No activity',
      };
    });
  };

  // Helper: Content engagement stats
  const getContentStats = () => {
    const completed = contentAssignments.filter(
      (a) => a.status === 'completed'
    ).length;
    const total = contentAssignments.length;
    return { completed, total };
  };

  // Helper: Quick stats
  const getTotalMembers = () => {
    const uniqueAttendees = new Set();
    meetings.forEach((m) => {
      if (m.attendees && Array.isArray(m.attendees)) {
        m.attendees.forEach((a) => {
          if (a && a.id) uniqueAttendees.add(a.id);
        });
      }
    });
    return uniqueAttendees.size;
  };

  const getMetricsThisMonth = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return meetings.filter(
      (m) => new Date(m.date) >= monthStart && new Date(m.date) <= now
    ).length;
  };

  const getOverdueCount = () => {
    return getActionItems().overdue.length;
  };

  // Styles
  const containerStyle = {
    backgroundColor: colors.lightBg,
    minHeight: '100vh',
    padding: '40px 20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  const contentStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
  };

  const bannerStyle = {
    backgroundColor: colors.white,
    borderRadius: '12px',
    padding: '40px',
    marginBottom: '40px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: `1px solid ${colors.border}`,
  };

  const bannerTitleStyle = {
    fontSize: '32px',
    fontWeight: '600',
    color: colors.navy,
    marginBottom: '8px',
    fontFamily: "'Instrument Serif', Georgia, serif",
  };

  const bannerDateStyle = {
    fontSize: '14px',
    color: colors.muted,
    marginBottom: '28px',
  };

  const statsRowStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  };

  const statCardStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  };

  const statIconStyle = {
    width: '60px',
    height: '60px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    color: colors.white,
  };

  const statNumberStyle = {
    fontSize: '24px',
    fontWeight: '700',
    color: colors.navy,
  };

  const statLabelStyle = {
    fontSize: '13px',
    color: colors.muted,
    marginTop: '4px',
  };

  const sectionStyle = {
    marginBottom: '40px',
  };

  const sectionTitleStyle = {
    fontSize: '18px',
    fontWeight: '700',
    color: colors.navy,
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const cardStyle = {
    backgroundColor: colors.white,
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: `1px solid ${colors.border}`,
    marginBottom: '12px',
  };

  const meetingCardStyle = {
    ...cardStyle,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const meetingBadgeStyle = {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '6px',
    marginRight: '12px',
    backgroundColor: colors.teal,
    color: colors.white,
  };

  const meetingInfoStyle = {
    flex: 1,
  };

  const meetingTimeStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: colors.navy,
    marginBottom: '4px',
  };

  const meetingDetailsStyle = {
    fontSize: '13px',
    color: colors.muted,
  };

  const buttonStyle = {
    backgroundColor: colors.teal,
    color: colors.white,
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  };

  const linkStyle = {
    color: colors.teal,
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
  };

  const actionItemStyle = (status) => ({
    ...cardStyle,
    borderLeft: `4px solid ${
      status === 'overdue'
        ? colors.danger
        : status === 'thisWeek'
          ? colors.warning
          : colors.muted
    }`,
    backgroundColor:
      status === 'overdue'
        ? '#FEF2F2'
        : status === 'thisWeek'
          ? '#FFFBEB'
          : colors.white,
  });

  const trafficLightStyle = (color) => ({
    display: 'inline-block',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor:
      color === 'green'
        ? colors.success
        : color === 'yellow'
          ? colors.warning
          : colors.danger,
    marginRight: '8px',
  });

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '12px',
  };

  const actionButtonStyle = {
    ...buttonStyle,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 16px',
    minHeight: '120px',
    backgroundColor: colors.navy,
    fontSize: '14px',
    fontWeight: '600',
  };

  // Get data
  const upcomingMeetings = getUpcomingMeetings();
  const actionItems = getActionItems();
  const familyProgress = getFamilyProgress();
  const contentStats = getContentStats();
  const totalMembers = getTotalMembers();
  const metricsThisMonth = getMetricsThisMonth();
  const overdueCount = getOverdueCount();

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        {/* Welcome Banner */}
        <div style={bannerStyle}>
          <div style={bannerTitleStyle}>
            {getGreeting()}, Jason
          </div>
          <div style={bannerDateStyle}>{formatDate(currentTime)}</div>

          {/* Quick Stats */}
          <div style={statsRowStyle}>
            <div style={statCardStyle}>
              <div
                style={{
                  ...statIconStyle,
                  backgroundColor: colors.teal,
                }}
              >
                👥
              </div>
              <div>
                <div style={statNumberStyle}>{totalMembers}</div>
                <div style={statLabelStyle}>Total Members</div>
              </div>
            </div>

            <div style={statCardStyle}>
              <div
                style={{
                  ...statIconStyle,
                  backgroundColor: colors.green,
                }}
              >
                📅
              </div>
              <div>
                <div style={statNumberStyle}>{metricsThisMonth}</div>
                <div style={statLabelStyle}>Meetings This Month</div>
              </div>
            </div>

            <div style={statCardStyle}>
              <div
                style={{
                  ...statIconStyle,
                  backgroundColor: colors.accent,
                }}
              >
                ✓
              </div>
              <div>
                <div style={statNumberStyle}>
                  {deliverables.reduce((acc, fam) => acc + (fam.deliverables ? fam.deliverables.filter((d) => d.status === 'in-progress').length : 0), 0)}
                </div>
                <div style={statLabelStyle}>Active Deliverables</div>
              </div>
            </div>

            <div style={statCardStyle}>
              <div
                style={{
                  ...statIconStyle,
                  backgroundColor: colors.danger,
                }}
              >
                ⚠️
              </div>
              <div>
                <div style={statNumberStyle}>{overdueCount}</div>
                <div style={statLabelStyle}>Overdue Items</div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>
            📅 Upcoming Meetings (Next 7 Days)
            {upcomingMeetings.length > 0 && (
              <span
                style={{
                  backgroundColor: colors.teal,
                  color: colors.white,
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginLeft: 'auto',
                }}
              >
                {upcomingMeetings.length}
              </span>
            )}
          </div>

          {upcomingMeetings.length > 0 ? (
            <>
              {upcomingMeetings.map((meeting, idx) => {
                const meetingDate = new Date(meeting.date);
                const isToday =
                  meetingDate.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={idx}
                    style={meetingCardStyle}
                    onClick={() => setCurrentView('meetings')}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        '0 4px 12px rgba(0,0,0,0.12)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow =
                        '0 1px 3px rgba(0,0,0,0.08)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={meetingInfoStyle}>
                      <span style={meetingBadgeStyle}>
                        {meeting.type || 'Meeting'}
                      </span>
                      <div style={meetingTimeStyle}>
                        {meetingDate.toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          meridiem: 'short',
                        })}
                      </div>
                      <div style={meetingDetailsStyle}>
                        {meeting.title} • {meeting.attendees?.length || 0} attendees
                      </div>
                    </div>
                    {isToday && (
                      <button
                        style={buttonStyle}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentView('meetings');
                        }}
                      >
                        Start Meeting
                      </button>
                    )}
                  </div>
                );
              })}
              <div style={{ marginTop: '12px' }}>
                <a
                  style={linkStyle}
                  onClick={() => setCurrentView('meetings')}
                >
                  View All Meetings →
                </a>
              </div>
            </>
          ) : (
            <div
              style={{
                ...cardStyle,
                textAlign: 'center',
                color: colors.muted,
                padding: '40px 20px',
              }}
            >
              No upcoming meetings scheduled for the next 7 days
            </div>
          )}
        </div>

        {/* Family Progress */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>
            👨‍👩‍👧‍👦 Family Progress
            {familyProgress.length > 0 && (
              <span
                style={{
                  backgroundColor: colors.teal,
                  color: colors.white,
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginLeft: 'auto',
                }}
              >
                {familyProgress.length}
              </span>
            )}
          </div>

          {familyProgress.length > 0 ? (
            familyProgress.map((family, idx) => (
              <div
                key={idx}
                style={{
                  ...cardStyle,
                  cursor: 'pointer',
                }}
                onClick={() => setCurrentView('workshop')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    '0 1px 3px rgba(0,0,0,0.08)';
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: colors.navy,
                        marginBottom: '8px',
                      }}
                    >
                      {family.familyName || 'Family'}
                    </div>
                    <div style={{ fontSize: '13px', color: colors.muted }}>
                      {family.inProgressCount} deliverables in progress •{' '}
                      {family.lastActivityDate}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={trafficLightStyle(family.trafficLight)}
                    ></div>
                    <span
                      style={{
                        fontSize: '12px',
                        color: colors.muted,
                        textTransform: 'capitalize',
                      }}
                    >
                      {family.trafficLight}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                ...cardStyle,
                textAlign: 'center',
                color: colors.muted,
                padding: '40px 20px',
              }}
            >
              No families with deliverables yet
            </div>
          )}
        </div>

        {/* Action Items & Overdue */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>
            ✓ Action Items & Overdue
            {(actionItems.overdue.length +
              actionItems.thisWeek.length +
              actionItems.upcoming.length) > 0 && (
              <span
                style={{
                  backgroundColor: colors.teal,
                  color: colors.white,
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginLeft: 'auto',
                }}
              >
                {actionItems.overdue.length +
                  actionItems.thisWeek.length +
                  actionItems.upcoming.length}
              </span>
            )}
          </div>

          {actionItems.overdue.length > 0 && (
            <>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: colors.danger,
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Overdue ({actionItems.overdue.length})
              </div>
              {actionItems.overdue.map((item, idx) => (
                <div
                  key={`overdue-${idx}`}
                  style={actionItemStyle('overdue')}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: colors.navy,
                          marginBottom: '6px',
                        }}
                      >
                        {item.description || item.task}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: colors.muted,
                        }}
                      >
                        Assigned to {item.assignedTo || 'Unassigned'} • Due{' '}
                        {new Date(item.dueDate).toLocaleDateString()} •{' '}
                        {item.meetingTitle}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {actionItems.thisWeek.length > 0 && (
            <>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: colors.warning,
                  marginBottom: '8px',
                  marginTop: actionItems.overdue.length > 0 ? '16px' : 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Due This Week ({actionItems.thisWeek.length})
              </div>
              {actionItems.thisWeek.map((item, idx) => (
                <div
                  key={`thisweek-${idx}`}
                  style={actionItemStyle('thisWeek')}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: colors.navy,
                          marginBottom: '6px',
                        }}
                      >
                        {item.description || item.task}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: colors.muted,
                        }}
                      >
                        Assigned to {item.assignedTo || 'Unassigned'} • Due{' '}
                        {new Date(item.dueDate).toLocaleDateString()} •{' '}
                        {item.meetingTitle}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {actionItems.upcoming.length > 0 && (
            <>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: colors.muted,
                  marginBottom: '8px',
                  marginTop:
                    actionItems.overdue.length > 0 ||
                    actionItems.thisWeek.length > 0
                      ? '16px'
                      : 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Upcoming ({actionItems.upcoming.length})
              </div>
              {actionItems.upcoming.slice(0, 3).map((item, idx) => (
                <div
                  key={`upcoming-${idx}`}
                  style={actionItemStyle('upcoming')}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: colors.navy,
                          marginBottom: '6px',
                        }}
                      >
                        {item.description || item.task}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: colors.muted,
                        }}
                      >
                        Assigned to {item.assignedTo || 'Unassigned'} • Due{' '}
                        {new Date(item.dueDate).toLocaleDateString()} •{' '}
                        {item.meetingTitle}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {actionItems.overdue.length === 0 &&
            actionItems.thisWeek.length === 0 &&
            actionItems.upcoming.length === 0 && (
              <div
                style={{
                  ...cardStyle,
                  textAlign: 'center',
                  color: colors.muted,
                  padding: '40px 20px',
                }}
              >
                No action items to display
              </div>
            )}
        </div>

        {/* Content Engagement */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>
            📚 Content Engagement
          </div>

          <div style={cardStyle}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '14px',
                    color: colors.muted,
                    marginBottom: '8px',
                  }}
                >
                  Content Assignments Completed This Month
                </div>
                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: colors.navy,
                  }}
                >
                  {contentStats.completed} of {contentStats.total}
                </div>
              </div>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '12px',
                  backgroundColor: colors.teal,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '36px',
                }}
              >
                📖
              </div>
            </div>

            <div
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: colors.border,
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  backgroundColor: colors.green,
                  width: `${contentStats.total > 0 ? (contentStats.completed / contentStats.total) * 100 : 0}%`,
                  transition: 'width 0.3s ease',
                }}
              ></div>
            </div>

            <div
              style={{
                marginTop: '12px',
                fontSize: '13px',
                color: colors.muted,
              }}
            >
              {contentStats.total === 0
                ? 'No assignments yet'
                : `${Math.round((contentStats.completed / contentStats.total) * 100)}% completion rate`}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>
            ⚡ Quick Actions
          </div>

          <div style={gridStyle}>
            <button
              style={actionButtonStyle}
              onClick={() => setCurrentView('meetings')}
            >
              📅
              <br />
              New Meeting
            </button>

            <button
              style={actionButtonStyle}
              onClick={() => setCurrentView('content')}
            >
              📚
              <br />
              Assign Content
            </button>

            <button
              style={actionButtonStyle}
              onClick={() => setCurrentView('communications')}
            >
              💌
              <br />
              Send Newsletter
            </button>

            <button
              style={actionButtonStyle}
              onClick={() => setCurrentView('events')}
            >
              🎯
              <br />
              Create Event
            </button>

            <button
              style={actionButtonStyle}
              onClick={() => setCurrentView('vault')}
            >
              🔐
              <br />
              View Vault
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilitatorDashboard;
