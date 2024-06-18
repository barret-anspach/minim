import React from 'react';
import styled from 'styled-components';
import { sizes } from '../../constants/sizes';

const Wrapper = styled.span`
  font-family: Bravura, sans-serif;
  font-size: ${sizes.BASE_HEIGHT}rem;
`;

export default function Glyph({ hex, ...rest }) {
  return (
    <Wrapper {...rest}>{hex}</Wrapper>
  )
}