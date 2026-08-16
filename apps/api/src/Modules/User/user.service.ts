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

export class UserService {
  private logger = new AppLogger("UserService");

  constructor(private readonly db: typeof prisma = prisma) {}

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

    // Mark email as unsubscribed
    await this.db.subscriber.updateMany({
      where: { email: user.email },
      data: { status: "unsubscribed" },
    });

    // Delete user
    await this.db.user.delete({
      where: { id: userId },
    });

    this.logger.info("✔ User account erased", { userId });
    return { success: true, message: "Your account has been deleted permanently." };
  }

  /**
   * 6. ADMIN: LIST USERS:
   */
  public async listUsersAdmin(query: AdminUserQueryDTO) {
    const { page, limit, search, role } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { headline: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [total, users] = await Promise.all([
      this.db.user.count({ where }),
      this.db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

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

    await this.db.user.delete({
      where: { id: targetUserId },
    });

    this.logger.info("✔ User deleted by administrator", { targetUserId });
    return { success: true, message: `User account "${target.email}" deleted successfully.` };
  }
}
