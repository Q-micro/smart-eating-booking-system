// src/pages/platform/PlatformLayout.jsx
import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import SideNav from "./platform_components/SideNav"; // adjust if needed

export default function PlatformLayout({ children }) {
  const bg = useColorModeValue("gray.50", "gray.900");
  const text = useColorModeValue("gray.800", "whiteAlpha.900");

  return (
    <Flex minH="100vh" bg={bg} color={text}>
      <SideNav />
      <Box flex="1" minW={0} px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }}>
        {children}
      </Box>
    </Flex>
  );
}
