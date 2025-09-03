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
        
        // Auto-reset después de 3 segundos
        setTimeout(() => {
            this.setState({ 
                hasError: false, 
                errorCount: this.state.errorCount + 1,
                lastError: null 
            });
            
            // Si hay muchos errores, recarga la página
            if (this.state.errorCount >= 2) {
                console.warn('Demasiados errores, recargando página...');
                window.location.reload();
            }
        }, 3000);
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
                            Reiniciando en 3 segundos... ({this.state.errorCount + 1}/3)
                        </p>
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
