// src/theme.js
import { extendTheme } from "@chakra-ui/react";

const config = {
  initialColorMode: "dark",   // or "system"
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  fonts: {
    heading: "'Playfair Display', serif",
    body: "'Lora', serif",
  },

  colors: {
    brand: {
      50: "#FFF4DF",
      100: "#FFE3B0",
      200: "#FFD07F",
      300: "#FBB957",
      400: "#E9A535", // main warm gold
      500: "#C98A27",
      600: "#9E691D",
      700: "#734A14",
      800: "#4A3010",
      900: "#291707",
    },
    neutral: {
      50: "#FFF7EE",
      100: "#F3E0CF",
      200: "#D5BFA8",
      300: "#B1937E",
      400: "#7E6452",
      500: "#574035",
      600: "#3B2924",
      700: "#271817",
      800: "#1B0F0E",
      900: "#120806", // deep warm brown, not pure black
    },
  },

  styles: {
    global: {
      "html, body": {
        bg: "neutral.900",
        color: "neutral.50",
        scrollBehavior: "smooth",
      },
      body: {
        bg: "neutral.900",
      },
      "::selection": {
        backgroundColor: "brand.400",
        color: "neutral.900",
      },
    },
  },

components: {
  Button: {
    baseStyle: {
      borderRadius: "full",
      fontWeight: "medium",
      letterSpacing: "0.04em",
      textTransform: "uppercase",
    },
    variants: {
      solid: {
        bg: "brand.400",
        color: "neutral.900",
        _hover: {
          bg: "brand.300",
          boxShadow: "0 0 10px rgba(255,200,120,0.4)",
          transform: "translateY(-2px)",
        },
      },
      outline: {
        borderColor: "whiteAlpha.700",
        color: "neutral.50",
        _hover: {
          bg: "whiteAlpha.200",
          borderColor: "whiteAlpha.800",
        },
      },
      ghost: {
        color: "neutral.200",
        _hover: { bg: "whiteAlpha.200" },
      },
    },
    defaultProps: {
      variant: "solid",
      size: "md",
    },
  },
}

});

export default theme;

