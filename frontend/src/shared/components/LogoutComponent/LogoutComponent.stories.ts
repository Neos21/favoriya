import type { Meta, StoryObj } from '@storybook/react';

import { LogoutComponent } from './LogoutComponent';

const meta = {
  title: 'LogoutComponent',
  component: LogoutComponent
} satisfies Meta<typeof LogoutComponent>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Logout: Story = {};
