
# Ahora voy a generar los datos YAML para la aplicación web
import yaml

# Crear estructura de datos para el app_subagent
app_data = {
    'sampleData': sample_data,
    'adaptedData': adapted,
    'colorPalettes': {
        'clusters': ['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F97316', '#FBBF24', '#10B981', '#06B6D4'],
        'kpis': ['#3B82F6', '#8B5CF6', '#EC4899', '#F43F5E', '#F59E0B', '#10B981', '#06B6D4', '#64748B'],
        'pipeline': ['#6366F1', '#8B5CF6', '#A855F7', '#C026D3', '#DB2777', '#E11D48', '#F97316', '#FBBF24']
    },
    'config': {
        'animations': {
            'duration': 600,
            'easing': 'cubic-bezier(0.4, 0, 0.2, 1)'
        },
        'responsive': {
            'mobile': 640,
            'tablet': 1024,
            'desktop': 1280
        },
        'accessibility': {
            'minContrast': 4.5,
            'ariaLabels': True,
            'keyboardNav': True
        }
    }
}

# Convertir a YAML
yaml_data = yaml.dump(app_data, default_flow_style=False, allow_unicode=True, sort_keys=False)

# Guardar el YAML
with open('seo_infographics_data.yaml', 'w', encoding='utf-8') as f:
    f.write(yaml_data)

print("✓ Archivo YAML generado: seo_infographics_data.yaml")
print(f"\nPrimeras 100 líneas del YAML:\n")
print('\n'.join(yaml_data.split('\n')[:100]))
