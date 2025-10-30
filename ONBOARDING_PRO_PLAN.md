# Plan de Onboarding Profesional – CreoVision

Objetivo: entregar una experiencia bienvenida que refuerce la propuesta “ecosistema IA humano”, capture datos accionables y prepare al usuario para el éxito dentro de la plataforma.

## 1. Arquitectura del flujo
1. **Pantalla de bienvenida**  
   - Mensaje personalizado “Bienvenido a CreoVision, tu laboratorio IA humano”.  
   - Micro video/gif del fundador o mascota explicando beneficios.  
   - CTA: “Crear mi Perfil Visionario”.
2. **Paso 1 – Identidad del creador**  
   - Campos: nombre preferido, alias público, pronombres opcionales.  
   - Dropdown: tipo de creador (YouTuber, TikToker, Podcaster, Marca, Otro).  
   - Valor recogido: uso en tono narrativo y dashboards segmentados.
3. **Paso 2 – Objetivo y etapa**  
   - Pregunta: “¿Qué meta buscas en los próximos 90 días?” (alcance, ventas, comunidad).  
   - Selección múltiple: nivel de experiencia (Inicio, Creciendo, Pro).  
   - Valor: mapea rutas de sugerencias y métricas relevantes.
4. **Paso 3 – Voz del creador**  
   - Enunciado “Así suena tu marca”: sliders para tono (emocional ↔ racional, formal ↔ casual).  
   - Campo ejemplo de copy favorito; análisis NLP para construir perfil.  
   - Valor: alimentar IA narrativa diferenciada.
5. **Paso 4 – Canales y recursos**  
   - Seleccionar plataformas principales, frecuencia publicación, herramientas actuales.  
   - Checkbox “¿Tienes equipo?” (solo/colaborativo).  
   - Valor: segmentación para integraciones y upsells (plan PRO, colab).
6. **Paso 5 – Quick win**  
   - Generar instantáneamente: sugerencia de contenido + checklist 48h.  
   - Mostrar cómo se calculó (transparencia IA).  
   - CTA: “Ir a Panel IA” o “Explorar Comunidad Visionaria”.
7. **Confirmación final**  
   - Resumen descargable (PDF/Notion) con datos y recomendaciones.  
   - Invitación a newsletter + comunidad privada.  
   - Enlace directo a tutorial guiado o demo autopista.

## 2. Integraciones y almacenamiento
- Guardar perfil en Supabase (`profiles` + `creator_voice` tabla).  
- Sincronizar preferencias con `DeepSeek`/`Gemini` prompts.  
- Triggear evento en analítica (PostHog, Segment o GA4) con `onboarding_completed`.  
- Enviar email de bienvenida (Resend/Brevo) con resumen y próximos pasos.

## 3. Diseño y copy
- Estética premium: fondos degradados suaves, iconografía distintiva, avatar mascota.  
- Copy humanizado, 1 emoji máximo por bloque para mantener credibilidad.  
- Microvalidación visual (progress bar 6 pasos, <3 min).

## 4. Validaciones
- Completar onboarding desbloquea sugerencias personalizadas; si se omite, usar plantillas genéricas.  
- Guardar borradores automáticos para evitar pérdida de datos.  
- A/B test con versión corta (3 pasos) para usuarios impacientes.

## 5. Métricas de éxito
- Tasa de finalización > 75 %.  
- Tiempo medio < 2m 30s.  
- % usuarios que activan primer proyecto en <24h.  
- Conversiones a plan PRO de quienes completan voz del creador.

Este plan sirve como guía para el desarrollo del componente `Onboarding` y las integraciones necesarias.
