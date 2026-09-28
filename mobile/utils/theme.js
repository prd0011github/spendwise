const lightColors = {
  primary: "#6C4CF1",
  primaryDark: "#5638D4",
  primaryLight: "#EEE9FF",

  background: "#F6F7FB",
  surface: "#FFFFFF",
  surfaceSecondary: "#F9FAFB",

  textPrimary: "#172033",
  textSecondary: "#667085",
  textMuted: "#98A2B3",

  border: "#EAECF0",

  success: "#12B76A",
  successLight: "#E8F8F0",

  warning: "#F79009",
  warningLight: "#FFF4E5",

  danger: "#F04438",
  dangerLight: "#FEECEB",

  white: "#FFFFFF",
  black: "#000000",
};

const darkColors = {
  primary: "#8B6CFF",
  primaryDark: "#7454E8",
  primaryLight: "#2A2345",

  background: "#0F1117",
  surface: "#181B23",
  surfaceSecondary: "#20242D",

  textPrimary: "#F5F5F7",
  textSecondary: "#A7ADBA",
  textMuted: "#737B8C",

  border: "#292E38",

  success: "#32D583",
  successLight: "#123528",

  warning: "#FDB022",
  warningLight: "#3A2D13",

  danger: "#F97066",
  dangerLight: "#3A1D1D",

  white: "#FFFFFF",
  black: "#000000",
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 999,
};

const typography = {
  title: {
    fontSize: 28,
    fontWeight: "700",
  },

  heading: {
    fontSize: 20,
    fontWeight: "700",
  },

  subheading: {
    fontSize: 16,
    fontWeight: "600",
  },

  body: {
    fontSize: 15,
    fontWeight: "400",
  },

  bodyMedium: {
    fontSize: 15,
    fontWeight: "500",
  },

  caption: {
    fontSize: 13,
    fontWeight: "400",
  },

  amount: {
    fontSize: 32,
    fontWeight: "700",
  },
};

const shadows = {
  light: {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  dark: {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 3,
  },
};

const theme = {
  colors: lightColors,
  lightColors,
  darkColors,
  spacing,
  radius,
  typography,
  shadows,
};

export default theme;
