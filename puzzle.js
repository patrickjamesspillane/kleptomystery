(function () {
  "use strict";

  const $ = id => document.getElementById(id);

  const panel = document.querySelector(".panel");
  const slot = $("slot");
  const display = $("sequence-display");
  const entered = $("entered");
  const scanner = $("scanner");
  const hatch = $("hatch");
  const signal = $("signal");
  const power = $("power");
  const status = $("status");

  const proposalSection = $("proposal-section");
  const proposalForm = $("proposal-form");
  const proposal = $("proposal");

  const hintButton = $("hint");
  const resetButton = $("reset");
  const success = $("success");

  const symbolButtons = Array.from(
    document.querySelectorAll(".symbol")
  );

  const symbols = {
    moon: "☾",
    triangle: "△",
    circle: "○",
    diamond: "◇"
  };

  const correctSequence = ["moon", "triangle", "circle"];

  const hints = {
    locked: [
      "Recordad lo que encontraron Nara y sus amigos al final del acto II.",
      "¿Habéis visto antes la marca del animal de muchos brazos?",
      "Encontraron un objeto negro y plano. ¿En qué parte del panel podría encajar?"
    ],

    code: [
      "La pantalla ha cambiado después de introducir el objeto.",
      "Comparad los símbolos de la pantalla con los botones.",
      "Pulsad los símbolos de izquierda a derecha, en el orden de la pantalla."
    ],

    ready: [
      "Uno de los botones se ha iluminado.",
      "Su dibujo representa una compuerta que se abre."
    ]
  };

  let stage = "locked";
  let input = [];
  let hintIndex = 0;
  let scannerTimer = null;

  function say(message) {
    status.textContent = message;
  }

  function setStage(nextStage) {
    stage = nextStage;
    hintIndex = 0;
  }

  function normalize(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function showInput() {
    const marks = input.map(key => symbols[key]);

    while (marks.length < correctSequence.length) {
      marks.push("—");
    }

    entered.textContent = marks.join(" ");
  }

  function flashSlot() {
    slot.classList.remove("slot-hint");
    void slot.offsetWidth;
    slot.classList.add("slot-hint");
  }

  slot.addEventListener("animationend", function () {
    slot.classList.remove("slot-hint");
  });

  function insertCard() {
    if (stage !== "locked") return;

    setStage("code");

    slot.classList.remove("slot-hint");
    slot.classList.add("has-card");

    slot.setAttribute(
      "aria-label",
      "Abertura con el objeto negro insertado"
    );

    display.classList.add("activated");
    display.textContent = correctSequence
      .map(key => symbols[key])
      .join(" ");

    display.setAttribute(
      "aria-label",
      "La pantalla muestra, de izquierda a derecha: luna, triángulo y círculo"
    );

    input = [];
    showInput();
    proposalSection.hidden = true;

    say(
      "Nara introduce el objeto negro en la abertura. " +
      "Encaja y se queda sujeto. En la pantalla aparecen " +
      "tres símbolos luminosos. La compuerta sigue cerrada."
    );

    symbolButtons[0].focus({ preventScroll: true });
  }

  function tryScanner() {
    if (stage === "opened") return;

    clearTimeout(scannerTimer);
    scanner.classList.add("rejected");

    say(
      "Nara apoya la mano en el detector. La luz cambia a naranja. " +
      "«Mi mano no tiene la forma de esta marca», observa. " +
      "El panel vuelve a su estado anterior."
    );

    scannerTimer = setTimeout(function () {
      scanner.classList.remove("rejected");
    }, 1600);
  }

  proposalForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (stage !== "locked") return;

    const text = normalize(proposal.value);

    if (!text) {
      say("Escribid una propuesta antes de probarla.");
      proposal.focus({ preventScroll: true });
      return;
    }

    /*
      Prepared keyword matching, not AI.
      A reference to the card or found black object is accepted.
    */
    const mentionsCard =
      /\b(tarjeta|tarjetas|tarjetita|credencial|pase|card)\b/.test(text) ||
      /\b(objeto|rectangulo|pieza|llave)\b.*\b(negr\w*|plan\w*|encontr\w*|pulpo)\b/.test(text) ||
      /\b(negr\w*|plan\w*|encontr\w*)\b.*\b(objeto|rectangulo|pieza|llave)\b/.test(text) ||
      /\b(lo que|eso que)\s+(encontramos|encontraron|encontrasteis)\b/.test(text);

    /*
      Do not treat a clearly rejected suggestion as an instruction.
      Ask students to state their chosen action instead.
    */
    const rejectsCard =
      /\b(no|nunca)\s+(?:\w+\s+){0,4}(?:tarjeta|credencial|pase|objeto negro)\b/.test(text) ||
      /\b(sin|descartar|descartamos|evitar)\s+(?:\w+\s+){0,3}(?:tarjeta|credencial|objeto negro)\b/.test(text);

    if (mentionsCard && rejectsCard) {
      say(
        "No tengo clara vuestra decisión. Escribid una sola acción " +
        "que queráis probar, indicando el objeto y dónde lo utilizaríais."
      );
      return;
    }

    if (mentionsCard) {
      insertCard();
      return;
    }

    if (/\b(mano|dedo|huella|tentaculo|detector|escaner)\b/.test(text)) {
      tryScanner();
      return;
    }

    if (/\b(piedra|roca)\b/.test(text)) {
      say(
        "Nara acerca la piedra al panel, pero no cambia nada. " +
        "La conserva para mantener la conexión con vosotros. " +
        "¿Qué otra idea queréis probar?"
      );
      return;
    }

    if (/\b(golpear|romper|forzar|patada|martillo)\b/.test(text)) {
      say(
        "«Podríamos estropearlo», dice Aren. " +
        "El equipo decide buscar una forma de utilizar el mecanismo. " +
        "¿Qué proponéis?"
      );
      return;
    }

    if (/\b(boton|botones|pulsar|presionar|apretar|encender)\b/.test(text)) {
      say(
        "Nara prueba un botón. Se oye un sonido breve, " +
        "pero la compuerta sigue cerrada. " +
        "Podéis explorar los controles del panel o proponer otra acción."
      );
      return;
    }

    if (/\b(codigo|contrasena|clave|simbolo|simbolos|secuencia)\b/.test(text)) {
      say(
        "La pantalla todavía no muestra ninguna secuencia. " +
        "¿Qué podríamos hacer para activarla?"
      );
      return;
    }

    if (/\b(ranura|abertura|hueco)\b/.test(text)) {
      say(
        "Nara examina la abertura: es estrecha y alargada. " +
        "¿Qué proponéis introducir en ella?"
      );
      return;
    }

    if (/\b(observar|mirar|examinar|investigar|inspeccionar)\b/.test(text)) {
      say(
        "Observáis una marca con muchos brazos, una abertura estrecha, " +
        "una pantalla y varios botones. " +
        "Relacionad lo que veis con las pistas de la historia."
      );
      return;
    }

    say(
      "Esta simulación no reconoce todavía vuestra propuesta. " +
      "Probad a describir una acción concreta: " +
      "qué queréis utilizar y qué queréis hacer con ello."
    );
  });

  slot.addEventListener("click", function () {
    if (stage === "locked") {
      say(
        "Nara observa una abertura estrecha y alargada. " +
        "Encima aparece la marca del animal de muchos brazos. " +
        "¿Qué proponéis hacer?"
      );
    } else if (stage === "code") {
      say(
        "El objeto negro permanece insertado. " +
        "La pantalla muestra una secuencia de símbolos."
      );
    } else if (stage === "ready") {
      say(
        "El objeto está colocado y un botón del panel se ha iluminado."
      );
    }
  });

  symbolButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      if (stage === "locked") {
        say(
          "El botón emite un sonido, pero la pantalla no cambia. " +
          "Parece que falta un paso anterior."
        );
        return;
      }

      if (stage === "ready") {
        say(
          "La secuencia está completada. Observad qué ha cambiado."
        );
        return;
      }

      if (stage === "opened") return;

      const key = button.dataset.symbol;
      input.push(key);
      showInput();

      if (key !== correctSequence[input.length - 1]) {
        input = [];
        showInput();

        say(
          "La pantalla borra los símbolos introducidos. " +
          "La secuencia superior sigue visible. Volved a intentarlo."
        );
        return;
      }

      if (input.length === correctSequence.length) {
        setStage("ready");
        hatch.classList.add("ready");

        hatch.setAttribute(
          "aria-label",
          "Botón iluminado con el símbolo de una compuerta"
        );

        say(
          "Los tres símbolos permanecen encendidos. " +
          "Se oye un clic y otro botón se ilumina. " +
          "¿Qué representa?"
        );
      } else {
        say(
          "El símbolo permanece encendido. La secuencia aún no está completa."
        );
      }
    });
  });

  scanner.addEventListener("click", tryScanner);

  hatch.addEventListener("click", function () {
    if (stage === "locked") {
      say(
        "La compuerta no se mueve. Parece que el mecanismo " +
        "todavía no está autorizado."
      );
      return;
    }

    if (stage === "code") {
      say(
        "La compuerta sigue cerrada. La pantalla muestra tres símbolos."
      );
      return;
    }

    if (stage === "opened") return;

    setStage("opened");

    panel.classList.add("opened", "opening-flash");
    success.hidden = false;
    proposalSection.hidden = true;

    say(
      "Una luz turquesa ilumina todo el panel. " +
      "La compuerta se desliza y los dispositivos del interior " +
      "empiezan a encenderse. ¡Lo habéis conseguido!"
    );

    panel.querySelectorAll("button").forEach(function (button) {
      button.disabled = true;
    });

    hintButton.disabled = true;

    success.setAttribute("tabindex", "-1");
    success.focus({ preventScroll: true });
  });

  panel.addEventListener("animationend", function (event) {
    if (event.animationName === "panel-opening-light") {
      panel.classList.remove("opening-flash");
    }
  });

  signal.addEventListener("click", function () {
    if (stage === "opened") return;

    say(
      "Una luz recorre el borde del panel y vuelve al punto de partida. " +
      "La compuerta sigue cerrada."
    );
  });

  power.addEventListener("click", function () {
    if (stage === "opened") return;

    say(
      stage === "locked"
        ? "El panel ya tiene energía. El botón no abre la compuerta."
        : "El panel sigue encendido y conserva los pasos que habéis completado."
    );
  });

  hintButton.addEventListener("click", function () {
    if (stage === "opened") return;

    const stageHints = hints[stage];

    say(
      "Pista: " +
      stageHints[Math.min(hintIndex, stageHints.length - 1)]
    );

    hintIndex++;

    if (stage === "locked" && hintIndex >= 3) {
      flashSlot();
    }
  });

  resetButton.addEventListener("click", function () {
    clearTimeout(scannerTimer);

    setStage("locked");
    input = [];

    panel.classList.remove("opened", "opening-flash");
    slot.classList.remove("has-card", "slot-hint");

    slot.setAttribute(
      "aria-label",
      "Examinar la abertura estrecha"
    );

    display.classList.remove("activated");
    display.textContent = "— — —";
    display.removeAttribute("aria-label");

    scanner.classList.remove("rejected");
    hatch.classList.remove("ready");

    hatch.setAttribute(
      "aria-label",
      "Pulsar el botón con el símbolo de una compuerta"
    );

    panel.querySelectorAll("button").forEach(function (button) {
      button.disabled = false;
    });

    hintButton.disabled = false;
    success.hidden = true;

    proposalForm.reset();
    proposalSection.hidden = false;
    showInput();

    say(
      "El panel permanece encendido, pero la compuerta está cerrada. " +
      "¿Qué deberíamos hacer primero?"
    );

    proposal.focus({ preventScroll: true });
  });
})();

(function () {
  "use strict";

  const button = document.getElementById("fullscreen-button");
  const message = document.getElementById("fullscreen-message");
  const game = document.documentElement;

  if (!document.fullscreenEnabled || !game.requestFullscreen) {
    button.hidden = true;
    return;
  }

  button.addEventListener("click", async function () {
    message.hidden = true;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await game.requestFullscreen();
      }
    } catch (error) {
      message.textContent =
        "No se ha podido activar la pantalla completa. " +
        "Abrid el juego directamente en su propia pestaña.";
      message.hidden = false;
    }
  });

  document.addEventListener("fullscreenchange", function () {
    const active = Boolean(document.fullscreenElement);

    button.textContent = active
      ? "⛶ Salir de pantalla completa"
      : "⛶ Pantalla completa";
  });
})();
