import { IconButton, Tooltip, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

export default function ColorModeToggle(props) {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Tooltip label={colorMode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}>
      <IconButton
        aria-label="Toggle dark mode"
        icon={colorMode === "dark" ? <SunIcon /> : <MoonIcon />}
        onClick={toggleColorMode}
        variant="outline"
        borderColor={useColorModeValue("blackAlpha.300", "whiteAlpha.300")}
        _hover={{ bg: useColorModeValue("blackAlpha.100", "whiteAlpha.100") }}
        rounded="full"
        {...props}
      />
    </Tooltip>
  );
}
