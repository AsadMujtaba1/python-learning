# Smart Meter Multi-Photo Analysis - Installation & Setup

## 📦 Required Dependencies

Add these to your `package.json`:

```bash
npm install chart.js react-chartjs-2 lucide-react
```

If you don't already have these UI components, install shadcn/ui:

```bash
npx shadcn-ui@latest init

# Then add required components:
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add input
```

## 🔑 Environment Variables

Create or update `.env.local`:

```env
# Required for AI Vision
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional: Public API key (if needed for client-side)
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-openai-api-key-here
```

## 📱 Quick Start

### 1. Verify Installation

Check that all files are in place:

```
lib/
├── types/smartMeterTypes.ts ✓
├── smartMeterVisionService.ts ✓
├── smartMeterTimeInference.ts ✓
├── smartMeterReconciliation.ts ✓
├── smartMeterInsights.ts ✓
└── smartMeterService.ts ✓

app/
├── smart-meter/page.tsx ✓
└── api/smart-meter/ ✓

components/smartMeter/
├── SmartMeterUpload.tsx ✓
├── UsageChart.tsx ✓
├── InsightsList.tsx ✓
├── PhotoHistory.tsx ✓
└── PhotoConfirmation.tsx ✓
```

### 2. Add to Navigation

Update your main navigation (e.g., `components/Navbar.tsx` or `app/layout.tsx`):

```tsx
import { Camera } from 'lucide-react';

const navigationItems = [
  // ... existing items
  {
    name: 'Smart Meter',
    href: '/smart-meter',
    icon: Camera,
  },
];
```

### 3. Start Development Server

```bash
npm run dev
```

Navigate to `http://localhost:3000/smart-meter`

### 4. Test the Feature

1. **Upload a photo** - Use any smart meter or energy bill image
2. **Wait for AI processing** - Takes 3-10 seconds
3. **Confirm extracted values** - Review and accept/edit
4. **View insights** - Check the generated recommendations

## 🎨 Customization

### Branding

Update colors in components:

```tsx
// Change primary color from blue
className="bg-blue-600" → className="bg-green-600"
className="text-blue-600" → className="text-green-600"
```

### AI Model

Change in `lib/smartMeterVisionService.ts`:

```typescript
const OPENAI_VISION_MODEL = 'gpt-4o'; // Latest
// Or use: 'gpt-4-vision-preview'
```

### Thresholds

Adjust confidence levels:

```typescript
// In PhotoConfirmation.tsx
const LOW_CONFIDENCE = 70; // Show warning below this
const VERY_LOW_CONFIDENCE = 50; // Require edit below this
```

### Regional Settings

Modify seasonal factors in `lib/smartMeterTimeInference.ts`:

```typescript
const SEASONAL_FACTORS = {
  winter: {
    electricityFactor: 1.35, // Customize
    gasFactor: 2.1,
  },
  // ...
};
```

## 🗄️ Database Integration

The current implementation uses in-memory storage (Maps). For production:

### Option 1: Firebase

```typescript
// lib/smartMeterDatabase.ts
import { getFirestore, collection, addDoc } from 'firebase/firestore';

export async function savePhoto(photo: SmartMeterPhoto) {
  const db = getFirestore();
  await addDoc(collection(db, 'smartMeterPhotos'), photo);
}
```

### Option 2: Prisma/PostgreSQL

```prisma
// prisma/schema.prisma
model SmartMeterPhoto {
  id                   String   @id @default(uuid())
  userId               String
  uploadTimestamp      DateTime
  filePath             String
  photoType            String
  extractionStatus     String
  extractionConfidence Int
  userConfirmed        Boolean  @default(false)
  createdAt            DateTime @default(now())
  
  extractedValues ExtractedValue[]
}

model ExtractedValue {
  id                String   @id @default(uuid())
  photoId           String
  value             Float
  unit              String
  valueType         String
  inferredStartDate DateTime
  inferredEndDate   DateTime
  confidence        Int
  createdAt         DateTime @default(now())
  
  photo SmartMeterPhoto @relation(fields: [photoId], references: [id])
}
```

### Option 3: Supabase

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function savePhoto(photo: SmartMeterPhoto) {
  const { data, error } = await supabase
    .from('smart_meter_photos')
    .insert(photo);
  return data;
}
```

## 🖼️ File Storage

### Firebase Storage

```typescript
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function uploadPhoto(file: File, userId: string) {
  const storage = getStorage();
  const storageRef = ref(storage, `smart-meter/${userId}/${Date.now()}-${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}
```

### AWS S3

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: 'eu-west-2' });

export async function uploadToS3(file: File, userId: string) {
  const key = `smart-meter/${userId}/${Date.now()}-${file.name}`;
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: file,
  });
  await s3Client.send(command);
  return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`;
}
```

## 🔐 Authentication

Add user authentication to API routes:

```typescript
// lib/auth.ts
import { getServerSession } from 'next-auth';

export async function getUserId(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session.user.id;
}

// In API routes:
import { getUserId } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const userId = await getUserId(request);
  // ... rest of route
}
```

## 📊 Analytics & Monitoring

### Add Logging

```typescript
// lib/logger.ts
export function logPhotoUpload(userId: string, photoId: string) {
  console.log('[SMART_METER] Photo uploaded', { userId, photoId, timestamp: new Date() });
  // Send to analytics service
}

export function logExtractionError(photoId: string, error: string) {
  console.error('[SMART_METER] Extraction failed', { photoId, error });
  // Send to error tracking (Sentry, etc.)
}
```

### Track Usage

```typescript
// In components, add tracking:
import { trackEvent } from '@/lib/analytics';

function handlePhotoUpload() {
  trackEvent('smart_meter_photo_uploaded', {
    photo_count: files.length,
  });
}
```

## 🧪 Testing

### Sample Test Data

```typescript
// __tests__/smartMeter.test.ts
import { extractSmartMeterData } from '@/lib/smartMeterVisionService';

describe('Smart Meter Vision', () => {
  it('should extract meter readings', async () => {
    const result = await extractSmartMeterData({
      photoId: 'test-123',
      userId: 'user-123',
      fileUrl: 'path/to/test/image.jpg',
      uploadTimestamp: new Date(),
    });

    expect(result.success).toBe(true);
    expect(result.extractedValues.length).toBeGreaterThan(0);
  });
});
```

## 🚀 Deployment

### Vercel

1. Set environment variables in Vercel dashboard
2. Deploy: `vercel --prod`

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 📈 Performance Optimization

### Image Optimization

```typescript
// Compress images before upload
import imageCompression from 'browser-image-compression';

async function compressImage(file: File) {
  return await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
  });
}
```

### Lazy Loading

```tsx
// Lazy load heavy components
const UsageChart = dynamic(() => import('@/components/smartMeter/UsageChart'), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
```

### Caching

```typescript
// Cache analytics results
import { unstable_cache } from 'next/cache';

export const getCachedAnalytics = unstable_cache(
  async (userId: string) => {
    return await generateAnalytics(userId, ...);
  },
  ['smart-meter-analytics'],
  { revalidate: 300 } // 5 minutes
);
```

## ✅ Pre-Launch Checklist

- [ ] OpenAI API key configured
- [ ] All dependencies installed
- [ ] Database connection working
- [ ] File storage configured
- [ ] Authentication implemented
- [ ] Error handling tested
- [ ] Mobile responsive verified
- [ ] Privacy policy updated
- [ ] GDPR compliance verified
- [ ] Analytics tracking added
- [ ] Performance optimized
- [ ] User testing completed

## 🆘 Troubleshooting

### "Module not found: lucide-react"
```bash
npm install lucide-react
```

### "Cannot find module @/components/ui/button"
```bash
npx shadcn-ui@latest add button card tabs input
```

### "OpenAI API error: 401"
Check `.env.local` has correct API key

### Charts not displaying
```bash
npm install chart.js react-chartjs-2
```

### Photos not uploading
- Check file size limits in Next.js config
- Verify CORS settings
- Check network tab for errors

## 📞 Support

- Documentation: `SMART_METER_IMPLEMENTATION_GUIDE.md`
- Privacy: `SMART_METER_PRIVACY_GDPR.md`
- Code: Review inline comments
- Issues: Check TypeScript errors in IDE

---

**Ready to go! 🚀**

The feature is production-ready once you:
1. Install dependencies
2. Add OpenAI API key
3. Set up database/storage
4. Add authentication

Start with in-memory storage for testing, then migrate to production database.
