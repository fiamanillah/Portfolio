// src/templates/emails/newsletterBroadcast.ts
import { renderEmailLayout } from "./baseLayout"

export interface NewsletterBroadcastOptions {
  title?: string
  badgeLabel?: string
  previewText?: string
  articleTitle?: string
  articleExcerpt?: string
  articleUrl?: string
  articleTags?: string[]
  mainContentHtml?: string
  unsubscribeUrl?: string
  manageUrl?: string
}

/**
 * Returns the raw Liquid template HTML body for Plunk Newsletter / Campaign templates.
 */
export function getNewsletterBroadcastLiquidBody(): string {
  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #0f172a;">
      Hi <strong>{{ name | default: firstName | default: 'there' }}</strong>,
    </p>

    {{ bodyContent | default: '<p style="margin: 0 0 16px 0; color: #334155; line-height: 1.65;">Here is the latest update, architecture deep-dive, and release from my workbench.</p>' }}

    <!-- Featured Post / Highlight Card -->
    <div style="margin: 24px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0; padding: 20px 22px;">
      {% if tag %}
      <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.04em; background-color: #f1f5f9; border: 1px solid #e2e8f0; padding: 2px 6px; border-radius: 0; display: inline-block; margin-bottom: 12px;">
        {{ tag | default: 'Article' }}
      </span>
      {% endif %}

      <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #0f172a; line-height: 1.4;">
        {{ articleTitle | default: 'Deep Dive: Distributed Architecture and Real-Time Engines' }}
      </h3>

      <p style="margin: 0 0 16px 0; font-size: 13px; color: #475569; line-height: 1.6;">
        {{ articleExcerpt | default: 'An overview of high-throughput distributed architectures, zero-downtime migrations, and event-driven patterns.' }}
      </p>

      <div style="text-align: left;">
        <a href="{{ articleUrl | default: 'https://fi.amanillah.com/blog' }}" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 13px; font-weight: 600; padding: 10px 18px; border-radius: 0; border: 1px solid #0f172a; text-decoration: none;">
          Read Article -&gt;
        </a>
      </div>
    </div>
  `.trim()

  const { html } = renderEmailLayout({
    badgeLabel: "{{ badgeLabel | default: 'Newsletter' }}",
    title: "{{ title | default: 'Latest from Fi Amanillah' }}",
    subtitle:
      "{{ subtitle | default: 'Engineering notes, systems design and tech insights' }}",
    contentHtml,
    previewText:
      "{{ previewText | default: 'New engineering post and system design write-up from Fi Amanillah' }}",
    unsubscribeUrl: "{{ unsubscribeUrl }}",
    manageUrl: "{{ manageUrl }}",
    showUnsubscribe: true,
  })

  return html
}
