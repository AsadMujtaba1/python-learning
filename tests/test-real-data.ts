/**
 * TEST REAL DATA SERVICES
 * 
 * Run this to test all real data fetching services
 */

import { getRealProductData, getCacheStats, clearCache } from '../lib/realProductDataService';
import { getRealTariffData, getCacheAge, clearTariffCache } from '../lib/realTariffDataService';
import { getRealNewsData, clearNewsCache } from '../lib/realNewsDataService';

async function testProducts() {
  console.log('\n=== TESTING REAL PRODUCT DATA ===\n');
  
  try {
    console.log('Fetching heaters...');
    const heaters = await getRealProductData('heaters', 5);
    console.log(`✅ Got ${heaters.length} heaters`);
    if (heaters.length > 0) {
      console.log('Sample:', heaters[0].name, '-', heaters[0].price);
    }
    
    console.log('\nFetching LED lighting...');
    const leds = await getRealProductData('led-lighting', 5);
    console.log(`✅ Got ${leds.length} LED products`);
    
    console.log('\nCache stats:', getCacheStats());
  } catch (error) {
    console.error('❌ Product test failed:', error);
  }
}

async function testTariffs() {
  console.log('\n=== TESTING REAL TARIFF DATA ===\n');
  
  try {
    console.log('Fetching tariffs...');
    const tariffs = await getRealTariffData();
    console.log(`✅ Got ${tariffs.length} tariffs`);
    
    if (tariffs.length > 0) {
      console.log('\nTop 3 tariffs:');
      tariffs.slice(0, 3).forEach((t, i) => {
        console.log(`${i + 1}. ${t.supplier} - ${t.tariffName}`);
        console.log(`   Electric: ${t.electricityRate}p/kWh, Gas: ${t.gasRate}p/kWh`);
      });
    }
    
    const cacheAge = getCacheAge();
    console.log(`\nCache age: ${cacheAge ? Math.round(cacheAge / 1000 / 60) + ' minutes' : 'No cache'}`);
  } catch (error) {
    console.error('❌ Tariff test failed:', error);
  }
}

async function testNews() {
  console.log('\n=== TESTING REAL NEWS DATA ===\n');
  
  try {
    console.log('Fetching news articles...');
    const articles = await getRealNewsData();
    console.log(`✅ Got ${articles.length} articles`);
    
    if (articles.length > 0) {
      console.log('\nLatest 5 articles:');
      articles.slice(0, 5).forEach((a, i) => {
        console.log(`${i + 1}. [${a.source}] ${a.title}`);
        console.log(`   Category: ${a.category}, Relevance: ${a.relevanceScore}/100`);
      });
    }
  } catch (error) {
    console.error('❌ News test failed:', error);
  }
}

async function testCaching() {
  console.log('\n=== TESTING CACHE BEHAVIOR ===\n');
  
  try {
    console.log('First fetch (should be slow - fetching from sources)...');
    const start1 = Date.now();
    await getRealProductData('heaters', 3);
    const time1 = Date.now() - start1;
    console.log(`✅ First fetch took ${time1}ms`);
    
    console.log('\nSecond fetch (should be fast - from cache)...');
    const start2 = Date.now();
    await getRealProductData('heaters', 3);
    const time2 = Date.now() - start2;
    console.log(`✅ Second fetch took ${time2}ms`);
    
    if (time2 < time1 / 2) {
      console.log('✅ Cache is working! Second fetch was much faster.');
    } else {
      console.log('⚠️ Cache might not be working properly.');
    }
    
    console.log('\nClearing cache...');
    clearCache();
    clearTariffCache();
    clearNewsCache();
    console.log('✅ All caches cleared');
  } catch (error) {
    console.error('❌ Cache test failed:', error);
  }
}

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   REAL DATA SERVICES - COMPREHENSIVE TEST      ║');
  console.log('╚════════════════════════════════════════════════╝');
  
  await testProducts();
  await testTariffs();
  await testNews();
  await testCaching();
  
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║   ALL TESTS COMPLETED                          ║');
  console.log('╚════════════════════════════════════════════════╝\n');
}

// Run if executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { testProducts, testTariffs, testNews, testCaching, runAllTests };
