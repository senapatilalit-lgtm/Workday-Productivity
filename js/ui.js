/* ==========================================================================
   The Workday Study — UI Rendering
   Pure DOM rendering helpers. No survey state lives here; survey.js owns
   state and calls into these functions to draw it.
   ========================================================================== */

(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (key) {
      if (key === "class") node.className = attrs[key];
      else if (key === "text") node.textContent = attrs[key];
      else if (key === "html") node.innerHTML = attrs[key];
      else if (key.indexOf("on") === 0 && typeof attrs[key] === "function") {
        node.addEventListener(key.slice(2).toLowerCase(), attrs[key]);
      } else if (attrs[key] !== undefined && attrs[key] !== null && attrs[key] !== false) {
        node.setAttribute(key, attrs[key] === true ? "" : attrs[key]);
      }
    });
    (children || []).forEach(function (child) {
      if (child) node.appendChild(child);
    });
    return node;
  }

  /* ---------------------------------------------------------------- */
  /* Ripple effect for buttons                                        */
  /* ---------------------------------------------------------------- */

  function attachRipple(button) {
    button.addEventListener("click", function (e) {
      var rect = button.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var span = document.createElement("span");
      span.className = "ripple";
      span.style.width = span.style.height = size + "px";
      var x = (e.clientX || rect.left + rect.width / 2) - rect.left - size / 2;
      var y = (e.clientY || rect.top + rect.height / 2) - rect.top - size / 2;
      span.style.left = x + "px";
      span.style.top = y + "px";
      button.appendChild(span);
      window.setTimeout(function () {
        if (span.parentNode) span.parentNode.removeChild(span);
      }, 650);
    });
  }

  /* ---------------------------------------------------------------- */
  /* Screen switching                                                  */
  /* ---------------------------------------------------------------- */

  function showScreen(name) {
    ["welcome", "survey", "ineligible", "thankyou"].forEach(function (key) {
      var node = document.getElementById("screen-" + key);
      if (!node) return;
      node.hidden = key !== name;
    });
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  /* ---------------------------------------------------------------- */
  /* Header / progress                                                */
  /* ---------------------------------------------------------------- */

  function updateHeader(state) {
    $("#section-name").textContent = state.sectionName;
    $("#question-number").textContent = "Question " + state.index + " of " + state.total;
    $("#remaining-count").textContent = state.remaining === 1 ? "1 left" : state.remaining + " left";
    $("#percent-complete").textContent = state.percent + "%";
    $("#progress-fill").style.width = state.percent + "%";
    var track = $("#progress-track");
    track.setAttribute("aria-valuenow", String(state.percent));
  }

  /* ---------------------------------------------------------------- */
  /* Option rendering (radio / checkbox share most structure)          */
  /* ---------------------------------------------------------------- */

  function buildOptionsList(question, answer, onChange) {
    var inputType = question.type === "checkbox" ? "checkbox" : "radio";
    var name = question.id;
    var list = el("div", { class: "options-list", role: inputType === "radio" ? "radiogroup" : "group" });

    question.options.forEach(function (opt, i) {
      var isSelected = false;
      if (question.type === "checkbox") {
        isSelected = !!(answer && answer.values && answer.values.indexOf(opt.value) > -1);
      } else {
        isSelected = !!(answer && answer.value === opt.value);
      }

      var input = el("input", {
        type: inputType,
        name: name,
        value: opt.value,
        id: name + "-opt" + i,
        checked: isSelected || undefined
      });

      var label = el("label", {
        class: "option" + (isSelected ? " is-selected" : ""),
        "data-shape": inputType === "checkbox" ? "square" : "circle",
        for: name + "-opt" + i
      }, [
        input,
        el("span", { class: "option__control" }, [el("span", { class: "option__control-dot" })]),
        el("span", { class: "option__label", text: opt.value })
      ]);

      var textInput = null;
      if (opt.hasText) {
        textInput = el("input", {
          type: "text",
          class: "text-input option__other-input",
          placeholder: opt.placeholder || "Please specify",
          value: (answer && answer.text) || "",
          hidden: !isSelected || undefined
        });
        textInput.addEventListener("input", function () {
          onChange({ otherText: textInput.value });
        });
        textInput.addEventListener("click", function (e) { e.stopPropagation(); });
      }

      input.addEventListener("change", function () {
        onChange({ value: opt.value, exclusive: !!opt.exclusive, hasText: !!opt.hasText });
      });

      var wrap = el("div", {}, [label, textInput]);
      list.appendChild(wrap);
    });

    return list;
  }

  /* ---------------------------------------------------------------- */
  /* Rating scale rendering                                           */
  /* ---------------------------------------------------------------- */

  function buildRatingScale(question, answer, onChange) {
    var wrap = el("div", {});
    var scale = el("div", { class: "rating-scale", role: "radiogroup" });
    var count = question.scaleMax - question.scaleMin + 1;

    for (var i = 0; i < count; i++) {
      var val = question.scaleMin + i;
      var isSelected = !!(answer && answer.value === val);
      var input = el("input", {
        type: "radio",
        name: question.id,
        value: val,
        id: question.id + "-rate" + val,
        checked: isSelected || undefined
      });

      var labelText = question.pointLabels ? question.pointLabels[i] : "";
      var option = el("label", {
        class: "rating-option" + (isSelected ? " is-selected" : ""),
        for: question.id + "-rate" + val
      }, [
        input,
        el("span", { class: "rating-option__circle", text: String(val) }),
        labelText ? el("span", { class: "rating-option__label", text: labelText }) : null
      ]);

      input.addEventListener("change", function (v) {
        return function () { onChange({ value: v }); };
      }(val));

      scale.appendChild(option);
    }

    wrap.appendChild(scale);
    wrap.appendChild(el("div", { class: "rating-endlabels" }, [
      el("span", { text: question.endLabels ? question.endLabels[0] : "" }),
      el("span", { text: question.endLabels ? question.endLabels[1] : "" })
    ]));

    return wrap;
  }

  /* ---------------------------------------------------------------- */
  /* Text inputs                                                      */
  /* ---------------------------------------------------------------- */

  function buildTextInput(question, answer, onChange, kind) {
    var value = (answer && answer.value) || "";
    var input;
    if (kind === "long_text") {
      input = el("textarea", {
        class: "textarea-input",
        placeholder: question.placeholder || "",
        maxlength: 600
      });
      input.value = value;
    } else if (kind === "email") {
      input = el("input", {
        type: "email",
        class: "email-input",
        placeholder: question.placeholder || "you@example.com",
        autocomplete: "email"
      });
      input.value = value;
    } else {
      input = el("input", {
        type: "text",
        class: "text-input",
        placeholder: question.placeholder || ""
      });
      input.value = value;
    }

    input.addEventListener("input", function () {
      onChange({ value: input.value });
    });

    var wrap = el("div", {}, [input]);
    if (kind === "long_text") {
      var hint = el("div", { class: "char-hint", text: value.length + " / 600" });
      input.addEventListener("input", function () {
        hint.textContent = input.value.length + " / 600";
      });
      wrap.appendChild(hint);
    }
    return { wrap: wrap, focusEl: input };
  }

  /* ---------------------------------------------------------------- */
  /* Full question card                                               */
  /* ---------------------------------------------------------------- */

  function buildQuestionCard(question, answer, callbacks) {
    var card = el("div", { class: "question-card" });

    var promptRow = el("h2", { class: "question-prompt" }, [
      document.createTextNode(question.prompt),
      question.mandatory === false ? el("span", { class: "optional-badge", text: "Optional" }) : null
    ]);
    card.appendChild(promptRow);

    if (question.hint) {
      card.appendChild(el("p", { class: "question-hint", text: question.hint }));
    }

    var focusTarget = null;

    if (question.type === "radio") {
      var list = buildOptionsList(question, answer, function (payload) {
        callbacks.onOptionChange(payload);
      });
      card.appendChild(list);
    } else if (question.type === "checkbox") {
      var clist = buildOptionsList(question, answer, function (payload) {
        callbacks.onOptionChange(payload);
      });
      card.appendChild(clist);
    } else if (question.type === "rating") {
      card.appendChild(buildRatingScale(question, answer, callbacks.onOptionChange));
    } else if (question.type === "long_text") {
      var t = buildTextInput(question, answer, callbacks.onOptionChange, "long_text");
      card.appendChild(t.wrap);
      focusTarget = t.focusEl;
    } else if (question.type === "radio_with_email") {
      var rlist = buildOptionsList(question, answer, function (payload) {
        callbacks.onOptionChange(payload);
      });
      card.appendChild(rlist);

      var showEmail = answer && answer.value === question.emailCondition.value;
      var emailBlock = el("div", {
        class: "conditional-field",
        hidden: !showEmail || undefined
      });
      emailBlock.appendChild(el("p", { class: "question-hint", text: question.emailNote }));
      var e = buildTextInput(
        { placeholder: "you@example.com" },
        { value: (answer && answer.email) || "" },
        function (payload) { callbacks.onEmailChange(payload.value); },
        "email"
      );
      emailBlock.appendChild(e.wrap);
      card.appendChild(emailBlock);
      card._emailBlock = emailBlock;
    }

    return { card: card, focusEl: focusTarget };
  }

  /* ---------------------------------------------------------------- */
  /* Card transition                                                  */
  /* ---------------------------------------------------------------- */

  function transitionToCard(viewport, newCardEl, direction, focusEl) {
    var old = viewport.querySelector(".question-card");
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function insertNew() {
      newCardEl.classList.add(direction === "back" ? "is-entering-back" : "is-entering-forward");
      viewport.appendChild(newCardEl);
      if (focusEl && !reduced) {
        window.setTimeout(function () { focusEl.focus({ preventScroll: true }); }, 260);
      } else if (focusEl) {
        focusEl.focus({ preventScroll: true });
      }
    }

    if (!old || reduced) {
      if (old) old.remove();
      insertNew();
      return;
    }

    old.classList.add(direction === "back" ? "is-leaving-back" : "is-leaving-forward");
    window.setTimeout(function () {
      old.remove();
      insertNew();
    }, 160);
  }

  /* ---------------------------------------------------------------- */
  /* Validation message + shake                                       */
  /* ---------------------------------------------------------------- */

  function showValidationMessage(msg) {
    var node = $("#validation-message");
    node.textContent = msg;
    var card = $(".question-card");
    if (card) {
      card.classList.remove("shake");
      // force reflow so the animation can re-trigger
      void card.offsetWidth;
      card.classList.add("shake");
    }
  }

  function clearValidationMessage() {
    $("#validation-message").textContent = "";
  }

  /* ---------------------------------------------------------------- */

  window.SurveyUI = {
    el: el,
    attachRipple: attachRipple,
    showScreen: showScreen,
    updateHeader: updateHeader,
    buildQuestionCard: buildQuestionCard,
    transitionToCard: transitionToCard,
    showValidationMessage: showValidationMessage,
    clearValidationMessage: clearValidationMessage
  };
})();
