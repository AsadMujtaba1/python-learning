'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserBills, type BillData } from '@/lib/billOCR';
import {
  getSolarRecommendations,
  generateSavingsProjection,
  compareSolarScenarios,
  type SolarInput,
  type SolarRecommendation,
  type SavingsProjection
} from '@/lib/solarService';
import FeedbackButton from '@/components/UserFeedback';


export default function SolarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [postcode, setPostcode] = useState<string>('SW1A 1AA');
  const [recommendation, setRecommendation] = useState<SolarRecommendation | null>(null);
  const [savingsProjection, setSavingsProjection] = useState<SavingsProjection[]>([]);
  const [selectedOption, setSelectedOption] = useState<'budget' | 'standard' | 'premium'>('standard');
  const [showBatteryProjection, setShowBatteryProjection] = useState(false);

  // Form inputs
  const [roofType, setRoofType] = useState<string>('south-facing');
  const [daytimeUsage, setDaytimeUsage] = useState<number>(40);
  const [roofSpace, setRoofSpace] = useState<number>(30);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Get bills from localStorage (saved by bill upload feature)
      const bills = await getUserBills('demo-user');
      const latestElectricityBill = bills.find(b => b.electricityUsage && b.electricityUsage.kwh > 0);

      if (latestElectricityBill) {
        // Use bill data
        const input: SolarInput = {
          postcode: latestElectricityBill.address?.split(',').pop()?.trim() || 'SW1A 1AA',
          roofType: roofType as any,
          annualElectricityUsage: (latestElectricityBill.electricityUsage?.kwh || 250) * 12, // Monthly to annual
          daytimeUsagePercentage: daytimeUsage,
          electricityRate: latestElectricityBill.electricityUsage?.rate || 24.5,
          feedInTariff: 5,
          roofSpaceM2: roofSpace
        };
        const rec = getSolarRecommendations(input);
        setRecommendation(rec);
        setPostcode(input.postcode);

        const projection = generateSavingsProjection(
          rec.options.standard.annualSavings,
          rec.options.standard.cost,
          false
        );
        setSavingsProjection(projection);
      } else {
        // Use demo data
        const input: SolarInput = {
          postcode: 'SW1A 1AA',
          roofType: roofType as any,
          annualElectricityUsage: 3000,
          daytimeUsagePercentage: daytimeUsage,
          electricityRate: 24.5,
          feedInTariff: 5,
          roofSpaceM2: roofSpace
        };
        const rec = getSolarRecommendations(input);
        setRecommendation(rec);

        const projection = generateSavingsProjection(
          rec.options.standard.annualSavings,
          rec.options.standard.cost,
          false
        );
        setSavingsProjection(projection);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleRecalculate = () => {
    loadUserData();
  };

  const handleOptionChange = (option: 'budget' | 'standard' | 'premium') => {
    setSelectedOption(option);
    if (recommendation) {
      const projection = generateSavingsProjection(
        recommendation.options[option].annualSavings,
        recommendation.options[option].cost,
        showBatteryProjection,
        showBatteryProjection ? recommendation.batteryRecommendation?.cost || 0 : 0
      );
      setSavingsProjection(projection);
    }
  };

  const toggleBatteryProjection = () => {
    const newShowBattery = !showBatteryProjection;
    setShowBatteryProjection(newShowBattery);
    
    if (recommendation) {
      const selectedRec = recommendation.options[selectedOption];
      const batteryCost = recommendation.batteryRecommendation?.cost || 0;
      const batteryAddedSavings = recommendation.batteryRecommendation?.additionalSavings || 0;
      
      const projection = generateSavingsProjection(
        selectedRec.annualSavings + (newShowBattery ? batteryAddedSavings : 0),
        selectedRec.cost,
        newShowBattery,
        newShowBattery ? batteryCost : 0
      );
      setSavingsProjection(projection);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">
          Unable to generate solar recommendations. Please ensure you have a valid electricity bill uploaded.
        </p>
      </div>
    );
  }

  const selectedRec = recommendation.options[selectedOption];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => router.back()} className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-900 transition">
          ← Back
        </button>
        <h1 className="text-4xl font-bold mb-2">☀️ Solar Panel Recommendations</h1>
        <p className="text-gray-600">
          Personalized solar system recommendations based on your location, usage, and roof type
        </p>
      </div>

      {/* Suitability Score */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Suitability Score: {recommendation.suitabilityScore}/100
            </h2>
            <p className="text-gray-700">
              {recommendation.suitabilityScore >= 70
                ? '✅ Excellent - Your property is ideal for solar panels'
                : recommendation.suitabilityScore >= 50
                ? '⚠️ Good - Solar panels are suitable with some considerations'
                : '❌ Fair - Consider improvements before installing solar'}
            </p>
          </div>
          <div className="text-6xl">
            {recommendation.suitabilityScore >= 70 ? '🌟' : recommendation.suitabilityScore >= 50 ? '☀️' : '⛅'}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Recommended Size</div>
          <div className="text-2xl font-bold">{recommendation.systemSizeKw} kW</div>
          <div className="text-xs text-gray-500">{recommendation.panelCount} panels</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Annual Generation</div>
          <div className="text-2xl font-bold">{recommendation.annualGenerationKwh.toLocaleString()} kWh</div>
          <div className="text-xs text-gray-500">~{Math.round(recommendation.annualGenerationKwh / 12)} kWh/month</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Annual Savings</div>
          <div className="text-2xl font-bold text-green-600">£{recommendation.annualSavings.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Payback: {recommendation.paybackYears} years</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">CO2 Reduction</div>
          <div className="text-2xl font-bold text-green-600">{(recommendation.co2ReductionKg / 1000).toFixed(1)}t</div>
          <div className="text-xs text-gray-500">per year</div>
        </div>
      </div>

      {/* Warnings */}
      {recommendation.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <h3 className="font-bold mb-2">⚠️ Important Considerations</h3>
          <ul className="list-disc list-inside space-y-1">
            {recommendation.warnings.map((warning, idx) => (
              <li key={idx} className="text-sm text-gray-700">{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Input Controls */}
      <div className="bg-gray-50 border rounded-lg p-6 mb-8">
        <h3 className="font-bold mb-4">🔧 Adjust Your Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Roof Type</label>
            <select
              value={roofType}
              onChange={(e) => setRoofType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="south-facing">South Facing (Best)</option>
              <option value="south-east">South East</option>
              <option value="south-west">South West</option>
              <option value="east-west">East-West Split</option>
              <option value="flat">Flat Roof</option>
              <option value="north-facing">North Facing</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Daytime Usage: {daytimeUsage}%
              <span className="text-xs text-gray-500 ml-2">(when solar generates)</span>
            </label>
            <input
              type="range"
              min="10"
              max="80"
              value={daytimeUsage}
              onChange={(e) => setDaytimeUsage(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Roof Space (m²)</label>
            <input
              type="number"
              value={roofSpace}
              onChange={(e) => setRoofSpace(Number(e.target.value))}
              className="w-full p-2 border rounded"
              min="10"
              max="100"
            />
          </div>
        </div>
        <button onClick={handleRecalculate} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Recalculate Recommendations
        </button>
      </div>

      {/* System Options */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">💰 System Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Budget Option */}
          <div
            onClick={() => handleOptionChange('budget')}
            className={`border-2 rounded-lg p-6 cursor-pointer transition ${
              selectedOption === 'budget'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold">Budget</h3>
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-3xl font-bold mb-2">£{recommendation.options.budget.cost.toLocaleString()}</div>
            <div className="text-sm space-y-1 mb-4">
              <div>✓ {recommendation.options.budget.panelType}</div>
              <div>✓ {recommendation.options.budget.efficiency} efficiency</div>
              <div>✓ {recommendation.options.budget.warranty}</div>
              <div className="text-green-600 font-bold">
                £{recommendation.options.budget.annualSavings}/year
              </div>
              <div className="text-gray-600">
                Payback: {recommendation.options.budget.paybackYears} years
              </div>
            </div>
          </div>

          {/* Standard Option */}
          <div
            onClick={() => handleOptionChange('standard')}
            className={`border-2 rounded-lg p-6 cursor-pointer transition ${
              selectedOption === 'standard'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold">Standard</h3>
              <span className="text-2xl">⭐</span>
            </div>
            <div className="text-3xl font-bold mb-2">£{recommendation.options.standard.cost.toLocaleString()}</div>
            <div className="text-sm space-y-1 mb-4">
              <div>✓ {recommendation.options.standard.panelType}</div>
              <div>✓ {recommendation.options.standard.efficiency} efficiency</div>
              <div>✓ {recommendation.options.standard.warranty}</div>
              <div className="text-green-600 font-bold">
                £{recommendation.options.standard.annualSavings}/year
              </div>
              <div className="text-gray-600">
                Payback: {recommendation.options.standard.paybackYears} years
              </div>
            </div>
            <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded inline-block">
              RECOMMENDED
            </div>
          </div>

          {/* Premium Option */}
          <div
            onClick={() => handleOptionChange('premium')}
            className={`border-2 rounded-lg p-6 cursor-pointer transition ${
              selectedOption === 'premium'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold">Premium</h3>
              <span className="text-2xl">🏆</span>
            </div>
            <div className="text-3xl font-bold mb-2">£{recommendation.options.premium.cost.toLocaleString()}</div>
            <div className="text-sm space-y-1 mb-4">
              <div>✓ {recommendation.options.premium.panelType}</div>
              <div>✓ {recommendation.options.premium.efficiency} efficiency</div>
              <div>✓ {recommendation.options.premium.warranty}</div>
              <div className="text-green-600 font-bold">
                £{recommendation.options.premium.annualSavings}/year
              </div>
              <div className="text-gray-600">
                Payback: {recommendation.options.premium.paybackYears} years
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected System Details */}
      <div className="bg-white border rounded-lg p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">
          {selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1)} System Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold mb-2">✨ Features</h4>
            <ul className="space-y-1">
              {selectedRec.features.map((feature, idx) => (
                <li key={idx} className="text-sm flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-2">📊 Performance</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Self-Consumption:</span>
                <span className="font-bold">{recommendation.selfConsumptionKwh.toLocaleString()} kWh/year</span>
              </div>
              <div className="flex justify-between">
                <span>Export to Grid:</span>
                <span className="font-bold">{recommendation.exportKwh.toLocaleString()} kWh/year</span>
              </div>
              <div className="flex justify-between">
                <span>Export Income:</span>
                <span className="font-bold text-green-600">£{recommendation.exportIncome}/year</span>
              </div>
              <div className="flex justify-between">
                <span>25-Year Savings:</span>
                <span className="font-bold text-green-600">£{recommendation.lifetimeSavings25Years.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>ROI:</span>
                <span className="font-bold text-green-600">{recommendation.roiPercentage}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Battery Recommendation */}
      {recommendation.batteryRecommendation?.recommended && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">🔋 Battery Storage Recommended</h3>
              <p className="text-gray-700 mb-4">{recommendation.batteryRecommendation.reason}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Size</div>
                  <div className="font-bold">{recommendation.batteryRecommendation.sizeKwh} kWh</div>
                </div>
                <div>
                  <div className="text-gray-600">Cost</div>
                  <div className="font-bold">£{recommendation.batteryRecommendation.cost.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-600">Extra Savings</div>
                  <div className="font-bold text-green-600">
                    £{Math.round(recommendation.batteryRecommendation.additionalSavings)}/year
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Payback</div>
                  <div className="font-bold">{recommendation.batteryRecommendation.paybackYears} years</div>
                </div>
              </div>
            </div>
            <div>
              <button
                onClick={toggleBatteryProjection}
                className={`px-4 py-2 rounded-lg transition ${
                  showBatteryProjection 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {showBatteryProjection ? '✓ Included' : 'Add Battery'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Savings Graph */}
      <div className="bg-white border rounded-lg p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">📈 25-Year Savings Projection</h3>
        <div className="relative h-64 mb-4">
          <svg width="100%" height="100%" viewBox="0 0 800 250" className="border-l border-b">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4, 5].map(i => (
              <line
                key={i}
                x1="0"
                y1={50 * i}
                x2="800"
                y2={50 * i}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}
            
            {/* Y-axis labels */}
            {savingsProjection.length > 0 && (
              <>
                {[0, 1, 2, 3, 4, 5].map(i => {
                  const maxSavings = Math.max(...savingsProjection.map(p => p.cumulativeSavings));
                  const value = Math.round((maxSavings / 5) * (5 - i) / 1000) * 1000;
                  return (
                    <text
                      key={i}
                      x="-5"
                      y={50 * i + 5}
                      fontSize="10"
                      textAnchor="end"
                      fill="#6b7280"
                    >
                      £{value.toLocaleString()}
                    </text>
                  );
                })}
              </>
            )}
            
            {/* Savings line */}
            {savingsProjection.length > 0 && (
              <polyline
                points={savingsProjection
                  .filter((_, i) => i % 2 === 0) // Every other year for clarity
                  .map((proj, i) => {
                    const x = (i * 800) / 12.5;
                    const maxSavings = Math.max(...savingsProjection.map(p => p.cumulativeSavings));
                    const minSavings = Math.min(...savingsProjection.map(p => p.cumulativeSavings));
                    const y = 250 - ((proj.cumulativeSavings - minSavings) / (maxSavings - minSavings)) * 240;
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
              />
            )}
            
            {/* Break-even point */}
            {savingsProjection.length > 0 && (
              <>
                {(() => {
                  const breakEvenIndex = savingsProjection.findIndex(p => p.cumulativeSavings >= 0);
                  if (breakEvenIndex > 0) {
                    const x = (breakEvenIndex * 800) / 25;
                    return (
                      <>
                        <line x1={x} y1="0" x2={x} y2="250" stroke="#10b981" strokeWidth="2" strokeDasharray="5,5" />
                        <text x={x + 5} y="20" fontSize="12" fill="#10b981" fontWeight="bold">
                          Break-even
                        </text>
                      </>
                    );
                  }
                  return null;
                })()}
              </>
            )}
          </svg>
        </div>
        <div className="text-center text-sm text-gray-600">
          Assumes 0.5% annual panel degradation and 3% annual electricity price increase
        </div>
      </div>

      {/* Installers */}
      <div className="bg-white border rounded-lg p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">🔧 Recommended Installers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {selectedRec.affiliatePartners.map((partner, idx) => (
            <div key={idx} className="border rounded-lg p-4 hover:border-blue-300 transition">
              <h4 className="font-bold mb-2">{partner.name}</h4>
              <div className="flex items-center mb-2">
                <span className="text-yellow-500">{'★'.repeat(Math.floor(partner.rating))}</span>
                <span className="text-gray-400">{'★'.repeat(5 - Math.floor(partner.rating))}</span>
                <span className="text-sm text-gray-600 ml-2">
                  ({partner.reviewCount.toLocaleString()})
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{partner.description}</p>
              <div className="text-xs text-gray-500 mb-3">
                Install time: {partner.averageInstallTime}
              </div>
              <button className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg transition">
                Get Quote →
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-500 bg-blue-50 p-3 rounded">
          💡 <strong>Note:</strong> We may earn a commission from installer referrals at no extra cost to you.
          Always get multiple quotes before deciding.
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gray-50 border rounded-lg p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">❓ Frequently Asked Questions</h3>
        <div className="space-y-4">
          <details className="cursor-pointer">
            <summary className="font-bold">How accurate are these estimates?</summary>
            <p className="text-sm text-gray-600 mt-2">
              Our calculations use UK regional sunlight data and industry-standard assumptions.
              Actual performance may vary by ±10% based on shading, panel angle, and weather conditions.
            </p>
          </details>
          <details className="cursor-pointer">
            <summary className="font-bold">Do I need planning permission?</summary>
            <p className="text-sm text-gray-600 mt-2">
              Most residential solar installations are permitted development and don't need planning permission.
              Exceptions include listed buildings, conservation areas, or if panels extend significantly above the roof line.
            </p>
          </details>
          <details className="cursor-pointer">
            <summary className="font-bold">What maintenance do solar panels need?</summary>
            <p className="text-sm text-gray-600 mt-2">
              Solar panels require minimal maintenance. Rain typically keeps them clean, but occasional cleaning
              (1-2 times/year) and annual inspections are recommended. Most systems come with 25-year warranties.
            </p>
          </details>
          <details className="cursor-pointer">
            <summary className="font-bold">What happens on cloudy days?</summary>
            <p className="text-sm text-gray-600 mt-2">
              Solar panels still generate electricity on cloudy days, typically 10-25% of their peak output.
              The estimates include UK's typical weather patterns with cloudy days factored in.
            </p>
          </details>
          <details className="cursor-pointer">
            <summary className="font-bold">Can I add a battery later?</summary>
            <p className="text-sm text-gray-600 mt-2">
              Yes! Most modern inverters are "battery-ready" and can be upgraded later. However, installing
              panels and battery together typically saves on installation costs.
            </p>
          </details>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-gray-700">
        <strong>⚠️ Disclaimer:</strong> These recommendations are estimates based on typical UK conditions and your
        provided data. Actual performance, costs, and savings may vary. Always get professional surveys and multiple
        quotes before making a decision. Solar panel performance depends on many factors including shading, orientation,
        weather, and equipment quality. This tool does not constitute financial advice.
      </div>
      
      {/* Feedback Button */}
      <FeedbackButton page="solar" section="calculator" />
    </div>
  );
}
