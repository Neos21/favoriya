import type { Meta, StoryObj } from '@storybook/react';

import { ShumaiPage } from './ShumaiPage';

const meta = {
  title: 'ShumaiPage',
  component: ShumaiPage,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof ShumaiPage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Shumai: Story = {};
