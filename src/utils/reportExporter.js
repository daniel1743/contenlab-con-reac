import { jsPDF } from 'jspdf';
import {
  AlignmentType,
  BorderStyle,
  Document,
  DocumentProtectionType,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  XmlAttributeComponent,
  XmlComponent,
} from 'docx';

const BRAND = {
  background: '#0B0518',
  panel: '#1A0F2E',
  primary: '#5B21B6',
  accent: '#C084FC',
  textPrimary: '#F5F3FF',
  textMuted: '#C7B3FF',
};

const PDF_COLORS = {
  background: hexToRgb(BRAND.background),
  panel: hexToRgb(BRAND.panel),
  textPrimary: hexToRgb(BRAND.textPrimary),
  textMuted: hexToRgb(BRAND.textMuted),
  accent: hexToRgb(BRAND.accent),
  primary: hexToRgb(BRAND.primary),
};

const WATERMARK_PATH = '/mascota.png';

const watermarkCache = {
  dataUrl: null,
  buffer: null,
  attempted: false,
};

const DEFAULT_OWNER_PASSWORD = 'CreoVision2025';
const PROTECTION_SPIN_COUNT = 100000;

class DocumentProtectionAttributes extends XmlAttributeComponent {
  constructor(options) {
    super(options);
    this.xmlKeys = {
      edit: 'w:edit',
      enforcement: 'w:enforcement',
      cryptProviderType: 'w:cryptProviderType',
      cryptAlgorithmClass: 'w:cryptAlgorithmClass',
      cryptAlgorithmType: 'w:cryptAlgorithmType',
      cryptAlgorithmSid: 'w:cryptAlgorithmSid',
      cryptSpinCount: 'w:cryptSpinCount',
      hash: 'w:hash',
      salt: 'w:salt',
    };
  }
}

class DocumentProtectionElement extends XmlComponent {
  constructor(options) {
    super('w:documentProtection');
    this.root.push(
      new DocumentProtectionAttributes({
        edit: 'readOnly',
        enforcement: 1,
        cryptProviderType: 'rsaFull',
        cryptAlgorithmClass: 'hash',
        cryptAlgorithmType: 'typeAny',
        cryptAlgorithmSid: 4,
        cryptSpinCount: options.spinCount,
        hash: options.hash,
        salt: options.salt,
      })
    );
  }
}

class ReadOnlyRecommendedAttributes extends XmlAttributeComponent {
  constructor() {
    super({ val: 1 });
    this.xmlKeys = {
      val: 'w:val',
    };
  }
}

class ReadOnlyRecommendedElement extends XmlComponent {
  constructor() {
    super('w:readOnlyRecommended');
    this.root.push(new ReadOnlyRecommendedAttributes());
  }
}

export async function exportCreatorReport({ analysisText, creatorName, topic, format }) {
  validateFormat(format);

  const normalised = normaliseTextBlocks(analysisText);
  const watermark = await loadWatermarkAssets();
  const issuedAt = new Date();

  if (format === 'pdf') {
    await generateCreatorPdf({ normalised, creatorName, topic, issuedAt, watermark });
  } else {
    await generateCreatorDocx({ normalised, creatorName, topic, issuedAt, watermark });
  }
}

export async function exportSeoReport({ seoAnalysis, articleTitle, topic, format }) {
  validateFormat(format);

  const watermark = await loadWatermarkAssets();
  const issuedAt = new Date();

  if (format === 'pdf') {
    await generateSeoPdf({ seoAnalysis, articleTitle, topic, issuedAt, watermark });
  } else {
    await generateSeoDocx({ seoAnalysis, articleTitle, topic, issuedAt, watermark });
  }
}

function validateFormat(format) {
  if (!['pdf', 'docx'].includes(format)) {
    throw new Error(`Formato de exportacion no soportado: ${format}`);
  }
}

function normaliseTextBlocks(text) {
  if (!text) {
    return { paragraphs: [] };
  }

  const sanitized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = sanitized.split('\n').map((line) => line.trim()).filter(Boolean);

  const paragraphs = [];
  const bullets = [];

  lines.forEach((line) => {
    const cleanLine = line.replace(/\uFFFD/g, '').trim();
    if (!cleanLine) return;

    if (/^(\d+[\.\)]|[-*•])\s*/.test(cleanLine)) {
      bullets.push(cleanLine.replace(/^(\d+[\.\)]|[-*•])\s*/, '').trim());
    } else {
      paragraphs.push(cleanLine);
    }
  });

  return { paragraphs, bullets };
}

function hexToRgb(hex) {
  const parsed = hex.replace('#', '');
  const bigint = parseInt(parsed, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

async function loadWatermarkAssets() {
  if (watermarkCache.attempted) {
    return watermarkCache;
  }

  watermarkCache.attempted = true;

  try {
    const response = await fetch(WATERMARK_PATH);
    if (!response.ok) {
      return watermarkCache;
    }

    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    const dataUrl = await blobToDataUrl(blob);

    watermarkCache.buffer = new Uint8Array(buffer);
    watermarkCache.dataUrl = dataUrl;
  } catch (error) {
    console.warn('No se pudo cargar la marca de agua de CreoVision:', error);
  }

  return watermarkCache;
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function triggerBlobDownload(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function applyDocxProtection(doc, password) {
  if (!doc?.Settings?.addChildElement) {
    return;
  }

  const descriptor = await deriveDocxProtection(password);
  if (descriptor) {
    doc.Settings.addChildElement(new DocumentProtectionElement(descriptor));
  }

  doc.Settings.addChildElement(new ReadOnlyRecommendedElement());
}

async function deriveDocxProtection(password) {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    return null;
  }

  try {
    const pwd = password || DEFAULT_OWNER_PASSWORD;
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const passwordBytes = encodeUtf16Le(pwd);

    let hashBuffer = await window.crypto.subtle.digest('SHA-1', concatUint8Arrays(salt, passwordBytes));

    for (let i = 0; i < PROTECTION_SPIN_COUNT; i += 1) {
      const combined = concatUint8Arrays(new Uint8Array(hashBuffer), passwordBytes);
      hashBuffer = await window.crypto.subtle.digest('SHA-1', combined);
    }

    return {
      hash: arrayBufferToBase64(hashBuffer),
      salt: arrayBufferToBase64(salt.buffer),
      spinCount: PROTECTION_SPIN_COUNT,
    };
  } catch (error) {
    console.warn('No se pudo generar la proteccion del documento:', error);
    return null;
  }
}

function encodeUtf16Le(str) {
  const buffer = new ArrayBuffer(str.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < str.length; i += 1) {
    view.setUint16(i * 2, str.charCodeAt(i), true);
  }
  return new Uint8Array(buffer);
}

function concatUint8Arrays(a, b) {
  const result = new Uint8Array(a.length + b.length);
  result.set(a, 0);
  result.set(b, a.length);
  return result;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function generateCreatorPdf({ normalised, creatorName, topic, issuedAt, watermark }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  paintPdfBackground(doc, pageWidth, pageHeight);
  paintPdfWatermark(doc, pageWidth, pageHeight, watermark);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...Object.values(PDF_COLORS.textPrimary));
  doc.text('Informe Estrategico CreoVision', pageWidth / 2, 110, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...Object.values(PDF_COLORS.accent));
  doc.text('Diagnostico avanzado del creador', pageWidth / 2, 136, { align: 'center' });

  let cursorY = 180;
  cursorY = renderPdfInfoBlock(doc, {
    cursorY,
    entries: [
      ['Creador', creatorName],
      ['Tema estrategico', topic],
      ['Fecha de emision', issuedAt.toLocaleDateString('es-ES')],
      ['Emitido por', 'CreoVision Intelligence Lab'],
    ],
    watermark,
  });

  cursorY += 20;
  cursorY = renderPdfSectionTitle(doc, cursorY, 'Resumen ejecutivo', watermark);
  cursorY = renderPdfParagraphs(doc, cursorY, normalised.paragraphs, watermark);

  if (normalised.bullets.length) {
    cursorY += 18;
    cursorY = renderPdfSectionTitle(doc, cursorY, 'Acciones recomendadas', watermark);
    cursorY = renderPdfBullets(doc, cursorY, normalised.bullets, watermark);
  }

  cursorY += 24;
  renderPdfFooter(doc, cursorY, issuedAt);

  doc.setProperties({
    title: `Informe CreoVision - ${creatorName}`,
    subject: 'Diagnostico estrategico de creador',
    author: 'CreoVision AI',
    keywords: ['CreoVision', 'Analisis de creador', 'Estrategia digital'],
  });

  doc.setEncryptionOptions({
    ownerPassword: DEFAULT_OWNER_PASSWORD,
    userPermissions: ['print'],
  });

  await doc.save(`Informe-CreoVision-${sanitizeFilename(creatorName)}.pdf`, { returnPromise: true });
}

async function generateSeoPdf({ seoAnalysis, articleTitle, topic, issuedAt, watermark }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  paintPdfBackground(doc, pageWidth, pageHeight);
  paintPdfWatermark(doc, pageWidth, pageHeight, watermark);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...Object.values(PDF_COLORS.textPrimary));
  doc.text('Reporte SEO CreoVision', pageWidth / 2, 110, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...Object.values(PDF_COLORS.accent));
  doc.text('Blueprint optimizado para contenido de alto impacto', pageWidth / 2, 136, { align: 'center' });

  let cursorY = 180;
  cursorY = renderPdfInfoBlock(doc, {
    cursorY,
    entries: [
      ['Tema estrategico', topic],
      ['Articulo analizado', articleTitle],
      ['Fecha de emision', issuedAt.toLocaleDateString('es-ES')],
      ['Emitido por', 'CreoVision Intelligence Lab'],
    ],
    watermark,
  });

  cursorY += 20;
  cursorY = renderPdfSectionTitle(doc, cursorY, 'Oportunidad SEO', watermark);
  cursorY = renderPdfParagraphs(doc, cursorY, [seoAnalysis?.analysis?.oportunidadSEO].filter(Boolean), watermark);

  const keywords = Array.isArray(seoAnalysis?.analysis?.palabrasClave) ? seoAnalysis.analysis.palabrasClave : [];
  if (keywords.length) {
    cursorY += 18;
    cursorY = renderPdfSectionTitle(doc, cursorY, 'Palabras clave prioritarias', watermark);
    cursorY = renderPdfBullets(doc, cursorY, keywords, watermark);
  }

  if (seoAnalysis?.analysis?.tituloOptimizado) {
    cursorY += 18;
    cursorY = renderPdfSectionTitle(doc, cursorY, 'Titulo optimizado sugerido', watermark);
    cursorY = renderPdfParagraphs(doc, cursorY, [seoAnalysis.analysis.tituloOptimizado], watermark);
  }

  const estrategias = Array.isArray(seoAnalysis?.analysis?.estrategiasContenido)
    ? seoAnalysis.analysis.estrategiasContenido
    : [];
  if (estrategias.length) {
    cursorY += 18;
    cursorY = renderPdfSectionTitle(doc, cursorY, 'Estrategia editorial recomendada', watermark);
    cursorY = renderPdfBullets(doc, cursorY, estrategias, watermark);
  }

  const formatos = Array.isArray(seoAnalysis?.analysis?.formatosRecomendados)
    ? seoAnalysis.analysis.formatosRecomendados
    : [];
  if (formatos.length) {
    cursorY += 18;
    cursorY = renderPdfSectionTitle(doc, cursorY, 'Formatos recomendados', watermark);
    cursorY = renderPdfBullets(doc, cursorY, formatos, watermark);
  }

  const metricas = seoAnalysis?.analysis?.metricasObjetivo;
  if (metricas) {
    cursorY += 18;
    cursorY = renderPdfSectionTitle(doc, cursorY, 'Metricas objetivo', watermark);
    const metricLines = [
      metricas.alcanceEstimado && `Alcance estimado: ${metricas.alcanceEstimado}`,
      metricas.dificultadSEO && `Dificultad SEO: ${metricas.dificultadSEO}`,
      metricas.potencialViral && `Potencial viral: ${metricas.potencialViral}`,
    ].filter(Boolean);
    cursorY = renderPdfBullets(doc, cursorY, metricLines, watermark);
  }

  if (seoAnalysis?.analysis?.consejoRapido) {
    cursorY += 18;
    cursorY = renderPdfSectionTitle(doc, cursorY, 'Accion inmediata', watermark);
    cursorY = renderPdfParagraphs(doc, cursorY, [seoAnalysis.analysis.consejoRapido], watermark);
  }

  cursorY += 24;
  renderPdfFooter(doc, cursorY, issuedAt);

  doc.setProperties({
    title: `Reporte SEO CreoVision - ${sanitizeFilename(articleTitle)}`,
    subject: 'Plan de optimizacion SEO generado por CreoVision',
    author: 'CreoVision AI',
    keywords: ['CreoVision', 'SEO', 'Analisis de contenido'],
  });

  doc.setEncryptionOptions({
    ownerPassword: DEFAULT_OWNER_PASSWORD,
    userPermissions: ['print'],
  });

  await doc.save(`Reporte-SEO-CreoVision-${sanitizeFilename(articleTitle)}.pdf`, { returnPromise: true });
}

function paintPdfBackground(doc, width, height) {
  doc.setFillColor(PDF_COLORS.background.r, PDF_COLORS.background.g, PDF_COLORS.background.b);
  doc.rect(0, 0, width, height, 'F');
  doc.setFillColor(PDF_COLORS.panel.r, PDF_COLORS.panel.g, PDF_COLORS.panel.b);
  doc.roundedRect(40, 60, width - 80, height - 120, 18, 18, 'F');
}

function paintPdfWatermark(doc, width, height, watermark) {
  doc.setGState(new doc.GState({ opacity: 0.06 }));
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(140);
  doc.setTextColor(...Object.values(PDF_COLORS.primary));
  doc.text('CREOVISION', width / 2, height / 2 + 50, { align: 'center', angle: 45 });

  if (watermark?.dataUrl) {
    doc.setGState(new doc.GState({ opacity: 0.12 }));
    const size = 220;
    doc.addImage(
      watermark.dataUrl,
      'PNG',
      width / 2 - size / 2,
      height / 2 - size / 2,
      size,
      size,
      undefined,
      'FAST'
    );
  }

  doc.setGState(new doc.GState({ opacity: 1 }));
}

function renderPdfInfoBlock(doc, { cursorY, entries, watermark }) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...Object.values(PDF_COLORS.textMuted));

  const startX = 80;
  const labelWidth = 170;
  let y = cursorY;

  entries.forEach(([label, value]) => {
    y = ensurePdfSpace(doc, y, 40, watermark);
    doc.text(`${label.toUpperCase()}:`, startX, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...Object.values(PDF_COLORS.textPrimary));
    const wrappedValue = doc.splitTextToSize(value ?? 'N/D', 360);
    doc.text(wrappedValue, startX + labelWidth, y);
    const requiredHeight = wrappedValue.length * 14;
    y += Math.max(24, requiredHeight + 6);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...Object.values(PDF_COLORS.textMuted));
  });

  return y;
}

function renderPdfSectionTitle(doc, cursorY, heading, watermark) {
  const adjustedY = ensurePdfSpace(doc, cursorY, 40, watermark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...Object.values(PDF_COLORS.accent));
  doc.text(heading.toUpperCase(), 80, adjustedY);
  doc.setDrawColor(...Object.values(PDF_COLORS.primary));
  doc.setLineWidth(1);
  doc.line(80, adjustedY + 6, 220, adjustedY + 6);
  return adjustedY + 24;
}

function renderPdfParagraphs(doc, cursorY, paragraphs, watermark) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...Object.values(PDF_COLORS.textPrimary));

  let y = cursorY;
  const maxWidth = doc.internal.pageSize.getWidth() - 140;
  paragraphs.forEach((paragraph) => {
    if (!paragraph) return;
    y = ensurePdfSpace(doc, y, 60, watermark);
    const wrapped = doc.splitTextToSize(paragraph, maxWidth);
    doc.text(wrapped, 80, y);
    y += wrapped.length * 14 + 12;
  });

  return y;
}

function renderPdfBullets(doc, cursorY, bullets, watermark) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...Object.values(PDF_COLORS.textPrimary));

  let y = cursorY;
  const maxWidth = doc.internal.pageSize.getWidth() - 170;
  bullets.forEach((bullet) => {
    y = ensurePdfSpace(doc, y, 40, watermark);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...Object.values(PDF_COLORS.accent));
    doc.text('•', 80, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...Object.values(PDF_COLORS.textPrimary));
    const wrapped = doc.splitTextToSize(bullet, maxWidth);
    doc.text(wrapped, 95, y);
    y += wrapped.length * 14 + 10;
  });

  return y;
}

function renderPdfFooter(doc, cursorY, issuedAt) {
  const y = Math.max(cursorY, doc.internal.pageSize.getHeight() - 100);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...Object.values(PDF_COLORS.accent));
  doc.text('Creado automaticamente por CreoVision AI Suite', 80, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...Object.values(PDF_COLORS.textMuted));
  doc.text(`Verificacion: ${issuedAt.toISOString().slice(0, 10)} - https://creovision.app`, 80, y + 18);
}

function ensurePdfSpace(doc, cursorY, requiredSpace, watermark) {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (cursorY + requiredSpace <= pageHeight - 80) {
    return cursorY;
  }

  doc.addPage();
  paintPdfBackground(doc, doc.internal.pageSize.getWidth(), pageHeight);
  paintPdfWatermark(doc, doc.internal.pageSize.getWidth(), pageHeight, watermark);
  return 120;
}

async function generateCreatorDocx({ normalised, creatorName, topic, issuedAt, watermark }) {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        headers: {
          default: buildWatermarkHeader(watermark),
        },
        footers: {
          default: buildFooterParagraph(),
        },
        children: [
          buildHeadingParagraph('Informe estrategico CreoVision'),
          buildSubheadingParagraph('Diagnostico avanzado del creador'),
          buildSpacer(),
          buildInfoTable([
            ['Creador', creatorName],
            ['Tema estrategico', topic],
            ['Fecha de emision', issuedAt.toLocaleDateString('es-ES')],
            ['Emitido por', 'CreoVision Intelligence Lab'],
          ]),
          buildSectionTitle('Resumen ejecutivo'),
          ...buildParagraphs(normalised.paragraphs),
          ...(normalised.bullets.length
            ? [buildSectionTitle('Acciones recomendadas'), ...buildBullets(normalised.bullets)]
            : []),
        ],
      },
    ],
  });

  await applyDocxProtection(doc, DEFAULT_OWNER_PASSWORD);

  const blob = await Packer.toBlob(doc);
  triggerBlobDownload(`Informe-CreoVision-${sanitizeFilename(creatorName)}.docx`, blob);
}

async function generateSeoDocx({ seoAnalysis, articleTitle, topic, issuedAt, watermark }) {
  const analysis = seoAnalysis?.analysis ?? {};
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        headers: {
          default: buildWatermarkHeader(watermark),
        },
        footers: {
          default: buildFooterParagraph(),
        },
        children: [
          buildHeadingParagraph('Reporte SEO CreoVision'),
          buildSubheadingParagraph('Blueprint de posicionamiento organico'),
          buildSpacer(),
          buildInfoTable([
            ['Tema estrategico', topic],
            ['Articulo analizado', articleTitle],
            ['Fecha de emision', issuedAt.toLocaleDateString('es-ES')],
            ['Emitido por', 'CreoVision Intelligence Lab'],
          ]),
          ...(analysis.oportunidadSEO
            ? [buildSectionTitle('Oportunidad SEO'), ...buildParagraphs([analysis.oportunidadSEO])]
            : []),
          ...(Array.isArray(analysis.palabrasClave) && analysis.palabrasClave.length
            ? [buildSectionTitle('Palabras clave prioritarias'), ...buildBullets(analysis.palabrasClave)]
            : []),
          ...(analysis.tituloOptimizado
            ? [buildSectionTitle('Titulo optimizado sugerido'), ...buildParagraphs([analysis.tituloOptimizado])]
            : []),
          ...(Array.isArray(analysis.estrategiasContenido) && analysis.estrategiasContenido.length
            ? [buildSectionTitle('Estrategia editorial recomendada'), ...buildBullets(analysis.estrategiasContenido)]
            : []),
          ...(Array.isArray(analysis.formatosRecomendados) && analysis.formatosRecomendados.length
            ? [buildSectionTitle('Formatos recomendados'), ...buildBullets(analysis.formatosRecomendados)]
            : []),
          ...(analysis.metricasObjetivo
            ? [
                buildSectionTitle('Metricas objetivo'),
                ...buildBullets([
                  analysis.metricasObjetivo.alcanceEstimado &&
                    `Alcance estimado: ${analysis.metricasObjetivo.alcanceEstimado}`,
                  analysis.metricasObjetivo.dificultadSEO &&
                    `Dificultad SEO: ${analysis.metricasObjetivo.dificultadSEO}`,
                  analysis.metricasObjetivo.potencialViral &&
                    `Potencial viral: ${analysis.metricasObjetivo.potencialViral}`,
                ].filter(Boolean)),
              ]
            : []),
          ...(analysis.consejoRapido
            ? [buildSectionTitle('Accion inmediata'), ...buildParagraphs([analysis.consejoRapido])]
            : []),
        ],
      },
    ],
  });

  await applyDocxProtection(doc, DEFAULT_OWNER_PASSWORD);

  const blob = await Packer.toBlob(doc);
  triggerBlobDownload(`Reporte-SEO-CreoVision-${sanitizeFilename(articleTitle)}.docx`, blob);
}

function buildWatermarkHeader(watermark) {
  const children = [];

  if (watermark?.buffer) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: watermark.buffer,
            transformation: { width: 360, height: 360 },
            floating: {
              horizontalPosition: { align: 'center' },
              verticalPosition: { align: 'center' },
              wrap: { type: 'none' },
            },
          }),
        ],
      })
    );
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'CreoVision AI',
          color: BRAND.textMuted.replace('#', ''),
          size: 72,
          bold: true,
        }),
      ],
      spacing: { after: 200 },
    })
  );

  return new Header({
    children,
  });
}

function buildFooterParagraph() {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: 'Emitido automaticamente por CreoVision AI - https://creovision.app',
            color: BRAND.textMuted.replace('#', ''),
            size: 20,
          }),
        ],
      }),
    ],
  });
}

function buildHeadingParagraph(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [
      new TextRun({
        text,
        bold: true,
        color: BRAND.textPrimary.replace('#', ''),
        size: 48,
        font: 'Segoe UI',
      }),
    ],
  });
}

function buildSubheadingParagraph(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [
      new TextRun({
        text,
        color: BRAND.accent.replace('#', ''),
        size: 24,
      }),
    ],
  });
}

function buildSpacer() {
  return new Paragraph({
    children: [new TextRun({ text: '', size: 4 })],
    spacing: { after: 200 },
  });
}

function buildInfoTable(entries) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    },
    rows: entries.map(([label, value]) =>
      new TableRow({
        children: [
          new TableCell({
            shading: { type: 'clear', fill: BRAND.panel.replace('#', '') },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: label.toUpperCase(),
                    bold: true,
                    color: BRAND.textMuted.replace('#', ''),
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            shading: { type: 'clear', fill: BRAND.panel.replace('#', '') },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: value ?? 'N/D',
                    color: BRAND.textPrimary.replace('#', ''),
                    size: 22,
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    ),
  });
}

function buildSectionTitle(text) {
  return new Paragraph({
    spacing: { before: 320, after: 160 },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        color: BRAND.accent.replace('#', ''),
        size: 26,
      }),
    ],
  });
}

function buildParagraphs(paragraphs) {
  return paragraphs
    .filter(Boolean)
    .map(
      (paragraph) =>
        new Paragraph({
          spacing: { after: 160 },
          children: [
            new TextRun({
              text: paragraph,
              color: BRAND.textPrimary.replace('#', ''),
              size: 24,
            }),
          ],
        })
    );
}

function buildBullets(items) {
  return items
    .filter(Boolean)
    .map(
      (item) =>
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: item,
              color: BRAND.textPrimary.replace('#', ''),
              size: 24,
            }),
          ],
        })
    );
}

function sanitizeFilename(input) {
  return (input || 'creovision')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60) || 'creovision';
}
