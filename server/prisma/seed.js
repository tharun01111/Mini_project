import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import 'dotenv/config';

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Neither DIRECT_URL nor DATABASE_URL is set. Cannot connect to the database.');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// ─── helpers ──────────────────────────────────────────────────────────────────
const ticketCode = () => `TCK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
const certCode   = () => `CERT-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

async function main() {
  console.log('🌱  Starting full database seed …\n');

  // ── Passwords ──────────────────────────────────────────────────────────────
  const [adminPwd, orgPwd, partPwd] = await Promise.all([
    bcrypt.hash('Admin@123',       10),
    bcrypt.hash('Organizer@123',   10),
    bcrypt.hash('Participant@123', 10),
  ]);

  // ══════════════════════════════════════════════════════════════════════════
  // 1. ADMIN
  // ══════════════════════════════════════════════════════════════════════════
  const admin = await prisma.user.upsert({
    where:  { email: 'admin@sympohub.edu' },
    update: {},
    create: {
      name:         'System Administrator',
      email:        'admin@sympohub.edu',
      passwordHash: adminPwd,
      role:         'ADMIN',
      college:      'SympoHub Central Office',
      phone:        '9998887770',
      isApproved:   true,
    },
  });
  console.log('✅  Admin:', admin.email);

  // ══════════════════════════════════════════════════════════════════════════
  // 2. ORGANIZERS  (3 colleges)
  // ══════════════════════════════════════════════════════════════════════════
  const orgBIT = await prisma.user.upsert({
    where:  { email: 'organizer.bit@sympohub.edu' },
    update: {},
    create: {
      name:         'Dr. R. Arunkumar',
      email:        'organizer.bit@sympohub.edu',
      passwordHash: orgPwd,
      role:         'ORGANIZER',
      college:      'Bannari Amman Institute of Technology',
      phone:        '9842100112',
      isApproved:   true,
      organizerProfile: {
        create: {
          department:  'Computer Science & Engineering',
          designation: 'Head of Symposium Committee',
          college:     'Bannari Amman Institute of Technology',
          phone:       '9842100112',
          status:      'APPROVED',
        },
      },
    },
  });
  console.log('✅  Organizer (BIT):', orgBIT.email);

  const orgPSG = await prisma.user.upsert({
    where:  { email: 'organizer.psg@sympohub.edu' },
    update: {},
    create: {
      name:         'Dr. K. Venkatesh',
      email:        'organizer.psg@sympohub.edu',
      passwordHash: orgPwd,
      role:         'ORGANIZER',
      college:      'PSG College of Technology',
      phone:        '9876500991',
      isApproved:   true,
      organizerProfile: {
        create: {
          department:  'Information Technology',
          designation: 'Symposium Coordinator',
          college:     'PSG College of Technology',
          phone:       '9876500991',
          status:      'APPROVED',
        },
      },
    },
  });
  console.log('✅  Organizer (PSG):', orgPSG.email);

  const orgSSN = await prisma.user.upsert({
    where:  { email: 'organizer.ssn@sympohub.edu' },
    update: {},
    create: {
      name:         'Prof. S. Meenakshisundaram',
      email:        'organizer.ssn@sympohub.edu',
      passwordHash: orgPwd,
      role:         'ORGANIZER',
      college:      'SSN College of Engineering',
      phone:        '9944332211',
      isApproved:   false,   // pending approval — useful for testing admin flow
      organizerProfile: {
        create: {
          department:  'Electronics & Communication',
          designation: 'Assistant Professor',
          college:     'SSN College of Engineering',
          phone:       '9944332211',
          status:      'PENDING',
        },
      },
    },
  });
  console.log('✅  Organizer (SSN, pending):', orgSSN.email);

  // ══════════════════════════════════════════════════════════════════════════
  // 3. PARTICIPANTS  (8 students across colleges)
  // ══════════════════════════════════════════════════════════════════════════
  const participantData = [
    { name: 'Tharun Adhithya S K', email: 'tharun@sympohub.edu',   college: 'Bannari Amman Institute of Technology', phone: '9123456781' },
    { name: 'Priya Dharshini',     email: 'priya@sympohub.edu',    college: 'PSG College of Technology',               phone: '9123456782' },
    { name: 'Arun Prasath',        email: 'arun@sympohub.edu',     college: 'Bannari Amman Institute of Technology',   phone: '9123456783' },
    { name: 'Kavitha Raj',         email: 'kavitha@sympohub.edu',  college: 'SSN College of Engineering',              phone: '9123456784' },
    { name: 'Mohammed Irfan',      email: 'irfan@sympohub.edu',    college: 'PSG College of Technology',               phone: '9123456785' },
    { name: 'Sneha Lakshmi',       email: 'sneha@sympohub.edu',    college: 'Amrita School of Engineering',            phone: '9123456786' },
    { name: 'Vikram Nair',         email: 'vikram@sympohub.edu',   college: 'SSN College of Engineering',              phone: '9123456787' },
    { name: 'Deepa Krishnan',      email: 'deepa@sympohub.edu',    college: 'Amrita School of Engineering',            phone: '9123456788' },
  ];

  const participants = [];
  for (const pd of participantData) {
    const p = await prisma.user.upsert({
      where:  { email: pd.email },
      update: {},
      create: { ...pd, passwordHash: partPwd, role: 'PARTICIPANT', isApproved: true },
    });
    participants.push(p);
  }
  console.log(`✅  ${participants.length} participants created.`);

  // ══════════════════════════════════════════════════════════════════════════
  // 4. SYMPOSIUMS  (2 full + 1 draft)
  // ══════════════════════════════════════════════════════════════════════════

  // ── 4a. TechFest 2026 (BIT) ─────────────────────────────────────────────
  let symBIT = await prisma.symposium.findFirst({ where: { title: 'TechFest 2026' } });
  if (!symBIT) {
    symBIT = await prisma.symposium.create({
      data: {
        title:       'TechFest 2026',
        description: 'National Level Technical Symposium — AI, Cloud, Cybersecurity, and Coding.',
        college:     'Bannari Amman Institute of Technology',
        venue:       'Main Auditorium & CS Block Labs',
        startDate:   new Date('2026-11-15T09:00:00Z'),
        endDate:     new Date('2026-11-16T17:00:00Z'),
        bannerUrl:   'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
        isPublished: true,
        isApproved:  true,
        organizerId: orgBIT.id,
        events: {
          create: [
            {
              title:               'Paper Presentation',
              category:            'Technical',
              description:         'Present research papers on AI, Cloud, and IoT in IEEE format.',
              venue:               'CS Seminar Hall 1',
              eventDate:           new Date('2026-11-15T10:00:00Z'),
              startTime:           '10:00 AM',
              endTime:             '01:00 PM',
              capacity:            50,
              fee:                 150.0,
              eligibility:         'UG / PG Engineering Students',
              rules:               '1. Max 3 members. 2. IEEE format. 3. 8 min presentation + 2 min Q&A.',
              registrationDeadline: new Date('2026-11-10T23:59:59Z'),
              isPublished:         true,
            },
            {
              title:               'Hackathon — CodeStrike',
              category:            'Technical',
              description:         '24-hour hackathon to build real-world solutions.',
              venue:               'Advanced AI Research Lab',
              eventDate:           new Date('2026-11-15T11:00:00Z'),
              startTime:           '11:00 AM',
              endTime:             '11:00 AM (Next Day)',
              capacity:            100,
              fee:                 300.0,
              eligibility:         'All Tech Students',
              rules:               '1. Teams of 2–4. 2. Fresh code only.',
              registrationDeadline: new Date('2026-11-10T23:59:59Z'),
              isPublished:         true,
            },
            {
              title:               'Speed Coding Contest',
              category:            'Coding',
              description:         'Algorithmic challenges in C++, Java, and Python.',
              venue:               'Computer Center 3',
              eventDate:           new Date('2026-11-16T09:30:00Z'),
              startTime:           '09:30 AM',
              endTime:             '12:00 PM',
              capacity:            80,
              fee:                 100.0,
              eligibility:         'Individual Entry',
              rules:               '1. No internet or AI tools.',
              registrationDeadline: new Date('2026-11-12T23:59:59Z'),
              isPublished:         true,
            },
            {
              title:               'Tech Brains Quiz',
              category:            'Quiz',
              description:         'Rapid-fire tech quiz covering history, logic, and emerging tech.',
              venue:               'Mechanical Seminar Hall',
              eventDate:           new Date('2026-11-15T14:00:00Z'),
              startTime:           '02:00 PM',
              endTime:             '04:00 PM',
              capacity:            60,
              fee:                 0.0,    // free event
              eligibility:         'Teams of 2',
              rules:               '1. Written prelims, then 5 live stage rounds.',
              isPublished:         true,
            },
            {
              title:               'Project Expo',
              category:            'Technical',
              description:         'Exhibit working prototypes to industry expert judges.',
              venue:               'College Quadrangle',
              eventDate:           new Date('2026-11-16T10:00:00Z'),
              startTime:           '10:00 AM',
              endTime:             '03:00 PM',
              capacity:            40,
              fee:                 200.0,
              eligibility:         'Polytechnic & Engineering Students',
              rules:               '1. Working demo mandatory. 2. Power outlet provided.',
              isPublished:         true,
            },
          ],
        },
      },
      include: { events: true },
    });
    console.log(`✅  TechFest 2026 (BIT) — ${symBIT.events.length} events.`);
  } else {
    symBIT = await prisma.symposium.findFirst({ where: { title: 'TechFest 2026' }, include: { events: true } });
    console.log('ℹ️   TechFest 2026 already exists.');
  }

  // ── 4b. InnovatePSG 2026 (PSG) ──────────────────────────────────────────
  let symPSG = await prisma.symposium.findFirst({ where: { title: 'InnovatePSG 2026' } });
  if (!symPSG) {
    symPSG = await prisma.symposium.create({
      data: {
        title:       'InnovatePSG 2026',
        description: "PSG's flagship tech festival celebrating innovation, robotics, and design.",
        college:     'PSG College of Technology',
        venue:       'PSG Main Campus — Blocks A & B',
        startDate:   new Date('2026-12-05T09:00:00Z'),
        endDate:     new Date('2026-12-06T17:00:00Z'),
        bannerUrl:   'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=1200',
        isPublished: true,
        isApproved:  true,
        organizerId: orgPSG.id,
        events: {
          create: [
            {
              title:               'Robo Wars',
              category:            'Technical',
              description:         'Battle robots designed by student teams in an arena combat.',
              venue:               'PSG Sports Ground Arena',
              eventDate:           new Date('2026-12-05T10:00:00Z'),
              startTime:           '10:00 AM',
              endTime:             '05:00 PM',
              capacity:            30,
              fee:                 500.0,
              eligibility:         'Teams of 3–5',
              rules:               '1. Bot weight ≤ 10 kg. 2. No sharp metal protrusions.',
              registrationDeadline: new Date('2026-11-28T23:59:59Z'),
              isPublished:         true,
            },
            {
              title:               'UI/UX Design Challenge',
              category:            'Workshop',
              description:         'Design intuitive mobile interfaces for real startup briefs in 4 hours.',
              venue:               'PSG Design Lab',
              eventDate:           new Date('2026-12-05T13:00:00Z'),
              startTime:           '01:00 PM',
              endTime:             '05:00 PM',
              capacity:            50,
              fee:                 120.0,
              eligibility:         'Open to All',
              rules:               '1. Figma or Adobe XD only. 2. Individual entry.',
              isPublished:         true,
            },
            {
              title:               'GenAI & LLM Workshop',
              category:            'Workshop',
              description:         'Hands-on session: build autonomous agents and fine-tune open-source LLMs.',
              venue:               'PSG Auditorium — Conference Room B',
              eventDate:           new Date('2026-12-06T09:30:00Z'),
              startTime:           '09:30 AM',
              endTime:             '01:00 PM',
              capacity:            120,
              fee:                 250.0,
              eligibility:         'Open to All',
              rules:               '1. Bring laptop with Python installed.',
              isPublished:         true,
            },
          ],
        },
      },
      include: { events: true },
    });
    console.log(`✅  InnovatePSG 2026 — ${symPSG.events.length} events.`);
  } else {
    symPSG = await prisma.symposium.findFirst({ where: { title: 'InnovatePSG 2026' }, include: { events: true } });
    console.log('ℹ️   InnovatePSG 2026 already exists.');
  }

  // ── 4c. CircuiTech (SSN) — draft, not published ──────────────────────────
  let symSSN = await prisma.symposium.findFirst({ where: { title: 'CircuiTech 2026' } });
  if (!symSSN) {
    symSSN = await prisma.symposium.create({
      data: {
        title:       'CircuiTech 2026',
        description: 'SSN Annual Electronics & Communication festival.',
        college:     'SSN College of Engineering',
        venue:       'SSN ECE Block & Auditorium',
        startDate:   new Date('2027-01-20T09:00:00Z'),
        endDate:     new Date('2027-01-21T17:00:00Z'),
        isPublished: false,   // draft — organizer is still pending approval
        isApproved:  false,
        organizerId: orgSSN.id,
        events: {
          create: [
            {
              title:      'PCB Design Contest',
              category:   'Technical',
              description: 'Design and present a PCB circuit solving a given electronics problem.',
              venue:       'SSN ECE Lab 2',
              eventDate:   new Date('2027-01-20T10:00:00Z'),
              startTime:  '10:00 AM',
              endTime:    '01:00 PM',
              capacity:   40,
              fee:        180.0,
              eligibility: 'ECE / EEE Students',
              isPublished: false,
            },
          ],
        },
      },
      include: { events: true },
    });
    console.log(`✅  CircuiTech 2026 (SSN, draft) — ${symSSN.events.length} events.`);
  } else {
    symSSN = await prisma.symposium.findFirst({ where: { title: 'CircuiTech 2026' }, include: { events: true } });
    console.log('ℹ️   CircuiTech 2026 already exists.');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 5. REGISTRATIONS, PAYMENTS & ATTENDANCE  (BIT events only — organizer approved)
  // ══════════════════════════════════════════════════════════════════════════
  const bitEvents = symBIT.events;
  // Convenience: get event by title
  const bitEvent = (title) => bitEvents.find((e) => e.title === title);

  const paperPres  = bitEvent('Paper Presentation');
  const hackathon  = bitEvent('Hackathon — CodeStrike');
  const speedCode  = bitEvent('Speed Coding Contest');
  const quiz       = bitEvent('Tech Brains Quiz');
  const projExpo   = bitEvent('Project Expo');

  // Registrations plan:
  //   participants[0] Tharun    → paperPres (paid, attended), hackathon (paid, attended), quiz (free, attended)
  //   participants[1] Priya     → paperPres (paid, attended), speedCode (paid, not attended), projExpo (paid, not attended)
  //   participants[2] Arun      → hackathon (paid, attended), quiz (free, attended)
  //   participants[3] Kavitha   → speedCode (paid, attended), projExpo (paid, attended)
  //   participants[4] Irfan     → paperPres (paid, not attended), quiz (free, not attended)
  //   participants[5] Sneha     → hackathon (paid, attended), projExpo (paid, not attended)
  //   participants[6] Vikram    → quiz (free, attended), speedCode (paid, attended)
  //   participants[7] Deepa     → paperPres (paid, attended)

  const regPlan = [
    // [userId, event, paymentStatus, markAttendance]
    [participants[0], paperPres,  'COMPLETED', true ],
    [participants[0], hackathon,  'COMPLETED', true ],
    [participants[0], quiz,       'EXEMPT',    true ],
    [participants[1], paperPres,  'COMPLETED', true ],
    [participants[1], speedCode,  'COMPLETED', false],
    [participants[1], projExpo,   'COMPLETED', false],
    [participants[2], hackathon,  'COMPLETED', true ],
    [participants[2], quiz,       'EXEMPT',    true ],
    [participants[3], speedCode,  'COMPLETED', true ],
    [participants[3], projExpo,   'COMPLETED', true ],
    [participants[4], paperPres,  'COMPLETED', false],
    [participants[4], quiz,       'EXEMPT',    false],
    [participants[5], hackathon,  'COMPLETED', true ],
    [participants[5], projExpo,   'COMPLETED', false],
    [participants[6], quiz,       'EXEMPT',    true ],
    [participants[6], speedCode,  'COMPLETED', true ],
    [participants[7], paperPres,  'COMPLETED', true ],
  ];

  let regsCreated = 0;
  for (const [user, event, payStatus, doAttend] of regPlan) {
    if (!event) continue; // guard against missing event in seed

    // Skip if registration already exists
    const existing = await prisma.registration.findUnique({
      where: { userId_eventId: { userId: user.id, eventId: event.id } },
    });
    if (existing) continue;

    const isPaid = payStatus !== 'EXEMPT';
    const regStatus = isPaid ? 'CONFIRMED' : 'CONFIRMED'; // free events confirm immediately

    const reg = await prisma.registration.create({
      data: {
        userId:        user.id,
        eventId:       event.id,
        status:        regStatus,
        paymentStatus: payStatus,
        ticketCode:    ticketCode(),
      },
    });
    regsCreated++;

    // Payment record for paid events
    if (isPaid) {
      await prisma.payment.upsert({
        where:  { registrationId: reg.id },
        update: {},
        create: {
          registrationId: reg.id,
          amount:         event.fee,
          status:         'COMPLETED',
        },
      });
    }

    // Attendance
    if (doAttend) {
      await prisma.attendance.upsert({
        where:  { registrationId: reg.id },
        update: {},
        create: {
          registrationId: reg.id,
          eventId:        event.id,
          userId:         user.id,
          markedByUserId: orgBIT.id,
          method:         'QR',
        },
      });
    }
  }
  console.log(`✅  ${regsCreated} new registrations created with payments & attendance.`);

  // ══════════════════════════════════════════════════════════════════════════
  // 6. CERTIFICATE TEMPLATE for BIT
  // ══════════════════════════════════════════════════════════════════════════
  const tmplExists = await prisma.certificateTemplate.findFirst({
    where: { symposiumId: symBIT.id },
  });
  if (!tmplExists) {
    await prisma.certificateTemplate.create({
      data: {
        symposiumId:     symBIT.id,
        title:           'Certificate of Participation',
        contentTemplate: 'This is to certify that {{participantName}} has successfully participated in {{eventName}} at {{symposiumName}}.',
        signatoryName:   'Dr. R. Arunkumar',
        signatoryTitle:  'Symposium Convener & HOD, CSE',
      },
    });
    console.log('✅  Certificate template created for TechFest 2026.');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 7. CERTIFICATES for participants who attended
  // ══════════════════════════════════════════════════════════════════════════
  // Re-fetch attended registrations
  const attendedRegs = await prisma.registration.findMany({
    where: {
      event:      { symposiumId: symBIT.id },
      attendance: { isNot: null },
      status:     'CONFIRMED',
    },
    include: { attendance: true },
  });

  let certsCreated = 0;
  for (const reg of attendedRegs) {
    const exists = await prisma.certificate.findUnique({ where: { registrationId: reg.id } });
    if (exists) continue;

    await prisma.certificate.create({
      data: {
        registrationId:  reg.id,
        userId:          reg.userId,
        eventId:         reg.eventId,
        certificateCode: certCode(),
        qrCodeData:      `CERT-VERIFY:${reg.id}`,
      },
    });
    certsCreated++;
  }
  console.log(`✅  ${certsCreated} certificates issued.`);

  // ══════════════════════════════════════════════════════════════════════════
  // Summary
  // ══════════════════════════════════════════════════════════════════════════
  console.log(`
╔══════════════════════════════════════════════════════╗
║           🎉  Seed completed successfully!           ║
╠══════════════════════════════════════════════════════╣
║  LOGIN CREDENTIALS                                   ║
║                                                      ║
║  Admin                                               ║
║    Email:    admin@sympohub.edu                      ║
║    Password: Admin@123                               ║
║                                                      ║
║  Organizer — BIT (approved)                          ║
║    Email:    organizer.bit@sympohub.edu              ║
║    Password: Organizer@123                           ║
║                                                      ║
║  Organizer — PSG (approved)                          ║
║    Email:    organizer.psg@sympohub.edu              ║
║    Password: Organizer@123                           ║
║                                                      ║
║  Organizer — SSN (pending approval)                  ║
║    Email:    organizer.ssn@sympohub.edu              ║
║    Password: Organizer@123                           ║
║                                                      ║
║  Participants (password: Participant@123)            ║
║    tharun@sympohub.edu   priya@sympohub.edu          ║
║    arun@sympohub.edu     kavitha@sympohub.edu        ║
║    irfan@sympohub.edu    sneha@sympohub.edu          ║
║    vikram@sympohub.edu   deepa@sympohub.edu          ║
╚══════════════════════════════════════════════════════╝
`);
}

main()
  .catch((e) => {
    console.error('❌  Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
