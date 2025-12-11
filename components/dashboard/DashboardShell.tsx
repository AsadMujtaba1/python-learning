/**
 * DashboardShell Component
 * 
 * Modern responsive dashboard layout with 2-column desktop view and mobile tabs.
 * Provides placeholder sections for all dashboard content areas.
 * 
 * @module components/dashboard/DashboardShell
 */

'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Zap, 
  DollarSign, 
  Activity,
  BarChart3,
  LineChart,
  Settings,
  Calendar,
  Lightbulb,
  Target,
  Cloud,
  Users,
  PieChart,
  ClipboardList,
  Sparkles,
  ArrowUpDown,
  Bell
} from 'lucide-react';

// Import all chart components
import WholesalePriceTrendChart from '@/components/charts/WholesalePriceTrendChart';
import HouseholdUsageBenchmarkChart from '@/components/charts/HouseholdUsageBenchmarkChart';
import StandingChargeComparisonChart from '@/components/charts/StandingChargeComparisonChart';
import TariffDurationChart from '@/components/charts/TariffDurationChart';
import WeatherImpactChart from '@/components/charts/WeatherImpactChart';
import DemandSpikeForecastChart from '@/components/charts/DemandSpikeForecastChart';
import PriceCapForecastChart from '@/components/charts/PriceCapForecastChart';
import { useBenchmarkData } from '@/hooks/useBenchmarkData';
import InsightCard from '@/components/dashboard/InsightCard';
import DemoModeBadge, { DemoModeBanner } from '@/components/dashboard/DemoModeBadge';
import { StatCardSkeleton, ChartSkeleton, InsightCardSkeleton, SidebarSkeleton, GreetingSkeleton } from '@/components/dashboard/SkeletonLoaders';
import ChartErrorBoundary from '@/components/dashboard/ChartErrorBoundary';
import { SkipToContent, getChartAriaProps, useReducedMotion } from '@/lib/accessibility';
import { DASHBOARD_CONFIG } from '@/config/dashboard.config';
import { toastDemoMode } from '@/lib/toastUtils';
import DataSourceBadge, { MultiSourceBadge } from '@/components/dashboard/DataSourceBadge';
import CostComparisonHero from '@/components/dashboard/CostComparisonHero';
import SmartRecommendationsCard from '@/components/dashboard/SmartRecommendationsCard';
import UKRegionalCostMap from '@/components/charts/UKRegionalCostMap';
import MissingDataNotice from '@/components/dashboard/MissingDataNotice';
// Animation variant for fadeInUp
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};
import DashboardSummary from '@/components/dashboard/DashboardSummary';

interface DashboardShellProps {
  greeting?: ReactNode;
  quickStats?: ReactNode;
  featuredChart?: ReactNode;
  comparisonCharts?: ReactNode;
  tariffInsights?: ReactNode;
  forecast?: ReactNode;
  insights?: ReactNode;
  toolsActions?: ReactNode;
  sidebar?: ReactNode;
  children?: ReactNode;
  postcode?: string;
  region?: string;
  demoMode?: boolean;
  userData?: {
    wholesaleTrend?: any[];
    usageBenchmark?: any;
    standingCharge?: any;
    tariffDuration?: any;
    weatherForecast?: any;
    demandForecast?: any[];
    priceCapForecast?: any;
  };

}

export default function DashboardShell(props: DashboardShellProps) {

    const hasUserData = !!props.userData && Object.keys(props.userData).length > 0;
    // Track previous demoMode value
    const [showContent, setShowContent] = useState(true);
    const previousDemoModeRef = useRef<boolean | undefined>(undefined);

    const {
        greeting,
        quickStats,
        featuredChart,
        comparisonCharts,
        tariffInsights,
        forecast,
        insights,
        toolsActions,
        sidebar,
        children,
        postcode,
        region,
        demoMode,
        userData
    } = props;

    // Add useBenchmarkData hook to get benchmarkData and loading variable
    const { data: benchmarkData, loading } = useBenchmarkData(postcode, region);

  // ...existing code...
  // Place useEffect calls inside the function body
  useEffect(() => {
    if (demoMode && DASHBOARD_CONFIG.features.toastNotifications) {
      toastDemoMode();
    }
  }, [demoMode]);

  // Fade transition when switching from demo to personalized
  useEffect(() => {
    const previousDemoMode = previousDemoModeRef.current;
    if (previousDemoMode && !demoMode) {
      // Transitioning from demo to personalized
      setShowContent(false);
      const timer = setTimeout(() => setShowContent(true), 150);
      return () => clearTimeout(timer);
    }
    previousDemoModeRef.current = demoMode;
  }, [demoMode]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Desktop Layout - 2 Column Grid */}
      <div className="hidden lg:grid lg:grid-cols-[300px_1fr] gap-8 max-w-[1920px] mx-auto p-8">
        
        {/* Sidebar - Fixed Width */}
        <aside className="space-y-6">
          {sidebar || <DefaultSidebar demoMode={demoMode} />}
        </aside>

        {/* Main Content Area */}
        <main className="space-y-6 min-w-0">
          {/* Missing Data Notice - Show when no user data */}
          {!hasUserData && (
            <motion.section
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <MissingDataNotice variant="banner" />
            </motion.section>
          )}

          {/* Demo Mode Banner */}
          {demoMode && (
            <section className="animate-in fade-in duration-300">
              <DemoModeBanner />
            </section>
          )}

          {/* Dashboard Summary - NEW! Key insights at a glance */}
          <motion.section
            initial="hidden"
            animate={showContent ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <DashboardSummary
              userCost={3.85}
              regionalAverage={4.20}
              nationalAverage={4.50}
              region={region}
              hasUserData={hasUserData}
            />
          </motion.section>

          {/* Cost Comparison Hero - NEW! */}
          <motion.section
            initial="hidden"
            animate={showContent ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            <CostComparisonHero
              userCost={3.85}
              regionalAverage={4.20}
              nationalAverage={4.50}
              postcode={postcode}
              region={region}
              loading={loading && demoMode}
            />
          </motion.section>

          {/* Smart Recommendations - NEW! Priority Actions */}
          <motion.section
            initial="hidden"
            animate={showContent ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <SmartRecommendationsCard loading={loading && demoMode} />
          </motion.section>

          {/* UK Regional Cost Map - NEW! Geographic Comparison */}
          <motion.section
            initial="hidden"
            animate={showContent ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <UKRegionalCostMap 
              userRegion={region?.toLowerCase().replace(/\s+/g, '-') || 'west-midlands'} 
              userCost={3.85} 
            />
          </motion.section>

          {/* Quick Stats Row - 4 Cards */}
          <motion.section
            initial="hidden"
            animate={showContent ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Overview</h2>
            </div>
            {quickStats || <DefaultQuickStats loading={loading && demoMode} />}
          </motion.section>

          {/* Featured Large Chart */}
          <motion.section
            initial="hidden"
            animate={showContent ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Usage Trend</h2>
              </div>
              <MultiSourceBadge sources={['user', 'regional']} size="sm" />
            </div>
            {featuredChart || <DefaultFeaturedChart data={benchmarkData} userData={userData?.wholesaleTrend} loading={loading && demoMode} />}
          </motion.section>

          {/* Comparison Charts Section */}
          <motion.section
            initial="hidden"
            animate={showContent ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Detailed Comparisons</h2>
              </div>
              <MultiSourceBadge sources={['user', 'regional', 'national']} size="sm" />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {comparisonCharts || <DefaultComparisonCharts data={benchmarkData} userData={userData} loading={loading && demoMode} />}
            </div>
          </motion.section>

          {/* Tariff Insights */}
          <motion.section
            initial="hidden"
            animate={showContent ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tariff Analysis</h2>
              </div>
              <MultiSourceBadge sources={['user', 'national']} size="sm" />
            </div>
            {tariffInsights || <DefaultTariffInsights data={benchmarkData} userData={userData?.tariffDuration} loading={loading && demoMode} />}
          </motion.section>

          {/* Forecast Section */}
          <motion.section
            initial="hidden"
            animate={showContent ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Forecasts & Predictions</h2>
              </div>
              <DataSourceBadge source="estimated" size="sm" />
            </div>
            {forecast || <DefaultForecast data={benchmarkData} userData={userData} loading={loading && demoMode} />}
          </motion.section>

          {/* Insights Row */}
          <motion.section
            initial="hidden"
            animate={showContent ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Key Insights</h2>
              </div>
              <MultiSourceBadge sources={['user', 'regional', 'estimated']} size="sm" />
            </div>
            {insights || <DefaultInsights data={benchmarkData} loading={loading && demoMode} />}
          </motion.section>

          {/* Tools/Actions Row */}
          <motion.section
            initial="hidden"
            animate={showContent ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
            </div>
            {toolsActions || <DefaultToolsActions />}
          </motion.section>

          {/* Custom Children */}
          {children}
        </main>
      </div>

      {/* Mobile/Tablet Layout - Tabs */}
      <div className="lg:hidden min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Mobile Header */}
          <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 px-5 py-5 shadow-lg">
            {demoMode && <DemoModeBadge className="mb-3 animate-in fade-in duration-300" />}
            {greeting || <DefaultGreeting mobile />}
            
            {/* Tab Navigation */}
            <TabsList className="w-full grid grid-cols-4 mt-4 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl shadow-inner">
              <TabsTrigger value="overview" className="text-xs font-medium data-[state=active]:shadow-md rounded-lg transition-all">
                <Activity className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="charts" className="text-xs font-medium data-[state=active]:shadow-md rounded-lg transition-all">
                <BarChart3 className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Charts</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="text-xs font-medium data-[state=active]:shadow-md rounded-lg transition-all">
                <Lightbulb className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Insights</span>
              </TabsTrigger>
              <TabsTrigger value="tools" className="text-xs font-medium data-[state=active]:shadow-md rounded-lg transition-all">
                <Settings className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Tools</span>
                Tools
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="p-5 sm:p-6 space-y-6">
            <TabsContent value="overview" className="space-y-6 mt-0">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp}>
                  {quickStats || <DefaultQuickStats loading={loading && demoMode} />}
                </motion.div>
                <motion.div variants={fadeInUp}>
                  {featuredChart || <DefaultFeaturedChart data={benchmarkData} userData={userData?.wholesaleTrend} loading={loading && demoMode} />}
                </motion.div>
                <motion.div variants={fadeInUp}>
                  {sidebar || <DefaultSidebar demoMode={demoMode} />}
                </motion.div>
              </motion.div>
            </TabsContent>

            <TabsContent value="charts" className="space-y-6 mt-0">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp}>
                  {comparisonCharts || <DefaultComparisonCharts data={benchmarkData} userData={userData} loading={loading && demoMode} />}
                </motion.div>
                <motion.div variants={fadeInUp}>
                  {forecast || <DefaultForecast data={benchmarkData} userData={userData} loading={loading && demoMode} />}
                </motion.div>
              </motion.div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6 mt-0">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp}>
                  {tariffInsights || <DefaultTariffInsights data={benchmarkData} userData={userData?.tariffDuration} loading={loading && demoMode} />}
                </motion.div>
                <motion.div variants={fadeInUp}>
                  {insights || <DefaultInsights data={benchmarkData} loading={loading && demoMode} />}
                </motion.div>
              </motion.div>
            </TabsContent>

            <TabsContent value="tools" className="space-y-6 mt-0">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
              >
                {toolsActions || <DefaultToolsActions />}
              </motion.div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

    </div>
  );
}

// ============================================
// DEFAULT PLACEHOLDER COMPONENTS
// ============================================

function DefaultGreeting({ mobile = false, loading = false }: { mobile?: boolean; loading?: boolean }) {
  if (loading) return <GreetingSkeleton mobile={mobile} />;
  
  return (
    <div className={mobile ? '' : 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-900 dark:via-purple-900 dark:to-indigo-900 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300'}>
      <h1 className={`font-bold tracking-tight ${mobile ? 'text-xl text-gray-900 dark:text-white' : 'text-4xl text-white'}`}>
        Welcome back! 👋
      </h1>
      <p className={mobile ? 'text-sm text-gray-600 dark:text-gray-400 mt-1' : 'text-blue-100 mt-3 text-lg'}>
        Here's your energy overview
      </p>
    </div>
  );
}

function DefaultQuickStats({ loading = false }: { loading?: boolean }) {
  const stats = [
    { label: 'Daily Cost', value: '£3.85', icon: DollarSign, color: 'blue', source: 'user' as const },
    { label: 'This Month', value: '£115', icon: Calendar, color: 'purple', source: 'user' as const },
    { label: 'Efficiency', value: '87%', icon: Target, color: 'green', source: 'estimated' as const },
    { label: 'Usage', value: '24 kWh', icon: Zap, color: 'yellow', source: 'user' as const },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    );
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <motion.div 
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      {stats.map((stat, i) => (
        <motion.div key={i} variants={cardVariants}>
        <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-l-4 border-transparent hover:border-blue-500 dark:hover:border-blue-400 group">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200 dark:from-${stat.color}-900/40 dark:to-${stat.color}-900/20 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
              <DataSourceBadge source={stat.source} size="sm" />
            </div>
            <CardDescription className="text-xs font-medium uppercase tracking-wide">{stat.label}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight">{stat.value}</p>
          </CardContent>
        </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

function DefaultFeaturedChart({ data, userData, loading = false }: { data?: any; userData?: any; loading?: boolean }) {
  if (loading) return <ChartSkeleton className="hover:shadow-xl transition-shadow" />;
  return <WholesalePriceTrendChart data={data?.wholesaleTrend} userData={userData} className="hover:shadow-xl transition-shadow" />;
}

function DefaultComparisonCharts({ data, userData, loading = false }: { data?: any; userData?: any; loading?: boolean }) {
  if (loading) {
    return (
      <>
        <ChartSkeleton className="hover:shadow-lg transition-shadow" />
        <ChartSkeleton className="hover:shadow-lg transition-shadow" />
      </>
    );
  }
  
  return (
    <>
      <HouseholdUsageBenchmarkChart 
        data={data?.usageBenchmarks} 
        userData={userData?.usageBenchmark}
        className="hover:shadow-lg transition-shadow" 
      />
      <StandingChargeComparisonChart 
        data={data?.standingCharges} 
        userData={userData?.standingCharge}
        className="hover:shadow-lg transition-shadow" 
      />
    </>
  );
}

function DefaultTariffInsights({ data, userData, loading = false }: { data?: any; userData?: any; loading?: boolean }) {
  if (loading) return <ChartSkeleton />;
  return <TariffDurationChart data={data?.tariffDurations} userData={userData} />;
}

function DefaultInsights({ data, loading = false }: { data?: any; loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <InsightCardSkeleton key={i} />)}
      </div>
    );
  }

  const usageBenchmark = data?.usageBenchmarks?.[0];
  const standingCharge = data?.standingCharges?.[0];
  const tariffDuration = data?.tariffDurations?.find((t: any) => t.type === 'Fixed 12M');
  const priceCapForecast = data?.priceCapForecast?.[0];

  const usageComparison = usageBenchmark?.yourUsage && usageBenchmark?.nationalAvg
    ? ((usageBenchmark.yourUsage - usageBenchmark.nationalAvg) / usageBenchmark.nationalAvg * 100)
    : null;

  const standingChargeSavings = standingCharge?.regionalAvg && standingCharge?.charge
    ? ((standingCharge.regionalAvg - standingCharge.charge) / standingCharge.regionalAvg * 100)
    : null;

  const daysUntilExpiry = tariffDuration?.daysLeft || 0;
  const potentialSavings = standingCharge?.regionalAvg && standingCharge?.charge
    ? Math.round((standingCharge.regionalAvg - standingCharge.charge) * 365)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Usage Efficiency */}
      {usageComparison !== null && (
        <InsightCard
          type={usageComparison < 0 ? 'success' : 'warning'}
          title="Usage Efficiency"
          value={`${Math.abs(Math.round(usageComparison))}%`}
          comparison={{
            value: Math.abs(Math.round(usageComparison)),
            direction: usageComparison < 0 ? 'down' : 'up',
            label: 'vs national average'
          }}
          description={usageComparison < 0 
            ? "You're using less energy than the national average." 
            : "Your usage is higher than the national average."}
        />
      )}

      {/* Tariff Expiry Warning */}
      {daysUntilExpiry > 0 && daysUntilExpiry < 90 && (
        <InsightCard
          type="warning"
          title="Tariff Expiring Soon"
          value={`${daysUntilExpiry} days`}
          comparison={{
            value: daysUntilExpiry,
            direction: 'neutral',
            label: 'until renewal'
          }}
          description="Consider comparing tariffs now to avoid automatic rollover to variable rates."
        />
      )}

      {/* Potential Savings */}
      {potentialSavings > 0 && (
        <InsightCard
          type="info"
          title="Potential Annual Savings"
          value={`£${potentialSavings}`}
          comparison={{
            value: standingChargeSavings ? Math.round(Math.abs(standingChargeSavings)) : 0,
            direction: standingChargeSavings && standingChargeSavings > 0 ? 'down' : 'neutral',
            label: 'vs regional average'
          }}
          description="Estimated savings by switching to a better standing charge rate."
        />
      )}

      {/* Price Cap Forecast */}
      {priceCapForecast?.cap && (
        <InsightCard
          type="info"
          title="Next Price Cap"
          value={`£${priceCapForecast.cap}/year`}
          comparison={{
            value: priceCapForecast.change || 0,
            direction: priceCapForecast.change && priceCapForecast.change > 0 ? 'up' : 'down',
            label: priceCapForecast.period || 'next quarter'
          }}
          description={`Ofgem price cap forecast for ${priceCapForecast.period || 'upcoming period'}.`}
        />
      )}
    </div>
  );
}

function DefaultForecast({ data, userData, loading = false }: { data?: any; userData?: any; loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ChartSkeleton className="hover:shadow-lg transition-shadow" />
        <ChartSkeleton className="hover:shadow-lg transition-shadow" />
        <ChartSkeleton className="hover:shadow-lg transition-shadow" />
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <WeatherImpactChart 
        data={data?.weatherForecast} 
        userData={userData?.weatherForecast}
        className="hover:shadow-lg transition-shadow" 
      />
      <DemandSpikeForecastChart 
        data={data?.demandForecast} 
        userData={userData?.demandForecast}
        className="hover:shadow-lg transition-shadow" 
      />
      <PriceCapForecastChart 
        data={data?.priceCapForecast} 
        userData={userData?.priceCapForecast}
        className="hover:shadow-lg transition-shadow" 
      />
    </div>
  );
}

function DefaultToolsActions() {
  const actions = [
    { label: 'Upload Bill', icon: '📄', color: 'blue' },
    { label: 'Add Reading', icon: '📊', color: 'green' },
    { label: 'Compare Tariffs', icon: '💷', color: 'purple' },
    { label: 'Settings', icon: '⚙️', color: 'gray' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {actions.map((action, i) => (
        <button
          key={i}
          className="group p-6 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-left relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">{action.icon}</div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{action.label}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

function DefaultSidebar({ demoMode = false, loading = false }: { demoMode?: boolean; loading?: boolean }) {
  if (loading) return <SidebarSkeleton />;
  
  return (
    <div className="space-y-6">
      {demoMode && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-300 dark:border-blue-700 shadow-lg animate-in fade-in duration-500">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 animate-pulse" />
              <div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">Demo Mode Active</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Upload your bills to see personalized insights
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-2">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Today</span>
            <span className="font-bold text-lg text-blue-600 dark:text-blue-400">£3.85</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">This Week</span>
            <span className="font-bold text-lg text-purple-600 dark:text-purple-400">£26.95</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">This Month</span>
            <span className="font-bold text-lg text-green-600 dark:text-green-400">£115.00</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/50 dark:via-emerald-950/50 dark:to-teal-950/50 border-2 border-green-300 dark:border-green-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-green-600 dark:text-green-400 animate-pulse" />
            <span className="text-green-900 dark:text-green-100">Today's Tip</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium text-green-800 dark:text-green-200 leading-relaxed">Lower your thermostat by 1°C to save £80/year</p>
        </CardContent>
      </Card>
    </div>
  );
}
