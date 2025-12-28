// src/pages/About.jsx
import React from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Stack,
  Divider,
  Button,
  useDisclosure,
  SimpleGrid,
  Icon,
} from "@chakra-ui/react";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import { TbCalendarTime } from "react-icons/tb";
import { FaRegClock } from "react-icons/fa";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/react";

function About() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box
      minH="100vh"
      bg="#050608" // dark, luxury background
      color="gray.100"
      px={{ base: 6, md: 10 }}
      py={{ base: 10, md: 16 }}
    >
      <Box maxW="800px" mx="auto">
        {/* Top: title + optional help button */}
        <Flex
          direction="column"
          align="center"
          justify="center"
          textAlign="center"
          mb={10}
        >
          <Heading
            fontSize={{ base: "2.4rem", md: "3rem" }}
            mb={3}
            letterSpacing="0.06em"
          >
            About Seb’s
          </Heading>

          <Text
            fontSize="sm"
            color="gray.400"
            textTransform="uppercase"
            letterSpacing="0.25em"
            mb={6}
          >
            For the nights that matter.
          </Text>

          {/* Simple gold divider */}
          <Box
            w="70px"
            h="2px"
            borderRadius="full"
            bg="yellow.400"
            boxShadow="0 0 14px rgba(246, 224, 94, 0.9)"
            mb={4}
          />

          {/* Help / how-it-works pop thing */}
          <Button
            size="sm"
            variant="outline"
            borderColor="yellow.400"
            color="yellow.300"
            _hover={{ bg: "yellow.400", color: "#050608" }}
            onClick={onOpen}
          >
            How Seb’s works
          </Button>
        </Flex>

        {/* Story – just clean paragraphs, no bullets, no left line */}
        <Stack spacing={5} fontSize={{ base: "md", md: "lg" }} lineHeight="1.9">
          <Text color="gray.200">
            Seb’s was created with one belief: nothing should get in the way of
            a great dining experience.
          </Text>

          <Text color="gray.300">
            We’ve all been there — trying to find a table, searching for the
            right spot, hoping your favorite dish is still on the menu, or
            feeling those nerves while planning a special night. None of that
            should interrupt the moment you’re trying to create. That’s exactly
            why Seb’s exists.
          </Text>

          <Text color="gray.300">
            Seb’s is your space to explore restaurants, check menus, discover
            events, and book the table that fits the memory you want to make. We
            focus on the small details that shape the whole experience — the
            smooth, simple things that let the night unfold the way you
            imagined.
          </Text>

          <Text color="gray.300">
            Because food isn’t just food. It’s how we celebrate, reconnect,
            unwind, and mark the moments that matter. It brings people closer,
            sets the tone, and turns ordinary plans into stories we keep.
          </Text>

          <Text color="gray.200">
            At Seb’s, we’re here to make planning those moments effortless — so
            the experience starts long before you sit down at the table.
          </Text>
        </Stack>

        <Divider my={10} borderColor="gray.700" />

        <Text
          fontSize="sm"
          color="yellow.300"
          letterSpacing="0.25em"
          textTransform="uppercase"
          textAlign="center"
        >
          Seb’s · Your table, your story.
        </Text>
      </Box>

      {/* ---------- HOW IT WORKS POPUP ---------- */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent bg="#07080b" border="1px solid" borderColor="gray.700">
          <ModalHeader color="gray.100">How Seb’s works</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text fontSize="sm" color="gray.400" mb={4}>
              A quick look at how you can use Seb’s to plan your next night out:
            </Text>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
              <StepCard
                icon={MdOutlineRestaurantMenu}
                title="Explore"
                text="Browse restaurants, see their vibe, menus, and what they’re known for."
              />
              <StepCard
                icon={TbCalendarTime}
                title="Discover"
                text="Check out events, live music nights, and special experiences before they’re gone."
              />
              <StepCard
                icon={FaRegClock}
                title="Reserve"
                text="Pick the time and place that fits your plans — and show up ready to enjoy."
              />
            </SimpleGrid>

            <Text fontSize="sm" color="gray.400">
              Seb’s keeps things clear and simple, so you spend less time
              planning and more time enjoying the moment.
            </Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

/* Small helper for the popup cards */
function StepCard({ icon, title, text }) {
  return (
    <Box
      bg="rgba(10, 11, 14, 0.95)"
      borderRadius="lg"
      p={4}
      borderWidth="1px"
      borderColor="gray.700"
    >
      <Flex align="center" gap={3} mb={2}>
        <Icon as={icon} boxSize={5} color="yellow.300" />
        <Text fontWeight="semibold">{title}</Text>
      </Flex>
      <Text fontSize="sm" color="gray.300">
        {text}
      </Text>
    </Box>
  );
}

export default About;
