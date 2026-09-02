// ============================================
// CAMPUS PULSE - SHARED DATA FUNCTIONS
// ============================================

const STORAGE_KEY = 'campusPulseComplaints';


// Get all complaints
function getComplaints() {
  return JSON.parse(
    localStorage.getItem(STORAGE_KEY)
  ) || [];
}


// Save all complaints
function saveComplaints(complaints) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(complaints)
  );
}


// Get one complaint by ID
function getComplaintById(id) {
  const complaints = getComplaints();

  return complaints.find(
    complaint =>
      complaint.id.toUpperCase() === id.toUpperCase()
  );
}


// Add a new complaint
function addComplaint(complaint) {
  const complaints = getComplaints();

  complaints.push(complaint);

  saveComplaints(complaints);
}


// Mark that the current student is affected
function markAffected(id) {
  const complaints = getComplaints();

  const complaint = complaints.find(
    complaint =>
      complaint.id.toUpperCase() === id.toUpperCase()
  );

  if (!complaint) {
    return {
      success: false,
      message: 'Complaint not found.'
    };
  }

  // Create an anonymous ID for this browser/student
  let studentId = localStorage.getItem('campusPulseStudentId');

  if (!studentId) {
    studentId =
      'STU-' +
      Date.now() +
      '-' +
      Math.random().toString(36).substring(2, 8);

    localStorage.setItem(
      'campusPulseStudentId',
      studentId
    );
  }

  // Create affectedBy array if it doesn't exist
  if (!complaint.affectedBy) {
    complaint.affectedBy = [];
  }

  // Check whether this student already clicked
  if (complaint.affectedBy.includes(studentId)) {
    return {
      success: false,
      message: 'You have already marked yourself as affected.'
    };
  }

  // Add this student
  complaint.affectedBy.push(studentId);

  // Keep affectedCount synchronized
  complaint.affectedCount =
    complaint.affectedBy.length;

  saveComplaints(complaints);

  return {
    success: true,
    message: 'You are now marked as affected.',
    affectedCount: complaint.affectedCount
  };
}