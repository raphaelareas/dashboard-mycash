import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/utils/formatCurrency';

const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 14L6 10L10 12L18 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 4H15L18 7V4Z" fill="currentColor"/>
  </svg>
);

// Mock data - 7 meses
const mockData = [
  { month: 'Jan', receitas: 23000, despesas: 18000 },
  { month: 'Fev', receitas: 25000, despesas: 19000 },
  { month: 'Mar', receitas: 22000, despesas: 17500 },
  { month: 'Abr', receitas: 28000, despesas: 21000 },
  { month: 'Mai', receitas: 24000, despesas: 18500 },
  { month: 'Jun', receitas: 26000, despesas: 20000 },
  { month: 'Jul', receitas: 23000, despesas: 17641 },
];


function formatYAxis(value: number) {
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}k`;
  }
  return `R$ ${value}`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="
        bg-white dark:bg-gray-800 
        p-3 rounded-lg shadow-xl 
        border border-gray-200 dark:border-gray-700
      ">
        <p className="font-bold text-gray-900 dark:text-gray-100 mb-2">{label}</p>
        <p className="text-sm text-success-dark dark:text-success mb-1">
          Receitas: {formatCurrency(payload[0].value)}
        </p>
        <p className="text-sm text-gray-900 dark:text-gray-100">
          Despesas: {formatCurrency(payload[1].value)}
        </p>
      </div>
    );
  }
  return null;
}

export function FinancialFlowChart() {
  return (
    <div className="
      w-full p-6 rounded-lg
      bg-white dark:bg-gray-800 
      border border-gray-200 dark:border-gray-700
      h-full flex flex-col
    ">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ChartIcon />
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Fluxo financeiro</h3>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-lime-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Receitas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-900 dark:bg-gray-100" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Despesas</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={mockData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--lime-500)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--lime-500)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--gray-900)" stopOpacity={0.1} />
              <stop offset="100%" stopColor="var(--gray-900)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700" stroke="var(--gray-100)" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: 'var(--gray-600)' }}
            className="dark:[&_text]:fill-gray-400"
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--gray-600)' }}
            className="dark:[&_text]:fill-gray-400"
            tickFormatter={formatYAxis}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="receitas"
            stroke="var(--lime-500)"
            strokeWidth={3}
            fill="url(#colorReceitas)"
          />
          <Area
            type="monotone"
            dataKey="despesas"
            stroke="var(--gray-900)"
            strokeWidth={3}
            fill="url(#colorDespesas)"
          />
        </AreaChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
