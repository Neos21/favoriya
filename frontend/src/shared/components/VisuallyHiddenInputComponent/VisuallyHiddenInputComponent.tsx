import styled from '@emotion/styled';

export const VisuallyHiddenInputComponent = styled('input')({
  position: 'absolute',
  overflow: 'hidden',
  bottom: 0,
  left: 0,
  width: 1,
  height: 1,
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap'
});
