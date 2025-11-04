import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

const PerformanceChart = ({ videos }) => {
  if (!videos || videos.length === 0) return null;

  const chartData = videos.map((video, index) => ({
    name: `Video ${index + 1}`,
    views: video.views,
    likes: video.likes,
    comments: video.comments,
    title: video.title.substring(0, 30) + '...',
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1C1333] border border-[#C93CFC]/30 p-4 rounded-lg shadow-xl">
          <p className="text-[#F5F5F7] font-bold mb-2">
            {payload[0].payload.title}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Card className="bg-[#2A1B3D]/50 border-[#2A8CFF]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#F5F5F7]">
            <TrendingUp className="w-6 h-6 text-[#4ADE80]" />
            Rendimiento de tus primeros 5 videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A1B3D" />
              <XAxis
                dataKey="name"
                stroke="#A0A0A8"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#A0A0A8"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ color: '#F5F5F7' }}
              />
              <Bar
                dataKey="views"
                fill="#4ADE80"
                name="Vistas"
                animationDuration={1000}
              />
              <Bar
                dataKey="likes"
                fill="#2A8CFF"
                name="Likes"
                animationDuration={1000}
              />
              <Bar
                dataKey="comments"
                fill="#C93CFC"
                name="Comentarios"
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PerformanceChart;
