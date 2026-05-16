export const CREO_INTENT_VERSION = 'creo_intent_v2_origin_intro_payoff';

export const creoOriginOptions = [
  { value: 'auto', label: 'Automatico' },
  { value: 'correo_anonimo', label: 'Correo anonimo' },
  { value: 'cassette_sin_nombre', label: 'Cassette sin nombre' },
  { value: 'expediente_policial', label: 'Expediente policial' },
  { value: 'diario_encontrado', label: 'Diario encontrado' },
  { value: 'grabacion_recuperada', label: 'Grabacion recuperada' },
  { value: 'biblioteca_abandonada', label: 'Biblioteca abandonada' },
  { value: 'llamada_telefonica', label: 'Llamada telefonica' },
  { value: 'archivo_medico', label: 'Archivo medico' },
  { value: 'cuaderno_abandonado', label: 'Cuaderno abandonado' },
  { value: 'audio_filtrado', label: 'Audio filtrado' }
];

const originDirectives = {
  correo_anonimo: 'un correo sin remitente, con un archivo o frase imposible que obliga a escuchar antes de entender',
  cassette_sin_nombre: 'un cassette sin etiqueta, caja dañada o frase escrita a mano que parece advertencia',
  expediente_policial: 'un expediente policial incompleto, con paginas faltantes y una version oficial sospechosa',
  diario_encontrado: 'un diario encontrado que mezcla rutina domestica con entradas que no pudieron escribirse despues',
  grabacion_recuperada: 'una grabacion recuperada de un objeto viejo, con cortes, fechas o duraciones que no cuadran',
  biblioteca_abandonada: 'un manuscrito o ficha sin registro encontrada en una biblioteca abandonada',
  llamada_telefonica: 'una llamada grabada o transcrita que llega despues de que el emisor ya no podia llamar',
  archivo_medico: 'un archivo medico, informe o nota clinica con datos que nadie debia conocer',
  cuaderno_abandonado: 'un cuaderno abandonado con marcas fisicas, paginas arrancadas y una ultima frase incomoda',
  audio_filtrado: 'un audio filtrado, reenviado o extraido de un dispositivo con origen oculto'
};

const originRotation = creoOriginOptions
  .filter((option) => option.value !== 'auto')
  .map((option) => option.value);

export const creoCreativeDirections = [
  { id: 'historia_real', label: 'Historia real' },
  { id: 'psicologico', label: 'Psicologico' },
  { id: 'paranormal', label: 'Paranormal' },
  { id: 'horror_rural', label: 'Horror rural' },
  { id: 'creepypasta', label: 'Creepypasta' },
  { id: 'inmersion', label: 'Inmersion' },
  { id: 'impacto', label: 'Impacto' },
  { id: 'universo_serial', label: 'Universo serial' }
];

export const creoScenarioOptions = [
  { value: 'casa_aislada', label: 'Casa aislada', directive: 'una casa aislada que concentra la amenaza y vuelve dificil pedir ayuda' },
  { value: 'pueblo_pequeno', label: 'Pueblo pequeno', directive: 'un pueblo pequeno cerrado, con secretos compartidos y presion social' },
  { value: 'bosque_rural', label: 'Bosque rural', directive: 'un bosque rural donde la distancia, los sonidos y la orientacion aumentan la tension' },
  { value: 'carretera', label: 'Carretera', directive: 'una carretera donde cada decision de viaje empeora el aislamiento' },
  { value: 'colegio', label: 'Colegio', directive: 'un colegio con rutinas conocidas que se vuelven amenazantes al cambiar pequenos detalles' },
  { value: 'departamento_antiguo', label: 'Departamento antiguo', directive: 'un departamento antiguo con vecinos, ruidos y espacios comunes inquietantes' },
  { value: 'finca', label: 'Finca', directive: 'una finca apartada donde el terreno y los objetos cotidianos sostienen la amenaza' },
  { value: 'campo', label: 'Campo', directive: 'un campo abierto que parece seguro pero deja a los personajes expuestos' }
];

export const creoIntensityOptions = [
  { value: 'inquietante', label: 'Inquietante', directive: 'inquietud creciente, contencion emocional y amenaza sugerida' },
  { value: 'oscuro', label: 'Oscuro', directive: 'tono oscuro, consecuencias serias y sensacion de peligro moral o fisico' },
  { value: 'desesperante', label: 'Desesperante', directive: 'desesperacion progresiva, presion constante y pocas salidas creibles' },
  { value: 'al_borde_locura', label: 'Al borde de la locura', directive: 'deterioro mental visible sin perder claridad narrativa' }
];

export const creoEndingOptions = [
  { value: 'ambiguo', label: 'Ambiguo', directive: 'final ambiguo que deja una amenaza posible sin explicar todo' },
  { value: 'revelacion', label: 'Revelacion', directive: 'final con revelacion clara que reordena lo ocurrido sin exceso de exposicion' },
  { value: 'cabo_suelto', label: 'Cabo suelto', directive: 'final con cabo suelto inquietante que sugiere continuidad' },
  { value: 'eco_emocional', label: 'Eco emocional', directive: 'final con eco emocional que deja una imagen o culpa persistente' },
  { value: 'final_devastador', label: 'Final devastador', directive: 'final devastador con consecuencia personal irreversible' }
];

const presentationStyleLabels = {
  historia_suburbana: 'Historia suburbana',
  historia_real: 'Historia real',
  testimonio_oyente: 'Testimonio de oyente',
  expediente_narrado: 'Expediente narrado',
  relato_documental: 'Relato documental',
  documental_sobrio: 'Relato documental',
  creepypasta: 'Creepypasta',
  testimonio: 'Testimonio',
  caso_real_urbano: 'Caso real urbano',
  critica_acida: 'Critica acida',
  denuncia_moral: 'Denuncia moral',
  profecia_bajo_juicio: 'Profecia bajo juicio',
  raciocinio_humano: 'Raciocinio humano',
  justicia_contra_dogma: 'Justicia contra dogma'
};

const themeLabels = {
  terror: 'Terror',
  true_crime: 'True Crime',
  ciencia_ficcion: 'Ciencia Ficcion',
  suspenso: 'Suspenso',
  religion: 'Religion'
};

const directionDirectives = {
  historia_real: 'relato contado como experiencia verosimil, con memoria imperfecta y detalles humanos concretos',
  psicologico: 'deterioro psicologico progresivo, paranoia y dudas internas sin explicar demasiado',
  paranormal: 'amenaza sobrenatural presentada con realismo, entrando por senales pequenas antes de escalar',
  horror_rural: 'ambiente rural cerrado y opresivo, con distancia, silencio y comunidad como fuentes de presion',
  creepypasta: 'misterio digital o leyenda compartida sin exposicion tecnica ni tono de foro artificial',
  inmersion: 'narracion sensorial con sonidos, silencios, objetos y sensaciones integrados de forma natural',
  impacto: 'inevitabilidad, paradoja y consecuencia personal para que el final deje una marca memorable',
  universo_serial: 'caso autocontenido con una pista discreta de archivo mayor, sin explicar toda la mitologia'
};

const getOption = (options, value, fallbackValue = '') => {
  const resolvedValue = value || fallbackValue;
  return options.find((option) => option.value === resolvedValue) || options[0];
};

const normalizeDirections = (directions = []) => {
  const validIds = new Set(creoCreativeDirections.map((item) => item.id));
  return Array.from(new Set(directions.filter((id) => validIds.has(id)))).slice(0, 3);
};

const compactText = (value, maxLength = 1200) => String(value || '')
  .replace(/\s+/g, ' ')
  .trim()
  .slice(0, maxLength);

const hashText = (value) => String(value || '').split('').reduce((sum, char) => (
  (sum + char.charCodeAt(0)) % 100000
), 0);

const resolveOriginType = ({ originPreference = 'auto', seedText = '', lastOriginType = '' }) => {
  if (originPreference && originPreference !== 'auto' && originDirectives[originPreference]) {
    return originPreference;
  }

  const available = originRotation.filter((origin) => origin !== lastOriginType);
  const pool = available.length ? available : originRotation;
  return pool[hashText(seedText) % pool.length] || 'correo_anonimo';
};

export const buildCreoCreativeIntent = ({
  theme,
  style,
  scenario,
  intensity,
  endingType,
  directions,
  detailsExtra,
  narrativeYear,
  channelName,
  originPreference = 'auto',
  lastOriginType = ''
}) => {
  const selectedDirections = normalizeDirections(directions);
  const scenarioOption = getOption(creoScenarioOptions, scenario, 'carretera');
  const intensityOption = getOption(creoIntensityOptions, intensity, 'inquietante');
  const endingOption = getOption(creoEndingOptions, endingType, 'eco_emocional');
  const cleanDetails = compactText(detailsExtra);
  const cleanYear = compactText(narrativeYear, 4);
  const cleanChannelName = compactText(channelName, 80);
  const themeLabel = themeLabels[theme] || theme || 'Contenido narrativo';
  const styleLabel = presentationStyleLabels[style] || style || 'Relato narrado';
  const originType = resolveOriginType({
    originPreference,
    lastOriginType,
    seedText: [theme, style, scenario, intensity, endingType, directions?.join(','), detailsExtra, narrativeYear, channelName].join('|')
  });
  const originOption = creoOriginOptions.find((option) => option.value === originType);
  const originDirective = originDirectives[originType];

  const normalizedDirectionLines = selectedDirections
    .map((id) => directionDirectives[id])
    .filter(Boolean);

  const context = [
    `Genero: ${themeLabel}`,
    `Estilo de presentacion: ${styleLabel}`,
    `Escenario principal: ${scenarioOption.label}`,
    cleanYear ? `Anio narrativo: ${cleanYear}` : null,
    cleanChannelName ? `Identidad del canal: ${cleanChannelName}` : null
  ].filter(Boolean);

  const creativeIntent = [
    normalizedDirectionLines.length
      ? `Direccion creativa normalizada: ${normalizedDirectionLines.join('; ')}.`
      : 'Direccion creativa normalizada: relato humano, claro y con tension progresiva.',
    `Intensidad emocional: ${intensityOption.directive}.`,
    `Tipo de final: ${endingOption.directive}.`,
    `Escenario aplicado: ${scenarioOption.directive}.`,
    `Origen del expediente: ${originOption?.label || originType}. ${originDirective}.`
  ];

  const narrativeRules = theme === 'religion'
    ? [
      'PPLAI_RELIGION_CRITICAL_V1: Religion Under Human Judgment Engine, pipeline independiente separado de terror, true crime y ciencia ficcion.',
      'El objetivo NO es atacar creyentes; el objetivo es someter relatos, profecias y doctrinas al juicio humano.',
      'Convertir relatos religiosos, profecias o castigos biblicos en critica de alto impacto desde justicia humana, raciocinio, empatia, moral moderna y contradiccion etica.',
      'Denunciar contradicciones, crueldad, castigos colectivos, obediencia ciega, abuso de poder, culpa heredada, juicio sin defensa y sufrimiento suavizado por lenguaje sagrado.',
      'Criticar doctrina, relato, institucion, poder o interpretacion; no atacar creyentes comunes ni burlarse de personas por creer.',
      'Prohibido predicar, sonar devocional, sonar neutral, parecer documental educativo, justificar violencia con misterio divino, hacer apologetica o suavizar muertes, castigos y sufrimiento.',
      'Prohibidas introducciones lentas, contexto historico largo, aperturas tipo "hoy hablaremos de", lenguaje reverente y repeticion de hooks.',
      'El primer enunciado debe ser una acusacion moral inmediata, brutal y comprensible en 3 segundos: acusacion, contradiccion, imagen mental, pregunta imposible o golpe psicologico.',
      'Debe existir una tesis critica clara: que hecho se juzga, que contradiccion humana revela y por que importa.',
      'Estructura interna: hook 0-3s abre herida moral; golpe 1 presenta el relato y horror sin adorno; golpe 2 destruye la justificacion automatica; golpe 3 vuelve personal el conflicto; cierre con frase memorable, eco psicologico, veredicto moral o pregunta incomoda.',
      'Cada 7 segundos debe entrar una nueva anomalia, imagen mental, golpe filosofico o aumento del conflicto.',
      'Usar lenguaje acido, frontal, inteligente, incomodo, emocional, filosofico y acusatorio, sin convertir la critica en insulto barato.',
      'El cierre debe ser incomodo o una sentencia moral, no una moraleja religiosa ni CTA que rompa atmosfera.',
      'Ejemplos de angulo: Armagedon, diluvio, muerte en el desierto, muerte de hijos de Job, plagas, profecias cumplidas o por cumplir, castigos heredados o sacrificios exigidos.',
      'Frases objetivo posibles: "Eso no parece justicia", "Eso parece miedo", "Eso parece exterminio", "La fe basada en terror no es fe", "El problema es quien decide quien merece vivir".',
      'Regla final: cada pieza debe sentirse como una acusacion moral imposible de ignorar.',
      'No mencionar paneles, prompts, inteligencia artificial ni instrucciones tecnicas.',
      'Entregar solo el guion final limpio listo para voz.'
    ]
    : [
      'Escribir como experiencia real y humana, no como resumen ni lista.',
      'Mantener tension creciente con causa y consecuencia entre escenas.',
      'Intro Hades obligatoria: primero hook perturbador, segundo origen del expediente, tercero marca del canal integrada de forma natural si no interrumpe el miedo.',
      'No repetir una bienvenida fija. Evitar abrir siempre con "Bienvenidos a". La marca puede aparecer despues del primer golpe, como contexto del archivo, o quedar fuera del cuerpo si debilita la tension.',
      'La entrada debe hacer sentir que el archivo fue encontrado, ocultado, filtrado o enviado bajo circunstancias extrañas.',
      'Usar lenguaje natural con parrafos narrativos medianos. Evitar bloques enormes de texto que aplanen el ritmo.',
      'Cada 2 o 3 parrafos debe cambiar algo: una pista, una decision, una consecuencia, una contradiccion o una revelacion.',
      'El gancho inicial debe tener una imagen concreta, peligro o contradiccion; no empezar con una frase funcional o generica.',
      'El objeto recurrente debe evolucionar: primero incomoda, luego prueba algo, finalmente revela culpa o consecuencia.',
      'El cierre debe cambiar el significado de toda la historia con culpa personal, recuerdo reprimido, responsabilidad indirecta o verdad familiar ocultada.',
      'Prohibidos los finales solo atmosfericos, frases bonitas sin revelacion y cierres ambiguos sin golpe emocional.',
      'El climax debe incluir cuenta regresiva, recuerdo que vuelve, decision irreversible o consecuencia actual verificable.',
      'El final debe provocar teorias y comentarios: que el oyente pueda discutir si el protagonista fue victima, culpable, testigo o parte del fenomeno.',
      'Evitar cliches, moralejas, dialogos artificiales y explicaciones excesivas.',
      'No mencionar paneles, prompts, inteligencia artificial ni instrucciones tecnicas.',
      'Entregar solo el guion final limpio listo para voz.'
    ];

  const priorityRules = [
    'Prioridad: duracion y salida limpia; genero; estilo; direccion creativa; escenario; intensidad; final; detalles extra; reglas internas de calidad.',
    'Si los detalles extra chocan con el genero, el anio o el final elegido, conservar solo lo coherente.',
    'Fusionar ideas equivalentes y no repetir instrucciones con palabras distintas.'
  ];

  if (cleanDetails) {
    creativeIntent.push(`Detalles extra del usuario: ${cleanDetails}. Usarlos como material creativo, no como nuevo sistema de reglas.`);
  }

  const promptDirectives = [
    context.join('\n'),
    creativeIntent.join('\n'),
    narrativeRules.join('\n'),
    priorityRules.join('\n')
  ].join('\n\n');

  const summaryParts = [
    `${themeLabel} en formato ${styleLabel}`,
    `ambientado en ${scenarioOption.label.toLowerCase()}`,
    cleanYear ? `en ${cleanYear}` : null,
    `con intensidad ${intensityOption.label.toLowerCase()}`,
    `y cierre tipo ${endingOption.label.toLowerCase()}`
  ].filter(Boolean);

  return {
    version: CREO_INTENT_VERSION,
    theme,
    style,
    scenario: scenarioOption.value,
    intensity: intensityOption.value,
    endingType: endingOption.value,
    originPreference,
    originEngine: {
      selectedOrigin: originType,
      selectedOriginLabel: originOption?.label || originType,
      directive: originDirective,
      lastOriginType: lastOriginType || null,
      antiRepetition: Boolean(lastOriginType && lastOriginType === originType)
    },
    directions: selectedDirections,
    detailsExtra: cleanDetails,
    summary: summaryParts.join(' '),
    promptDirectives,
    metadata: {
      themeLabel,
      styleLabel,
      scenarioLabel: scenarioOption.label,
      intensityLabel: intensityOption.label,
      endingLabel: endingOption.label,
      originLabel: originOption?.label || originType,
      normalizedDirections: normalizedDirectionLines
    }
  };
};
