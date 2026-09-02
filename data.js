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
    return false;
  }

  complaint.affectedCount =
    (complaint.affectedCount || 0) + 1;

  saveComplaints(complaints);

  return true;
}