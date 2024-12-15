import type { Meta, StoryObj } from '@storybook/react';

import { ServerMetricsComponent } from './ServerMetricsComponent';

const meta = {
  title: 'ServerMetricsComponent',
  component: ServerMetricsComponent
} satisfies Meta<typeof ServerMetricsComponent>;
export default meta;

type Story = StoryObj<typeof meta>;

export const ServerMetrics: Story = {};
