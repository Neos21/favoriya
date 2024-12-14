import type { Meta, StoryObj } from '@storybook/react';

import { HomeTimelinePage } from './HomeTimelinePage';

const meta = {
  title: 'HomeTimelinePage',
  component: HomeTimelinePage,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof HomeTimelinePage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const HomeTimeline: Story = {};
