/**
 * 📅 CONTENT PLANNER
 *
 * Planificador de contenido visual con calendario
 * Reemplaza el calendario de publicaciones automatizadas
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  getPlannedContent,
  createPlannedContent,
  updatePlannedContent,
  updateContentStatus,
  deletePlannedContent,
  getChecklistTemplates,
  getContentStats
} from '@/services/contentPlannerService';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  BarChart3,
  Flame,
  Target,
  Lightbulb,
  Video,
  FileText,
  Image as ImageIcon,
  X,
  MousePointer2,
  TrendingUp
} from 'lucide-react';
import InteractiveTooltipTour, { TooltipTarget } from './InteractiveTooltipTour';

const ContentPlanner = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [plannedContent, setPlannedContent] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templates, setTemplates] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'video',
    theme: '',
    status: 'idea',
    priority: 'normal',
    checklist: []
  });

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const statusConfig = {
    idea: { label: '💡 Idea', color: 'bg-gray-500/20 text-gray-300', icon: Lightbulb },
    scripted: { label: '📝 Guionado', color: 'bg-blue-500/20 text-blue-300', icon: FileText },
    recorded: { label: '🎬 Grabado', color: 'bg-purple-500/20 text-purple-300', icon: Video },
    edited: { label: '✂️ Editado', color: 'bg-yellow-500/20 text-yellow-300', icon: ImageIcon },
    published: { label: '✅ Publicado', color: 'bg-green-500/20 text-green-300', icon: CheckCircle2 }
  };

  const priorityConfig = {
    low: { label: 'Baja', color: 'text-gray-400' },
    normal: { label: 'Normal', color: 'text-blue-400' },
    high: { label: 'Alta', color: 'text-orange-400' },
    urgent: { label: 'Urgente', color: 'text-red-400' }
  };

  // Load data
  useEffect(() => {
    if (user) {
      loadData();
      loadTemplates();
    }
  }, [user, currentDate]);

  const loadData = async () => {
    setLoading(true);
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const [contentResult, statsResult] = await Promise.all([
      getPlannedContent(user.id, { month, year }),
      getContentStats(user.id)
    ]);

    if (contentResult.success) {
      setPlannedContent(contentResult.content);
    }

    if (statsResult.success) {
      setStats(statsResult.stats);
    }

    setLoading(false);
  };

  const loadTemplates = async () => {
    const result = await getChecklistTemplates();
    if (result.success) {
      setTemplates(result.templates);
    }
  };

  // Calendar logic
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Previous month days
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getContentForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return plannedContent.filter(c => c.planned_date === dateStr);
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setFormData({
      ...formData,
      date: date.toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleCreateContent = async () => {
    if (!formData.title || !selectedDate) return;

    const result = await createPlannedContent(user.id, {
      plannedDate: selectedDate.toISOString().split('T')[0],
      title: formData.title,
      description: formData.description,
      category: formData.category,
      theme: formData.theme,
      status: formData.status,
      priority: formData.priority,
      checklist: formData.checklist
    });

    if (result.success) {
      setIsModalOpen(false);
      loadData();
      setFormData({
        title: '',
        description: '',
        category: 'video',
        theme: '',
        status: 'idea',
        priority: 'normal',
        checklist: []
      });
    }
  };

  const handleStatusChange = async (contentId, newStatus) => {
    const result = await updateContentStatus(contentId, newStatus);
    if (result.success) {
      loadData();
    }
  };

  const handleDelete = async (contentId) => {
    if (confirm('¿Eliminar este contenido planificado?')) {
      const result = await deletePlannedContent(contentId);
      if (result.success) {
        loadData();
      }
    }
  };

  const handleTemplateSelect = (template) => {
    setFormData({
      ...formData,
      checklist: template.items
    });
  };

  const days = getDaysInMonth(currentDate);

  return (
    <InteractiveTooltipTour
      tourKey="content_planner_tour"
      autoStartDelay={1500}
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                <CalendarIcon className="w-10 h-10 text-purple-400" />
                Content Planner
              </h1>
              <p className="text-gray-400 mt-2">
                Planifica, organiza y da seguimiento a tu contenido
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <TooltipTarget
                id="stats_this_week"
                title="Contenido de esta semana"
                description="Cantidad de publicaciones planificadas para los próximos 7 días. Te ayuda a mantener un ritmo constante de contenido."
                icon={CalendarIcon}
                position="bottom"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
                  <div className="text-2xl font-bold text-white">{stats.thisWeek}</div>
                  <div className="text-sm text-gray-400">Esta Semana</div>
                </div>
              </TooltipTarget>

              <TooltipTarget
                id="stats_ideas"
                title="Ideas guardadas"
                description="Conceptos que aún no has desarrollado. Son tu banco de inspiración para futuros contenidos."
                icon={Lightbulb}
                position="bottom"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
                  <div className="text-2xl font-bold text-blue-400">{stats.byStatus.idea}</div>
                  <div className="text-sm text-gray-400">Ideas</div>
                </div>
              </TooltipTarget>

              <TooltipTarget
                id="stats_in_progress"
                title="Contenido en proceso"
                description="Videos/posts que están siendo guionados, grabados o editados. Revisa su progreso regularmente."
                icon={TrendingUp}
                position="bottom"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
                  <div className="text-2xl font-bold text-purple-400">{stats.byStatus.scripted + stats.byStatus.recorded}</div>
                  <div className="text-sm text-gray-400">En Proceso</div>
                </div>
              </TooltipTarget>

              <TooltipTarget
                id="stats_published"
                title="Contenido publicado"
                description="Total de publicaciones completadas y lanzadas. ¡Celebra cada logro!"
                icon={CheckCircle2}
                position="bottom"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
                  <div className="text-2xl font-bold text-green-400">{stats.byStatus.published}</div>
                  <div className="text-sm text-gray-400">Publicados</div>
                </div>
              </TooltipTarget>

              <TooltipTarget
                id="stats_overdue"
                title="Contenido atrasado"
                description="Publicaciones cuya fecha planificada ya pasó. Prioriza completar estas primero."
                icon={Flame}
                position="bottom"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-red-700">
                  <div className="text-2xl font-bold text-red-400">{stats.overdue}</div>
                  <div className="text-sm text-gray-400">Atrasados</div>
                </div>
              </TooltipTarget>
            </div>
          )}
        </motion.div>

        {/* Calendar Navigation */}
        <TooltipTarget
          id="calendar_view"
          title="Vista de calendario"
          description="Haz clic en cualquier día para planificar contenido. Los días con publicaciones mostrarán chips de colores según su estado."
          icon={CalendarIcon}
          position="bottom"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <TooltipTarget
                id="calendar_prev_month"
                title="Mes anterior"
                description="Navega a meses anteriores para revisar o planificar contenido pasado."
                icon={ChevronLeft}
                position="bottom"
              >
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-white/10 rounded-lg transition"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
              </TooltipTarget>

              <h2 className="text-2xl font-bold text-white">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>

              <TooltipTarget
                id="calendar_next_month"
                title="Mes siguiente"
                description="Avanza a meses futuros para planificar contenido a largo plazo."
                icon={ChevronRight}
                position="bottom"
              >
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-white/10 rounded-lg transition"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </TooltipTarget>
            </div>

          {/* Calendar Grid */}
          <div className="p-6">
            {/* Day names */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((date, index) => {
                const content = getContentForDate(date);
                const isCurrentDay = isToday(date);

                return (
                  <motion.div
                    key={index}
                    whileHover={{ scale: date ? 1.02 : 1 }}
                    onClick={() => date && handleDateClick(date)}
                    className={`
                      min-h-[100px] p-2 rounded-lg border transition-all cursor-pointer
                      ${date ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-transparent border-transparent'}
                      ${isCurrentDay ? 'ring-2 ring-purple-500 border-purple-500' : ''}
                    `}
                  >
                    {date && (
                      <>
                        <div className={`text-sm font-semibold mb-1 ${isCurrentDay ? 'text-purple-400' : 'text-white'}`}>
                          {date.getDate()}
                        </div>

                        {/* Content items */}
                        <div className="space-y-1">
                          {content.slice(0, 2).map((item) => (
                            <div
                              key={item.id}
                              className={`text-xs px-2 py-1 rounded ${statusConfig[item.status].color} truncate`}
                            >
                              {item.title}
                            </div>
                          ))}
                          {content.length > 2 && (
                            <div className="text-xs text-gray-400 px-2">
                              +{content.length - 2} más
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
        </TooltipTarget>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setIsModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">
                    Planificar Contenido
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Date display */}
                {selectedDate && (
                  <div className="mb-6 p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
                    <div className="text-purple-300 text-sm">Fecha seleccionada</div>
                    <div className="text-white font-semibold">
                      {selectedDate.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                )}

                {/* Content for selected date */}
                {selectedDate && getContentForDate(selectedDate).length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-white font-semibold mb-3">Contenido planificado:</h4>
                    <div className="space-y-2">
                      {getContentForDate(selectedDate).map((item) => (
                        <div key={item.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="text-white font-medium">{item.title}</div>
                              <div className="text-sm text-gray-400 mt-1">{item.description}</div>
                              <div className="flex gap-2 mt-2">
                                <span className={`text-xs px-2 py-1 rounded ${statusConfig[item.status].color}`}>
                                  {statusConfig[item.status].label}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${priorityConfig[item.priority].color}`}>
                                  {priorityConfig[item.priority].label}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Título *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ej: 5 Casos de True Crime Más Perturbadores"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Descripción</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Notas, ideas, conceptos..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Categoría</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="video">📹 Video</option>
                        <option value="short">🎬 Short</option>
                        <option value="post">📝 Post</option>
                        <option value="carousel">🎠 Carrusel</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Prioridad</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="low">Baja</option>
                        <option value="normal">Normal</option>
                        <option value="high">Alta</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Plantilla de Checklist</label>
                    <select
                      onChange={(e) => {
                        const template = templates.find(t => t.id === e.target.value);
                        if (template) handleTemplateSelect(template);
                      }}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Seleccionar plantilla...</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCreateContent}
                      disabled={!formData.title}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </InteractiveTooltipTour>
  );
};

export default ContentPlanner;
