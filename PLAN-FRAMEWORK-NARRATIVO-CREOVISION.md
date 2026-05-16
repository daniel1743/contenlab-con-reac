# Plan de evolucion: motor narrativo base + modulo terror

## Objetivo

Convertir el sistema actual de terror en una base escalable sin romper el flujo que ya funciona.

La meta no es rehacer el generador, sino extraer poco a poco la infraestructura comun:

```yaml
core_engine:
  - blueprint
  - compliance
  - critic_layer
  - rewrite_layer
  - scoring
  - memory
  - learned_preferences
  - retention
  - timeline
  - generation_modes

genre_modules:
  terror:
    - reglas_de_miedo
    - atmosfera
    - tension
    - oralidad_hades
    - compliance_de_terror
```

## Regla principal de seguridad

El pipeline actual de terror no se reemplaza de golpe.

Cada cambio debe ser incremental, con pruebas despues de cada fase:

```bash
node --test tests/horrorImpactEvaluator.test.mjs tests/horrorQualityValidator.test.mjs tests/userParameterComplianceValidator.test.mjs tests/horrorProfessionalEvaluator.test.mjs tests/horrorNarrativeBlueprint.test.mjs tests/horrorLearnedPreferences.test.mjs
npm run build
```

## Estado actual

El sistema ya tiene un flujo profesional para terror:

```yaml
terror_pipeline_actual:
  - memoria
  - learned_preferences
  - narrative_blueprint
  - beat_timeline_engine
  - arquitecto
  - escritor
  - validadores_locales
  - critic_layer
  - rewrite_or_polish
  - compliance_rewrite
  - anti_overfitting_creativo
  - juez_emocional_semantico
  - beat_timeline_validator
  - regla_de_final_sin_cta_si_el_golpe_final_es_mas_fuerte
  - seleccion_de_mejor_candidato
  - score_final
```

Eso debe mantenerse operativo mientras se extrae el motor comun.

## Estado de implementacion actual

```yaml
siguiente_nivel:
  implementado:
    - juez_emocional_semantico
    - anti_overfitting_creativo
    - beat_timeline_engine
    - beat_timeline_validator
    - regla_de_final_sin_cta_si_el_golpe_final_es_mas_fuerte
    - cta_cierre_separado_en_yaml
    - normalizacion_de_nombre_Expedientes_Hades
    - desorden_humano_score
  parcial:
    - learned_preferences
    - hard_ban_semantico
    - escena_traumatica_detector
  pendiente:
    - dramatic_clarity_engine
    - world_state_serial
    - analytics_reales
```

### Regla de desorden humano

Objetivo: evitar que el `beat_timeline_engine` convierta la historia en una agenda demasiado limpia.

Problema detectado:

```yaml
fallo:
  nombre: estructura_demasiado_perfecta
  sintomas:
    - lunes_martes_miercoles_jueves
    - progresion_por_dias_demasiado_limpia
    - recuerdo_sin_dudas
    - escenas_demasiado_ordenadas
```

Comportamiento implementado:

```yaml
desorden_humano:
  mide:
    - dias_ordenados
    - transiciones_de_calendario
    - marcadores_de_memoria_subjetiva
    - detalles_cotidianos
  penaliza:
    - calendario_perfecto
    - falta_de_dudas
    - recuerdo_demasiado_lucido
  potencia:
    - creo_que
    - no_recuerdo
    - no_estoy_seguro
    - verguenza
    - detalles_cotidianos_inutiles
```

Uso en scoring:

```yaml
score_final:
  incluye: desorden_humano
  efecto:
    - baja_score_si_el_relato_parece_calendario
    - aumenta_riesgo_de_fallo_si_desorden_humano_menor_a_70
```

### Regla de final sin CTA

Objetivo: impedir que el cierre de canal destruya el eco emocional del relato.

Comportamiento esperado:

```yaml
cta_cierre:
  formato:
    voice_script: relato_principal_limpio
    cta_cierre: cierre_de_canal_separado
  regla:
    si_el_ultimo_parrafo_tiene_imagen_fuerte: omitir_cta
    si_el_cta_suena_comercial: omitir_cta
    si_el_cta_baja_tension: omitir_cta
```

Ejemplo:

```yaml
final_fuerte:
  voice_script_termina_en: "Algo sabia que yo tambien iba a dejar de parpadear."
  cta_cierre: ""

final_menos_fragil:
  voice_script_termina_en: "Desde entonces nadie volvio a usar ese ascensor."
  cta_cierre: "En Expedientes Hades seguimos leyendo los casos que nadie quiere contar de noche."
```

### Aprendizaje emocional: estado real

```yaml
learned_preferences:
  estado: parcial_funcional
  actual:
    - extrae_patrones
    - agrega_reglas
    - inyecta_contexto
    - afecta_blueprint
    - afecta_score_final
    - usa_pesos_liked_neutral_disliked
  falta:
    - aprendizaje_por_repeticion_mas_agresivo
    - perfil_emocional_por_usuario_mas_profundo
    - influencia_mas_fuerte_en_seleccion_final
    - trazabilidad_de_por_que_gano_un_candidato
```

### Lo que falta para 10/10

```yaml
prioridad_alta:
  dramatic_clarity_engine:
    objetivo:
      - sumar_dramatismo_sin_volver_el_relato_generico
      - hacer_que_el_conflicto_se_pueda_resumir_en_una_frase_humana
      - conectar_el_objeto_o_fenomeno_central_con_una_herida_personal
      - asegurar_una_perdida_concreta_o_riesgo_emocional_visible
      - lograr_un_cierre_comprensible_sin_explicarlo_todo
    impacto: alto

  hard_ban_semantico:
    objetivo:
      - detectar_NO_usar_recibos
      - detectar_NO_usar_puertas_como_elemento_principal
      - detectar_NO_usar_llamadas_telefonicas
      - bloquear_candidato_si_viola_prohibicion_central
    impacto: alto

  escena_traumatica_detector:
    objetivo:
      - medir_si_existe_escena_realmente_inolvidable
      - distinguir_tension_correcta_de_momento_iconico
      - forzar_rewrite_si_no_hay_escena_clipable_fuerte
    impacto: alto

prioridad_media:
  world_state_serial:
    objetivo:
      - continuidad_real_de_Expedientes_Hades
      - objetos_recurrentes
      - fechas
      - sobrevivientes
      - reglas_del_archivo
    impacto: medio

prioridad_producto:
  analytics_reales:
    objetivo:
      - aprender_de_retencion
      - likes
      - regeneraciones
      - ediciones_manuales
      - feedback_real_del_usuario
    impacto: muy_alto
    depende_de_producto_en_uso: si
```

### Brecha detectada frente a Manuscrito

Problema: `Manuscrito` puede ganar ante jueces generales porque entrega una tragedia mas directa y facil de explicar. Eso no significa que sea mejor para una audiencia fiel de terror en YouTube, pero revela una debilidad util del motor actual: a veces CreoVision prioriza misterio, objeto y atmosfera sobre claridad dramatica.

```yaml
manuscrito_gana_en:
  - dramatismo
  - claridad_del_conflicto
  - cierre_mas_explicito
  - arco_tragico
  - impacto_facil_de_entender

creovision_debe_sumar:
  - dramatismo_sin_melodrama
  - claridad_sin_sobreexplicacion
  - tragedia_personal_sin_cliche
  - final_entendible_con_misterio_residual
  - conflicto_emocional_clipable
```

La respuesta no es imitar a `Manuscrito`. La respuesta es agregar una capa que obligue a cada relato de CreoVision a tener una herida emocional legible debajo del misterio.

```yaml
principio:
  misterio: se_mantiene
  explicacion_total: se_evitable
  drama_humano: se_refuerza
  conflicto: debe_ser_claro
  final: debe_dejar_teoria_pero_no_confusion_basica
```

## Mejora pendiente: dramatic_clarity_engine

Objetivo: que CreoVision conserve su identidad de terror atmosferico y de objeto inquietante, pero tambien gane cuando el evaluador mide dramatismo, claridad del conflicto, arco tragico e impacto inmediato.

No reemplaza:

- `beat_timeline_engine`
- `juez_emocional_semantico`
- `anti_overfitting_creativo`
- `desorden_humano_score`
- `cta_cierre_separado`

Solo agrega una capa de claridad dramatica.

### Reglas del motor

```yaml
dramatic_clarity_engine:
  exige:
    - perdida_concreta
    - culpa_o_negacion_del_protagonista
    - conflicto_resumible_en_una_frase
    - relacion_emocional_con_el_objeto_central
    - climax_con_consecuencia_personal
    - final_comprensible_sin_explicacion_larga
  prohibe:
    - explicar_el_misterio_completo
    - resolver_todo_con_diagnostico_o_monstruo_interno_generico
    - convertir_el_final_en_resumen
    - sacrificar_el_loop_final_por_un_cierre_demasiado_obvio
```

### Ejemplo de objetivo narrativo

En lugar de:

```yaml
debil:
  conflicto: una_cinta_hace_cosas_raras
  final: la_cinta_no_termina
```

Debe buscar:

```yaml
fuerte:
  conflicto: el_protagonista_descubre_que_la_cinta_no_graba_el_pasado_sino_la_parte_de_su_familia_que_el_decidio_olvidar
  perdida: su_recuerdo_mas_importante_no_le_pertenece
  final: la_cinta_no_termina_y_el_tampoco_puede_probar_que_sigue_siendo_el_mismo
```

### Validador local propuesto

```yaml
horrorDramaticClarityValidator:
  checks:
    perdida_concreta:
      peso: 18
      busca:
        - familia
        - nombre
        - memoria
        - casa
        - hijo
        - madre
        - culpa

    conflicto_resumible:
      peso: 18
      busca:
        - una_frase_que_explique_que_quiere_el_protagonista_y_que_lo_impide

    herida_emocional:
      peso: 18
      busca:
        - culpa
        - negacion
        - verguenza
        - mentira
        - abandono
        - recuerdo_bloqueado

    objeto_con_sentido_personal:
      peso: 16
      busca:
        - el_objeto_no_solo_asusta
        - el_objeto_revela_algo_personal

    climax_con_consecuencia:
      peso: 16
      busca:
        - el_quiebre_cambia_la_identidad_o_perdida_del_protagonista

    final_facil_de_entender:
      peso: 14
      busca:
        - ultima_imagen_clara
        - pregunta_residual_concreta
        - no_confusion_basica_de_causa_y_efecto
```

Salida esperada:

```json
{
  "score": 87,
  "passed": true,
  "conflicto_resumible": "Quiere probar que la cinta es falsa, pero cada escena demuestra que el borrado fue el.",
  "riesgo": "El final conserva misterio, pero el dolor central es entendible.",
  "rewrite_required": false
}
```

### Integracion propuesta

```yaml
integracion:
  prompts:
    - agregar_motor_de_claridad_dramatica_al_prompt_base
    - pedir_al_arquitecto_conflicto_dramatico_herida_perdida_y_frase_resumen
    - pedir_al_rewriter_reforzar_drama_sin_explicar_el_misterio

  scoring:
    candidate_selector:
      sumar_dramatic_clarity_score
      bajar_peso_de_calidad_generica_si_hace_falta
    final_score:
      agregar_claridad_dramatica
      riesgo_si_menor_a_70

  metadata:
    lastGenerationMeta:
      - dramaticClarity
      - conflictSummary
      - dramaticWeaknesses

  cache:
    bump_version: viral_script_horror_pipeline_9_7_dramatic_clarity_v17
```

### Criterio de exito

```yaml
creovision_gana_si:
  - mantiene_misterio_y_rewatch
  - agrega_herida_humana_clara
  - el_conflicto_se_entiende_sin_explicacion_externa
  - el_climax_cambia_la_vida_del_protagonista
  - el_final_deja_teoria_y_golpe_emocional
  - no_cae_en_el_cliche_de_todo_estaba_en_su_mente
```

## Cambio inmediato aplicado

El nombre de canal por defecto para terror queda como:

```yaml
canal_por_defecto_terror: Expedientes Hades
```

Comportamiento esperado:

- Si el usuario no cambia nada, el sistema usa `Expedientes Hades`.
- Si el usuario borra y escribe otro nombre, se usa exactamente el nuevo nombre.
- Si otra ruta llama al servicio sin canal y el tema es `terror`, el servicio aplica `Expedientes Hades` como fallback defensivo.
- Para temas que no son terror, no se fuerza ese canal.

## Fase 1: consolidar terror hasta 10/10

Antes de generalizar a otros generos, conviene cerrar las piezas que faltan en terror.

### 1. Pesos reales de feedback

Estado: implementado parcial-funcional. Ya existen pesos `liked`, `neutral`, `disliked`, reglas ponderadas, perfil emocional inicial e impacto en score final. Falta volverlo mas agresivo en seleccion de candidato y trazabilidad.

Objetivo:

```yaml
feedback_weights:
  liked: 5
  neutral: 1
  disliked: -8
```

Debe afectar:

- blueprint
- arquitectura
- prompts
- seleccion de candidato
- score final
- riesgo de fallo

Salida esperada:

```yaml
learned_preferences:
  potenciar:
    - regla: paranoia_urbana
      peso: 12
      evidencia: 4
      confianza: alta
  evitar:
    - regla: explicacion_larga
      peso: -16
      evidencia: 2
      confianza: media
```

### 2. Anti-overfitting creativo

Estado: implementado base. Ya existe guard de diversidad creativa y memoria narrativa. Falta ampliar deteccion semantica de objetos finales, giros y estructuras demasiado parecidas.

Objetivo: evitar que el sistema repita formulas porque funcionaron antes.

Reglas iniciales:

```yaml
diversidad_controlada:
  repetir_hook_maximo: 2
  repetir_simbolo_maximo: 3
  repetir_estructura_maximo: 2
  repetir_final_maximo: 2
```

Debe detectar:

- hooks demasiado parecidos
- simbolos repetidos
- finales clonados
- giros muy similares
- frases recurrentes

### 3. Beat timeline engine

Estado: implementado. Ya controla distribucion por porcentaje de duracion/caracteres, valida beats y agrega `desorden_humano` para evitar calendario perfecto.

Objetivo: controlar el ritmo por segmentos de duracion.

Ejemplo:

```yaml
duracion: 8_minutos
beats:
  - minuto: 0
    objetivo: hook_fuerte
  - minuto: 2
    objetivo: primera_anomalia
  - minuto: 4
    objetivo: prueba_o_contacto
  - minuto: 6
    objetivo: punto_de_no_retorno
  - minuto: 7
    objetivo: traicion_o_quiebre
  - minuto: 8
    objetivo: eco_final
```

La primera version puede ser aproximada por porcentaje de caracteres, no por audio real.

### 4. Mini juez emocional LLM

Estado: implementado base. Ya corre en modo `pro`/`obsesivo` como juez semantico emocional y entra al score final. Falta especializarlo para detectar escena traumatica e imagen inolvidable.

Objetivo: evaluar emociones que no se detectan bien con keywords.

Salida esperada:

```json
{
  "paranoia": 88,
  "incomodidad": 91,
  "credibilidad": 84,
  "confusion_controlada": 79,
  "terror_psicologico": 90,
  "reescritura_necesaria": false
}
```

Uso:

- Solo en modo `pro` u `obsesivo`.
- No debe reemplazar validadores locales.
- Debe complementar el score final.

### 5. Memoria narrativa persistente mas profunda

Estado: parcial. Ya guarda memoria y deriva preferencias, pero aun falta aprendizaje por repeticion mas fuerte y world state serial.

Objetivo: pasar de recordar historial a aprender comportamiento.

Debe convertir feedback en reglas persistentes:

```yaml
perfil_miedo_usuario:
  ama:
    - criatura_silenciosa
    - apartamento_lluvia
    - final_ambiguo
  rechaza:
    - monstruo_explicado
    - gore_excesivo
    - cierre_moralista
```

## Fase 2: extraer core sin romper terror

Crear modulos neutrales sin cambiar comportamiento externo.

Propuesta de estructura:

```yaml
src/ai/core:
  narrativePipelineRunner.js
  narrativeCandidateSelector.js
  narrativeScoring.js
  narrativeCompliance.js
  narrativeMemoryContext.js

src/ai/genres/terror:
  terrorGenreConfig.js
  terrorPrompts.js
  terrorValidators.js
  terrorBlueprint.js
```

Primer paso recomendado:

```yaml
paso_1:
  crear genreConfig para terror
  mover constantes y thresholds
  no mover prompts todavia
  no cambiar outputs
```

## Fase 3: convertir terror en primer modulo

Cuando el core exista, terror debe quedar como configuracion especializada:

```yaml
terror_module:
  id: terror
  default_channel: Expedientes Hades
  emotions:
    - paranoia
    - incomodidad
    - miedo
  avoid:
    - gore_excesivo
    - explicacion_larga
    - palabras_prohibidas
  validators:
    - horrorQualityValidator
    - horrorImpactEvaluator
    - userParameterComplianceValidator
    - horrorProfessionalEvaluator
```

## Fase 4: probar un segundo genero

No empezar con todos los generos.

El mejor segundo modulo seria `true_crime`, porque comparte:

- estructura narrativa
- oralidad
- retencion
- compliance fuerte
- necesidad de credibilidad

Pero cambia:

- evita morbo
- exige claridad del caso
- evalua respeto a victimas
- prioriza contexto social

## Riesgos principales

```yaml
riesgos:
  abstraccion_prematura:
    impacto: alto
    mitigacion: extraer solo lo repetido despues de que terror este estable

  romper_el_pipeline_actual:
    impacto: alto
    mitigacion: tests despues de cada fase y fallback al flujo actual

  duplicar_logica:
    impacto: medio
    mitigacion: core comun + genre config

  hacer_el_core_demasiado_generico:
    impacto: medio
    mitigacion: terror sigue siendo el caso principal hasta validar otro genero
```

## Orden recomendado de ejecucion

1. Mantener terror funcionando como referencia.
2. Agregar `dramatic_clarity_engine` para cerrar la brecha de dramatismo, conflicto claro e impacto facil.
3. Agregar `hard_ban_semantico` para prohibiciones del usuario.
4. Agregar `escena_traumatica_detector`.
5. Reforzar learned preferences en seleccion final y trazabilidad.
6. Crear `world_state_serial` para continuidad de Expedientes Hades.
7. Extraer `narrativePipelineRunner`.
8. Crear `terrorGenreConfig`.
9. Probar `true_crime` como segundo modulo.
10. Integrar analytics reales cuando haya datos de uso.

## Criterio de exito

El sistema debe lograr esto sin perder calidad:

```yaml
usuario:
  pide: experiencia emocional concreta

core:
  organiza: blueprint, memoria, compliance, scoring, rewrite

genero:
  interpreta: reglas emocionales y narrativas del nicho

resultado:
  entrega: guion fiel a la intencion + optimizado para retencion + evaluado profesionalmente
```
