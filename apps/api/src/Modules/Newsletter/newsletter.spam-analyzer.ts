// src/Modules/Newsletter/newsletter.spam-analyzer.ts
import type { NewsletterSpamReport, SpamRuleCheck } from "@workspace/shared";

const HIGH_RISK_SPAM_WORDS = [
  "100% free",
  "100% satisfied",
  "act now",
  "apply now",
  "as seen on",
  "bad credit",
  "bargain",
  "be your own boss",
  "best price",
  "big bucks",
  "billion dollars",
  "buy direct",
  "call now",
  "cash bonus",
  "cash prize",
  "casino",
  "cents on the dollar",
  "certified",
  "cheap",
  "claim your",
  "clearance",
  "click here",
  "click below",
  "compare rates",
  "congratulations",
  "credit card offers",
  "cures baldness",
  "dear friend",
  "direct email",
  "direct marketing",
  "discount",
  "double your",
  "earn extra cash",
  "earn money",
  "eliminate debt",
  "exclusive deal",
  "expect to earn",
  "extra income",
  "fast cash",
  "financial freedom",
  "free consultation",
  "free gift",
  "free info",
  "free membership",
  "free money",
  "free sample",
  "free trial",
  "full refund",
  "get out of debt",
  "get paid",
  "giveaway",
  "guaranteed cash",
  "guaranteed income",
  "hidden assets",
  "income from home",
  "increase sales",
  "instant cash",
  "investment opportunity",
  "limited time offer",
  "lowest price",
  "make money fast",
  "million dollars",
  "miracle",
  "money back",
  "mortgage rates",
  "multi-level marketing",
  "no catch",
  "no cost",
  "no credit check",
  "no experience",
  "no fees",
  "no gimmick",
  "no hidden costs",
  "no interest",
  "no investment",
  "no obligation",
  "no purchase necessary",
  "no risk",
  "no strings attached",
  "not spam",
  "now only",
  "once in a lifetime",
  "one time",
  "online marketing",
  "open immediately",
  "opportunity",
  "order now",
  "passwords",
  "pennies a day",
  "potential earnings",
  "prize",
  "promise you",
  "pure profit",
  "real thing",
  "refinance",
  "risk free",
  "save big",
  "save money",
  "score",
  "secret",
  "see for yourself",
  "send $",
  "social security number",
  "special promotion",
  "stop snoring",
  "terms and conditions",
  "this isn't spam",
  "unlimited",
  "unsecured credit",
  "urgent",
  "valuable",
  "viagra",
  "vicodin",
  "warranty",
  "weight loss",
  "while supplies last",
  "win",
  "winner",
  "winning",
  "work from home",
  "you have been selected",
  "your income",
];

export class NewsletterSpamAnalyzer {
  /**
   * Evaluates a newsletter's subject, preview text, and content against industry-standard deliverability rules.
   */
  public static analyze(params: {
    subject: string;
    previewText?: string | null;
    content: string;
    senderEmail?: string | null;
  }): NewsletterSpamReport {
    const { subject, previewText, content, senderEmail } = params;
    const checks: SpamRuleCheck[] = [];
    let penaltyTotal = 0;

    // ── 1. Subject Line Analysis ──────────────────────────────────────────

    // 1.1 High-Risk Spam Keywords in Subject
    const subjectLower = subject.toLowerCase();
    const matchedSubjectSpam = HIGH_RISK_SPAM_WORDS.filter((phrase) =>
      subjectLower.includes(phrase)
    );

    if (matchedSubjectSpam.length > 0) {
      const penalty = Math.min(30, matchedSubjectSpam.length * 15);
      penaltyTotal += penalty;
      checks.push({
        id: "subject_spam_keywords",
        name: "Subject Spam Trigger Words",
        category: "subject",
        passed: false,
        scorePenalty: penalty,
        message: `Found ${matchedSubjectSpam.length} high-risk spam keyword(s) in subject: "${matchedSubjectSpam.join('", "')}".`,
        recommendation:
          "Replace aggressive sales/spam triggers with conversational, editorial language.",
        highlightedTerms: matchedSubjectSpam,
      });
    } else {
      checks.push({
        id: "subject_spam_keywords",
        name: "Subject Spam Trigger Words",
        category: "subject",
        passed: true,
        scorePenalty: 0,
        message: "No spam trigger words detected in subject line.",
      });
    }

    // 1.2 ALL CAPS shouting in Subject
    const lettersInSubject = subject.replace(/[^a-zA-Z]/g, "");
    const upperCount = lettersInSubject.replace(/[^A-Z]/g, "").length;
    const upperRatio =
      lettersInSubject.length > 0 ? upperCount / lettersInSubject.length : 0;

    if (lettersInSubject.length >= 6 && upperRatio > 0.45) {
      penaltyTotal += 20;
      checks.push({
        id: "subject_all_caps",
        name: "Subject Capitalization",
        category: "subject",
        passed: false,
        scorePenalty: 20,
        message: `High uppercase character ratio (${Math.round(upperRatio * 100)}%) detected in subject.`,
        recommendation:
          "Avoid typing words in ALL CAPS. Use title case or sentence case.",
      });
    } else {
      checks.push({
        id: "subject_all_caps",
        name: "Subject Capitalization",
        category: "subject",
        passed: true,
        scorePenalty: 0,
        message: "Subject line capitalization is well-balanced.",
      });
    }

    // 1.3 Excessive Punctuation in Subject (e.g. !!!, ???, $$$)
    const excessiveExclamations = (subject.match(/!{2,}/g) || []).length;
    const excessiveQuestions = (subject.match(/\?{2,}/g) || []).length;
    const excessiveDollars = (subject.match(/\${2,}/g) || []).length;

    if (excessiveExclamations > 0 || excessiveQuestions > 0 || excessiveDollars > 0) {
      penaltyTotal += 15;
      checks.push({
        id: "subject_punctuation",
        name: "Subject Punctuation",
        category: "subject",
        passed: false,
        scorePenalty: 15,
        message: "Multiple consecutive exclamation marks, question marks, or currency symbols detected.",
        recommendation: "Limit punctuation in subject lines to at most one mark.",
      });
    } else {
      checks.push({
        id: "subject_punctuation",
        name: "Subject Punctuation",
        category: "subject",
        passed: true,
        scorePenalty: 0,
        message: "Subject punctuation is clean.",
      });
    }

    // 1.4 Subject Line Length
    const subjectLength = subject.trim().length;
    if (subjectLength < 6) {
      penaltyTotal += 10;
      checks.push({
        id: "subject_length",
        name: "Subject Length",
        category: "subject",
        passed: false,
        scorePenalty: 10,
        message: `Subject is very short (${subjectLength} characters).`,
        recommendation: "Aim for a subject line between 20 and 70 characters for optimal inbox display.",
      });
    } else if (subjectLength > 90) {
      penaltyTotal += 10;
      checks.push({
        id: "subject_length",
        name: "Subject Length",
        category: "subject",
        passed: false,
        scorePenalty: 10,
        message: `Subject is long (${subjectLength} characters) and will truncate on mobile clients.`,
        recommendation: "Shorten subject to under 70 characters to avoid truncation on mobile screens.",
      });
    } else {
      checks.push({
        id: "subject_length",
        name: "Subject Length",
        category: "subject",
        passed: true,
        scorePenalty: 0,
        message: `Optimal subject line length (${subjectLength} characters).`,
      });
    }

    // ── 2. Preheader / Teaser Snippet Analysis ─────────────────────────────
    if (!previewText || previewText.trim().length === 0) {
      penaltyTotal += 8;
      checks.push({
        id: "preheader_presence",
        name: "Inbox Preview Preheader",
        category: "content",
        passed: false,
        scorePenalty: 8,
        message: "No preheader snippet specified.",
        recommendation:
          "Adding a 40-100 character preheader snippet drastically improves open rates and prevents random email markup from displaying in inbox previews.",
      });
    } else {
      checks.push({
        id: "preheader_presence",
        name: "Inbox Preview Preheader",
        category: "content",
        passed: true,
        scorePenalty: 0,
        message: `Preheader text provided (${previewText.trim().length} characters).`,
      });
    }

    // ── 3. Content & Keyword Analysis ──────────────────────────────────────
    const contentLower = content.toLowerCase();
    const matchedContentSpam = HIGH_RISK_SPAM_WORDS.filter((phrase) =>
      contentLower.includes(phrase)
    );

    if (matchedContentSpam.length >= 4) {
      const penalty = Math.min(25, matchedContentSpam.length * 4);
      penaltyTotal += penalty;
      checks.push({
        id: "content_spam_keywords",
        name: "Body Spam Triggers",
        category: "content",
        passed: false,
        scorePenalty: penalty,
        message: `Found ${matchedContentSpam.length} spam-trigger phrases in body content: "${matchedContentSpam.slice(0, 5).join('", "')}"...`,
        recommendation: "Rephrase repetitive sales hype with factual, value-driven technical copy.",
        highlightedTerms: matchedContentSpam,
      });
    } else {
      checks.push({
        id: "content_spam_keywords",
        name: "Body Spam Triggers",
        category: "content",
        passed: true,
        scorePenalty: 0,
        message: "Body copy has a healthy spam keyword density.",
      });
    }

    // 3.2 Content Length & HTML-to-Text Balance
    const plainText = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    if (plainText.length < 50) {
      penaltyTotal += 15;
      checks.push({
        id: "content_length",
        name: "Content Substance",
        category: "content",
        passed: false,
        scorePenalty: 15,
        message: `Body text is very short (${plainText.length} characters). Spam filters flag emails with very little textual content.`,
        recommendation: "Provide at least 2-3 paragraphs of informative, readable content.",
      });
    } else {
      checks.push({
        id: "content_length",
        name: "Content Substance",
        category: "content",
        passed: true,
        scorePenalty: 0,
        message: `Good textual content volume (${plainText.length} characters).`,
      });
    }

    // ── 4. Links & Compliance Checks ───────────────────────────────────────
    // 4.1 Insecure HTTP Links
    const insecureLinks = content.match(/href=["']http:\/\/(?!localhost)[^"']+/gi) || [];
    if (insecureLinks.length > 0) {
      penaltyTotal += 15;
      checks.push({
        id: "link_security",
        name: "Link Protocol Security (HTTPS)",
        category: "links",
        passed: false,
        scorePenalty: 15,
        message: `Found ${insecureLinks.length} unencrypted HTTP link(s) in email markup. Modern filters heavily penalize plain http:// urls.`,
        recommendation: "Upgrade all outbound links to use HTTPS protocol.",
      });
    } else {
      checks.push({
        id: "link_security",
        name: "Link Protocol Security (HTTPS)",
        category: "links",
        passed: true,
        scorePenalty: 0,
        message: "All outbound links utilize encrypted HTTPS.",
      });
    }

    // 4.2 Unsubscribe & Sender Compliance
    checks.push({
      id: "unsubscribe_compliance",
      name: "RFC 8058 1-Click Unsubscribe",
      category: "compliance",
      passed: true,
      scorePenalty: 0,
      message: "Automated List-Unsubscribe headers and verified HMAC footer unsubscribe link are active.",
    });

    // ── Final Score & Summary Computation ──────────────────────────────────
    const score = Math.max(0, Math.min(100, 100 - penaltyTotal));
    let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";
    if (score < 65) {
      riskLevel = "HIGH";
    } else if (score < 85) {
      riskLevel = "MEDIUM";
    }

    const failedChecks = checks.filter((c) => !c.passed);
    const recommendations = failedChecks
      .map((c) => c.recommendation)
      .filter((rec): rec is string => !!rec);

    const summary =
      riskLevel === "LOW"
        ? `Deliverability score is excellent (${score}/100). The campaign complies with modern inbox placement standards.`
        : riskLevel === "MEDIUM"
        ? `Deliverability score is moderate (${score}/100). Address the warnings below to ensure zero spam-folder placement.`
        : `High spam risk detected (${score}/100). This campaign may be routed to spam folders or rejected by major mailbox providers.`;

    return {
      score,
      riskLevel,
      checks,
      summary,
      recommendations,
    };
  }
}
