import Atropos from "atropos";
import "atropos/css";

// ---- Hero: load the background video on desktop only; mobile keeps the
//      poster image (saves data + avoids a hidden video playing) ----
const heroBg = document.querySelector<HTMLElement>(".hero__bg");
const heroVideo = document.querySelector<HTMLIFrameElement>(".hero__video");
if (heroBg && heroVideo && heroVideo.dataset.src) {
  if (window.matchMedia("(min-width: 861px)").matches) {
    heroVideo.addEventListener("load", () => {
      // small delay so the video has begun painting before the poster clears
      window.setTimeout(() => heroBg.classList.add("video-ready"), 600);
    });
    heroVideo.src = heroVideo.dataset.src;
  }
}

// ---- Capability wheel: draggable handle rotates a 3-card carousel ----
const cards = Array.from(document.querySelectorAll<HTMLElement>(".cap__card"));
const handle = document.getElementById("capHandle");
const rail = document.getElementById("capRail");

if (cards.length && handle && rail) {
  let wheel = 0; // fractional index, wraps every 3
  let dragging = false;
  let pointerStart = 0;
  let wheelStart = 0;
  let autoTimer: number | null = null;
  let userInteracted = false;
  const stopAuto = () => {
    if (autoTimer !== null) { clearTimeout(autoTimer); autoTimer = null; }
  };
  const noteInteraction = () => { userInteracted = true; stopAuto(); };

  const wrap3 = (v: number) => {
    let d = v % 3;
    if (d > 1.5) d -= 3;
    if (d <= -1.5) d += 3;
    return d;
  };

  const render = () => {
    cards.forEach((card, i) => {
      const d = wrap3(i - wheel);
      const a = Math.abs(d);
      card.style.transform =
        `translateY(${(d * 122).toFixed(1)}px) translateX(${(a * -26).toFixed(1)}px) ` +
        `rotate(${(d * 6).toFixed(2)}deg) scale(${(1 - a * 0.13).toFixed(3)})`;
      card.style.opacity = Math.max(0.25, 1 - a * 0.45).toFixed(2);
      card.style.zIndex = String(10 - Math.round(a * 8));
      card.style.transition = dragging
        ? "none"
        : "transform .55s cubic-bezier(.2,.8,.2,1), opacity .45s ease";
    });
    const norm = (((wheel % 3) + 3) % 3) / 3;
    handle.style.top = (norm * 74 + 13).toFixed(2) + "%";
    handle.style.transition = dragging
      ? "none"
      : "top .55s cubic-bezier(.2,.8,.2,1)";
    handle.setAttribute("aria-valuenow", String(((Math.round(wheel) % 3) + 3) % 3));
  };

  const onMove = (e: PointerEvent) => {
    const dy = e.clientY - pointerStart;
    wheel = wheelStart + dy / 96;
    render();
  };
  const onUp = () => {
    dragging = false;
    wheel = Math.round(wheel);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    render();
  };
  handle.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    noteInteraction();
    dragging = true;
    pointerStart = e.clientY;
    wheelStart = wheel;
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  });
  handle.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") { noteInteraction(); wheel = Math.round(wheel) + 1; render(); }
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") { noteInteraction(); wheel = Math.round(wheel) - 1; render(); }
  });
  // advance on card click-through is preserved; also allow tapping a card to focus it
  cards.forEach((card, i) => {
    card.addEventListener("click", (e) => {
      if (Math.round(((wheel % 3) + 3) % 3) !== i) {
        e.preventDefault();
        noteInteraction();
        wheel = i;
        render();
      }
    });
  });

  // Auto-advance the wheel a few steps once the cards appear, then leave
  // it for the user to drag. First move fires quickly so it starts as
  // soon as the cards are on screen.
  const startAuto = () => {
    if (userInteracted || autoTimer !== null) return;
    let steps = 0;
    const tick = () => {
      if (userInteracted || steps >= 3) { autoTimer = null; return; }
      steps++;
      wheel = Math.round(wheel) + 1;
      render();
      autoTimer = window.setTimeout(tick, 1500);
    };
    autoTimer = window.setTimeout(tick, 450);
  };

  // Trigger the heading reveal + auto-slide the moment the cards start
  // entering the viewport (once).
  const capIntro = document.querySelector<HTMLElement>(".cap__intro");
  const capCards = document.getElementById("capCards");
  const capTarget = capCards ?? document.getElementById("capabilities");
  if (capTarget && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            capIntro?.classList.add("is-visible");
            startAuto();
            io.disconnect();
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(capTarget);
  } else {
    capIntro?.classList.add("is-visible");
  }

  render();
}

// ---- Scroll-driven theme: the whole page dips to dark as the energy
//      section reaches the middle of the viewport, then returns to light.
//      Text/background colors are driven through :root CSS variables so
//      every section inverts together. ----
const energy = document.getElementById("energy");
const root = document.documentElement;
const mix = (a: number[], b: number[], t: number) =>
  "rgb(" + a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",") + ")";
const mix4 = (a: number[], b: number[], t: number) =>
  "rgba(" +
  [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t)).join(",") +
  "," + (a[3] + (b[3] - a[3]) * t).toFixed(3) + ")";

if (energy && window.matchMedia("(max-width: 860px)").matches) {
  // Mobile: cheap 2-step toggle — add/remove .theme-dark once when the
  // section reaches the centre band; CSS transitions do the fade.
  const themeIO = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => root.classList.toggle("theme-dark", e.isIntersecting)),
    { rootMargin: "-35% 0px -35% 0px" },
  );
  themeIO.observe(energy);
} else if (energy) {
  // light-theme -> dark-theme color pairs
  const bgL = [251, 247, 242], bgD = [20, 18, 13];
  const inkL = [23, 21, 15], inkD = [251, 247, 242];
  const mutedL = [107, 100, 89], mutedD = [190, 182, 170];
  const faintL = [139, 131, 119], faintD = [151, 144, 132];
  const panelL = [245, 239, 229], panelD = [31, 27, 22];
  const lineL = [23, 21, 15, 0.12], lineD = [251, 247, 242, 0.16];
  const cardBgL = [255, 255, 255], cardBgD = [35, 31, 25];
  const cardTextL = [23, 21, 15], cardTextD = [251, 247, 242];
  const cardMutedL = [107, 100, 89], cardMutedD = [176, 168, 154];
  const cardBorderL = [23, 21, 15, 0.06], cardBorderD = [251, 247, 242, 0.12];

  let ticking = false;
  const update = () => {
    ticking = false;
    const rect = energy.getBoundingClientRect();
    const vh = window.innerHeight;
    const center = rect.top + rect.height / 2;
    const s = center - vh / 2; // >0 approaching from below, <0 leaving above
    const fade = vh * 0.75;
    const hold = vh * 0.5; // extra dark held on the way out only
    // Entrance fades exactly as before; the exit holds dark, then fades.
    let d = s >= 0 ? 1 - s / fade : 1 - Math.max(0, -s - hold) / fade;
    d = Math.min(1, Math.max(0, d));
    d = d * d * (3 - 2 * d); // smoothstep

    root.style.setProperty("--bg", mix(bgL, bgD, d));
    root.style.setProperty("--ink", mix(inkL, inkD, d));
    root.style.setProperty("--muted", mix(mutedL, mutedD, d));
    root.style.setProperty("--faint", mix(faintL, faintD, d));
    root.style.setProperty("--panel", mix(panelL, panelD, d));
    root.style.setProperty("--line", mix4(lineL, lineD, d));
    root.style.setProperty("--card-bg", mix(cardBgL, cardBgD, d));
    root.style.setProperty("--card-text", mix(cardTextL, cardTextD, d));
    root.style.setProperty("--card-muted", mix(cardMutedL, cardMutedD, d));
    root.style.setProperty("--card-border", mix4(cardBorderL, cardBorderD, d));
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();
}

// ---- Generic on-scroll reveal for section headers ----
const revealGroups = document.querySelectorAll<HTMLElement>(".reveal-group");
if (revealGroups.length) {
  if ("IntersectionObserver" in window) {
    const revIO = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    revealGroups.forEach((el) => revIO.observe(el));
  } else {
    revealGroups.forEach((el) => el.classList.add("is-inview"));
  }
}

// ---- 3D parallax tilt for the floating images (Atropos, mouse only) ----
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const wideEnough = window.matchMedia("(min-width: 861px)").matches;
if (finePointer && !reduceMotion && wideEnough) {
  document.querySelectorAll<HTMLElement>(".atropos").forEach((el) => {
    Atropos({
      el,
      rotateXMax: 5,
      rotateYMax: 5,
      duration: 400,
      shadow: false,
      highlight: false,
    });
  });
}

// ---- Rolling "spinner" counters for the big numbers ----
type Parsed = { prefix: string; suffix: string; grouping: boolean; decimals: number; value: number };
const parseNum = (str: string): Parsed | null => {
  const m = str.match(/^(\D*)([\d.,]*\d)(\D*)$/);
  if (!m) return null;
  const numStr = m[2];
  return {
    prefix: m[1],
    suffix: m[3],
    grouping: numStr.includes(","),
    decimals: numStr.includes(".") ? numStr.length - numStr.indexOf(".") - 1 : 0,
    value: parseFloat(numStr.replace(/,/g, "")),
  };
};
const fmtNum = (v: number, p: Parsed) => {
  const s = p.grouping
    ? v.toLocaleString("en-US", { minimumFractionDigits: p.decimals, maximumFractionDigits: p.decimals })
    : v.toFixed(p.decimals);
  return p.prefix + s + p.suffix;
};

const counters = Array.from(document.querySelectorAll<HTMLElement>(".count"))
  .map((el) => ({ el, p: parseNum((el.textContent || "").trim()) }))
  .filter((c): c is { el: HTMLElement; p: Parsed } => c.p !== null);

if (counters.length) {
  const reduceCount = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const run = (c: { el: HTMLElement; p: Parsed }) => {
    const dur = 1500;
    const ease = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)); // easeOutExpo
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const t = Math.min(1, (ts - start) / dur);
      c.el.textContent = fmtNum(c.p.value * ease(t), c.p);
      if (t < 1) requestAnimationFrame(step);
      else c.el.textContent = fmtNum(c.p.value, c.p);
    };
    requestAnimationFrame(step);
  };

  if (reduceCount) {
    counters.forEach((c) => { c.el.textContent = fmtNum(c.p.value, c.p); });
  } else {
    // start each at zero, then roll up when it scrolls into view
    counters.forEach((c) => { c.el.textContent = fmtNum(0, c.p); });
    if ("IntersectionObserver" in window) {
      const cIO = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const c = counters.find((x) => x.el === entry.target);
              if (c) run(c);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 },
      );
      counters.forEach((c) => cIO.observe(c.el));
    } else {
      counters.forEach(run);
    }
  }
}
