/**
 * UKRegionalCostMap Component
 * 
 * Interactive UK map showing regional energy costs with color-coded heatmap.
 * Highlights user's region and provides comparative context.
 * 
 * @module components/charts/UKRegionalCostMap
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import DataSourceBadge from '@/components/dashboard/DataSourceBadge';
import { MapPin, TrendingDown, TrendingUp } from 'lucide-react';

// UK Regional data with approximate daily costs
const regionalData = [
  { id: 'scotland', name: 'Scotland', cost: 4.12, households: '2.5M' },
  { id: 'north-east', name: 'North East', cost: 3.95, households: '1.2M' },
  { id: 'north-west', name: 'North West', cost: 4.18, households: '3.2M' },
  { id: 'yorkshire', name: 'Yorkshire', cost: 4.05, households: '2.4M' },
  { id: 'wales', name: 'Wales', cost: 4.25, households: '1.4M' },
  { id: 'west-midlands', name: 'West Midlands', cost: 4.15, households: '2.6M' },
  { id: 'east-midlands', name: 'East Midlands', cost: 4.08, households: '2.1M' },
  { id: 'east', name: 'East of England', cost: 4.35, households: '2.8M' },
  { id: 'south-west', name: 'South West', cost: 4.42, households: '2.5M' },
  { id: 'south-east', name: 'South East', cost: 4.55, households: '4.0M' },
  { id: 'london', name: 'London', cost: 4.68, households: '3.7M' },
  { id: 'northern-ireland', name: 'Northern Ireland', cost: 3.88, households: '0.8M' },
];

interface UKRegionalCostMapProps {
  userRegion?: string;
  userCost?: number;
  className?: string;
}

export default function UKRegionalCostMap({
  userRegion = 'west-midlands',
  userCost = 3.85,
  className = '',
}: UKRegionalCostMapProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>(userRegion);

  // Calculate min/max for color scaling
  const costs = regionalData.map(r => r.cost);
  const minCost = Math.min(...costs);
  const maxCost = Math.max(...costs);
  const avgCost = costs.reduce((a, b) => a + b, 0) / costs.length;
  
  // Get color based on cost (green=cheap, red=expensive)
  const getCostColor = (cost: number, isUserRegion: boolean = false) => {
    if (isUserRegion) return '#3b82f6'; // Blue for user
    
    const normalizedCost = (cost - minCost) / (maxCost - minCost);
    if (normalizedCost < 0.25) return '#22c55e'; // Green
    if (normalizedCost < 0.5) return '#eab308'; // Yellow
    if (normalizedCost < 0.75) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  // Sort data by cost for better visualization
  const sortedRegionalData = [...regionalData].sort((a, b) => a.cost - b.cost);

  // Calculate user's position
  const userRegionData = regionalData.find(r => r.id === userRegion);
  const cheaperThan = regionalData.filter(r => r.cost > userCost).length;
  const percentile = Math.round((cheaperThan / regionalData.length) * 100);

  const selectedData = regionalData.find(r => r.id === selectedRegion) || userRegionData;

  return (
    <Card className={`shadow-lg ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">UK Regional Energy Costs</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Compare daily costs across regions
              </p>
            </div>
          </div>
          <DataSourceBadge source="regional" size="md" />
        </div>
      </CardHeader>
      <CardContent>
        {/* User Status Banner */}
        {userRegionData && (
          <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-300 dark:border-blue-700"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">You're in <span className="font-semibold">{userRegionData.name}</span></p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                          £{userCost.toFixed(2)}<span className="text-xs font-normal text-gray-500">/day</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-semibold ${
                          percentile > 50 
                            ? 'bg-green-500/20 text-green-700 dark:text-green-300' 
                            : 'bg-orange-500/20 text-orange-700 dark:text-orange-300'
                        }`}>
                          {percentile > 50 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                          {percentile > 50 ? `Cheaper than ${percentile}%` : `More expensive than ${100-percentile}%`}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="flex flex-col lg:flex-row gap-4">
                  {/* UK Map SVG Visualization */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-2 flex-1 min-w-0">
                    <div className="relative w-full h-[340px] sm:h-[400px] md:h-[480px] lg:h-[520px]">
                      <svg viewBox="0 0 400 600" className="w-full h-full">
                        {/* Region paths with labels and cost values */}
                        {regionalData.map((region, idx) => {
                          const isUser = region.id === userRegion;
                          const isSelected = region.id === selectedRegion;
                          const color = getCostColor(region.cost, isUser);
                          const labelPos = [
                            // Scotland
                            [200, 60],
                            // North East
                            [245, 160],
                            // North West
                            [170, 180],
                            // Yorkshire
                            [230, 230],
                            // Wales
                            [120, 260],
                            // West Midlands
                            [170, 270],
                            // East Midlands
                            [230, 320],
                            // East
                            [250, 380],
                            // South West
                            [120, 370],
                            // South East
                            [170, 400],
                            // London
                            [180, 440],
                            // Northern Ireland
                            [100, 160],
                          ];
                          // SVG path data for each region
                          const paths = [
                            // Scotland
                            "M 180 40 L 220 30 L 250 50 L 260 80 L 250 110 L 220 125 L 190 120 L 170 100 L 165 70 Z",
                            // North East
                            "M 220 135 L 260 130 L 270 160 L 260 190 L 230 200 L 210 185 L 215 155 Z",
                            // North West
                            "M 145 150 L 200 145 L 210 180 L 200 210 L 165 220 L 140 205 L 138 175 Z",
                            // Yorkshire
                            "M 210 195 L 255 195 L 265 225 L 255 255 L 220 265 L 200 250 L 205 220 Z",
                            // Wales
                            "M 110 225 L 145 220 L 155 250 L 145 285 L 115 300 L 90 285 L 95 255 Z",
                            // West Midlands
                            "M 155 235 L 195 235 L 205 265 L 195 295 L 165 305 L 145 290 L 150 260 Z",
                            // East Midlands
                            "M 205 270 L 250 270 L 260 300 L 250 330 L 215 340 L 195 325 L 200 295 Z",
                            // East
                            "M 215 345 L 270 345 L 285 380 L 275 415 L 240 425 L 210 410 L 212 375 Z",
                            // South West
                            "M 90 310 L 145 305 L 160 340 L 150 385 L 115 410 L 80 395 L 75 355 Z",
                            // South East
                            "M 165 350 L 205 350 L 215 395 L 200 440 L 160 455 L 125 435 L 130 395 Z",
                            // London
                            "M 170 400 L 200 400 L 205 425 L 195 450 L 170 455 L 150 445 L 155 420 Z",
                            // Northern Ireland
                            "M 80 140 L 115 135 L 130 155 L 125 180 L 100 190 L 75 180 L 70 160 Z",
                          ];
                          return (
                            <g key={region.id}>
                              <motion.path
                                d={paths[idx]}
                                fill={color}
                                stroke={isSelected ? '#1e40af' : '#9ca3af'}
                                strokeWidth={isSelected ? 4 : 1}
                                className="cursor-pointer transition-all duration-200 hover:opacity-80"
                                onClick={() => setSelectedRegion(region.id)}
                                whileHover={{ scale: 1.03 }}
                                style={{ filter: isSelected ? 'drop-shadow(0 0 8px #1e40af)' : undefined }}
                              />
                              {/* Region label */}
                              <text x={labelPos[idx][0]} y={labelPos[idx][1]} textAnchor="middle" fontSize={isSelected ? 16 : 13} fontWeight={isSelected ? 700 : 500} fill={isSelected ? '#1e40af' : '#374151'} pointerEvents="none">
                                {region.name}
                              </text>
                              {/* Cost value */}
                              <text x={labelPos[idx][0]} y={labelPos[idx][1] + 18} textAnchor="middle" fontSize={isSelected ? 15 : 12} fontWeight={isSelected ? 700 : 500} fill={isSelected ? '#1e40af' : '#374151'} pointerEvents="none">
                                £{region.cost.toFixed(2)}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                      {/* Compact legend below map */}
                      <div className="absolute left-0 right-0 bottom-2 flex flex-wrap justify-center gap-3 text-xs">
                        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: '#22c55e' }}></span> Cheapest</div>
                        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: '#eab308' }}></span> Moderate</div>
                        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: '#f97316' }}></span> Above Avg</div>
                        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }}></span> Expensive</div>
                        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border-2 border-blue-700" style={{ backgroundColor: '#3b82f6' }}></span> Your Region</div>
                      </div>
                    </div>
                  </div>
                  {/* Details panel for selected region */}
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {selectedData?.name || 'Select a region'}
                    </h3>
                    {selectedData && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Average Daily Cost</span>
                          <span className="text-base font-bold text-gray-900 dark:text-white">£{selectedData.cost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Monthly Estimate</span>
                          <span className="text-base font-bold text-gray-900 dark:text-white">£{(selectedData.cost * 30).toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Annual Estimate</span>
                          <span className="text-base font-bold text-gray-900 dark:text-white">£{(selectedData.cost * 365).toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Households</span>
                          <span className="text-base font-bold text-gray-900 dark:text-white">{selectedData.households}</span>
                        </div>
                        {userCost && selectedData.id !== userRegion && (
                          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <p className="text-xs text-gray-700 dark:text-gray-300">
                              <span className="font-semibold">Your cost:</span> £{userCost.toFixed(2)}/day
                            </p>
                            <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                              <span className="font-semibold">Difference:</span>{' '}
                              <span className={userCost < selectedData.cost ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                {userCost < selectedData.cost ? '↓' : '↑'} £{Math.abs(selectedData.cost - userCost).toFixed(2)}/day
                                ({userCost < selectedData.cost ? 'Saving' : 'Extra'} £{Math.abs((selectedData.cost - userCost) * 365).toFixed(0)}/year)
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
}
