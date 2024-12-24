import type { Meta, StoryObj } from '@storybook/react';

import { VisuallyHiddenInputComponent } from './VisuallyHiddenInputComponent';

const meta = {
  title: 'VisuallyHiddenInputComponent',
  component: VisuallyHiddenInputComponent
} satisfies Meta<typeof VisuallyHiddenInputComponent>;
export default meta;

type Story = StoryObj<typeof meta>;

export const VisuallyHiddenInput: Story = {};
