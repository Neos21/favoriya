import type { Meta, StoryObj } from '@storybook/react';

import { UserInfoFormComponent } from './UserInfoFormComponent';

const meta = {
  title: 'UserInfoFormComponent',
  component: UserInfoFormComponent
} satisfies Meta<typeof UserInfoFormComponent>;
export default meta;

type Story = StoryObj<typeof meta>;

export const UserInfoForm: Story = {};
