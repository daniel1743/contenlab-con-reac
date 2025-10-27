Estrategia de Contenido para el Profesional ExigenteUn usuario que está acostumbrado a las herramientas de análisis profesional y a la IA avanzada espera tres cosas: Análisis Estratégico, Datos Específicos y Justificación de la Metodología.La respuesta de tu aplicación debe centrarse en demostrar que la IA no solo genera, sino que piensa como un editor senior.1. El Error de la IA Genérica y Nuestro Enfoque"Entendemos que el contenido generado por IA a menudo es percibido como un resumen básico de Wikipedia. El objetivo de nuestro motor (potenciado por Gemini Pro) es superar la mera síntesis de hechos para enfocarse en la estrategia de contenido. Nuestro valor no es solo el texto, sino el análisis de la intención y la justificación de cada elemento generado."2. Desglose Estratégico del Título y Gancho (Hook)En lugar de ofrecer un título, ofrecemos una Cartera de Títulos con Análisis de Impacto para diferentes canales.ElementoEnfoque de la IA (Profesional)Justificación para el ClienteGeneración de TítulosLa IA no crea un título, crea tres variantes optimizadas para: a) CTR (Click-Through Rate), b) SEO/Búsqueda, y c) Retención de Algoritmo (Controversia).Valor: Demuestra conocimiento de los KPIs de marketing y no impone una sola opción.Ejemplo de Salida (Tema: Caso X)Opción CTR: "El SECRETO de X que nadie se ATREVE a contar: ¿Fraude o Genialidad?" Opción SEO: "Análisis Profundo del Algoritmo X: Cómo dominar la plataforma en 2025."“Optimizamos el Título B para un 5% más de CTR al introducir una pregunta de alto valor emocional, crucial para las primeras 3 horas de rendimiento.”3. Profundidad en el Contenido: El Ángulo ÚnicoLos profesionales no quieren el resumen de la trama; quieren un ángulo narrativo único que justifique la producción.Revisión de Contenido: Le pedimos a la IA que identifique el fallo narrativo en el guion genérico y lo corrija con un ángulo de alto valor.Ejemplo (Tema: Caso X) | Análisis de la IA: "El guion genérico solo explica 'qué pasó'. Se debe pivotar el foco hacia el 'por qué es relevante AHORA' o el 'por qué fallaron todos' (sesgo narrativo de conflicto)." |Revisión de Guion Sugerida: "Tu guion debe reemplazar la línea de introducción de hechos con: 'Este caso se mantiene vivo porque expone el punto ciego de la autoridad Z. Nuestro guion se centra en el error de la variable M, un detalle que la mayoría de los medios ignora'."Valor: “Proveemos un ángulo de nicho que asegura que el contenido sea percibido como 'investigativo' y no solo como una repetición de hechos comunes.”4. Sofisticación en el Llamado a la Acción (CTA) y HashtagsEl CTA y los hashtags deben ser herramientas de segmentación.ElementoEnfoque de la IA (Profesional)Justificación para el ClienteCTA AvanzadoGenerar una pregunta con dos posibles respuestas complejas para impulsar el debate de expertos.Valor: Esto maximiza el engagement cualificado. La IA evita preguntas binarias ("sí/no") y fuerza al usuario a escribir un párrafo para explicar su postura.HashtagsGenerar un conjunto jerárquico que mezcle etiquetas de alto volumen (ej: #Tecnología) con etiquetas de nicho ultra-específicas (ej: #AlgoritmoExplicado)“Esta mezcla le da al contenido la oportunidad de ser descubierto tanto por audiencias masivas como por expertos en la materia, asegurando una vida útil del video más larga.”Conclusión para tu Usuario Exigente:La respuesta final de tu aplicación debe ser un documento estructurado que muestre el guion junto a un panel de análisis (o sección) que diga: "Metodología de Optimización del Generador de IA", justificando cada elección con terminología de marketing
Directrices (Prompts) para la API de Gemini
Debes construir un prompt que tenga tres secciones obligatorias: el rol, las tareas y el formato de salida.

1. ⚙️ System Prompt (Define el Rol y las Reglas)
   Este es el primer mensaje, invisible al usuario final, que le da a Gemini su identidad y sus reglas de operación.

Eres un CONSULTOR DE ESTRATEGIA DE CONTENIDO, especializado en Marketing Viral y KPIs de Alta Retención (CTR, Watch Time).

Tu tarea principal es tomar una temática y un perfil de audiencia, y generar un guion corto y un análisis estratégico detallado para un cliente profesional.

REGLAS DE SALIDA OBLIGATORIAS:

1.  Nunca generes solo el guion.
2.  Tu respuesta debe incluir 3 secciones: Títulos (con análisis), Guion Revisado (con mejoras de ángulo) y Justificación Estratégica.
3.  La justificación debe usar terminología profesional (CTR, Engagement, Ángulo de Nicho, Sesgo Narrativo).
4.  Debes identificar la debilidad del guion simple y corregirla.
5.  📝 User Prompt (Introduce los Datos y el Contexto)
    Este es el mensaje que se activa cuando el usuario de tu aplicación introduce los datos del formulario (Temática + Perfil del Usuario).

Analiza la siguiente temática y perfil de cliente. Genera el contenido solicitado, asegurando la máxima calidad profesional:

### PERFIL DEL CLIENTE:

- Rol: Analista Senior de True Crime
- Audiencia: Consumidores de nicho con alta familiaridad con casos históricos.
- Objetivo: Generar debate cualificado sobre el fallo policial.

### TEMÁTICA SOLICITADA:

- Tópico: El caso de [Temática del Usuario, ej: el misterio de la Dalia Negra].
- Formato: Guion para video corto (45 segundos).

### TAREA PRINCIPAL:

Genera 3 opciones de Título y un Guion Revisado que eviten el resumen simple y, en su lugar, se enfoquen en la narrativa de "fallo sistémico" para atraer al público exigente. 3. 📄 Formato de Salida (JSON/Markdown Estructurado)
Para que tu aplicación pueda leer y presentar los resultados de manera profesional (por ejemplo, en un panel), debes pedirle a Gemini que use un formato estructurado, como Markdown o JSON. Esto es un requisito de diseño crítico para una aplicación no básica.

Ejemplo de Solicitud de Salida Estructurada (Idealmente JSON, pero usando Markdown para este ejemplo):

Markdown

---

### RESULTADO DE ANÁLISIS ESTRATÉGICO

---

#### 1. OPCIONES DE TÍTULOS Y ANÁLISIS DE IMPACTO

| Opción           | Título Generado                     | Justificación Estratégica                                       |
| :--------------- | :---------------------------------- | :-------------------------------------------------------------- |
| A (SEO)          | [Título enfocado en términos clave] | Optimización para búsqueda de nicho de alto valor.              |
| B (CTR)          | [Título emocional con pregunta]     | Maximiza la tasa de clics en las primeras horas críticas.       |
| C (Controversia) | [Título que expone el fallo]        | Diseñado para iniciar debate y aumentar el tiempo de retención. |

#### 2. GUIÓN REVISADO (Con Ángulo de Nicho)

**[0-3 seg] HOOK:** [Línea que ataca el ángulo genérico]

**[3-25 seg] DESARROLLO (Pivote narrativo):** [Narrativa centrada en el fallo o el sesgo].

**[25-45 seg] CTA AVANZADO:** [Pregunta compleja que exige un comentario detallado].

#### 3. JUSTIFICACIÓN DE LA METODOLOGÍA

**DEBILIDAD DEL GUION BÁSICO:** [Explicación de por qué el resumen simple falla con la audiencia.]

**SOLUCIÓN APLICADA:** [Detalle del cambio de ángulo narrativo y su beneficio en el engagement.]
Al utilizar este nivel de detalle en tus directrices, estás programando a Gemini para que razone estratégicamente y no solo para que escriba, lo cual es lo que satisface al usuario profesional.