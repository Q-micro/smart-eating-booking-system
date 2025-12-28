// src/components/HelpFloatingButton.jsx
import {
  Box,
  Button,
  Icon,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  SimpleGrid,
  Flex,
  Tooltip,
  keyframes,
} from "@chakra-ui/react";

import { TbHelpCircle } from "react-icons/tb";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import { TbCalendarTime } from "react-icons/tb";
import { FaRegClock } from "react-icons/fa";

// animations
const pulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0px rgba(246,224,94,0.0);
  }
  50% {
    transform: scale(1.08);
    box-shadow: 0 0 18px rgba(246,224,94,0.9);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0px rgba(246,224,94,0.0);
  }
`;

const slideIn = keyframes`
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0px);
    opacity: 1;
  }
`;

export function HelpFloatingButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {/* Floating Icon Button */}
      <Box
        position="fixed"
        bottom="20px"
        right="20px"
        zIndex="9999"
      >
        <Tooltip label="Can I help?" placement="left" hasArrow>
          <Button
            onClick={onOpen}
            borderRadius="full"
            w="48px"
            h="48px"
            minW="48px"
            p={0}
            bg="yellow.400"
            color="#050608"
            _hover={{ bg: "yellow.300" }}
            _active={{ bg: "yellow.500" }}
            animation={`${slideIn} 0.5s ease-out, ${pulse} 2.4s ease-out 0.8s infinite`}
          >
            <Icon as={TbHelpCircle} boxSize={6} />
          </Button>
        </Tooltip>
      </Box>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent bg="#07080b" border="1px solid" borderColor="gray.700">
          <ModalHeader color="yellow.300">How to use Seb’s</ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <Text fontSize="sm" color="gray.400" mb={4}>
              Seb’s helps you plan the perfect night. Here’s how:
            </Text>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={5}>
              <HelpCard
                icon={MdOutlineRestaurantMenu}
                title="Explore"
                text="Browse restaurants, menus, and vibes."
              />
              <HelpCard
                icon={TbCalendarTime}
                title="Discover"
                text="Find live music, themed nights, and events."
              />
              <HelpCard
                icon={FaRegClock}
                title="Reserve"
                text="Book the perfect table for your night."
              />
            </SimpleGrid>

            <Text fontSize="sm" color="gray.400">
              Seb’s keeps things simple — so you spend less time planning and
              more time enjoying the moment.
            </Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

/* Help card in modal */
function HelpCard({ icon, title, text }) {
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
