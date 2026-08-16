// src/Modules/User/user.service.ts
import { prisma, Role, User } from "@workspace/db";
import { AppLogger } from "@workspace/logger";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  AuthorizationError,
} from "@/core/errors/AppError";
import {
  UpdateProfileDTO,
  ChangePasswordDTO,
  UpdateSubscriptionDTO,
  AdminUpdateUserRoleDTO,
  AdminUserQueryDTO,
} from "./UserDTO";
import { SanitizedUser } from "../Auth/auth.service";
import { StorageService } from "@/services/StorageService";

export class UserService {
  private logger = new AppLogger("UserService");

  constructor(
    private readonly db: typeof prisma = prisma,
    private readonly storage: StorageService = new StorageService()
  ) {}

  public sanitizeUser(user: User): SanitizedUser {
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      headline: user.headline,
      badge: user.badge || (user.role === Role.ADMIN ? "Author" : user.role === Role.MODERATOR ? "Moderator" : "Member"),
      bio: user.bio,
      location: user.location,
      website: user.website,
      githubUrl: user.githubUrl,
      twitterUrl: user.twitterUrl,
      linkedinUrl: user.linkedinUrl,
      pronouns: user.pronouns,
      customStatus: user.customStatus,
      isEmailVerified: user.isEmailVerified,
      subscribedToNewsletter: user.subscribedToNewsletter,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  /**
   * 1. GET PROFILE:
   */
  public async getProfile(userId: string): Promise<SanitizedUser> {
    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User account not found.");
    }

    return this.sanitizeUser(user);
  }

  /**
   * 2. UPDATE PROFILE:
   */
  public async updateProfile(userId: string, dto: UpdateProfileDTO): Promise<SanitizedUser> {
    this.logger.info("Updating user profile", { userId });

    const currentUser = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      throw new NotFoundError("User account not found.");
    }

    // Check unique username if updated
    if (dto.username && dto.username !== currentUser.username) {
      const existing = await this.db.user.findUnique({
        where: { username: dto.username },
      });

      if (existing && existing.id !== userId) {
        throw new ConflictError(`The username "@${dto.username}" is already taken.`);
      }
    }

    const updated = await this.db.user.update({
      where: { id: userId },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.username ? { username: dto.username } : {}),
        ...(dto.bio !== undefined ? { bio: dto.bio } : {}),
        ...(dto.avatar !== undefined ? { avatar: dto.avatar } : {}),
        ...(dto.role !== undefined ? { headline: dto.role } : {}),
        ...(dto.location !== undefined ? { location: dto.location } : {}),
        ...(dto.website !== undefined ? { website: dto.website } : {}),
        ...(dto.githubUrl !== undefined ? { githubUrl: dto.githubUrl } : {}),
        ...(dto.twitterUrl !== undefined ? { twitterUrl: dto.twitterUrl } : {}),
        ...(dto.linkedinUrl !== undefined ? { linkedinUrl: dto.linkedinUrl } : {}),
        ...(dto.pronouns !== undefined ? { pronouns: dto.pronouns } : {}),
        ...(dto.customStatus !== undefined ? { customStatus: dto.customStatus } : {}),
      },
    });

    // If name changed, update Subscriber record
    if (dto.name) {
      await this.db.subscriber.updateMany({
        where: { email: currentUser.email },
        data: { name: dto.name },
      });
    }

    this.logger.info("✔ User profile updated successfully", { userId });
    return this.sanitizeUser(updated);
  }

  /**
   * 2b. UPLOAD & SET PROFILE AVATAR (Cloudflare R2 / S3):
   */
  public async uploadAvatar(userId: string, file: Express.Multer.File): Promise<SanitizedUser> {
    if (!file || !file.buffer) {
      throw new BadRequestError("Please select an image file to upload as your avatar.");
    }

    if (!file.mimetype.startsWith("image/")) {
      throw new BadRequestError("Avatar must be an image file (e.g. JPEG, PNG, WebP, GIF, SVG).");
    }

    this.logger.info("Uploading profile avatar to S3/R2", {
      userId,
      fileName: file.originalname,
      size: file.size,
    });

    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User account not found.");
    }

    // 1. Find and delete previous avatar files from Cloudflare R2 / S3 to enforce single-avatar-per-user limit
    const previousAvatars = await this.db.mediaFile.findMany({
      where: {
        OR: [
          { source: "USER_AVATAR", entityType: "User", entityId: userId },
          { uploaderId: userId, folder: "avatars" },
        ],
      },
    });

    const oldKeys = previousAvatars.map((a) => a.key).filter(Boolean);
    if (user.avatar) {
      const extractedKey = this.storage.extractKeyFromUrl(user.avatar);
      if (extractedKey && !oldKeys.includes(extractedKey)) {
        oldKeys.push(extractedKey);
      }
    }

    if (oldKeys.length > 0) {
      this.logger.info(`Cleaning up ${oldKeys.length} previous avatar file(s) from S3/R2 storage`, {
        userId,
        oldKeys,
      });
      try {
        await this.storage.deleteObjects(oldKeys);
      } catch (err: any) {
        this.logger.warn(`Failed to delete old avatar files from storage: ${err.message}`);
      }
      await this.db.mediaFile.deleteMany({
        where: { key: { in: oldKeys } },
      });
    }

    // 2. Upload new avatar buffer to S3 / Cloudflare R2 under avatars/ folder
    const uploadResult = await this.storage.uploadBuffer({
      buffer: file.buffer,
      fileName: file.originalname || "avatar.webp",
      mimeType: file.mimetype,
      folder: "avatars",
      tags: ["avatar", "profile-picture"],
      metadata: {
        source: "USER_AVATAR",
        entityType: "User",
        entityId: userId,
        uploaderId: userId,
      },
      isPublic: true,
    });

    // 3. Save single active tracking record in MediaFile table
    await this.db.mediaFile.create({
      data: {
        key: uploadResult.key,
        bucket: uploadResult.bucket,
        fileName: file.originalname || "avatar.webp",
        fileExtension: uploadResult.key.split(".").pop() || null,
        mimeType: uploadResult.mimeType,
        size: BigInt(uploadResult.size),
        url: uploadResult.url,
        etag: uploadResult.etag,
        source: "USER_AVATAR",
        folder: "avatars",
        entityType: "User",
        entityId: userId,
        tags: ["avatar", "profile-picture"],
        isPublic: true,
        uploaderId: userId,
      },
    });

    // 4. Update User.avatar with the active public URL
    const updated = await this.db.user.update({
      where: { id: userId },
      data: { avatar: uploadResult.url },
    });

    // 5. Sync author avatar on published blog posts
    await this.db.blogPost.updateMany({
      where: { authorId: userId },
      data: { authorAvatar: uploadResult.url },
    });

    this.logger.info("✔ User avatar uploaded, old avatar purged, updated successfully", {
      userId,
      url: uploadResult.url,
    });
    return this.sanitizeUser(updated);
  }

  /**
   * 2c. DELETE / REMOVE PROFILE AVATAR:
   * Removes avatar URL and permanently purges the object from Cloudflare R2 / S3 storage.
   */
  public async deleteAvatar(userId: string): Promise<SanitizedUser> {
    this.logger.info("Removing profile avatar", { userId });

    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User account not found.");
    }

    // Find and delete avatar files from Cloudflare R2 / S3
    const avatarFiles = await this.db.mediaFile.findMany({
      where: {
        OR: [
          { source: "USER_AVATAR", entityType: "User", entityId: userId },
          { uploaderId: userId, folder: "avatars" },
        ],
      },
    });

    const keysToDelete = avatarFiles.map((a) => a.key).filter(Boolean);
    if (user.avatar) {
      const extractedKey = this.storage.extractKeyFromUrl(user.avatar);
      if (extractedKey && !keysToDelete.includes(extractedKey)) {
        keysToDelete.push(extractedKey);
      }
    }

    if (keysToDelete.length > 0) {
      this.logger.info(`Purging ${keysToDelete.length} avatar object(s) from S3/R2 storage`, {
        userId,
        keysToDelete,
      });
      try {
        await this.storage.deleteObjects(keysToDelete);
      } catch (err: any) {
        this.logger.warn(`Failed to delete avatar files from storage: ${err.message}`);
      }
      await this.db.mediaFile.deleteMany({
        where: { key: { in: keysToDelete } },
      });
    }

    const updated = await this.db.user.update({
      where: { id: userId },
      data: { avatar: null },
    });

    // Sync blog posts
    await this.db.blogPost.updateMany({
      where: { authorId: userId },
      data: { authorAvatar: null },
    });

    this.logger.info("✔ User avatar removed and storage freed successfully", { userId });
    return this.sanitizeUser(updated);
  }

  /**
   * 3. CHANGE PASSWORD:
   */
  public async changePassword(userId: string, dto: ChangePasswordDTO) {
    this.logger.info("Password change requested", { userId });

    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    const isMatch = await Bun.password.verify(dto.currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestError("Your current password is incorrect. Please check and try again.");
    }

    const newHash = await Bun.password.hash(dto.newPassword, {
      algorithm: "bcrypt",
      cost: 10,
    });

    await this.db.user.update({
      where: { id: userId },
      data: { password: newHash },
    });

    // Invalidate prior sessions
    await this.db.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    this.logger.info("✔ User password changed successfully", { userId });
    return { success: true, message: "Password updated successfully. Please sign in with your new password." };
  }

  /**
   * 4. UPDATE NEWSLETTER SUBSCRIPTION:
   */
  public async updateSubscription(userId: string, dto: UpdateSubscriptionDTO) {
    this.logger.info("Updating subscription status", { userId, subscribed: dto.subscribedToNewsletter });

    const user = await this.db.user.update({
      where: { id: userId },
      data: { subscribedToNewsletter: dto.subscribedToNewsletter },
    });

    if (dto.subscribedToNewsletter) {
      await this.db.subscriber.upsert({
        where: { email: user.email },
        update: { status: "subscribed", name: user.name },
        create: {
          email: user.email,
          name: user.name,
          status: "subscribed",
          source: "profile_settings",
        },
      });
    } else {
      await this.db.subscriber.updateMany({
        where: { email: user.email },
        data: { status: "unsubscribed" },
      });
    }

    return {
      success: true,
      subscribedToNewsletter: user.subscribedToNewsletter,
      message: user.subscribedToNewsletter
        ? "Subscribed to engineering newsletter & updates."
        : "Unsubscribed from engineering newsletter.",
    };
  }

  /**
   * 5. DELETE ACCOUNT:
   */
  public async deleteAccount(userId: string) {
    this.logger.info("Account deletion requested", { userId });

    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    // 1. Purge all user avatar and media files from Cloudflare R2 / S3 storage
    const userFiles = await this.db.mediaFile.findMany({
      where: {
        OR: [{ uploaderId: userId }, { entityId: userId }],
      },
    });

    const keysToDelete = userFiles.map((f) => f.key).filter(Boolean);
    if (user.avatar) {
      const extractedKey = this.storage.extractKeyFromUrl(user.avatar);
      if (extractedKey && !keysToDelete.includes(extractedKey)) {
        keysToDelete.push(extractedKey);
      }
    }

    if (keysToDelete.length > 0) {
      this.logger.info(`Purging ${keysToDelete.length} storage asset(s) for deleted account`, {
        userId,
        keysToDelete,
      });
      try {
        await this.storage.deleteObjects(keysToDelete);
      } catch (err: any) {
        this.logger.warn(`Failed to delete user media assets from storage: ${err.message}`);
      }
      await this.db.mediaFile.deleteMany({
        where: { key: { in: keysToDelete } },
      });
    }

    // 2. Mark email as unsubscribed
    await this.db.subscriber.updateMany({
      where: { email: user.email },
      data: { status: "unsubscribed" },
    });

    // 3. Delete user record
    await this.db.user.delete({
      where: { id: userId },
    });

    this.logger.info("✔ User account and storage assets erased", { userId });
    return { success: true, message: "Your account has been deleted permanently." };
  }

  /**
   * 6. ADMIN: LIST USERS:
   */
  public async listUsersAdmin(query: AdminUserQueryDTO) {
    const { page, limit, search, role, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search && search.trim()) {
      const s = search.trim();
      where.OR = [
        { name: { contains: s, mode: "insensitive" } },
        { email: { contains: s, mode: "insensitive" } },
        { username: { contains: s, mode: "insensitive" } },
        { headline: { contains: s, mode: "insensitive" } },
      ];
    }

    if (role && role !== ("ALL" as any)) {
      where.role = role as Role;
    }

    const allowedSortFields = ["createdAt", "name", "email", "username", "role"];
    const sortField = allowedSortFields.includes(sortBy || "") ? (sortBy as string) : "createdAt";
    const sortDirection = sortOrder === "asc" ? "asc" : "desc";

    const [total, users, totalAll, adminCount, modCount, authorCount, memberCount] = await Promise.all([
      this.db.user.count({ where }),
      this.db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortDirection },
      }),
      this.db.user.count(),
      this.db.user.count({ where: { role: Role.ADMIN } }),
      this.db.user.count({ where: { role: Role.MODERATOR } }),
      this.db.user.count({ where: { role: Role.AUTHOR } }),
      this.db.user.count({ where: { role: Role.USER } }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: users.map((u) => this.sanitizeUser(u)),
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
      stats: {
        total: totalAll,
        admins: adminCount,
        moderators: modCount,
        authors: authorCount,
        users: memberCount,
      },
    };
  }


  /**
   * 7. ADMIN: UPDATE USER ROLE:
   */
  public async updateUserRoleAdmin(
    currentAdminId: string,
    targetUserId: string,
    dto: AdminUpdateUserRoleDTO
  ) {
    this.logger.info("Admin modifying user role", { targetUserId, newRole: dto.role });

    const targetUser = await this.db.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new NotFoundError("Target user not found.");
    }

    // Safety: prevent demoting oneself if the caller is that user
    if (currentAdminId === targetUserId && dto.role !== Role.ADMIN) {
      throw new AuthorizationError("You cannot demote yourself from the Administrator role.");
    }

    const updated = await this.db.user.update({
      where: { id: targetUserId },
      data: {
        role: dto.role,
        ...(dto.badge ? { badge: dto.badge } : {}),
      },
    });

    this.logger.info("✔ User role updated by admin", { targetUserId, newRole: updated.role });
    return this.sanitizeUser(updated);
  }

  /**
   * 8. ADMIN: DELETE USER:
   */
  public async deleteUserAdmin(currentAdminId: string, targetUserId: string) {
    this.logger.info("Admin deleting user account", { targetUserId });

    if (currentAdminId === targetUserId) {
      throw new BadRequestError("You cannot delete your own admin account from the admin dashboard.");
    }

    const target = await this.db.user.findUnique({
      where: { id: targetUserId },
    });

    if (!target) {
      throw new NotFoundError("Target user not found.");
    }

    // 1. Purge all media files and avatar from Cloudflare R2 / S3 storage
    const targetFiles = await this.db.mediaFile.findMany({
      where: {
        OR: [{ uploaderId: targetUserId }, { entityId: targetUserId }],
      },
    });

    const keysToDelete = targetFiles.map((f) => f.key).filter(Boolean);
    if (target.avatar) {
      const extractedKey = this.storage.extractKeyFromUrl(target.avatar);
      if (extractedKey && !keysToDelete.includes(extractedKey)) {
        keysToDelete.push(extractedKey);
      }
    }

    if (keysToDelete.length > 0) {
      this.logger.info(`Purging ${keysToDelete.length} storage asset(s) for deleted user`, {
        targetUserId,
        keysToDelete,
      });
      try {
        await this.storage.deleteObjects(keysToDelete);
      } catch (err: any) {
        this.logger.warn(`Failed to delete target user media assets: ${err.message}`);
      }
      await this.db.mediaFile.deleteMany({
        where: { key: { in: keysToDelete } },
      });
    }

    await this.db.user.delete({
      where: { id: targetUserId },
    });

    this.logger.info("✔ User deleted and storage cleaned by administrator", { targetUserId });
    return { success: true, message: `User account "${target.email}" deleted successfully.` };
  }
}
