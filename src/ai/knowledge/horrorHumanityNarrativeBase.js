export const HUMANITY_EDITORIAL_ENGINE_PROMPT = `
MOTOR EDITORIAL DE HUMANIDAD NARRATIVA

Principio:
- El terror debe entrar por una rutina humana normal antes de volverse paranormal.
- La emocion se muestra por cuerpo, accion, silencio, error, cansancio o decision cobarde.
- Cada golpe raro debe dejar una consecuencia fisica, domestica o relacional.

Formula interna:
accion cotidiana -> interrupcion inquietante -> reaccion fisica -> respuesta humana imperfecta -> consecuencia en rutina o vinculo.

Categorias a activar:
- Asco cotidiano: olor, nausea, lavarse aunque ya este limpio, ropa/piel impregnada. Usalo ligado a comer, cocinar, lavarse, limpiar o cuidar a un hijo; evita gore.
- Miedo contenido: no gritar, quedarse inmovil, fingir normalidad frente a hijos, revisar una puerta ya cerrada, hablar bajo sin razon.
- Abandono emocional: llamar y no recibir respuesta, contar algo grave y recibir frialdad, dormir acompanado pero sentirse solo.
- Agotamiento: dormirse vestido, comer de pie, no lavar platos, responder tarde, normalizar lo imposible porque no hay energia.
- Culpa: evitar mirar a un hijo, limpiar una mancha sin parar, insistir en que todo esta bien cuando ya nadie lo cree.
- Desconexion: comer juntos en silencio, no consolar, responder sin mirar, dejar una conversacion morir antes de empezar.

Evolucion de vinculos:
- Pareja: normalidad fragil -> distancia funcional -> abandono domestico -> extraneza -> ruptura silenciosa.
- Padres e hijos: proteccion inicial -> desgaste -> culpa parental -> el nino deja de pedir ayuda o mira al adulto con desconfianza.

Dialogo:
- Corto, cansado, evasivo, incompleto y con subtexto.
- Una frase fria como "que quieres que haga" puede ser mas fuerte que una explicacion del fenomeno.
- Evita dialogos que expliquen la trama o nombren emociones en abstracto.

Revision final:
- Debe haber rutinas interrumpidas, reacciones fisicas, respuestas imperfectas, deterioro relacional y secuelas posteriores.
- La historia debe seguir inquietando aunque no se explique monstruo, entidad ni origen.
`;

export const DOMESTIC_AFTERMATH_ENGINE_PROMPT = `
MOTOR DE SECUELA DOMESTICA

Principio:
- El horror no termina cuando aparece la anomalia. Debe dejar una marca en la casa, el cuerpo, una rutina o un vinculo.
- Una escena fuerte debe cambiar algo que la persona hacia todos los dias: dormir, cocinar, lavar, mirar una foto, abrir una puerta, usar una radio, contestar el telefono.
- La secuela debe ser pequena pero persistente. Mejor "dejamos de usar ese bano" que explicar una maldicion completa.

Obligatorio:
- Despues de un golpe importante, muestra que alguien evita, cambia, rompe o repite una rutina.
- La consecuencia debe ser verificable: objeto movido, olor que vuelve, cuarto que nadie usa, llamada que ya no contestan, cama vacia, plato servido para alguien que no esta.
- Si hay familia o pareja, el fenomeno debe dejar una distancia visible: no mirar, no responder, dormir aparte, empacar, mentir o dejar solo al protagonista.

Revision final:
- Pregunta si el relato podria seguir igual al dia siguiente. Si la respuesta es si, falta secuela domestica.
`;

export const PERSONAL_PAYOFF_ENGINE_PROMPT = `
MOTOR DE PAYOFF PERSONAL IRREVERSIBLE

Principio:
- El objeto, sonido, archivo o lugar central no debe limitarse a asustar. Debe probar algo intimo sobre el protagonista.
- El climax debe revelar que la amenaza toca culpa, memoria, identidad, familia, deuda, abandono, mentira o una decision cobarde.
- El protagonista debe quedar implicado o marcado: no solo vio el horror, ahora sabe que el horror tambien hablaba de el.

Obligatorio:
- El simbolo central debe funcionar como evidencia: grabacion, foto, recibo, llave, carta, numero, voz, mancha, fecha, firma o nombre.
- La revelacion debe tener costo humano: perder una version de si mismo, una relacion, una coartada, un recuerdo o una verdad familiar.
- Evita finales que solo advierten "no abras/no escuches/no mires". La advertencia debe venir con prueba personal.

Revision final:
- El final debe poder resumirse asi: "lo que me perseguia demostro que yo/familia/memoria/culpa ya estaba dentro del caso".
`;

export const HUMANITY_EDITORIAL_SIGNALS = {
  everydayActions: [
    'cepillar', 'lavar', 'grifo', 'lavamanos', 'bano', 'ducha', 'cocina',
    'platos', 'fregadero', 'cafe', 'sopa', 'comer', 'cenar', 'desayuno',
    'dormir', 'cama', 'colchon', 'sabana', 'manta', 'ropa', 'zapatos',
    'llave', 'puerta', 'ventana', 'pasillo', 'escalera', 'chimenea',
    'radio', 'telefono', 'mesa', 'heladera', 'refrigerador', 'termostato',
    'fusible', 'lavadora', 'garaje', 'auto', 'juguete'
  ],
  anomalySignals: [
    'agua negra', 'olor', 'fetido', 'podrido', 'frio', 'helado', 'voz',
    'estatica', 'sangre', 'mancha', 'respiracion', 'pasos', 'golpe',
    'silueta', 'figura', 'ojos', 'no respondio', 'no vino', 'se encendio',
    'se apago', 'se abrio', 'cambio de lugar', 'escarcha', 'marca'
  ],
  physicalReactions: [
    'vomit', 'arcada', 'nausea', 'apoye', 'apoyarme', 'agarre',
    'agarrarme', 'grite', 'tembl', 'saliva', 'garganta', 'estomago',
    'piel', 'mano', 'manos', 'palma', 'labios', 'respirar', 'respiracion',
    'rodillas', 'dientes', 'olor me', 'me quede quiet', 'no pude mover'
  ],
  relationalSignals: [
    'marido', 'esposa', 'esposo', 'pareja', 'hija', 'hijo', 'nino',
    'nina', 'madre', 'padre', 'hermano', 'familia', 'no vino',
    'no respondio', 'ni siquiera me miro', 'que quieres que haga',
    'me dejo sola', 'solo', 'sola', 'vacio', 'abandono', 'distancia',
    'no me creyo', 'no hablaba', 'no reconoc'
  ],
  behavioralEmotionSignals: [
    'segui mirando', 'no pude dormir', 'deje de', 'volvi a cerrar',
    'llame', 'no conteste', 'me quede', 'baje igual', 'subi corriendo',
    'cerre la puerta', 'apague la luz', 'me tape', 'revise', 'escuche',
    'no dije nada', 'no quise mirar', 'guarde', 'escondi', 'trate de',
    'antes de mirar', 'tape', 'arrancar', 'fingi', 'sonrei'
  ],
  imperfectResponses: [
    'que quieres que haga', 'no vino', 'no respondio', 'no dije nada',
    'no quise mirar', 'segui', 'fingi', 'me calle', 'no pregunte',
    'dejo de llamar', 'no desperte', 'lo deje ahi', 'cerre la puerta',
    'apague la luz', 'subi sin decir'
  ],
  consequenceSignals: [
    'no pude dormir', 'deje de', 'desde entonces', 'al dia siguiente',
    'esa noche', 'todavia', 'quedo', 'nunca volvi', 'empece a',
    'evite', 'dejamos de', 'ya no', 'volvio a', 'cada noche'
  ],
  domesticAftermathSignals: [
    'dejamos de usar', 'deje de usar', 'nunca volvi', 'ya no abri',
    'ya no dormi', 'dormimos separados', 'empaco', 'se fue',
    'no volvio a mirar', 'nadie usa', 'quedo cerrado', 'sigue oliendo',
    'todavia suena', 'cada noche', 'desde entonces', 'evite pasar',
    'no contestamos', 'plato servido', 'cama vacia'
  ],
  personalPayoffSignals: [
    'mi firma', 'mi letra', 'mi nombre', 'mi voz', 'mi respiracion',
    'era yo', 'yo estaba', 'lo que hice', 'mentia', 'menti',
    'culpa', 'deuda', 'abandono', 'no recordaba', 'olvide',
    'mi madre', 'mi padre', 'mi hijo', 'mi hija', 'familia',
    'a mi nombre', 'fechado', 'grabado', 'escrito', 'reconoci'
  ]
};

export default {
  HUMANITY_EDITORIAL_ENGINE_PROMPT,
  DOMESTIC_AFTERMATH_ENGINE_PROMPT,
  PERSONAL_PAYOFF_ENGINE_PROMPT,
  HUMANITY_EDITORIAL_SIGNALS
};
