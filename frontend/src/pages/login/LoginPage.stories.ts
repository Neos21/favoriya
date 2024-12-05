import type { Meta, StoryObj } from '@storybook/react';

import { LoginPage } from './LoginPage';

const meta = {
  title: 'LoginPage',
  component: LoginPage,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof LoginPage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Login: Story = {};
