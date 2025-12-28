// src/pages/platform/platform_components/SideNav.jsx
import {
  Box,
  Center,
  Image,
  Text,
  VStack,
  Button,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import logo from "../../../assets/THELOGO.png";
import sebRed from "../../../assets/sebRed.jpg";

export default function SideNav() {
  const border = useColorModeValue("blackAlpha.200", "whiteAlpha.200");
  const muted = useColorModeValue("gray.100", "whiteAlpha.800");
  const hoverBg = useColorModeValue("blackAlpha.400", "whiteAlpha.200");
  const activeBg = useColorModeValue("blackAlpha.600", "whiteAlpha.300");
  const activeBorder = useColorModeValue("yellow.300", "yellow.600");

const linkStyle = ({ isActive }) => ({
  width: "100%",
  justifyContent: "flex-start",
  borderRadius: "14px",
  fontWeight: 700,
  color: "white",                      // prevent blue text
  textDecoration: "none",
  background: isActive ? activeBg : "transparent",
  border: isActive ? `1px solid ${activeBorder}` : "1px solid transparent",
});

  // Reusable props for all nav buttons
const navButtonProps = {
  variant: "ghost",
  _hover: { bg: hoverBg },
  _active: { bg: activeBg, color: "white" },
  _focusVisible: { boxShadow: "none" }, // remove blue outline
  color: "white",
  fontFamily: '"Arapey", serif',       // calmer, menu-style font
  fontSize: "md",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};


  return (
    <Box
      w={{ base: "240px", md: "290px" }}
      position="sticky"
      top={0}
      h="100vh"
      borderRight="1px solid"
      borderColor={border}
      bgImage={`url(${sebRed})`}
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
    >
      <Box
        w="100%"
        h="100%"
        px={5}
        py={6}
        bg="rgba(0, 0, 0, 0.55)"
      >
        <Center flexDir="column" mb={5}>
          <Image
            src={logo}
            alt="Logo"
            boxSize={{ base: "78px", md: "92px" }}
            objectFit="contain"
            mb={3}
          />

        </Center>

        <Divider mb={4} borderColor="whiteAlpha.400" />

        <VStack align="stretch" spacing={2}>
          <Button
            as={NavLink}
            to="/sebs-admin"
            style={linkStyle}
            {...navButtonProps}
          >
            Dashboard
          </Button>
          <Button
            as={NavLink}
            to="/sebs-admin/applications"
            style={linkStyle}
            {...navButtonProps}
          >
            Applications
          </Button>
          <Button
            as={NavLink}
            to="/sebs-admin/restaurants"
            style={linkStyle}
            {...navButtonProps}
          >
            Restaurants
          </Button>
          <Button
            as={NavLink}
            to="/sebs-admin/users"
            style={linkStyle}
            {...navButtonProps}
          >
            Users
          </Button>
          <Button
            as={NavLink}
            to="/sebs-admin/financials"
            style={linkStyle}
            {...navButtonProps}
          >
            Financials
          </Button>
          <Button
            as={NavLink}
            to="/sebs-admin/audit"
            style={linkStyle}
            {...navButtonProps}
          >
            Audit Logs
          </Button>
        </VStack>

        <Divider my={5} borderColor="whiteAlpha.400" />

        <Text fontSize="xs" color={muted}>
  Seb’s © 2025
        </Text>
      </Box>
    </Box>
  );
}
