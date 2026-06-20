require('dotenv').config();
const admin = require('firebase-admin');

// ------------------------------------------------------------------
// Configuration
// ------------------------------------------------------------------
const SERVICE_ACCOUNT_PATH =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';
const ORG_ID = process.env.ORG_ID || 'demo-org';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'usmanmurtaza2004@gmail.com';
const ADMIN_UID = process.env.ADMIN_UID || '';

// ------------------------------------------------------------------
// Firebase Admin initialisation
// ------------------------------------------------------------------
let serviceAccount;
try {
  serviceAccount = require(SERVICE_ACCOUNT_PATH);
} catch (err) {
  console.error(
    `Failed to load service account key from "${SERVICE_ACCOUNT_PATH}".`
  );
  console.error('Ensure the file exists and the path is correct.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// ------------------------------------------------------------------
// Helper: get a document reference with a predictable ID
// ------------------------------------------------------------------
function ref(collection, id) {
  return db.collection(collection).doc(id);
}

// ------------------------------------------------------------------
// Seed data
// ------------------------------------------------------------------
async function seed() {
  console.log('========================================');
  console.log('  Maniesta Campus OS – Firestore Seed');
  console.log('========================================');
  console.log(`Org ID        : ${ORG_ID}`);
  console.log(`Admin Email   : ${ADMIN_EMAIL}`);
  console.log(`Admin UID     : ${ADMIN_UID || '(not set – update after Auth creation)'}`);
  console.log(`Firestore DB  : ${db.projectId}`);
  console.log('----------------------------------------\n');

  // 1. Organisation
  const orgSnap = await ref('organizations', ORG_ID).get();
  if (orgSnap.exists) {
    console.log('⚠ Organisation already exists, skipping creation.');
  } else {
    await ref('organizations', ORG_ID).set({
      name: 'Demo Institute',
      plan: 'free',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      studentCount: 3,
      courseCount: 2,
    });
    console.log('✓ Organisation created.');
  }

  // 2. Admin user profile
  if (!ADMIN_UID) {
    console.log(
      '⚠ ADMIN_UID not set. Skipping admin user creation.'
    );
    console.log(
      '  Create a Firebase Auth user for admin, then update the users document with the real UID.'
    );
  } else {
    const userSnap = await ref('users', ADMIN_UID).get();
    if (userSnap.exists) {
      console.log('⚠ Admin user already exists, skipping creation.');
    } else {
      await ref('users', ADMIN_UID).set({
        orgId: ORG_ID,
        role: 'admin',
        email: ADMIN_EMAIL,
        displayName: 'Admin User',
        avatarURL: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log('✓ Admin user profile created.');
    }
  }

  // 3. Courses
  const course1Id = 'course-1';
  const course2Id = 'course-2';

  const course1Snap = await ref('courses', course1Id).get();
  if (!course1Snap.exists) {
    await ref('courses', course1Id).set({
      orgId: ORG_ID,
      code: 'CS101',
      name: 'Introduction to Computing',
      instructor: 'Prof. Ahmed',
      duration: '4 months',
      fees: 5000,
      totalStudents: 2,
      description: 'Basics of computing and programming.',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✓ Course CS101 created.');
  } else {
    console.log('⚠ Course CS101 already exists, skipping.');
  }

  const course2Snap = await ref('courses', course2Id).get();
  if (!course2Snap.exists) {
    await ref('courses', course2Id).set({
      orgId: ORG_ID,
      code: 'PHY201',
      name: 'Physics II',
      instructor: 'Dr. Fatima',
      duration: '6 months',
      fees: 6000,
      totalStudents: 1,
      description: 'Electromagnetism and thermodynamics.',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✓ Course PHY201 created.');
  } else {
    console.log('⚠ Course PHY201 already exists, skipping.');
  }

  // 4. Students
  const student1Id = 'student-1';
  const student2Id = 'student-2';
  const student3Id = 'student-3';

  const studentsExist = (await ref('students', student1Id).get()).exists;
  if (!studentsExist) {
    await ref('students', student1Id).set({
      orgId: ORG_ID,
      studentId: 'STU2024001',
      name: 'Ali Khan',
      email: 'ali.khan@example.com',
      phone: '+921234567890',
      address: '123 Main St, Karachi',
      dateOfBirth: '2005-03-15',
      gender: 'Male',
      courseId: course1Id,
      enrollmentDate: admin.firestore.FieldValue.serverTimestamp(),
      status: 'Active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await ref('students', student2Id).set({
      orgId: ORG_ID,
      studentId: 'STU2024002',
      name: 'Sana Ahmed',
      email: 'sana.ahmed@example.com',
      phone: '+921234567891',
      address: '456 Park Ave, Lahore',
      dateOfBirth: '2005-07-20',
      gender: 'Female',
      courseId: course1Id,
      enrollmentDate: admin.firestore.FieldValue.serverTimestamp(),
      status: 'Active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await ref('students', student3Id).set({
      orgId: ORG_ID,
      studentId: 'STU2024003',
      name: 'Bilal Zafar',
      email: 'bilal.zafar@example.com',
      phone: '+921234567892',
      address: '789 Gulberg, Islamabad',
      dateOfBirth: '2005-11-02',
      gender: 'Male',
      courseId: course2Id,
      enrollmentDate: admin.firestore.FieldValue.serverTimestamp(),
      status: 'Active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✓ Students created.');
  } else {
    console.log('⚠ Students already exist, skipping.');
  }

  // 5. Attendance (today for course1)
  const today = new Date().toISOString().split('T')[0];
  const att1Id = `att-${student1Id}-${today}`;
  const att2Id = `att-${student2Id}-${today}`;

  const attExists = (await ref('attendance', att1Id).get()).exists;
  if (!attExists) {
    const batch = db.batch();
    batch.set(ref('attendance', att1Id), {
      orgId: ORG_ID,
      courseId: course1Id,
      studentId: student1Id,
      date: today,
      status: 'present',
      recordedBy: ADMIN_UID || '',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    batch.set(ref('attendance', att2Id), {
      orgId: ORG_ID,
      courseId: course1Id,
      studentId: student2Id,
      date: today,
      status: 'absent',
      recordedBy: ADMIN_UID || '',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    await batch.commit();
    console.log('✓ Attendance records created for today.');
  } else {
    console.log('⚠ Attendance records already exist, skipping.');
  }

  // 6. Marks
  const mark1Id = `mark-${student1Id}-mid`;
  const mark2Id = `mark-${student2Id}-mid`;
  const mark3Id = `mark-${student3Id}-final`;

  const marksExist = (await ref('marks', mark1Id).get()).exists;
  if (!marksExist) {
    await ref('marks', mark1Id).set({
      orgId: ORG_ID,
      studentId: student1Id,
      courseId: course1Id,
      subject: 'Programming',
      examType: 'Mid-term',
      obtainedMarks: 85,
      totalMarks: 100,
      percentage: 85,
      grade: 'A',
      recordedBy: ADMIN_UID || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await ref('marks', mark2Id).set({
      orgId: ORG_ID,
      studentId: student2Id,
      courseId: course1Id,
      subject: 'Programming',
      examType: 'Mid-term',
      obtainedMarks: 72,
      totalMarks: 100,
      percentage: 72,
      grade: 'B+',
      recordedBy: ADMIN_UID || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await ref('marks', mark3Id).set({
      orgId: ORG_ID,
      studentId: student3Id,
      courseId: course2Id,
      subject: 'Electromagnetism',
      examType: 'Final',
      obtainedMarks: 58,
      totalMarks: 100,
      percentage: 58,
      grade: 'C+',
      recordedBy: ADMIN_UID || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✓ Marks records created.');
  } else {
    console.log('⚠ Marks records already exist, skipping.');
  }

  console.log('\n========================================');
  console.log('  Seeding completed successfully!');
  console.log('========================================');
  if (!ADMIN_UID) {
    console.log('\nNext steps:');
    console.log(`  1. Create a Firebase Auth user for ${ADMIN_EMAIL}`);
    console.log('  2. Copy the UID from Firebase Console → Authentication');
    console.log('  3. Run: ADMIN_UID=<your-uid> npm run seed');
  }
}

seed().catch((err) => {
  console.error('\n❌ Seeding failed:', err);
  process.exit(1);
});