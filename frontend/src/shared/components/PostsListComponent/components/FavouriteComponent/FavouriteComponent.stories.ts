  import type { Meta, StoryObj } from '@storybook/react';

import { FavouriteComponent } from './FavouriteComponent';

const meta = {
  title: 'FavouriteComponent',
  component: FavouriteComponent
} satisfies Meta<typeof FavouriteComponent>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Favourite: Story = {
  args: {
    propPost: null
  }
};
