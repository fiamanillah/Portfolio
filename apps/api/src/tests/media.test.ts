// apps/api/src/tests/media.test.ts
import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { prisma, Role } from "@workspace/db";
import { StorageService } from "../services/StorageService";
import { MediaService } from "../Modules/Media/media.service";
import { S3Client } from "@aws-sdk/client-s3";

describe("Cloudflare R2 / S3 Storage Engine & Media Management Integration Tests", () => {
  // Use a real S3Client instance configured for test/mock credentials
  const realS3Client = new S3Client({
    region: "auto",
    endpoint: "https://60656a81bb1a0701ad39ec1287c88b0a.r2.cloudflarestorage.com",
    credentials: {
      accessKeyId: "mockAccessKeyId12345",
      secretAccessKey: "mockSecretAccessKey67890",
    },
  });

  // Mock only network send calls so tests don't require external network connectivity
  realS3Client.send = (async (command: any) => {
    const commandName = command.constructor?.name || command.name;
    if (commandName === "PutObjectCommand") {
      return { ETag: '"test-etag-12345"', $metadata: { httpStatusCode: 200 } };
    }
    if (commandName === "HeadObjectCommand") {
      return {
        ContentLength: 1024,
        ContentType: "image/webp",
        ETag: '"test-etag-12345"',
        LastModified: new Date(),
        Metadata: { source: "UNIT_TEST" },
        $metadata: { httpStatusCode: 200 },
      };
    }
    if (commandName === "DeleteObjectCommand") {
      return { $metadata: { httpStatusCode: 204 } };
    }
    if (commandName === "DeleteObjectsCommand") {
      return {
        Deleted: (command.input?.Delete?.Objects || []).map((o: any) => ({ Key: o.Key })),
        Errors: [],
        $metadata: { httpStatusCode: 200 },
      };
    }
    return { $metadata: { httpStatusCode: 200 } };
  }) as any;

  const storageService = new StorageService(
    realS3Client,
    "portfolio-test-bucket",
    "https://assets.fi.amanillah.com"
  );
  const mediaService = new MediaService(storageService, prisma);

  let testUser: any;
  let otherUser: any;
  let testMediaId: string;
  let testKey: string;

  beforeAll(async () => {
    // Clean up prior test media
    await prisma.mediaFile.deleteMany({
      where: { key: { contains: "test-storage" } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: "mediatest_" } },
    });

    const passwordHash = await Bun.password.hash("SecurePassword123!", { algorithm: "bcrypt", cost: 10 });
    testUser = await prisma.user.create({
      data: {
        email: `mediatest_admin_${Date.now()}@example.com`,
        username: `mediatest_admin_${Date.now()}`,
        name: "Media Admin",
        password: passwordHash,
        role: Role.ADMIN,
      },
    });

    otherUser = await prisma.user.create({
      data: {
        email: `mediatest_user_${Date.now()}@example.com`,
        username: `mediatest_user_${Date.now()}`,
        name: "Regular Member",
        password: passwordHash,
        role: Role.USER,
      },
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.mediaFile.deleteMany({
      where: { key: { contains: "test-storage" } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: "mediatest_" } },
    });
  });

  it("1. StorageService should format collision-safe S3 object keys and public URLs", () => {
    const key = storageService.generateObjectKey("blogs", "Hero Banner (Final) - 2026.PNG");
    expect(key).toStartWith("blogs/");
    expect(key).toEndWith(".png");
    expect(key).toContain("hero-banner-final-2026");

    const publicUrl = storageService.formatPublicUrl("blogs/2026/08/banner-123.webp");
    expect(publicUrl).toBe("https://assets.fi.amanillah.com/blogs/2026/08/banner-123.webp");

    const formattedBytes = storageService.formatBytes(1048576);
    expect(formattedBytes).toBe("1 MB");
  });

  it("2. StorageService should upload buffer to S3/R2 mock correctly", async () => {
    const buffer = Buffer.from("fake image content");
    const result = await storageService.uploadBuffer({
      buffer,
      fileName: "avatar.webp",
      mimeType: "image/webp",
      folder: "avatars",
      tags: ["avatar", "profile"],
      metadata: { userId: "user-123" },
    });

    expect(result.key).toStartWith("avatars/");
    expect(result.url).toContain("assets.fi.amanillah.com");
    expect(result.size).toBe(buffer.length);
    expect(result.etag).toBe("test-etag-12345");
  });

  it("3. StorageService should generate presigned PUT upload URL", async () => {
    const presigned = await storageService.createPresignedUploadUrl({
      fileName: "podcast-episode-1.mp3",
      mimeType: "audio/mpeg",
      folder: "podcasts",
      expiresInSeconds: 600,
    });

    expect(presigned.uploadUrl).toBeDefined();
    expect(presigned.uploadUrl).toContain("X-Amz-Signature");
    expect(presigned.key).toStartWith("podcasts/");
    expect(presigned.publicUrl).toContain("assets.fi.amanillah.com");
    expect(presigned.expiresInSeconds).toBe(600);
  });

  it("4. MediaService should upload single file and track in database with rich tags", async () => {
    const mockFile: Express.Multer.File = {
      fieldname: "file",
      originalname: "portfolio-hero.webp",
      encoding: "7bit",
      mimetype: "image/webp",
      size: 2048,
      buffer: Buffer.from("fake binary webp image"),
      destination: "",
      filename: "",
      path: "",
      stream: null as any,
    };

    const media = await mediaService.uploadSingle(
      mockFile,
      {
        folder: "test-storage-blogs",
        source: "BLOG_EDITOR",
        tags: ["hero", "cover", "featured"],
        altText: "Portfolio hero showcase image",
        caption: "Main cover image for the engineering post",
        metadata: { width: 1920, height: 1080, format: "webp" },
      },
      testUser.id
    );

    expect(media.id).toBeDefined();
    expect(media.fileName).toBe("portfolio-hero.webp");
    expect(media.fileExtension).toBe("webp");
    expect(media.mimeType).toBe("image/webp");
    expect(media.size).toBe(mockFile.buffer.length);
    expect(media.source).toBe("BLOG_EDITOR");
    expect(media.folder).toBe("test-storage-blogs");
    expect(media.tags).toEqual(["hero", "cover", "featured"]);
    expect(media.altText).toBe("Portfolio hero showcase image");
    expect(media.metadata?.width).toBe(1920);
    expect(media.uploader?.id).toBe(testUser.id);

    testMediaId = media.id;
    testKey = media.key;
  });

  it("5. MediaService should list media with search, folder, and tag filters", async () => {
    const listRes = await mediaService.listMedia({
      search: "portfolio-hero",
      folder: "test-storage-blogs",
      tag: "featured",
    });

    expect(listRes.pagination.total).toBeGreaterThanOrEqual(1);
    expect(listRes.data[0].id).toBe(testMediaId);
    expect(listRes.data[0].fileName).toBe("portfolio-hero.webp");
  });

  it("6. MediaService should retrieve media file by ID and Key", async () => {
    const byId = await mediaService.getMediaById(testMediaId);
    expect(byId.id).toBe(testMediaId);
    expect(byId.key).toBe(testKey);

    const byKey = await mediaService.getMediaByKey(testKey);
    expect(byKey.id).toBe(testMediaId);
  });

  it("7. MediaService should update media metadata and tags", async () => {
    const updated = await mediaService.updateMedia(
      testMediaId,
      {
        altText: "Updated alt text description",
        tags: ["hero", "cover", "featured", "v2-updated"],
      },
      testUser.id,
      Role.ADMIN
    );

    expect(updated.altText).toBe("Updated alt text description");
    expect(updated.tags).toContain("v2-updated");
  });

  it("8. MediaService should initiate presigned upload and confirm it", async () => {
    const presignedRes = await mediaService.createPresignedUpload(
      {
        fileName: "direct-client-upload.png",
        mimeType: "image/png",
        size: 4096,
        folder: "test-storage-direct",
        source: "FRONTEND_DIRECT",
        tags: ["direct", "client"],
      },
      testUser.id
    );

    expect(presignedRes.id).toBeDefined();
    expect(presignedRes.uploadUrl).toBeDefined();
    expect(presignedRes.uploadUrl).toContain("X-Amz-Signature");
    expect(presignedRes.key).toStartWith("test-storage-direct/");

    // Confirm upload
    const confirmed = await mediaService.confirmPresignedUpload(
      {
        id: presignedRes.id,
        key: presignedRes.key,
        size: 4096,
        etag: "direct-etag-999",
      },
      testUser.id
    );

    expect(confirmed.id).toBe(presignedRes.id);
    expect(confirmed.size).toBe(4096);
    expect(confirmed.source).toBe("FRONTEND_DIRECT");
  });

  it("9. MediaService should aggregate accurate storage stats", async () => {
    const stats = await mediaService.getMediaStats();
    expect(stats.totalFiles).toBeGreaterThanOrEqual(2);
    expect(stats.totalSizeBytes).toBeGreaterThan(0);
    expect(stats.categories.images.count).toBeGreaterThanOrEqual(2);
    expect(stats.folders.some((f) => f.folder === "test-storage-blogs")).toBe(true);
  });

  it("10. MediaService should block unauthorized users from deleting assets (RBAC)", async () => {
    expect(
      mediaService.deleteMedia(testMediaId, otherUser.id, Role.USER)
    ).rejects.toThrow();
  });

  it("11. MediaService should allow admin or owner to delete media file", async () => {
    const deleteRes = await mediaService.deleteMedia(testMediaId, testUser.id, Role.ADMIN);
    expect(deleteRes.success).toBe(true);

    expect(mediaService.getMediaById(testMediaId)).rejects.toThrow();
  });

  it("12. MediaService should bulk delete media files", async () => {
    // Upload two files
    const fileA = await mediaService.uploadSingle(
      {
        fieldname: "file",
        originalname: "bulk-a.png",
        encoding: "7bit",
        mimetype: "image/png",
        size: 100,
        buffer: Buffer.from("a"),
        destination: "",
        filename: "",
        path: "",
        stream: null as any,
      },
      { folder: "test-storage-bulk" }
    );

    const fileB = await mediaService.uploadSingle(
      {
        fieldname: "file",
        originalname: "bulk-b.png",
        encoding: "7bit",
        mimetype: "image/png",
        size: 100,
        buffer: Buffer.from("b"),
        destination: "",
        filename: "",
        path: "",
        stream: null as any,
      },
      { folder: "test-storage-bulk" }
    );

    const bulkRes = await mediaService.bulkDeleteMedia(
      { ids: [fileA.id, fileB.id] },
      testUser.id,
      Role.ADMIN
    );

    expect(bulkRes.success).toBe(true);
    expect(bulkRes.count).toBe(2);
  });

  it("13. MediaService should deduplicate identical uploads to save storage and API costs", async () => {
    const identicalPayload = Buffer.from("identical file payload for deduplication test");
    const mockFile: Express.Multer.File = {
      fieldname: "file",
      originalname: "dedup-test.png",
      encoding: "7bit",
      mimetype: "image/png",
      size: identicalPayload.length,
      buffer: identicalPayload,
      destination: "",
      filename: "",
      path: "",
      stream: null as any,
    };

    // First upload
    const first = await mediaService.uploadSingle(
      mockFile,
      { folder: "test-storage-dedup" },
      testUser.id
    );

    // Second upload with identical content
    const second = await mediaService.uploadSingle(
      mockFile,
      { folder: "test-storage-dedup" },
      testUser.id
    );

    expect(second.id).toBe(first.id);
    expect(second.key).toBe(first.key);
    expect(second.url).toBe(first.url);
  });

  it("14. MediaService should scan and cleanup orphaned and unreferenced media files", async () => {
    // Create an orphaned avatar record that belongs to non-existent user
    await prisma.mediaFile.create({
      data: {
        key: "avatars/2026/08/orphaned-avatar-test.jpg",
        bucket: "portfolio-assets",
        fileName: "orphaned-avatar.jpg",
        mimeType: "image/jpeg",
        size: BigInt(512),
        url: "https://pub-33f884498775473c95ffedb130131280.r2.dev/avatars/2026/08/orphaned-avatar-test.jpg",
        source: "USER_AVATAR",
        folder: "avatars",
        entityType: "User",
        entityId: "00000000-0000-0000-0000-000000000000",
      },
    });

    const cleanupRes = await mediaService.cleanOrphanedMedia({
      olderThanDays: 0,
      type: "avatars",
      dryRun: false,
    });

    expect(cleanupRes.success).toBe(true);
    expect(cleanupRes.count).toBeGreaterThanOrEqual(1);
    expect(cleanupRes.keys).toContain("avatars/2026/08/orphaned-avatar-test.jpg");
  });
});
