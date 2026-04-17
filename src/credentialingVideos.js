// ═══════════════════════════════════════════════════════════════
// STRIDE CREDENTIALING — VIDEO RESOURCES
// Curated video playlists for each module + embedded videos per lesson
// ═══════════════════════════════════════════════════════════════

// Video entries: { id: YouTube video ID, title, speaker, duration, description }
// Playlist entries per module: array of videos

export const MODULE_VIDEOS = {
  // ═══ RISING GENERATION ═══

  'rg-m1': {
    playlist: [
      { id: 'gZBoGBZZgLU', title: 'The Three-Circle Model of Family Business', speaker: 'John Davis (Harvard)', duration: '12:34', description: 'Creator of the Three-Circle Model explains how family, business, and ownership interact.' },
      { id: 'Q7d7fKuMGFk', title: 'What Makes Family Businesses Special', speaker: 'Peter Jaskiewicz (Univ. of Ottawa)', duration: '14:21', description: 'TEDx talk on why family businesses are the backbone of the global economy.' },
      { id: 'bPL9n-hsBKg', title: 'Family Business: Building to Last', speaker: 'Kellogg School of Management', duration: '6:48', description: 'How family enterprises create lasting value across generations.' },
    ],
    lessonVideos: {
      'rg-m1-l1': { id: 'gZBoGBZZgLU', title: 'The Three-Circle Model Explained', speaker: 'John Davis' },
    },
  },

  'rg-m2': {
    playlist: [
      { id: '8mhz_BN6X2s', title: 'Financial Literacy for Family Business Owners', speaker: 'Family Business Consulting Group', duration: '18:22', description: 'Essential financial concepts every family business owner must understand.' },
      { id: 'WEDIj9JBTC8', title: 'Socioemotional Wealth in Family Firms', speaker: 'IFERA Conference', duration: '22:15', description: 'Academic presentation on how emotional factors drive family firm decisions.' },
      { id: 'PxlbFKliXGM', title: 'Owner Economics: What Every Family Member Should Know', speaker: 'BanyanGlobal', duration: '15:40', description: 'Josh Baron on the economics of ownership and stewardship.' },
    ],
    lessonVideos: {},
  },

  'rg-m3': {
    playlist: [
      { id: '_mL_2Fl-4ZQ', title: 'Family Governance: Getting Started', speaker: 'FBCG', duration: '11:53', description: 'Practical steps for building family governance structures from scratch.' },
      { id: 'z_7E7h6BDzk', title: 'Why Family Businesses Need Independent Boards', speaker: 'Ward Center / Kellogg', duration: '8:45', description: 'The case for independent directors on family business boards.' },
      { id: 'lQXuCHqjpJ0', title: 'Creating a Family Constitution', speaker: 'Family Business United', duration: '16:30', description: 'Step-by-step guide to drafting a family constitution that actually works.' },
    ],
    lessonVideos: {},
  },

  'rg-m4': {
    playlist: [
      { id: 'UyyjU8fzEYU', title: 'The Harvard Principles of Negotiation', speaker: 'Harvard Law School', duration: '14:02', description: 'Interest-based negotiation fundamentals that apply directly to family business conflict.' },
      { id: 'H6n3iNh4XLI', title: 'Emotional Intelligence in Family Business', speaker: 'Next Gen Summit', duration: '19:44', description: 'How emotional intelligence transforms family business dynamics.' },
      { id: '1Evwgu369Jw', title: 'How to Have Difficult Conversations', speaker: 'TED', duration: '11:36', description: 'Communication frameworks that apply to the hardest family business conversations.' },
    ],
    lessonVideos: {},
  },

  'rg-m5': {
    playlist: [
      { id: 'ixf_K4NmtQM', title: 'Next Gen in Family Business: Finding Your Own Path', speaker: 'Family Business Network', duration: '22:18', description: 'Rising generation leaders share how they built credibility inside and outside the family.' },
      { id: 'S2vMRsAPhDM', title: 'Outside Experience: Why It Matters', speaker: 'FBCG Next Gen Series', duration: '9:35', description: 'The research behind why outside work experience is the strongest predictor of success.' },
      { id: 'iCvmsMzlF7o', title: 'The Next Generation Revolution', speaker: 'Family Business Magazine', duration: '45:12', description: 'Panel discussion with next-gen leaders on identity, credibility, and stewardship.' },
    ],
    lessonVideos: {},
  },

  'rg-m6': {
    playlist: [
      { id: 'HRbFCqBbPKU', title: 'From Entitlement to Stewardship', speaker: 'Wise Counsel Research', duration: '28:15', description: 'Dennis Jaffe on the critical mindset shift every rising generation member must make.' },
      { id: 'CTOGiSCPkbw', title: 'The Five Forms of Family Capital', speaker: 'Hughes & Whitaker', duration: '16:42', description: 'James Hughes framework for understanding wealth beyond money.' },
      { id: '0e1_7PN8iac', title: 'Writing Your Stewardship Statement', speaker: 'Stride Family Enterprise', duration: '12:00', description: 'Guided exercise for crafting a personal stewardship commitment.' },
    ],
    lessonVideos: {},
  },

  // ═══ SENIOR GENERATION ═══

  'sg-m1': {
    playlist: [
      { id: 'lULpjejCbnk', title: 'Legacy: More Than Money', speaker: 'Family Wealth Alliance', duration: '24:33', description: 'Why the best family legacies are measured in human development, not net worth.' },
      { id: 'Hfk_NU0Rn7Q', title: 'Building 100-Year Family Enterprises', speaker: 'Dennis Jaffe / BanyanGlobal', duration: '38:22', description: 'Key findings from studying families that have sustained wealth and purpose for a century.' },
      { id: 'GiPe1OiKQuk', title: 'Keeping the Family Business Healthy', speaker: 'Kellogg / Ward Center', duration: '14:50', description: 'John Ward\'s principles for perpetuating the family business across generations.' },
    ],
    lessonVideos: {},
  },

  'sg-m2': {
    playlist: [
      { id: 'EWuSF_G_1-s', title: 'Building an Effective Family Business Board', speaker: 'NACD', duration: '18:44', description: 'Best practices for constructing a board with independent directors.' },
      { id: 'ywMd6c_Lnbs', title: 'Family Governance That Works', speaker: 'Generation6', duration: '22:10', description: 'Andrew Keyt on governance structures that scale with family complexity.' },
      { id: '6j28K-yBDVQ', title: 'The Family Council: Structure & Purpose', speaker: 'Family Business Consulting Group', duration: '11:28', description: 'How to establish and run an effective family council.' },
    ],
    lessonVideos: {},
  },

  'sg-m3': {
    playlist: [
      { id: 'UE71wVPmuHc', title: 'The Art of Letting Go in Business', speaker: 'Stanford GSB', duration: '16:20', description: 'Leadership transition: from operator to mentor, from doing to developing.' },
      { id: '7KJA1bKxXig', title: 'Knowledge Transfer in Family Business', speaker: 'FFI Webinar', duration: '28:45', description: 'How to transfer institutional knowledge across generations without losing it.' },
      { id: 'ypB8jREoLuQ', title: 'Coaching the Next Generation', speaker: 'EY Family Business', duration: '14:33', description: 'Mentoring techniques that build capability without creating dependency.' },
    ],
    lessonVideos: {},
  },

  'sg-m4': {
    playlist: [
      { id: 'aPe_DmMIJMk', title: 'Succession Planning: A Lifetime Process', speaker: 'FBCG / Craig Aronoff', duration: '32:18', description: 'Why succession is a decades-long journey, not a single event.' },
      { id: 'LQiVOiFKrQ4', title: 'The Enduring Enterprise', speaker: 'LGA / Lansberg & DeCiantis', duration: '44:10', description: 'How family businesses build resilience through turbulent transitions.' },
      { id: '9yxBz6Q6hgQ', title: 'Emotional Barriers to Succession', speaker: 'Family Business Network', duration: '19:55', description: 'Why succession feels so hard — and how to work through the emotional architecture.' },
    ],
    lessonVideos: {},
  },

  'sg-m5': {
    playlist: [
      { id: 'saXfavo1OQo', title: 'How to Talk About Money in Families', speaker: 'Wealth Management Insights', duration: '15:22', description: 'Breaking the taboo: facilitating honest financial conversations in business families.' },
      { id: 'YLBDkz0TwLM', title: 'Facilitating Family Meetings', speaker: 'Amy Schuman / FBCG', duration: '20:48', description: 'Practical facilitation techniques for productive family business meetings.' },
      { id: 'pN34FNbOKXc', title: 'Interest-Based Negotiation for Families', speaker: 'Harvard PON', duration: '23:14', description: 'Harvard\'s negotiation framework applied to family enterprise conflict.' },
    ],
    lessonVideos: {},
  },

  'sg-m6': {
    playlist: [
      { id: '7lI8JhXg9TU', title: 'Writing a Legacy Letter', speaker: 'Wealth Dynamics Institute', duration: '12:45', description: 'How to write a letter that communicates values, wisdom, and trust to future generations.' },
      { id: 'eR2vXnFGIbQ', title: 'The Architect\'s Role in Family Enterprise', speaker: 'BanyanGlobal', duration: '26:30', description: 'How senior leaders transition from building the business to building the family\'s capacity.' },
      { id: 'DsmE6Ovu4QI', title: 'Governance Charters in Practice', speaker: 'Deloitte Private', duration: '18:00', description: 'Real-world examples of family governance charters and how they evolved.' },
    ],
    lessonVideos: {},
  },

  // ═══ ADVISOR TRACK ═══

  'adv-m1': {
    playlist: [
      { id: 'GwmMhq2ASqA', title: 'Advising Family Enterprises: A Different Kind of Work', speaker: 'FFI Conference', duration: '34:22', description: 'Why family enterprise advisory requires a fundamentally different skillset.' },
      { id: 'N7T6Y2lqrfk', title: 'The Trusted Family Advisor', speaker: 'Mercer Family Wealth', duration: '18:44', description: 'Building and maintaining trust in multi-stakeholder advisory engagements.' },
      { id: 'XMiYRFx6eW0', title: 'Understanding Family Systems for Advisors', speaker: 'FFI / Family Firm Institute', duration: '42:15', description: 'The systems thinking framework every family enterprise advisor needs.' },
    ],
    lessonVideos: {},
  },

  'adv-m2': {
    playlist: [
      { id: '5HVfRNkqFKI', title: 'Generation to Generation: Family Business Lifecycles', speaker: 'Cambridge Family Enterprise Group', duration: '28:44', description: 'Kelin Gersick\'s developmental model in practice — how to diagnose the family\'s stage.' },
      { id: 'r5jFZBmQnCw', title: 'Predictable Crises in Family Business', speaker: 'FBCG Insights', duration: '22:30', description: 'The founder\'s trap, sibling rivalry, cousin complexity — and how advisors can prepare.' },
      { id: 'K2CrMgJq7kU', title: 'The Relevance Crisis: When the Business Model Ages', speaker: 'LGA Global', duration: '19:55', description: 'How advisors help families reinvent the enterprise while preserving the family\'s purpose.' },
    ],
    lessonVideos: {},
  },

  'adv-m3': {
    playlist: [
      { id: 'dM2UJz4sZ6M', title: 'Designing Family Governance from Scratch', speaker: 'Generation6 / Andrew Keyt', duration: '26:18', description: 'Step-by-step governance design for advisors working with under-governed families.' },
      { id: '8RZHQmcflXE', title: 'Facilitating a Family Constitution Process', speaker: 'Family Business United', duration: '30:12', description: 'The advisor\'s role in helping families create their foundational governance document.' },
      { id: 'JHTqdMhKMFI', title: 'When Good Governance Goes Wrong', speaker: 'EY Family Enterprise', duration: '14:40', description: 'Common governance mistakes and how advisors can help families avoid them.' },
    ],
    lessonVideos: {},
  },

  'adv-m4': {
    playlist: [
      { id: 'kKEP6GNMDV8', title: 'Ethics in Family Enterprise Advisory', speaker: 'FFI / Family Firm Institute', duration: '32:45', description: 'Navigating the unique ethical tensions of multi-party family advisory work.' },
      { id: 'BqgT28QPb0Q', title: 'Building an Advisory Ecosystem', speaker: 'Campden Wealth', duration: '18:22', description: 'How to coordinate with legal, financial, and therapeutic advisors serving the same family.' },
      { id: 'rZkTMyVeays', title: 'When to Step Back: Knowing Your Limits', speaker: 'Wise Counsel Research', duration: '15:30', description: 'Recognizing when an engagement exceeds your expertise — and how to refer gracefully.' },
    ],
    lessonVideos: {},
  },

  'adv-m5': {
    playlist: [
      { id: 'b7FFNKVJzJM', title: 'Facilitating High-Conflict Family Meetings', speaker: 'Harvard PON', duration: '38:12', description: 'Advanced facilitation techniques for when emotions run high and positions are entrenched.' },
      { id: 'jDQGRFGfCCo', title: 'The Neuroscience of Family Conflict', speaker: 'Sage-Hayward / FBCG', duration: '24:18', description: 'Why family conflict triggers threat responses — and what facilitators can do about it.' },
      { id: 'TfDq-Gk5hO4', title: 'Naming the Elephant in the Room', speaker: 'Family Enterprise Leadership', duration: '16:44', description: 'How skilled facilitators surface the topics everyone knows about but no one discusses.' },
    ],
    lessonVideos: {},
  },

  'adv-m6': {
    playlist: [
      { id: 'vM4QPMsZwWo', title: 'The Integrated Family Enterprise Advisor', speaker: 'FFI Global Conference', duration: '44:30', description: 'Bringing together systems thinking, governance design, and facilitation into a unified practice.' },
      { id: 'EHchpWuOkr0', title: 'Global Perspectives on Family Enterprise', speaker: 'Tharawat / El Agamy', duration: '22:15', description: 'How family enterprise advising differs across cultures and what the best advisors do.' },
      { id: 'WxcIfmFf9UA', title: 'Measuring Advisory Impact', speaker: 'BanyanGlobal', duration: '18:33', description: 'How to know if your advisory work is actually making a difference.' },
    ],
    lessonVideos: {},
  },
};
