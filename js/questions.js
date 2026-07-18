/* ==========================================================================
   The Workday Study — Question Data
   This file contains ONLY data: question wording, options, types, and
   conditional-display rules. Wording matches the frozen Version 1.0 survey
   exactly. Do not reword, reorder, or remove items here.
   ========================================================================== */

(function () {
  "use strict";

  var SECTIONS = {
    A: "Section A · About Your Work",
    B: "Section B · Your Workload",
    C: "Section C · Planning & Decisions",
    D: "Section D · How You Track Work",
    E: "Section E · Your Mind & Your Work",
    F: "Section F · In Your Words"
  };

  var AGREE_LABELS = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"];

  var QUESTIONS = [
    // ------------------------------------------------------------------ A
    {
      id: "A1",
      section: "A",
      type: "radio",
      prompt: "Do you currently work in a paid role for 20 or more hours per week?",
      mandatory: true,
      options: [
        { value: "Yes" },
        { value: "No" }
      ],
      terminalOn: { value: "No", target: "ineligible" }
    },
    {
      id: "A2",
      section: "A",
      type: "radio",
      prompt: "Which best describes your field?",
      mandatory: true,
      options: [
        { value: "Sales" },
        { value: "Marketing" },
        { value: "HR" },
        { value: "Finance" },
        { value: "IT & Engineering" },
        { value: "Operations" },
        { value: "Business owner" },
        { value: "Consulting or professional services" },
        { value: "Other", hasText: true, placeholder: "Tell us your field" }
      ]
    },
    {
      id: "A3",
      section: "A",
      type: "radio",
      prompt: "Years of professional experience",
      mandatory: true,
      options: [
        { value: "0–2" },
        { value: "3–5" },
        { value: "6–10" },
        { value: "11+" }
      ]
    },
    {
      id: "A4",
      section: "A",
      type: "radio",
      prompt: "Which best describes your role?",
      mandatory: true,
      options: [
        { value: "I mostly do the work myself (individual contributor)" },
        { value: "I mostly manage people" },
        { value: "Both about equally" },
        { value: "I run my own business" }
      ]
    },
    {
      id: "A5",
      section: "A",
      type: "radio",
      prompt: "Where do you usually work?",
      mandatory: true,
      options: [
        { value: "Office or site" },
        { value: "Home" },
        { value: "Mix of both" }
      ]
    },
    {
      id: "A6",
      section: "A",
      type: "rating",
      prompt: "How much control do you have over the order in which you do your work on a typical day?",
      mandatory: true,
      scaleMin: 1,
      scaleMax: 5,
      endLabels: ["No control", "Complete control"]
    },

    // ------------------------------------------------------------------ B
    {
      id: "B1",
      section: "B",
      type: "radio",
      prompt: "Yesterday (or your last workday), roughly how many separate pieces of work did you touch — including small ones like replies and follow-ups?",
      mandatory: true,
      options: [
        { value: "Fewer than 5" },
        { value: "5–10" },
        { value: "11–20" },
        { value: "More than 20" },
        { value: "Hard to say" }
      ]
    },
    {
      id: "B2",
      section: "B",
      type: "radio",
      prompt: "Yesterday, roughly how many times did you stop a task before finishing it because something else needed attention?",
      mandatory: true,
      options: [
        { value: "0–2" },
        { value: "3–5" },
        { value: "6–10" },
        { value: "More than 10" }
      ]
    },
    {
      id: "B3",
      section: "B",
      type: "radio",
      prompt: "What most often pulls you away from a task midway?",
      mandatory: true,
      options: [
        { value: "My manager" },
        { value: "Colleagues" },
        { value: "Clients or customers" },
        { value: "Messages and email" },
        { value: "My own urge to check something" },
        { value: "Meetings" }
      ]
    },
    {
      id: "B4",
      section: "B",
      type: "radio",
      prompt: "In the past two weeks, on how many workdays did you end the day with something important still unfinished?",
      mandatory: true,
      options: [
        { value: "0 days" },
        { value: "1–3 days" },
        { value: "4–7 days" },
        { value: "Almost every day" }
      ]
    },

    // ------------------------------------------------------------------ C
    {
      id: "C1",
      section: "C",
      type: "radio",
      prompt: "Do you plan your workday in advance?",
      mandatory: true,
      options: [
        { value: "No, I take it as it comes" },
        { value: "Yes, mentally" },
        { value: "Yes, written — the night before" },
        { value: "Yes, written — that morning" },
        { value: "I plan by the week, not the day" }
      ]
    },
    {
      id: "C2",
      section: "C",
      type: "radio",
      prompt: "How often does your day actually go according to that plan?",
      mandatory: true,
      options: [
        { value: "Almost always" },
        { value: "More than half the time" },
        { value: "Less than half the time" },
        { value: "Almost never" }
      ],
      condition: function (answers) {
        return !!answers.C1 && answers.C1.value !== "No, I take it as it comes";
      }
    },
    {
      id: "C3",
      section: "C",
      type: "radio",
      prompt: "Think of the last time someone gave you a new task. What did you actually do with it?",
      mandatory: true,
      options: [
        { value: "Did it immediately" },
        { value: "Added it to a list or calendar" },
        { value: "Kept it in my head" },
        { value: "Told them a time and scheduled it" },
        { value: "Honestly, it slipped for a while" }
      ]
    },
    {
      id: "C4",
      section: "C",
      type: "radio",
      prompt: "Think of the last time your workload suddenly spiked. What did you do first?",
      mandatory: true,
      options: [
        { value: "The quickest task, to clear something" },
        { value: "The most urgent deadline" },
        { value: "Whatever my manager or client needed" },
        { value: "Replied to messages first" },
        { value: "Just started somewhere to get moving" }
      ]
    },

    // ------------------------------------------------------------------ D
    {
      id: "D1",
      section: "D",
      type: "checkbox",
      prompt: "How do you currently keep track of your work?",
      hint: "Select all that apply.",
      mandatory: true,
      minSelect: 1,
      options: [
        { value: "Memory" },
        { value: "Paper or sticky notes" },
        { value: "Phone notes app" },
        { value: "Calendar" },
        { value: "WhatsApp or chat with myself" },
        { value: "Email inbox" },
        { value: "A task app (Todoist, TickTick, etc.)" },
        { value: "Project tools (Trello, Asana, Jira)" },
        { value: "Spreadsheets" }
      ]
    },
    {
      id: "D2",
      section: "D",
      type: "checkbox",
      prompt: "Which of these have you tried and later stopped using?",
      hint: "Select all that apply.",
      mandatory: true,
      minSelect: 1,
      options: [
        { value: "Memory" },
        { value: "Paper or sticky notes" },
        { value: "Phone notes app" },
        { value: "Calendar" },
        { value: "WhatsApp or chat with myself" },
        { value: "Email inbox" },
        { value: "A task app (Todoist, TickTick, etc.)" },
        { value: "Project tools (Trello, Asana, Jira)" },
        { value: "Spreadsheets" },
        { value: "None — I've stuck with everything I tried", exclusive: true }
      ]
    },
    {
      id: "D3",
      section: "D",
      type: "radio",
      prompt: "What best describes why you stopped?",
      mandatory: true,
      options: [
        { value: "Too much effort to keep updated" },
        { value: "It didn't match how I actually work" },
        { value: "I simply forgot to keep using it" },
        { value: "Seeing everything piled up made me feel worse" },
        { value: "My work changed" },
        { value: "Other", hasText: true, placeholder: "Tell us why" }
      ],
      condition: function (answers) {
        var d2 = answers.D2;
        if (!d2 || !d2.values || !d2.values.length) return false;
        return d2.values.some(function (v) {
          return v !== "None — I've stuck with everything I tried";
        });
      }
    },
    {
      id: "D4",
      section: "D",
      type: "radio",
      prompt: "Imagine a trusted assistant who knew your full workload chose the order of your tasks each morning. How would you feel about following their order?",
      mandatory: true,
      options: [
        { value: "Relieved — one less thing to decide" },
        { value: "Curious, but I'd double-check it" },
        { value: "Uneasy — they might get it wrong" },
        { value: "I'd rather decide myself" }
      ]
    },

    // ------------------------------------------------------------------ E
    {
      id: "E1",
      section: "E",
      type: "rating",
      prompt: "In the evenings, I'm able to fully stop thinking about work.",
      hint: "Thinking about the past two weeks…",
      mandatory: true,
      scaleMin: 1,
      scaleMax: 5,
      pointLabels: AGREE_LABELS,
      endLabels: ["Strongly disagree", "Strongly agree"]
    },
    {
      id: "E2",
      section: "E",
      type: "radio",
      prompt: "Yesterday evening while relaxing, how many unfinished work items were on your mind?",
      mandatory: true,
      options: [
        { value: "None" },
        { value: "1–3" },
        { value: "4–6" },
        { value: "More than 6" }
      ]
    },
    {
      id: "E-AC",
      section: "E",
      type: "rating",
      prompt: "So we can check data quality, please select \u2018Disagree\u2019 here.",
      mandatory: true,
      scaleMin: 1,
      scaleMax: 5,
      pointLabels: AGREE_LABELS,
      endLabels: ["Strongly disagree", "Strongly agree"]
    },
    {
      id: "E3",
      section: "E",
      type: "radio",
      prompt: "In the past two weeks, how often did you feel you worked all day but achieved very little?",
      mandatory: true,
      options: [
        { value: "Never" },
        { value: "1–2 days" },
        { value: "3–5 days" },
        { value: "Most days" }
      ]
    },
    {
      id: "E4",
      section: "E",
      type: "radio",
      prompt: "In the past two weeks, how often did you postpone something important?",
      mandatory: true,
      options: [
        { value: "Never" },
        { value: "Once or twice" },
        { value: "Several times" },
        { value: "Almost daily" }
      ]
    },
    {
      id: "E5",
      section: "E",
      type: "radio",
      prompt: "Think of the last important thing you postponed. What was the main reason?",
      mandatory: true,
      options: [
        { value: "It felt too big or unclear where to start" },
        { value: "Other work was more urgent" },
        { value: "I was waiting on someone else" },
        { value: "I just didn't feel like facing it" },
        { value: "I forgot about it" }
      ],
      condition: function (answers) {
        return !!answers.E4 && answers.E4.value !== "Never";
      }
    },
    {
      id: "E6",
      section: "E",
      type: "radio",
      prompt: "At the end of most workdays recently, which is closest to how you feel?",
      mandatory: true,
      options: [
        { value: "Satisfied with what I did" },
        { value: "Fine — a normal day" },
        { value: "Restless — I could have done more" },
        { value: "Drained or mentally exhausted" }
      ]
    },

    // ------------------------------------------------------------------ F
    {
      id: "F1",
      section: "F",
      type: "long_text",
      prompt: "Think of a recent workday that left you drained even though you felt you got little done. In 2–3 sentences, what happened?",
      hint: "Optional but the most valuable question we ask.",
      mandatory: false,
      placeholder: "Take your time…"
    },
    {
      id: "F2",
      section: "F",
      type: "radio_with_email",
      prompt: "Would you like to receive the study's findings?",
      mandatory: true,
      options: [
        { value: "Yes" },
        { value: "No" }
      ],
      emailCondition: { value: "Yes" },
      emailNote: "If you share your email, we'll send the full findings, including who conducted this research and what we do with it.",
      emailMandatory: false
    }
  ];

  window.SurveyData = {
    SECTIONS: SECTIONS,
    QUESTIONS: QUESTIONS
  };
})();
