"use client";

import styles from "./page.module.css";
import { DEMO_VIDEO_EMBED_URL, DEMO_VIDEO_TITLE } from "../lib/demo-video";

export default function HomePage() {
  const hasVideo = Boolean(DEMO_VIDEO_EMBED_URL.trim());

  return (
    <div className={styles.page}>
      <div className={styles.atmosphere} aria-hidden />
      <header className={styles.nav}>
        <a className={styles.brand} href="https://fence.forgemeter.com">
          <span className={styles.brandMark}>FF</span>
          ForgeFence
        </a>
        <nav className={styles.navLinks}>
          <a href="#video">Watch demo</a>
          <a href="#how">How it works</a>
          <a href="#install">Install</a>
          <a href="https://forgemeter.com">ForgeMeter</a>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.kicker}>A ForgeMeter product · Saabsa Solutions · Free & open source</p>
          <h1 className={styles.title}>
            Forge<span>Fence</span>
          </h1>
          <p className={styles.lede}>
            Your coding agent can read private data, then post it to Slack.
            ForgeFence sits in the middle and <em>blocks that second step</em> —
            even if the model was tricked.
          </p>
          <div className={styles.ctaRow}>
            <a className={styles.ctaPrimary} href="#video">
              Watch the 90-second demo
            </a>
            <a className={styles.ctaGhost} href="#install">
              Install locally
            </a>
          </div>
          <div className={styles.heroVisual} aria-hidden>
            <FlowDiagram />
          </div>
        </section>

        <section className={styles.section} id="video">
          <h2 className={styles.h2}>See it in one story</h2>
          <p className={styles.sectionLede}>
            Same attack path every time: <strong>read confidential → try to publish</strong>.
            ForgeFence allows the read, marks the session, then denies the leak.
          </p>

          {hasVideo ? (
            <div className={styles.videoFrame}>
              <iframe
                title={DEMO_VIDEO_TITLE}
                src={DEMO_VIDEO_EMBED_URL}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className={styles.videoPlaceholder}>
              <p className={styles.videoPlaceholderTitle}>Demo video coming soon</p>
              <p>
                Record with the script in <code>docs/DEMO_SCRIPT.md</code>, then paste the
                YouTube/Loom embed URL into <code>packages/site/lib/demo-video.ts</code>.
              </p>
            </div>
          )}

          <ol className={styles.storyboard}>
            <li>
              <span className={styles.storyStep}>1</span>
              <div>
                <strong>Clean session</strong>
                <p>Agent can post publicly — nothing sensitive was read yet.</p>
              </div>
            </li>
            <li>
              <span className={styles.storyStep}>2</span>
              <div>
                <strong>Read private</strong>
                <p>
                  <code>demo__read_private</code> returns a fake SSN / API key. Session is
                  now <em>tainted</em>.
                </p>
              </div>
            </li>
            <li>
              <span className={styles.storyStep}>3</span>
              <div>
                <strong>Public post denied</strong>
                <p>
                  <code>demo__post_public</code> returns <strong>ForgeFence DENY</strong> —
                  the fence closed.
                </p>
              </div>
            </li>
          </ol>
        </section>

        <section className={styles.section} id="how">
          <h2 className={styles.h2}>What it actually does</h2>
          <p className={styles.sectionLede}>
            Not another chatbot filter. A rule engine on <strong>tool calls</strong>.
          </p>
          <ol className={styles.steps}>
            <li>
              <strong>Pin</strong>
              <span>Remember each tool’s description. If it silently changes (rug-pull), hide it.</span>
            </li>
            <li>
              <strong>Taint</strong>
              <span>When a tool returns sensitive data, stamp that on the session.</span>
            </li>
            <li>
              <strong>Fence</strong>
              <span>Block email, HTTP, shell, Slack-style posts while that stamp is present.</span>
            </li>
          </ol>
        </section>

        <section className={styles.section} id="demo">
          <h2 className={styles.h2}>Run the proof yourself</h2>
          <p className={styles.sectionLede}>
            No Cursor required for this check — thirty seconds in a terminal.
          </p>
          <pre className={styles.code}>
{`$ npm run demo

OK  clean session → post_public ALLOW
OK  read_private → taint ["confidential","untrusted"]
OK  tainted session → post_public DENY
OK  allow_always → demo__ping ALLOW

ForgeFence exfil-block demo passed.`}
          </pre>
        </section>

        <section className={styles.section} id="install">
          <h2 className={styles.h2}>Install in Cursor</h2>
          <p className={styles.sectionLede}>
            Self-hosted. Free. Point MCP at ForgeFence instead of raw servers.
          </p>
          <pre className={styles.code}>
{`git clone https://github.com/ashfaqonai/ForgeFence
cd ForgeFence && npm install

# mcp.json
{
  "mcpServers": {
    "forgefence": {
      "command": "npx",
      "args": [
        "tsx",
        "packages/proxy/src/cli.ts",
        "--config",
        "forgefence.config.yaml"
      ],
      "cwd": "C:/source/ForgeFence"
    }
  }
}`}
          </pre>
          <p className={styles.note}>
            Edit <code>policies/default.yaml</code> for your sinks. Pair with{" "}
            <a href="https://forgemeter.com">ForgeMeter</a> for AI spend visibility.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Why not a prompt firewall?</h2>
          <p className={styles.sectionLede}>
            Jailbreak filters try to police what the model <em>says</em>. ForgeFence polices
            what tools are <em>allowed to do</em> after sensitive data entered the session —
            the gap most agent breaches actually use.
          </p>
        </section>
      </main>

      <footer className={styles.footer}>
        <div>
          <strong>ForgeFence</strong> · ForgeMeter · Saabsa Solutions
        </div>
        <div className={styles.footerLinks}>
          <a href="https://github.com/ashfaqonai/ForgeFence">GitHub</a>
          <a href="https://forgemeter.com">forgemeter.com</a>
          <a href="https://www.saabsa.com">saabsa.com</a>
        </div>
      </footer>
    </div>
  );
}

function FlowDiagram() {
  return (
    <svg className={styles.flowSvg} viewBox="0 0 720 220" role="img">
      <defs>
        <linearGradient id="flowLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c4f04d" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#c4f04d" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#c4f04d" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <text x="40" y="36" className={styles.svgLabel}>
        Agent
      </text>
      <text x="250" y="36" className={styles.svgLabel}>
        ForgeFence
      </text>
      <text x="500" y="36" className={styles.svgLabel}>
        MCP tools
      </text>
      <rect x="24" y="56" width="140" height="110" rx="4" className={styles.svgBox} />
      <rect x="230" y="48" width="200" height="126" rx="4" className={styles.svgBoxAccent} />
      <rect x="500" y="56" width="180" height="48" rx="4" className={styles.svgBox} />
      <rect x="500" y="118" width="180" height="48" rx="4" className={styles.svgBox} />
      <text x="52" y="118" className={styles.svgBody}>
        Cursor / Claude
      </text>
      <text x="258" y="95" className={styles.svgBody}>
        pin · taint · sink policy
      </text>
      <text x="258" y="122" className={styles.svgBodyAccent}>
        DENY if labels conflict
      </text>
      <text x="520" y="86" className={styles.svgBody}>
        read_private
      </text>
      <text x="520" y="148" className={styles.svgBody}>
        post_public
      </text>
      <path
        d="M164 110 H230"
        stroke="url(#flowLine)"
        strokeWidth="2"
        fill="none"
        className={styles.flowAnim}
      />
      <path
        d="M430 110 H500"
        stroke="url(#flowLine)"
        strokeWidth="2"
        fill="none"
        className={styles.flowAnim}
        style={{ animationDelay: "0.4s" }}
      />
    </svg>
  );
}
