import type { Meta, StoryObj } from '@storybook/react';

import { AppBarComponent } from './AppBarComponent';

const meta = {
  title: 'AppBarComponent',
  component: AppBarComponent
} satisfies Meta<typeof AppBarComponent>;
export default meta;

type Story = StoryObj<typeof meta>;

export const AppBar: Story = {
  args: {
    drawerWidth: 240,
    isNarrowWindow: true,
    onToggleDrawer: () => {}
  }
};
