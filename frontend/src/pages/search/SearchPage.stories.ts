import type { Meta, StoryObj } from '@storybook/react';

import { SearchPage } from './SearchPage';

const meta = {
  title: 'SearchPage',
  component: SearchPage,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof SearchPage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Search: Story = {};
