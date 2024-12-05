import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { render, screen } from '@testing-library/react';

import { store } from '../../stores/store';
import { LogoutComponent } from './LogoutComponent';

test('should be defined', () => {
  render(<Provider store={store}><LogoutComponent /></Provider>, { wrapper: BrowserRouter });
  const component = screen.getByText((/Logout/i));
  expect(component).toBeDefined();
});
