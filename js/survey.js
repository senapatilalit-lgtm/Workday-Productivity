/* ==========================================================================
   The Workday Study — Survey Controller
   Owns all state. Talks to SurveyData for question content and to
   SurveyUI for rendering. No question wording lives in this file.
   ========================================================================== */

(function () {
  "use strict";

  var QUESTIONS = window.SurveyData.QUESTIONS;
  var SECTIONS = window.SurveyData.SECTIONS;
  var UI = window.SurveyUI;

  var answers = {};       // questionId -> answer object
  var currentId = QUESTIONS[0].id;
  var lastDirection = "forward";

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z0-9-]+\.?[a-z]{0,}$/i;

  /* ------------------------------------------------------------------ */
  /* Visible question list (conditional logic resolved live)            */
  /* ------------------------------------------------------------------ */

  function visibleQuestions() {
    return QUESTIONS.filter(function (q) {
      return typeof q.condition === "function" ? q.condition(answers) : true;
    });
  }

  function findQuestion(id) {
    for (var i = 0; i < QUESTIONS.length; i++) {
      if (QUESTIONS[i].id === id) return QUESTIONS[i];
    }
    return null;
  }

  /* ------------------------------------------------------------------ */
  /* Answer mutation                                                     */
  /* ------------------------------------------------------------------ */

  function ensureAnswer(id) {
    if (!answers[id]) answers[id] = {};
    return answers[id];
  }

  function applyOptionChange(question, payload) {
    var a = ensureAnswer(question.id);

    if (payload.otherText !== undefined) {
      a.text = payload.otherText;
      return;
    }

    if (question.type === "checkbox") {
      if (!a.values) a.values = [];
      var idx = a.values.indexOf(payload.value);

      if (payload.exclusive) {
        a.values = idx > -1 ? [] : [payload.value];
      } else {
        // remove any exclusive option that may already be selected
        var opt = question.options.filter(function (o) { return o.value === payload.value; })[0];
        var exclusiveValues = question.options.filter(function (o) { return o.exclusive; }).map(function (o) { return o.value; });
        a.values = a.values.filter(function (v) { return exclusiveValues.indexOf(v) === -1; });

        idx = a.values.indexOf(payload.value);
        if (idx > -1) a.values.splice(idx, 1);
        else a.values.push(payload.value);
      }
      return;
    }

    // radio, rating, radio_with_email
    var previousValue = a.value;
    a.value = payload.value;
    if (!payload.hasText && previousValue !== payload.value) {
      a.text = "";
    }
    if (question.type === "radio_with_email" && payload.value !== question.emailCondition.value) {
      // keep the email text around in memory but it will simply be hidden
    }
  }

  function applyEmailChange(question, value) {
    var a = ensureAnswer(question.id);
    a.email = value;
  }

  function applyTextChange(question, value) {
    var a = ensureAnswer(question.id);
    a.value = value;
  }

  /* ------------------------------------------------------------------ */
  /* Validation                                                          */
  /* ------------------------------------------------------------------ */

  function validate(question) {
    var a = answers[question.id];

    if (question.type === "long_text") {
      return { ok: true };
    }

    if (question.mandatory === false && !a) {
      return { ok: true };
    }

    if (question.type === "radio" || question.type === "radio_with_email") {
      if (!a || !a.value) {
        return { ok: false, message: "Please choose an option to continue." };
      }
      var chosen = question.options.filter(function (o) { return o.value === a.value; })[0];
      if (chosen && chosen.hasText && (!a.text || !a.text.trim())) {
        return { ok: false, message: "Please add a few words in the field above." };
      }
      if (question.type === "radio_with_email" && a.value === question.emailCondition.value) {
        if (a.email && a.email.trim() && !EMAIL_RE.test(a.email.trim())) {
          return { ok: false, message: "That email address doesn't look quite right." };
        }
      }
      return { ok: true };
    }

    if (question.type === "checkbox") {
      var min = question.minSelect || 1;
      if (!a || !a.values || a.values.length < min) {
        return { ok: false, message: "Please select at least one option." };
      }
      return { ok: true };
    }

    if (question.type === "rating") {
      if (!a || a.value === undefined || a.value === null) {
        return { ok: false, message: "Please choose a point on the scale." };
      }
      return { ok: true };
    }

    return { ok: true };
  }

  /* ------------------------------------------------------------------ */
  /* Rendering                                                           */
  /* ------------------------------------------------------------------ */

  function render() {
    var list = visibleQuestions();
    var question = findQuestion(currentId);
    var index = list.findIndex(function (q) { return q.id === currentId; });

    if (index === -1) {
      // The current question fell out of the visible set because an
      // earlier answer changed (e.g. user navigated back and altered a
      // branching answer). Fall back to the nearest sensible question.
      index = 0;
      currentId = list[0].id;
      question = findQuestion(currentId);
    }

    var total = list.length;
    var percent = Math.round((index / total) * 100);

    UI.updateHeader({
      sectionName: SECTIONS[question.section],
      index: index + 1,
      total: total,
      remaining: total - (index + 1),
      percent: percent
    });

    var built = UI.buildQuestionCard(question, answers[question.id], {
      onOptionChange: function (payload) {
        applyOptionChange(question, payload);
        UI.clearValidationMessage();
        renderInPlace(question);
      },
      onEmailChange: function (value) {
        applyEmailChange(question, value);
      }
    });

    var viewport = document.getElementById("question-viewport");
    UI.transitionToCard(viewport, built.card, lastDirection, built.focusEl);

    var isFirst = index === 0;
    var isLast = index === total - 1;
    var prevBtn = document.getElementById("btn-prev");
    var nextLabel = document.getElementById("btn-next-label");
    prevBtn.disabled = isFirst;
    nextLabel.textContent = isLast ? "Finish" : "Continue";

    UI.clearValidationMessage();
  }

  // Re-render just the interactive parts without a full slide transition,
  // e.g. immediately after selecting an option (so "is-selected" states,
  // inline "Other" fields, and conditional email fields update instantly).
  function renderInPlace(question) {
    var viewport = document.getElementById("question-viewport");
    var old = viewport.querySelector(".question-card");

    var built = UI.buildQuestionCard(question, answers[question.id], {
      onOptionChange: function (payload) {
        applyOptionChange(question, payload);
        UI.clearValidationMessage();
        renderInPlace(question);
      },
      onEmailChange: function (value) {
        applyEmailChange(question, value);
      }
    });

    if (old) old.remove();
    viewport.appendChild(built.card);
  }

  /* ------------------------------------------------------------------ */
  /* Navigation                                                          */
  /* ------------------------------------------------------------------ */

  function goNext() {
    var question = findQuestion(currentId);
    var result = validate(question);

    if (!result.ok) {
      UI.showValidationMessage(result.message);
      return;
    }

    UI.clearValidationMessage();

    // Terminal branch (A1 = "No")
    if (question.terminalOn) {
      var a = answers[question.id];
      if (a && a.value === question.terminalOn.value) {
        UI.showScreen(question.terminalOn.target);
        return;
      }
    }

    var list = visibleQuestions();
    var index = list.findIndex(function (q) { return q.id === currentId; });

    if (index === list.length - 1) {
      finishSurvey();
      return;
    }

    lastDirection = "forward";
    currentId = list[index + 1].id;
    render();
  }

  function goPrev() {
    var list = visibleQuestions();
    var index = list.findIndex(function (q) { return q.id === currentId; });
    if (index <= 0) return;

    lastDirection = "back";
    currentId = list[index - 1].id;
    render();
  }

  /* ------------------------------------------------------------------ */
  /* Submission — sends the completed response to Google Sheets, if a   */
  /* webhook URL has been configured in js/config.js. Fire-and-forget:  */
  /* the participant sees the thank-you screen regardless of whether    */
  /* the network call succeeds, so a slow or blocked connection never   */
  /* blocks the experience.                                              */
  /* ------------------------------------------------------------------ */

  function joinValues(a) {
    return a && a.values ? a.values.join("; ") : "";
  }

  function radioValue(a) {
    return a && a.value !== undefined ? a.value : "";
  }

  function otherText(a) {
    return a && a.text ? a.text : "";
  }

  function buildSubmissionPayload() {
    return {
      A1: radioValue(answers.A1),
      A2: radioValue(answers.A2),
      A2_Other: otherText(answers.A2),
      A3: radioValue(answers.A3),
      A4: radioValue(answers.A4),
      A5: radioValue(answers.A5),
      A6: radioValue(answers.A6),
      B1: radioValue(answers.B1),
      B2: radioValue(answers.B2),
      B3: radioValue(answers.B3),
      B4: radioValue(answers.B4),
      C1: radioValue(answers.C1),
      C2: radioValue(answers.C2),
      C3: radioValue(answers.C3),
      C4: radioValue(answers.C4),
      D1: joinValues(answers.D1),
      D2: joinValues(answers.D2),
      D3: radioValue(answers.D3),
      D3_Other: otherText(answers.D3),
      D4: radioValue(answers.D4),
      E1: radioValue(answers.E1),
      E2: radioValue(answers.E2),
      E_AC: radioValue(answers["E-AC"]),
      E3: radioValue(answers.E3),
      E4: radioValue(answers.E4),
      E5: radioValue(answers.E5),
      E6: radioValue(answers.E6),
      F1: radioValue(answers.F1),
      F2: radioValue(answers.F2),
      F2_Email: (answers.F2 && answers.F2.email) ? answers.F2.email.trim() : ""
    };
  }

  function submitResponses(payload) {
    var url = window.SurveyConfig && window.SurveyConfig.WEBHOOK_URL;
    if (!url || url.indexOf("PASTE_YOUR") > -1) {
      return; // No backend configured — survey still runs, nothing is saved.
    }
    // Sent as text/plain (the default fetch content type) rather than
    // application/json on purpose: it keeps this a "simple request" so
    // the browser skips a CORS preflight, which Apps Script web apps
    // don't handle. Code.gs still parses it with JSON.parse().
    fetch(url, {
      method: "POST",
      body: JSON.stringify(payload)
    }).catch(function (err) {
      console.error("Could not save response to Google Sheets:", err);
    });
  }

  function finishSurvey() {
    var f2 = answers.F2;
    var emailNote = document.getElementById("email-confirmation");
    if (f2 && f2.value === "Yes" && f2.email && f2.email.trim()) {
      emailNote.hidden = false;
    } else {
      emailNote.hidden = true;
    }
    submitResponses(buildSubmissionPayload());
    UI.showScreen("thankyou");
  }

  /* ------------------------------------------------------------------ */
  /* Boot                                                                */
  /* ------------------------------------------------------------------ */

  function start() {
    UI.showScreen("survey");
    render();
  }

  function init() {
    var startBtn = document.getElementById("btn-start");
    var nextBtn = document.getElementById("btn-next");
    var prevBtn = document.getElementById("btn-prev");

    [startBtn, nextBtn, prevBtn].forEach(UI.attachRipple);

    startBtn.addEventListener("click", start);
    nextBtn.addEventListener("click", goNext);
    prevBtn.addEventListener("click", goPrev);

    document.addEventListener("keydown", function (e) {
      var surveyVisible = !document.getElementById("screen-survey").hidden;
      if (!surveyVisible) return;
      var tag = (document.activeElement && document.activeElement.tagName) || "";
      if (e.key === "Enter" && tag !== "TEXTAREA" && tag !== "BUTTON") {
        e.preventDefault();
        goNext();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
