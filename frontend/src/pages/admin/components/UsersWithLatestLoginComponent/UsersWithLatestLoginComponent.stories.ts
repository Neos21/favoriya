import type { Meta, StoryObj } from '@storybook/react';

import { UsersWithLatestLoginComponent } from './UsersWithLatestLoginComponent';

const meta = {
  title: 'UsersWithLatestLoginComponent',
  component: UsersWithLatestLoginComponent
} satisfies Meta<typeof UsersWithLatestLoginComponent>;
export default meta;

type Story = StoryObj<typeof meta>;

export const UsersWithLatestLogin: Story = {};
