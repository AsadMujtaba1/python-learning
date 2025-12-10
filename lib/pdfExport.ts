/**
 * PDF EXPORT UTILITY
 * 
 * Generate PDF reports of user dashboard data
 * Premium feature only
 * 
 * @module lib/pdfExport
 */

import { CostTracker } from './smartStorage';

interface DashboardData {
  userName: string;
  postcode: string;
  homeType: string;
  occupants: number;
  dailyCost: number;
  monthlyCost: number;
  annualCost: number;
  weeklyData: Array<{ day: string; cost: number }>;
  regionalAverage: number;
  nationalAverage: number;
  efficiencyScore: number;
}

/**
 * Generate PDF report (client-side using jsPDF - to be installed)
 * For now, this creates a formatted HTML version that can be printed
 */
export async function generatePDFReport(data: DashboardData): Promise<void> {
  // Create a new window with printable content
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    throw new Error('Please allow popups to download PDF');
  }

  const html = generateReportHTML(data);
  
  printWindow.document.write(html);
  printWindow.document.close();
  
  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    printWindow.print();
  };
}

/**
 * Generate HTML for PDF report
 */
function generateReportHTML(data: DashboardData): string {
  const date = new Date().toLocaleDateString('en-GB');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Energy Cost Report - ${data.userName}</title>
      <style>
        @media print {
          body { margin: 0; padding: 20mm; }
          .no-print { display: none; }
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 210mm;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #3B82F6;
          padding-bottom: 20px;
        }
        
        .header h1 {
          margin: 0;
          font-size: 32px;
          color: #1E40AF;
        }
        
        .header p {
          margin: 5px 0;
          color: #666;
        }
        
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        
        .section h2 {
          font-size: 20px;
          color: #1E40AF;
          border-bottom: 2px solid #E5E7EB;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .info-item {
          padding: 15px;
          background: #F3F4F6;
          border-radius: 8px;
        }
        
        .info-item label {
          display: block;
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 5px;
        }
        
        .info-item value {
          display: block;
          font-size: 24px;
          font-weight: bold;
          color: #1F2937;
        }
        
        .metric-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin: 20px 0;
        }
        
        .metric-box {
          text-align: center;
          padding: 20px;
          background: #EFF6FF;
          border-radius: 8px;
          border: 2px solid #DBEAFE;
        }
        
        .metric-box .value {
          font-size: 28px;
          font-weight: bold;
          color: #1E40AF;
          display: block;
        }
        
        .metric-box .label {
          font-size: 14px;
          color: #666;
          margin-top: 5px;
        }
        
        .comparison-bar {
          margin: 20px 0;
        }
        
        .bar {
          height: 40px;
          background: #10B981;
          border-radius: 4px;
          position: relative;
          margin: 10px 0;
        }
        
        .bar.average {
          background: #F59E0B;
        }
        
        .bar-label {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: white;
          font-weight: bold;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #E5E7EB;
        }
        
        th {
          background: #F3F4F6;
          font-weight: bold;
          color: #1F2937;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #E5E7EB;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        
        .efficiency-badge {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 18px;
        }
        
        .efficiency-excellent { background: #D1FAE5; color: #065F46; }
        .efficiency-good { background: #FEF3C7; color: #92400E; }
        .efficiency-poor { background: #FEE2E2; color: #991B1B; }
        
        .no-print {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #3B82F6;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          border: none;
          font-size: 16px;
        }
        
        .no-print:hover {
          background: #2563EB;
        }
      </style>
    </head>
    <body>
      <button class="no-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
      
      <div class="header">
        <h1>💰 Energy Cost Report</h1>
        <p><strong>${data.userName}</strong> • Generated ${date}</p>
        <p>${data.postcode}</p>
      </div>
      
      <div class="section">
        <h2>📋 Property Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>Home Type</label>
            <value>${data.homeType}</value>
          </div>
          <div class="info-item">
            <label>Occupants</label>
            <value>${data.occupants}</value>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2>💷 Cost Summary</h2>
        <div class="metric-grid">
          <div class="metric-box">
            <span class="value">£${data.dailyCost.toFixed(2)}</span>
            <span class="label">Daily Cost</span>
          </div>
          <div class="metric-box">
            <span class="value">£${data.monthlyCost.toFixed(2)}</span>
            <span class="label">Monthly Cost</span>
          </div>
          <div class="metric-box">
            <span class="value">£${data.annualCost.toFixed(2)}</span>
            <span class="label">Annual Cost</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2>📊 Efficiency Rating</h2>
        <div style="text-align: center; margin: 20px 0;">
          <span class="efficiency-badge ${
            data.efficiencyScore >= 80 ? 'efficiency-excellent' :
            data.efficiencyScore >= 60 ? 'efficiency-good' : 'efficiency-poor'
          }">
            ${data.efficiencyScore}/100
          </span>
          <p style="margin-top: 10px; color: #666;">
            ${
              data.efficiencyScore >= 80 ? 'Excellent - You\'re doing great!' :
              data.efficiencyScore >= 60 ? 'Good - Room for improvement' :
              'Needs Attention - Significant savings possible'
            }
          </p>
        </div>
      </div>
      
      <div class="section">
        <h2>🎯 Comparison with Averages</h2>
        <div class="comparison-bar">
          <p><strong>Your Daily Cost</strong></p>
          <div class="bar" style="width: ${(data.dailyCost / 10) * 100}%;">
            <span class="bar-label">£${data.dailyCost.toFixed(2)}</span>
          </div>
        </div>
        <div class="comparison-bar">
          <p><strong>Regional Average</strong></p>
          <div class="bar average" style="width: ${(data.regionalAverage / 10) * 100}%;">
            <span class="bar-label">£${data.regionalAverage.toFixed(2)}</span>
          </div>
        </div>
        <div class="comparison-bar">
          <p><strong>National Average</strong></p>
          <div class="bar average" style="width: ${(data.nationalAverage / 10) * 100}%;">
            <span class="bar-label">£${data.nationalAverage.toFixed(2)}</span>
          </div>
        </div>
        
        ${data.dailyCost < data.regionalAverage ? `
          <p style="color: #10B981; font-weight: bold; margin-top: 15px;">
            ✓ You're saving £${((data.regionalAverage - data.dailyCost) * 365).toFixed(2)}/year compared to regional average!
          </p>
        ` : `
          <p style="color: #EF4444; font-weight: bold; margin-top: 15px;">
            ⚠️ You could save £${((data.dailyCost - data.regionalAverage) * 365).toFixed(2)}/year by reaching regional average
          </p>
        `}
      </div>
      
      <div class="section">
        <h2>📈 Weekly Cost History</h2>
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Cost</th>
              <th>vs. Average</th>
            </tr>
          </thead>
          <tbody>
            ${data.weeklyData.map(item => `
              <tr>
                <td>${item.day}</td>
                <td>£${item.cost.toFixed(2)}</td>
                <td style="color: ${item.cost < data.dailyCost ? '#10B981' : '#EF4444'}">
                  ${item.cost < data.dailyCost ? '↓' : '↑'} 
                  £${Math.abs(item.cost - data.dailyCost).toFixed(2)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="footer">
        <p><strong>Cost Saver</strong> • Helping UK households save money on energy</p>
        <p>Report generated on ${date} • Data is based on your tracked usage</p>
        <p style="margin-top: 10px;">
          <em>This report is for informational purposes. Actual costs may vary.</em>
        </p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Export data as CSV (alternative to PDF)
 */
export function exportAsCSV(): void {
  const costs = CostTracker.getRecentCosts(365);
  
  let csv = 'Date,Cost (£)\n';
  costs.forEach(entry => {
    csv += `${entry.date},${entry.cost.toFixed(2)}\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `energy-costs-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
