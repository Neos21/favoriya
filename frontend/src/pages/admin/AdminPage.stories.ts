import type { Meta, StoryObj } from '@storybook/react';

import { AdminPage } from './AdminPage';

const meta = {
  title: 'AdminPage',
  component: AdminPage,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof AdminPage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Admin: Story = {};
