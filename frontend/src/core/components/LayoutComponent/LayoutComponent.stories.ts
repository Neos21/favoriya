import type { Meta, StoryObj } from '@storybook/react';

import { LayoutComponent } from './LayoutComponent';

const meta = {
  title: 'LayoutComponent',
  component: LayoutComponent,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof LayoutComponent>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Layout: Story = {};
