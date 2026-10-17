import Link from "next/link";

const features = [
  {
    icon: "💸",
    title: "Track every transaction",
    description:
      "Record your income and expenses and understand where your money goes.",
  },
  {
    icon: "🎯",
    title: "Set monthly budgets",
    description:
      "Create budgets and monitor your spending before you go over the limit.",
  },
  {
    icon: "📊",
    title: "Understand your spending",
    description:
      "Explore monthly summaries and category-wise spending insights.",
  },
  {
    icon: "📱",
    title: "Your finances on the go",
    description:
      "Manage your money from your phone, with offline support for everyday use.",
  },
];

export default function Home() {
  return (
    <main>
      <header className="navbar">
        <Link href="/" className="brand">
          <span className="brand-icon">S</span>
          SpendWise
        </Link>

        <nav>
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="mailto:support@spendwiseapp.site">Contact</a>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">YOUR MONEY, YOUR CONTROL</span>

          <h1>
            Spend smarter.
            <br />
            <span>Live better.</span>
          </h1>

          <p>
            Take control of your finances with SpendWise. Track expenses,
            manage monthly budgets, and make more confident decisions about
            your money.
          </p>

          <div className="hero-actions">
            <a href="#features" className="button button-primary">
              Explore features <span>→</span>
            </a>
            <a href="#about" className="button button-secondary">
              Discover SpendWise
            </a>
          </div>

          <div className="trust-note">
            <span>✓</span> Simple budgeting · Clear insights · Better habits
          </div>
        </div>

        <div className="preview-wrap" aria-label="Illustrative spending summary">
          <div className="preview-card">
            <div className="preview-top">
              <div>
                <span className="muted">MONTHLY OVERVIEW</span>
                <h3>Your money at a glance</h3>
              </div>
              <span className="preview-icon">↗</span>
            </div>

            <div className="balance">
              <span className="muted">Illustrative balance</span>
              <h2>₹24,500</h2>
              <span className="positive">A clearer view of your money</span>
            </div>

            <div className="summary-grid">
              <div className="summary-box">
                <span>Income</span>
                <strong>₹40,000</strong>
                <div className="mini-bar income-bar" />
              </div>
              <div className="summary-box">
                <span>Expenses</span>
                <strong>₹15,500</strong>
                <div className="mini-bar expense-bar" />
              </div>
            </div>

            <div className="budget-row">
              <div className="budget-heading">
                <span>Monthly budget</span>
                <strong>65%</strong>
              </div>
              <div className="budget-track">
                <div className="budget-fill" />
              </div>
              <span className="muted budget-caption">
                Example figures for illustration only
              </span>
            </div>
          </div>
          <div className="floating-note">
            <span className="floating-check">✓</span>
            <div>
              <strong>Stay in control</strong>
              <p>One expense at a time</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="section-heading">
          <span className="eyebrow">BUILT FOR EVERYDAY LIFE</span>
          <h2>Make your money make sense.</h2>
          <p>
            Practical tools to help you build better financial habits, one
            month at a time.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="about-section">
        <div>
          <span className="eyebrow">MEET SPENDWISE</span>
          <h2>Small steps toward smarter spending.</h2>
        </div>
        <p>
          SpendWise is a personal finance app designed to make everyday money
          management easier. Keep track of transactions, plan your budget, and
          use spending insights to make informed choices.
        </p>
      </section>

      <footer className="footer">
        <Link href="/" className="brand">
          <span className="brand-icon">S</span>
          SpendWise
        </Link>
        <p>Build better money habits, one day at a time.</p>
        <a href="mailto:support@spendwiseapp.site">
          support@spendwiseapp.site
        </a>
       <span className="copyright">
  © 2026 SpendWise. All rights reserved.
</span>
      </footer>
    </main>
  );
}
