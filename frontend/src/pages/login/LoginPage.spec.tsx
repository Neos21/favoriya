import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { render, screen } from '@testing-library/react';

import { store } from '../../shared/stores/store';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  it('should be defined', () => {
    render(<Provider store={store}><LoginPage /></Provider>, { wrapper: BrowserRouter });
    const component = screen.getAllByText((/Log In/i));
    expect(component).toBeDefined();
  });
});
