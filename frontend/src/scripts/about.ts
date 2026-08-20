// About page behaviour.
//
// The counters, section reveals and theme dip are already handled globally by
// main.ts — this file only adds what is specific to this page. GSAP is loaded
// lazily and only for the two pinned sections, so the rest of the page costs
// nothing extra.

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canPin = window.matchMedia("(min-width: 861px)").matches && !reduceMotion;

// ------------------------------------------------------------- section rail
{
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-rail]"));
  const targets = links
    .map((a) => document.getElementById(a.dataset.rail!))
    .filter((el): el is HTMLElement => Boolean(el));

  if (targets.length) {
    let currentId = "";
    // Which section holds the middle of the viewport. Comparing intersection
    // ratios instead would favour short sections over tall ones, and the
    // pinned sections are very tall.
    const update = () => {
      const mid = window.innerHeight / 2;
      let best = targets[0].id;
      for (const el of targets) {
        const r = el.getBoundingClientRect();
        if (r.top > mid) break; // targets are in document order
        best = el.id;
        if (r.bottom >= mid) break;
      }
      if (best === currentId) return;
      currentId = best;
      links.forEach((a) => a.classList.toggle("is-current", a.dataset.rail === best));
    };

    // Called straight from the scroll event rather than gated behind rAF: a
    // dropped frame would otherwise latch the guard and freeze the rail for
    // good. Twelve getBoundingClientRect calls per event is cheap enough.
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
  }
}

// -------------------------------------------------------------------- map
{
  const spots = Array.from(document.querySelectorAll<SVGGElement>("[data-spot]"));
  const cards = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-spotcard]"));
  const routes = Array.from(document.querySelectorAll<SVGPathElement>("[data-route]"));

  const select = (id: string) => {
    spots.forEach((s) => s.classList.toggle("is-active", s.dataset.spot === id));
    cards.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.spotcard === id)));
  };

  spots.forEach((s) => {
    s.addEventListener("click", () => select(s.dataset.spot!));
    // The pins are focusable, so they must answer the keyboard too.
    s.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        select(s.dataset.spot!);
      }
    });
  });
  cards.forEach((c) => c.addEventListener("click", () => select(c.dataset.spotcard!)));
  if (spots.length) select(spots[0].dataset.spot!);

  // Routes draw themselves once the map is on screen, then keep flowing.
  const map = document.querySelector(".ab-map");
  if (map && routes.length) {
    const draw = () => {
      routes.forEach((path, i) => {
        if (reduceMotion) {
          path.classList.add("is-drawn");
          return;
        }
        const len = path.getTotalLength();
        path.style.strokeDasharray = `${len}`;
        path.style.strokeDashoffset = `${len}`;
        path.style.transition = `stroke-dashoffset 1.6s ease ${(0.15 + i * 0.25).toFixed(2)}s`;
        // transitionend rather than a matching timer, so the handover to the
        // CSS flow animation can never disagree about when the draw finished.
        path.addEventListener(
          "transitionend",
          () => {
            path.style.transition = "";
            path.style.strokeDasharray = "";
            path.style.strokeDashoffset = "";
            path.classList.add("is-drawn");
          },
          { once: true },
        );
        // Force a style flush so the browser sees the starting offset before
        // the target is applied — more reliable here than waiting on rAF.
        void path.getBoundingClientRect();
        path.style.strokeDashoffset = "0";
      });
    };

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries, obs) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              draw();
              obs.disconnect();
            }
          }
        },
        { rootMargin: "0px 0px -20% 0px" },
      );
      io.observe(map);
    } else {
      draw();
    }
  }
}

// -------------------------------------------------------------- award filter
{
  const chips = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-cat]"));
  const marquee = document.querySelector<HTMLElement>("[data-marquee]");
  const note = document.querySelector<HTMLElement>("[data-marquee-note]");
  const awardEls = Array.from(document.querySelectorAll<HTMLElement>(".ab-award"));

  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      const cat = chip.dataset.cat ?? "All";
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      const filtering = cat !== "All";

      marquee?.classList.toggle("is-filtered", filtering);
      awardEls.forEach((el) => {
        const isDupe = el.dataset.dupe === "1";
        // The duplicate half exists only to make the loop seamless; once the
        // list stops moving it would just read as everything listed twice.
        el.hidden = filtering ? isDupe || el.dataset.cat !== cat : false;
      });
      if (note) {
        note.textContent = filtering
          ? `Showing ${cat.toLowerCase()} awards`
          : "Hover to pause · select a category to filter";
      }
    }),
  );
}

// ------------------------------------------------------------- language tabs
{
  document.querySelectorAll<HTMLElement>(".ab-film__langs").forEach((group) => {
    const buttons = Array.from(group.querySelectorAll<HTMLButtonElement>(".ab-lang"));
    buttons.forEach((b) =>
      b.addEventListener("click", () => {
        buttons.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      }),
    );
  });
}

// ------------------------------------------- pinned sections (GSAP, lazy) ---
if (canPin) {
  void (async () => {
    const [{ gsap }, { ScrollTrigger }] = await Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]);
    gsap.registerPlugin(ScrollTrigger);

    // ---- Values: the section is held while the six advance ---------------
    const valuesSection = document.querySelector<HTMLElement>("[data-values]");
    const valueEls = Array.from(document.querySelectorAll<HTMLElement>("[data-value]"));
    const indexEls = Array.from(document.querySelectorAll<HTMLElement>("[data-index]"));

    if (valuesSection && valueEls.length) {
      valuesSection.classList.add("is-pinned");
      let current = -1;
      const setActive = (i: number) => {
        if (i === current) return;
        current = i;
        valueEls.forEach((el, idx) => el.classList.toggle("is-active", idx === i));
        indexEls.forEach((el, idx) => el.classList.toggle("is-active", idx === i));
      };
      setActive(0);

      ScrollTrigger.create({
        trigger: valuesSection,
        start: "center center",
        end: () => `+=${valueEls.length * 300}`,
        pin: true,
        pinSpacing: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          setActive(
            Math.min(valueEls.length - 1, Math.floor(self.progress * valueEls.length)),
          );
        },
      });
    }

    // ---- Timeline: vertical scroll drives horizontal travel ---------------
    const section = document.querySelector<HTMLElement>("[data-time]");
    const rail = document.querySelector<HTMLElement>("[data-time-rail]");
    const bar = document.querySelector<HTMLElement>("[data-time-bar]");
    const eraEls = Array.from(document.querySelectorAll<HTMLElement>("[data-era]"));
    const miles = Array.from(document.querySelectorAll<HTMLElement>(".ab-mile"));

    if (section && rail) {
      section.classList.add("is-pinned");
      const distance = () => Math.max(0, rail.scrollWidth - window.innerWidth + 64);

      gsap.to(rail, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${distance() + window.innerHeight * 0.4}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (bar) bar.style.width = `${(self.progress * 100).toFixed(1)}%`;
            // Highlight the era of whichever milestone is nearest the left edge.
            const idx = Math.min(
              miles.length - 1,
              Math.round(self.progress * (miles.length - 1)),
            );
            const era = miles[idx]?.dataset.era;
            eraEls.forEach((e) => e.classList.toggle("is-current", e.dataset.era === era));
          },
        },
      });
    }
  })();
} else {
  // No pinning: the values stage stays a plain stacked list and the timeline
  // becomes a horizontally scrollable rail, which is the right behaviour on a
  // phone anyway.
  const viewport = document.querySelector<HTMLElement>(".ab-time__viewport");
  if (viewport) {
    viewport.style.overflowX = "auto";
    viewport.style.scrollSnapType = "x proximity";
    document.querySelectorAll<HTMLElement>(".ab-mile").forEach((m) => {
      m.style.scrollSnapAlign = "start";
    });
  }
}
