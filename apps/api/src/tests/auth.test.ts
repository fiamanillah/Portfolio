// src/tests/auth.test.ts
import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { prisma, Role, OtpType } from "@workspace/db";
import { AuthServices } from "../Modules/Auth/auth.service";
import { UserService } from "../Modules/User/user.service";

describe("Authentication & RBAC System Integration Tests", () => {
  const authService = new AuthServices(prisma);
  const userService = new UserService(prisma);

  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = "SuperSecurePassword123!";
  let testUserId: string;
  let testAccessToken: string;
  let adminAccessToken: string;

  beforeAll(async () => {
    // Clean up any prior test users
    await prisma.user.deleteMany({
      where: { email: { contains: "test_" } },
    });
  });

  afterAll(async () => {
    // Clean up test users
    await prisma.user.deleteMany({
      where: { email: { contains: "test_" } },
    });
  });

  it("1. should initiate registration and create an OTP verification record", async () => {
    const res = await authService.initiateRegistration({
      email: testEmail,
      name: "Test Engineer",
      password: testPassword,
      role: "Backend Architect",
      subscribedToNewsletter: true,
    });

    expect(res.success).toBe(true);
    expect(res.email).toBe(testEmail);

    const otpRecord = await prisma.otpVerification.findFirst({
      where: { email: testEmail, type: OtpType.REGISTER_EMAIL_VERIFY, used: false },
    });

    expect(otpRecord).not.toBeNull();
    expect(otpRecord?.code).toHaveLength(6);
    expect(otpRecord?.payload).not.toBeNull();
  });

  it("2. should fail registration verification with wrong OTP code", async () => {
    expect(
      authService.verifyRegisterOtp({
        email: testEmail,
        otpCode: "000000",
      })
    ).rejects.toThrow();
  });

  it("3. should verify registration OTP and create verified user in DB", async () => {
    const otpRecord = await prisma.otpVerification.findFirst({
      where: { email: testEmail, type: OtpType.REGISTER_EMAIL_VERIFY, used: false },
    });
    expect(otpRecord).not.toBeNull();

    const res = await authService.verifyRegisterOtp({
      email: testEmail,
      otpCode: otpRecord!.code,
    });

    expect(res.user.email).toBe(testEmail);
    expect(res.user.name).toBe("Test Engineer");
    expect(res.user.role).toBe(Role.USER);
    expect(res.user.isEmailVerified).toBe(true);
    expect(res.accessToken).toBeDefined();
    expect(res.refreshToken).toBeDefined();

    testUserId = res.user.id;
    testAccessToken = res.accessToken;

    // Check Subscriber table sync
    const subscriber = await prisma.subscriber.findUnique({
      where: { email: testEmail },
    });
    expect(subscriber).not.toBeNull();
    expect(subscriber?.status).toBe("subscribed");
  });

  it("4. should login with credentials and return tokens", async () => {
    const res = await authService.login({
      email: testEmail,
      password: testPassword,
    });

    expect(res.user.id).toBe(testUserId);
    expect(res.accessToken).toBeDefined();
    expect(res.refreshToken).toBeDefined();
  });

  it("5. should login with demo accounts (1-click)", async () => {
    const res = await authService.demoLogin("user-fi");
    expect(res.user.email).toBe("fi@amanillah.dev");
    expect(res.user.role).toBe(Role.ADMIN);

    adminAccessToken = res.accessToken;
  });

  it("6. should get current user profile via getProfile", async () => {
    const profile = await userService.getProfile(testUserId);
    expect(profile.id).toBe(testUserId);
    expect(profile.email).toBe(testEmail);
  });

  it("7. should update user profile personal information", async () => {
    const updated = await userService.updateProfile(testUserId, {
      name: "Updated Engineer Name",
      bio: "Crafting scalable real-time architectures.",
      location: "San Francisco, CA",
      website: "https://engineer.dev",
      customStatus: "🚀 Deploying cluster",
    });

    expect(updated.name).toBe("Updated Engineer Name");
    expect(updated.bio).toBe("Crafting scalable real-time architectures.");
    expect(updated.location).toBe("San Francisco, CA");
    expect(updated.customStatus).toBe("🚀 Deploying cluster");
  });

  it("8. should update newsletter subscription status", async () => {
    const unsub = await userService.updateSubscription(testUserId, {
      subscribedToNewsletter: false,
    });
    expect(unsub.subscribedToNewsletter).toBe(false);

    const subRecord = await prisma.subscriber.findUnique({
      where: { email: testEmail },
    });
    expect(subRecord?.status).toBe("unsubscribed");

    const reSub = await userService.updateSubscription(testUserId, {
      subscribedToNewsletter: true,
    });
    expect(reSub.subscribedToNewsletter).toBe(true);
  });

  it("9. should change user password with valid current password", async () => {
    const newPassword = "BrandNewSuperSecurePassword999!";
    const res = await userService.changePassword(testUserId, {
      currentPassword: testPassword,
      newPassword,
    });
    expect(res.success).toBe(true);

    // Verify login with new password
    const loginRes = await authService.login({
      email: testEmail,
      password: newPassword,
    });
    expect(loginRes.user.id).toBe(testUserId);
  });

  it("10. should handle forgot password OTP flow and password reset", async () => {
    const forgotRes = await authService.forgotPassword({
      email: testEmail,
    });
    expect(forgotRes.success).toBe(true);

    const resetOtp = await prisma.otpVerification.findFirst({
      where: { email: testEmail, type: OtpType.PASSWORD_RESET, used: false },
      orderBy: { createdAt: "desc" },
    });
    expect(resetOtp).not.toBeNull();

    const verifyRes = await authService.verifyResetOtp({
      email: testEmail,
      otpCode: resetOtp!.code,
    });
    expect(verifyRes.success).toBe(true);

    const finalPassword = "FinalAwesomePassword2026!";
    const resetRes = await authService.resetPassword({
      email: testEmail,
      otpCode: resetOtp!.code,
      newPassword: finalPassword,
    });
    expect(resetRes.user.id).toBe(testUserId);

    // Verify login with reset password
    const loginAfterReset = await authService.login({
      email: testEmail,
      password: finalPassword,
    });
    expect(loginAfterReset.user.id).toBe(testUserId);
  });

  it("11. should allow admin to list users and update roles (RBAC)", async () => {
    const adminUser = await prisma.user.findFirst({
      where: { role: Role.ADMIN },
    });
    expect(adminUser).not.toBeNull();

    const listRes = await userService.listUsersAdmin({ page: 1, limit: 10 });
    expect(listRes.data.length).toBeGreaterThan(0);
    expect(listRes.pagination.total).toBeGreaterThan(0);

    // Admin promotes test user to MODERATOR
    const promoted = await userService.updateUserRoleAdmin(adminUser!.id, testUserId, {
      role: Role.MODERATOR,
      badge: "Community Moderator",
    });
    expect(promoted.role).toBe(Role.MODERATOR);
    expect(promoted.badge).toBe("Community Moderator");
  });

  it("12. should allow user to delete their own account", async () => {
    const deleteRes = await userService.deleteAccount(testUserId);
    expect(deleteRes.success).toBe(true);

    const deletedUser = await prisma.user.findUnique({
      where: { id: testUserId },
    });
    expect(deletedUser).toBeNull();
  });
});
