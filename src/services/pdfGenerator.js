/**
 * 📄 PDF GENERATOR SERVICE
 *
 * Servicio para generar reportes PDF de Creo Strategy
 * con diseño profesional y branding de CreoVision
 */

import jsPDF from 'jspdf';

/**
 * Genera un reporte PDF completo de Creo Strategy
 * @param {Object} strategyData - Datos completos del análisis de estrategia
 * @returns {void} - Descarga el PDF automáticamente
 */
export const generateCreoStrategyPDF = (strategyData) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = 20;

    // ========================================
    // FUNCIÓN AUXILIAR: Agregar nueva página si es necesario
    // ========================================
    const checkPageBreak = (spaceNeeded = 20) => {
      if (yPosition + spaceNeeded > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // ========================================
    // FUNCIÓN AUXILIAR: Texto con wrapping
    // ========================================
    const addWrappedText = (text, x, y, maxWidth, lineHeight = 7) => {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return lines.length * lineHeight;
    };

    // ========================================
    // PORTADA
    // ========================================
    // Fondo degradado simulado con rectángulos
    doc.setFillColor(88, 28, 135); // purple-900
    doc.rect(0, 0, pageWidth, pageHeight / 3, 'F');

    doc.setFillColor(67, 56, 202); // indigo-600
    doc.rect(0, pageHeight / 3, pageWidth, pageHeight / 3, 'F');

    doc.setFillColor(37, 99, 235); // blue-600
    doc.rect(0, (pageHeight / 3) * 2, pageWidth, pageHeight / 3, 'F');

    // Logo y título (simulado con texto)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont(undefined, 'bold');
    doc.text('CreoVision', pageWidth / 2, 40, { align: 'center' });

    doc.setFontSize(24);
    doc.text('Creo Strategy', pageWidth / 2, 55, { align: 'center' });

    doc.setFontSize(16);
    doc.setFont(undefined, 'normal');
    doc.text('Reporte de Análisis Competitivo', pageWidth / 2, 70, { align: 'center' });

    // Info del canal
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Canal: ${strategyData.userData.channelTitle}`, pageWidth / 2, 100, { align: 'center' });

    doc.setFont(undefined, 'normal');
    doc.setFontSize(12);
    doc.text(`Temática: ${strategyData.theme}`, pageWidth / 2, 110, { align: 'center' });
    doc.text(`Videos Analizados: ${strategyData.userData.videosAnalyzed}`, pageWidth / 2, 120, { align: 'center' });
    doc.text(`Videos Virales Comparados: ${strategyData.viralVideosAnalyzed}`, pageWidth / 2, 130, { align: 'center' });

    // Fecha
    doc.setFontSize(10);
    const fecha = new Date(strategyData.generatedAt).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    doc.text(`Generado: ${fecha}`, pageWidth / 2, 150, { align: 'center' });

    // Pie de página de portada
    doc.setFontSize(8);
    doc.text('creovision.io - Tu aliado en estrategia de contenido', pageWidth / 2, pageHeight - 20, { align: 'center' });

    // ========================================
    // PÁGINA 2: ANÁLISIS GENERAL
    // ========================================
    doc.addPage();
    yPosition = margin;

    // Título de sección
    doc.setTextColor(88, 28, 135);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Análisis General', margin, yPosition);
    yPosition += 10;

    // Línea decorativa
    doc.setDrawColor(167, 139, 250); // purple-400
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Fortalezas
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Tus Fortalezas', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    strategyData.strategy.analisisGeneral.fortalezasDelUsuario.forEach((fortaleza, i) => {
      checkPageBreak(15);
      doc.setTextColor(34, 197, 94); // green-500
      doc.text(`✓`, margin, yPosition);
      doc.setTextColor(0, 0, 0);
      const height = addWrappedText(fortaleza, margin + 5, yPosition, pageWidth - margin * 2 - 5);
      yPosition += height + 3;
    });

    yPosition += 5;
    checkPageBreak(20);

    // Áreas de Oportunidad
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Áreas de Oportunidad', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    strategyData.strategy.analisisGeneral.areasDeOportunidad.forEach((area, i) => {
      checkPageBreak(15);
      doc.setTextColor(234, 179, 8); // yellow-500
      doc.text('➤', margin, yPosition);
      doc.setTextColor(0, 0, 0);
      const height = addWrappedText(area, margin + 5, yPosition, pageWidth - margin * 2 - 5);
      yPosition += height + 3;
    });

    yPosition += 5;
    checkPageBreak(20);

    // Patrones Virales
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Patrones Virales Detectados', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    strategyData.strategy.analisisGeneral.patronesVialesDetectados.forEach((patron, i) => {
      checkPageBreak(15);
      doc.setTextColor(239, 68, 68); // red-500
      doc.text('★', margin, yPosition);
      doc.setTextColor(0, 0, 0);
      const height = addWrappedText(patron, margin + 5, yPosition, pageWidth - margin * 2 - 5);
      yPosition += height + 3;
    });

    // ========================================
    // PÁGINA 3: ESTRATEGIA SEO
    // ========================================
    doc.addPage();
    yPosition = margin;

    doc.setTextColor(88, 28, 135);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Estrategia SEO', margin, yPosition);
    yPosition += 10;

    doc.setDrawColor(167, 139, 250);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Palabras Clave
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Palabras Clave Recomendadas', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const keywords = strategyData.strategy.estrategiaSEO.palabrasClaveRecomendadas.join(', ');
    const keywordsHeight = addWrappedText(keywords, margin, yPosition, pageWidth - margin * 2);
    yPosition += keywordsHeight + 10;

    checkPageBreak(20);

    // Estructura de Título
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Estructura de Título Óptima', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const tituloHeight = addWrappedText(
      strategyData.strategy.estrategiaSEO.estructuraTituloOptima,
      margin,
      yPosition,
      pageWidth - margin * 2
    );
    yPosition += tituloHeight + 10;

    checkPageBreak(20);

    // Tags Estratégicos
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Tags Estratégicos', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const tags = strategyData.strategy.estrategiaSEO.tagsEstrategicos.join(', ');
    const tagsHeight = addWrappedText(tags, margin, yPosition, pageWidth - margin * 2);
    yPosition += tagsHeight + 10;

    checkPageBreak(20);

    // Optimización de Descripción
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Optimización de Descripción', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const descHeight = addWrappedText(
      strategyData.strategy.estrategiaSEO.optimizacionDescripcion,
      margin,
      yPosition,
      pageWidth - margin * 2
    );
    yPosition += descHeight + 10;

    // ========================================
    // PÁGINA 4: ESTRATEGIA DE CONTENIDO
    // ========================================
    doc.addPage();
    yPosition = margin;

    doc.setTextColor(88, 28, 135);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Estrategia de Contenido', margin, yPosition);
    yPosition += 10;

    doc.setDrawColor(167, 139, 250);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Formatos de Éxito
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Formatos de Éxito', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    strategyData.strategy.estrategiaContenido.formatosDeExito.forEach((formato, i) => {
      checkPageBreak(10);
      doc.text(`${i + 1}. ${formato}`, margin, yPosition);
      yPosition += 7;
    });

    yPosition += 5;
    checkPageBreak(20);

    // Duración Óptima
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Duración Óptima', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(strategyData.strategy.estrategiaContenido.duracionOptima, margin, yPosition);
    yPosition += 10;

    checkPageBreak(20);

    // Elementos Visuales
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Elementos Visuales Clave', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    strategyData.strategy.estrategiaContenido.elementosVisuales.forEach((elemento, i) => {
      checkPageBreak(10);
      doc.text(`• ${elemento}`, margin, yPosition);
      yPosition += 7;
    });

    yPosition += 5;
    checkPageBreak(20);

    // Ganchos de Retención
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Ganchos de Retención', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    strategyData.strategy.estrategiaContenido.ganchosDeRetencion.forEach((gancho, i) => {
      checkPageBreak(10);
      doc.text(`• ${gancho}`, margin, yPosition);
      yPosition += 7;
    });

    // ========================================
    // PÁGINA 5: PLAN DE ACCIÓN
    // ========================================
    doc.addPage();
    yPosition = margin;

    doc.setTextColor(88, 28, 135);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Plan de Acción', margin, yPosition);
    yPosition += 10;

    doc.setDrawColor(167, 139, 250);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Próximos Videos
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Próximos Videos Sugeridos', margin, yPosition);
    yPosition += 10;

    strategyData.strategy.planAccion.proximosVideos.forEach((video, i) => {
      checkPageBreak(30);

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`${i + 1}. ${video.titulo}`, margin, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const conceptoHeight = addWrappedText(video.concepto, margin + 5, yPosition, pageWidth - margin * 2 - 5);
      yPosition += conceptoHeight + 3;

      doc.setTextColor(88, 28, 135);
      doc.text(`Keywords: ${video.keywords.join(', ')}`, margin + 5, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 10;
    });

    checkPageBreak(20);

    // Checklist
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Checklist de Implementación', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    strategyData.strategy.planAccion.checklist.forEach((item, i) => {
      checkPageBreak(10);
      doc.text(`☐ ${item}`, margin, yPosition);
      yPosition += 7;
    });

    // ========================================
    // PÁGINA FINAL: MÉTRICAS Y MENSAJE
    // ========================================
    doc.addPage();
    yPosition = margin;

    doc.setTextColor(88, 28, 135);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Métricas Proyectadas', margin, yPosition);
    yPosition += 10;

    doc.setDrawColor(167, 139, 250);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Potencial de Crecimiento: ${strategyData.strategy.metricas.potencialCrecimiento}`, margin, yPosition);
    yPosition += 10;
    doc.text(`Tiempo Estimado: ${strategyData.strategy.metricas.tiempoEstimado}`, margin, yPosition);
    yPosition += 10;
    doc.text(`Inversión Requerida: ${strategyData.strategy.metricas.inversionRequerida}`, margin, yPosition);
    yPosition += 20;

    // Mensaje Motivacional
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(88, 28, 135);
    doc.text('Mensaje para Ti', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, 'italic');
    doc.setTextColor(0, 0, 0);
    const mensajeHeight = addWrappedText(
      strategyData.strategy.mensajeMotivacional,
      margin,
      yPosition,
      pageWidth - margin * 2
    );
    yPosition += mensajeHeight + 20;

    // Footer final
    doc.setFillColor(88, 28, 135);
    doc.rect(0, pageHeight - 30, pageWidth, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('CreoVision - Estrategia Inteligente de Contenido', pageWidth / 2, pageHeight - 15, { align: 'center' });
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.text('creovision.io | soporte@creovision.io', pageWidth / 2, pageHeight - 8, { align: 'center' });

    // ========================================
    // GUARDAR PDF
    // ========================================
    const fileName = `CreoStrategy_${strategyData.userData.channelTitle.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    console.log('✅ PDF generado exitosamente:', fileName);
  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    throw error;
  }
};

export default {
  generateCreoStrategyPDF
};
