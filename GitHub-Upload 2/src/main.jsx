import React, { useEffect, useRef, useState, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/instrument-serif/latin-400.css";
import { features, references, DOC, SLIDES } from "./data";
import FallbackTree from "./FallbackTree";
import "./style.css";
const TreeScene = lazy(() => import("./TreeScene"));
gsap.registerPlugin(ScrollTrigger, useGSAP);
const LeafIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path d="M9 29C5 12 19 7 32 8c0 17-10 27-23 21Z" fill="currentColor" />
    <path d="M9 32 27 13" stroke="var(--paper)" strokeWidth="1.5" />
  </svg>
);
const Arrow = () => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    aria-hidden="true"
  >
    <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);
function useReducedMotion() {
  const [reduce, set] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)"),
      fn = () => set(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduce;
}

function App() {
  const root = useRef(null),
    menuButton = useRef(null),
    view = useRef({ phase: 0 }),
    reduced = useReducedMotion();
  const [pause, setPause] = useState(
      new URLSearchParams(location.search).get("motion") === "off",
    ),
    [simple, setSimple] = useState(
      new URLSearchParams(location.search).has("simple"),
    ),
    [selected, setSelected] = useState(1),
    [menu, setMenu] = useState(false),
    [screen, setScreen] = useState(0),
    [context, setContext] = useState(false),
    [review, setReview] = useState(false);
  const motion = !reduced && !pause;
  useEffect(() => {
    document.documentElement.dataset.motion = motion ? "on" : "off";
  }, [motion]);
  useGSAP(
    () => {
      if (!motion) {
        view.current.phase = 0;
        return;
      }
      const mm = gsap.matchMedia();
      mm.add("(min-width: 861px)", () => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: ".living-story",
              start: "top top",
              end: "bottom bottom",
              scrub: 0.8,
            },
          })
          .to(view.current, { phase: 0.45, duration: 1, ease: "none" })
          .to(view.current, { phase: 1, duration: 1, ease: "none" })
          .to(view.current, { phase: 1.55, duration: 1, ease: "none" });
      });
      mm.add("(max-width: 860px)", () => {
        gsap.to(view.current, {
          phase: 1.2,
          ease: "none",
          scrollTrigger: {
            trigger: ".tree-stage",
            start: "top bottom",
            end: "bottom top",
            scrub: 0.65,
          },
        });
      });
      document.fonts.ready.then(() => ScrollTrigger.refresh());
      return () => mm.revert();
    },
    { scope: root, dependencies: [motion], revertOnUpdate: true },
  );
  useEffect(() => {
    const close = (e) => {
      if (e.key === "Escape" && menu) {
        setMenu(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [menu]);
  const selectFeature = (i) => setSelected(i);
  function handleTabs(e) {
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
      e.preventDefault();
      let next =
        e.key === "Home"
          ? 0
          : e.key === "End"
            ? 3
            : (screen + (e.key === "ArrowRight" ? 1 : 3)) % 4;
      setScreen(next);
      document.getElementById("screen-tab-" + next)?.focus();
    }
  }
  return (
    <div ref={root}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Leaf home">
          <LeafIcon />
          <span>Leaf</span>
        </a>
        <button
          className="menu-toggle"
          ref={menuButton}
          aria-expanded={menu}
          aria-controls="main-nav"
          onClick={() => setMenu(!menu)}
        >
          {menu ? "Close" : "Menu"} <span>{menu ? "−" : "+"}</span>
        </button>
        <nav
          id="main-nav"
          className={menu ? "is-open" : ""}
          aria-label="Main navigation"
        >
          {[
            ["The idea", "#problem"],
            ["Features", "#features"],
            ["The interface", "#interface"],
            ["Way Forward", "#way-forward"],
            ["Our team", "#team"],
          ].map(([t, h]) => (
            <a key={h} href={h} onClick={() => setMenu(false)}>
              {t}
            </a>
          ))}
          <a
            className="nav-proposal"
            href={DOC}
            target="_blank"
            rel="noreferrer"
          >
            Read the proposal <Arrow />
          </a>
        </nav>
      </header>
      <main id="main" tabIndex="-1">
        <div className="living-story" id="home">
          <div className="tree-stage">
            <div className="stage-sun" />
            {simple ? (
              <FallbackTree />
            ) : (
              <Suspense
                fallback={
                  <>
                    <FallbackTree />
                    <span className="loading-tree" role="status">
                      Preparing the 3D tree…
                    </span>
                  </>
                }
              >
                <TreeScene
                  motion={motion}
                  simple={false}
                  view={view}
                  selected={selected}
                  onSelect={selectFeature}
                  onUnavailable={() => setSimple(true)}
                />
              </Suspense>
            )}
            <div className="tree-controls">
              <button
                onClick={() => setPause(!pause)}
                disabled={reduced}
                aria-pressed={pause || reduced}
              >
                {reduced
                  ? "Reduced motion"
                  : pause
                    ? "Resume motion"
                    : "Pause motion"}
              </button>
              <button onClick={() => setSimple(!simple)} aria-pressed={simple}>
                {simple ? "Show 3D tree" : "Use simple view"}
              </button>
            </div>
            <div className="tree-caption">
              <span className="tree-caption-icon">
                <LeafIcon />
              </span>
              <div aria-live="polite">
                <strong>{features[selected].short}</strong>
                <p>
                  {
                    [
                      "Give every plant a shared care record.",
                      "A photo is the beginning. Context completes it.",
                      "Observations first. Suggested checks next.",
                      "One next action, with someone to own it.",
                      "Every follow-up adds to the story.",
                      "Bring uncertain cases to authorised staff.",
                      "Keep useful knowledge close to the care record.",
                    ][selected]
                  }
                </p>
              </div>
            </div>
            <span className="tree-instruction">
              {simple
                ? "Botanical view · explore the feature list below"
                : "Select a marker · drag the tree to orbit"}
            </span>
          </div>
          <div className="story-column">
            <section className="hero story-section">
              <p className="concept-label">
                <span />A proposed campus plant-care assistant
              </p>
              <h1>
                Leaf<span className="h1-period">.</span>
              </h1>
              <p className="hero-tagline">
                A greener Earth <br />
                starts with a leaf.
              </p>
              <p className="hero-description">
                A little more context. <br />A clearer next step. <br />A shared
                way to care.
              </p>
              <a className="button" href="#problem">
                Discover the idea <Arrow />
              </a>
              <div className="hero-credit">
                By Error 404
                <br />
                <span>Politeknik Besut Terengganu</span>
              </div>
            </section>
            <section className="problem story-section" id="problem">
              <p className="section-kicker">The problem</p>
              <h2>
                A concern needs
                <br />
                more than a photo.
              </h2>
              <p className="section-lead">
                A yellow leaf can raise a question. Understanding what changed
                takes context, a care history and someone to follow up.
              </p>
              <div className="problem-list">
                <article>
                  <h3>What changed?</h3>
                  <p>
                    Visible symptoms can have several explanations. The next
                    check may be unclear.
                  </p>
                </article>
                <article>
                  <h3>Who last cared for it?</h3>
                  <p>
                    Watering, photographs and actions may live in separate
                    places—or go unrecorded.
                  </p>
                </article>
                <article>
                  <h3>What happens next?</h3>
                  <p>
                    A report can stall without a named caretaker or a date to
                    check again.
                  </p>
                </article>
              </div>
              <p className="honesty-note">
                Campus challenges to investigate through student and gardener
                interviews.
              </p>
            </section>
            <section className="solution story-section" id="solution">
              <p className="section-kicker">The proposed solution</p>
              <h2>
                One plant.
                <br />
                One shared story.
              </h2>
              <p className="section-lead">
                Leaf brings the care journey together: check, understand and
                follow up.
              </p>
              <div className="solution-steps">
                <article>
                  <span>Check</span>
                  <p>Capture photographs and the context around the concern.</p>
                </article>
                <article>
                  <span>Understand</span>
                  <p>
                    Review observations, possible causes and suggested checks.
                  </p>
                </article>
                <article>
                  <span>Follow up</span>
                  <p>
                    Assign care, record action and return with a dated
                    observation.
                  </p>
                </article>
              </div>
              <p className="objective">
                The aim: help users choose a next step, assign care and record a
                follow-up.
              </p>
            </section>
            <section className="feature-section story-section" id="features">
              <p className="section-kicker">Core features</p>
              <h2>Care, connected.</h2>
              <p className="section-lead">
                Explore the tree or choose a feature below. Each one belongs to
                the same care record.
              </p>
              <div className="feature-list" aria-label="Proposed features">
                {features.map((f, i) => (
                  <button
                    key={f.short}
                    className={selected === i ? "active" : ""}
                    onClick={() => selectFeature(i)}
                    aria-pressed={selected === i}
                    aria-controls="feature-detail"
                  >
                    <span>{f.short}</span>
                    <span aria-hidden="true">{selected === i ? "−" : "+"}</span>
                  </button>
                ))}
              </div>
              <div
                id="feature-detail"
                className="feature-detail"
                aria-live="polite"
              >
                <h3>{features[selected].title}</h3>
                <p>{features[selected].body}</p>
              </div>
            </section>
          </div>
        </div>
        <section className="journey section-wrap" id="journey">
          <div className="section-heading">
            <div>
              <p className="section-kicker">The user journey</p>
              <h2>
                From a concern
                <br />
                to a follow-up.
              </h2>
            </div>
            <p>
              A student notices yellowing leaves.
              <br />
              Here is how the proposed flow would help.
            </p>
          </div>
          <ol className="journey-grid">
            {[
              [
                "Find the plant",
                "Open its profile from a list or plant ID. QR tags are a future extension.",
              ],
              [
                "Add the context",
                "Photograph the plant and affected area. Answer the care questions.",
              ],
              [
                "Review the guidance",
                "Read what is visible, what might explain it and what to check next.",
              ],
              [
                "Choose an action",
                "Record a next step or request an authorised gardener’s review.",
              ],
              [
                "Give care an owner",
                "Assign the task. The caretaker records the action and status.",
              ],
              [
                "Return and compare",
                "Add a dated photograph and observation to the journal.",
              ],
            ].map(([t, p], i) => (
              <li key={t}>
                <span className="step-number">{i + 1}</span>
                <h3>{t}</h3>
                <p>{p}</p>
              </li>
            ))}
          </ol>
          <p className="journey-end">
            Uncertain guidance or a worsening condition? Request authorised
            staff review.
          </p>
        </section>
        <section className="interface section-wrap" id="interface">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Inside Leaf</p>
              <h2>
                A calmer way
                <br />
                to care.
              </h2>
            </div>
            <p>
              Four AppSheet-compatible screen concepts.
              <br />
              <strong>Illustrative interfaces. No working app yet.</strong>
            </p>
          </div>
          <div className="interface-stage">
            <div className="interface-copy">
              <div
                role="tablist"
                aria-label="Illustrative app screens"
                className="screen-tabs"
              >
                {[
                  "Home",
                  "New plant check",
                  "Care results",
                  "Plant profile",
                ].map((t, i) => (
                  <button
                    key={t}
                    role="tab"
                    id={"screen-tab-" + i}
                    aria-selected={screen === i}
                    aria-controls="screen-panel"
                    tabIndex={screen === i ? 0 : -1}
                    onKeyDown={handleTabs}
                    onClick={() => setScreen(i)}
                  >
                    <span>{t}</span>
                    <Arrow />
                  </button>
                ))}
              </div>
              <div className="screen-explanation">
                <h3>
                  {
                    [
                      "Start with the next action.",
                      "Good context comes first.",
                      "Guidance with clear limits.",
                      "A record that keeps growing.",
                    ][screen]
                  }
                </h3>
                <p>
                  {
                    [
                      "See the latest care activity and begin a new check from a simple campus home.",
                      "Capture both the whole plant and the affected area. Record care conditions before asking for guidance.",
                      "Keep visible observations separate from possible causes. Uncertain cases can be passed to staff.",
                      "Link a caretaker, checks, tasks and dated observations to the same plant.",
                    ][screen]
                  }
                </p>
                <p className="demo-note">
                  {screen === 1
                    ? "Try “Add care context” in the concept screen."
                    : screen === 2
                      ? "Try requesting a staff review."
                      : "Choose a screen to explore the proposed journey."}
                </p>
              </div>
            </div>
            <div className="phone-wrap">
              <div
                className="phone"
                id="screen-panel"
                role="tabpanel"
                aria-labelledby={"screen-tab-" + screen}
              >
                <div className="phone-top">
                  <LeafIcon />
                  <strong>Leaf</strong>
                  <span>Concept</span>
                </div>
                {screen === 0 ? (
                  <>
                    <h3>
                      Good care
                      <br />
                      starts here.
                    </h3>
                    <div className="plant-art">
                      <svg viewBox="0 0 220 160" aria-hidden="true">
                        <path
                          d="M110 141V47m0 57C70 102 55 76 62 57c32 0 48 15 48 47m0-23c0-35 15-47 44-46 2 24-17 45-44 46m0 46c29 0 52-20 55-42-32-3-49 10-55 42"
                          fill="#88a968"
                          stroke="#456a41"
                          strokeWidth="2"
                        />
                        <path d="m81 137 9 23h40l9-23" fill="#c4ba96" />
                      </svg>
                    </div>
                    <button
                      className="phone-primary"
                      onClick={() => setScreen(1)}
                    >
                      New plant check <span>+</span>
                    </button>
                    <div className="phone-task">
                      <span>Your next action · example</span>
                      <strong>Check soil moisture</strong>
                      <p>PBT-001 · caretaker to be assigned</p>
                    </div>
                    <button className="phone-link" onClick={() => setScreen(3)}>
                      View plant record <Arrow />
                    </button>
                  </>
                ) : screen === 1 ? (
                  <>
                    <h3>New plant check</h3>
                    <p className="phone-sub">PBT-001 · illustrative record</p>
                    <div className="photo-placeholder">
                      <LeafIcon />
                      <strong>Full plant + affected area</strong>
                      <span>Photographs would be added here.</span>
                    </div>
                    <div className="phone-field">
                      <span>Care context</span>
                      <p>Water · soil · light · setting</p>
                    </div>
                    <button
                      className="phone-secondary"
                      aria-expanded={context}
                      onClick={() => setContext(!context)}
                    >
                      {context ? "Hide example context" : "Add care context"}{" "}
                      <span>{context ? "−" : "+"}</span>
                    </button>
                    {context && (
                      <p className="context-example">
                        Example only: yellowing noticed this week. Soil moisture
                        and drainage have not yet been checked.
                      </p>
                    )}
                    <button
                      className="phone-primary"
                      onClick={() => setScreen(2)}
                    >
                      Review example guidance <Arrow />
                    </button>
                  </>
                ) : screen === 2 ? (
                  <>
                    <h3>Care results</h3>
                    <p className="phone-sub">
                      Illustrative guidance · not a diagnosis
                    </p>
                    <div className="result-item">
                      <span>Visible observation</span>
                      <strong>Some leaves are yellowing.</strong>
                    </div>
                    <div className="result-item">
                      <span>Possible causes</span>
                      <strong>Watering or drainage.</strong>
                      <p>More context is needed.</p>
                    </div>
                    <div className="result-item next">
                      <span>Suggested next check</span>
                      <strong>Check soil moisture and standing water.</strong>
                    </div>
                    <button
                      className="phone-primary"
                      onClick={() => setReview(!review)}
                      aria-pressed={review}
                    >
                      {review
                        ? "Example review selected"
                        : "Request staff review"}{" "}
                      <Arrow />
                    </button>
                    <p className="phone-disclaimer" aria-live="polite">
                      {review
                        ? "Demonstration only. No request has been sent."
                        : "Proposed AI support requires feasibility testing and human review."}
                    </p>
                  </>
                ) : (
                  <>
                    <h3>Plant profile</h3>
                    <p className="phone-sub">PBT-001 · illustrative record</p>
                    <div className="profile-leaf">
                      <LeafIcon />
                    </div>
                    <div className="phone-field">
                      <span>Plant identity</span>
                      <strong>Species to be confirmed</strong>
                    </div>
                    <div className="phone-field">
                      <span>Caretaker</span>
                      <strong>Assign a person or club</strong>
                    </div>
                    <div className="journal-item">
                      <span>Care journal</span>
                      <strong>A dated photo + observation</strong>
                      <p>Future checks stay linked to this profile.</p>
                    </div>
                    <button
                      className="phone-secondary"
                      onClick={() => setScreen(1)}
                    >
                      Start a plant check <Arrow />
                    </button>
                  </>
                )}
                <div className="phone-bottom">
                  Home <span>Plants</span> <span>Journal</span>
                </div>
              </div>
              <span className="phone-caption">
                Designed for the proposed care journey.
              </span>
            </div>
          </div>
        </section>
        <section className="ecosystem section-wrap" id="ecosystem">
          <div className="section-heading">
            <div>
              <p className="section-kicker">The Google ecosystem</p>
              <h2>A practical foundation.</h2>
            </div>
            <p>
              Built around AppSheet and the institution’s intended Google
              Workspace for Education Plus environment.
            </p>
          </div>
          <div className="ecosystem-grid">
            {[
              [
                "AppSheet",
                "The application",
                "Forms, plant profiles, tasks, journals and staff review views.",
              ],
              [
                "Google Sheets",
                "The shared records",
                "Linked plants, checks, tasks, journal entries, reports and users.",
              ],
              [
                "Google Drive",
                "The supporting material",
                "Plant photographs and documents connected to the care record.",
              ],
            ].map(([a, b, c]) => (
              <article key={a}>
                <span className="google-tool">{a}</span>
                <h3>{b}</h3>
                <p>{c}</p>
              </article>
            ))}
          </div>
          <div className="ai-note">
            <h3>AI has two distinct roles.</h3>
            <div>
              <p>
                <strong>Development support.</strong> Gemini Apps can assist
                ideation and care-content drafts, with sources and guidance
                reviewed by people.
              </p>
              <p>
                <strong>In-app photo analysis is proposed.</strong> Confirm the
                permitted connection, licence, administrator access, cost and
                organiser rules first. Call a script requires Core or above;
                Extract AI requires Enterprise Plus. Institutional access is
                unconfirmed. <a href="#references">See sources</a>.
              </p>
            </div>
          </div>
        </section>
        <section className="pilot section-wrap" id="pilot">
          <div>
            <p className="section-kicker">A proposed campus pilot</p>
            <h2>
              Start small.
              <br />
              Learn carefully.
            </h2>
            <p className="section-lead">
              Test whether Leaf helps people understand their next action and
              keep a clearer care record.
            </p>
            <p className="pilot-caveat">
              Subject to permission, account access and a feasible prototype.
              These are proposed test sizes, not existing adoption.
            </p>
          </div>
          <div className="pilot-plan">
            <div className="pilot-numbers">
              <div>
                <strong>10</strong>
                <span>registered plants</span>
              </div>
              <div>
                <strong>5</strong>
                <span>test users</span>
              </div>
            </div>
            <h3>What we would measure</h3>
            <ul>
              <li>
                <strong>Reporting and review time</strong>
                <span>From submission to authorised review.</span>
              </li>
              <li>
                <strong>Task completion</strong>
                <span>Completed tasks as a share of tasks due.</span>
              </li>
              <li>
                <strong>Follow-up coverage</strong>
                <span>Plants with a dated follow-up check.</span>
              </li>
              <li>
                <strong>User understanding</strong>
                <span>Can users explain their next action?</span>
              </li>
            </ul>
            <p>
              Plant condition would be recorded as observations. Water use would
              only be measured with a consistent, feasible method.
            </p>
          </div>
        </section>
        <section className="roadmap section-wrap" id="way-forward">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Way Forward</p>
              <h2>Room to grow.</h2>
            </div>
            <p>
              A proposed one-to-five-year direction.
              <br />
              Each stage depends on what the earlier work establishes.
            </p>
          </div>
          <div className="roadmap-grid">
            <article>
              <span className="year">Year 1</span>
              <h3>Establish the roots.</h3>
              <p>
                Validate campus needs and account access. Test a permitted AI
                connection, build the core care journey and run a small approved
                pilot.
              </p>
              <ul>
                <li>Plant profiles, checks and tasks</li>
                <li>Care journal and staff review</li>
                <li>Pilot, feedback and refinement</li>
              </ul>
            </article>
            <article>
              <span className="year">Years 2–3</span>
              <h3>Strengthen the branches.</h3>
              <p>
                Extend the useful parts of the pilot into a more consistent
                campus care routine.
              </p>
              <ul>
                <li>QR tags and searchable IDs</li>
                <li>Watering logs and richer reports</li>
                <li>English and Bahasa Melayu</li>
                <li>Formal plant adoption by clubs</li>
              </ul>
            </article>
            <article>
              <span className="year">Years 4–5</span>
              <h3>Explore a wider canopy.</h3>
              <p>
                Consider broader coverage once the workflow, resources and
                reviewed content can support it.
              </p>
              <ul>
                <li>An authorised campus plant map</li>
                <li>Broader plant coverage</li>
                <li>Explore use at other institutions</li>
              </ul>
            </article>
          </div>
          <p className="roadmap-condition">
            Future plans depend on pilot findings, permission, cost, staff
            capacity and technical feasibility.
          </p>
        </section>
        <section className="team section-wrap" id="team">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Team Error 404</p>
              <h2>
                The people
                <br />
                behind Leaf.
              </h2>
            </div>
            <p>
              Politeknik Besut Terengganu
              <br />A shared idea for more thoughtful campus care.
            </p>
          </div>
          <div className="team-grid">
            {[
              ["javin", "Javin Raj Singh"],
              ["wen-an", "Wen An A/L Kian Teck"],
              ["haikal", "Mohamad Danish Haikal bin Mohd Aswari"],
            ].map(([file, name]) => (
              <figure key={file}>
                <div className="portrait">
                  <img
                    src={"/images/" + file + ".webp"}
                    alt={name}
                    loading="lazy"
                    width="640"
                    height="640"
                  />
                </div>
                <figcaption>{name}</figcaption>
              </figure>
            ))}
          </div>
          <div className="supervisor">
            <span>Supervisor</span>
            <strong>FIRDAUS BIN HASSAN</strong>
          </div>
        </section>
        <section className="proposal section-wrap" id="proposal">
          <LeafIcon className="proposal-leaf" />
          <div>
            <p className="section-kicker">Explore the proposal</p>
            <h2>
              The full idea,
              <br />
              in your hands.
            </h2>
            <p>
              Read the detailed proposal or open the presentation.
              <br />
              Both links lead to the PolyCC-owned Google files.
            </p>
            <div className="proposal-links">
              <a
                className="button light"
                href={DOC}
                target="_blank"
                rel="noreferrer"
              >
                Open Google Doc <Arrow />
              </a>
              <a
                className="button outline"
                href={SLIDES}
                target="_blank"
                rel="noreferrer"
              >
                Open Google Slides <Arrow />
              </a>
            </div>
          </div>
        </section>
        <section className="references section-wrap" id="references">
          <div>
            <p className="section-kicker">References</p>
            <h2>Grounded in context.</h2>
            <p>
              Sources behind the competition context, plant-care caution and
              platform constraints.
            </p>
          </div>
          <ol>
            {references.map((r) => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noreferrer">
                  {r.title}
                  <Arrow />
                </a>
                <p>{r.note}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <footer className="site-footer">
        <a className="brand" href="#home">
          <LeafIcon />
          <span>Leaf</span>
        </a>
        <p>A greener Earth starts with a leaf.</p>
        <div>
          <span>Error 404 · MOHE Hackathon 2026</span>
          <span>Proposed concept · Politeknik Besut Terengganu</span>
          <a href="/credits.txt" target="_blank" rel="noreferrer">
            Design & technology credits
          </a>
        </div>
      </footer>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
