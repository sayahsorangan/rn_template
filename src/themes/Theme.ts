import {createTheme, useTheme as useReTheme} from '@shopify/restyle';

import border_radius from './border-radius.json';
import colors from './colors.json';
import font_size from './fonts-size.json';
import font from './fonts.json';
import spacing from './spacing.json';

// font style

interface IFont {
  color: string;
  fontFamily: string;
  includeFontPadding: boolean;
}

interface IFontSylesKey {
  medium: IFont;
  regular: IFont;
  bold: IFont;
  semibold: IFont;
}

interface IFontSyles {
  h_1_medium: any;
  h_2_medium: any;
  h_3_medium: any;
  h_4_medium: any;
  h_5_medium: any;
  h_6_medium: any;

  body_medium: any;
  body_leading_medium: any;
  body_helper_medium: any;

  button_s_medium: any;
  button_m_medium: any;
  button_l_medium: any;

  h_1_regular: any;
  h_2_regular: any;
  h_3_regular: any;
  h_4_regular: any;
  h_5_regular: any;
  h_6_regular: any;

  body_regular: any;
  body_leading_regular: any;
  body_helper_regular: any;

  button_s_regular: any;
  button_m_regular: any;
  button_l_regular: any;

  h_1_bold: any;
  h_2_bold: any;
  h_3_bold: any;
  h_4_bold: any;
  h_5_bold: any;
  h_6_bold: any;

  body_bold: any;
  body_leading_bold: any;
  body_helper_bold: any;

  button_s_bold: any;
  button_m_bold: any;
  button_l_bold: any;

  h_1_semibold: any;
  h_2_semibold: any;
  h_3_semibold: any;
  h_4_semibold: any;
  h_5_semibold: any;
  h_6_semibold: any;

  body_semibold: any;
  body_leading_semibold: any;
  body_helper_semibold: any;

  button_s_semibold: any;
  button_m_semibold: any;
  button_l_semibold: any;

  defaults: any;
}

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
        [s + '_' + f]: {...texts[f], fontSize: font_size[s]},
      };
    });
  });
  return data as IFontSyles;
};

export const theme = createTheme({
  colors,
  spacing,
  borderRadii: border_radius,
  breakpoints: {
    phone: 0,
    tablet: 768,
    largeTablet: 1024,
  },
  textVariants: generateStyle(),
});

export type Theme = typeof theme;
export const useTheme = () => useReTheme<Theme>();
