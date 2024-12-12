import type { Meta, StoryObj } from '@storybook/react';

import { LoginHistoriesPage } from './LoginHistoriesPage';

const meta = {
  title: 'LoginHistoriesPage',
  component: LoginHistoriesPage,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof LoginHistoriesPage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const LoginHistories: Story = {};
