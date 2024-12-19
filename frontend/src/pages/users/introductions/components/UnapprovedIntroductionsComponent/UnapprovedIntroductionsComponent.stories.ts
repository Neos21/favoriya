import type { Meta, StoryObj } from '@storybook/react';

import { UnapprovedIntroductionsComponent } from './UnapprovedIntroductionsComponent';

const meta = {
  title: 'UnapprovedIntroductionsComponent',
  component: UnapprovedIntroductionsComponent
} satisfies Meta<typeof UnapprovedIntroductionsComponent>;
export default meta;

type Story = StoryObj<typeof meta>;

export const UnapprovedIntroductions: Story = {
  args: {
    recipientUserId: '',
    onAfterApproved: () => {}
  }
};
