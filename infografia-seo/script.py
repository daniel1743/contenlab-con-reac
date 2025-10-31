
# Primero, voy a crear el adaptador de datos y las funciones de transformación
import json
import math

# Funciones de utilidad
def clamp(value, min_val, max_val):
    return max(min_val, min(max_val, value))

def percent_change(current, previous):
    if previous == 0:
        return None
    return ((current - previous) / previous) * 100

def scale_to_100(value, min_val, max_val):
    if max_val == min_val:
        return 50
    return clamp((value - min_val) / (max_val - min_val) * 100, 0, 100)

def scale_smart(kpi):
    """Escala inteligente según el tipo de métrica"""
    kid = kpi['id']
    value = kpi['value']
    
    if kid == 'ctr':
        # CTR: máximo razonable 20%
        return min(value * 5, 100)
    elif kid == 'avgPos':
        # Posición: 1-60, menos es mejor
        return 100 * (1 - clamp((value - 1) / 59, 0, 1))
    elif kid == 'pagesSpeed' or kid == 'domainRating':
        # Ya está en escala 0-100
        return value
    elif kid == 'coreWebVitals' or kid == 'bounce':
        # Porcentajes directos
        return value
    elif kid == 'backlinks':
        # Normalizar con min-max adaptativo
        return clamp(value / 200 * 100, 0, 100)
    elif kid == 'traffic':
        # Normalizar tráfico (escala móvil)
        return clamp(value / 50000 * 100, 0, 100)
    else:
        return clamp(value, 0, 100)

# Datos de ejemplo que simula lo que devolvería la API
sample_data = {
    "site": "creovision.io",
    "period": {
        "from": "2025-09-01",
        "to": "2025-09-30",
        "compareFrom": "2025-08-01",
        "compareTo": "2025-08-31"
    },
    "totals": {
        "sessions": 42310,
        "users": 35210,
        "conversions": 1210,
        "revenue": 17450.25,
        "pagesIndexed": 412,
        "healthScore": 80.6
    },
    "kpis": [
        {"id": "traffic", "label": "Tráfico orgánico", "value": 27650, "prev": 25110},
        {"id": "ctr", "label": "CTR", "value": 4.8, "prev": 4.2, "unit": "%"},
        {"id": "avgPos", "label": "Posición media", "value": 14.2, "prev": 16.8, "invert": True},
        {"id": "pagesSpeed", "label": "PageSpeed", "value": 86, "prev": 78, "unit": "/100"},
        {"id": "coreWebVitals", "label": "CWV OK", "value": 68, "prev": 61, "unit": "%"},
        {"id": "backlinks", "label": "Backlinks nuevos", "value": 132, "prev": 97},
        {"id": "domainRating", "label": "Autoridad (DR)", "value": 44, "prev": 41, "unit": "/100"},
        {"id": "bounce", "label": "Rebote", "value": 38, "prev": 41, "unit": "%", "invert": True}
    ],
    "topicClusters": [
        {"name": "IA para Pymes", "traffic": 9800, "conversionRate": 3.2, "contentScore": 72},
        {"name": "Automatización SEO", "traffic": 6400, "conversionRate": 2.6, "contentScore": 66},
        {"name": "Diseño Web + Core Web V.", "traffic": 5200, "conversionRate": 4.1, "contentScore": 79},
        {"name": "Marketing local", "traffic": 4270, "conversionRate": 2.1, "contentScore": 58},
        {"name": "E-commerce", "traffic": 3990, "conversionRate": 1.8, "contentScore": 55},
        {"name": "Analítica", "traffic": 3200, "conversionRate": 3.6, "contentScore": 70},
        {"name": "Contenido largo", "traffic": 2800, "conversionRate": 2.9, "contentScore": 63},
        {"name": "Branding", "traffic": 2100, "conversionRate": 1.2, "contentScore": 51}
    ],
    "pipeline": [
        {"step": 1, "name": "Research", "status": 0.9, "notes": "KWs priorizadas"},
        {"step": 2, "name": "Clusterización", "status": 0.7, "notes": "8 clusters listos"},
        {"step": 3, "name": "Auditoría técnica", "status": 0.6, "notes": "CWV en progreso"},
        {"step": 4, "name": "Contenido", "status": 0.5, "notes": "5 artículos en cola"},
        {"step": 5, "name": "On-page", "status": 0.4, "notes": "Meta + Schema"},
        {"step": 6, "name": "Off-page", "status": 0.3, "notes": "Prospección"},
        {"step": 7, "name": "Monitoreo", "status": 0.8, "notes": "Dashboards OK"},
        {"step": 8, "name": "Iteración", "status": 0.2, "notes": "Backlog priorizado"}
    ]
}

# Función adaptadora principal
def adapt_data(data):
    """Transforma el JSON de entrada al formato optimizado para las infografías"""
    
    # Calcular total de tráfico
    total_traffic = sum(c['traffic'] for c in data['topicClusters'])
    
    # Procesar clusters
    clusters = []
    accumulated_angle = 0
    
    for cluster in data['topicClusters']:
        share = (cluster['traffic'] / total_traffic * 100) if total_traffic > 0 else 0
        angle_size = (cluster['traffic'] / total_traffic * 2 * math.pi) if total_traffic > 0 else 0
        
        clusters.append({
            **cluster,
            'share': round(share, 1),
            'angleStart': accumulated_angle,
            'angleEnd': accumulated_angle + angle_size,
            'angleDegrees': round(angle_size * 180 / math.pi, 1)
        })
        
        accumulated_angle += angle_size
    
    # Procesar KPIs
    kpis = []
    for kpi in data['kpis']:
        # Calcular porcentaje normalizado
        if kpi.get('unit') in ['/100', '%']:
            percent = kpi['value']
        else:
            percent = scale_smart(kpi)
        
        # Invertir si es necesario
        if kpi.get('invert', False):
            percent = 100 - percent
        
        # Calcular cambio vs periodo anterior
        change = None
        if kpi.get('prev') is not None:
            change = percent_change(kpi['value'], kpi['prev'])
        
        kpis.append({
            **kpi,
            'percent': round(clamp(percent, 0, 100), 1),
            'change': round(change, 1) if change is not None else None,
            'changeAbs': round(kpi['value'] - kpi.get('prev', kpi['value']), 1)
        })
    
    # Procesar pipeline con validación
    pipeline = []
    for step in data['pipeline']:
        pipeline.append({
            **step,
            'statusPercent': round(clamp(step['status'] * 100, 0, 100), 1)
        })
    
    return {
        'site': data['site'],
        'period': data['period'],
        'health': data['totals']['healthScore'],
        'totals': data['totals'],
        'clusters': clusters,
        'kpis': kpis,
        'pipeline': pipeline
    }

# Probar el adaptador
adapted = adapt_data(sample_data)
print("=== DATOS ADAPTADOS ===\n")
print(json.dumps(adapted, indent=2, ensure_ascii=False))
