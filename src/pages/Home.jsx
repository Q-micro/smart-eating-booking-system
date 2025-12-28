// src/pages/Home.jsx
import { Box, Heading, Text, Button, Stack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";

import HeroBg from "../assets/HomePage.png";
import { HelpFloatingButton } from "../components/HelpFloatingButton";
import HomeSections from "../components/HomeSections";
import Footer from "../components/Footer.jsx";
import HolidayPopup from "../components/HolidayPopup.jsx";


const MotionBox = motion(Box);

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

export default function Home() {
  return (
    <Box
      as="main"
      w="100%"
      minH="100vh"
      bg="neutral.900"
      color="neutral.50"
      overflowX="hidden"
    >
      {/* Full-bleed hero section (same size as your screenshot) */}
      <Box
        as="section"
        position="relative"
        w="100vw"
        left="50%"
        ml="-50vw"
        minH="100vh"
        overflow="hidden"
      >
        {/* Background image */}
        <Box
          position="absolute"
          inset="0"
          bgImage={`url(${HeroBg})`}
          bgSize="cover"
          bgPosition="center"
          bgRepeat="no-repeat"
        />

        {/* Darker overlay so it's not too bright now */}
        <Box
          position="absolute"
          inset="0"
          bg="rgba(18, 8, 6, 0.5)" // <- was 0.35, now a bit dimmer
        />

        {/* Hero content */}
        <Box
          position="relative"
          zIndex={1}
          minH="100vh"
          display="flex"
          alignItems="center"
        >
          <Box w="100%" px={{ base: 6, md: 12 }} maxW="6xl" mx="auto">
            <MotionBox
              maxW="lg"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              {/* Cursive Welcome */}
              <Heading
                fontFamily="'Cedarville Cursive', cursive"
                fontWeight="normal"
                fontSize={{ base: "3xl", md: "4xl", lg: "4xl" }}
                lineHeight="1.1"
                mb={4}
              >
                Welcome to Seb&apos;s
              </Heading>

              {/* New description text */}
              <Text fontSize="sm" color="neutral.200" mb={6}>
                Discover places you love, see real details, and reserve tables
                in just a few taps — without calls, chaos, or guessing.
              </Text>

              <Stack
                direction={{ base: "column", sm: "row" }}
                spacing={3}
                pt={1}
              >
                <Button
                  as={RouterLink}
                  to="/reservations"
                  colorScheme="brand"
                  bg="brand.400"
                  _hover={{ bg: "brand.300", transform: "translateY(-2px)" }}
                  size="md"
                  borderRadius="full"
                  px={8}
                  transition="all 0.2s ease-out"
                >
                  Book a table
                </Button>

  
              </Stack>
            </MotionBox>

            <HelpFloatingButton />
          </Box>
        </Box>
      </Box>

      {/* Rest of home sections */}
      <HomeSections />
      <HolidayPopup />

      {/* Footer only on Home */}
      <Footer />
    </Box>
  );
}
