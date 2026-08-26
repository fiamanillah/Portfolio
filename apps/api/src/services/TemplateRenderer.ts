// src/services/TemplateRenderer.ts
import { Liquid } from "liquidjs"
import { AppLogger } from "@workspace/logger"

export interface RenderResult {
  subject: string
  body: string
  success: boolean
  error?: string
}

export class TemplateRenderer {
  private static logger = new AppLogger("TemplateRenderer")
  private static engine: Liquid = new Liquid({
    strictVariables: false,
    strictFilters: false,
    jsTruthy: true,
  })

  /**
   * Pre-processes handlebars-style fallback syntax `{{ key ?? 'fallback' }}`
   * into standard Liquid `{{ key | default: 'fallback' }}`
   */
  private static normalizeTemplate(templateStr: string): string {
    if (!templateStr) return ""
    // Replace {{ var ?? 'fallback' }} or {{ var ?? "fallback" }}
    return templateStr.replace(
      /\{\{\s*([a-zA-Z0-9_.]+)\s*\?\?\s*(['"][^'"]*['"])\s*\}\}/g,
      "{{ $1 | default: $2 }}"
    )
  }

  /**
   * Renders a Liquid template string against a data context dictionary.
   */
  public static async renderString(
    templateStr: string,
    context: Record<string, unknown> = {}
  ): Promise<string> {
    if (!templateStr) return ""
    try {
      const normalized = this.normalizeTemplate(templateStr)
      return await this.engine.parseAndRender(normalized, context)
    } catch (error) {
      this.logger.warn("Failed to render Liquid string", {
        error: error instanceof Error ? error.message : error,
      })
      // Fallback: simple token replacement if liquid engine parsing throws
      return templateStr.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
        return context[key] !== undefined
          ? String(context[key])
          : `{{ ${key} }}`
      })
    }
  }

  /**
   * Renders both subject and HTML body with a given context.
   */
  public static async renderTemplate(
    subjectTemplate: string,
    bodyTemplate: string,
    context: Record<string, unknown> = {}
  ): Promise<RenderResult> {
    try {
      const renderedSubject = await this.renderString(subjectTemplate, context)
      const renderedBody = await this.renderString(bodyTemplate, context)

      return {
        subject: renderedSubject,
        body: renderedBody,
        success: true,
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      this.logger.error("Template rendering error", { error: errorMsg })
      return {
        subject: subjectTemplate,
        body: bodyTemplate,
        success: false,
        error: errorMsg,
      }
    }
  }
}
