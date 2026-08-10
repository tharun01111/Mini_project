import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash shared default passwords
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const organizerPassword = await bcrypt.hash('Organizer@123', 10);
  const participantPassword = await bcrypt.hash('Participant@123', 10);

  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@symposium.edu' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@symposium.edu',
      passwordHash: adminPassword,
      role: 'ADMIN',
      college: 'Symposium Central Office',
      phone: '9998887770',
      isApproved: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // 2. Create Approved Organizer
  const organizer = await prisma.user.upsert({
    where: { email: 'organizer@symposium.edu' },
    update: {},
    create: {
      name: 'Dr. R. Arunkumar',
      email: 'organizer@symposium.edu',
      passwordHash: organizerPassword,
      role: 'ORGANIZER',
      college: 'Bannari Amman Institute of Technology',
      phone: '9842100112',
      isApproved: true,
      organizerProfile: {
        create: {
          department: 'Computer Science & Engineering',
          designation: 'Head of Symposium Committee',
          college: 'Bannari Amman Institute of Technology',
          phone: '9842100112',
          status: 'APPROVED',
        },
      },
    },
  });
  console.log('✅ Approved Organizer user created:', organizer.email);

  // 3. Create Pending Organizer
  const pendingOrganizer = await prisma.user.upsert({
    where: { email: 'pending_organizer@symposium.edu' },
    update: {},
    create: {
      name: 'Prof. K. Venkatesh',
      email: 'pending_organizer@symposium.edu',
      passwordHash: organizerPassword,
      role: 'ORGANIZER',
      college: 'PSG College of Technology',
      phone: '9876500991',
      isApproved: false,
      organizerProfile: {
        create: {
          department: 'Information Technology',
          designation: 'Assistant Professor',
          college: 'PSG College of Technology',
          phone: '9876500991',
          status: 'PENDING',
        },
      },
    },
  });
  console.log('✅ Pending Organizer user created:', pendingOrganizer.email);

  // 4. Create Participant
  const participant = await prisma.user.upsert({
    where: { email: 'participant@symposium.edu' },
    update: {},
    create: {
      name: 'Tharun Adhithya',
      email: 'participant@symposium.edu',
      passwordHash: participantPassword,
      role: 'PARTICIPANT',
      college: 'Bannari Amman Institute of Technology',
      phone: '9123456789',
      isApproved: true,
    },
  });
  console.log('✅ Participant user created:', participant.email);

  // 5. Create Flagship Symposium: TechFest 2026
  const existingSymposium = await prisma.symposium.findFirst({
    where: { title: 'TechFest 2026' },
  });

  let symposium;
  if (!existingSymposium) {
    symposium = await prisma.symposium.create({
      data: {
        title: 'TechFest 2026',
        description: 'National Level Technical Symposium showcasing innovation, paper presentations, coding battles, and hands-on AI workshops.',
        college: 'Bannari Amman Institute of Technology',
        venue: 'Main Auditorium & CS Block Labs',
        startDate: new Date('2026-09-15T09:00:00Z'),
        endDate: new Date('2026-09-16T17:00:00Z'),
        bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
        isPublished: true,
        isApproved: true,
        organizerId: organizer.id,
        events: {
          create: [
            {
              title: 'Paper Presentation',
              category: 'Technical',
              description: 'Present innovative research papers on Artificial Intelligence, Cloud Computing, Cybersecurity, and IoT.',
              venue: 'CS Seminar Hall 1',
              eventDate: new Date('2026-09-15T10:00:00Z'),
              startTime: '10:00 AM',
              endTime: '01:00 PM',
              capacity: 50,
              fee: 150.0,
              eligibility: 'UG / PG Engineering Students',
              rules: '1. Max 3 members per team. 2. IEEE format required. 3. 8 mins presentation + 2 mins Q&A.',
              isPublished: true,
            },
            {
              title: 'Hackathon - CodeStrike',
              category: 'Technical',
              description: '24-hour intense hackathon to build solutions for real-world campus & industrial challenges.',
              venue: 'Advanced AI Research Lab',
              eventDate: new Date('2026-09-15T11:00:00Z'),
              startTime: '11:00 AM',
              endTime: '11:00 AM (Next Day)',
              capacity: 100,
              fee: 300.0,
              eligibility: 'All Tech Students',
              rules: '1. Teams of 2 to 4 members. 2. Fresh code development starting at hackathon launch.',
              isPublished: true,
            },
            {
              title: 'Speed Coding Contest',
              category: 'Coding',
              description: 'Competitive programming contest with algorithmic challenges in C++, Java, and Python.',
              venue: 'Computer Center 3',
              eventDate: new Date('2026-09-16T09:30:00Z'),
              startTime: '09:30 AM',
              endTime: '12:00 PM',
              capacity: 80,
              fee: 100.0,
              eligibility: 'Individual Entry',
              rules: '1. Individual participation only. 2. Strictly no internet or AI assistants permitted.',
              isPublished: true,
            },
            {
              title: 'Project Expo',
              category: 'Technical',
              description: 'Exhibit hardware & software working prototypes to industry expert judges.',
              venue: 'College Quadrangle Exhibition Center',
              eventDate: new Date('2026-09-16T10:00:00Z'),
              startTime: '10:00 AM',
              endTime: '03:00 PM',
              capacity: 40,
              fee: 200.0,
              eligibility: 'Polytechnic & Engineering Students',
              rules: '1. Poster and working demo mandatory. 2. Power outlet will be provided.',
              isPublished: true,
            },
            {
              title: 'Generative AI & LLM Workshop',
              category: 'Workshop',
              description: 'Hands-on practical session building autonomous agents and fine-tuning models.',
              venue: 'Auditorium Conference Room B',
              eventDate: new Date('2026-09-16T01:30:00Z'),
              startTime: '01:30 PM',
              endTime: '04:30 PM',
              capacity: 120,
              fee: 250.0,
              eligibility: 'Open to All',
              rules: '1. Bring your own laptop with Node.js / Python installed. Certificate provided.',
              isPublished: true,
            },
            {
              title: 'Tech Brains Quiz',
              category: 'Quiz',
              description: 'Rapid fire technical quiz covering tech history, logic, puzzles, and emerging technology.',
              venue: 'Mechanical Seminar Hall',
              eventDate: new Date('2026-09-15T02:00:00Z'),
              startTime: '02:00 PM',
              endTime: '04:00 PM',
              capacity: 60,
              fee: 50.0,
              eligibility: 'Teams of 2',
              rules: '1. Preliminary written round followed by 5 live stage rounds.',
              isPublished: true,
            },
          ],
        },
      },
      include: { events: true },
    });
    console.log('✅ TechFest 2026 Symposium created with', symposium.events.length, 'events!');
  } else {
    console.log('ℹ️ TechFest 2026 Symposium already exists.');
  }

  console.log('\n🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
