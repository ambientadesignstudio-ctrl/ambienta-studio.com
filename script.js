document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("grid");
  if (!grid) {
    console.warn("#grid not found");
    return;
  }

  const cells = Array.from(grid.children);

  // 画像ロード待ち
  const imgs = cells.map(c => c.querySelector("img")).filter(Boolean);
  await Promise.all(imgs.map(img => (
    img.complete ? Promise.resolve() : new Promise(res => img.addEventListener("load", res, { once: true }))
  )));

  // 縦横判定してクラス付け
  cells.forEach(cell => {
    const img = cell.querySelector("img");
    if (!img) return;

    const isLandscape = img.naturalWidth > img.naturalHeight;
    cell.dataset.orientation = isLandscape ? "landscape" : "portrait";
    cell.classList.toggle("is-landscape", isLandscape);
    cell.classList.toggle("is-portrait", !isLandscape);
  });

  // shuffle
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function hasAdjacentLandscape(items) {
    for (let i = 0; i < items.length - 1; i++) {
      if (
        items[i].dataset.orientation === "landscape" &&
        items[i + 1].dataset.orientation === "landscape"
      ) return true;
    }
    return false;
  }

  let attempts = 0;
  do {
    shuffle(cells);
    attempts++;
  } while (hasAdjacentLandscape(cells) && attempts < 50);

  cells.forEach(el => grid.appendChild(el));
  console.log("shuffled, attempts:", attempts);
});
