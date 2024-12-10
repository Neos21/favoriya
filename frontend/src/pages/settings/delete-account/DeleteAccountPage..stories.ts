import type { Meta, StoryObj } from '@storybook/react';

import { DeleteAccountPage } from './DeleteAccountPage';

const meta = {
  title: 'DeleteAccountPage',
  component: DeleteAccountPage,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof DeleteAccountPage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const DeleteAccount: Story = {};
