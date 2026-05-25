// script.js

document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("grid");
  const mastheadPanel = document.getElementById("mastheadPanel");
  const panelContent = document.getElementById("panelContent");
  const navItems = Array.from(document.querySelectorAll(".nav__item[data-panel]"));
  const logo = document.getElementById("siteLogo");

  // ---- asset fallback (root <-> ./images) ----
  function setFallback(img) {
    if (!img) return;
    const fallback = img.getAttribute("data-fallback");
    if (!fallback) return;
    img.addEventListener(
      "error",
      () => {
        // prevent loop
        img.removeAttribute("data-fallback");
        img.src = fallback;
      },
      { once: true }
    );
  }

  setFallback(logo);

  if (grid) {
    const cells = Array.from(grid.children);

    // apply fallback handlers for photos
    cells.forEach((cell) => setFallback(cell.querySelector("img")));

    // wait images load (after fallback may swap)
    const imgs = cells.map((c) => c.querySelector("img")).filter(Boolean);

    await Promise.all(
      imgs.map(
        (img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((res) => {
                img.addEventListener("load", res, { once: true });
                img.addEventListener("error", res, { once: true });
              })
      )
    );

    // orientation class
    cells.forEach((cell) => {
      const img = cell.querySelector("img");
      if (!img || !img.naturalWidth || !img.naturalHeight) return;

      const isLandscape = img.naturalWidth > img.naturalHeight;
      cell.dataset.orientation = isLandscape ? "landscape" : "portrait";
      cell.classList.toggle("is-landscape", isLandscape);
      cell.classList.toggle("is-portrait", !isLandscape);
    });

    // shuffle with rule: allow landscape-landscape, but max 2 in a row
    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    function maxConsecutiveLandscapes(items) {
      let maxRun = 0;
      let run = 0;
      for (const it of items) {
        if (it.dataset.orientation === "landscape") {
          run += 1;
          if (run > maxRun) maxRun = run;
        } else {
          run = 0;
        }
      }
      return maxRun;
    }

    let attempts = 0;
    do {
      shuffle(cells);
      attempts += 1;
    } while (maxConsecutiveLandscapes(cells) > 2 && attempts < 200);

    cells.forEach((el) => grid.appendChild(el));
  }

  // ---- expandable panel (above header bar) ----
  function closePanel() {
    mastheadPanel.style.maxHeight = "0px";
    mastheadPanel.setAttribute("aria-hidden", "true");
    panelContent.innerHTML = "";

    navItems.forEach((btn) => {
      btn.classList.remove("is-active");
      btn.setAttribute("aria-expanded", "false");
    });
  }

  function openPanel(key, triggerBtn) {
    const tpl = document.getElementById(`tpl-${key}`);
    if (!tpl) return;

    // set active marker
    navItems.forEach((btn) => {
      const isTarget = btn === triggerBtn;
      btn.classList.toggle("is-active", isTarget);
      btn.setAttribute("aria-expanded", isTarget ? "true" : "false");
    });

    // inject content
    panelContent.innerHTML = "";
    panelContent.appendChild(tpl.content.cloneNode(true));

    // measure and expand
    mastheadPanel.setAttribute("aria-hidden", "false");
    mastheadPanel.style.maxHeight = "0px"; // reset before measuring
    requestAnimationFrame(() => {
      const h = mastheadPanel.scrollHeight;
      mastheadPanel.style.maxHeight = `${h}px`;
    });
  }

  // close when clicking outside header
  document.addEventListener("click", (e) => {
    const masthead = document.getElementById("masthead");
    if (!masthead) return;
    if (!masthead.contains(e.target)) closePanel();
  });

  // close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePanel();
  });

  // toggle buttons
  navItems.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const key = btn.getAttribute("data-panel");
      const isOpen = mastheadPanel.getAttribute("aria-hidden") === "false";
      const isThisActive = btn.classList.contains("is-active");

      // same button -> close
      if (isOpen && isThisActive) {
        closePanel();
        return;
      }

      openPanel(key, btn);
    });
  });
});

