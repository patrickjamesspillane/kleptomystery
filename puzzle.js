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

  const inventoryToggle = $("inventory-toggle");
  const inventory = $("inventory");
  const hintButton = $("hint");
  const resetButton = $("reset");
  const success = $("success");

  const symbolButtons = Array.from(
    document.querySelectorAll(".symbol")
  );

  const objectButtons = Array.from(
    document.querySelectorAll(".object")
  );

  const symbols = {
    moon: "☾",
    triangle: "△",
    circle: "○",
    diamond: "◇"
  };

  // Change this array to change the puzzle's code.
  const correctSequence = [
    "moon",
    "triangle",
    "circle"
  ];

  const hints = {
    locked: [
      "¿Recordáis algún objeto encontrado al final del acto II?",
      "Comparad la marca del panel con la del objeto encontrado.",
      "El objeto negro es plano y tiene la misma marca. ¿Dónde podría encajar?"
    ],

    code: [
      "La tarjeta ha hecho aparecer tres símbolos en la pantalla.",
      "Comparad esos símbolos con los cuatro botones del panel.",
      "Pulsad los símbolos en el mismo orden en que aparecen, de izquierda a derecha."
    ],

    ready: [
      "Uno de los botones tiene ahora una luz diferente.",
      "Observad el dibujo del botón iluminado: parece representar una compuerta que se abre."
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

  function showInput() {
    const marks = input.map(key => symbols[key]);

    while (marks.length < correctSequence.length) {
      marks.push("—");
    }

    entered.textContent = marks.join(" ");
  }

  function flashSlot() {
    slot.classList.remove("slot-hint");

    // Restart the brief animation if clicked again.
    void slot.offsetWidth;

    slot.classList.add("slot-hint");
  }

  slot.addEventListener("animationend", function () {
    slot.classList.remove("slot-hint");
  });

  function closeInventory() {
    inventory.hidden = true;
    inventoryToggle.setAttribute("aria-expanded", "false");
  }

  function insertCard() {
    if (stage !== "locked") {
      say(
        "Nara señala la abertura: «El objeto negro sigue colocado aquí»."
      );
      return;
    }

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
      "La pantalla muestra, de izquierda a derecha: " +
      "luna, triángulo y círculo"
    );

    input = [];
    showInput();
    closeInventory();

    say(
      "Nara introduce el objeto negro en la abertura. " +
      "Encaja y se queda sujeto. En la pantalla aparecen " +
      "tres símbolos luminosos. La compuerta sigue cerrada."
    );

    symbolButtons[0].focus({ preventScroll: true });
  }

  inventoryToggle.addEventListener("click", function () {
    if (stage !== "locked") {
      say(
        "El objeto negro ya está insertado. " +
        "Observad qué ha cambiado en el panel."
      );
      return;
    }

    const willOpen = inventory.hidden;

    inventory.hidden = !willOpen;
    inventoryToggle.setAttribute(
      "aria-expanded",
      String(willOpen)
    );
  });

  objectButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      if (stage !== "locked") return;

      const object = button.dataset.object;

      if (object === "card") {
        insertCard();
      } else if (object === "stone") {
        say(
          "Nara acerca la piedra corriente a la abertura. " +
          "No encaja y el panel no cambia. " +
          "«No voy a forzarla», os dice."
        );
      } else {
        say(
          "El trozo de madera no encaja en la abertura. " +
          "Nara lo aparta para no dañar el panel. " +
          "¿Hay otro objeto que tenga una forma más adecuada?"
        );
      }
    });
  });

  slot.addEventListener("click", function () {
    if (stage === "locked") {
      say(
        "Nara observa la abertura: " +
        "«Es estrecha, alargada y tiene espacio en su interior. " +
        "Encima aparece la marca del animal de muchos brazos»."
      );
    } else if (stage === "code") {
      say(
        "El objeto negro permanece insertado. " +
        "La pantalla muestra una secuencia de símbolos."
      );
    } else if (stage === "ready") {
      say(
        "La tarjeta está colocada y un botón " +
        "del panel se ha iluminado."
      );
    } else {
      say("La compuerta ya está abierta.");
    }
  });

  symbolButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      if (stage === "locked") {
        flashSlot();

        say(
          "El botón emite un destello, pero no ocurre nada más. " +
          "La abertura estrecha se ilumina brevemente."
        );
        return;
      }

      if (stage === "ready") {
        say(
          "La secuencia ya está completada. " +
          "Observad el botón que acaba de iluminarse."
        );
        return;
      }

      if (stage === "opened") return;

      const key = button.dataset.symbol;
      input.push(key);
      showInput();

      const position = input.length - 1;

      if (key !== correctSequence[position]) {
        input = [];
        showInput();

        say(
          "La pantalla parpadea y borra los símbolos introducidos. " +
          "La secuencia de arriba sigue visible. " +
          "Podéis volver a intentarlo."
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
          "Se oye un pequeño clic y se ilumina " +
          "otro botón del panel. ¿Qué representa su dibujo?"
        );
      } else {
        say(
          "El panel mantiene encendido el símbolo introducido. " +
          "La secuencia todavía no está completa."
        );
      }
    });
  });

  scanner.addEventListener("click", function () {
    if (stage === "opened") return;

    clearTimeout(scannerTimer);

    scanner.classList.add("rejected");

    say(
      "Nara apoya la mano en el detector. " +
      "La luz cambia a naranja y aparece una señal de rechazo. " +
      "«Mi mano no tiene la forma de esta marca», observa. " +
      "El panel vuelve a su estado anterior."
    );

    scannerTimer = setTimeout(function () {
      scanner.classList.remove("rejected");
    }, 1600);
  });

  hatch.addEventListener("click", function () {
    if (stage === "locked") {
      flashSlot();

      say(
        "La compuerta no se mueve. " +
        "La abertura estrecha se ilumina por un instante."
      );

      return;
    }

    if (stage === "code") {
      say(
        "Se oye un sonido breve, pero la compuerta sigue cerrada. " +
        "La pantalla continúa mostrando los tres símbolos."
      );

      return;
    }

    if (stage === "opened") return;

    setStage("opened");

    panel.classList.add("opened");
    success.hidden = false;
    closeInventory();

    say(
      "El botón se vuelve turquesa. " +
      "La compuerta se desliza lentamente y la nave " +
      "empieza a activarse. ¡Lo habéis conseguido!"
    );

    panel.querySelectorAll("button").forEach(function (button) {
      button.disabled = true;
    });

    inventoryToggle.disabled = true;
    hintButton.disabled = true;

    success.setAttribute("tabindex", "-1");
    success.focus({ preventScroll: true });
  });

  signal.addEventListener("click", function () {
    if (stage === "opened") return;

    say(
      "Una luz recorre el borde del panel y vuelve al punto " +
      "de partida. No parece abrir la compuerta. " +
      "El resto del panel no cambia."
    );
  });

  power.addEventListener("click", function () {
    if (stage === "opened") return;

    if (stage === "locked") {
      flashSlot();

      say(
        "El panel ya tiene energía. " +
        "Al pulsar este botón, la abertura estrecha " +
        "emite un destello."
      );
    } else {
      say(
        "El panel sigue encendido. " +
        "La tarjeta permanece insertada y " +
        "vuestras acciones anteriores se conservan."
      );
    }
  });

  hintButton.addEventListener("click", function () {
    if (stage === "opened") return;

    const stageHints = hints[stage];
    const message = stageHints[
      Math.min(hintIndex, stageHints.length - 1)
    ];

    say("Pista: " + message);
    hintIndex++;
  });

  resetButton.addEventListener("click", function () {
    clearTimeout(scannerTimer);

    stage = "locked";
    input = [];
    hintIndex = 0;

    panel.classList.remove("opened");

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

    inventoryToggle.disabled = false;
    hintButton.disabled = false;

    success.hidden = true;
    closeInventory();
    showInput();

    say(
      "El panel permanece encendido, " +
      "pero la compuerta está cerrada."
    );

    inventoryToggle.focus({ preventScroll: true });
  });
})();
