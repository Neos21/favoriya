import type { Meta, StoryObj } from '@storybook/react';

import { PostFormHelpComponent } from './PostFormHelpComponent';

const meta = {
  title: 'PostFormHelpComponent',
  component: PostFormHelpComponent
} satisfies Meta<typeof PostFormHelpComponent>;
export default meta;

type Story = StoryObj<typeof meta>;

export const PostFormHelp: Story = {};
