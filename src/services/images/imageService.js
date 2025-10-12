/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🎨 IMAGE SERVICE - Generación y Edición de Imágenes con IA     ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  DALL-E 3, Stability AI, Clipdrop integrados                    ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * 📝 APIS SOPORTADAS:
 * 1. DALL-E 3 (OpenAI) - $0.04/imagen
 * 2. Stability AI - $0.002-0.008/imagen
 * 3. Clipdrop - Edición y upscaling
 */

// ===== CONFIGURACIÓN =====
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const STABILITY_API_KEY = import.meta.env.VITE_STABILITY_API_KEY;
const CLIPDROP_API_KEY = import.meta.env.VITE_CLIPDROP_API_KEY;

// ===== DALL-E 3 =====
export const generateImageDALLE = async (prompt, options = {}) => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  /* 🔴 DESCOMENTAR CUANDO QUIERAS USAR DALL-E 3:

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: options.size || '1024x1024',
        quality: options.quality || 'standard'
      })
    });

    const data = await response.json();
    return data.data[0].url;

  } catch (error) {
    console.error('Error generating image with DALL-E:', error);
    throw error;
  }

  */ // FIN BLOQUE COMENTADO

  throw new Error('DALL-E 3 not enabled. Add OPENAI_API_KEY to .env');
};

// ===== STABILITY AI =====
export const generateImageStability = async (prompt, options = {}) => {
  if (!STABILITY_API_KEY) {
    throw new Error('Stability AI API key not configured');
  }

  /* 🔴 DESCOMENTAR CUANDO QUIERAS USAR STABILITY AI:

  try {
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STABILITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        steps: 30,
        samples: 1
      })
    });

    const data = await response.json();
    return `data:image/png;base64,${data.artifacts[0].base64}`;

  } catch (error) {
    console.error('Error generating image with Stability:', error);
    throw error;
  }

  */ // FIN BLOQUE COMENTADO

  throw new Error('Stability AI not enabled. Add STABILITY_API_KEY to .env');
};

// ===== CLIPDROP - UPSCALING =====
export const upscaleImage = async (imageFile) => {
  if (!CLIPDROP_API_KEY) {
    throw new Error('Clipdrop API key not configured');
  }

  /* 🔴 DESCOMENTAR CUANDO QUIERAS USAR CLIPDROP:

  try {
    const formData = new FormData();
    formData.append('image_file', imageFile);
    formData.append('target_width', '2048');
    formData.append('target_height', '2048');

    const response = await fetch('https://clipdrop-api.co/image-upscaling/v1/upscale', {
      method: 'POST',
      headers: {
        'x-api-key': CLIPDROP_API_KEY
      },
      body: formData
    });

    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error('Error upscaling image:', error);
    throw error;
  }

  */ // FIN BLOQUE COMENTADO

  throw new Error('Clipdrop not enabled. Add CLIPDROP_API_KEY to .env');
};

// ===== FUNCIÓN ORQUESTADORA =====
export const generateImage = async (prompt, provider = 'dalle', options = {}) => {
  switch (provider) {
    case 'dalle':
      return generateImageDALLE(prompt, options);
    case 'stability':
      return generateImageStability(prompt, options);
    default:
      return generateImageDALLE(prompt, options);
  }
};

export const getServiceInfo = () => {
  return {
    name: 'Image Service',
    providers: {
      dalle: OPENAI_API_KEY ? 'configured' : 'not_configured',
      stability: STABILITY_API_KEY ? 'configured' : 'not_configured',
      clipdrop: CLIPDROP_API_KEY ? 'configured' : 'not_configured'
    },
    features: ['Generación de imágenes', 'Upscaling', 'Edición con IA'],
    pricing: {
      dalle: '$0.04/imagen',
      stability: '$0.002-0.008/imagen',
      clipdrop: '$9/mes (1000 imágenes)'
    }
  };
};
