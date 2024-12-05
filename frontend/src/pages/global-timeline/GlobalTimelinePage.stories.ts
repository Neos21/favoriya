import type { Meta, StoryObj } from '@storybook/react';

import { GlobalTimelinePage } from './GlobalTimelinePage';

const meta = {
  title: 'GlobalTimelinePage',
  component: GlobalTimelinePage,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof GlobalTimelinePage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const GlobalTimeline: Story = {};
