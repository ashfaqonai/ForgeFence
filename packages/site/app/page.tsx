"use client";

import styles from "./page.module.css";

export default function HomePage() {
  return (
    <div className={styles.page}>
      <div className={styles.atmosphere} aria-hidden />
      <header className={styles.nav}>
        <a className={styles.brand} href="https://fence.forgemeter.com">
          <span className={styles.brandMark}>FF</span>
          ForgeFence
        </a>
        <nav className={styles.navLinks}>
          <a href="#how">How it works</a>
          <a href="#install">Install</a>
          <a href="https://forgemeter.com">ForgeMeter</a>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.kicker}>A ForgeMeter product · Saabsa Solutions</p>
          <h1 className={styles.title}>
            Forge<span>Fence</span>
          </h1>
          <p className={styles.lede}>
            Session information-flow control for MCP agents. Contain exfiltration
            even after prompt injection succeeds.
          </p>
          <div className={styles.ctaRow}>
            <a className={styles.ctaPrimary} href="#install">
              Install locally
            </a>
            <a className={styles.ctaGhost} href="#demo">
              See the exfil block
            </a>
          </div>
          <div className={styles.heroVisual} aria-hidden>
            <FlowDiagram />
          </div>
        </section>

        <section className={styles.section} id="how">
          <h2 className={styles.h2}>Inside the agent loop</h2>
          <p className={styles.sectionLede}>
            Classifiers race the model. ForgeFence labels tool outputs, accumulates
            session taint, and refuses sinks when untrusted data would drive them.
          </p>
          <ol className={styles.steps}>
            <li>
              <strong>Pin</strong>
              <span>Hash tool descriptions and schemas on first trust. Drift = rug-pull hide.</span>
            </li>
            <li>
              <strong>Taint</strong>
              <span>Reads and queries stamp the session with untrusted / confidential / secret.</span>
            </li>
            <li>
              <strong>Fence</strong>
              <span>Email, HTTP, shell, public post — denied when labels conflict with policy.</span>
            </li>
          </ol>
        </section>

        <section className={styles.section} id="demo">
          <h2 className={styles.h2}>The proof</h2>
          <p className={styles.sectionLede}>
            Built-in demo tools: confidential read → public post. Same path attackers use
            across Slack + filesystem MCP.
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
            Self-hosted. No cloud account. Point MCP at ForgeFence instead of raw servers.
          </p>
          <pre className={styles.code}>
{`git clone <your-forgefence-repo>
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
      "cwd": "/absolute/path/to/ForgeFence"
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
          <h2 className={styles.h2}>Why not another prompt firewall?</h2>
          <p className={styles.sectionLede}>
            Research keeps finding the same gap: cross-tool data leakage is under-defended,
            and content guards often fail on tool-description poisoning. ForgeFence is a
            containment primitive — least privilege on information flow, not vibes on text.
          </p>
        </section>
      </main>

      <footer className={styles.footer}>
        <div>
          <strong>ForgeFence</strong> · ForgeMeter · Saabsa Solutions
        </div>
        <div className={styles.footerLinks}>
          <a href="https://forgemeter.com">forgemeter.com</a>
          <a href="https://www.saabsa.com">saabsa.com</a>
          <a href="https://www.patientree.com">patientree.com</a>
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
