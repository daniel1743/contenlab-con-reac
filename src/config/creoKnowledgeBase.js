/**
 * 🧠 BASE DE CONOCIMIENTO DE CREOVISION
 * Mapa completo de herramientas, funciones y rutas para CREO Coach
 * @version 1.0.0
 */

export const CREOVISION_TOOLS = {
  // ✅ HERRAMIENTAS DISPONIBLES
  available: [
    {
      id: 'tendencias-virales',
      name: 'Tendencias Virales',
      path: '/tendencias',
      category: 'Análisis',
      description: 'Analiza tendencias de YouTube, Twitter, News y Reddit con IA',
      features: [
        'Análisis SEO completo',
        'Keywords y hashtags estratégicos',
        'Plan de ejecución de 72 horas',
        'Adaptación a tu nicho y estilo',
        'Long-tail keywords',
        'Métricas de saturación'
      ],
      howToUse: [
        'Ve a "Tendencias Virales" en el menú',
        'Selecciona una categoría (YouTube, Twitter, News o Reddit)',
        'Desbloquea la tendencia que te interese',
        'Recibe análisis personalizado al instante'
      ],
      cost: '20 créditos por tendencia',
      costAll: '80-100 créditos para desbloquear todas',
      benefits: 'Descubre qué está viral AHORA y cómo aprovecharlo antes que tu competencia'
    },
    {
      id: 'genera-guion',
      name: 'Genera tu Guión',
      path: '/generar-guion',
      category: 'Creación',
      description: 'Crea scripts profesionales para tu contenido con IA',
      features: [
        'Scripts personalizados a tu tono',
        'Múltiples plataformas (YouTube, TikTok, Instagram)',
        'Estructuras probadas',
        'Hooks virales',
        'Calls to action optimizados'
      ],
      howToUse: [
        'Ve a "Genera tu Guión"',
        'Selecciona tu plataforma',
        'Ingresa el tema o tendencia',
        'Ajusta el tono (casual, profesional, educativo)',
        'Descarga tu script listo para grabar'
      ],
      cost: '15 créditos por guión',
      benefits: 'Ahorra horas de escritura, crea contenido que conecta con tu audiencia'
    },
    {
      id: 'hashtags-generator',
      name: 'Generador de Hashtags',
      path: '/hashtags',
      category: 'SEO',
      description: 'Genera hashtags estratégicos para maximizar alcance',
      features: [
        'Hashtags de alto volumen',
        'Hashtags de nicho',
        'Mix estratégico (populares + específicos)',
        'Análisis de competencia'
      ],
      howToUse: [
        'Ve a "Generador de Hashtags"',
        'Ingresa tu tema o nicho',
        'Recibe lista optimizada de 15-30 hashtags',
        'Copia y pega en tu publicación'
      ],
      cost: '10 créditos',
      benefits: 'Aumenta tu alcance orgánico hasta 3x con hashtags correctos'
    },
    {
      id: 'seo-optimizer',
      name: 'Optimizador SEO',
      path: '/seo',
      category: 'SEO',
      description: 'Optimiza títulos y descripciones para máximo alcance',
      features: [
        'Análisis de keywords',
        'Sugerencias de títulos virales',
        'Descripciones optimizadas',
        'Meta tags para YouTube/Web'
      ],
      howToUse: [
        'Ve a "Optimizador SEO"',
        'Pega tu título/descripción actual',
        'Recibe versión optimizada',
        'Aplica cambios sugeridos'
      ],
      cost: '12 créditos',
      benefits: 'Mejora tu posicionamiento en búsquedas y recomendaciones'
    },
    {
      id: 'calendario-contenido',
      name: 'Calendario de Contenido',
      path: '/calendario',
      category: 'Planificación',
      description: 'Planifica y programa tus publicaciones estratégicamente',
      features: [
        'Vista mensual/semanal',
        'Programación de posts',
        'Recordatorios automáticos',
        'Integración con análisis de tendencias'
      ],
      howToUse: [
        'Ve a "Calendario"',
        'Agrega tus publicaciones planificadas',
        'Establece horarios óptimos',
        'Recibe recordatorios para publicar'
      ],
      cost: 'Gratis (función incluida)',
      benefits: 'Mantén consistencia, el secreto del crecimiento'
    },
    {
      id: 'dashboard-crecimiento',
      name: 'Dashboard de Crecimiento',
      path: '/dashboard',
      category: 'Análisis',
      description: 'Monitorea métricas clave y progreso de tu canal',
      features: [
        'Métricas en tiempo real',
        'Comparativas de rendimiento',
        'Insights accionables',
        'Proyecciones de crecimiento'
      ],
      howToUse: [
        'Ve a "Dashboard"',
        'Conecta tu canal (YouTube, TikTok, etc.)',
        'Observa tus métricas',
        'Recibe recomendaciones de mejora'
      ],
      cost: 'Gratis (función incluida)',
      benefits: 'Toma decisiones basadas en datos, no en suposiciones'
    },
    {
      id: 'mi-perfil',
      name: 'Mi Perfil',
      path: '/mi-perfil',
      category: 'Configuración',
      description: 'Personaliza tu experiencia en CreoVision',
      features: [
        'Datos de tu canal',
        'Preferencias de nicho y estilo',
        'Gestión de créditos',
        'Historial de uso'
      ],
      howToUse: [
        'Ve a "Mi Perfil"',
        'Completa tu información (plataforma, nicho, estilo)',
        'Esto ayuda a personalizar todos los análisis',
        'Gestiona tus créditos y suscripción'
      ],
      cost: 'Gratis',
      benefits: 'Análisis más precisos y personalizados para TI'
    }
  ],

  // 🚧 HERRAMIENTAS EN DESARROLLO
  inDevelopment: [
    {
      id: 'miniaturas-ai',
      name: 'Miniaturas AI',
      status: 'En desarrollo activo',
      eta: 'Próximamente',
      description: 'Genera miniaturas impactantes con IA',
      alternative: {
        tool: 'genera-guion',
        message: 'Mientras tanto, crea guiones increíbles que hagan que cualquier miniatura funcione mejor'
      }
    },
    {
      id: 'editor-videos',
      name: 'Editor de Videos',
      status: 'En roadmap',
      eta: 'Q1 2026',
      description: 'Edita videos directamente en CreoVision',
      alternative: {
        tool: 'genera-guion',
        message: 'Por ahora, enfócate en crear scripts perfectos con "Genera tu Guión"'
      }
    },
    {
      id: 'analisis-competencia',
      name: 'Análisis de Competencia',
      status: 'Beta cerrada',
      eta: 'Próximamente',
      description: 'Analiza qué hace tu competencia y cómo superarla',
      alternative: {
        tool: 'tendencias-virales',
        message: 'Usa "Tendencias Virales" para estar al día de lo que funciona en tu nicho'
      }
    }
  ],

  // 🎯 FLUJOS COMUNES
  commonFlows: [
    {
      scenario: 'Quiero crear contenido viral',
      steps: [
        'Paso 1: Ve a "Tendencias Virales" → Descubre qué está funcionando',
        'Paso 2: Desbloquea una tendencia relevante → Recibe análisis SEO',
        'Paso 3: Ve a "Genera tu Guión" → Crea script basado en la tendencia',
        'Paso 4: Usa "Generador de Hashtags" → Optimiza alcance',
        'Paso 5: Programa en "Calendario" → Publica en horario óptimo'
      ]
    },
    {
      scenario: 'Necesito ideas para videos',
      steps: [
        'Paso 1: Ve a "Tendencias Virales" → Explora tendencias de tu nicho',
        'Paso 2: Desbloquea las que te inspiren',
        'Paso 3: Lee el análisis SEO → Identifica keywords',
        'Paso 4: Ve a "Genera tu Guión" → Crea contenido único sobre esa tendencia'
      ]
    },
    {
      scenario: 'Quiero optimizar mi contenido existente',
      steps: [
        'Paso 1: Ve a "Optimizador SEO" → Mejora títulos y descripciones',
        'Paso 2: Usa "Generador de Hashtags" → Actualiza hashtags',
        'Paso 3: Monitorea resultados en "Dashboard de Crecimiento"'
      ]
    }
  ],

  // 📊 SISTEMA DE CRÉDITOS
  creditsSystem: {
    howToGet: [
      'Paquete Starter: 100 créditos - $5 USD',
      'Paquete Pro: 500 créditos - $20 USD',
      'Paquete Premium: 1500 créditos - $50 USD',
      'Suscripción mensual con créditos ilimitados disponible'
    ],
    bestValue: 'Paquete Premium (1500 créditos) - Ahorra 40%',
    freeCredits: 'Usuarios nuevos reciben 50 créditos de bienvenida'
  }
};

/**
 * Busca una herramienta por su ID o nombre
 */
export function findTool(query) {
  const lowerQuery = query.toLowerCase();

  // Buscar en disponibles
  const available = CREOVISION_TOOLS.available.find(
    tool => tool.id === lowerQuery ||
            tool.name.toLowerCase().includes(lowerQuery) ||
            tool.description.toLowerCase().includes(lowerQuery)
  );

  if (available) return { found: true, tool: available, status: 'available' };

  // Buscar en desarrollo
  const inDev = CREOVISION_TOOLS.inDevelopment.find(
    tool => tool.id === lowerQuery ||
            tool.name.toLowerCase().includes(lowerQuery)
  );

  if (inDev) return { found: true, tool: inDev, status: 'in_development' };

  return { found: false };
}

/**
 * Construye contexto de conocimiento para CREO
 */
export function buildCreoKnowledgeContext(userProfile = {}) {
  const { platform, niche, style } = userProfile;

  return `
🧠 CONOCIMIENTO COMPLETO DE CREOVISION:

HERRAMIENTAS DISPONIBLES:
${CREOVISION_TOOLS.available.map(tool =>
  `- ${tool.name}: ${tool.description} (${tool.cost})`
).join('\n')}

HERRAMIENTAS EN DESARROLLO:
${CREOVISION_TOOLS.inDevelopment.map(tool =>
  `- ${tool.name}: ${tool.status} → Alternativa: ${tool.alternative.message}`
).join('\n')}

PERFIL DEL USUARIO:
${platform ? `- Plataforma: ${platform}` : ''}
${niche ? `- Nicho: ${niche}` : ''}
${style ? `- Estilo: ${style}` : ''}
`;
}

export default CREOVISION_TOOLS;
