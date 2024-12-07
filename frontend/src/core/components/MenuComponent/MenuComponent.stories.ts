import type { Meta, StoryObj } from '@storybook/react';

import { MenuComponent } from './MenuComponent';

const meta = {
  title: 'MenuComponent',
  component: MenuComponent,
  parameters: {
    Menu: 'fullscreen'
  }
} satisfies Meta<typeof MenuComponent>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Menu: Story = {};
