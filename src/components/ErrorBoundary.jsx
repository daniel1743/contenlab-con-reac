import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false, 
            errorCount: 0,
            lastError: null 
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, lastError: error };
    }

    componentDidCatch(error, errorInfo) {
        console.warn('Error capturado por ErrorBoundary:', error, errorInfo);
        
        // Solo incrementar el contador, no recargar automáticamente
        const newErrorCount = this.state.errorCount + 1;
        
        // Auto-reset después de 5 segundos (más tiempo)
        setTimeout(() => {
            this.setState({ 
                hasError: false, 
                errorCount: newErrorCount,
                lastError: null 
            });
            
            // Solo recargar si hay MUCHOS errores (5 o más) y es un error crítico
            // Esto previene reinicios innecesarios
            if (newErrorCount >= 5 && error?.message?.includes('Cannot read')) {
                console.warn('Demasiados errores críticos, recargando página...');
                window.location.reload();
            }
        }, 5000);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
                    <div className="text-center space-y-4 p-8 bg-gray-800 rounded-lg">
                        <h2 className="text-2xl font-bold text-red-400">
                            ⚠️ Error Interceptado
                        </h2>
                        <p className="text-gray-300">
                            Recuperando en 5 segundos... ({this.state.errorCount}/5)
                        </p>
                        {this.state.lastError && (
                            <p className="text-xs text-gray-500 mt-2">
                                {this.state.lastError.message || 'Error desconocido'}
                            </p>
                        )}
                        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <button 
                            onClick={() => window.location.reload()}
                            className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded"
                        >
                            Recargar Ahora
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
