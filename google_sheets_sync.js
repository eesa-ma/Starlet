// Google Apps Script for Starlet 5.0 Google Sheets Synchronization
// Google Sheet URL: https://docs.google.com/spreadsheets/d/1y9diyOSPAIgM6nAstAPS97nfUzduTCLgrJG12yw1dsA/edit
// To install: Open your Google Sheet -> Click Extensions -> Apps Script -> Paste this code -> Click Save -> Click Run.

const SUPABASE_URL = "https://pxgurlmrtoxlmlpiyqrj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4Z3VybG1ydG94bG1scGl5cXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMTQzMjcsImV4cCI6MjA5MjU5MDMyN30.hoo0QEO1zswZdqzRAlCkiYk_r-BuxEN2kP6VKo2wbuo";

// Adds a custom menu to the spreadsheet on load
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("✦ Starlet Sync")
    .addItem("Sync All Data from Supabase", "syncAllFromSupabase")
    .addToUi();
}

// Main synchronization function
function syncAllFromSupabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create or retrieve tabs
  const submissionsSheet = getOrCreateSheet(ss, "Submissions");
  const attendanceSheet = getOrCreateSheet(ss, "Attendance");
  const teamsSheet = getOrCreateSheet(ss, "Teams & Members");
  const participantsSheet = getOrCreateSheet(ss, "Participants");
  
  // Set up API Headers
  const headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": "Bearer " + SUPABASE_ANON_KEY,
    "Content-Type": "application/json"
  };
  const options = {
    "method": "get",
    "headers": headers,
    "muteHttpExceptions": true
  };

  // Fetch attendees profiles (used for attendance, team names, and finding leaders)
  const attResponse = UrlFetchApp.fetch(SUPABASE_URL + "/rest/v1/profiles?user_role=eq.attendee&select=*", options);
  let attendees = [];
  if (attResponse.getResponseCode() === 200) {
    attendees = JSON.parse(attResponse.getContentText());
  } else {
    SpreadsheetApp.getUi().alert("Error fetching attendees profiles from Supabase. Code: " + attResponse.getResponseCode());
    return;
  }
  
  // Extract all unique registered teams and locate their leaders
  const teamLeaders = {};
  attendees.forEach(m => {
    if (m.team_name && !m.team_name.startsWith("Individual-")) {
      if (!teamLeaders[m.team_name]) {
        teamLeaders[m.team_name] = "No Leader Assigned";
      }
      if (m.is_team_leader) {
        teamLeaders[m.team_name] = m.full_name || "Anonymous Leader";
      }
    }
  });
  
  // ==========================================
  // 1. SYNC SUBMISSIONS (Lists all teams & shows submission status)
  // ==========================================
  const subResponse = UrlFetchApp.fetch(SUPABASE_URL + "/rest/v1/project_submissions?select=*", options);
  if (subResponse.getResponseCode() === 200) {
    const submissions = JSON.parse(subResponse.getContentText());
    
    // Map submissions by team_name for fast lookup
    const submissionMap = {};
    submissions.forEach(sub => {
      if (sub.team_name) {
        submissionMap[sub.team_name] = sub;
      }
    });
    
    // Clear and set headers
    submissionsSheet.clear();
    submissionsSheet.appendRow([
      "Team Name", 
      "Team Leader Name",
      "Project Name", 
      "Project Description",
      "Video & PPT Link (Google Drive)", 
      "GitHub Repository Link", 
      "AI Score (%)", 
      "Git Audit Status", 
      "Submission Time"
    ]);
    
    // List all unique registered teams
    Object.keys(teamLeaders).sort().forEach(teamName => {
      const leaderName = teamLeaders[teamName];
      const sub = submissionMap[teamName];
      
      if (sub) {
        // Team has submitted
        submissionsSheet.appendRow([
          teamName,
          leaderName,
          sub.project_name || "—",
          sub.description || "—",
          sub.demo_url || "—",
          sub.github_url || "—",
          sub.ai_percentage !== null ? sub.ai_percentage + "%" : "—",
          sub.git_audit_status ? sub.git_audit_status.toUpperCase() : "PENDING",
          sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : "—"
        ]);
      } else {
        // Team has NOT submitted yet
        submissionsSheet.appendRow([
          teamName,
          leaderName,
          "—",
          "—",
          "—",
          "—",
          "—",
          "PENDING SUBMISSION",
          "—"
        ]);
      }
    });
    
    formatHeaderRow(submissionsSheet);
  }
  
  // ==========================================
  // 2. SYNC ATTENDANCE
  // ==========================================
  // Clear and set headers
  attendanceSheet.clear();
  attendanceSheet.appendRow([
    "Attendee Name", 
    "Email Address", 
    "College / Institution", 
    "Allocated Venue", 
    "Attendance Status"
  ]);
  
  let presentCount = 0;
  attendees.forEach(att => {
    const isPresent = att.is_approved === true;
    if (isPresent) presentCount++;
    
    attendanceSheet.appendRow([
      att.full_name || "Anonymous",
      att.email,
      att.college || "—",
      att.venue || "Unassigned",
      isPresent ? "PRESENT ✅" : "ABSENT ❌"
    ]);
  });
  
  // Append summary stats
  attendanceSheet.appendRow([""]);
  attendanceSheet.appendRow(["Summary Stats:"]);
  attendanceSheet.appendRow(["Total Approved Attendees Present", presentCount]);
  attendanceSheet.appendRow(["Total Registered Attendees", attendees.length]);
  
  formatHeaderRow(attendanceSheet);
  
  // Bold summary metrics
  const lastRow = attendanceSheet.getLastRow();
  attendanceSheet.getRange(lastRow - 2, 1, 3, 2).setFontWeight("bold");
  
  // ==========================================
  // 3. SYNC TEAMS & MEMBERS
  // ==========================================
  // Group attendees by team_name
  const teamGroups = {};
  attendees.forEach(att => {
    const tName = att.team_name || "Solo Pool (No Team)";
    if (!teamGroups[tName]) teamGroups[tName] = [];
    teamGroups[tName].push(att);
  });
  
  // Clear and set headers
  teamsSheet.clear();
  teamsSheet.appendRow([
    "Team Name", 
    "Role / Position", 
    "Member Name", 
    "Email Address", 
    "Innovation Track"
  ]);
  
  Object.keys(teamGroups).sort().forEach(team => {
    const members = teamGroups[team];
    members.forEach(m => {
      let role = "Member";
      if (m.is_team_leader) role = "Team Leader 👑";
      if (team === "Solo Pool (No Team)") role = "Solo Hacker";
      
      teamsSheet.appendRow([
        team,
        role,
        m.full_name || "Anonymous",
        m.email,
        m.selected_track || "—"
      ]);
    });
    // Add empty spacing row between teams
    teamsSheet.appendRow([""]);
  });
  
  formatHeaderRow(teamsSheet);

  // ==========================================
  // 4. SYNC PARTICIPANTS (All Profiles of Attendees)
  // ==========================================
  participantsSheet.clear();
  participantsSheet.appendRow([
    "Full Name", 
    "Email Address", 
    "Phone Number", 
    "College / Institution", 
    "Allocated Venue", 
    "Team Name", 
    "Role", 
    "Selected Track", 
    "Tech Stack", 
    "GitHub Profile", 
    "LinkedIn Profile", 
    "Registration Date"
  ]);

  attendees.forEach(att => {
    let role = "Solo Hacker";
    if (att.team_name && !att.team_name.startsWith("Individual-")) {
      role = att.is_team_leader ? "Team Leader 👑" : "Team Member";
    }

    let stackList = "—";
    if (att.stack) {
      if (Array.isArray(att.stack)) {
        stackList = att.stack.join(", ");
      } else if (typeof att.stack === "string") {
        try {
          const parsed = JSON.parse(att.stack);
          if (Array.isArray(parsed)) stackList = parsed.join(", ");
          else stackList = att.stack;
        } catch (_) {
          stackList = att.stack;
        }
      }
    }

    participantsSheet.appendRow([
      att.full_name || "Anonymous",
      att.email || "—",
      att.phone || "—",
      att.college || "—",
      att.venue || "—",
      (att.team_name && !att.team_name.startsWith("Individual-")) ? att.team_name : "—",
      role,
      att.selected_track || "—",
      stackList,
      att.github_url || "—",
      att.linkedin_url || "—",
      att.created_at ? new Date(att.created_at).toLocaleDateString() : "—"
    ]);
  });

  formatHeaderRow(participantsSheet);
  
  SpreadsheetApp.getUi().alert("✦ Starlet Sync Complete!\n\nAll spreadsheet pages have been updated with the latest live data from Supabase.");
}

// Helper to get or create sheet tabs
function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

// Styling helper for header rows
function formatHeaderRow(sheet) {
  const range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  range.setBackground("#001F3F"); // Navy
  range.setFontColor("#FFFFFF");  // White
  range.setFontWeight("bold");
  range.setHorizontalAlignment("center");
  sheet.autoResizeColumns(1, sheet.getLastColumn());
}
