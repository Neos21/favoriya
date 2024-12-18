import type { Meta, StoryObj } from '@storybook/react';

import { IntroductionsPage } from './IntroductionsPage';

const meta = {
  title: 'IntroductionsPage',
  component: IntroductionsPage,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof IntroductionsPage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Introductions: Story = {};
