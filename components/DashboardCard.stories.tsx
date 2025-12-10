import type { Meta, StoryObj } from '@storybook/react';
import DashboardCard from './DashboardCard';
import { TrendingUp, TrendingDown, Zap, DollarSign, Activity, AlertCircle } from 'lucide-react';

const meta = {
  title: 'Components/Dashboard Card',
  component: DashboardCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'danger'],
    },
  },
} satisfies Meta<typeof DashboardCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultState: Story = {
  args: {
    title: 'Total Spending',
    value: '£245.50',
    subtitle: 'Last 30 days',
    icon: <DollarSign size={32} />,
    variant: 'default',
  },
};

export const LoadingState: Story = {
  args: {
    title: 'Energy Usage',
    value: '...',
    subtitle: 'Loading data...',
    icon: <Activity size={32} className="animate-pulse" />,
    variant: 'default',
  },
};

export const SuccessVariant: Story = {
  args: {
    title: 'Savings This Month',
    value: '£45.20',
    subtitle: '↓ 15% compared to last month',
    icon: <TrendingDown size={32} />,
    variant: 'success',
  },
};

export const WarningVariant: Story = {
  args: {
    title: 'Usage Alert',
    value: '125%',
    subtitle: 'Above your monthly target',
    icon: <AlertCircle size={32} />,
    variant: 'warning',
  },
};

export const DangerVariant: Story = {
  args: {
    title: 'High Usage Detected',
    value: '£325.80',
    subtitle: '↑ 35% increase this period',
    icon: <TrendingUp size={32} />,
    variant: 'danger',
  },
};

export const WithCustomContent: Story = {
  args: {
    title: 'Energy Breakdown',
    icon: <Zap size={32} />,
    variant: 'default',
    children: (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Electricity</span>
          <span className="font-semibold">£145.20</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Gas</span>
          <span className="font-semibold">£89.50</span>
        </div>
        <div className="flex justify-between text-sm border-t border-gray-200 dark:border-gray-700 pt-2">
          <span className="text-gray-900 dark:text-white font-semibold">Total</span>
          <span className="font-bold">£234.70</span>
        </div>
      </div>
    ),
  },
};

export const WithChart: Story = {
  args: {
    title: 'Usage Trend',
    subtitle: 'Last 7 days',
    icon: <Activity size={32} />,
    variant: 'default',
    children: (
      <div className="h-24 flex items-end justify-between gap-1">
        {[65, 70, 55, 80, 75, 60, 85].map((height, i) => (
          <div
            key={i}
            className="flex-1 bg-blue-500 rounded-t opacity-70 hover:opacity-100 transition-opacity"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    ),
  },
};

export const CompactCard: Story = {
  args: {
    title: 'Current Rate',
    value: '24.5p',
    subtitle: 'per kWh',
    variant: 'default',
  },
};

export const NoValue: Story = {
  args: {
    title: 'Set Up Smart Meter',
    subtitle: 'Get real-time energy tracking',
    icon: <Zap size={32} />,
    variant: 'default',
    children: (
      <button className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
        Get Started
      </button>
    ),
  },
};

export const ErrorState: Story = {
  args: {
    title: 'Data Unavailable',
    value: '--',
    subtitle: 'Failed to load data',
    icon: <AlertCircle size={32} />,
    variant: 'danger',
    children: (
      <button className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline">
        Retry
      </button>
    ),
  },
};
