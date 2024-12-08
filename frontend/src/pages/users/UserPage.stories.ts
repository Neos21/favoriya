import type { Meta, StoryObj } from '@storybook/react';

import { UserPage } from './UserPage';

const meta = {
  title: 'UserPage',
  component: UserPage,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof UserPage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const User: Story = {};
