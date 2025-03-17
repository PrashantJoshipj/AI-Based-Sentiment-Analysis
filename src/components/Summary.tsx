import React from 'react';
import { AnalysisResult } from '../types';
import { MessageSquare, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

interface SummaryProps {
  summary: AnalysisResult['summary'];
}

export function Summary({ summary }: SummaryProps) {
  const stats = [
    { name: 'Total Comments', value: summary.total, icon: MessageSquare, color: 'text-blue-600' },
    { name: 'Positive', value: summary.positive, icon: ThumbsUp, color: 'text-green-600' },
    { name: 'Negative', value: summary.negative, icon: ThumbsDown, color: 'text-red-600' },
    { name: 'Neutral', value: summary.neutral, icon: Minus, color: 'text-gray-600' },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                  <dd className="text-lg font-semibold text-gray-900">{stat.value}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}