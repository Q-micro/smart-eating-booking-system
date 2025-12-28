// src/components/Navbar.jsx
import { useEffect, useState } from "react";
import {
  Link as RouterLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Link,
  useDisclosure,
  Stack,
  Image,
  Button,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { FiUser } from "react-icons/fi";

import Logo from "../assets/goldlogo.png";
import { useAuth } from "../auth/AuthContext";
import NotificationsBell from "./NotificationsBell";
//import ColorModeToggle from "../components/ColorModeToggle";
const links = [
  { to: "/", label: "Home" },
  { to: "/reservations", label: "Reservations" },
  { to: "/events", label: "Events" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

function NavLink({ to, children }) {
  const { pathname } = useLocation();
  const active = pathname === to;

  return (
    <Link
      as={RouterLink}
      to={to}
      px={2}
      pb={1.5}
      pt={1}
      fontSize="sm"
      letterSpacing="0.08em"
      textTransform="uppercase"
      color={active ? "brand.200" : "neutral.100"}
      borderBottom="2px solid"
      borderColor={active ? "brand.200" : "transparent"}
      _hover={{
        textDecoration: "none",
        color: "brand.100",
        borderColor: "brand.100",
      }}
      transition="all 0.15s ease-out"
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggle = () => {
    isOpen ? onClose() : onOpen();
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  };

  return (
    <Box
      bg={
        isScrolled
          ? "rgba(18, 8, 6, 0.96)" // soft deep brown
          : "rgba(18, 8, 6, 0.9)"
      }
      backdropFilter="blur(14px)"
      borderBottom="none" // no white line
      position="sticky"
      top="0"
      zIndex="10"
      boxShadow={
        isScrolled
          ? "0 6px 18px rgba(0, 0, 0, 0.45)"
          : "0 3px 10px rgba(0, 0, 0, 0.3)"
      }
      transition="all 0.2s ease-out"
    >
      <Flex
        h={isScrolled ? 14 : 16}
        alignItems="center"
        justifyContent="space-between"
        maxW="6xl"
        mx="auto"
        px={4}
        transition="height 0.2s ease-out, padding 0.2s ease-out"
      >
        {/* Logo only, no 'jazz / dining / lounge' text */}
        <Link as={RouterLink} to="/" _hover={{ textDecoration: "none" }}>
          <Image
            src={Logo}
            alt="Logo"
            h={isScrolled ? "32px" : "40px"}
            objectFit="contain"
            transition="all 0.2s ease-out"
          />
        </Link>

        {/* Desktop links + auth controls */}
        <HStack spacing={6} display={{ base: "none", md: "flex" }}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to}>
              {l.label}
            </NavLink>
          ))}
{user && <NotificationsBell userId={user.uid} />}

          {!user && (
            <Button
              as={RouterLink}
              to="/login"
              variant="outline"
              size="sm"
              borderRadius="full"
              borderColor="brand.200"
              color="brand.100"
              _hover={{
                bg: "whiteAlpha.100",
                borderColor: "brand.200",
                transform: "translateY(-1px)",
              }}
              transition="all 0.15s ease-out"
            >
              Sign In
            </Button>
          )}

          {user && (
            <Menu>
              <MenuButton
                as={IconButton}
                variant="ghost"
                aria-label="User menu"
                borderRadius="full"
                _hover={{ bg: "whiteAlpha.100" }}
                icon={
                  user.name ? (
                    <Avatar
                      size="sm"
                      name={user.name}
                      bg="brand.300"
                      color="white"
                    >
                      {getInitials(user.name)}
                    </Avatar>
                  ) : (
                    <FiUser />
                  )
                }
              />
              <MenuList
                bg="neutral.900"
                borderColor="whiteAlpha.300"
                minW="200px"
              >
                <Box px={3} pt={2} pb={1}>
                  <Text fontSize="xs" color="gray.400">
                    Signed in as
                  </Text>
                  <Text fontSize="sm" fontWeight="medium" color="white">
                    {user.name || user.email}
                  </Text>
                </Box>

                <MenuItem
                  as={RouterLink}
                  to="/profile"
                  bg="transparent"
                  _hover={{ bg: "whiteAlpha.200" }}
                  onClick={onClose}
                  fontSize="sm"
                >
                  Profile 
                </MenuItem>

                <MenuItem
                  bg="transparent"
                  _hover={{ bg: "whiteAlpha.200" }}
                  onClick={handleLogout}
                  fontSize="sm"
                >
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </HStack>

        {/* Mobile menu button */}
        <IconButton
          display={{ base: "inline-flex", md: "none" }}
          onClick={toggle}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label="Toggle navigation"
          variant="ghost"
          color="neutral.50"
        />
      </Flex>

      {/* Mobile menu */}
      {isOpen ? (
        <Box
          pb={4}
          display={{ md: "none" }}
          borderTop="1px solid"
          borderColor="whiteAlpha.100"
          bg="rgba(18, 8, 6, 0.98)"
        >
          <Stack as="nav" spacing={2} px={4} pb={4} pt={2}>
            {links.map((l) => (
              <NavLink key={l.to} to={l.to}>
                {l.label}
              </NavLink>
            ))}

            {!user && (
              <Button
                as={RouterLink}
                to="/login"
                colorScheme="brand"
                variant="solid"
                size="md"
                width="full"
                mt={3}
                borderRadius="full"
                onClick={onClose}
              >
                Sign In
              </Button>
            )}

{user && <NotificationsBell userId={user.uid} />}

            {user && (
              <Stack pt={3} spacing={2}>
                <Text fontSize="sm" color="neutral.100">
                  Signed in as {user.name || user.email}
                </Text>
                <Button
                  as={RouterLink}
                  to="/profile"
                  variant="outline"
                  colorScheme="brand"
                  size="md"
                  width="full"
                  borderRadius="full"
                  onClick={onClose}
                >
                  Profile 
                </Button>
                <Button
                  colorScheme="red"
                  size="md"
                  width="full"
                  borderRadius="full"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </Stack>
            )}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
}
