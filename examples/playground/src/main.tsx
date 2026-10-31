import { Skeleton, type SkeletonProps } from "@skeletwin/react";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "@skeletwin/react/styles.css";
import "./style.css";
import { Fixture } from "./fixture";

const landscape = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><defs><linearGradient id="a" x2="0" y2="1"><stop stop-color="#c7d8ce"/><stop offset="1" stop-color="#e8e9d7"/></linearGradient></defs><path fill="url(#a)" d="M0 0h800v400H0z"/><circle cx="600" cy="90" r="42" fill="#f5f0d8"/><path d="m0 330 220-220 190 210L590 160 800 330v70H0" fill="#5c796d"/><path d="m0 390 180-140 150 110 200-170 270 210" fill="#2c4b43"/></svg>')}`;

function ProfileCard() {
  const [following, setFollowing] = useState(false);
  return (
    <article className="profile-card">
      <img
        className="cover"
        src={landscape}
        alt="An illustrated mountain landscape"
        width={800}
        height={400}
      />
      <div className="profile-body">
        <div className="profile-top">
          <div className="avatar" data-skeleton="circle">
            JK
          </div>
          <span className="available">Open to collaborate</span>
        </div>
        <h3>Jamie Kim</h3>
        <p className="occupation">Designer & occasional trail finder</p>
        <p className="bio">
          Making useful things feel a little more human. Currently exploring the space between
          design and code.
        </p>
        <div className="stats">
          <span>
            <strong>128</strong> projects
          </span>
          <span>
            <strong>2.4k</strong> followers
          </span>
        </div>
        <button type="button" className="follow" onClick={() => setFollowing(!following)}>
          {following ? "Following ✓" : "Follow Jamie ↗"}
        </button>
      </div>
    </article>
  );
}

function ArticleCard() {
  return (
    <article className="article-card">
      <span className="eyebrow">FIELD NOTES / 004</span>
      <h3>
        A little room
        <br />
        for the unexpected.
      </h3>
      <p>
        The best interfaces make space for what comes next. A quiet moment, a thoughtful detail, a
        path you haven't taken.
      </p>
      <img
        className="article-image"
        src={landscape}
        alt="Mountain peaks at sunrise"
        width={800}
        height={400}
      />
      <div className="article-byline">
        <span>By Jamie Kim</span>
        <span>4 min read ↗</span>
      </div>
    </article>
  );
}

function ActivityCard() {
  return (
    <article className="activity-card">
      <span className="eyebrow">YOUR WORKSPACE</span>
      <h3>A few good things.</h3>
      {[
        "Brand explorations",
        "A better onboarding",
        "Notes from the field",
        "The next small idea",
      ].map((title, index) => (
        <div className="activity-row" key={title}>
          <div className={`activity-icon icon-${index}`} data-skeleton="block">
            {["◈", "↗", "≋", "✳"][index]}
          </div>
          <div>
            <h4>{title}</h4>
            <p>
              {
                [
                  "Updated just now",
                  "3 new comments",
                  "Ready for a fresh look",
                  "A work in progress",
                ][index]
              }
            </p>
          </div>
          <span>↗</span>
        </div>
      ))}
      <button type="button" className="workspace-button">
        Explore workspace ↗
      </button>
    </article>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const [animation, setAnimation] = useState<NonNullable<SkeletonProps["animation"]>>("shimmer");
  const [example, setExample] = useState("Profile");
  const [dark, setDark] = useState(false);
  const Content =
    example === "Profile" ? ProfileCard : example === "Article" ? ArticleCard : ActivityCard;

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="wordmark" href="/">
          skeletwin<span className="version">v1.0.0</span>
        </a>
        <a className="header-link" href="#get-started">
          Start building <span>↗</span>
        </a>
      </header>
      <main>
        <section className="intro">
          <div className="intro-copy">
            <h1>
              Your layout.
              <br />
              <span>Already loading.</span>
            </h1>
            <p>Wrap your components. Get a skeleton that fits.</p>
          </div>
          <div className="intro-note">
            <span className="note-symbol">✳</span>
            <p>
              You’ve already designed
              <br />
              the loading state.
              <br />
              <strong>It's your component.</strong>
            </p>
          </div>
        </section>

        <section className="playground" aria-label="Interactive playground">
          <div className="playground-heading">
            <div>
              <span className="section-number">01 /</span>
              <h2>Give it a try</h2>
            </div>
            <button
              type="button"
              className="loading-toggle"
              aria-pressed={loading}
              onClick={() => setLoading(!loading)}
            >
              <span className="toggle-track">
                <span />
              </span>{" "}
              {loading ? "Loading on" : "Loading off"}
            </button>
          </div>
          <div className="toolbar">
            <fieldset className="example-tabs" aria-label="Example layout">
              {["Profile", "Article", "Activity"].map((name) => (
                <button
                  type="button"
                  aria-pressed={example === name}
                  key={name}
                  onClick={() => setExample(name)}
                >
                  {name}
                </button>
              ))}
            </fieldset>
            <div className="appearance-controls">
              <div className="animation-control">
                <label htmlFor="animation">Animation</label>
                <select
                  id="animation"
                  value={animation}
                  onChange={(event) =>
                    setAnimation(event.target.value as NonNullable<SkeletonProps["animation"]>)
                  }
                >
                  <option value="shimmer">Shimmer</option>
                  <option value="pulse">Pulse</option>
                  <option value="none">None</option>
                </select>
              </div>
              <button
                type="button"
                aria-label="Toggle dark preview"
                aria-pressed={dark}
                onClick={() => setDark(!dark)}
              >
                {dark ? "☀" : "◐"}
              </button>
            </div>
          </div>
          <div className={`preview-grid ${dark ? "dark-preview" : ""}`}>
            <div className="preview-panel">
              <div className="panel-caption">
                <span>YOUR COMPONENT</span>
                <span>01</span>
              </div>
              <div className="card-stage">
                <Content />
              </div>
            </div>
            <div className="preview-panel skeleton-panel">
              <div className="panel-caption">
                <span>YOUR SKELETON</span>
                <span className="generated-label">AUTO GENERATED</span>
              </div>
              <div className="card-stage">
                <Skeleton
                  loading={loading}
                  animation={animation}
                  className="demo-skeleton"
                  data-testid="demo-skeleton"
                  baseColor={dark ? "#344139" : "#dce1dc"}
                  highlightColor={dark ? "#45564b" : "#eef1eb"}
                >
                  <Content />
                </Skeleton>
              </div>
            </div>
          </div>
        </section>

        <section className="implementation" id="get-started">
          <div className="implementation-copy">
            <span className="section-number">02 / THE ENTIRE IDEA</span>
            <h2>
              One wrapper.
              <br />A lot less work.
            </h2>
            <p>
              Keep your components and their state.
              <br />
              Let the browser work out the shapes.
            </p>
          </div>
          <div className="code-card">
            <div className="code-header">
              <span>Profile.tsx</span>
              <span>TSX</span>
            </div>
            <pre>
              <code>
                <span className="code-muted">import</span> {"{ Skeleton }"}{" "}
                <span className="code-muted">from</span>{" "}
                <span className="code-string">"@skeletwin/react"</span>;{"\n"}
                <span className="code-muted">import</span>{" "}
                <span className="code-string">"@skeletwin/react/styles.css"</span>;{"\n\n"}
                <span className="code-muted">return</span> ({"\n"}{" "}
                <span className="code-accent">&lt;Skeleton</span> loading={"{isLoading}"}
                <span className="code-accent">&gt;</span>
                {"\n"} &lt;Profile user={"{user ?? placeholder}"} /&gt;{"\n"}{" "}
                <span className="code-accent">&lt;/Skeleton&gt;</span>
                {"\n"});
              </code>
            </pre>
            <div className="code-footer">Your real layout becomes the placeholder.</div>
          </div>
        </section>
      </main>
      <footer>
        <span>
          Built with React. Shared under MIT. <span className="footer-mark">✳</span>
        </span>
      </footer>
    </div>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Missing root element");
createRoot(root).render(
  <StrictMode>
    {new URLSearchParams(location.search).has("fixture") ? <Fixture /> : <App />}
  </StrictMode>,
);
