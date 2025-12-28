// src/components/Footer.jsx
import { Box, SimpleGrid, Text, Stack, Link } from "@chakra-ui/react";

export default function Footer() {
  return (
    <Box
      as="footer"
      bg="rgba(12, 5, 4, 0.95)"
      borderTop="1px solid"
      borderColor="whiteAlpha.150"
      mt={12}
      px={{ base: 6, md: 12 }}
      py={{ base: 8, md: 10 }}
    >
      <SimpleGrid
        columns={{ base: 1, md: 3 }}
        spacing={{ base: 6, md: 10 }}
        maxW="6xl"
        mx="auto"
      >
        <Stack spacing={2}>
          <Text
            fontSize="sm"
            textTransform="uppercase"
            letterSpacing="0.18em"
            color="brand.200"
          >
            About
          </Text>
          <Text fontSize="sm" color="neutral.200">
            A simple way to discover places, read details, and reserve a table
            without phone calls or chaos.
          </Text>
        </Stack>

        <Stack spacing={2}>
          <Text
            fontSize="sm"
            textTransform="uppercase"
            letterSpacing="0.18em"
            color="brand.200"
          >
            Contact
          </Text>
          <Text fontSize="sm" color="neutral.200">
            Email:{" "}
            <Link href="mailto:hello@example.com" color="brand.200">
              Sebs@gmail.com
            </Link>
          </Text>
          <Text fontSize="sm" color="neutral.200">
            Phone: +973 3307 1236
          </Text>
        </Stack>

        <Stack spacing={2}>
          <Text
            fontSize="sm"
            textTransform="uppercase"
            letterSpacing="0.18em"
            color="brand.200"
          >
            Location & Hours
          </Text>
          <Text fontSize="sm" color="neutral.200">
            Based in Bahrain · supporting multiple venues and restaurants.
          </Text>
          <Text fontSize="sm" color="neutral.200">
            Typical hours: 5:00 PM – 12:00 AM (varies by place).
          </Text>
        </Stack>
      </SimpleGrid>

      <Text
        fontSize="xs"
        color="neutral.300"
        textAlign="center"
        mt={6}
        opacity={0.9}
      >
        © {new Date().getFullYear()} All rights reserved.
      </Text>
    </Box>
  );
}
