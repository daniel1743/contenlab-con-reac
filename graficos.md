// === Infografías circulares SEO (A, B, C) — Implementación completa ===
// Stack: React + TypeScript + Tailwind + Framer Motion + SVG helpers

// =======================
// types.ts
// =======================
export type Period = {
  from: string;
  to: string;
  compareFrom?: string;
  compareTo?: string;
};

export type KPI = {
  id: string;
  label: string;
  value: number;
  prev?: number;
  unit?: "%" | "/100" | string;
  invert?: boolean;
};

export type TopicCluster = {
  name: string;
  traffic: number;
  conversionRate: number;
  contentScore: number;
};

export type PipelineStep = {
  step: 1|2|3|4|5|6|7|8;
  name: string;
  status: number;
  notes?: string;
};

export type SEOData = {
  site: string;
  period: Period;
  totals: {
    sessions: number;
    users: number;
    conversions: number;
    revenue: number;
    pagesIndexed: number;
    healthScore: number;
  };
  kpis: KPI[];
  topicClusters: TopicCluster[];
  pipeline: PipelineStep[];
};

// =======================
// utils.ts
// =======================
export const clamp = (v:number,min=0,max=100)=>Math.min(max,Math.max(min,v));
export const percentChange=(v:number,p?:number|null)=>(p==null||p===0)?null:((v-p)/p)*100;
export const scaleTo100=(v:number,min:number,max:number)=>clamp(((v-min)/(max-min))*100);

export function scaleSmart(k:KPI, hints?:{p95Backlinks?:number}){
  const v=k.value;
  switch(k.id){
    case"ctr":return clamp(v*5,0,100);
    case"avgPos":return clamp(100*(1-(v-1)/59),0,100);
    case"pagesSpeed":case"coreWebVitals":case"domainRating":return clamp(v,0,100);
    case"bounce":return clamp(v,0,100);
    case"backlinks":return scaleTo100(v,0,Math.max(1,hints?.p95Backlinks??500));
    default:if(k.unit==="%"||k.unit==="/100")return clamp(v,0,100);
    return scaleTo100(v,0,Math.max(1,hints?.p95Backlinks??1000));
  }
}
export function invertIfNeeded(p:number,invert?:boolean){return invert?100-p:p;}
export const nf=new Intl.NumberFormat('es-CL');
export const pf1=new Intl.NumberFormat('es-CL',{maximumFractionDigits:1,minimumFractionDigits:1});
export const pf0=new Intl.NumberFormat('es-CL',{maximumFractionDigits:0});

// =======================
// adapt.ts
// =======================
import {SEOData,KPI,TopicCluster,PipelineStep} from './types';
import {clamp,percentChange,scaleSmart,invertIfNeeded} from './utils';

export type AdaptedCluster = TopicCluster & {share:number;angleStart:number;angleEnd:number};
export type AdaptedKPI = KPI & {percent:number;change:number|null};

export function adapt(data:SEOData,hints?:{p95Backlinks?:number}){
  const totalTraffic=data.topicClusters.reduce((s,c)=>s+c.traffic,0);
  const clusters:AdaptedCluster[]=data.topicClusters.map((c,i,arr)=>{
    const share=(c.traffic/totalTraffic)*100;
    const start=arr.slice(0,i).reduce((s,x)=>s+(x.traffic/totalTraffic)*2*Math.PI,0);
    const end=arr.slice(0,i+1).reduce((s,x)=>s+(x.traffic/totalTraffic)*2*Math.PI,0);
    return{...c,share,angleStart:start,angleEnd:end};
  });
  const kpis:AdaptedKPI[]=data.kpis.map(k=>{
    const base=(k.unit==="/100"||k.unit==="%")?clamp(k.value):scaleSmart(k,hints);
    const percent=clamp(invertIfNeeded(base,k.invert));
    const change=percentChange(k.value,k.prev??null);
    return{...k,percent,change};
  });
  return{site:data.site,period:data.period,health:clamp(data.totals.healthScore),clusters,kpis,pipeline:data.pipeline,totals:data.totals};
}

// =======================
// DonutA.tsx
// =======================
import {motion} from 'framer-motion';
import {AdaptedCluster,AdaptedKPI,pf1} from './utils';

type Props={site:string;period:{from:string;to:string};clusters:AdaptedCluster[];kpis:AdaptedKPI[];health:number;radius?:number};
export default function DonutA({site,period,clusters,kpis,health,radius=120}:Props){
  const vb=radius*2+80;const cx=vb/2,cy=vb/2;const r0=radius*0.45,r1=radius*0.95;const ro0=r1+10,ro1=r1+22;
  const arc=(R0:number,R1:number,a0:number,a1:number)=>{const large=(a1-a0)>Math.PI?1:0;const x0=cx+R1*Math.cos(a0),y0=cy+R1*Math.sin(a0);const x1=cx+R1*Math.cos(a1),y1=cy+R1*Math.sin(a1);const x2=cx+R0*Math.cos(a1),y2=cy+R0*Math.sin(a1);const x3=cx+R0*Math.cos(a0),y3=cy+R0*Math.sin(a0);return`M ${x0} ${y0} A ${R1} ${R1} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${R0} ${R0} 0 ${large} 0 ${x3} ${y3} Z`;};
  const N=kpis.length;const sector=(2*Math.PI)/N;
  return(<figure role="img" aria-label={`SEO de ${site} entre ${period.from} y ${period.to}. Salud ${pf1.format(health)}%.`} className="w-full">
    <svg viewBox={`0 0 ${vb} ${vb}`} className="w-full h-auto">
      {clusters.map((c,i)=>(<motion.path key={i} d={arc(r0,r1,c.angleStart,c.angleEnd)} initial={{pathLength:0}} animate={{pathLength:1}} transition={{duration:0.6,delay:i*0.03}} className={`fill-[hsl(${i*45},70%,55%)] stroke-white/5`} />))}
      {kpis.map((k,i)=>{const a0=-Math.PI/2+i*sector;const a1=a0+sector;const prog=a0+(a1-a0)*(k.percent/100);return(<g key={k.id}><path d={arc(ro0,ro1,a0,a1)} className="fill-white/8"/><motion.path d={arc(ro0,ro1,a0,prog)} className="fill-current text-white" initial={{opacity:0}} animate={{opacity:1}}/><LabelPolar cx={cx} cy={cy} r={ro1+16} angle={(a0+a1)/2} title={k.label} value={`${pf1.format(k.value)}${k.unit??''}`} change={k.change}/></g>);})}
      <text x={cx} y={cy-6} textAnchor="middle" className="fill-white text-sm font-medium">{site}</text>
      <text x={cx} y={cy+12} textAnchor="middle" className="fill-white/80 text-xs">{period.from} → {period.to}</text>
    </svg>
    <figcaption className="mt-3 text-center"><span className="text-3xl font-black text-slate-200">{pf1.format(health)}%</span><span className="ml-2 align-middle text-sm text-slate-300">Health Score</span></figcaption>
  </figure>);
}

function LabelPolar({cx,cy,r,angle,title,value,change}:{cx:number;cy:number;r:number;angle:number;title:string;value:string;change:number|null;}){
  const x=cx+r*Math.cos(angle),y=cy+r*Math.sin(angle);const dir=Math.cos(angle)>=0?1:-1;const tx=x+8*dir;const anchor=dir>0?'start':'end';const arrow=change==null?'':change>0?'↑':'↓';const delta=change==null?'':` ${change>0?'+':''}${pf1.format(change)}%`;return(<g aria-label={`${title} ${value}${delta}`}><line x1={cx} y1={cy} x2={x} y2={y} className="stroke-white/25"/><text x={tx} y={y} textAnchor={anchor} className="fill-white text-[10px]"><tspan className="font-semibold">{title}</tspan><tspan> · {value}</tspan>{change!=null&&<tspan> · {arrow}{delta}</tspan>}</text></g>);
}

// =======================
// WheelB.tsx
// =======================
import {motion} from 'framer-motion';
import {PipelineStep} from './types';
import {pf1} from './utils';

type Props={title?:string;steps:PipelineStep[]};
export default function WheelB({title="8 Steps – Programmatic SEO",steps}:Props){
  const n=8;if(steps.length!==n)throw new Error('Se requieren 8 pasos');const size=420;const r=140;const cx=size/2,cy=size/2;const sector=(2*Math.PI)/n;
  const arc=(R:number,a0:number,a1:number)=>{const large=(a1-a0)>Math.PI?1:0;const x0=cx+R*Math.cos(a0),y0=cy+R*Math.sin(a0);const x1=cx+R*Math.cos(a1),y1=cy+R*Math.sin(a1);return`M ${cx} ${cy} L ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} Z`;};
  return(<div className="grid md:grid-cols-[460px_1fr] gap-6 items-center"><svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto">{steps.map((s,i)=>{const a0=-Math.PI/2+i*sector;const a1=a0+sector;const pct=s.status*100;const mid=(a0+a1)/2;const labelR=r+20;return(<g key={s.step}><path d={arc(r,a0,a1)} className={`fill-[hsl(${i*45},70%,55%)] opacity-90`}/><circle cx={cx} cy={cy} r={r-10} className="fill-transparent stroke-white/10"/><path d={describeArc(cx,cy,r-16,a0,a0+(a1-a0)*(pct/100))} className="stroke-white" strokeWidth={6} fill="none"/><text x={cx+labelR*Math.cos(mid)} y={cy+labelR*Math.sin(mid)} textAnchor="middle" className="fill-white text-sm font-bold">{String(s.step).padStart(2,'0')}</text></g>);})}<circle cx={cx} cy={cy} r={60} className="fill-black/40 backdrop-blur"/><text x={cx} y={cy-6} textAnchor="middle" className="fill-white text-sm font-semibold">{title}</text><text x={cx} y={cy+12} textAnchor="middle" className="fill-white/80 text-xs">de Research a Iteración</text></svg><ol className="space-y-2">{steps.map((s)=>(<li key={s.step} className="rounded-2xl p-3 bg-white/5 border border-white/10"><div className="flex items-center justify-between"><div className="text-slate-200 font-semibold">{s.step}. {s.name}</div><div className="text-slate-300 text-sm">{pf1.format(s.status*100)}%</div></div>{s.notes&&<p className="text-slate-400 text-sm mt-1">{s.notes}</p>}</li>))}</ol></div>);
}

function polarToCartesian(cx:number,cy:number,r:number,a:number){return{x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)}}
function describeArc(cx:number,cy:number,r:number,a0:number,a1:number){const p0=polarToCartesian(cx,cy,r,a0);const p1=polarToCartesian(cx,cy,r,a1);const large=(a1-a0)>Math.PI?1:0;return`M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`;}

// =======================
// PuzzleC.tsx
// =======================

type Item={label:string;value:number};
type Props={mode:'distribution'|'parity';items:Item[];centerTitle?:string};
export default function PuzzleC({mode,items,centerTitle="Pilares"}:Props){const n=items.length;const size=420;const cx=size/2,cy=size/2;const r=140;const total=items.reduce((s,i)=>s+i.value,0);let cursor=-Math.PI/2;const sectors=items.map((it,i)=>{const span=mode==='distribution'?(it.value/total)*2*Math.PI:(2*Math.PI)/n;const a0=cursor;const a1=cursor+span;cursor=a1;return{it,a0,a1};});return(<svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto">{sectors.map(({it,a0,a1},i)=>(<g key={i}><path d={sectorPath(cx,cy,r,a0,a1)} className={`fill-[hsl(${i*45},70%,55%)] stroke-white`} strokeWidth={3}/><text {...labelPolar(cx,cy,r+24,(a0+a1)/2)} className="fill-white font-bold text-sm">{String(i+1).padStart(2,'0')}</text></g>))}<circle cx={cx} cy={cy} r={56} className="fill-black/40"/><text x={cx} y={cy+4} textAnchor="middle" className="fill-white text-sm font-semibold">{centerTitle}</text></svg>);}
function sectorPath(cx:number,cy:number,r:number,a0:number,a1:number){const large=(a1-a0)>Math.PI?1:0;const x0=cx+r*Math.cos(a0),y0=cy+r*Math.sin(a0);const x1=cx+r*Math.cos(a1),y1=cy+r*Math.sin(a1);return`M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;}
function labelPolar(cx:number,cy:number,r:number,ang:number){return{x:cx+r*Math.cos(ang),y:cy+r*Math.sin(ang),textAnchor:Math.cos(ang)>=0?'start':'end'} as const;}

// =======================
// DashboardSEO.tsx
// =======================
import DonutA from './DonutA';
import WheelB from './WheelB';
import PuzzleC from './PuzzleC';
import {adapt} from './adapt';
import {SEOData} from './types';

export default function DashboardSEO({raw}:{raw:SEOData}){const data=adapt(raw,{p95Backlinks:300});return(<section className="grid xl:grid-cols-3 gap-6"><div><DonutA site={data.site} period={data.period} clusters={data.clusters} kpis={data.kpis} health={data.health}/></div><div><WheelB steps={data.pipeline}/></div><div><PuzzleC mode='distribution' items={data.clusters.map(c=>({label:c.name,value:c.traffic}))} centerTitle="Pilares"/></div><details className="col-span-full bg-white/5 border border-white/10 rounded-xl p-4"><summary className="cursor-pointer text-slate-200">Ver como tabla</summary><pre className="text-xs text-slate-300 overflow-auto mt-3">{JSON.stringify(raw,null,2)}</pre></details></section>);}


fabricar tres infografías circulares que tu IA pueda generar en automático con datos SEO traídos por tu API (DeepSeek u otra). Nada al aire.


---

0) Base de datos que la IA debe traer

Estandariza un solo payload y desde ahí transformas a cualquiera de los 3 diseños.

Esquema JSON (entrada)

{
  "site": "creovision.io",
  "period": { "from": "2025-09-01", "to": "2025-09-30", "compareFrom": "2025-08-01", "compareTo": "2025-08-31" },
  "totals": {
    "sessions": 42310,
    "users": 35210,
    "conversions": 1210,
    "revenue": 17450.25,
    "pagesIndexed": 412,
    "healthScore": 80.6
  },
  "kpis": [
    { "id": "traffic",        "label": "Tráfico orgánico",  "value": 27650, "prev": 25110 },
    { "id": "ctr",            "label": "CTR",               "value": 4.8,   "prev": 4.2, "unit": "%" },
    { "id": "avgPos",         "label": "Posición media",    "value": 14.2,  "prev": 16.8, "invert": true },
    { "id": "pagesSpeed",     "label": "PageSpeed",         "value": 86,    "prev": 78, "unit": "/100" },
    { "id": "coreWebVitals",  "label": "CWV OK",            "value": 68,    "prev": 61, "unit": "%" },
    { "id": "backlinks",      "label": "Backlinks nuevos",  "value": 132,   "prev": 97 },
    { "id": "domainRating",   "label": "Autoridad (DR)",    "value": 44,    "prev": 41, "unit": "/100" },
    { "id": "bounce",         "label": "Rebote",            "value": 38,    "prev": 41, "unit": "%", "invert": true }
  ],
  "topicClusters": [
    { "name": "IA para Pymes",            "traffic": 9800,  "conversionRate": 3.2, "contentScore": 72 },
    { "name": "Automatización SEO",       "traffic": 6400,  "conversionRate": 2.6, "contentScore": 66 },
    { "name": "Diseño Web + Core Web V.", "traffic": 5200,  "conversionRate": 4.1, "contentScore": 79 },
    { "name": "Marketing local",          "traffic": 4270,  "conversionRate": 2.1, "contentScore": 58 },
    { "name": "E-commerce",               "traffic": 3990,  "conversionRate": 1.8, "contentScore": 55 },
    { "name": "Analítica",                "traffic": 3200,  "conversionRate": 3.6, "contentScore": 70 },
    { "name": "Contenido largo",          "traffic": 2800,  "conversionRate": 2.9, "contentScore": 63 },
    { "name": "Branding",                 "traffic": 2100,  "conversionRate": 1.2, "contentScore": 51 }
  ],
  "pipeline": [
    { "step": 1, "name": "Research",         "status": 0.9, "notes": "KWs priorizadas" },
    { "step": 2, "name": "Clusterización",   "status": 0.7, "notes": "8 clusters listos" },
    { "step": 3, "name": "Auditoría técnica","status": 0.6, "notes": "CWV en progreso" },
    { "step": 4, "name": "Contenido",        "status": 0.5, "notes": "5 artículos en cola" },
    { "step": 5, "name": "On-page",          "status": 0.4, "notes": "Meta + Schema" },
    { "step": 6, "name": "Off-page",         "status": 0.3, "notes": "Prospección" },
    { "step": 7, "name": "Monitoreo",        "status": 0.8, "notes": "Dashboards OK" },
    { "step": 8, "name": "Iteración",        "status": 0.2, "notes": "Backlog priorizado" }
  ]
}

> Reglas:
* invert: true significa que menos es mejor (ej. rebote, posición).
* status está entre 0 y 1.
* healthScore es tu KPI “grande” (puede ser promedio ponderado de CWV, velocidad, errores 4xx/5xx, etc.).




---

1) Infografía A — Donut multi-anillo con KPI gigante y anotaciones

Lo que se ve (estructura):

Núcleo: título (sitio + periodo).

Anillo interno (segmentos gruesos): reparto de clusters temáticos por participación de tráfico.

Anillo externo (delgado): mini-arcos tipo “gauge” para 6–8 KPIs.

Etiquetas flotantes conectadas con líneas finas (valores + cambio vs periodo previo).

KPI gigante fuera o abajo (ej. 80.6% de Health Score).


Datos que alimenta:

topicClusters[].traffic → para el anillo interno (normaliza a 100%).

kpis[] → para mini-arcos del anillo externo (mapea a 0–100 con invert).

totals.healthScore → para el número grande.

period → subtítulos.


Cálculos clave:

share = traffic / Σtraffic

kpiPercent = invert ? (100 - normalize(value)) : normalize(value)

> normalize(value) si ya viene 0–100, úsalo directo; si no, define escalas:



CTR: clamp(value,0,20) → value*5

Posición media: clamp(value,1,60) → 100*(1 - (value-1)/59)

Backlinks: min-max móvil por sitio (p95 como techo)

Rebote: 100 - value


Δ = value - prev para flechas ↑/↓.


Cómo construirla (paso a paso):

1. Preparar datos con el esquema anterior y funciones de normalización.


2. Calcular ángulos del anillo interno:

angle_i = share_i * 2π, acumulando para inicio/fin.



3. Dibujar donut interno (D3, Recharts o ECharts): radio interno r0, externo r1.


4. Dibujar anillo externo por KPI: divide la circunferencia en N sectores iguales; cada sector muestra un arco de progreso según kpiPercent.


5. Etiquetas: coloca las de KPIs por fuera del círculo con líneas polares; aplica evitación de colisiones (simple: ordenar por ángulo y espaciar en Y).


6. KPI gigante: tipografía muy grande (contraste 4.5:1 mínimo).


7. Accesibilidad: role="img", aria-label con resumen y tabla alternativa oculta con los valores.


8. Responsivo: usa viewBox en SVG; en móvil oculta descripciones largas, deja valores y barras.


9. Animación (opcional): entrada de arcos con spring (Framer Motion), 400–800 ms.



Uso típico: “¿Qué cluster manda el tráfico?” + “¿Cómo van mis KPIs críticos?” en un solo vistazo.


---

2) Infografía B — Rueda de 8 pasos con tarjetas radiales

Lo que se ve:

Círculo central con título (p. ej., “8 Steps – Programmatic SEO”).

Corona circular dividida en 8 pétalos/paneles numerados 01–08 con colores gradientes.

Tarjetas siguiendo el contorno, cada una con: nombre del paso, micro KPI, nota corta.


Datos que alimenta:

pipeline[] (los 8 pasos).

Para cada paso, puedes mostrar:

status como barra/medidor (0–100%).

KPI derivado del dataset principal (ej. en “Contenido”: artículos publicados este mes / planificados).



Mapeo sugerido de pasos:

1. Research (KWs, intención) → KPI: #KW priorizadas


2. Clusterización → KPI: clusters activos


3. Auditoría técnica → KPI: CWV OK %


4. Contenido → KPI: posts/mes


5. On-page → KPI: páginas con schema


6. Off-page → KPI: dominios ref.


7. Monitoreo → KPI: alertas críticas


8. Iteración → KPI: experimentos A/B activos



Cómo construirla:

1. Divide 360° en 8 sectores iguales; para cada sector, crea un pétalo (arco + rectángulo curvo).


2. Iconos por paso opcionales (SVG mono).


3. Medidor: un mini-arco o barra dentro de cada pétalo, valor = status*100.


4. Tarjetas: bloques alrededor (layout circular). En desktop, muestra las 8; en móvil, conviértelas en acordeón (lista 1→8).


5. Interacción: hover/tap resalta el pétalo y muestra notes.


6. Accesibilidad: orden de tabulación secuencial 1→8; aria-describedby para notas.


7. Exportable: permite descargar PNG/SVG del estado actual.



Uso típico: roadmap operativo — deja claro dónde estás y qué sigue.


---

3) Infografía C — Pastel rompecabezas (8 piezas) con callouts numerados

Lo que se ve:

Un círculo partido en 8 piezas tipo puzzle (bordes encajados).

Números 1–8 alrededor con líneas conectadas y texto corto.

Centro con logotipo o título.


Datos que alimenta:

Puedes reutilizar topicClusters o definir 8 métricas fijas.

Cada pieza tiene un valor (p. ej., peso del cluster, o importancia del pilar).


Dos modos de uso:

Distribución: tamaño de la pieza = valor (como pie chart).

Paridad: todas iguales, el color/intensidad indica el valor (heatmap radial).


Cómo construirla:

1. Genera 8 sectores de 45°.


2. Dibuja bordes “encaje” con pequeñas curvas (SVG path). Si no quieres custom path, simula con separadores blancos gruesos y una textura para el efecto puzzle.


3. Modo distribución: angle_i = value_i/Σ * 360°.


4. Leyendas: colocar números grandes en el perímetro y los textos a la derecha/izquierda con líneas.


5. En móvil, los callouts pasan a lista numerada debajo del gráfico.


6. Color: paleta cíclica suave (8 tonos); cuida contraste para texto blanco/negro.



Uso típico: explicar 8 factores de una estrategia y el peso de cada uno.


---

4) Transformaciones desde el JSON (funciones que tu IA debe aplicar)

percentChange(v, p) = p === 0 ? null : ((v - p) / p) * 100

scaleTo100(value, min, max) = clamp((value - min) / (max - min) * 100, 0, 100)

invertIfNeeded(p, invert) = invert ? 100 - p : p


Ejemplos:

Posición media 14.2 → scaleTo100(14.2, 1, 60) = 77.9 → invert = 22.1

CTR 4.8% → si tope 20% → 4.8 * 5 = 24



---

5) Validaciones para que el generador no se rompa

kpis.length entre 6 y 10.

topicClusters.length >= 4 (mejor 8).

Suma de traffic > 0.

status ∈ [0,1] en los 8 pasos.

Si falta prev, omite flechas de cambio.

Redondeo visual: muestra 1 decimal para % y 0 decimales para contadores grandes (con separador de miles).



---

6) UI/UX (práctico y sin drama)

Contraste AA mínimo 4.5:1.

Tooltips livianos con cifras exactas y fecha.

Table view accesible debajo (toggle “Ver como tabla”).

Responsive: 3 columnas (A, B, C) en desktop; en tablet, A | (B, C); en móvil, stack vertical A → B → C.

Animaciones: 300–600 ms, sin marear.

Exportar: botón “Descargar” → PNG y SVG.

Dark mode: fondos #151B2B ó #1E1E2E, textos en --fg.

i18n: números con Intl.NumberFormat('es-CL').



---

7) Prompts que tu IA (DeepSeek) debe usar para fabricar los datos

> Sistema:
“Eres un motor de analítica SEO. Devuelve solo JSON válido siguiendo el esquema. Llena kpis, topicClusters (8 ítems) y pipeline (1–8) con valores realistas para el dominio y periodo.”



> Usuario:
“Dominio: {{site}}. Periodo: {{from}} → {{to}} y comparar con {{compareFrom}} → {{compareTo}}.
Si una métrica es ‘menos es mejor’, marca invert:true.
Asegúrate de que topicClusters sumen tráfico > 0 y pipeline tenga 8 pasos con status entre 0 y 1.
Responde solo con JSON.”



(Ya con eso, tu backend pega, valida y pasa al front.)


---

8) Implementación (stack sugerido en tu proyecto)

Front: React + SVG (D3 shape helpers o Recharts) + Tailwind + Framer Motion.
Arquitectura: un componente por infografía y un adaptador de datos común.

Adaptador (pseudocódigo)

type KPI = { id:string; label:string; value:number; prev?:number; unit?:string; invert?:boolean };
export function adapt(data){
  const totalTraffic = data.topicClusters.reduce((s,c)=>s+c.traffic,0);
  const clusters = data.topicClusters.map((c, i, arr)=>({
    ...c,
    share: totalTraffic ? (c.traffic / totalTraffic) * 100 : 0,
    angleStart: arr.slice(0,i).reduce((s,x)=>s + (x.traffic/totalTraffic)*2*Math.PI,0),
    angleEnd:   arr.slice(0,i+1).reduce((s,x)=>s + (x.traffic/totalTraffic)*2*Math.PI,0)
  }));
  const kpis = data.kpis.map(k=>{
    let p = (k.unit==="/100" || k.unit==="%") ? k.value : scaleSmart(k);
    if(k.invert) p = 100 - p;
    const change = (k.prev!=null) ? percentChange(k.value,k.prev) : null;
    return {...k, percent: clamp(p,0,100), change};
  });
  return {site:data.site, period:data.period, health:data.totals.healthScore, clusters, kpis, pipeline:data.pipeline};
}

Props por componente

DonutA: { clusters, kpis, health, period, site }

WheelB: { pipeline }

PuzzleC: { items: clusters | kpis | custom }



---

9) Texto guía que puedes mostrar en tu página (breve y claro)

Donut KPI: “Participación de tráfico por tema y salud técnica en tiempo real. El número central resume la condición del sitio; los anillos muestran progreso de KPIs críticos.”

Rueda 8 pasos: “Flujo de trabajo SEO programático. Cada pétalo marca el avance por etapa, de investigación a iteración.”

Puzzle 8: “Los ocho pilares de rendimiento. Cada pieza detalla un factor y su impacto relativo.”



---

10) Errores comunes que te ahorras

Mezclar métricas incomparablemente (ej. backlinks absolutos vs tasas) sin escalar.

Colores chillones en fondos oscuros sin contraste.

Poner 12 KPIs en el anillo externo (máximo 8–10).

Etiquetas que se pisan → usa separadores y límites de caracteres.

