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
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #f1f5f9;">
      Hi <strong style="color: #ffffff;">{{ name | default: firstName | default: 'there' }}</strong>,
    </p>

    {{ bodyContent | default: '<p style="margin: 0 0 16px 0; color: #94a3b8; line-height: 1.7;">Here is the latest update, architecture deep-dive, and release from my workbench.</p>' }}

    <!-- Featured Post / Highlight Card -->
    <div style="margin: 24px 0; background-color: #131c31; border: 1px solid #1e293b; border-radius: 8px; padding: 20px 22px;">
      {% if tag %}
      <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 10px; font-weight: 600; color: #06b6d4; text-transform: uppercase; letter-spacing: 0.08em; background-color: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.25); padding: 3px 8px; border-radius: 9999px; display: inline-block; margin-bottom: 12px;">
        {{ tag | default: 'New Article' }}
      </span>
      {% endif %}

      <h3 style="margin: 0 0 8px 0; font-size: 17px; font-weight: 700; color: #f8fafc; line-height: 1.4;">
        {{ articleTitle | default: 'Deep Dive: Distributed Architecture & Real-Time Engines' }}
      </h3>

      <p style="margin: 0 0 16px 0; font-size: 13px; color: #94a3b8; line-height: 1.65;">
        {{ articleExcerpt | default: 'An overview of high-throughput distributed architectures, zero-downtime migrations, and event-driven patterns.' }}
      </p>

      <div style="text-align: left;">
        <a href="{{ articleUrl | default: 'https://fi.amanillah.com/blog' }}" style="display: inline-block; background-color: #06b6d4; color: #090d16; font-size: 12px; font-weight: 600; padding: 8px 16px; border-radius: 6px; text-decoration: none;">
          Read Article →
        </a>
      </div>
    </div>

    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1e293b;">
      <p style="margin: 0; font-size: 14px; color: #94a3b8;">
        Until next time,<br>
        <strong style="color: #f8fafc;">Fi Amanillah</strong>
      </p>
    </div>
  `.trim()

  const { html } = renderEmailLayout({
    badgeLabel: "{{ badgeLabel | default: 'New Post' }}",
    title: "{{ title | default: 'Latest from Fi Amanillah' }}",
    subtitle:
      "{{ subtitle | default: 'Engineering notes, systems design & tech insights' }}",
    contentHtml,
    previewText:
      "{{ previewText | default: 'New engineering post and system design write-up from Fi Amanillah' }}",
    unsubscribeUrl: "{{ unsubscribeUrl }}",
    manageUrl: "{{ manageUrl }}",
    showUnsubscribe: true,
  })

  return html
}
