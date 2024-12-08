import type { Meta, StoryObj } from '@storybook/react';

import { LoadingSpinnerComponent } from './LoadingSpinnerComponent';

const meta = {
  title: 'LoadingSpinnerComponent',
  component: LoadingSpinnerComponent
} satisfies Meta<typeof LoadingSpinnerComponent>;
export default meta;

type Story = StoryObj<typeof meta>;

export const LoadingSpinner: Story = {};
