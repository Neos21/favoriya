import type { Meta, StoryObj } from '@storybook/react';

import { ChangePasswordFormComponent } from './ChangePasswordFormComponent';

const meta = {
  title: 'ChangePasswordFormComponent',
  component: ChangePasswordFormComponent
} satisfies Meta<typeof ChangePasswordFormComponent>;
export default meta;

type Story = StoryObj<typeof meta>;

export const ChangePasswordForm: Story = {};
