import React from 'react';

import {Icons} from '@app/assets/icons';
import {Box} from '@app/themes';

interface RatingStarsProps {
  rating: number;
  size?: number;
  color?: string;
}

export const RatingStars = React.memo(({rating, size = 14, color = '#F5A623'}: RatingStarsProps) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <Box flexDirection="row" alignItems="center">
      {Array.from({length: fullStars}).map((_, i) => (
        <Icons.Feather key={`full-${i}`} name="star" size={size} color={color} />
      ))}
      {hasHalfStar && <Icons.Feather name="star" size={size} color={color} />}
      {Array.from({length: emptyStars}).map((_, i) => (
        <Icons.Feather key={`empty-${i}`} name="star" size={size} color="#DAD8E9" />
      ))}
    </Box>
  );
});
