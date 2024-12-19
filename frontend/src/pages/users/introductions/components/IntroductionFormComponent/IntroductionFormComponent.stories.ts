import type { Meta, StoryObj } from '@storybook/react';

import { IntroductionFormComponent } from './IntroductionFormComponent';

const meta = {
  title: 'IntroductionFormComponent',
  component: IntroductionFormComponent
} satisfies Meta<typeof IntroductionFormComponent>;
export default meta;

type Story = StoryObj<typeof meta>;

export const IntroductionForm: Story = {};
