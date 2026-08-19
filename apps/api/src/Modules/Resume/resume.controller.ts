// apps/api/src/Modules/Resume/resume.controller.ts
import { Request, Response } from "express"
import { BaseController } from "@/core/BaseController"
import { AppLogger } from "@workspace/logger"
import { ResumeService } from "./resume.service"
import {
  CreateResumeDTO,
  UpdateResumeDTO,
  ResumeQueryDTO,
} from "./ResumeDTO"

export class ResumeController extends BaseController {
  protected logger = new AppLogger("ResumeController")

  constructor(private readonly resumeService: ResumeService) {
    super()
  }

  /**
   * GET /resume/v1/public/active
   */
  public async getActiveResume(req: Request, res: Response) {
    const resume = await this.resumeService.getActiveResume()
    return this.sendResponse(
      req,
      res,
      resume ? "Active resume retrieved" : "No active resume found",
      200,
      resume
    )
  }

  /**
   * GET /resume/v1/public/download (or /resume/v1/public/:id/download)
   * Tracks download counter and redirects or sends attachment
   */
  public async downloadResume(req: Request, res: Response) {
    const id = req.params.id as string | undefined
    const { fileUrl, fileName } = await this.resumeService.trackDownload(id)

    // Option: redirect to cloud CDN URL
    if (req.query.json === "true") {
      return res.status(200).json({
        success: true,
        data: { fileUrl, fileName },
      })
    }

    return res.redirect(fileUrl)
  }

  /**
   * GET /resume/v1/admin
   */
  public async listResumes(req: Request, res: Response) {
    const query = (req.validatedQuery || {}) as ResumeQueryDTO
    const { data, pagination, stats } = await this.resumeService.listResumes(query)
    return res.status(200).json({
      success: true,
      message: "Resume versions retrieved successfully.",
      data,
      pagination,
      stats,
    })
  }

  /**
   * GET /resume/v1/admin/:id
   */
  public async getResume(req: Request, res: Response) {
    const id = req.params.id as string
    const resume = await this.resumeService.getResumeById(id)
    return this.sendResponse(req, res, "Resume version details retrieved", 200, resume)
  }

  /**
   * POST /resume/v1/admin
   */
  public async createResume(req: Request, res: Response) {
    const file = req.file
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a resume file (.pdf, .doc, .docx).",
      })
    }

    const body = req.body || {}
    const dto: CreateResumeDTO = {
      title: body.title || "Developer Resume",
      version: body.version || `v${new Date().getFullYear()}.${new Date().getMonth() + 1}`,
      description: body.description || null,
      isActive: body.isActive === "true" || body.isActive === true,
    }

    const userId = req.user?.id
    const created = await this.resumeService.uploadResumeVersion(file, dto, userId)
    return this.sendResponse(
      req,
      res,
      `Resume version ${created.version} uploaded successfully`,
      201,
      created
    )
  }

  /**
   * PATCH /resume/v1/admin/:id
   */
  public async updateResume(req: Request, res: Response) {
    const id = req.params.id as string
    const dto = req.validatedBody as UpdateResumeDTO
    const updated = await this.resumeService.updateResumeVersion(id, dto)
    return this.sendResponse(
      req,
      res,
      `Resume version ${updated.version} updated successfully`,
      200,
      updated
    )
  }

  /**
   * PATCH /resume/v1/admin/:id/activate
   */
  public async setActiveResume(req: Request, res: Response) {
    const id = req.params.id as string
    const updated = await this.resumeService.setActiveResume(id)
    return this.sendResponse(
      req,
      res,
      `Resume version ${updated.version} is now active on portfolio`,
      200,
      updated
    )
  }

  /**
   * DELETE /resume/v1/admin/:id
   */
  public async deleteResume(req: Request, res: Response) {
    const id = req.params.id as string
    const result = await this.resumeService.deleteResumeVersion(id)
    return this.sendResponse(req, res, result.message, 200, result)
  }
}
