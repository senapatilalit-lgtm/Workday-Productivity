/* ==========================================================================
   The Workday Study — Configuration
   The only file you need to touch to connect the survey to your own
   Google Sheet. See GOOGLE_SHEETS_SETUP.md for how to get this URL.
   ========================================================================== */

window.SurveyConfig = {
  // Paste the "Web app URL" you get after deploying google-apps-script/Code.gs.
  // Leave the placeholder as-is to run the survey with no backend at all —
  // it will still work end-to-end, it just won't save anything anywhere.
  WEBHOOK_URL: "https://script.google.com/macros/s/AKfycbybhHmvJWAT5q3FbTiAp_WA3-p0xylHCiw3BPbBeGuNEQnNg2pEJzTmIjgsHYlKH9fb/exec"
};
