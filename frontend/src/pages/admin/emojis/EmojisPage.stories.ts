import type { Meta, StoryObj } from '@storybook/react';

import { EmojisPage } from './EmojisPage';

const meta = {
  title: 'EmojisPage',
  component: EmojisPage,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof EmojisPage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Emojis: Story = {};
