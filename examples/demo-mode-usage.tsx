/**
 * Example: How to Use DashboardShell with Demo Mode
 * 
 * This file demonstrates how to integrate demo mode into your dashboard page.
 * Copy and adapt this pattern to your actual dashboard implementation.
 */

'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';

export default function DashboardPage() {
  const [demoMode, setDemoMode] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  // Check if user has uploaded data
  useEffect(() => {
    const checkUserData = async () => {
      try {
        // Example: Check localStorage, API, or database for user data
        const storedData = localStorage.getItem('userEnergyData');
        
        if (storedData) {
          const parsed = JSON.parse(storedData);
          setUserData(parsed);
          setDemoMode(false); // Exit demo mode
        }
      } catch (error) {
        console.error('Error checking user data:', error);
      }
    };

    checkUserData();
  }, []);

  // Simulate user uploading data (triggered by bill upload, meter reading, etc.)
  const handleDataUpload = (newData: any) => {
    // Save to storage
    localStorage.setItem('userEnergyData', JSON.stringify(newData));
    
    // Update state
    setUserData(newData);
    setDemoMode(false); // Exit demo mode with fade transition
  };

  return (
    <DashboardShell
      postcode="SW1A 1AA" // User's postcode or default
      region="London" // User's region or default
      demoMode={demoMode}
      userData={userData ? {
        wholesaleTrend: userData.wholesaleCosts,
        usageBenchmark: {
          actualUsage: userData.usage,
          breakdown: userData.usageBreakdown,
        },
        standingCharge: {
          currentSupplier: userData.supplier,
          electricityCharge: userData.electricityCharge,
          gasCharge: userData.gasCharge,
        },
        tariffDuration: {
          currentTariff: userData.tariffName,
          currentRate: userData.rate,
          expiryDate: userData.tariffExpiry,
          daysLeft: userData.daysLeft,
        },
        weatherForecast: userData.weatherData,
        demandForecast: userData.demandData,
        priceCapForecast: userData.priceCapData,
      } : undefined}
    />
  );
}

/**
 * Example: Trigger Demo to Personalized Transition
 * 
 * When user uploads a bill or adds meter readings:
 */
function ExampleBillUploadComponent() {
  const handleBillUpload = async (billFile: File) => {
    // Process bill
    const extractedData = await processBill(billFile);
    
    // Trigger demo mode exit by updating parent state
    // This will cause smooth fade transition in DashboardShell
    updateUserData(extractedData);
  };

  return (
    <div>
      <button onClick={() => handleBillUpload(/* file */)}>
        Upload Bill
      </button>
    </div>
  );
}

// Mock functions for example
async function processBill(file: File) { return {}; }
function updateUserData(data: any) {}
