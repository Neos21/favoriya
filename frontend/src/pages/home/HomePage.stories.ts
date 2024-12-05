import type { Meta, StoryObj } from '@storybook/react';

import { HomePage } from './HomePage';

const meta = {
  title: 'HomePage',
  component: HomePage,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof HomePage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Home: Story = {};
