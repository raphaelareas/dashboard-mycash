import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useI18n } from '@/contexts/I18nContext';
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';
import { useFinance } from '@/contexts/FinanceContext';
import { Transaction } from '@/types';

const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 14L6 10L10 12L18 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 4H15L18 7V4Z" fill="currentColor"/>
  </svg>
);

interface FinancialFlowPoint {
  dayLabel: string;
  day: number;
  receitas: number;
  despesas: number;
}

// formatYAxis será criado dentro do componente para usar o hook

function getMonthDaysBuckets(dateRange: { startDate: Date; endDate: Date }): number[] {
  const { startDate } = dateRange;
  const year = startDate.getFullYear();
  const month = startDate.getMonth();

  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const baseDays = [1, 5, 10, 15, 20, 25];

  const buckets = baseDays.filter((day) => day <= lastDayOfMonth);

  // Garante que o último dia do mês vigente sempre apareça como último tick (28, 29, 30 ou 31),
  // sem duplicar 30/31.
  if (lastDayOfMonth > 25) {
    buckets.push(lastDayOfMonth);
  }

  return buckets;
}

function buildFinancialFlowData(
  transactions: Transaction[],
  dateRange: { startDate: Date; endDate: Date }
): FinancialFlowPoint[] {
  const { startDate } = dateRange;
  const year = startDate.getFullYear();
  const month = startDate.getMonth();

  const parsedTransactions = transactions
    .map((t) => ({
      ...t,
      dateObj: new Date(t.date),
    }))
    .filter((t) => t.dateObj.getMonth() === month && t.dateObj.getFullYear() === year);

  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

  let cumulativeIncome = 0;
  let cumulativeExpenses = 0;

  const data: FinancialFlowPoint[] = [];

  for (let day = 1; day <= lastDayOfMonth; day++) {
    const dayTransactions = parsedTransactions.filter(
      (t) => t.dateObj.getDate() === day
    );

    let incomeForDay = 0;
    let expensesForDay = 0;

    dayTransactions.forEach((t) => {
      if (t.type === 'income') {
        incomeForDay += t.amount;
      } else if (t.type === 'expense') {
        expensesForDay += t.amount;
      }
    });

    cumulativeIncome += incomeForDay;
    cumulativeExpenses += expensesForDay;

    data.push({
      dayLabel: String(day),
      day,
      receitas: cumulativeIncome,
      despesas: cumulativeExpenses,
    });
  }

  return data;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
  transactions?: Transaction[];
  dateRange?: { startDate: Date; endDate: Date };
}

function CustomTooltip({ active, payload, label, transactions, dateRange }: CustomTooltipProps) {
  const { t } = useI18n();
  const { formatCurrency } = useCurrencyFormat();
  
  if (!active || !payload || !payload.length || !transactions || !dateRange) {
    return null;
  }

  const currentDay = Number(label);
  if (Number.isNaN(currentDay)) {
    return null;
  }

  const startDay = currentDay;
  const endDay = currentDay;

  // Buscar transações no intervalo
  const { startDate } = dateRange;
  const year = startDate.getFullYear();
  const month = startDate.getMonth();

  const intervalTransactions = transactions
    .map((t) => ({
      ...t,
      dateObj: new Date(t.date),
    }))
    .filter((t) => {
      const tYear = t.dateObj.getFullYear();
      const tMonth = t.dateObj.getMonth();
      const tDay = t.dateObj.getDate();
      
      return (
        tYear === year &&
        tMonth === month &&
        tDay >= startDay &&
        tDay <= endDay
      );
    })
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  // Se há transações no intervalo, mostrar detalhado
  if (intervalTransactions.length > 0 && intervalTransactions.length <= 10) {
    // Mostrar até 10 transações para não ficar muito grande
    return (
      <div className="
        bg-white dark:bg-gray-800 
        p-3 rounded-lg shadow-xl 
        border border-gray-200 dark:border-gray-700
        max-w-xs
      ">
        <p className="font-bold text-gray-900 dark:text-gray-100 mb-2">
          {`${t('common.day')} ${endDay}`}
        </p>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {intervalTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-start justify-between gap-2 text-xs border-b border-gray-100 dark:border-gray-700 pb-1 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 dark:text-gray-100 truncate">
                  {transaction.description}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  {transaction.dateObj.getDate()}/{transaction.dateObj.getMonth() + 1}
                </p>
              </div>
              <p
                className={`font-semibold flex-shrink-0 ${
                  transaction.type === 'income'
                    ? 'text-success-dark dark:text-success'
                    : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-success-dark dark:text-success">
            {t('transactions.income')}: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-xs text-gray-900 dark:text-gray-100">
            {t('transactions.expense')}: {formatCurrency(payload[1].value)}
          </p>
        </div>
      </div>
    );
  }

  // Se não há transações ou são muitas, mostrar resumo
  return (
    <div className="
      bg-white dark:bg-gray-800 
      p-3 rounded-lg shadow-xl 
      border border-gray-200 dark:border-gray-700
    ">
      <p className="font-bold text-gray-900 dark:text-gray-100 mb-2">
        {`Dia ${endDay}`}
      </p>
      <p className="text-sm text-success-dark dark:text-success mb-1">
        {t('transactions.income')}: {formatCurrency(payload[0].value)}
      </p>
      <p className="text-sm text-gray-900 dark:text-gray-100">
        {t('transactions.expense')}: {formatCurrency(payload[1].value)}
      </p>
      {intervalTransactions.length > 10 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {intervalTransactions.length} transações
        </p>
      )}
    </div>
  );
}

export function FinancialFlowChart() {
  const { t } = useI18n();
  const { getFilteredTransactions, dateRange } = useFinance();
  const { formatCurrency, formatCompactCurrency } = useCurrencyFormat();

  const transactions = getFilteredTransactions();
  const chartData: FinancialFlowPoint[] = buildFinancialFlowData(transactions, dateRange);

  // Função para formatar eixo Y com moeda do usuário
  const formatYAxis = (value: number) => {
    return formatCompactCurrency(value);
  };

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
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{t('dashboard.financialFlow') || 'Fluxo financeiro'}</h3>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-lime-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('transactions.income')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-900 dark:bg-gray-100" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('transactions.expense')}</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
            dataKey="dayLabel"
            ticks={getMonthDaysBuckets(dateRange).map((day) => String(day))}
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
          <Tooltip
            content={
              <CustomTooltip
                transactions={transactions}
                dateRange={dateRange}
              />
            }
          />
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
