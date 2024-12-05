import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { Button } from '@mui/material';

import { userConstants } from '../../constants/user-constants';
import { setUser } from '../../stores/user-slice';

/** Logout Component */
export const LogoutComponent: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  /** On Click */
  const onClick = () => {
    dispatch(setUser({ id: null }));
    localStorage.removeItem(userConstants.localStorageKey);
    navigate('/');
  };
  
  return <Button variant="contained" onClick={onClick}>Logout</Button>;
};
