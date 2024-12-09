import type { Meta, StoryObj } from '@storybook/react';

import { UsersPage } from './UsersPage';

const meta = {
  title: 'UsersPage',
  component: UsersPage,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof UsersPage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Users: Story = {};
