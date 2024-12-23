import type { Meta, StoryObj } from '@storybook/react';

import { ErrorFallbackComponent } from './ErrorFallbackComponent';

const meta = {
  title: 'ErrorFallbackComponent',
  component: ErrorFallbackComponent,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof ErrorFallbackComponent>;
export default meta;

type Story = StoryObj<typeof meta>;

export const ErrorFallback: Story = {};
