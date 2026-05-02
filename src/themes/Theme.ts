import {createTheme, useTheme as useReTheme} from '@shopify/restyle';

import border_radius from './border-radius.json';
import colors_white from './colors.json';
import colors_dark from './dark-colors.json';
import {elevationStyles} from './elevation';
import font_size from './fonts-size.json';
import font from './fonts.json';
import spacing from './spacing.json';

// font style

interface IFont {
  color: string;
  fontFamily: string;
  includeFontPadding: boolean;
}

type FontWeight = 'medium' | 'regular' | 'bold' | 'semibold';
type FontSizeKey =
  | 'h_1'
  | 'h_2'
  | 'h_3'
  | 'h_4'
  | 'h_5'
  | 'h_6'
  | 'body'
  | 'body_leading'
  | 'body_helper'
  | 'button_s'
  | 'button_m'
  | 'button_l';

type IFontSylesKey = Record<FontWeight, IFont>;
type IFontSyles = Record<`${FontSizeKey}_${FontWeight}`, any> & {defaults: any};

const generateFont = () => {
  let data = {};
  font.map(i => {
    data = {
      ...data,
      [i.name]: {color: 'black', fontFamily: i.font, includeFontPadding: false},
    };
  });
  return data as IFontSylesKey;
};

const generateStyle = () => {
  const texts = generateFont();
  let data = {defaults: {...texts.regular, fontSize: font_size.body}};
  Object.keys(font_size).map(s => {
    Object.keys(texts).map(f => {
      data = {
        ...data,
        [s + '_' + f]: {...texts[f], fontSize: font_size[s] - 2},
      };
    });
  });
  return data as IFontSyles;
};

export const theme = createTheme({
  colors: colors_white,
  spacing,
  borderRadii: border_radius,
  breakpoints: {
    phone: 0,
    tablet: 768,
    largeTablet: 1024,
  },
  elevationStyles,
  textVariants: generateStyle(),
});

export const dark_theme = createTheme({
  colors: colors_dark,
  spacing,
  borderRadii: border_radius,
  breakpoints: {
    phone: 0,
    tablet: 768,
    largeTablet: 1024,
  },
  elevationStyles,
  textVariants: generateStyle(),
});

export type Theme = typeof theme;
export const useTheme = () => useReTheme<Theme>();
