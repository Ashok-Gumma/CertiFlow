import { PrismaClient, Role, BatchStatus, ApprovalDecision, CertificateStatus, DeliveryStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { PdfService } from '../src/services/pdfService';

const prisma = new PrismaClient();

async function main() {
  console.log('--- SEEDING CERTIFLOW DATABASE (ALL-INDIA NATIONAL ACCREDITED DATASET) ---');

  // Clean existing data in reverse dependency order
  await prisma.outboxEvent.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.user.deleteMany();
  await prisma.trainingCentre.deleteMany();
  await prisma.district.deleteMany();

  // 1. Create 12 Sovereign Districts across All Regions of India
  const distDelhi = await prisma.district.create({
    data: { name: 'New Delhi Central', code: 'DL-CEN' },
  });
  const distMumbai = await prisma.district.create({
    data: { name: 'Mumbai Metropolitan', code: 'MH-MUM' },
  });
  const distBlr = await prisma.district.create({
    data: { name: 'Bengaluru Central', code: 'KA-BLR' },
  });
  const distHyd = await prisma.district.create({
    data: { name: 'Hyderabad Urban', code: 'TS-HYD' },
  });
  const distChn = await prisma.district.create({
    data: { name: 'Chennai South', code: 'TN-CHN' },
  });
  const distKol = await prisma.district.create({
    data: { name: 'Kolkata North', code: 'WB-KOL' },
  });
  const distPun = await prisma.district.create({
    data: { name: 'Pune District', code: 'MH-PUN' },
  });
  const distAhm = await prisma.district.create({
    data: { name: 'Ahmedabad Urban', code: 'GJ-AHM' },
  });
  const distJai = await prisma.district.create({
    data: { name: 'Jaipur District', code: 'RJ-JAI' },
  });
  const distGhy = await prisma.district.create({
    data: { name: 'Guwahati Kamrup', code: 'AS-GHY' },
  });
  const distBbi = await prisma.district.create({
    data: { name: 'Bhubaneswar Khordha', code: 'OD-BBI' },
  });
  const distLko = await prisma.district.create({
    data: { name: 'Lucknow Central', code: 'UP-LKO' },
  });

  console.log('✓ Created 12 Sovereign Districts across All-India');

  // 2. Create 12 Premier Accredited National Training Institutes all across India
  const tcDelhi = await prisma.trainingCentre.create({
    data: {
      name: 'National Skill Training Institute (NSTI Central)',
      code: 'NSTI-IND-001',
      districtId: distDelhi.id,
    },
  });

  const tcMumbai = await prisma.trainingCentre.create({
    data: {
      name: 'Advanced Technology Institute (ATI Mumbai)',
      code: 'ATI-IND-002',
      districtId: distMumbai.id,
    },
  });

  const tcBlr = await prisma.trainingCentre.create({
    data: {
      name: 'National Vocational Training Academy',
      code: 'NVTA-IND-003',
      districtId: distBlr.id,
    },
  });

  const tcHyd = await prisma.trainingCentre.create({
    data: {
      name: 'Indian Institute of Digital Skills',
      code: 'IIDS-IND-004',
      districtId: distHyd.id,
    },
  });

  const tcChn = await prisma.trainingCentre.create({
    data: {
      name: 'Centre for Advanced Vocational Excellence',
      code: 'CAVE-IND-005',
      districtId: distChn.id,
    },
  });

  const tcKol = await prisma.trainingCentre.create({
    data: {
      name: 'Eastern Regional Vocational Institute',
      code: 'ERVI-IND-006',
      districtId: distKol.id,
    },
  });

  const tcPun = await prisma.trainingCentre.create({
    data: {
      name: 'National Polytechnic & Industrial Training Hub',
      code: 'NPIT-IND-007',
      districtId: distPun.id,
    },
  });

  const tcAhm = await prisma.trainingCentre.create({
    data: {
      name: 'Gujarat Skill Development Institute',
      code: 'GSDI-IND-008',
      districtId: distAhm.id,
    },
  });

  const tcJai = await prisma.trainingCentre.create({
    data: {
      name: 'Rajasthan Institute of Technical Trades',
      code: 'RITT-IND-009',
      districtId: distJai.id,
    },
  });

  const tcGhy = await prisma.trainingCentre.create({
    data: {
      name: 'North-East Skill Development Centre',
      code: 'NESD-IND-010',
      districtId: distGhy.id,
    },
  });

  const tcBbi = await prisma.trainingCentre.create({
    data: {
      name: 'Odisha Vocational & Applied Technology Centre',
      code: 'OVAT-IND-011',
      districtId: distBbi.id,
    },
  });

  const tcLko = await prisma.trainingCentre.create({
    data: {
      name: 'National Apprenticeship Training Institute',
      code: 'NATI-IND-012',
      districtId: distLko.id,
    },
  });

  console.log('✓ Created 12 Accredited National Training Centres across All-India');

  // 3. Create Institutional System Users (6 Official Personas)
  const passwordHash = await bcrypt.hash('CertiFlow@2026', 10);

  const userAnika = await prisma.user.create({
    data: {
      name: 'Anika',
      email: 'anika@certiflow.gov.in',
      passwordHash,
      role: Role.TRAINING_CENTRE,
      districtId: distDelhi.id,
      trainingCentreId: tcDelhi.id,
    },
  });

  const userDev = await prisma.user.create({
    data: {
      name: 'Dev',
      email: 'dev@certiflow.gov.in',
      passwordHash,
      role: Role.DISTRICT_OFFICER,
      districtId: distDelhi.id,
    },
  });

  const userMeera = await prisma.user.create({
    data: {
      name: 'Meera',
      email: 'meera@certiflow.gov.in',
      passwordHash,
      role: Role.DISTRICT_OFFICER,
      districtId: distDelhi.id,
    },
  });

  const userKabir = await prisma.user.create({
    data: {
      name: 'Kabir',
      email: 'kabir@certiflow.gov.in',
      passwordHash,
      role: Role.DISTRICT_OFFICER,
      districtId: distDelhi.id,
    },
  });

  const userNeha = await prisma.user.create({
    data: {
      name: 'Neha',
      email: 'neha@certiflow.gov.in',
      passwordHash,
      role: Role.QUALITY_TEAM,
    },
  });

  const userFarah = await prisma.user.create({
    data: {
      name: 'Farah',
      email: 'farah@certiflow.gov.in',
      passwordHash,
      role: Role.STATE_OFFICE,
    },
  });

  console.log('✓ Created 6 Demo Users (Anika, Dev, Meera, Kabir, Neha, Farah)');

  // Master Pool of Authentic Candidate Names
  const indianNames = [
    'Aarav Sharma', 'Priya Patel', 'Rohan Nair', 'Sneha Reddy', 'Aditya Verma',
    'Ananya Iyer', 'Vikram Malhotra', 'Pooja Joshi', 'Rahul Deshmukh', 'Neha Choudhury',
    'Karan Mehta', 'Divya Sundaram', 'Siddharth Rao', 'Kavita Menon', 'Manish Gupta',
    'Sunita Kulkarni', 'Arjun Saxena', 'Ritu Aggarwal', 'Deepak Tiwari', 'Megha Bhatt',
    'Vivek Pandey', 'Swati Mishra', 'Nikhil Chawla', 'Shreya Sengupta', 'Gaurav Gill',
    'Preeti Chauhan', 'Varun Kapoor', 'Aakanksha Kaul', 'Abhishek Das', 'Tanvi Singhania',
    'Harish Pillai', 'Bhavna Hegde', 'Suresh Nambiar', 'Jyoti Prasad', 'Amitabh Sanyal',
    'Rashmi Goswami', 'Tarun Sethi', 'Pallavi Sen', 'Naveen Kurup', 'Simran Bedi',
    'Dinesh Solanki', 'Garima Mittal', 'Sachin Dubey', 'Alka Thakur', 'Rupesh Yadav',
    'Smriti Mukherjee', 'Pranav Kothari', 'Monika Varma', 'Ajay Tripathi', 'Aarti Saxena',
    'Hemant Rawat', 'Komal Bansal', 'Rajesh Mahajan', 'Vandana Shukla', 'Sameer Bhatia',
    'Priyanka Kaushik', 'Chirag Parekh', 'Isha Goel', 'Ashok Menon', 'Shalini Jain',
    'Manoj Badiger', 'Chethana Gowda', 'Raghavendra Joshi', 'Soumya Kulal', 'Pradeep Nayak',
    'Tejaswini Patil', 'Vignesh Bhat', 'Anuradha Kamath', 'Santosh Poojary', 'Akshatha Prabhu',
    'Naveen Karkera', 'Rekha Moolya', 'Girish Devadiga', 'Lavanya Shenoy', 'Bharath Shetty',
    'Roopa Acharya', 'Yogesh Salian', 'Vidya Suvarna', 'Kiran Anchan', 'Nisha Mendon',
    'Santhosh Rao', 'Shwetha Alva', 'Praveen Kotian', 'Keerthana Kundar', 'Ganesh Maroli',
    'Sunil Ullal', 'Deepa Dsouza', 'Roshan Fernandes', 'Archana Pais', 'Nitin Mendonca',
    'Basavaraj Bommai', 'Mallikarjun Hiremath', 'Sharanappa Patil', 'Danamma Kotur', 'Veeranna Goudar',
    'Gangamma Talawar', 'Sangamesh Pujar', 'Kashinath Katti', 'Shruti Harlapur', 'Annapurna Kulkarni',
    'Basalingappa Badiger', 'Kavitha Kamatar', 'Manjunath Angadi', 'Savitri Hallur', 'Shivaputra Meti',
    'Mahantesh Gani', 'Renuka Giddappanavar', 'Chandrashekhar Belagavi', 'Jayashree Doddamani', 'Basavaraj Kattimani',
    'Khadir Pasha', 'Sultana Begum', 'Mohammed Rafiq', 'Farzana Anjum', 'Syed Zameer',
    'Ayesha Siddiqua', 'Imran Khan', 'Nasreen Taj', 'Abdul Majeed', 'Sameena Banu',
    'Tanveer Ahmed', 'Rehana Parveen', 'Zubair Hussain', 'Shabana Khatoon', 'Waseem Akram',
    'Tasneem Kausar', 'Riyaz Ur Rehman', 'Salma Fathima', 'Mudassir Pasha', 'Shaheen Taj',
    'Karthik Raja', 'Nandini Swaminathan', 'Arvind Shenoy', 'Meenakshi Iyer', 'Sanjay Hegde',
    'Anjali Krishnan', 'Hariprasad Acharya', 'Deepika Bhat', 'Naveen Chandra', 'Madhuri Dixit',
    'Lokesh Kumaran', 'Sowmya Murthy', 'Chidanand Gowda', 'Pavithra Kumar', 'Ramesh Achar',
    'Anupama Shenoy', 'Kishore Prabhu', 'Geetha Namboodiri', 'Somashekhar Rao', 'Usha Varma',
    'Harish Nayak', 'Shilpa Shetty', 'Prashanth Hegde', 'Meghana Rao', 'Sujay Devadiga',
    'Poonam Soni', 'Gopalakrishna Bhat', 'Anand Kulkarni', 'Sangeetha Rao', 'Vinayaka Shenoy',
    'Niranjan Kumar', 'Sharanya Shenoy', 'Srinivas Prabhu', 'Chithra Kamath', 'Balaram Acharya',
    'Jayanth Shetty', 'Bhavani Shankar', 'Subhashini Rao', 'Manjula Nayak', 'Ravi Shankar',
    'Kusuma Gowda', 'Sudhir Shenoy', 'Shaila Prabhu', 'Narendra Pai', 'Vani Acharya',
    'Ashok Shenoy', 'Roopa Pai', 'Mohan Kamath', 'Shobha Acharya', 'Dhananjay Bhat',
    'Suchitra Rao', 'Girish Pai', 'Aparna Shenoy', 'Vijayendra Acharya', 'Leelavathi Prabhu',
    'Nataraj Kamath', 'Savitha Bhat', 'Dileep Shenoy', 'Mamatha Acharya', 'Sudarshan Pai',
    'Hema Kamath', 'Bhaskara Bhat', 'Sunanda Shenoy', 'Nagesh Acharya', 'Padmavathi Prabhu',
    'Venkatesh Kamath', 'Radha Bhat', 'Govinda Shenoy', 'Gayathri Acharya', 'Damodar Pai',
    'Indira Kamath', 'Ananthakrishna Bhat', 'Pushpa Shenoy', 'Ramachandra Acharya', 'Shanthi Prabhu',
    'Krishnamurthy Kamath', 'Devaki Bhat', 'Gopinath Shenoy', 'Saraswathi Acharya', 'Lakshminarayana Pai',
    'Vasanthi Kamath', 'Satyanarayana Bhat', 'Kalyani Shenoy', 'Purushothama Acharya', 'Bharathi Prabhu',
    'Raghurama Kamath', 'Malathi Bhat', 'Shankaranarayana Shenoy', 'Seethalakshmi Acharya', 'Chidambara Pai'
  ];

  let nameIndex = 0;
  function getNextNames(count: number): string[] {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      list.push(indianNames[nameIndex % indianNames.length]);
      nameIndex++;
    }
    return list;
  }

  // Ensure certificates directory exists
  const certDir = path.resolve(__dirname, '../uploads/certificates');
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
  }

  // --- BATCH 1: Java Enterprise Full Stack (50 Candidates, SUBMITTED - Awaiting District Review) ---
  const batch1 = await prisma.batch.create({
    data: {
      batchNumber: 'CF/2026/JAVA/001',
      batchName: 'Java Enterprise Full Stack Development (Cohort 2026-A)',
      courseName: 'Java Enterprise Full Stack Development',
      courseCode: 'JAVA',
      trainingCentreId: tcDelhi.id,
      districtId: distDelhi.id,
      candidateCount: 50,
      status: BatchStatus.SUBMITTED,
      approvalCycle: 1,
      submittedAt: new Date(Date.now() - 3600000 * 2),
      trainingStartDate: new Date('2026-01-10'),
      trainingEndDate: new Date('2026-04-10'),
    },
  });

  const b1Names = getNextNames(50);
  await prisma.candidate.createMany({
    data: b1Names.map((name, i) => ({
      batchId: batch1.id,
      name,
      phone: `+919876543${String(i + 1).padStart(3, '0')}`,
      email: `${name.toLowerCase().replace(/[^a-z]/g, '')}${i + 1}@example.com`,
      courseName: 'Java Enterprise Full Stack Development',
    })),
  });
  console.log('✓ Batch 1: Created (50 Candidates, SUBMITTED - In Dev\'s District Queue)');

  // --- BATCH 2: Cloud Infrastructure & DevOps (35 Candidates, DISTRICT_REVIEW - Dev has signed off, Meera/Kabir need to sign) ---
  const batch2 = await prisma.batch.create({
    data: {
      batchNumber: 'CF/2026/CLOUD/002',
      batchName: 'Cloud Infrastructure & DevOps Engineering 2026',
      courseName: 'Cloud Infrastructure & DevOps Engineering',
      courseCode: 'CLOUD',
      trainingCentreId: tcMumbai.id,
      districtId: distMumbai.id,
      candidateCount: 35,
      status: BatchStatus.DISTRICT_REVIEW,
      approvalCycle: 1,
      submittedAt: new Date(Date.now() - 3600000 * 18),
      trainingStartDate: new Date('2025-11-01'),
      trainingEndDate: new Date('2026-02-28'),
    },
  });

  const b2Names = getNextNames(35);
  await prisma.candidate.createMany({
    data: b2Names.map((name, i) => ({
      batchId: batch2.id,
      name,
      phone: `+919811223${String(i + 1).padStart(3, '0')}`,
      email: `${name.toLowerCase().replace(/[^a-z]/g, '')}${i + 1}@example.com`,
      courseName: 'Cloud Infrastructure & DevOps Engineering',
    })),
  });

  // Dev signed off on Batch 2 (1 of 2 district approvals done)
  await prisma.approval.create({
    data: {
      batchId: batch2.id,
      officerId: userDev.id,
      role: Role.DISTRICT_OFFICER,
      decision: ApprovalDecision.APPROVED,
      comments: 'Candidate attendance registers and practical labs verified. First district sign-off granted.',
      approvalCycle: 1,
    },
  });
  console.log('✓ Batch 2: Created (35 Candidates, DISTRICT_REVIEW - 1 of 2 Sign-offs complete)');

  // --- BATCH 3: Cloud Infrastructure (25 Candidates, APPROVED with Official Certificates & Deliveries) ---
  const batch3 = await prisma.batch.create({
    data: {
      batchNumber: 'CF/2026/CLOUD/11/00014',
      batchName: 'Cloud Infrastructure Engineering Cohort 2026',
      courseName: 'Cloud Infrastructure & DevOps Engineering',
      courseCode: 'CLOUD',
      trainingCentreId: tcBlr.id,
      districtId: distBlr.id,
      candidateCount: 25,
      status: BatchStatus.APPROVED,
      approvalCycle: 1,
      submittedAt: new Date(Date.now() - 3600000 * 48),
      trainingStartDate: new Date('2025-10-01'),
      trainingEndDate: new Date('2026-01-30'),
    },
  });

  const b3Names = getNextNames(25);
  const candidatesBatch3 = [];
  for (let i = 0; i < 25; i++) {
    const c = await prisma.candidate.create({
      data: {
        batchId: batch3.id,
        name: b3Names[i],
        phone: `+919845001${String(i + 1).padStart(3, '0')}`,
        email: `${b3Names[i].toLowerCase().replace(/[^a-z]/g, '')}${i + 10}@example.com`,
        courseName: 'Cloud Infrastructure & DevOps Engineering',
      },
    });
    candidatesBatch3.push(c);
  }

  // Issue Certificates & Deliveries for Batch 3
  for (let i = 0; i < candidatesBatch3.length; i++) {
    const candidate = candidatesBatch3[i];
    const certNum = `CF/2026/CLOUD/11/${String(i + 1401).padStart(7, '0')}`;
    const hash = `hash_${Math.random().toString(36).substring(2)}${Date.now()}`;
    const pdfRelativePath = `certificates/${certNum.replace(/\//g, '_')}.pdf`;
    const pdfAbsolutePath = path.resolve(__dirname, `../uploads/${pdfRelativePath}`);

    const cert = await prisma.certificate.create({
      data: {
        certificateNumber: certNum,
        candidateId: candidate.id,
        batchId: batch3.id,
        filePath: pdfRelativePath,
        status: CertificateStatus.VALID,
        issueDate: new Date(),
      },
    });

    try {
      await PdfService.generateCertificatePdf({
        outputPath: pdfAbsolutePath,
        certificateNumber: certNum,
        candidateName: candidate.name,
        courseName: 'Cloud Infrastructure & DevOps Engineering',
        trainingCentreName: tcBlr.name,
        batchNumber: batch3.batchNumber,
        issueDate: '21 Nov 2026',
        verificationUrl: `http://localhost:5173/verify/${encodeURIComponent(certNum)}`,
      });
    } catch (e) {
      // Continue if PDF generation skipped
    }

    // Delivery records (simulate 1 failed out of 25)
    const isFailed = i === 24;
    await prisma.delivery.create({
      data: {
        certificateId: cert.id,
        phone: candidate.phone,
        status: isFailed ? DeliveryStatus.FAILED : DeliveryStatus.DELIVERED,
        attempts: isFailed ? 3 : 1,
        lastError: isFailed ? 'CARRIER_TIMEOUT_OR_UNREACHABLE' : null,
        deliveredAt: isFailed ? null : new Date(),
      },
    });
  }

  // Record approvals for batch 3 (Dev, Meera, Farah)
  await prisma.approval.createMany({
    data: [
      {
        batchId: batch3.id,
        officerId: userDev.id,
        role: Role.DISTRICT_OFFICER,
        decision: ApprovalDecision.APPROVED,
        comments: 'Assessment score sheets and practical logbooks certified. Approved.',
        approvalCycle: 1,
      },
      {
        batchId: batch3.id,
        officerId: userMeera.id,
        role: Role.DISTRICT_OFFICER,
        decision: ApprovalDecision.APPROVED,
        comments: 'Consensus verified. Candidate attendance meets statutory 80% criteria.',
        approvalCycle: 1,
      },
      {
        batchId: batch3.id,
        officerId: userFarah.id,
        role: Role.STATE_OFFICE,
        decision: ApprovalDecision.APPROVED,
        comments: 'Final state accreditation granted. Cryptographic signatures authorized.',
        approvalCycle: 1,
      },
    ],
  });
  console.log('✓ Batch 3: Created (25 Candidates, APPROVED with Certificates & Deliveries)');

  // --- BATCH 4: AI & Machine Learning (55 Candidates, QUALITY_REVIEW - Passed 2 District Signoffs, in Neha's Queue) ---
  const batch4 = await prisma.batch.create({
    data: {
      batchNumber: 'CF/2026/AIML/004',
      batchName: 'Artificial Intelligence & Machine Learning Specialist',
      courseName: 'Artificial Intelligence & Machine Learning Specialist',
      courseCode: 'AIML',
      trainingCentreId: tcHyd.id,
      districtId: distHyd.id,
      candidateCount: 55,
      status: BatchStatus.QUALITY_REVIEW,
      approvalCycle: 1,
      submittedAt: new Date(Date.now() - 3600000 * 12),
      trainingStartDate: new Date('2025-12-01'),
      trainingEndDate: new Date('2026-03-31'),
    },
  });

  const b4Names = getNextNames(55);
  await prisma.candidate.createMany({
    data: b4Names.map((name, i) => ({
      batchId: batch4.id,
      name,
      phone: `+919777123${String(i + 1).padStart(3, '0')}`,
      email: `${name.toLowerCase().replace(/[^a-z]/g, '')}${i + 1}@example.com`,
      courseName: 'Artificial Intelligence & Machine Learning Specialist',
    })),
  });

  // Approvals by 2 District Officers
  await prisma.approval.createMany({
    data: [
      {
        batchId: batch4.id,
        officerId: userDev.id,
        role: Role.DISTRICT_OFFICER,
        decision: ApprovalDecision.APPROVED,
        comments: 'Primary district verification completed. Labs and proctored exam logs verified.',
        approvalCycle: 1,
      },
      {
        batchId: batch4.id,
        officerId: userKabir.id,
        role: Role.DISTRICT_OFFICER,
        decision: ApprovalDecision.APPROVED,
        comments: 'Second district signoff complete. Batch exceeds 50 candidates, routing to Quality Team.',
        approvalCycle: 1,
      },
    ],
  });
  console.log('✓ Batch 4: Created (55 Candidates, QUALITY_REVIEW - In Neha\'s Quality Queue)');

  // --- BATCH 5: Cybersecurity Operations (20 Candidates, STATE_REVIEW - Passed District, in Farah's State Queue) ---
  const batch5 = await prisma.batch.create({
    data: {
      batchNumber: 'CF/2026/CYBER/005',
      batchName: 'Cybersecurity Operations & Threat Defense Analyst',
      courseName: 'Cybersecurity Operations & Threat Defense Analyst',
      courseCode: 'CYBER',
      trainingCentreId: tcChn.id,
      districtId: distChn.id,
      candidateCount: 20,
      status: BatchStatus.STATE_REVIEW,
      approvalCycle: 1,
      submittedAt: new Date(Date.now() - 3600000 * 8),
      trainingStartDate: new Date('2026-01-05'),
      trainingEndDate: new Date('2026-04-05'),
    },
  });

  const b5Names = getNextNames(20);
  await prisma.candidate.createMany({
    data: b5Names.map((name, i) => ({
      batchId: batch5.id,
      name,
      phone: `+919666444${String(i + 1).padStart(3, '0')}`,
      email: `${name.toLowerCase().replace(/[^a-z]/g, '')}${i + 1}@example.com`,
      courseName: 'Cybersecurity Operations & Threat Defense Analyst',
    })),
  });

  // Approvals by 2 District Officers
  await prisma.approval.createMany({
    data: [
      {
        batchId: batch5.id,
        officerId: userDev.id,
        role: Role.DISTRICT_OFFICER,
        decision: ApprovalDecision.APPROVED,
        comments: 'District Officer initial authorization recorded.',
        approvalCycle: 1,
      },
      {
        batchId: batch5.id,
        officerId: userMeera.id,
        role: Role.DISTRICT_OFFICER,
        decision: ApprovalDecision.APPROVED,
        comments: 'Consensus verified (<50 cohort, quality audit bypassed). Routed to State Directorate.',
        approvalCycle: 1,
      },
    ],
  });
  console.log('✓ Batch 5: Created (20 Candidates, STATE_REVIEW - In Farah\'s State Queue)');

  // --- BATCH 6: Industrial Automation & Robotics (15 Candidates, Overdue > 36 Hours for SLA Monitoring) ---
  const batch6 = await prisma.batch.create({
    data: {
      batchNumber: 'CF/2026/ROBO/006',
      batchName: 'Industrial Automation, Robotics & IoT Technician',
      courseName: 'Industrial Automation, Robotics & IoT Technician',
      courseCode: 'ROBO',
      trainingCentreId: tcKol.id,
      districtId: distKol.id,
      candidateCount: 15,
      status: BatchStatus.DISTRICT_REVIEW,
      approvalCycle: 1,
      submittedAt: new Date(Date.now() - 3600000 * 36),
      trainingStartDate: new Date('2025-12-15'),
      trainingEndDate: new Date('2026-03-15'),
    },
  });

  const b6Names = getNextNames(15);
  await prisma.candidate.createMany({
    data: b6Names.map((name, i) => ({
      batchId: batch6.id,
      name,
      phone: `+919555222${String(i + 1).padStart(3, '0')}`,
      email: `${name.toLowerCase().replace(/[^a-z]/g, '')}${i + 1}@example.com`,
      courseName: 'Industrial Automation, Robotics & IoT Technician',
    })),
  });
  console.log('✓ Batch 6: Created (15 Candidates, DISTRICT_REVIEW - Overdue SLA Monitoring)');

  // --- BATCH 7: Renewable Solar Energy (10 Candidates, DRAFT) ---
  const batch7 = await prisma.batch.create({
    data: {
      batchNumber: 'CF/2026/SOLAR/007',
      batchName: 'Renewable Solar Energy & Smart Grid Systems Specialist',
      courseName: 'Renewable Solar Energy & Smart Grid Systems Specialist',
      courseCode: 'SOLAR',
      trainingCentreId: tcPun.id,
      districtId: distPun.id,
      candidateCount: 10,
      status: BatchStatus.DRAFT,
      approvalCycle: 1,
      submittedAt: null,
      trainingStartDate: new Date('2026-03-01'),
      trainingEndDate: new Date('2026-06-01'),
    },
  });

  const b7Names = getNextNames(10);
  await prisma.candidate.createMany({
    data: b7Names.map((name, i) => ({
      batchId: batch7.id,
      name,
      phone: `+919444333${String(i + 1).padStart(3, '0')}`,
      email: `${name.toLowerCase().replace(/[^a-z]/g, '')}${i + 1}@example.com`,
      courseName: 'Renewable Solar Energy & Smart Grid Systems Specialist',
    })),
  });
  console.log('✓ Batch 7: Created (10 Candidates, DRAFT)');

  // --- BATCH 8: Electric Vehicle (EV) Powertrain (20 Candidates, SUBMITTED) ---
  const batch8 = await prisma.batch.create({
    data: {
      batchNumber: 'CF/2026/EVTEC/008',
      batchName: 'Electric Vehicle (EV) Powertrain & Battery Systems Technician',
      courseName: 'Electric Vehicle (EV) Powertrain & Battery Systems Technician',
      courseCode: 'EVTEC',
      trainingCentreId: tcAhm.id,
      districtId: distAhm.id,
      candidateCount: 20,
      status: BatchStatus.SUBMITTED,
      approvalCycle: 1,
      submittedAt: new Date(Date.now() - 3600000 * 5),
      trainingStartDate: new Date('2026-01-02'),
      trainingEndDate: new Date('2026-04-02'),
    },
  });

  const b8Names = getNextNames(20);
  await prisma.candidate.createMany({
    data: b8Names.map((name, i) => ({
      batchId: batch8.id,
      name,
      phone: `+919333555${String(i + 1).padStart(3, '0')}`,
      email: `${name.toLowerCase().replace(/[^a-z]/g, '')}${i + 1}@example.com`,
      courseName: 'Electric Vehicle (EV) Powertrain & Battery Systems Technician',
    })),
  });
  console.log('✓ Batch 8: Created (20 Candidates, SUBMITTED)');

  // --- BATCH 9: Data Science & Analytics (25 Candidates, APPROVED with Certificates) ---
  const batch9 = await prisma.batch.create({
    data: {
      batchNumber: 'CF/2026/DATA/009',
      batchName: 'Data Science & Business Intelligence Analytics Cohort',
      courseName: 'Data Science & Business Intelligence Analytics',
      courseCode: 'DATA',
      trainingCentreId: tcJai.id,
      districtId: distJai.id,
      candidateCount: 25,
      status: BatchStatus.APPROVED,
      approvalCycle: 1,
      submittedAt: new Date(Date.now() - 3600000 * 72),
      trainingStartDate: new Date('2025-09-01'),
      trainingEndDate: new Date('2025-12-31'),
    },
  });

  const b9Names = getNextNames(25);
  for (let i = 0; i < 25; i++) {
    const c = await prisma.candidate.create({
      data: {
        batchId: batch9.id,
        name: b9Names[i],
        phone: `+919222666${String(i + 1).padStart(3, '0')}`,
        email: `${b9Names[i].toLowerCase().replace(/[^a-z]/g, '')}${i + 50}@example.com`,
        courseName: 'Data Science & Business Intelligence Analytics',
      },
    });

    const certNum = `CF/2026/DATA/11/${String(i + 2001).padStart(7, '0')}`;
    const hash = `hash_${Math.random().toString(36).substring(2)}${Date.now()}`;
    const pdfRelativePath = `certificates/${certNum.replace(/\//g, '_')}.pdf`;
    const pdfAbsolutePath = path.resolve(__dirname, `../uploads/${pdfRelativePath}`);

    const cert = await prisma.certificate.create({
      data: {
        certificateNumber: certNum,
        candidateId: c.id,
        batchId: batch9.id,
        filePath: pdfRelativePath,
        status: CertificateStatus.VALID,
        issueDate: new Date(),
      },
    });

    try {
      await PdfService.generateCertificatePdf({
        outputPath: pdfAbsolutePath,
        certificateNumber: certNum,
        candidateName: c.name,
        courseName: 'Data Science & Business Intelligence Analytics',
        trainingCentreName: tcJai.name,
        batchNumber: batch9.batchNumber,
        issueDate: '21 Nov 2026',
        verificationUrl: `http://localhost:5173/verify/${encodeURIComponent(certNum)}`,
      });
    } catch (e) {}

    await prisma.delivery.create({
      data: {
        certificateId: cert.id,
        phone: c.phone,
        status: DeliveryStatus.DELIVERED,
        attempts: 1,
        deliveredAt: new Date(),
      },
    });
  }
  console.log('✓ Batch 9: Created (25 Candidates, APPROVED with Certificates & Deliveries)');

  // Create Comprehensive Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: userAnika.id,
        action: 'BATCH_CREATED',
        entityType: 'BATCH',
        entityId: batch1.id,
        metadata: { batchNumber: batch1.batchNumber, candidates: 50 },
      },
      {
        actorId: userAnika.id,
        action: 'BATCH_SUBMITTED',
        entityType: 'BATCH',
        entityId: batch1.id,
        metadata: { batchNumber: batch1.batchNumber, target: 'DISTRICT_REVIEW' },
      },
      {
        actorId: userDev.id,
        action: 'DISTRICT_APPROVED',
        entityType: 'BATCH',
        entityId: batch2.id,
        metadata: { officer: 'Dev', signoffCount: 1 },
      },
      {
        actorId: userDev.id,
        action: 'DISTRICT_APPROVED',
        entityType: 'BATCH',
        entityId: batch3.id,
        metadata: { officer: 'Dev' },
      },
      {
        actorId: userMeera.id,
        action: 'DISTRICT_APPROVED',
        entityType: 'BATCH',
        entityId: batch3.id,
        metadata: { officer: 'Meera' },
      },
      {
        actorId: userFarah.id,
        action: 'STATE_APPROVED',
        entityType: 'BATCH',
        entityId: batch3.id,
        metadata: { officer: 'Farah' },
      },
      {
        actorId: null,
        action: 'CERTIFICATES_ISSUED',
        entityType: 'BATCH',
        entityId: batch3.id,
        metadata: { count: 25 },
      },
    ],
  });

  console.log('--- SEEDING COMPLETED: 12 ALL-INDIA DISTRICTS, 12 NATIONAL CENTRES, 9 BATCHES, 255 CANDIDATES ---');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });