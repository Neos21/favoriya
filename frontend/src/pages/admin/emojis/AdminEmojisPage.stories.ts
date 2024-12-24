import type { Meta, StoryObj } from '@storybook/react';

import { AdminEmojisPage } from './AdminEmojisPage';

const meta = {
  title: 'AdminEmojisPage',
  component: AdminEmojisPage,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof AdminEmojisPage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const AdminEmojis: Story = {};
