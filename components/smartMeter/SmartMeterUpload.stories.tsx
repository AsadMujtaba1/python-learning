import type { Meta, StoryObj } from '@storybook/react';
import SmartMeterUpload from './SmartMeterUpload';

const meta = {
  title: 'Features/Smart Meter Upload',
  component: SmartMeterUpload,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SmartMeterUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultState: Story = {
  args: {
    onUpload: (files: File[]) => {
      console.log('Uploaded files:', files);
    },
    onCancel: () => {
      console.log('Upload cancelled');
    },
  },
};

export const WithMockUpload: Story = {
  args: {
    onUpload: async (files: File[]) => {
      console.log('Starting upload...', files);
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Upload complete');
    },
    onCancel: () => {
      console.log('Upload cancelled');
    },
  },
  play: async ({ canvasElement }) => {
    // This would simulate file upload in interactive mode
    console.log('Story mounted');
  },
};

export const UploadingState: Story = {
  args: {
    onUpload: async (files: File[]) => {
      console.log('Uploading...', files);
      // Simulate long upload
      await new Promise(resolve => setTimeout(resolve, 10000));
    },
    onCancel: () => {
      console.log('Upload cancelled');
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the uploading state with progress indicator. In a real scenario, files would be uploaded to the server.',
      },
    },
  },
};

export const ExtractingData: Story = {
  args: {
    onUpload: async (files: File[]) => {
      console.log('Extracting meter readings...', files);
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('Extraction complete');
    },
    onCancel: () => {
      console.log('Upload cancelled');
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the data extraction state after upload. OCR is processing the smart meter photo.',
      },
    },
  },
};

export const SuccessState: Story = {
  args: {
    onUpload: async (files: File[]) => {
      console.log('Upload successful!', files);
    },
    onCancel: () => {
      console.log('Upload cancelled');
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows successful upload and data extraction with confirmation.',
      },
    },
  },
};

export const ErrorState: Story = {
  args: {
    onUpload: async (files: File[]) => {
      console.error('Upload failed: Network error');
      throw new Error('Failed to upload files');
    },
    onCancel: () => {
      console.log('Upload cancelled');
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows error state when upload or extraction fails.',
      },
    },
  },
};
