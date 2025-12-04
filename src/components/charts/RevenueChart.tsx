import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart
} from 'recharts';

interface RevenueDataPoint {
  _id: {
    year: number;
    month: number;
    day?: number;
    hour?: number;
    week?: number;
  };
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
  granularity: 'hourly' | 'daily' | 'weekly' | 'monthly';
  type: 'line' | 'bar' | 'area';
  height?: number;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ 
  data, 
  granularity, 
  type = 'line',
  height = 400 
}) => {
  // Format data for chart display
  const formatData = (data: RevenueDataPoint[]) => {
    return data.map(item => {
      let label = '';
      
      switch (granularity) {
        case 'hourly':
          label = `${item._id.month}/${item._id.day} ${item._id.hour}:00`;
          break;
        case 'daily':
          label = `${item._id.month}/${item._id.day}`;
          break;
        case 'weekly':
          label = `Week ${item._id.week}`;
          break;
        case 'monthly':
          label = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
          break;
        default:
          label = `${item._id.month}/${item._id.day}`;
      }

      return {
        label,
        revenue: item.revenue,
        orders: item.orders,
        averageOrderValue: item.averageOrderValue,
        date: item._id
      };
    });
  };

  const chartData = formatData(data);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">{entry.dataKey}:</span>
              <span className="text-sm font-medium">
                {entry.dataKey === 'revenue' || entry.dataKey === 'averageOrderValue' 
                  ? `$${entry.value.toFixed(2)}` 
                  : entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Format Y-axis values
  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
  };

  const commonProps = {
    data: chartData,
    margin: { top: 5, right: 30, left: 20, bottom: 5 }
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="label" 
              stroke="#666"
              fontSize={12}
              angle={granularity === 'hourly' ? -45 : 0}
              textAnchor={granularity === 'hourly' ? 'end' : 'middle'}
              height={granularity === 'hourly' ? 60 : 30}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tickFormatter={formatYAxis}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="revenue" 
              fill="#3b82f6" 
              name="Revenue"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        );
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="label" 
              stroke="#666"
              fontSize={12}
              angle={granularity === 'hourly' ? -45 : 0}
              textAnchor={granularity === 'hourly' ? 'end' : 'middle'}
              height={granularity === 'hourly' ? 60 : 30}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tickFormatter={formatYAxis}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              name="Revenue"
            />
          </AreaChart>
        );
      
      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="label" 
              stroke="#666"
              fontSize={12}
              angle={granularity === 'hourly' ? -45 : 0}
              textAnchor={granularity === 'hourly' ? 'end' : 'middle'}
              height={granularity === 'hourly' ? 60 : 30}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tickFormatter={formatYAxis}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              name="Revenue"
            />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
              name="Orders"
              yAxisId="right"
            />
          </LineChart>
        );
    }
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
