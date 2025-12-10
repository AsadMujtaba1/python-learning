/**
 * BLOG SERVICE
 * 
 * Content management for energy-saving blog
 * AI-assisted blog generation
 * SEO-optimized
 * Admin CRUD operations
 */

// Only import fs/path on server side
let fs: any;
let path: any;
let matter: any;

if (typeof window === 'undefined') {
  fs = require('fs');
  path = require('path');
  matter = require('gray-matter');
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string; // URL-friendly
  excerpt: string; // Short summary
  content: string; // Full markdown content
  category: 'energy' | 'home-upgrades' | 'products' | 'guides' | 'news';
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  coverImage?: string;
  publishedAt?: string; // ISO date
  updatedAt: string;
  status: 'draft' | 'published' | 'archived';
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  readTime?: number; // minutes
  views?: number;
  likes?: number;
}

export interface BlogCategory {
  id: BlogPost['category'];
  label: string;
  emoji: string;
  description: string;
}

/**
 * Blog categories
 */
export const BLOG_CATEGORIES: BlogCategory[] = [
  {
    id: 'energy',
    label: 'Energy Saving',
    emoji: '⚡',
    description: 'Tips and tricks to reduce your energy consumption',
  },
  {
    id: 'home-upgrades',
    label: 'Home Upgrades',
    emoji: '🏠',
    description: 'Insulation, heating, and efficiency improvements',
  },
  {
    id: 'products',
    label: 'Product Reviews',
    emoji: '🛒',
    description: 'Reviews of energy-efficient appliances and devices',
  },
  {
    id: 'guides',
    label: 'How-to Guides',
    emoji: '📖',
    description: 'Step-by-step guides for energy optimization',
  },
  {
    id: 'news',
    label: 'Industry News',
    emoji: '📰',
    description: 'Latest updates on energy prices and policies',
  },
];

/**
 * Mock blog posts - DEPRECATED: Now loading from markdown files
 */
const MOCK_POSTS: BlogPost[] = [
  // DEPRECATED: Blog posts are now loaded from /blog/*.md files
  // This array is kept for backwards compatibility but is no longer used
  /*
  {
    id: '1',
    title: '10 Free Ways to Cut Your Energy Bills This Winter',
    slug: '10-free-ways-cut-energy-bills-winter',
    excerpt: 'Discover simple, no-cost changes that can save you up to £300 per year on heating and electricity.',
    content: `# 10 Free Ways to Cut Your Energy Bills This Winter

Winter is coming, and so are higher energy bills. But you don't need to spend money to save money. Here are 10 completely free ways to reduce your energy consumption:

## 1. Lower Your Thermostat by 1°C
This simple change can save you £80/year with no noticeable comfort loss. The World Health Organization recommends 18°C for most rooms, and 21°C is more than comfortable. Most people won't even notice a 1-degree drop.

**How to do it:** Adjust your thermostat down by one degree and give yourself a week to adjust. If you're comfortable, consider another degree reduction.

## 2. Close Curtains at Dusk
Trap heat inside by closing curtains before it gets dark. Thick curtains can reduce heat loss by up to 17%.

**Pro tip:** Open them during sunny winter days to let free solar heat in, then close them as soon as the sun sets.

## 3. Use Draught Excluders
Block gaps under doors with rolled towels or old clothes. Draughts can account for 25% of heat loss in an uninsulated home.

**DIY solution:** Fill an old pair of tights with rice or dried beans and place under doors.

## 4. Move Furniture Away from Radiators
Let heat circulate freely around the room. Sofas and curtains blocking radiators waste energy and money.

**Ideal distance:** Leave at least 15cm between furniture and radiators for optimal heat distribution.

## 5. Bleed Your Radiators
Remove trapped air to improve heating efficiency. If the top of your radiator is cooler than the bottom, it needs bleeding.

**How often:** Check annually at the start of heating season. Takes 5 minutes per radiator.

## 6. Wash Clothes at 30°C
Modern detergents work just as well at lower temperatures. Washing at 30°C uses 40% less energy than 40°C.

**Extra savings:** Only run full loads and use the eco mode if available.

## 7. Defrost Your Freezer
Ice buildup makes your freezer work harder. A 3mm ice layer can increase energy consumption by 30%.

**How often:** Defrost when ice is 3-5mm thick, typically every 3-6 months.

## 8. Turn Off Standby Devices
Vampire power can cost £35-80/year. TVs, computers, phone chargers, and kitchen appliances all drain power when "off".

**Quick solution:** Use extension leads with switches to turn multiple devices off at once.

## 9. Shorter Showers
Reduce shower time by 2 minutes to save £50/year on heating and water bills. The average shower uses 12 litres per minute.

**Tip:** Play a 4-minute song as your shower timer.

## 10. Cook with Lids On Pans
Boil water faster and use 25% less energy. Also batch cook when possible to maximize oven efficiency.

**Bonus:** Use pressure cookers to reduce cooking time by up to 70%.

## Conclusion
These simple changes can save hundreds of pounds without spending a penny. Start with 3-4 today and add more as they become habits. Track your energy usage to see the difference!

**Estimated Total Savings:** £250-350 per year
**Time Investment:** 1-2 hours to implement all changes
**ROI:** Infinite - no money spent!`,
    category: 'energy',
    tags: ['winter', 'heating', 'free tips', 'savings'],
    author: {
      id: 'admin',
      name: 'CostSaver Team',
    },
    publishedAt: new Date('2024-11-15').toISOString(),
    updatedAt: new Date('2024-11-15').toISOString(),
    status: 'published',
    seo: {
      metaTitle: '10 Free Ways to Cut Energy Bills This Winter - Save £300+',
      metaDescription: 'Discover 10 completely free ways to reduce your winter energy bills. Simple changes that can save you over £300 per year.',
      keywords: ['energy saving tips', 'winter heating', 'free energy savings', 'reduce energy bills'],
    },
    readTime: 5,
    views: 1247,
    likes: 89,
  },
  {
    id: '2',
    title: 'Complete Guide to Home Insulation: ROI Analysis 2024',
    slug: 'complete-guide-home-insulation-roi',
    excerpt: 'Everything you need to know about insulation types, costs, and payback periods. Is it worth it for your home?',
    content: `# Complete Guide to Home Insulation: ROI Analysis 2024

Insulation is one of the best investments for reducing energy bills. But with so many types available, which is right for your home? This comprehensive guide covers everything you need to know.

## Why Insulation Matters

A poorly insulated home loses heat through:
- **Roof:** 25% of heat loss
- **Walls:** 35% of heat loss
- **Windows:** 10% of heat loss
- **Floors:** 15% of heat loss
- **Draughts:** 15% of heat loss

## Types of Insulation

### 1. Loft Insulation
**Cost:** £300-600 for DIY, £400-800 professionally installed
**Savings:** £250-350/year
**Payback Period:** 1.5-3 years
**Lifespan:** 40+ years

The easiest and most cost-effective insulation. Modern standards recommend 270mm depth.

**DIY Difficulty:** Easy - most people can do this themselves

### 2. Cavity Wall Insulation
**Cost:** £500-1,200
**Savings:** £160-280/year
**Payback Period:** 2-5 years
**Lifespan:** 25+ years

Foam or beads injected into the gap between brick walls. Only suitable for cavity walls (most homes built after 1920s).

**DIY Difficulty:** Professional only - requires specialized equipment

### 3. Solid Wall Insulation (External)
**Cost:** £8,000-15,000
**Savings:** £450-650/year
**Payback Period:** 12-25 years
**Lifespan:** 25+ years

Insulation boards fixed to outside walls, then rendered. Changes external appearance but doesn't reduce room sizes.

**Grant Availability:** Sometimes available through ECO4 scheme for low-income households

### 4. Solid Wall Insulation (Internal)
**Cost:** £4,000-8,000
**Savings:** £450-650/year
**Payback Period:** 6-15 years
**Lifespan:** 25+ years

Insulated plasterboard fitted to internal walls. Reduces room size by 10-15cm but cheaper than external.

**Best for:** Listed buildings or properties where external appearance must be preserved

### 5. Floor Insulation
**Cost:** £300-800 (suspended floors), £1,500-3,000 (solid floors)
**Savings:** £60-120/year
**Payback Period:** 3-10 years
**Lifespan:** 25+ years

Often overlooked but makes a big comfort difference.

### 6. Draught Proofing
**Cost:** £80-300 for whole house
**Savings:** £60-120/year
**Payback Period:** 1-3 years
**Lifespan:** 5-10 years

Sealing gaps around doors, windows, and floors.

## ROI Comparison Table

| Type | Cost | Annual Savings | Payback | Priority |
|------|------|---------------|---------|----------|
| Loft | £400-800 | £300 | 1.5-3 yrs | ⭐⭐⭐⭐⭐ |
| Cavity Wall | £500-1,200 | £220 | 2-5 yrs | ⭐⭐⭐⭐⭐ |
| Draught Proofing | £200 | £90 | 2-3 yrs | ⭐⭐⭐⭐ |
| Floor | £600 | £90 | 5-7 yrs | ⭐⭐⭐ |
| Solid Wall | £10,000 | £550 | 18 yrs | ⭐⭐ |

## Which Insulation Should You Do First?

**Priority Order:**
1. **Loft insulation** - Quickest payback, easy DIY
2. **Cavity wall insulation** - Excellent ROI if you have cavity walls
3. **Draught proofing** - Cheap and effective
4. **Floor insulation** - If you're renovating anyway
5. **Solid wall insulation** - Only if you've done everything else

## Available Grants & Funding

### ECO4 Scheme (Energy Company Obligation)
Free or heavily subsidized insulation if you:
- Receive certain benefits
- Have low income (under £31,000)
- Have inefficient home (EPC rating D-G)

**Covers:** Loft, cavity wall, solid wall, floor insulation

### Local Authority Grants
Many councils offer additional grants. Check your local council website.

## How to Get Quotes

1. Get 3 quotes minimum
2. Check company is TrustMark registered
3. Ask for references
4. Verify they're using quality materials
5. Get written guarantees (25 years typical)

## Signs Your Home Needs Insulation

✓ High energy bills despite moderate usage
✓ Cold walls to touch
✓ Condensation on windows
✓ Uneven room temperatures
✓ Cold floors
✓ EPC rating below C

## Conclusion

Loft and cavity wall insulation offer the best ROI and should be your first priority. Solid wall insulation is expensive but may be worth it if you're planning to stay in your home long-term.

**Average total savings from full insulation:** £600-900/year
**Typical payback period:** 5-8 years for complete home
**Home value increase:** 10-15% for improved EPC rating`,
    category: 'home-upgrades',
    tags: ['insulation', 'ROI', 'home improvement', 'energy efficiency'],
    author: {
      id: 'admin',
      name: 'CostSaver Team',
    },
    publishedAt: new Date('2024-11-10').toISOString(),
    updatedAt: new Date('2024-11-10').toISOString(),
    status: 'published',
    seo: {
      metaTitle: 'Home Insulation Guide 2024: Types, Costs & ROI Analysis',
      metaDescription: 'Complete guide to home insulation with cost breakdown and return on investment. Find out if insulation is worth it for your property.',
      keywords: ['home insulation', 'insulation cost', 'ROI', 'energy efficiency'],
    },
    readTime: 12,
    views: 892,
    likes: 64,
  },
  {
    id: '3',
    title: 'Heat Pumps vs Gas Boilers: 2024 Cost Comparison',
    slug: 'heat-pumps-vs-gas-boilers-cost-comparison',
    excerpt: 'Should you switch to a heat pump? We compare running costs, installation, and grants to help you decide.',
    content: `# Heat Pumps vs Gas Boilers: 2024 Cost Comparison

The heating debate continues. Should you stick with gas or make the switch to a heat pump? Here's the comprehensive data you need to make an informed decision.

## Quick Comparison

| Factor | Gas Boiler | Air Source Heat Pump |
|--------|-----------|---------------------|
| **Installation Cost** | £2,000-3,500 | £7,000-13,000 |
| **With Grant** | N/A | £2,000-8,000 |
| **Annual Running Cost** | £800-1,200 | £800-1,400 |
| **Lifespan** | 10-15 years | 20-25 years |
| **Efficiency** | 85-95% | 300-400% |
| **Carbon Emissions** | High | Low (improving) |

## Installation Costs Breakdown

### Gas Boiler
- **Basic combi boiler:** £1,800-2,500
- **Premium combi boiler:** £2,500-3,500
- **System boiler:** £2,000-4,000
- **Installation labor:** Included above
- **Total:** £2,000-4,000

### Air Source Heat Pump
- **Heat pump unit:** £4,000-8,000
- **Installation labor:** £2,000-3,000
- **Radiator upgrades (if needed):** £1,000-2,000
- **Total before grant:** £7,000-13,000
- **After £5,000 BUS grant:** £2,000-8,000

## Running Costs (Typical 3-Bed Semi)

### Gas Boiler
- **Annual gas consumption:** 12,000 kWh
- **Gas price:** 6.5p per kWh (October 2024)
- **Annual cost:** £780
- **Standing charge:** £110
- **Total:** £890/year

### Heat Pump
- **Annual electricity consumption:** 3,600 kWh (SCOP of 3.3)
- **Electricity price:** 24.5p per kWh
- **Annual cost:** £882
- **Standing charge:** £180
- **Total:** £1,062/year

**Current Reality:** Heat pumps cost £170 more per year to run than gas boilers due to electricity prices.

## But Wait - The Full Picture

### Total Cost Over 20 Years

**Gas Boiler:**
- Installation: £3,000
- Replacement at 12 years: £3,500
- Running costs: £890 x 20 = £17,800
- **Total: £24,300**

**Heat Pump:**
- Installation: £10,000
- Grant: -£5,000
- Running costs: £1,062 x 20 = £21,240
- **Total: £26,240**

**Difference:** Heat pump costs £1,940 more over 20 years (£97/year extra)

## When Heat Pumps Make Sense

✓ You're replacing an old boiler anyway
✓ You have good insulation (EPC C or above)
✓ You have space for external unit
✓ You can get the £5,000 BUS grant
✓ You care about reducing carbon emissions
✓ You plan to stay in home 10+ years
✓ You have a well-insulated, airtight home

## When to Stick with Gas

✓ Your current boiler is less than 8 years old
✓ Poor insulation (EPC rating D or below)
✓ Small property with no external space
✓ Very cold climate
✓ Old radiators that can't handle lower temperatures
✓ Budget is tight

## The Future Factor

Energy prices will change. If:
- **Gas prices rise 50%** → Heat pumps become £200/year cheaper
- **Electricity prices fall 30%** → Heat pumps become £250/year cheaper
- **Both happen** → Heat pumps save £450/year

Government aims to make heat pumps cheaper to run than gas by 2025 through electricity price reductions.

## Hidden Benefits of Heat Pumps

1. **Cooling in summer:** Many models can reverse for air conditioning
2. **No gas safety checks:** Save £80/year
3. **Lower maintenance:** £50-100/year vs £80-150 for gas
4. **Home value:** Up to 3% increase for eco-homes
5. **Future-proof:** Gas boilers may be banned in new builds

## Real-World Performance

**Cold weather performance:**
Modern heat pumps work efficiently down to -20°C. The "they don't work in winter" myth is outdated.

**Noise levels:**
Modern units are quieter than a fridge (40-50 decibels from 1 meter). Good installation matters.

**Space heating:**
Heat pumps heat rooms more slowly but maintain temperature better. Run them at lower temperatures for longer periods.

## The Grant: Boiler Upgrade Scheme (BUS)

**£5,000 grant** for air source heat pumps
**£6,000 grant** for ground source heat pumps

**Eligibility:**
- You own the property
- EPC certificate dated within 10 years
- No outstanding recommendations for loft/cavity wall insulation
- MCS-certified installer

## Our Recommendation

### Choose Heat Pump If:
- Replacing old boiler (10+ years)
- Well-insulated home
- Planning long-term stay
- Want eco-friendly option
- Can get grant

### Choose Gas Boiler If:
- Current boiler is relatively new
- Poor insulation
- Tight budget
- Short-term ownership
- Small property

## The Verdict

Heat pumps are improving rapidly and will become the standard. If you're replacing your boiler now and meet the criteria, a heat pump is a future-proof choice. If you're not replacing yet, wait 2-3 years for prices to fall further and electricity to get cheaper.

**Best strategy:** Improve insulation first, then reassess your heating options.`,
    category: 'products',
    tags: ['heat pumps', 'gas boilers', 'heating', 'cost comparison'],
    author: {
      id: 'admin',
      name: 'CostSaver Team',
    },
    publishedAt: new Date('2024-11-05').toISOString(),
    updatedAt: new Date('2024-11-05').toISOString(),
    status: 'published',
    seo: {
      metaTitle: 'Heat Pumps vs Gas Boilers: Complete Cost Comparison 2024',
      metaDescription: 'Detailed cost analysis comparing heat pumps and gas boilers. Installation costs, running costs, grants, and payback periods.',
      keywords: ['heat pump', 'gas boiler', 'heating costs', 'heat pump vs boiler'],
    },
    readTime: 10,
    views: 1564,
    likes: 112,
  },
  {
    id: '4',
    title: 'Understanding Your Energy Bill: A Complete Breakdown',
    slug: 'understanding-energy-bill-breakdown',
    excerpt: 'Confused by your energy bill? Learn what every charge means and how to spot errors that could be costing you money.',
    content: `# Understanding Your Energy Bill: A Complete Breakdown

Energy bills can be confusing. Let's break down every component so you know exactly what you're paying for and how to spot errors.

## Main Components of Your Bill

### 1. Unit Rate (The Big One)
This is what you pay per kilowatt-hour (kWh) of energy used.

**Electricity:** 24-30p per kWh (varies by region)
**Gas:** 6-8p per kWh

**Example:** Using a 2kW heater for 5 hours = 10 kWh = £2.50

### 2. Standing Charge
A daily fee just for being connected to the energy network.

**Electricity:** 40-60p per day (£146-219/year)
**Gas:** 25-35p per day (£91-128/year)

**You pay this even if you use zero energy.**

### 3. Total Cost Formula
\`\`\`
Total Bill = (kWh Used × Unit Rate) + (Days × Standing Charge)
\`\`\`

## Reading Your Meter

### Smart Meters
- Automatic readings sent to supplier
- Check the display shows same as bill
- Press buttons to see import/export

### Traditional Meters
- Read left to right
- Ignore red numbers
- Take photo for your records
- Submit readings monthly for accurate bills

## Common Bill Errors (Check These!)

### 1. Estimated Readings
Look for "E" next to meter readings. Estimated bills can be wildly wrong.

**Fix:** Submit actual meter readings monthly

### 2. Wrong Tariff Applied
Check your tariff name matches what you signed up for.

**Fix:** Contact supplier with original contract

### 3. Standing Charge Errors
Calculate: Standing charge × days should match bill

**Fix:** Challenge any discrepancies immediately

### 4. Incorrect Meter Readings
Bill jumps suddenly? Reading might be transposed (e.g., 1234 entered as 1243)

**Fix:** Check readings and photographic evidence

### 5. Exit Fees Not Removed
Check you're not still being charged for old tariff

## Tariff Types Explained

### Fixed Rate
- Unit rate and standing charge locked for 12-24 months
- Protection from price rises
- Exit fees if you leave early (£30-60 per fuel typically)

**Best for:** Most people - provides budget certainty

### Variable Rate
- Prices follow wholesale markets
- Can go up or down anytime
- Usually no exit fees

**Best for:** When fixed rates are expensive, use as temporary option

### Price Cap (SVR)
- Maximum suppliers can charge
- Reviewed every 3 months
- No exit fees
- Currently: 24.5p/kWh electricity, 6.24p/kWh gas (Oct 2024)

**Best for:** When fixed deals are more expensive than cap

### Time of Use / Economy 7
- Cheaper rate at night (typically 12am-7am)
- More expensive daytime rate
- Needs special meter

**Best for:** Night shift workers, EV owners, storage heaters

## Your EPC Rating Impact

| EPC Rating | Typical Annual Bill | vs Average (C) |
|-----------|-------------------|---------------|
| A | £600 | -£400 |
| B | £800 | -£200 |
| C | £1,000 | Baseline |
| D | £1,300 | +£300 |
| E | £1,600 | +£600 |
| F | £2,000 | +£1,000 |
| G | £2,400 | +£1,400 |

**Improving from E to C saves £600/year**

## How to Reduce Each Component

### Lower Unit Rate:
- Switch to cheaper tariff
- Use comparison sites 3 times yearly
- Reduce consumption
- Use energy during off-peak (if on ToU tariff)

### Lower Standing Charge:
- Some tariffs offer lower standing charges with higher unit rates
- Calculate break-even point
- **Formula:** If usage < 2000 kWh/year, prioritize low standing charge

### Lower Consumption:
- See our "10 Free Ways to Cut Bills" article
- Improve insulation
- Upgrade to efficient appliances
- Change behaviors

## Warning Signs of Billing Issues

🚨 **Bill suddenly doubles without usage change**
🚨 **"Estimated" appears on multiple bills**
🚨 **Can't see kWh usage, only £ amount**
🚨 **Standing charge seems very high**
🚨 **Tariff end date has passed**
🚨 **Direct debit keeps increasing**

## What Good Billing Looks Like

✅ Based on actual meter readings
✅ Shows kWh consumption clearly
✅ Compares usage to previous year
✅ Shows tariff end date
✅ Breaks down all charges
✅ Shows if you're in credit/debit

## Action Plan

1. **Submit actual meter reading** on same day each month
2. **Set calendar reminder** to review tariff 3 months before end date
3. **Download bills as PDFs** for your records
4. **Calculate your average kWh/day** to spot anomalies
5. **Check comparison sites quarterly**

## Useful Calculations

**Your unit rate:**
(Total bill - standing charges) ÷ kWh used = unit rate

**Your average daily usage:**
Monthly kWh ÷ days in month = daily kWh

**Annual cost projection:**
(Daily kWh × 365 × unit rate) + (standing charge × 365)

## When to Complain

If your supplier won't fix errors:
1. Complain formally in writing
2. Wait 8 weeks or until deadlock letter
3. Contact Energy Ombudsman (free service)
4. They can award compensation up to £10,000

## Conclusion

Understanding your bill is the first step to taking control of your energy costs. Check every bill carefully - errors are common and could cost you hundreds.

**Key takeaways:**
- Always submit actual readings
- Know your unit rate and standing charge
- Check for estimated bills
- Compare tariffs 3-4 times per year
- Challenge errors immediately`,
    category: 'guides',
    tags: ['energy bills', 'tariffs', 'meter readings', 'bill errors'],
    author: {
      id: 'admin',
      name: 'CostSaver Team',
    },
    publishedAt: new Date('2024-11-20').toISOString(),
    updatedAt: new Date('2024-11-20').toISOString(),
    status: 'published',
    seo: {
      metaTitle: 'Understanding Your Energy Bill: Complete UK Guide 2024',
      metaDescription: 'Learn what every charge on your energy bill means, how to spot errors, and how to reduce costs. Complete guide with examples.',
      keywords: ['energy bill explained', 'unit rate', 'standing charge', 'meter readings'],
    },
    readTime: 8,
    views: 2103,
    likes: 156,
  },
  {
    id: '5',
    title: 'Solar Panels in 2024: Are They Worth It for UK Homes?',
    slug: 'solar-panels-uk-worth-it-2024',
    excerpt: 'Complete cost-benefit analysis of solar panels including installation costs, savings, grants, and payback periods for UK homes.',
    content: `# Solar Panels in 2024: Are They Worth It for UK Homes?

With energy prices remaining high, many homeowners are considering solar panels. But are they actually worth it in the UK's cloudy climate? Let's crunch the numbers.

## The Numbers Everyone Wants to Know

**Average 4kW System:**
- Installation cost: £5,000-7,000
- Annual generation: 3,400 kWh
- Annual savings: £850-1,020
- Payback period: 5-8 years
- 25-year return: £21,000-25,000
- ROI: 300-400%

**Yes, they're worth it for most UK homes.**

## Installation Costs Breakdown (4kW System)

| Component | Cost |
|-----------|------|
| Solar panels (x10-12) | £2,000-3,000 |
| Inverter | £800-1,200 |
| Mounting equipment | £400-600 |
| Installation labor | £800-1,200 |
| Scaffolding | £500-800 |
| Electrical work | £300-500 |
| **Total** | **£5,000-7,000** |

Prices have dropped 70% since 2010!

## How Much Do Solar Panels Generate in UK?

### By System Size:
- **3kW:** 2,550 kWh/year (£640 saved)
- **4kW:** 3,400 kWh/year (£850 saved)
- **5kW:** 4,250 kWh/year (£1,060 saved)
- **6kW:** 5,100 kWh/year (£1,275 saved)

### By Location:
- **South England:** 900-950 kWh per kW
- **Midlands:** 850-900 kWh per kW
- **North England:** 800-850 kWh per kW
- **Scotland:** 750-850 kWh per kW

**Surprising fact:** Germany has more solar installations than the UK despite similar sunlight levels!

## Real Savings Breakdown

### Without Battery (Self-use 25-30%)
For a typical 4kW system generating 3,400 kWh:

**Electricity self-consumed:** 850 kWh × £0.25 = £213
**Exported to grid:** 2,550 kWh × £0.15 = £383
**Total annual benefit:** £596

### With Battery (Self-use 70-80%)
**Electricity self-consumed:** 2,550 kWh × £0.25 = £638
**Exported to grid:** 850 kWh × £0.15 = £128
**Total annual benefit:** £766

**Battery cost:** £2,000-4,000 (adds 3-5 years to payback)

## Smart Export Guarantee (SEG)

You get paid for excess electricity exported:
- **Octopus Outgoing:** 15p/kWh
- **E.ON Next:** 12p/kWh
- **British Gas:** 10p/kWh
- **EDF:** 5.5p/kWh

**Choose carefully** - rate differences = £200/year!

## Factors That Affect Your Returns

### ✅ Good for Solar:
- South-facing roof (within 45° of south)
- Roof pitch 30-40 degrees
- No shading from trees/buildings
- High electricity usage (3,000+ kWh/year)
- Home during daytime
- Structurally sound roof

### ❌ Not Ideal:
- North-facing roof (50% less generation)
- Heavy shading
- Roof needs repairs
- Listed building restrictions
- Flat roof (possible but more expensive)
- Very low electricity usage

## Grants & Incentives

### Current Support:
- **0% VAT** on solar panel installations (saves £1,000-1,400)
- **Smart Export Guarantee:** Payment for exported power
- **No Feed-in Tariff** (closed in 2019)

### Local Schemes:
Some councils offer additional grants. Check:
- Local authority website
- Energy Saving Trust grant calculator
- Community energy schemes

## Payback Period Examples

### Scenario 1: Optimal Setup
- 4kW system: £6,000
- Annual savings: £850
- **Payback: 7 years**
- 25-year profit: £15,250

### Scenario 2: With Battery
- 4kW system + 5kWh battery: £9,000
- Annual savings: £950
- **Payback: 9.5 years**
- 25-year profit: £14,750

### Scenario 3: Smaller System
- 3kW system: £4,500
- Annual savings: £640
- **Payback: 7 years**
- 25-year profit: £11,500

## Battery Storage: Worth It?

**Pros:**
- Increase self-consumption from 30% to 70%
- Energy independence
- Backup power (some systems)
- Better for environment

**Cons:**
- Adds £2,000-4,000 to cost
- Adds 3-5 years to payback
- Battery lifespan: 10-15 years (may need replacement)

**Verdict:** Wait unless you have specific needs (frequent powercuts, very high usage)

## Maintenance & Longevity

**Panel lifespan:** 25-30 years (efficiency drops to ~80% at 25 years)
**Inverter lifespan:** 10-15 years (£800-1,200 replacement)
**Cleaning:** Rain usually sufficient, or £50-100 annually for professional clean

**Annual maintenance cost:** £0-50

## Impact on Home Value

Studies show solar panels increase home value by:
- **£5,000-£10,000** average increase
- **Faster sales** (eco-conscious buyers)
- **Higher EPC rating** (A or B typical)

## Common Myths Debunked

❌ **"UK doesn't get enough sun"**
✅ We get more than enough. Germany has more installations!

❌ **"Panels don't work in winter"**
✅ They do! Just produce less (still 30-40% of summer output)

❌ **"They're too expensive"**
✅ Prices dropped 70% since 2010. Now have 5-8 year payback.

❌ **"They need constant maintenance"**
✅ Virtually maintenance-free. Rain cleans them.

❌ **"They'll damage my roof"**
✅ Professional installation protects your roof, doesn't damage it.

## Getting Quotes: The Process

1. **Get 3-5 quotes** from MCS-certified installers
2. **Check reviews** on Trustpilot, Checkatrade
3. **Verify MCS certification** (required for SEG)
4. **Ask for references** from recent customers
5. **Get written warranties** (25 years panel, 10 years installation)

**Red flags:**
- Pressure to sign immediately
- Unrealistic generation claims
- Not MCS certified
- No written warranty
- Suspiciously cheap quote

## Is It Right for You?

### You Should Get Solar If:
✅ Electricity bill over £700/year
✅ South/SE/SW facing roof
✅ Roof in good condition
✅ Planning to stay 7+ years
✅ No major shading
✅ Can afford upfront cost

### Hold Off If:
❌ Roof needs repairs
❌ Planning to move soon
❌ North-facing roof only
❌ Heavy tree shading
❌ Very low usage (<2,000 kWh/year)

## The Bottom Line

For most UK homeowners with suitable roofs, solar panels are an excellent investment with:
- **5-8 year payback**
- **300-400% ROI over 25 years**
- **Immediate bill reduction**
- **Increased home value**
- **Low maintenance**

**Best time to install?** Now. Prices are low and energy costs are high.

## Next Steps

1. Check your annual electricity usage (on bills)
2. Assess your roof (direction, pitch, shading)
3. Get quotes from 3-5 MCS installers
4. Compare SEG export tariffs
5. Make decision based on numbers

**Average total ROI over 25 years: £15,000-25,000**

That's a return most investments can't match!`,
    category: 'home-upgrades',
    tags: ['solar panels', 'renewable energy', 'ROI', 'installation'],
    author: {
      id: 'admin',
      name: 'CostSaver Team',
    },
    publishedAt: new Date('2024-11-25').toISOString(),
    updatedAt: new Date('2024-11-25').toISOString(),
    status: 'published',
    seo: {
      metaTitle: 'Solar Panels UK 2024: Complete Cost & Savings Guide',
      metaDescription: 'Are solar panels worth it in the UK? Full cost-benefit analysis including installation costs, savings, grants, and payback periods.',
      keywords: ['solar panels UK', 'solar panel cost', 'solar ROI', 'SEG tariff'],
    },
    readTime: 11,
    views: 3242,
    likes: 267,
  },
  {
    id: '6',
    title: 'Best Smart Thermostats 2024: Nest vs Hive vs Tado',
    slug: 'best-smart-thermostats-2024-comparison',
    excerpt: 'Compare the top smart thermostats available in the UK. Which one saves you the most money and which is easiest to use?',
    content: `# Best Smart Thermostats 2024: Nest vs Hive vs Tado

A smart thermostat can save you £150-300 per year on heating bills. But which one should you buy? We've tested the top three to help you decide.

## Quick Comparison

| Feature | Nest Learning (3rd Gen) | Hive Active Heating 2 | Tado° V3+ |
|---------|------------------------|----------------------|-----------|
| **Price** | £219 | £179 | £199 |
| **Installation** | Professional (£90) | DIY or Pro (£90) | DIY or Pro (£99) |
| **Learning** | Yes | No | Yes |
| **Geofencing** | Yes | Yes | Yes |
| **Multi-zone** | No | Add-ons | Yes |
| **Boiler control** | Basic | Advanced | Advanced |
| **Subscription** | No | No | Optional (£24.99/yr) |
| **Annual savings** | £150-250 | £130-200 | £180-280 |

## 1. Google Nest Learning Thermostat (3rd Gen)

### Pros:
✅ **Self-learning** - Learns your schedule in 1 week
✅ **Beautiful design** - Looks premium on any wall
✅ **Farsight display** - Lights up when you enter room
✅ **Energy history** - Detailed usage reports
✅ **No subscription fees**
✅ **Best app interface** - Intuitive and responsive

### Cons:
❌ **Professional installation required** for most
❌ **No hot water control** separately
❌ **Expensive** - Highest upfront cost
❌ **OpenTherm limited** - Not all boilers compatible
❌ **Single zone only** - Can't control multiple zones

### Best For:
- People who want set-and-forget automation
- Tech enthusiasts who love Google ecosystem
- Those with compatible combi boilers
- Single-zone heating systems

**Savings:** £150-250/year
**Payback:** 14-18 months

### Key Features:
- **Auto-Schedule:** Learns when you're home/away
- **Energy History:** See exactly what you're spending
- **Nest Leaf:** Rewards efficient temperature choices
- **True Radiant:** Calculates heating time needed

## 2. Hive Active Heating 2

### Pros:
✅ **DIY installation** - Easy for most people
✅ **Hot water control** - Separate control included
✅ **Boost function** - Quick heat when needed
✅ **Holiday mode** - Prevents freezing while away
✅ **Multi-zone capable** - Add Hive Radiator Valves
✅ **Alexa/Google integration**
✅ **Most affordable** overall option

### Cons:
❌ **No learning** - Must set schedule manually
❌ **Basic app** - Functional but not exciting
❌ **Geofencing less reliable** than competitors
❌ **Owned by British Gas** - Some prefer independent

### Best For:
- DIY enthusiasts
- Budget-conscious buyers
- Those wanting hot water control
- Multi-zone heating needs

**Savings:** £130-200/year
**Payback:** 11-16 months

### Key Features:
- **Boost mode:** 30/60/90 minute heat bursts
- **Holiday mode:** Anti-frost protection
- **Hot water schedule:** Independent control
- **Hive ecosystem:** Works with lights, sensors, plugs

## 3. Tado° Smart Thermostat V3+

### Pros:
✅ **Best energy savings** - Most aggressive optimization
✅ **Advanced geofencing** - Multiple people tracking
✅ **Open Window Detection** - Auto-shuts if window opened
✅ **Weather adaptation** - Adjusts based on forecast
✅ **Multi-room control** - Best multi-zone solution
✅ **Detailed analytics** - Premium insights
✅ **Works with any boiler**

### Cons:
❌ **Premium features paywalled** - £24.99/year for best features
❌ **Complex setup** for advanced features
❌ **Subscription pressure** - Free tier is basic
❌ **Design is functional** not beautiful

### Best For:
- Maximum savings seekers
- Multi-room/multi-zone homes
- Data enthusiasts who want detailed analytics
- Tech-savvy users comfortable with complexity

**Savings:** £180-280/year (with subscription)
**Payback:** 10-14 months

### Key Features (Premium):
- **Smart Schedule:** AI learns and optimizes
- **Energy IQ:** Detailed usage breakdowns
- **Weather Adaptation:** Proactive heating
- **Care & Protect:** Boiler health monitoring

## Installation Comparison

### Nest:
- **Difficulty:** Moderate-Hard
- **Time:** 30-60 minutes
- **Requires:** Basic electrical knowledge
- **Recommendation:** Use professional (£90)

### Hive:
- **Difficulty:** Easy-Moderate  
- **Time:** 20-40 minutes
- **Requires:** Screwdriver, patience
- **Recommendation:** DIY possible for most

### Tado:
- **Difficulty:** Easy-Moderate
- **Time:** 30-45 minutes
- **Requires:** Screwdriver, WiFi
- **Recommendation:** DIY with good instructions

## Feature Deep Dive

### Geofencing (Auto Away Mode)

**Winner: Tado°**
- Tracks multiple phones
- Most accurate boundary detection
- Gradual temperature reduction

**Runner-up: Nest**
- Single-phone tracking
- Works well but less customizable

**Third: Hive**
- Can be inconsistent
- Sometimes slow to trigger

### Learning Capabilities

**Winner: Nest**
- True machine learning
- Improves over weeks/months
- Minimal user input needed

**Runner-up: Tado° (Premium)**
- Good optimization with subscription
- Requires more manual tweaking

**Third: Hive**
- No learning - fully manual

### Multi-Zone Heating

**Winner: Tado°**
- Native multi-room support
- Smart radiator valves (£69 each)
- Individual room scheduling

**Runner-up: Hive**
- Add Radiator Valves (£59 each)
- Good integration
- Slightly less sophisticated

**Third: Nest**
- Not designed for multi-zone
- Would need multiple thermostats

## Cost of Ownership (3 Years)

### Nest:
- Thermostat: £219
- Installation: £90
- Subscription: £0
- **Total: £309**
- **Savings: £600**
- **Net benefit: £291**

### Hive:
- Thermostat: £179
- Installation: £0 (DIY)
- Subscription: £0
- **Total: £179**
- **Savings: £510**
- **Net benefit: £331**

### Tado° (with Premium):
- Thermostat: £199
- Installation: £0 (DIY)
- Subscription: £75 (3 years)
- **Total: £274**
- **Savings: £750**
- **Net benefit: £476**

**Winner for ROI: Tado° (with subscription)**

## Real User Experiences

### Nest Users Say:
⭐⭐⭐⭐⭐ "Set it and forget it. Just works."
⭐⭐⭐⭐ "Love the design but wish it controlled hot water"
⭐⭐⭐⭐⭐ "Paid for itself in 6 months"

### Hive Users Say:
⭐⭐⭐⭐ "Easy to install, works well, good value"
⭐⭐⭐ "App is a bit basic but it does the job"
⭐⭐⭐⭐⭐ "Hot water control is essential for us"

### Tado° Users Say:
⭐⭐⭐⭐⭐ "Best savings of any thermostat"
⭐⭐⭐ "Subscription feels like a cash grab"
⭐⭐⭐⭐⭐ "Multi-room control is fantastic"

## Our Recommendations

### Best Overall: **Google Nest**
For most people who want simplicity, beautiful design, and set-and-forget automation. The learning feature is genuinely impressive.

### Best Value: **Hive**
If you want hot water control, easy DIY installation, and don't mind manual scheduling. Best bang for buck.

### Best for Savings: **Tado°**
If you're serious about maximizing savings and have multiple rooms/zones. The subscription is worth it for the features.

### Best for Beginners: **Hive**
Easiest to install and use. No learning curve.

### Best for Tech Enthusiasts: **Nest**
Most polished experience, best integration with smart home.

## Common Questions

**Q: Do I need a C-wire?**
A: Nest might need one, Hive doesn't, Tado° doesn't. Check compatibility.

**Q: Will it work with my boiler?**
A: All three work with 95%+ of UK boilers. Check manufacturer websites.

**Q: Can I install it myself?**
A: Hive and Tado° are designed for DIY. Nest is trickier.

**Q: What if I move house?**
A: All three can be uninstalled and moved to new property.

## The Verdict

**Buy Nest if:** You want the most polished, automated experience and have a simple heating setup.

**Buy Hive if:** You want good value, hot water control, and easy DIY installation.

**Buy Tado° if:** You want maximum savings, have multi-zone heating, and don't mind paying for premium features.

All three will save you money. The "best" one depends on your priorities:
- **Automation:** Nest
- **Value:** Hive  
- **Savings:** Tado°

**You can't go wrong with any of them** - they all pay for themselves within 12-18 months!`,
    category: 'products',
    tags: ['smart thermostat', 'nest', 'hive', 'tado', 'reviews'],
    author: {
      id: 'admin',
      name: 'CostSaver Team',
    },
    publishedAt: new Date('2024-11-28').toISOString(),
    updatedAt: new Date('2024-11-28').toISOString(),
    status: 'published',
    seo: {
      metaTitle: 'Best Smart Thermostats UK 2024: Nest vs Hive vs Tado Comparison',
      metaDescription: 'Compare Nest, Hive, and Tado smart thermostats. Which saves the most money? Full review with costs, features, and recommendations.',
      keywords: ['smart thermostat', 'nest thermostat', 'hive heating', 'tado review'],
    },
    readTime: 9,
    views: 1876,
    likes: 143,
  },
  {
    id: '7',
    title: 'Energy Price Cap Explained: What It Means for Your Bills',
    slug: 'energy-price-cap-explained-2024',
    excerpt: 'Everything you need to know about Ofgem\'s price cap, how it affects your bills, and what to do when it changes.',
    content: `# Energy Price Cap Explained: What It Means for Your Bills

The energy price cap dominates headlines every quarter. But what actually is it, and how does it affect you? Let's break it down in plain English.

## What IS the Price Cap?

The price cap is the **maximum amount** energy suppliers can charge per unit of energy on **default variable tariffs** (also called Standard Variable Rate or SVR).

**It is NOT:**
❌ A cap on your total bill
❌ A cap on fixed tariffs
❌ The same for everyone
❌ A guarantee your bills won't rise

**It IS:**
✅ A maximum unit rate suppliers can charge
✅ Reviewed every 3 months (January, April, July, October)
✅ Different for different payment methods
✅ Based on wholesale energy costs

## Current Price Cap (October 2024 - December 2024)

### Direct Debit:
- **Electricity:** 24.50p per kWh + 60.99p/day standing charge
- **Gas:** 6.24p per kWh + 31.66p/day standing charge

### Prepayment:
- **Electricity:** 24.43p per kWh + 61.33p/day
- **Gas:** 6.34p per kWh + 31.37p/day

**Typical household (using 2,900 kWh electricity + 12,000 kWh gas):**
- **Annual cost:** £1,717
- **Monthly cost:** £143

## How the Cap Is Calculated

Ofgem reviews the cap quarterly based on:

1. **Wholesale costs** (60-70%) - What suppliers pay for energy
2. **Network costs** (20-25%) - Maintaining pipes and wires
3. **Policy costs** (5-8%) - Government schemes
4. **Operating costs** (3-5%) - Supplier margins
5. **VAT** (5%)

## Price Cap vs Fixed Tariffs

| Price Cap (SVR) | Fixed Tariff |
|----------------|--------------|
| Changes every 3 months | Locked for 12-24 months |
| No exit fees | Exit fees (£30-60 per fuel) |
| Can switch anytime | Early exit = penalty |
| Currently cheapest option | Sometimes cheaper in stable markets |

**Current situation (Dec 2024):**
- Price cap: £1,717/year
- Cheapest fixed: £1,820/year
- **Verdict:** Stay on price cap

## Historical Price Cap Changes

| Period | Annual Cost | Change |
|--------|-------------|--------|
| Oct 2021 | £1,277 | - |
| Apr 2022 | £1,971 | +54% 🔴 |
| Oct 2022 | £3,549* | +80% 🔴 |
| Jan 2023 | £3,280* | -8% 🟢 |
| Apr 2023 | £3,280 | - |
| Jul 2023 | £2,074 | -37% 🟢 |
| Oct 2023 | £1,834 | -12% 🟢 |
| Jan 2024 | £1,928 | +5% 🔴 |
| Apr 2024 | £1,690 | -12% 🟢 |
| Jul 2024 | £1,568 | -7% 🟢 |
| Oct 2024 | £1,717 | +10% 🔴 |

*Government support limited actual household costs

## What Determines If You're On Price Cap?

You're on a price-capped tariff if:
✅ You've never switched supplier
✅ Your fixed deal ended and you didn't switch
✅ You chose a variable tariff
✅ Your supplier went bust and you were moved

**How to check:** Look at your bill - it will say "Standard Variable" or "SVR"

## Should You Fix or Stay on Price Cap?

### Stay on Price Cap If:
✅ Fixed deals are more expensive than cap
✅ You want flexibility (no exit fees)
✅ Predictions show cap falling

### Fix Your Energy If:
✅ Fixed deals are cheaper than cap
✅ You want price certainty for budgeting
✅ Predictions show cap rising

**Current recommendation (December 2024):** Stay on price cap. Fixed deals are £100-150 more expensive.

## Regional Variations

Standing charges vary by region:

### Electricity Standing Charge:
- **Lowest:** 41p/day (North Wales)
- **Highest:** 69p/day (North Scotland)
- **Difference:** £102/year

### Gas Standing Charge:
- **Lowest:** 26p/day (East Midlands)
- **Highest:** 37p/day (Scotland)
- **Difference:** £40/year

**Unfair but true:** Where you live affects your bills by £100+/year

## Price Cap vs Actual Bills

**The cap is based on "typical use":**
- 2,900 kWh electricity/year
- 12,000 kWh gas/year

**Your actual bill depends on:**
- How much energy YOU use
- Your region's standing charges
- Your payment method

### Examples:

**Low User (1,500 kWh elec, 6,000 kWh gas):**
- Price cap: £1,717
- Your bill: ~£960

**High User (4,500 kWh elec, 18,000 kWh gas):**
- Price cap: £1,717
- Your bill: ~£2,400

**The cap isn't your bill - it's the maximum rate charged.**

## Payment Method Matters

### Direct Debit (Cheapest):
- Set amount paid monthly
- Based on estimated annual usage
- Supplier holds credit in summer
- Build up credit, use in winter

### Prepayment (More Expensive):
- Used to be 3-5% more expensive
- Now same as direct debit (since 2023)
- Pay before you use
- No credit build-up

### Pay on Receipt (Most Expensive):
- Bill arrives after you've used energy
- Often higher rates (not price-capped)
- No payment security for supplier

**Pro tip:** Always choose direct debit for cheapest rates

## When Does the Cap Change?

**Review dates:**
- **1st January** - Winter cap
- **1st April** - Spring cap
- **1st July** - Summer cap
- **1st October** - Autumn/winter cap

**Announcement:** Usually 6-8 weeks before change date

**Next change:** 1st January 2025 (announced late November 2024)

## What Happens When the Cap Changes?

### If Cap Goes Up:
- Direct debit increases automatically
- Supplier notifies you 30 days before
- Can switch to fixed if better deals available

### If Cap Goes Down:
- Direct debit should decrease
- Check supplier actually reduces payment
- Any credit on account stays with you

**Important:** Suppliers must notify you of changes

## The Social Tariff Debate

Currently, there's no "social tariff" (cheaper rate for low-income households). But it's being discussed.

**Proposed:**
- 20-30% discount for benefit recipients
- Means-tested eligibility
- Government or industry funded

**Status:** Under consultation, no implementation date

## How to Reduce Bills Under Price Cap

Even with the cap, you can reduce bills:

1. **Reduce consumption** - Most effective method
2. **Check you're on direct debit** - Cheapest payment method
3. **Submit meter readings monthly** - Avoid estimated bills
4. **Check standing charges** - Some tariffs have lower standing charges
5. **Apply for support** - Warm Home Discount, Winter Fuel Payment

## Future of Price Cap

**Likely changes:**
- **More frequent reviews?** Possibly monthly instead of quarterly
- **Regional variations?** Different caps for different areas
- **Social tariff?** Cheaper rates for vulnerable customers

**Long-term:** Price cap expected to remain until competitive market stabilizes

## Common Misconceptions

**❌ "My bill is capped at £1,717"**
✅ No - that's for typical use. Your usage determines your bill.

**❌ "I can't switch from the price cap"**
✅ You can switch anytime with no exit fees.

**❌ "Price cap protects me from high bills"**
✅ Only protects from excessive unit rates, not high consumption.

**❌ "All tariffs are capped"**
✅ Only default/variable tariffs. Fixed deals aren't.

## Should You Monitor the Price Cap?

**Yes, if:**
- You're on a price-capped tariff
- Your fixed deal is ending soon
- You want to time a switch for best savings

**Set reminders for:**
- Late March (April cap announcement)
- Late June (July cap announcement)
- Late September (October cap announcement)
- Late December (January cap announcement)

## Action Plan

1. **Check what tariff you're on** - Look at latest bill
2. **Compare with current cap** - Are you paying more?
3. **Review quarterly** - When new cap announced
4. **Fix if worthwhile** - Only if 10%+ cheaper than cap
5. **Focus on consumption** - Biggest savings opportunity

## The Bottom Line

The price cap:
- Protects consumers from excessive unit rates
- Changes every 3 months based on wholesale costs
- Isn't a cap on your total bill
- Is currently the cheapest option (vs fixed tariffs)

**Best strategy:** Stay on price cap while fixed deals are expensive, but review every quarter when new cap is announced.

**Remember:** Reducing consumption saves more than tariff switching!`,
    category: 'guides',
    tags: ['price cap', 'ofgem', 'energy tariffs', 'bills'],
    author: {
      id: 'admin',
      name: 'CostSaver Team',
    },
    publishedAt: new Date('2024-11-22').toISOString(),
    updatedAt: new Date('2024-11-22').toISOString(),
    status: 'published',
    seo: {
      metaTitle: 'Energy Price Cap Explained: What It Means for Your Bills 2024',
      metaDescription: 'Complete guide to the UK energy price cap. What it is, how it works, and what it means for your bills. Updated quarterly.',
      keywords: ['energy price cap', 'ofgem price cap', 'energy bills', 'price cap explained'],
    },
    readTime: 8,
    views: 2654,
    likes: 189,
  },
  */
];

/**
 * Load blog posts from markdown files
 */
function loadBlogPostsFromMarkdown(): BlogPost[] {
  // Return empty array if not on server
  if (typeof window !== 'undefined' || !fs || !path || !matter) {
    return [];
  }

  const blogDirectory = path.join(process.cwd(), 'blog');
  
  // Check if directory exists
  if (!fs.existsSync(blogDirectory)) {
    console.warn('Blog directory not found:', blogDirectory);
    return [];
  }

  const filenames = fs.readdirSync(blogDirectory);
  const posts: BlogPost[] = [];

  filenames.forEach((filename: string) => {
    // Only process markdown files, skip README
    if (!filename.endsWith('.md') || filename.toLowerCase().includes('readme')) {
      return;
    }

    try {
      const filePath = path.join(blogDirectory, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);

      // Extract date from filename (format: YYYY-MM-DD-slug.md)
      const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
      const fileDate = dateMatch ? dateMatch[1] : data.date || new Date().toISOString();

      // Create blog post object
      const slug = (data.slug || filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '')).toLowerCase();
      const post: BlogPost = {
        id: slug,
        title: data.title || 'Untitled',
        slug,
        excerpt: data.excerpt || content.substring(0, 150) + '...',
        content: content,
        category: data.category || 'guides',
        tags: Array.isArray(data.tags) ? data.tags : [],
        author: {
          id: 'cost-saver-team',
          name: data.author || 'Cost Saver Team',
        },
        publishedAt: fileDate,
        updatedAt: data.date || fileDate,
        status: 'published',
        seo: {
          metaTitle: data.title,
          metaDescription: data.excerpt,
          keywords: Array.isArray(data.tags) ? data.tags : [],
        },
        readTime: data.readTime ? parseInt(data.readTime) : calculateReadTime(content),
        views: 0,
        likes: 0,
      };

      posts.push(post);
    } catch (error) {
      console.error(`Error loading blog post ${filename}:`, error);
    }
  });

  return posts;
}

/**
 * Get all published blog posts
 */
export async function getBlogPosts(
  filters?: {
    category?: BlogPost['category'];
    tag?: string;
    status?: BlogPost['status'];
  },
  limit?: number
): Promise<BlogPost[]> {
  // Load posts from markdown files
  let posts = loadBlogPostsFromMarkdown();

  // Filter by category
  if (filters?.category) {
    posts = posts.filter(p => p.category === filters.category);
  }

  // Filter by tag
  if (filters?.tag) {
    posts = posts.filter(p => p.tags.includes(filters.tag as string));
  }

  // Filter by status
  if (filters?.status) {
    posts = posts.filter(p => p.status === filters.status);
  } else {
    // Default: only published posts
    posts = posts.filter(p => p.status === 'published');
  }

  // Sort by date (newest first)
  posts.sort((a, b) => {
    const dateA = new Date(a.publishedAt || a.updatedAt).getTime();
    const dateB = new Date(b.publishedAt || b.updatedAt).getTime();
    return dateB - dateA;
  });

  // Apply limit
  if (limit) {
    posts = posts.slice(0, limit);
  }

  return posts;
}

/**
 * Get single blog post by slug
 */
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const posts = loadBlogPostsFromMarkdown();
  const post = posts.find(p => p.slug === slug);
  return post || null;
}

/**
 * Generate URL-friendly slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove duplicate hyphens
    .trim();
}

/**
 * Calculate read time from content
 */
export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Create new blog post (admin only)
 */
export async function createBlogPost(
  userId: string,
  postData: Omit<BlogPost, 'id' | 'updatedAt' | 'author' | 'views' | 'likes'>
): Promise<BlogPost> {
  try {
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('./firebase');

    const postId = `post_${Date.now()}`;
    const post: BlogPost = {
      ...postData,
      id: postId,
      updatedAt: new Date().toISOString(),
      author: {
        id: userId,
        name: 'CostSaver Team', // Would fetch from user profile
      },
      views: 0,
      likes: 0,
    };

    const postRef = doc(db, 'blog', postId);
    await setDoc(postRef, {
      ...post,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return post;
  } catch (error) {
    console.error('Failed to create blog post:', error);
    throw error;
  }
}

/**
 * Update blog post (admin only)
 */
export async function updateBlogPost(
  postId: string,
  updates: Partial<BlogPost>
): Promise<void> {
  try {
    const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('./firebase');

    const postRef = doc(db, 'blog', postId);
    await updateDoc(postRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to update blog post:', error);
    throw error;
  }
}

/**
 * Delete blog post (admin only)
 */
export async function deleteBlogPost(postId: string): Promise<void> {
  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    const { db } = await import('./firebase');

    const postRef = doc(db, 'blog', postId);
    await deleteDoc(postRef);
  } catch (error) {
    console.error('Failed to delete blog post:', error);
    throw error;
  }
}

/**
 * AI-assisted blog generation
 * In production, use OpenAI or similar
 */
export async function generateBlogWithAI(
  topic: string,
  category: BlogPost['category']
): Promise<Partial<BlogPost>> {
  // Mock implementation
  // In production:
  // const response = await openai.chat.completions.create({
  //   model: 'gpt-4',
  //   messages: [{
  //     role: 'user',
  //     content: `Write a comprehensive blog post about ${topic} for an energy-saving website...`
  //   }],
  // });

  return {
    title: `How to ${topic}`,
    slug: generateSlug(`How to ${topic}`),
    excerpt: `Learn everything you need to know about ${topic} to save money on your energy bills.`,
    content: `# How to ${topic}\n\nThis is AI-generated content about ${topic}...`,
    category,
    tags: [topic.toLowerCase()],
    status: 'draft',
    seo: {
      metaTitle: `How to ${topic} - Energy Saving Guide`,
      metaDescription: `Complete guide to ${topic} with tips, costs, and savings potential.`,
      keywords: [topic.toLowerCase(), 'energy saving', 'guide'],
    },
  };
}

/**
 * Increment post views
 */
export async function incrementPostViews(postId: string): Promise<void> {
  try {
    const { doc, updateDoc, increment } = await import('firebase/firestore');
    const { db } = await import('./firebase');

    const postRef = doc(db, 'blog', postId);
    await updateDoc(postRef, {
      views: increment(1),
    });
  } catch (error) {
    console.error('Failed to increment views:', error);
  }
}

/**
 * Like/unlike post
 */
export async function togglePostLike(postId: string, userId: string): Promise<void> {
  try {
    const { doc, setDoc, deleteDoc, getDoc } = await import('firebase/firestore');
    const { db } = await import('./firebase');

    const likeRef = doc(db, 'blog', postId, 'likes', userId);
    const likeDoc = await getDoc(likeRef);

    if (likeDoc.exists()) {
      // Unlike
      await deleteDoc(likeRef);
    } else {
      // Like
      await setDoc(likeRef, {
        userId,
        likedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Failed to toggle like:', error);
  }
}
