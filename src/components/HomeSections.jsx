// src/components/HomeSections.jsx
import {
  Box,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Image,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";

import vibes from "../assets/vibes.jpg";      // used for dining experience
import food1 from "../assets/food.jpg";      // single menu image
import music from "../assets/music.jpg";     // used for events

const MotionBox = motion(Box);
const MotionImage = motion(Image);

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const imageFloat = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

function SplitSection({
  imageLeft,
  imageSrc,
  imageAlt,
  eyebrow,
  title,
  body1,
  body2,
  button,
}) {
  return (
    <MotionBox
      as="section"
      minH="70vh"
      display="flex"
      alignItems="center"
      bg="transparent"
      px={{ base: 6, md: 12 }}
      py={{ base: 16, md: 20 }}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
    >
      <SimpleGrid
        columns={{ base: 1, md: 2 }}
        spacing={{ base: 10, md: 16 }}
        alignItems="center"
        maxW="6xl"
        mx="auto"
      >
        {/* Image */}
        <MotionBox
          order={{ base: 0, md: imageLeft ? 0 : 1 }}
          variants={imageFloat}
        >
          <MotionImage
            src={imageSrc}
            alt={imageAlt}
            borderRadius="2xl"
            objectFit="cover"
            w="100%"
            h={{ base: "260px", md: "380px" }}
            whileHover={{ scale: 1.03, y: -6 }}
            transition={{ duration: 0.4 }}
            filter="grayscale(10%)"
          />
        </MotionBox>

        {/* Text */}
        <MotionBox
          order={{ base: 1, md: imageLeft ? 1 : 0 }}
          maxW="520px"
          variants={fadeUp}
        >
          {eyebrow && (
            <Text
              textTransform="uppercase"
              letterSpacing="0.25em"
              fontSize="xs"
              color="brand.200"
              mb={3}
            >
              {eyebrow}
            </Text>
          )}

          <Heading
            fontSize={{ base: "2xl", md: "3xl" }}
            mb={4}
            letterSpacing="0.04em"
          >
            {title}
          </Heading>
          <Text mb={4} color="neutral.200" fontSize="sm">
            {body1}
          </Text>
          {body2 && (
            <Text mb={6} color="neutral.200" fontSize="sm">
              {body2}
            </Text>
          )}
          {button}
        </MotionBox>
      </SimpleGrid>
    </MotionBox>
  );
}

export default function HomeSections() {
  return (
    <Box as="div" color="neutral.50">
      {/* 1. Dining experience + easy table reservation */}
      <SplitSection
        imageLeft={true}
        imageSrc={vibes}
        imageAlt="Dining ambience"
        eyebrow="Dining"
        title="A dining experience that’s easy to book"
        body1="Browse beautiful spaces, see real photos and details, then lock in a table in just a few taps."
        body2="Pick your date, time, and group size, and we’ll handle the rest — so you can focus on the night, not the planning."
        button={
          <Button
            as={RouterLink}
            to="/reservations"
            variant="outline"
            borderRadius="full"
            px={8}
            borderColor="brand.200"
            color="neutral.50"
            _hover={{
              bg: "whiteAlpha.100",
              borderColor: "brand.100",
              transform: "translateY(-2px)",
            }}
            transition="all 0.2s ease-out"
            size="sm"
          >
            Find a table
          </Button>
        }
      />

      {/* 2. Menus section: clear access to menus of favourite places */}
      <MotionBox
        as="section"
        minH="70vh"
        display="flex"
        alignItems="center"
        bg="transparent"
        px={{ base: 6, md: 12 }}
        py={{ base: 16, md: 20 }}
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          spacing={{ base: 10, md: 16 }}
          maxW="6xl"
          mx="auto"
          alignItems="center"
        >
          <MotionBox variants={imageFloat}>
            <MotionImage
              src={food1}
              alt="Menu preview"
              borderRadius="2xl"
              objectFit="cover"
              w="100%"
              h={{ base: "260px", md: "320px" }}
              whileHover={{ scale: 1.03, y: -4 }}
              transition={{ duration: 0.4 }}
              filter="grayscale(8%)"
            />
          </MotionBox>

          <MotionBox variants={fadeUp}>
            <Text
              textTransform="uppercase"
              letterSpacing="0.25em"
              fontSize="xs"
              color="brand.200"
              mb={3}
            >
              Menus
            </Text>
            <Heading fontSize={{ base: "2xl", md: "3xl" }} mb={4}>
              Menus from your favourite places, all in one spot
            </Heading>
            <Text mb={4} color="neutral.200" fontSize="sm">
              See full menus with descriptions, prices, dietary tags, and
              photos — before you even sit down.
            </Text>
            <Text mb={6} color="neutral.200" fontSize="sm">
              Save your go-to spots, compare options, and choose what fits your
              mood without jumping between apps or screenshots.
            </Text>
            
          </MotionBox>
        </SimpleGrid>
      </MotionBox>

      {/* 3. Events section (instead of Music) */}
      <SplitSection
        imageLeft={false}
        imageSrc={music}
        imageAlt="Events at the venue"
        eyebrow="Events"
        title="See and book events in a few clicks"
        body1="Discover special nights, live shows, themed dinners, and more — all organised in one clean calendar."
        body2="Check dates, details, and availability, then reserve your spot directly, without calling or hunting for links."
        button={
          <Button
            as={RouterLink}
            to="/events"
            variant="outline"
            borderRadius="full"
            px={8}
            borderColor="brand.200"
            color="neutral.50"
            _hover={{
              bg: "whiteAlpha.100",
              borderColor: "brand.100",
              transform: "translateY(-2px)",
            }}
            transition="all 0.2s ease-out"
            size="sm"
          >
            View events
          </Button>
        }
      />
    </Box>
  );
}
