'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserBills, type BillData } from '@/lib/billOCR';
import {
  getHeatPumpRecommendations,
  checkHeatPumpSuitability,
  type HeatPumpInput,
  type HeatPumpRecommendation
} from '@/lib/heatPumpService';
import { HeatPumpAffiliateDisclosure } from '@/components/AffiliateDisclosure';
import FeedbackButton from '@/components/UserFeedback';


export default function HeatPumpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [postcode, setPostcode] = useState<string>('SW1A 1AA');
  const [recommendation, setRecommendation] = useState<HeatPumpRecommendation | null>(null);
  
  // Form inputs
  const [insulation, setInsulation] = useState<string>('C');
  const [houseSizeM2, setHouseSizeM2] = useState<number>(100);
  const [radiatorType, setRadiatorType] = useState<string>('standard');
  const [propertyType, setPropertyType] = useState<string>('semi-detached');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const bills = await getUserBills('demo-user');
      const gasBill = bills.find(b => b.gasUsage && b.gasUsage.kwh > 0);
      const electricityBill = bills.find(b => b.electricityUsage && b.electricityUsage.kwh > 0);

      if (gasBill && electricityBill) {
        const input: HeatPumpInput = {
          postcode: gasBill.address?.split(',').pop()?.trim() || 'SW1A 1AA',
          annualGasUsageKwh: (gasBill.gasUsage?.kwh || 1000) * 12,
          homeInsulation: insulation as any,
          houseSizeM2: houseSizeM2,
          currentHeatingSystem: 'gas-boiler',
          gasRate: gasBill.gasUsage?.rate || 7.5,
          electricityRate: electricityBill.electricityUsage?.rate || 24.5,
          propertyType: propertyType as any,
          radiatorType: radiatorType as any
        };
        const rec = getHeatPumpRecommendations(input);
        setRecommendation(rec);
        setPostcode(input.postcode);
      } else {
        // Use demo data
        const input: HeatPumpInput = {
          postcode: 'SW1A 1AA',
          annualGasUsageKwh: 12000,
          homeInsulation: insulation as any,
          houseSizeM2: houseSizeM2,
          currentHeatingSystem: 'gas-boiler',
          gasRate: 7.5,
          electricityRate: 24.5,
          propertyType: propertyType as any,
          radiatorType: radiatorType as any
        };
        const rec = getHeatPumpRecommendations(input);
        setRecommendation(rec);
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
          Unable to generate heat pump recommendations. Please ensure you have valid gas and electricity bills uploaded.
        </p>
      </div>
    );
  }

  const selectedSystem = recommendation.comparison.heatPump;
  const boilerSystem = recommendation.comparison.gasBoiler;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => router.back()} className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-900 transition">
          ← Back
        </button>
        <h1 className="text-4xl font-bold mb-2">🔥 Heat Pump Recommendations</h1>
        <p className="text-gray-600">
          Compare heat pumps vs gas boilers based on your property, usage, and climate
        </p>
      </div>
      
      {/* Affiliate Disclosure */}
      <HeatPumpAffiliateDisclosure />

      {/* Suitability Score */}
      <div className={`border-2 rounded-lg p-6 mb-8 ${
        recommendation.suitabilityScore >= 70
          ? 'bg-green-50 border-green-300'
          : recommendation.suitabilityScore >= 50
          ? 'bg-yellow-50 border-yellow-300'
          : 'bg-red-50 border-red-300'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Suitability Score: {recommendation.suitabilityScore}/100
            </h2>
            <div className="space-y-1">
              {recommendation.recommendations.map((rec, idx) => (
                <p key={idx} className="text-gray-700">{rec}</p>
              ))}
            </div>
          </div>
          <div className="text-6xl">
            {recommendation.suitabilityScore >= 70 ? '✅' : recommendation.suitabilityScore >= 50 ? '⚠️' : '❌'}
          </div>
        </div>
      </div>

      {/* Key Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Heat Pump */}
        <div className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-300 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold">Heat Pump</h3>
            <span className="text-4xl">♨️</span>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600">Annual Running Cost</div>
              <div className="text-3xl font-bold text-blue-600">
                £{recommendation.annualHeatPumpCost.toLocaleString()}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Efficiency (SCOP)</div>
                <div className="font-bold">{recommendation.estimatedScop}x</div>
              </div>
              <div>
                <div className="text-gray-600">System Size</div>
                <div className="font-bold">{recommendation.recommendedSizeKw} kW</div>
              </div>
              <div>
                <div className="text-gray-600">CO2 Emissions</div>
                <div className="font-bold">{(selectedSystem.co2EmissionsKg / 1000).toFixed(1)}t/year</div>
              </div>
              <div>
                <div className="text-gray-600">Lifespan</div>
                <div className="font-bold">{selectedSystem.lifespanYears} years</div>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="text-sm text-gray-600 mb-1">Installation Cost</div>
              <div className="font-bold text-lg">
                £{recommendation.installationCost.toLocaleString()}
              </div>
              <div className="text-green-600 font-bold">
                £{recommendation.installationCostAfterGrant.toLocaleString()} after £7,500 grant
              </div>
            </div>
          </div>
        </div>

        {/* Gas Boiler */}
        <div className="bg-gradient-to-br from-gray-50 to-orange-50 border-2 border-gray-300 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold">Gas Boiler</h3>
            <span className="text-4xl">🔥</span>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600">Annual Running Cost</div>
              <div className="text-3xl font-bold text-orange-600">
                £{recommendation.annualBoilerCost.toLocaleString()}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Efficiency</div>
                <div className="font-bold">{boilerSystem.efficiency}%</div>
              </div>
              <div>
                <div className="text-gray-600">Maintenance</div>
                <div className="font-bold">£{boilerSystem.maintenanceCostAnnual}/year</div>
              </div>
              <div>
                <div className="text-gray-600">CO2 Emissions</div>
                <div className="font-bold">{(boilerSystem.co2EmissionsKg / 1000).toFixed(1)}t/year</div>
              </div>
              <div>
                <div className="text-gray-600">Lifespan</div>
                <div className="font-bold">{boilerSystem.lifespanYears} years</div>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="text-sm text-gray-600 mb-1">Replacement Cost</div>
              <div className="font-bold text-lg">
                £{(2500).toLocaleString()}
              </div>
              <div className="text-gray-500 text-sm">
                Plus annual servicing required
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Savings Summary */}
      <div className={`border rounded-lg p-6 mb-8 ${
        recommendation.annualSavings > 0
          ? 'bg-green-50 border-green-300'
          : 'bg-orange-50 border-orange-300'
      }`}>
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2">Annual Savings with Heat Pump</div>
          <div className={`text-4xl font-bold mb-2 ${
            recommendation.annualSavings > 0 ? 'text-green-600' : 'text-orange-600'
          }`}>
            {recommendation.annualSavings > 0 ? '+' : ''}£{recommendation.annualSavings.toLocaleString()}
          </div>
          <div className="text-gray-700 space-y-1">
            <div>Payback Period: <strong>{recommendation.paybackYears} years</strong></div>
            <div>20-Year Savings: <strong>£{recommendation.lifetimeSavings20Years.toLocaleString()}</strong></div>
            <div>CO2 Reduction: <strong>{(recommendation.co2ReductionKg / 1000).toFixed(1)} tonnes/year</strong></div>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {recommendation.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <h3 className="font-bold mb-2">⚠️ Important Considerations</h3>
          <ul className="space-y-1">
            {recommendation.warnings.map((warning, idx) => (
              <li key={idx} className="text-sm text-gray-700">{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Input Controls */}
      <div className="bg-gray-50 border rounded-lg p-6 mb-8">
        <h3 className="font-bold mb-4">🔧 Adjust Your Property Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Home Insulation (EPC Rating)
              <span className="text-xs text-gray-500 ml-2">affects efficiency</span>
            </label>
            <select
              value={insulation}
              onChange={(e) => setInsulation(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="A">A - Excellent (new build)</option>
              <option value="B">B - Good (well-insulated)</option>
              <option value="C">C - Average (standard)</option>
              <option value="D">D - Below average</option>
              <option value="E">E - Poor</option>
              <option value="F">F - Very poor</option>
              <option value="G">G - Extremely poor</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Property Type</label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="detached">Detached House</option>
              <option value="semi-detached">Semi-Detached House</option>
              <option value="terraced">Terraced House</option>
              <option value="flat">Flat/Apartment</option>
              <option value="bungalow">Bungalow</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Radiator Type</label>
            <select
              value={radiatorType}
              onChange={(e) => setRadiatorType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="standard">Standard Radiators</option>
              <option value="oversized">Oversized Radiators</option>
              <option value="underfloor">Underfloor Heating</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">House Size (m²)</label>
            <input
              type="number"
              value={houseSizeM2}
              onChange={(e) => setHouseSizeM2(Number(e.target.value))}
              className="w-full p-2 border rounded"
              min="40"
              max="300"
            />
          </div>
        </div>
        <button onClick={handleRecalculate} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Recalculate Recommendations
        </button>
      </div>

      {/* Pros and Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-green-600">✅ Pros</h3>
          <ul className="space-y-2">
            {recommendation.pros.map((pro, idx) => (
              <li key={idx} className="text-sm flex items-start">
                <span className="text-green-500 mr-2 mt-0.5">✓</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-red-600">⚠️ Cons</h3>
          <ul className="space-y-2">
            {recommendation.cons.map((con, idx) => (
              <li key={idx} className="text-sm flex items-start">
                <span className="text-red-500 mr-2 mt-0.5">✗</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Upgrade Recommendations */}
      {recommendation.upgrades.length > 0 && (
        <div className="bg-white border rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">🔨 Recommended Upgrades</h3>
          <div className="space-y-4">
            {recommendation.upgrades.map((upgrade, idx) => (
              <div
                key={idx}
                className={`border rounded-lg p-4 ${
                  upgrade.priority === 'essential'
                    ? 'border-red-300 bg-red-50'
                    : upgrade.priority === 'recommended'
                    ? 'border-yellow-300 bg-yellow-50'
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold">{upgrade.upgrade}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        upgrade.priority === 'essential'
                          ? 'bg-red-200 text-red-800'
                          : upgrade.priority === 'recommended'
                          ? 'bg-yellow-200 text-yellow-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}>
                        {upgrade.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{upgrade.benefit}</p>
                    {upgrade.savingsImpact > 0 && (
                      <div className="text-sm text-green-600">
                        Potential savings: £{upgrade.savingsImpact}/year
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm text-gray-600">Cost</div>
                    <div className="font-bold">£{upgrade.cost.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded">
            💡 <strong>Tip:</strong> Completing recommended upgrades before installation can significantly
            improve heat pump efficiency and reduce running costs.
          </div>
        </div>
      )}

      {/* How Heat Pumps Work */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border rounded-lg p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">🧠 How Heat Pumps Work (Simple Explanation)</h3>
        <div className="space-y-4 text-sm">
          <p>
            <strong>Think of it like a fridge in reverse:</strong> A heat pump extracts warmth from outside air
            (even when it's cold!) and pumps it inside your home. It's like magic, but it's actually just clever physics!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded">
              <div className="text-2xl mb-2">1️⃣</div>
              <strong>Extract Heat</strong>
              <p className="text-gray-600 mt-1">
                Outdoor unit absorbs heat from air, even at -10°C
              </p>
            </div>
            <div className="bg-white p-4 rounded">
              <div className="text-2xl mb-2">2️⃣</div>
              <strong>Amplify</strong>
              <p className="text-gray-600 mt-1">
                Compressor amplifies the heat (uses some electricity)
              </p>
            </div>
            <div className="bg-white p-4 rounded">
              <div className="text-2xl mb-2">3️⃣</div>
              <strong>Distribute</strong>
              <p className="text-gray-600 mt-1">
                Hot water flows through radiators/underfloor heating
              </p>
            </div>
          </div>
          
          <p>
            <strong>Why it's efficient:</strong> For every 1 unit of electricity used, you get {recommendation.estimatedScop} units
            of heat! Gas boilers only give 0.9 units per 1 unit of gas.
          </p>
          
          <p>
            <strong>Best for:</strong> Well-insulated homes, lower temperature heating (underfloor or large radiators),
            and people who want to reduce carbon emissions.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gray-50 border rounded-lg p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">❓ Frequently Asked Questions</h3>
        <div className="space-y-4">
          <details className="cursor-pointer">
            <summary className="font-bold">Will a heat pump work in my cold region?</summary>
            <p className="text-sm text-gray-600 mt-2">
              Yes! Modern heat pumps work efficiently down to -15°C and can operate down to -25°C.
              Your region's climate is factored into the efficiency (SCOP) calculation above.
            </p>
          </details>
          
          <details className="cursor-pointer">
            <summary className="font-bold">Do I need to upgrade my radiators?</summary>
            <p className="text-sm text-gray-600 mt-2">
              It depends. Heat pumps work best with lower water temperatures (40-50°C vs 60-80°C for boilers).
              Larger radiators or underfloor heating work best. Standard radiators may need upgrading if your
              insulation is poor.
            </p>
          </details>
          
          <details className="cursor-pointer">
            <summary className="font-bold">How noisy are heat pumps?</summary>
            <p className="text-sm text-gray-600 mt-2">
              Modern heat pumps are typically 40-60 decibels - similar to a fridge hum. They're much quieter
              than older models. Proper installation with vibration dampeners is important.
            </p>
          </details>
          
          <details className="cursor-pointer">
            <summary className="font-bold">What's the £7,500 government grant?</summary>
            <p className="text-sm text-gray-600 mt-2">
              The Boiler Upgrade Scheme (BUS) provides £7,500 off heat pump installation for eligible households
              in England and Wales. Your installer can apply on your behalf. Check gov.uk for current eligibility.
            </p>
          </details>
          
          <details className="cursor-pointer">
            <summary className="font-bold">Can heat pumps provide hot water?</summary>
            <p className="text-sm text-gray-600 mt-2">
              Yes! Heat pumps heat a hot water cylinder, similar to a traditional hot water tank.
              Modern cylinders are well-insulated and efficient. You'll have plenty of hot water for showers and baths.
            </p>
          </details>
          
          <details className="cursor-pointer">
            <summary className="font-bold">What if electricity prices stay high?</summary>
            <p className="text-sm text-gray-600 mt-2">
              This is factored into the calculations above. Even with current high electricity prices, heat pumps
              can be competitive due to their efficiency. Plus, you can pair with solar panels to reduce costs further.
            </p>
          </details>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">🚀 Next Steps</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li><strong>Get your EPC certificate</strong> - Check your current insulation rating (free from previous EPC or £60-£120 for new survey)</li>
          <li><strong>Request free quotes</strong> - Get 3 quotes from MCS-certified installers (we'll connect you)</li>
          <li><strong>Complete any essential upgrades</strong> - Insulation improvements can save £200+ per year</li>
          <li><strong>Apply for BUS grant</strong> - Your installer handles this, reducing cost by £7,500</li>
          <li><strong>Schedule installation</strong> - Typical installation takes 2-3 days</li>
          <li><strong>Enjoy lower bills</strong> - And massively reduced carbon emissions!</li>
        </ol>
        
        <div className="mt-6 flex gap-4">
          <button className="flex-1 bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition">
            Get Free Quotes →
          </button>
          <button className="flex-1 border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-50 transition">
            Check BUS Eligibility
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-gray-700">
        <strong>⚠️ Disclaimer:</strong> These recommendations are estimates based on typical UK conditions and your
        provided data. Actual performance, costs, and savings may vary significantly based on your specific property,
        usage patterns, installation quality, and energy prices. Heat pump suitability depends on many factors including
        insulation, heating system, and property type. Always get professional surveys and multiple quotes before making
        a decision. This tool does not constitute financial or technical advice. Grant availability and eligibility
        should be confirmed with official government sources.
      </div>
      
      {/* Feedback Button */}
      <FeedbackButton page="heat-pump" section="calculator" />
    </div>
  );
}
