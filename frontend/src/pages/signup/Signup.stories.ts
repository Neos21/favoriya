import type { Meta, StoryObj } from '@storybook/react';

import { SignupPage } from './Signup';

const meta = {
  title: 'Signup',
  component: SignupPage,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof SignupPage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Signup: Story = {};
