import type { Meta, StoryObj } from '@storybook/react';

import { SignupPage } from './SignupPage';

const meta = {
  title: 'SignupPage',
  component: SignupPage,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof SignupPage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Signup: Story = {};
