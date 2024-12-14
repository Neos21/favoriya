import type { Meta, StoryObj } from '@storybook/react';

import { NotificationsPage } from './NotificationsPage';

const meta = {
  title: 'NotificationsPage',
  component: NotificationsPage,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof NotificationsPage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Notifications: Story = {};
