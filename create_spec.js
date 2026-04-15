import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
        PageBreak, LevelFormat, PageNumber, ExternalHyperlink } from 'docx';
import fs from 'fs';

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const bordersBold = { style: BorderStyle.SINGLE, size: 6, color: "1A3A5C" };
const borders = { top: border, bottom: border, left: border, right: border };
const boldBorders = { top: bordersBold, bottom: bordersBold, left: bordersBold, right: bordersBold };

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Arial", size: 22 }
      }
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: "1A3A5C" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 }
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: "34597A" },
        paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 1 }
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: "34597A" },
        paragraph: { spacing: { before: 120, after: 80 }, outlineLevel: 2 }
      }
    ]
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } }
          },
          {
            level: 1,
            format: LevelFormat.BULLET,
            text: "◦",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1440, hanging: 360 } } }
          }
        ]
      },
      {
        reference: "numbers",
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } }
          },
          {
            level: 1,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1440, hanging: 360 } } }
          }
        ]
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [
      // TITLE PAGE
      new Paragraph({
        children: [new TextRun({
          text: "STRIDE WAY",
          size: 56,
          bold: true,
          color: "1A3A5C",
          font: "Arial"
        })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 20 }
      }),
      new Paragraph({
        children: [new TextRun({
          text: "Backend Architecture Specification",
          size: 32,
          bold: true,
          color: "34597A",
          font: "Arial"
        })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      }),
      new Paragraph({
        children: [new TextRun({
          text: "Jason Packer's Family Enterprise Member Portal",
          size: 24,
          color: "34597A",
          font: "Arial"
        })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 }
      }),
      new Paragraph({
        children: [new TextRun({
          text: "Executive Leadership Team",
          size: 22,
          bold: true,
          color: "1A3A5C",
          font: "Arial"
        })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun({
          text: "Rachel Tan, CEO",
          size: 22,
          font: "Arial"
        })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 }
      }),
      new Paragraph({
        children: [new TextRun({
          text: "Priya Mehta, CTO",
          size: 22,
          font: "Arial"
        })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 }
      }),
      new Paragraph({
        children: [new TextRun({
          text: "David Okafor, CFO",
          size: 22,
          font: "Arial"
        })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 }
      }),
      new Paragraph({
        children: [new TextRun({
          text: "April 2026",
          size: 22,
          color: "666666",
          font: "Arial"
        })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 }
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // EXECUTIVE SUMMARY
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("1. Executive Summary")]
      }),
      new Paragraph({
        children: [new TextRun({
          text: "Rachel Tan, CEO",
          italic: true,
          size: 20,
          color: "666666"
        })]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun("The STRIDE Way is a transformative member portal that brings Jason Packer's family enterprise methodology to life. Currently built as a React 19 single-page application with localStorage-based data storage, our platform requires a production-grade backend infrastructure to support our growing membership base, enable payment processing, and unlock AI-powered advisory features for the future.")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Current State")]
      }),
      new Paragraph({
        children: [new TextRun("Today, STRIDE Way operates with:")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("~8,500 lines of React code deployed via GitHub to Netlify")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("All member data stored in browser localStorage (non-persistent)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Client-side authentication stub that accepts any email/password")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Membership tiers: Founding ($250/yr), Albany ($500/yr), Regional ($1,000–$1,500/yr)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("No payment processing, no membership management")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Session/event RSVP, Workbook (15 focus areas), Family profiles, Community features")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Strategic Vision")]
      }),
      new Paragraph({
        children: [new TextRun("This specification defines a phased transition to a professional backend that enables:")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Secure authentication with email/password and magic links")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Persistent member database with roles, peer groups, and lifecycle tracking")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Stripe integration for recurring subscriptions and membership renewals")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Admin dashboard for Jason to manage members, sessions, and applications")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Foundation for AI-powered features and advisor licensing")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Key Outcomes")]
      }),
      new Paragraph({
        children: [new TextRun("Upon completing this build:")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Jason gains a single source of truth for member data across all tiers and cohorts")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Members enjoy a secure, persistent experience with confidence in data privacy")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Revenue streams are unlocked through automated membership lifecycle and renewals")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("The platform is positioned to scale from 50 members to 500+ across multiple advisor channels")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("We reduce operational burden by eliminating reliance on Glue Up and manual spreadsheets")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 200 }
      }),

      // SYSTEM ARCHITECTURE
      new Paragraph({
        children: [new PageBreak()]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("2. System Architecture Overview")]
      }),
      new Paragraph({
        children: [new TextRun({
          text: "Priya Mehta, CTO",
          italic: true,
          size: 20,
          color: "666666"
        })]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun("The STRIDE Way backend follows a modern, serverless-first architecture. We separate concerns into authentication (Supabase Auth), data storage (Supabase Postgres), and payments (Stripe), allowing each system to operate as a managed service while we focus on application logic.")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Technology Stack")]
      }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 3510, 3510],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: boldBorders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "1A3A5C", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun({
                    text: "Layer",
                    bold: true,
                    color: "FFFFFF",
                    size: 22
                  })]
                })]
              }),
              new TableCell({
                borders: boldBorders,
                width: { size: 3510, type: WidthType.DXA },
                shading: { fill: "1A3A5C", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun({
                    text: "Technology",
                    bold: true,
                    color: "FFFFFF",
                    size: 22
                  })]
                })]
              }),
              new TableCell({
                borders: boldBorders,
                width: { size: 3510, type: WidthType.DXA },
                shading: { fill: "1A3A5C", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun({
                    text: "Purpose",
                    bold: true,
                    color: "FFFFFF",
                    size: 22
                  })]
                })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun({
                    text: "Frontend",
                    bold: true
                  })]
                })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun("React 19 + Vite")]
                })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun("SPA deployed to Netlify")]
                })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun({
                    text: "Auth",
                    bold: true
                  })]
                })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun("Supabase Auth")]
                })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun("Email/password, magic links, MFA")]
                })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun({
                    text: "Database",
                    bold: true
                  })]
                })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun("Supabase Postgres")]
                })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun("Persistent member data, schema enforced")]
                })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun({
                    text: "Payments",
                    bold: true
                  })]
                })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun("Stripe")]
                })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun("Subscriptions, webhooks, customer portal")]
                })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun({
                    text: "Hosting",
                    bold: true
                  })]
                })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun("Netlify (frontend) + Supabase (backend)")]
                })]
              }),
              new TableCell({
                borders,
                width: { size: 3510, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun("CDN-backed, auto-scaling, no servers to manage")]
                })]
              })
            ]
          })
        ]
      }),

      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 200 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Why This Stack")]
      }),
      new Paragraph({
        children: [new TextRun("Supabase provides managed PostgreSQL with built-in authentication, row-level security (RLS), and real-time capabilities—eliminating the need to build and maintain a custom backend API. Stripe handles all payment compliance, PCI-DSS certification, and subscription lifecycle. Netlify serves the React SPA with automatic deployments, CDN caching, and serverless functions for webhook handlers.")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Eliminates infrastructure overhead and reduces attack surface")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Ensures PCI compliance for payments without custom payment code")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Scales to thousands of members without DevOps effort")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Allows us to re-allocate engineering time to features that differentiate STRIDE Way")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 200 }
      }),

      // DATABASE SCHEMA
      new Paragraph({
        children: [new PageBreak()]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("3. Database Schema")]
      }),
      new Paragraph({
        children: [new TextRun("The database is the source of truth for all member and organizational data. We use Postgres with Row-Level Security (RLS) to enforce access control at the database layer, reducing the need for application-level authorization checks.")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Core Tables")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 80 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("profiles")]
      }),
      new Paragraph({
        children: [new TextRun("Extends Supabase's auth.users table with application-specific fields. One profile per member.")]
      }),
      new Paragraph({
        children: [new TextRun({
          text: "CREATE TABLE profiles (\n  id UUID REFERENCES auth.users(id) PRIMARY KEY,\n  email TEXT NOT NULL,\n  name TEXT NOT NULL,\n  initials TEXT,\n  role TEXT DEFAULT 'member',\n  tier TEXT,\n  stripe_customer_id TEXT UNIQUE,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);",
          font: "Courier New",
          size: 18,
          color: "333333"
        })],
        spacing: { before: 80, after: 100 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("memberships")]
      }),
      new Paragraph({
        children: [new TextRun("Tracks subscription status, tier, renewal date, and payments for each member.")]
      }),
      new Paragraph({
        children: [new TextRun({
          text: "CREATE TABLE memberships (\n  id BIGSERIAL PRIMARY KEY,\n  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,\n  tier TEXT NOT NULL,\n  status TEXT DEFAULT 'active',\n  stripe_subscription_id TEXT UNIQUE,\n  annual_price NUMERIC(10, 2) NOT NULL,\n  renewal_date DATE NOT NULL,\n  peer_group_id BIGINT,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);",
          font: "Courier New",
          size: 18,
          color: "333333"
        })],
        spacing: { before: 80, after: 100 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("sessions")]
      }),
      new Paragraph({
        children: [new TextRun("Events, workshops, and peer group meetings managed by Jason.")]
      }),
      new Paragraph({
        children: [new TextRun({
          text: "CREATE TABLE sessions (\n  id BIGSERIAL PRIMARY KEY,\n  title TEXT NOT NULL,\n  description TEXT,\n  session_date TIMESTAMPTZ NOT NULL,\n  location TEXT,\n  capacity INT,\n  event_type TEXT,\n  created_by UUID REFERENCES auth.users(id),\n  is_published BOOLEAN DEFAULT FALSE,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);",
          font: "Courier New",
          size: 18,
          color: "333333"
        })],
        spacing: { before: 80, after: 100 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("rsvps")]
      }),
      new Paragraph({
        children: [new TextRun("Member attendance tracking for sessions.")]
      }),
      new Paragraph({
        children: [new TextRun({
          text: "CREATE TABLE rsvps (\n  id BIGSERIAL PRIMARY KEY,\n  session_id BIGINT REFERENCES sessions(id) ON DELETE CASCADE,\n  user_id UUID REFERENCES auth.users(id) NOT NULL,\n  status TEXT DEFAULT 'attending',\n  response_date TIMESTAMPTZ DEFAULT NOW(),\n  UNIQUE(session_id, user_id)\n);",
          font: "Courier New",
          size: 18,
          color: "333333"
        })],
        spacing: { before: 80, after: 100 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("workbook_data")]
      }),
      new Paragraph({
        children: [new TextRun("Stores Workbook answers across 15 focus areas.")]
      }),
      new Paragraph({
        children: [new TextRun({
          text: "CREATE TABLE workbook_data (\n  id BIGSERIAL PRIMARY KEY,\n  user_id UUID REFERENCES auth.users(id) NOT NULL,\n  category TEXT NOT NULL,\n  focus_area TEXT NOT NULL,\n  responses JSONB,\n  completed BOOLEAN DEFAULT FALSE,\n  updated_at TIMESTAMPTZ DEFAULT NOW(),\n  UNIQUE(user_id, category, focus_area)\n);",
          font: "Courier New",
          size: 18,
          color: "333333"
        })],
        spacing: { before: 80, after: 100 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("peer_groups")]
      }),
      new Paragraph({
        children: [new TextRun("Peer cohorts for peer learning and mentorship.")]
      }),
      new Paragraph({
        children: [new TextRun({
          text: "CREATE TABLE peer_groups (\n  id BIGSERIAL PRIMARY KEY,\n  name TEXT NOT NULL,\n  description TEXT,\n  created_by UUID REFERENCES auth.users(id),\n  is_active BOOLEAN DEFAULT TRUE,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);",
          font: "Courier New",
          size: 18,
          color: "333333"
        })],
        spacing: { before: 80, after: 200 }
      }),

      // AUTHENTICATION
      new Paragraph({
        children: [new PageBreak()]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("4. Authentication & Authorization")]
      }),
      new Paragraph({
        children: [new TextRun("Security is foundational. We use Supabase Auth for account management and Row-Level Security (RLS) policies to enforce access control at the database layer.")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Authentication Methods")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Email / Password:",
          bold: true
        }), new TextRun(" Standard signup and login via email with bcrypt-hashed passwords")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Magic Links:",
          bold: true
        }), new TextRun(" Passwordless sign-in via single-use email link")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Multi-Factor Authentication (MFA):",
          bold: true
        }), new TextRun(" Optional TOTP for admin accounts")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Role-Based Access Control")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Member:",
          bold: true
        }), new TextRun(" Can view/edit own profile, enroll in memberships, attend sessions")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Admin:",
          bold: true
        }), new TextRun(" Can manage all members, create sessions, view membership data")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 200 }
      }),

      // PAYMENTS
      new Paragraph({
        children: [new PageBreak()]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("5. Payment Integration")]
      }),
      new Paragraph({
        children: [new TextRun({
          text: "David Okafor, CFO",
          italic: true,
          size: 20,
          color: "666666"
        })]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun("Stripe handles all payment processing, subscription lifecycle, and PCI compliance. We never store card data directly; Stripe tokenizes everything.")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Membership Tiers & Pricing")]
      }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 2340, 2340, 2340],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: boldBorders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "1A3A5C", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun({
                    text: "Tier",
                    bold: true,
                    color: "FFFFFF"
                  })]
                })]
              }),
              new TableCell({
                borders: boldBorders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "1A3A5C", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun({
                    text: "Annual Price",
                    bold: true,
                    color: "FFFFFF"
                  })]
                })]
              }),
              new TableCell({
                borders: boldBorders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "1A3A5C", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun({
                    text: "Session Access",
                    bold: true,
                    color: "FFFFFF"
                  })]
                })]
              }),
              new TableCell({
                borders: boldBorders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "1A3A5C", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun({
                    text: "Workbook",
                    bold: true,
                    color: "FFFFFF"
                  })]
                })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun({
                    text: "Founding",
                    bold: true
                  })]
                })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun("$250")]
                })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun("Open workshops")]
                })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun("Full access")]
                })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun({
                    text: "Albany",
                    bold: true
                  })]
                })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun("$500")]
                })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun("+ Albany cohort")]
                })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun("Full access")]
                })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun({
                    text: "Regional",
                    bold: true
                  })]
                })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun("$1,000–$1,500")]
                })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun("+ Regional cohort")]
                })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun("Full access")]
                })]
              })
            ]
          })
        ]
      }),

      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Stripe Integration")]
      }),
      new Paragraph({
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Member selects a tier on the membership page")]
      }),
      new Paragraph({
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Frontend redirects to Stripe Checkout")]
      }),
      new Paragraph({
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Member enters card details")]
      }),
      new Paragraph({
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Stripe processes and creates subscription")]
      }),
      new Paragraph({
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Webhook notifies backend; tier is updated")]
      }),
      new Paragraph({
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Member sees updated tier")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Stripe Webhooks")]
      }),
      new Paragraph({
        children: [new TextRun("We listen for key Stripe events on Netlify serverless functions:")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "customer.subscription.created:",
          bold: true
        }), new TextRun(" New member subscription")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "customer.subscription.updated:",
          bold: true
        }), new TextRun(" Tier or renewal date changed")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "customer.subscription.deleted:",
          bold: true
        }), new TextRun(" Cancellation")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "invoice.payment_failed:",
          bold: true
        }), new TextRun(" Renewal payment failed")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 200 }
      }),

      // ADMIN DASHBOARD
      new Paragraph({
        children: [new PageBreak()]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("6. Admin Dashboard")]
      }),
      new Paragraph({
        children: [new TextRun("Jason needs visibility and control over the STRIDE Way ecosystem. The Admin Dashboard is a restricted section (admin role only) for member management, session orchestration, and analytics.")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Core Features")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("1. Member Directory")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Search/filter members by name, email, tier, peer group")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("View member status: active, paused, cancelled")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("One-click access to member profiles")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Bulk actions: pause, update tier, assign to peer group")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("2. Session Management")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Create/edit sessions: title, date, capacity, tier requirements")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("View RSVPs and attendance")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Publish sessions to members")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Generate attendee lists")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("3. Peer Group Management")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Create cohorts (e.g., 'Albany 2025', 'Regional West')")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Assign members to peer groups")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Track peer group participation")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("4. Analytics & Reports")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Member metrics: total active, by tier, by peer group")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Revenue dashboard: ARR, churn rate, renewal forecast")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Engagement metrics: workbook completion, session attendance")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Export member list and session data as CSV")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 200 }
      }),

      // MIGRATION PLAN
      new Paragraph({
        children: [new PageBreak()]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("7. Migration Plan")]
      }),
      new Paragraph({
        children: [new TextRun("Transitioning from localStorage to a production backend requires careful sequencing. We use a phased rollout strategy.")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Phase 1: Foundation (Weeks 1–4)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Set up Supabase project and schema")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Configure Stripe account and test subscriptions")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Deploy Netlify serverless functions for webhook handlers")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Update React app: integrate Supabase client, wire auth module")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Internal testing with staging environment")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Phase 2: Auth Rollout (Weeks 5–6)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Enable Supabase Auth in production; keep localStorage fallback active")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Invite early testers (5–10 members) to sign up with new auth")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Validate session persistence and profile creation")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Iterate on bugs; gather feedback")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Phase 3: Payments (Weeks 7–8)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Connect Stripe in production (live mode)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Enroll early testers in a tier")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Validate webhooks: subscription created/updated/deleted")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Test Stripe Customer Portal for member self-service")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Phase 4: Admin Dashboard & Cutover (Weeks 9–10)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Build admin dashboard; enable Jason to manage members and sessions")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Migrate existing member data from localStorage to Supabase")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Send re-enrollment emails to all members")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Remove localStorage fallback; require Supabase auth")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Phase 5: Polish & Launch (Weeks 11–12)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Security audit: OWASP top 10, RLS policy review")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Performance tuning: database indexes, frontend caching")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Documentation: runbooks for backup/restore")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Public launch announcement; full member onboarding")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 200 }
      }),

      // COST PROJECTIONS
      new Paragraph({
        children: [new PageBreak()]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("8. Cost Projections")]
      }),
      new Paragraph({
        children: [new TextRun({
          text: "David Okafor, CFO",
          italic: true,
          size: 20,
          color: "666666"
        })]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun("Our infrastructure costs scale linearly with usage. At 100 members, monthly platform costs are ~$150. At 500 members, ~$400/month. Member revenue easily covers platform costs while delivering exceptional margin.")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Monthly Platform Cost")]
      }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 2340, 2340, 2340],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: boldBorders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "1A3A5C", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun({
                    text: "Members",
                    bold: true,
                    color: "FFFFFF"
                  })]
                })]
              }),
              new TableCell({
                borders: boldBorders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "1A3A5C", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun({
                    text: "Supabase",
                    bold: true,
                    color: "FFFFFF"
                  })]
                })]
              }),
              new TableCell({
                borders: boldBorders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "1A3A5C", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun({
                    text: "Stripe Fees",
                    bold: true,
                    color: "FFFFFF"
                  })]
                })]
              }),
              new TableCell({
                borders: boldBorders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "1A3A5C", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun({
                    text: "Total/Month",
                    bold: true,
                    color: "FFFFFF"
                  })]
                })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("50")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("$0")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("$75")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("$94")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("200")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("$0")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("$290")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("$309")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("500")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("$0–$25")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("$725")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("$744–$769")] })]
              })
            ]
          })
        ]
      }),

      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Revenue vs. Cost Analysis")]
      }),
      new Paragraph({
        children: [new TextRun("At scale, platform costs are negligible compared to member revenue.")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1872, 1872, 1872, 1872, 1872],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: boldBorders,
                width: { size: 1872, type: WidthType.DXA },
                shading: { fill: "1A3A5C", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun({
                    text: "Members",
                    bold: true,
                    color: "FFFFFF",
                    size: 20
                  })]
                })]
              }),
              new TableCell({
                borders: boldBorders,
                width: { size: 1872, type: WidthType.DXA },
                shading: { fill: "1A3A5C", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun({
                    text: "ARR",
                    bold: true,
                    color: "FFFFFF",
                    size: 20
                  })]
                })]
              }),
              new TableCell({
                borders: boldBorders,
                width: { size: 1872, type: WidthType.DXA },
                shading: { fill: "1A3A5C", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun({
                    text: "Platform Cost/yr",
                    bold: true,
                    color: "FFFFFF",
                    size: 20
                  })]
                })]
              }),
              new TableCell({
                borders: boldBorders,
                width: { size: 1872, type: WidthType.DXA },
                shading: { fill: "1A3A5C", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun({
                    text: "Net (after Stripe)",
                    bold: true,
                    color: "FFFFFF",
                    size: 20
                  })]
                })]
              }),
              new TableCell({
                borders: boldBorders,
                width: { size: 1872, type: WidthType.DXA },
                shading: { fill: "1A3A5C", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun({
                    text: "Margin %",
                    bold: true,
                    color: "FFFFFF",
                    size: 20
                  })]
                })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 1872, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("50")] })]
              }),
              new TableCell({
                borders,
                width: { size: 1872, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("$30,000")] })]
              }),
              new TableCell({
                borders,
                width: { size: 1872, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("$1,128")] })]
              }),
              new TableCell({
                borders,
                width: { size: 1872, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("$28,128")] })]
              }),
              new TableCell({
                borders,
                width: { size: 1872, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("94%")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 1872, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("200")] })]
              }),
              new TableCell({
                borders,
                width: { size: 1872, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("$120,000")] })]
              }),
              new TableCell({
                borders,
                width: { size: 1872, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("$3,708")] })]
              }),
              new TableCell({
                borders,
                width: { size: 1872, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("$113,212")] })]
              }),
              new TableCell({
                borders,
                width: { size: 1872, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("94%")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 1872, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("500")] })]
              }),
              new TableCell({
                borders,
                width: { size: 1872, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("$300,000")] })]
              }),
              new TableCell({
                borders,
                width: { size: 1872, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("$9,228")] })]
              }),
              new TableCell({
                borders,
                width: { size: 1872, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("$282,492")] })]
              }),
              new TableCell({
                borders,
                width: { size: 1872, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("94%")] })]
              })
            ]
          })
        ]
      }),

      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [new TextRun("At 200 members, STRIDE Way generates ~$113K net annual margin after all platform costs. This scales to $282K at 500 members.")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 200 }
      }),

      // TIMELINE
      new Paragraph({
        children: [new PageBreak()]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("9. Timeline & Milestones")]
      }),
      new Paragraph({
        children: [new TextRun({
          text: "Rachel Tan, CEO",
          italic: true,
          size: 20,
          color: "666666"
        })]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun("We commit to a 12-week implementation that balances engineering rigor with speed-to-market.")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1404, 3978, 3978],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: boldBorders,
                width: { size: 1404, type: WidthType.DXA },
                shading: { fill: "1A3A5C", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun({
                    text: "Week",
                    bold: true,
                    color: "FFFFFF"
                  })]
                })]
              }),
              new TableCell({
                borders: boldBorders,
                width: { size: 3978, type: WidthType.DXA },
                shading: { fill: "1A3A5C", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun({
                    text: "Phase",
                    bold: true,
                    color: "FFFFFF"
                  })]
                })]
              }),
              new TableCell({
                borders: boldBorders,
                width: { size: 3978, type: WidthType.DXA },
                shading: { fill: "1A3A5C", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun({
                    text: "Key Deliverables",
                    bold: true,
                    color: "FFFFFF"
                  })]
                })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 1404, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({text: "1–4", bold: true})] })]
              }),
              new TableCell({
                borders,
                width: { size: 3978, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({text: "Foundation", bold: true})] })]
              }),
              new TableCell({
                borders,
                width: { size: 3978, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun("Supabase project, Stripe setup, Netlify functions, React integration")]
                })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 1404, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({text: "5–6", bold: true})] })]
              }),
              new TableCell({
                borders,
                width: { size: 3978, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({text: "Auth Rollout", bold: true})] })]
              }),
              new TableCell({
                borders,
                width: { size: 3978, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun("Beta testing, bug fixes, feedback")]
                })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 1404, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({text: "7–8", bold: true})] })]
              }),
              new TableCell({
                borders,
                width: { size: 3978, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({text: "Payments", bold: true})] })]
              }),
              new TableCell({
                borders,
                width: { size: 3978, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun("Stripe live mode, test subscriptions, webhook validation")]
                })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 1404, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({text: "9–10", bold: true})] })]
              }),
              new TableCell({
                borders,
                width: { size: 3978, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({text: "Admin & Cutover", bold: true})] })]
              }),
              new TableCell({
                borders,
                width: { size: 3978, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun("Admin dashboard, data migration, member re-enrollment")]
                })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 1404, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({text: "11–12", bold: true})] })]
              }),
              new TableCell({
                borders,
                width: { size: 3978, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({text: "Launch", bold: true})] })]
              }),
              new TableCell({
                borders,
                width: { size: 3978, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                  children: [new TextRun("Security audit, performance tuning, public launch")]
                })]
              })
            ]
          })
        ]
      }),

      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 200 }
      }),

      // CONCLUSION
      new Paragraph({
        children: [new PageBreak()]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("10. Conclusion")]
      }),
      new Paragraph({
        children: [new TextRun({
          text: "Rachel Tan, CEO",
          italic: true,
          size: 20,
          color: "666666"
        })]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun("STRIDE Way is poised to become the gold standard for family enterprise member portals. This backend architecture provides the security, scalability, and operational efficiency needed to serve Jason's vision at scale. By partnering with Supabase and Stripe—two world-class managed services—we avoid reinventing the wheel and focus engineering effort on features that create lasting member value.")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun("The 12-week implementation timeline is aggressive but achievable. We commit to transparent communication, rapid iteration, and early member feedback. Upon launch, STRIDE Way will be positioned for sustainable growth, profitable unit economics, and expansion into advisor licensing and AI-powered insights.")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun("This is our moment to transform STRIDE Way from a prototype into a production-grade platform that serves families with clarity, confidence, and community.")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 400 }
      }),
      new Paragraph({
        children: [new TextRun({
          text: "Rachel Tan",
          bold: true
        })],
        spacing: { after: 20 }
      }),
      new Paragraph({
        children: [new TextRun("CEO, STRIDE Way")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 40 }
      }),
      new Paragraph({
        children: [new TextRun({
          text: "Priya Mehta",
          bold: true
        })],
        spacing: { after: 20 }
      }),
      new Paragraph({
        children: [new TextRun("CTO, STRIDE Way")]
      }),
      new Paragraph({
        children: [new TextRun("")],
        spacing: { after: 40 }
      }),
      new Paragraph({
        children: [new TextRun({
          text: "David Okafor",
          bold: true
        })],
        spacing: { after: 20 }
      }),
      new Paragraph({
        children: [new TextRun("CFO, STRIDE Way")]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/sessions/dreamy-epic-feynman/mnt/outputs/STRIDE-Way-Backend-Architecture-Spec.docx", buffer);
  console.log("Document created successfully!");
});
