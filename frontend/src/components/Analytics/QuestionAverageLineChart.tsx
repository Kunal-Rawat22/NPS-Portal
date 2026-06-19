import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export interface QuestionChartPoint {
  label: string;
  questionText: string;
  score: number;
}

interface Props {
  data: QuestionChartPoint[];
}

const QuestionTooltip: React.FC<{
  active?: boolean;
  payload?: { payload: QuestionChartPoint }[];
}> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 max-w-[260px]">
      <p className="text-sm text-gray-900 font-medium leading-snug">{point.questionText}</p>
      <p className="text-sm text-primary-600 font-semibold mt-1.5">
        Score: {point.score.toFixed(2)} / 5
      </p>
    </div>
  );
};

const QuestionAverageLineChart: React.FC<Props> = ({ data }) => {
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 20, left: 0, bottom: data.length > 8 ? 48 : 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11 }}
          angle={data.length > 8 ? -35 : 0}
          textAnchor={data.length > 8 ? 'end' : 'middle'}
          height={data.length > 8 ? 56 : 32}
        />
        <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} width={36} />
        <Tooltip content={<QuestionTooltip />} cursor={{ stroke: '#93c5fd', strokeWidth: 1 }} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default QuestionAverageLineChart;
