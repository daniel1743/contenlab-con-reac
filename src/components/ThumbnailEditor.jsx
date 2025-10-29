// ThumbnailEditor.tsx
import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

const ThumbnailEditor = () => {
  // ========== ESTADO Y REFERENCIAS ==========
  
  // Referencia al canvas DOM
  const canvasRef = useRef(null);
  
  // Referencia a la instancia de Fabric.js Canvas
  const fabricCanvasRef = useRef(null);
  
  // Estados para el historial de deshacer/rehacer
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const isRedoing = useRef(false);
  
  // Estado para mostrar propiedades del objeto seleccionado
  const [selectedObjectType, setSelectedObjectType] = useState('');

  // ========== INICIALIZACIÓN DEL CANVAS ==========
  
  useEffect(() => {
    // Inicializar el canvas de Fabric.js con dimensiones de miniatura de YouTube
    if (canvasRef.current && !fabricCanvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 1280,
        height: 720,
        backgroundColor: '#ffffff',
      });
      
      fabricCanvasRef.current = canvas;
      
      // Guardar estado inicial
      saveState();
      
      // Event listeners para actualizar el historial cuando se modifiquen objetos
      canvas.on('object:added', handleCanvasChange);
      canvas.on('object:modified', handleCanvasChange);
      canvas.on('object:removed', handleCanvasChange);
      
      // Event listener para mostrar propiedades del objeto seleccionado
      canvas.on('selection:created', handleSelection);
      canvas.on('selection:updated', handleSelection);
      canvas.on('selection:cleared', () => setSelectedObjectType(''));
    }
    
    // Cleanup al desmontar
    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, []);

  // ========== MANEJO DE EVENTOS DE TECLADO ==========
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      
      // Ctrl+Z - Deshacer
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      
      // Ctrl+Y - Rehacer
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
      }
      
      // Delete - Eliminar objeto seleccionado
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeObject = canvas.getActiveObject();
        if (activeObject && !(activeObject instanceof fabric.IText && activeObject.isEditing)) {
          e.preventDefault();
          canvas.remove(activeObject);
          canvas.renderAll();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [historyStep, history]);

  // ========== FUNCIONES DE HISTORIAL (DESHACER/REHACER) ==========
  
  // Guardar el estado actual del canvas en el historial
  const saveState = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || isRedoing.current) return;
    
    const json = JSON.stringify(canvas.toJSON());
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyStep + 1);
      newHistory.push(json);
      return newHistory;
    });
    
    setHistoryStep(prev => prev + 1);
  };
  
  // Manejar cambios en el canvas (para guardar estado)
  const handleCanvasChange = () => {
    // Usar un timeout para evitar múltiples guardados en una sola operación
    setTimeout(() => {
      if (!isRedoing.current) {
        saveState();
      }
    }, 100);
  };
  
  // Deshacer: volver al estado anterior
  const undo = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || historyStep <= 0) return;
    
    isRedoing.current = true;
    const previousStep = historyStep - 1;
    
    canvas.loadFromJSON(history[previousStep], () => {
      canvas.renderAll();
      setHistoryStep(previousStep);
      isRedoing.current = false;
    });
  };
  
  // Rehacer: avanzar al siguiente estado
  const redo = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || historyStep >= history.length - 1) return;
    
    isRedoing.current = true;
    const nextStep = historyStep + 1;
    
    canvas.loadFromJSON(history[nextStep], () => {
      canvas.renderAll();
      setHistoryStep(nextStep);
      isRedoing.current = false;
    });
  };

  // ========== MANEJO DE SELECCIÓN DE OBJETOS ==========
  
  const handleSelection = (e) => {
    const activeObject = e.selected?.[0];
    if (activeObject) {
      setSelectedObjectType(activeObject.type || 'unknown');
    }
  };

  // ========== FUNCIONES DE LA BARRA DE HERRAMIENTAS ==========
  
  // Añadir texto editable al canvas
  const addText = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    const text = new fabric.IText('Texto de ejemplo', {
      left: 100,
      top: 100,
      fontSize: 40,
      fill: '#000000',
      fontFamily: 'Arial',
    });
    
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };
  
  // Añadir rectángulo al canvas
  const addRectangle = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    const rect = new fabric.Rect({
      left: 150,
      top: 150,
      width: 200,
      height: 150,
      fill: '#3498db',
      stroke: '#2980b9',
      strokeWidth: 2,
    });
    
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  };
  
  // Manejar la subida de imagen
  const handleImageUpload = (e) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const imgUrl = event.target?.result;
      
      fabric.Image.fromURL(imgUrl, (img) => {
        // Escalar la imagen si es muy grande
        const maxWidth = 600;
        const maxHeight = 600;
        
        if (img.width && img.width > maxWidth) {
          img.scaleToWidth(maxWidth);
        }
        if (img.height && img.height > maxHeight) {
          img.scaleToHeight(maxHeight);
        }
        
        img.set({
          left: 100,
          top: 100,
        });
        
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
    };
    
    reader.readAsDataURL(file);
    
    // Resetear el input para permitir subir la misma imagen de nuevo
    e.target.value = '';
  };
  
  // Exportar el canvas como imagen PNG
  const exportCanvas = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    // Deseleccionar todos los objetos antes de exportar
    canvas.discardActiveObject();
    canvas.renderAll();
    
    // Convertir el canvas a data URL
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });
    
    // Crear un enlace de descarga
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'thumbnail.png';
    link.click();
  };

  // ========== FUNCIONES DE FILTROS (con ImageJS) ==========
  
  // Nota: Para usar image-js, necesitarías importarlo: import { Image } from 'image-js'
  // Aquí está la estructura básica para aplicar filtros
  
  const applyBrightness = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    
    // Verificar que el objeto seleccionado sea una imagen
    if (!activeObject || activeObject.type !== 'image') {
      alert('Por favor, selecciona una imagen para aplicar el filtro');
      return;
    }
    
    const fabricImage = activeObject;
    const imgElement = fabricImage.getElement();
    
    // OPCIÓN 1: Usar filtros nativos de Fabric.js
    fabricImage.filters = fabricImage.filters || [];
    fabricImage.filters.push(new fabric.Image.filters.Brightness({
      brightness: 0.1 // Aumentar brillo en 0.1 (rango: -1 a 1)
    }));
    fabricImage.applyFilters();
    canvas.renderAll();
    
    /* OPCIÓN 2: Usar image-js (requiere instalación: npm install image-js)
    try {
      // Convertir la imagen a formato image-js
      const response = await fetch(imgElement.src);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Cargar con image-js
      const image = await Image.load(uint8Array);
      
      // Aplicar filtro de brillo (ejemplo: multiplicar valores RGB)
      const brightened = image.multiply(1.1); // Incrementar 10%
      
      // Convertir de vuelta a data URL
      const dataUrl = brightened.toDataURL();
      
      // Actualizar la imagen en el canvas
      fabric.Image.fromURL(dataUrl, (newImg) => {
        newImg.set({
          left: fabricImage.left,
          top: fabricImage.top,
          scaleX: fabricImage.scaleX,
          scaleY: fabricImage.scaleY,
          angle: fabricImage.angle,
        });
        
        canvas.remove(fabricImage);
        canvas.add(newImg);
        canvas.setActiveObject(newImg);
        canvas.renderAll();
      });
    } catch (error) {
      console.error('Error aplicando filtro:', error);
    }
    */
  };
  
  const applyContrast = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    
    if (!activeObject || activeObject.type !== 'image') {
      alert('Por favor, selecciona una imagen para aplicar el filtro');
      return;
    }
    
    const fabricImage = activeObject;

    // Usar filtros nativos de Fabric.js
    fabricImage.filters = fabricImage.filters || [];
    fabricImage.filters.push(new fabric.Image.filters.Contrast({
      contrast: 0.1 // Aumentar contraste
    }));
    fabricImage.applyFilters();
    canvas.renderAll();
  };
  
  const applySaturation = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    
    if (!activeObject || activeObject.type !== 'image') {
      alert('Por favor, selecciona una imagen para aplicar el filtro');
      return;
    }
    
    const fabricImage = activeObject;

    // Usar filtros nativos de Fabric.js
    fabricImage.filters = fabricImage.filters || [];
    fabricImage.filters.push(new fabric.Image.filters.Saturation({
      saturation: 0.2 // Aumentar saturación
    }));
    fabricImage.applyFilters();
    canvas.renderAll();
  };

  // ========== RENDERIZADO DEL COMPONENTE ==========
  
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Editor de Miniaturas</h2>
      
      {/* BARRA DE HERRAMIENTAS */}
      <div style={styles.toolbar}>
        <button onClick={addText} style={styles.button}>
          ➕ Añadir Texto
        </button>
        
        <button onClick={addRectangle} style={styles.button}>
          ⬜ Añadir Rectángulo
        </button>
        
        <label htmlFor="imageUpload" style={styles.button}>
          🖼️ Subir Imagen
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={styles.fileInput}
          />
        </label>
        
        <div style={styles.separator} />
        
        <button onClick={applyBrightness} style={styles.button}>
          ☀️ Brillo+
        </button>
        
        <button onClick={applyContrast} style={styles.button}>
          🔆 Contraste+
        </button>
        
        <button onClick={applySaturation} style={styles.button}>
          🎨 Saturación+
        </button>
        
        <div style={styles.separator} />
        
        <button 
          onClick={undo} 
          disabled={historyStep <= 0}
          style={{
            ...styles.button,
            opacity: historyStep <= 0 ? 0.5 : 1,
          }}
        >
          ↶ Deshacer (Ctrl+Z)
        </button>
        
        <button 
          onClick={redo} 
          disabled={historyStep >= history.length - 1}
          style={{
            ...styles.button,
            opacity: historyStep >= history.length - 1 ? 0.5 : 1,
          }}
        >
          ↷ Rehacer (Ctrl+Y)
        </button>
        
        <div style={styles.separator} />
        
        <button onClick={exportCanvas} style={styles.exportButton}>
          💾 Exportar PNG
        </button>
      </div>
      
      {/* PANEL DE PROPIEDADES */}
      {selectedObjectType && (
        <div style={styles.propertiesPanel}>
          <strong>Objeto seleccionado:</strong> {selectedObjectType}
          <br />
          <small>Presiona "Delete" para eliminar</small>
        </div>
      )}
      
      {/* CANVAS */}
      <div style={styles.canvasContainer}>
        <canvas ref={canvasRef} />
      </div>
      
      {/* INSTRUCCIONES */}
      <div style={styles.instructions}>
        <h3>Instrucciones:</h3>
        <ul>
          <li>Haz clic en los objetos para seleccionarlos, moverlos, rotarlos o redimensionarlos</li>
          <li>Haz doble clic en el texto para editarlo</li>
          <li>Usa <kbd>Delete</kbd> o <kbd>Backspace</kbd> para eliminar objetos seleccionados</li>
          <li>Usa <kbd>Ctrl+Z</kbd> para deshacer y <kbd>Ctrl+Y</kbd> para rehacer</li>
          <li>Los filtros solo funcionan en imágenes seleccionadas</li>
        </ul>
      </div>
    </div>
  );
};

// ========== ESTILOS ==========

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1300px',
    margin: '0 auto',
    padding: '20px',
  },
  title: {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: '20px',
  },
  toolbar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    padding: '15px',
    backgroundColor: '#ecf0f1',
    borderRadius: '8px',
    marginBottom: '20px',
    alignItems: 'center',
  },
  button: {
    padding: '10px 15px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
    position: 'relative',
  },
  exportButton: {
    padding: '10px 20px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },
  fileInput: {
    display: 'none',
  },
  separator: {
    width: '1px',
    height: '30px',
    backgroundColor: '#bdc3c7',
    margin: '0 5px',
  },
  propertiesPanel: {
    padding: '15px',
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '5px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  canvasContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
    border: '2px solid #34495e',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  instructions: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    fontSize: '14px',
  },
};

export default ThumbnailEditor;
