import { PDFDocument, rgb, StandardFonts, PageSizes } from "pdf-lib";
import { Post } from "@/interfaces/Channel";
import { MediaItem } from "@/interfaces/Media";

interface PDFTheme {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  lightText: string;
  background: string;
  border: string;
}

interface PDFOptions {
  includeImages: boolean;
  includeMetadata: boolean;
  compressionLevel: number;
  theme: PDFTheme;
}

class ImageProcessor {
  private static supportedFormats = ["jpeg", "jpg", "png"];

  static isSupported(url: string, type?: string): boolean {
    if (type) {
      return ["image/jpeg", "image/jpg", "image/png"].includes(
        type.toLowerCase()
      );
    }

    const extension = url.split(".").pop()?.toLowerCase();
    return extension ? this.supportedFormats.includes(extension) : false;
  }

  static async fetchAndConvert(
    url: string
  ): Promise<{ data: ArrayBuffer; format: "jpeg" | "png" }> {
    try {
      const response = await fetch(url, {
        mode: "cors",
        credentials: "omit",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const extension = url.split(".").pop()?.toLowerCase();

      if (this.supportedFormats.includes(extension || "")) {
        const format = extension === "png" ? "png" : "jpeg";
        return { data: arrayBuffer, format };
      }

      return await this.convertToSupported(arrayBuffer);
    } catch (error) {
      console.warn("Failed to fetch image, using placeholder:", error);
      return await this.createPlaceholder();
    }
  }

  private static async convertToSupported(
    originalData: ArrayBuffer
  ): Promise<{ data: ArrayBuffer; format: "jpeg" }> {
    return new Promise((resolve, reject) => {
      const blob = new Blob([originalData]);
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Cannot get canvas context"));
        return;
      }

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          async (convertedBlob) => {
            if (!convertedBlob) {
              reject(new Error("Failed to convert image"));
              return;
            }

            const arrayBuffer = await convertedBlob.arrayBuffer();
            resolve({ data: arrayBuffer, format: "jpeg" });
          },
          "image/jpeg",
          0.9
        );
      };

      img.onerror = () =>
        reject(new Error("Failed to load image for conversion"));
      img.src = URL.createObjectURL(blob);
    });
  }

  private static async createPlaceholder(): Promise<{
    data: ArrayBuffer;
    format: "jpeg";
  }> {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Cannot get canvas context");
      }

      canvas.width = 400;
      canvas.height = 300;

      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      gradient.addColorStop(0, "#f8fafc");
      gradient.addColorStop(0.5, "#e2e8f0");
      gradient.addColorStop(1, "#cbd5e1");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 3;
      ctx.setLineDash([12, 6]);
      ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);

      ctx.fillStyle = "#64748b";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.fillText("[Image]", canvas.width / 2, canvas.height / 2 - 20);

      ctx.font = "16px Arial";
      ctx.fillText(
        "Image Unavailable",
        canvas.width / 2,
        canvas.height / 2 + 10
      );

      ctx.font = "14px Arial";
      ctx.fillStyle = "#475569";
      ctx.fillText(
        "Format not supported or CORS blocked",
        canvas.width / 2,
        canvas.height / 2 + 35
      );

      canvas.toBlob(
        async (blob) => {
          if (blob) {
            const arrayBuffer = await blob.arrayBuffer();
            resolve({ data: arrayBuffer, format: "jpeg" });
          }
        },
        "image/jpeg",
        0.9
      );
    });
  }
}

class ColorUtils {
  static hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { r: 0, g: 0, b: 0 };

    return {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
    };
  }

  static hexToRgbColor(hex: string) {
    const { r, g, b } = this.hexToRgb(hex);
    return rgb(r, g, b);
  }
}

export class EnhancedPDFGenerator {
  private pdfDoc!: PDFDocument;
  private fonts: any = {};
  private theme: PDFTheme;
  private options: PDFOptions;

  constructor(theme: PDFTheme, options: PDFOptions) {
    this.theme = theme;
    this.options = options;
  }

  async initialize(): Promise<void> {
    this.pdfDoc = await PDFDocument.create();

    this.fonts.helvetica = await this.pdfDoc.embedFont(StandardFonts.Helvetica);
    this.fonts.helveticaBold = await this.pdfDoc.embedFont(
      StandardFonts.HelveticaBold
    );
    this.fonts.helveticaOblique = await this.pdfDoc.embedFont(
      StandardFonts.HelveticaOblique
    );

    this.pdfDoc.setTitle("Social Media Posts Export");
    this.pdfDoc.setAuthor("Enhanced PDF Generator");
    this.pdfDoc.setSubject("Social Media Content Report");
    this.pdfDoc.setCreator("PDF-lib Enhanced Generator");
    this.pdfDoc.setProducer("Enhanced Social Media Export Tool");
    this.pdfDoc.setCreationDate(new Date());
    this.pdfDoc.setModificationDate(new Date());
  }

  private addModernHeader(
    page: any,
    pageNumber: number,
    totalPages: number
  ): number {
    const { width, height } = page.getSize();
    const headerHeight = 60;

    const primaryColor = ColorUtils.hexToRgbColor(this.theme.primary);
    const accentColor = ColorUtils.hexToRgbColor(this.theme.accent);

    page.drawRectangle({
      x: 0,
      y: height - headerHeight,
      width: width,
      height: headerHeight,
      color: primaryColor,
    });

    page.drawRectangle({
      x: 0,
      y: height - 5,
      width: width,
      height: 5,
      color: accentColor,
    });

    page.drawText("Social Media Posts Export", {
      x: 30,
      y: height - 35,
      size: 18,
      font: this.fonts.helveticaBold,
      color: rgb(1, 1, 1),
    });

    const dateText = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const dateWidth = this.fonts.helvetica.widthOfTextAtSize(dateText, 12);
    page.drawText(dateText, {
      x: width - dateWidth - 30,
      y: height - 35,
      size: 12,
      font: this.fonts.helvetica,
      color: rgb(0.9, 0.9, 0.9),
    });

    const pageText = `Page ${pageNumber} of ${totalPages}`;
    const pageTextWidth = this.fonts.helvetica.widthOfTextAtSize(pageText, 10);
    page.drawText(pageText, {
      x: width - pageTextWidth - 30,
      y: height - 50,
      size: 10,
      font: this.fonts.helvetica,
      color: rgb(0.8, 0.8, 0.8),
    });

    return height - headerHeight - 20;
  }

  private addModernFooter(page: any): void {
    const { width } = page.getSize();
    const footerY = 30;

    page.drawLine({
      start: { x: 30, y: footerY + 10 },
      end: { x: width - 30, y: footerY + 10 },
      thickness: 1,
      color: ColorUtils.hexToRgbColor(this.theme.border),
    });

    page.drawText("Generated by Enhanced PDF Generator with pdf-lib", {
      x: 30,
      y: footerY - 5,
      size: 8,
      font: this.fonts.helvetica,
      color: ColorUtils.hexToRgbColor(this.theme.lightText),
    });
  }

  private async addTitlePage(posts: Post[]): Promise<void> {
    const page = this.pdfDoc.addPage(PageSizes.A4);
    const { width, height } = page.getSize();

    const currentY = this.addModernHeader(
      page,
      1,
      Math.ceil(posts.length / 2) + 1
    );

    const titleText = "Social Media Posts";
    const titleWidth = this.fonts.helveticaBold.widthOfTextAtSize(
      titleText,
      36
    );
    page.drawText(titleText, {
      x: (width - titleWidth) / 2,
      y: currentY - 50,
      size: 36,
      font: this.fonts.helveticaBold,
      color: ColorUtils.hexToRgbColor(this.theme.primary),
    });

    const subtitleText = "Export Report";
    const subtitleWidth = this.fonts.helvetica.widthOfTextAtSize(
      subtitleText,
      24
    );
    page.drawText(subtitleText, {
      x: (width - subtitleWidth) / 2,
      y: currentY - 85,
      size: 24,
      font: this.fonts.helvetica,
      color: ColorUtils.hexToRgbColor(this.theme.secondary),
    });

    const statsY = currentY - 180;
    const cardWidth = (width - 120) / 3;
    const cardHeight = 80;
    const cardSpacing = 20;

    this.drawStatCard(page, {
      x: 30,
      y: statsY,
      width: cardWidth,
      height: cardHeight,
      title: "Total Posts",
      value: posts.length.toString(),
      color: this.theme.accent,
    });

    const publishedCount = posts.filter((p) => p.published === true).length;
    this.drawStatCard(page, {
      x: 30 + cardWidth + cardSpacing,
      y: statsY,
      width: cardWidth,
      height: cardHeight,
      title: "Published",
      value: publishedCount.toString(),
      color: this.theme.primary,
    });

    const mediaCount = posts.reduce(
      (acc, post) => acc + (post.imageUrls?.length || 0),
      0
    );
    this.drawStatCard(page, {
      x: 30 + (cardWidth + cardSpacing) * 2,
      y: statsY,
      width: cardWidth,
      height: cardHeight,
      title: "Media Items",
      value: mediaCount.toString(),
      color: this.theme.secondary,
    });

    const summaryY = statsY - 120;
    page.drawText("Report Summary", {
      x: 30,
      y: summaryY,
      size: 16,
      font: this.fonts.helveticaBold,
      color: ColorUtils.hexToRgbColor(this.theme.text),
    });

    const summaryText = `This report contains ${posts.length} social media posts with detailed content, metadata, and ${this.options.includeImages ? "media attachments" : "media references"}. Generated on ${new Date().toLocaleDateString()}.`;
    const wrappedSummary = this.wrapText(
      summaryText,
      width - 60,
      this.fonts.helvetica,
      12
    );

    let textY = summaryY - 25;
    wrappedSummary.forEach((line) => {
      page.drawText(line, {
        x: 30,
        y: textY,
        size: 12,
        font: this.fonts.helvetica,
        color: ColorUtils.hexToRgbColor(this.theme.text),
      });
      textY -= 18;
    });

    this.addModernFooter(page);
  }

  private drawStatCard(
    page: any,
    config: {
      x: number;
      y: number;
      width: number;
      height: number;
      title: string;
      value: string;
      color: string;
    }
  ): void {
    const { x, y, width, height, title, value, color } = config;

    page.drawRectangle({
      x,
      y,
      width,
      height,
      color: ColorUtils.hexToRgbColor(color),
      borderRadius: 8,
    });

    const valueSize = 32;
    const valueWidth = this.fonts.helveticaBold.widthOfTextAtSize(
      value,
      valueSize
    );
    page.drawText(value, {
      x: x + (width - valueWidth) / 2,
      y: y + height - 35,
      size: valueSize,
      font: this.fonts.helveticaBold,
      color: rgb(1, 1, 1),
    });

    const titleSize = 12;
    const titleWidth = this.fonts.helvetica.widthOfTextAtSize(title, titleSize);
    page.drawText(title, {
      x: x + (width - titleWidth) / 2,
      y: y + 15,
      size: titleSize,
      font: this.fonts.helvetica,
      color: rgb(0.9, 0.9, 0.9),
    });
  }

  private async addPostPage(
    post: Post,
    postIndex: number,
    totalPages: number
  ): Promise<void> {
    const page = this.pdfDoc.addPage(PageSizes.A4);
    const { height } = page.getSize();

    let currentY = this.addModernHeader(page, postIndex + 2, totalPages);

    currentY = await this.drawPostCard(page, post, postIndex + 1, currentY);

    if (
      this.options.includeImages &&
      post.imageUrls &&
      post.imageUrls.length > 0
    ) {
      currentY = await this.drawMediaSection(
        page,
        post.imageUrls,
        currentY - 20
      );
    }

    this.addModernFooter(page);
  }

  private async drawPostCard(
    page: any,
    post: Post,
    postNumber: number,
    startY: number
  ): Promise<number> {
    const { width } = page.getSize();
    const cardWidth = width - 60;
    let currentY = startY;

    page.drawRectangle({
      x: 30,
      y: currentY - 80,
      width: cardWidth,
      height: 80,
      color: ColorUtils.hexToRgbColor(this.theme.background),
      borderColor: ColorUtils.hexToRgbColor(this.theme.border),
      borderWidth: 1,
    });

    page.drawCircle({
      x: 55,
      y: currentY - 40,
      size: 15,
      color: ColorUtils.hexToRgbColor(this.theme.accent),
    });

    page.drawText(postNumber.toString(), {
      x: 50,
      y: currentY - 45,
      size: 12,
      font: this.fonts.helveticaBold,
      color: rgb(1, 1, 1),
    });

    const title = post.title || `Post ${post.id || postNumber}`;
    page.drawText(title, {
      x: 80,
      y: currentY - 30,
      size: 16,
      font: this.fonts.helveticaBold,
      color: ColorUtils.hexToRgbColor(this.theme.text),
    });

    if (post.date) {
      const dateStr =
        post.date instanceof Date
          ? post.date.toLocaleDateString()
          : new Date(post.date).toLocaleDateString();

      page.drawText(dateStr, {
        x: 80,
        y: currentY - 50,
        size: 10,
        font: this.fonts.helvetica,
        color: ColorUtils.hexToRgbColor(this.theme.lightText),
      });
    }

    if (post.status) {
      const statusColor =
        post.published === true
          ? this.theme.accent
          : post.status.toLowerCase() === "draft"
          ? "#f59e0b"
          : this.theme.secondary;

      const statusX = width - 150;
      page.drawText(`Status: ${post.status}`, {
        x: statusX,
        y: currentY - 35,
        size: 10,
        font: this.fonts.helvetica,
        color: ColorUtils.hexToRgbColor(statusColor),
      });
    }

    currentY -= 100;

    if (post.message) {
      page.drawRectangle({
        x: 30,
        y: currentY - 25,
        width: cardWidth,
        height: 25,
        color: ColorUtils.hexToRgbColor(this.theme.primary),
      });

      page.drawText("Content", {
        x: 40,
        y: currentY - 18,
        size: 12,
        font: this.fonts.helveticaBold,
        color: rgb(1, 1, 1),
      });

      currentY -= 35;

      const wrappedContent = this.wrapText(
        post.message,
        cardWidth - 40,
        this.fonts.helvetica,
        11
      );
      const contentHeight = Math.max(60, wrappedContent.length * 16 + 20);

      page.drawRectangle({
        x: 30,
        y: currentY - contentHeight,
        width: cardWidth,
        height: contentHeight,
        color: rgb(1, 1, 1),
        borderColor: ColorUtils.hexToRgbColor(this.theme.border),
        borderWidth: 1,
      });

      let textY = currentY - 20;
      wrappedContent.forEach((line) => {
        page.drawText(line, {
          x: 40,
          y: textY,
          size: 11,
          font: this.fonts.helvetica,
          color: ColorUtils.hexToRgbColor(this.theme.text),
        });
        textY -= 16;
      });

      currentY -= contentHeight + 20;
    }

    if (
      this.options.includeMetadata &&
      (post.platforms || post.published !== undefined)
    ) {
      currentY = this.drawMetadataSection(page, post, currentY, cardWidth);
    }

    return currentY;
  }

  private drawMetadataSection(
    page: any,
    post: Post,
    startY: number,
    cardWidth: number
  ): number {
    let currentY = startY;

    page.drawRectangle({
      x: 30,
      y: currentY - 20,
      width: cardWidth,
      height: 20,
      color: ColorUtils.hexToRgbColor(this.theme.secondary),
    });

    page.drawText("Metadata", {
      x: 40,
      y: currentY - 15,
      size: 10,
      font: this.fonts.helveticaBold,
      color: rgb(1, 1, 1),
    });

    currentY -= 30;

    if (post.platforms && post.platforms.length > 0) {
      page.drawText("Platforms:", {
        x: 40,
        y: currentY,
        size: 10,
        font: this.fonts.helveticaBold,
        color: ColorUtils.hexToRgbColor(this.theme.text),
      });

      const platformsText = post.platforms.join(", ");
      page.drawText(platformsText, {
        x: 100,
        y: currentY,
        size: 10,
        font: this.fonts.helvetica,
        color: ColorUtils.hexToRgbColor(this.theme.secondary),
      });

      currentY -= 15;
    }

    if (post.published !== undefined) {
      page.drawText("Published:", {
        x: 40,
        y: currentY,
        size: 10,
        font: this.fonts.helveticaBold,
        color: ColorUtils.hexToRgbColor(this.theme.text),
      });

      const publishedText = post.published ? "Yes" : "No";
      const publishedColor = post.published ? this.theme.accent : "#ef4444";

      page.drawText(publishedText, {
        x: 100,
        y: currentY,
        size: 10,
        font: this.fonts.helvetica,
        color: ColorUtils.hexToRgbColor(publishedColor),
      });

      currentY -= 25;
    }

    return currentY;
  }

  private async drawMediaSection(
    page: any,
    mediaItems: MediaItem[],
    startY: number
  ): Promise<number> {
    const { width } = page.getSize();
    const cardWidth = width - 60;
    let currentY = startY;

    page.drawRectangle({
      x: 30,
      y: currentY - 25,
      width: cardWidth,
      height: 25,
      color: ColorUtils.hexToRgbColor(this.theme.primary),
    });

    page.drawText(`Media (${mediaItems.length} items)`, {
      x: 40,
      y: currentY - 18,
      size: 12,
      font: this.fonts.helveticaBold,
      color: rgb(1, 1, 1),
    });

    currentY -= 40;

    for (const mediaItem of mediaItems) {
      if (currentY < 150) {
        const newPage = this.pdfDoc.addPage(PageSizes.A4);
        currentY = newPage.getSize().height - 50;
        page = newPage;
      }

      if (this.isImageType(mediaItem)) {
        currentY = await this.drawImageItem(
          page,
          mediaItem,
          currentY,
          cardWidth
        );
      } else {
        currentY = this.drawVideoItem(page, mediaItem, currentY, cardWidth);
      }

      currentY -= 20;
    }

    return currentY;
  }

  private async drawImageItem(
    page: any,
    mediaItem: MediaItem,
    startY: number,
    maxWidth: number
  ): Promise<number> {
    try {
      const { data, format } = await ImageProcessor.fetchAndConvert(
        mediaItem.url
      );

      let image;
      if (format === "png") {
        image = await this.pdfDoc.embedPng(data);
      } else {
        image = await this.pdfDoc.embedJpg(data);
      }

      const { width: imgWidth, height: imgHeight } = image.scale(1);

      const maxImageWidth = maxWidth - 40;
      const maxImageHeight = 200;

      let width = Math.min(maxImageWidth, imgWidth * 0.3);
      let height = (width / imgWidth) * imgHeight;

      if (height > maxImageHeight) {
        height = maxImageHeight;
        width = (height / imgHeight) * imgWidth;
      }

      page.drawImage(image, {
        x: 40,
        y: startY - height,
        width: width,
        height: height,
      });

      const infoText = `${mediaItem.name || "Image"} (${imgWidth}x${imgHeight})`;
      page.drawText(infoText, {
        x: 40,
        y: startY - height - 20,
        size: 9,
        font: this.fonts.helvetica,
        color: ColorUtils.hexToRgbColor(this.theme.text),
      });

      return startY - height - 35;
    } catch (error) {
      console.error("Failed to add image:", error);
      return this.drawErrorPlaceholder(page, mediaItem, startY, maxWidth);
    }
  }

  private drawVideoItem(
    page: any,
    mediaItem: MediaItem,
    startY: number,
    maxWidth: number
  ): number {
    const itemHeight = 60;

    page.drawRectangle({
      x: 40,
      y: startY - itemHeight,
      width: maxWidth - 40,
      height: itemHeight,
      color: ColorUtils.hexToRgbColor(this.theme.background),
      borderColor: ColorUtils.hexToRgbColor(this.theme.border),
      borderWidth: 1,
    });

    page.drawCircle({
      x: 70,
      y: startY - itemHeight / 2,
      size: 15,
      color: ColorUtils.hexToRgbColor(this.theme.primary),
    });

    page.drawText(">", {
      x: 66,
      y: startY - itemHeight / 2 - 5,
      size: 12,
      font: this.fonts.helvetica,
      color: rgb(1, 1, 1),
    });

    page.drawText(`Video: ${mediaItem.name || "Untitled"}`, {
      x: 100,
      y: startY - 25,
      size: 11,
      font: this.fonts.helveticaBold,
      color: ColorUtils.hexToRgbColor(this.theme.text),
    });

    const truncatedUrl =
      mediaItem.url.length > 60
        ? mediaItem.url.substring(0, 60) + "..."
        : mediaItem.url;
    page.drawText(`URL: ${truncatedUrl}`, {
      x: 100,
      y: startY - 42,
      size: 9,
      font: this.fonts.helvetica,
      color: ColorUtils.hexToRgbColor(this.theme.lightText),
    });

    return startY - itemHeight - 15;
  }

  private drawErrorPlaceholder(
    page: any,
    mediaItem: MediaItem,
    startY: number,
    maxWidth: number
  ): number {
    const placeholderHeight = 40;

    page.drawRectangle({
      x: 40,
      y: startY - placeholderHeight,
      width: maxWidth - 40,
      height: placeholderHeight,
      color: rgb(0.99, 0.9, 0.9),
      borderColor: rgb(0.9, 0.4, 0.4),
      borderWidth: 1,
    });

    page.drawText(`[!] Failed to load: ${mediaItem.name || "Media item"}`, {
      x: 50,
      y: startY - 20,
      size: 10,
      font: this.fonts.helvetica,
      color: rgb(0.8, 0.2, 0.2),
    });

    const errorUrl =
      mediaItem.url.length > 70
        ? mediaItem.url.substring(0, 70) + "..."
        : mediaItem.url;
    page.drawText(errorUrl, {
      x: 50,
      y: startY - 35,
      size: 8,
      font: this.fonts.helvetica,
      color: rgb(0.5, 0.1, 0.1),
    });

    return startY - placeholderHeight - 15;
  }

  private isImageType(mediaItem: MediaItem): boolean {
    const allowedImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/tiff",
      "image/heif",
      "image/webp",
      "image/heic",
    ];

    if (mediaItem.type) {
      return allowedImageTypes.includes(mediaItem.type.toLowerCase());
    }

    if (typeof mediaItem.isVideo === "boolean") {
      return !mediaItem.isVideo;
    }

    const extension = mediaItem.url.split(".").pop()?.toLowerCase();
    const imageExtensions = [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "tiff",
      "heif",
      "webp",
      "heic",
    ];
    return extension ? imageExtensions.includes(extension) : false;
  }

  private sanitizeText(text: string): string {
    return text.replace(/[^\u0000-\u007F]/g, "?");
  }

  private wrapText(
    text: string,
    maxWidth: number,
    font: any,
    fontSize: number
  ): string[] {
    const sanitizedText = this.sanitizeText(text);
    const lines: string[] = [];
    const paragraphs = sanitizedText.split('\n');

    for (const paragraph of paragraphs) {
      const words = paragraph.split(" ");
      let currentLine = "";

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);

        if (testWidth <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
          }
          currentLine = word;
        }
      }

      if (currentLine) {
        lines.push(currentLine);
      }
    }

    return lines;
  }

  async generatePDF(posts: Post[]): Promise<Uint8Array> {
    await this.initialize();

    await this.addTitlePage(posts);

    const totalPages = posts.length + 1;
    for (let i = 0; i < posts.length; i++) {
      await this.addPostPage(posts[i], i, totalPages);
    }

    return await this.pdfDoc.save();
  }
}

export const downloadInPDFWithLib = async (
  posts: Post[],
  customTheme?: Partial<PDFTheme>,
  options?: Partial<PDFOptions>
): Promise<void> => {

  if (!posts || posts.length === 0) {
    console.warn("No posts to export");
    return;
  }

  try {
    const defaultTheme: PDFTheme = {
      primary: "#2563eb",
      secondary: "#64748b",
      accent: "#10b981",
      text: "#1f2937",
      lightText: "#6b7280",
      background: "#f8fafc",
      border: "#e2e8f0",
    };

    const defaultOptions: PDFOptions = {
      includeImages: true,
      includeMetadata: true,
      compressionLevel: 0.8,
      theme: { ...defaultTheme, ...customTheme },
    };

    const finalOptions = { ...defaultOptions, ...options };
    const generator = new EnhancedPDFGenerator(
      finalOptions.theme,
      finalOptions
    );

    const pdfBytes = await generator.generatePDF(posts);

    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    a.href = url;
    a.download = `social-media-posts-${timestamp}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Error generating enhanced PDF with pdf-lib:", error);
    throw error;
  }
};