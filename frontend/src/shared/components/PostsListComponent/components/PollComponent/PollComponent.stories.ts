  import type { Meta, StoryObj } from '@storybook/react';

import { PollComponent } from './PollComponent';

const meta = {
  title: 'PollComponent',
  component: PollComponent
} satisfies Meta<typeof PollComponent>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Poll: Story = {
  args: {
    propPost: null
  }
};
