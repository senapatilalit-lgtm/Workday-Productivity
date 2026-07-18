# The Workday Study — Survey Frontend

A standalone, dependency-free survey form implementing the frozen
Version 1.0 questionnaire for Project Shanti's Phase 0 behavioural
research. Pure HTML5, CSS3, and vanilla ES6 — no build step, no
frameworks, no network requests.

## Running it

Just open `index.html` in any modern browser. That's it — no server,
no `npm install`, no bundler. Every asset is local and every font is a
system font, so it also works completely offline.

To deploy it publicly, upload the whole folder as-is to any static
host (Netlify, Vercel, GitHub Pages, S3, your own server). There is
nothing to build.

## File structure

```
index.html                   Screen markup: welcome, survey, ineligible, thank you
css/style.css                 Design tokens, layout, components (light + dark mode)
css/animations.css             Keyframes and motion, fully disabled under
                               prefers-reduced-motion
css/responsive.css             Mobile-first breakpoints and touch-target rules
js/config.js                   Your Google Sheets webhook URL goes here
js/questions.js                Question content + conditional logic — DATA ONLY
js/ui.js                       DOM rendering: cards, options, progress, transitions
js/survey.js                   State, validation, navigation, branching, submission
assets/logo.svg                 Brandmark
google-apps-script/Code.gs       Backend: paste into Extensions > Apps Script
GOOGLE_SHEETS_SETUP.md           Step-by-step guide to wire it all together
```

## Where things live (so you know what's safe to touch)

- **To change wording, options, or add/remove questions:** edit only
  `js/questions.js`. Nothing else needs to change — `survey.js` and
  `ui.js` render whatever is in that array, in order, respecting each
  question's `condition` function.
- **To change colors, type, spacing:** edit the CSS custom properties
  at the top of `css/style.css` (`:root` block). Dark mode has its own
  overriding block right below it.
- **To change validation copy or rules:** see the `validate()` function
  in `js/survey.js`.

## Conditional logic implemented

- **A1 → ineligible screen:** answering "No" ends the survey
  immediately with a polite screen (participant is under the 20hrs/week
  threshold).
- **C2** only appears if C1 is not "No, I take it as it comes."
- **D3** only appears if D2 includes anything other than "None — I've
  stuck with everything I tried" (which is modeled as an exclusive
  checkbox option — selecting it clears any other D2 selections, and
  vice versa).
- **E5** only appears if E4 is not "Never."
- **F2** shows an inline, optional email field only when "Yes" is
  selected.

The progress bar, question counter, and "X left" counter all recompute
against the *currently visible* question list, so branching never
produces an inconsistent progress readout.

## Data handling

Responses can be recorded to a Google Sheet with no login required for
respondents. See **`GOOGLE_SHEETS_SETUP.md`** for the full walkthrough —
short version: paste `google-apps-script/Code.gs` into a spreadsheet's
Apps Script editor, deploy it as a web app ("Execute as: Me", "Who has
access: Anyone"), then drop the resulting URL into `js/config.js`.

Until you do that, `js/config.js` holds a placeholder and the survey
still runs end-to-end — it just doesn't save anything anywhere, which
is useful for previewing or testing the flow.

The submission itself happens in `finishSurvey()` in `js/survey.js`,
which builds a flat payload of every answer and sends it with `fetch()`
right before showing the thank-you screen. The network call never
blocks the UI — if it's slow, blocked, or misconfigured, the
participant still sees the thank-you screen; the error only shows up in
the browser console.

## Accessibility notes

- All inputs are real `<input>`/`<textarea>` elements with associated
  `<label>` wrappers, so keyboard navigation, screen readers, and
  autofill all work natively.
- Focus states are visible (`:focus-visible`) and never suppressed.
- `prefers-reduced-motion: reduce` strips all animation down to instant
  state changes.
- `prefers-color-scheme: dark` is fully supported via CSS variables.
- Enter key advances to the next question (except inside the long-text
  textarea, where it inserts a new line as expected).
