import type { Meta, StoryObj } from '@storybook/react';
import BillUpload from './BillUpload';
import type { EnergyBill } from '@/lib/types/userProfile';

const meta = {
  title: 'Features/Bill OCR Upload',
  component: BillUpload,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BillUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockExtractedBill: EnergyBill = {
  id: 'bill-123',
  supplier: 'British Gas',
  accountNumber: 'BG123456789',
  billDate: '2025-12-01',
  periodStart: '2025-11-01',
  periodEnd: '2025-11-30',
  dueDate: '2025-12-15',
  totalAmount: 125.50,
  energyCharges: 95.00,
  standingCharges: 25.50,
  vat: 5.00,
  electricityUsage: 350,
  gasUsage: 450,
  uploadedAt: new Date().toISOString(),
};

export const DefaultState: Story = {
  args: {
    onBillExtracted: (bill: EnergyBill) => {
      console.log('Bill extracted:', bill);
    },
    existingBills: [],
  },
};

export const WithExistingBills: Story = {
  args: {
    onBillExtracted: (bill: EnergyBill) => {
      console.log('Bill extracted:', bill);
    },
    existingBills: [mockExtractedBill],
  },
};

export const UploadingState: Story = {
  args: {
    onBillExtracted: async (bill: EnergyBill) => {
      console.log('Uploading bill...', bill);
      await new Promise(resolve => setTimeout(resolve, 3000));
    },
    existingBills: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the uploading state when a bill PDF or image is being processed.',
      },
    },
  },
};

export const ExtractingState: Story = {
  args: {
    onBillExtracted: async (bill: EnergyBill) => {
      console.log('Extracting bill data with OCR...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log('Extraction complete:', bill);
    },
    existingBills: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the OCR extraction state. AI is reading the bill data from the uploaded document.',
      },
    },
  },
};

export const ReviewState: Story = {
  args: {
    onBillExtracted: (bill: EnergyBill) => {
      console.log('Review extracted data:', bill);
    },
    existingBills: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the review modal where users can verify and edit extracted bill data before saving.',
      },
    },
  },
};

export const SuccessState: Story = {
  args: {
    onBillExtracted: (bill: EnergyBill) => {
      console.log('Bill successfully extracted and saved:', bill);
      alert('Bill uploaded successfully!');
    },
    existingBills: [mockExtractedBill],
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows success confirmation after bill is extracted and saved.',
      },
    },
  },
};

export const ErrorState: Story = {
  args: {
    onBillExtracted: async (bill: EnergyBill) => {
      console.error('OCR extraction failed');
      throw new Error('Failed to extract bill data');
    },
    existingBills: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows error state when bill upload or OCR extraction fails.',
      },
    },
  },
};

export const InvalidFileError: Story = {
  args: {
    onBillExtracted: (bill: EnergyBill) => {
      console.log('Bill extracted:', bill);
    },
    existingBills: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows error when user tries to upload an invalid file type (not PDF or image).',
      },
    },
  },
};

export const FileTooLargeError: Story = {
  args: {
    onBillExtracted: (bill: EnergyBill) => {
      console.log('Bill extracted:', bill);
    },
    existingBills: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows error when uploaded file exceeds the 10MB size limit.',
      },
    },
  },
};
