import type { Meta, StoryObj } from '@storybook/react';

import { FontParserComponent } from './FontParserComponent';

const meta = {
  title: 'FontParserComponent',
  component: FontParserComponent
} satisfies Meta<typeof FontParserComponent>;
export default meta;

type Story = StoryObj<typeof meta>;

export const FontParser: Story = {
  args: {
    input: ''
  }
};
