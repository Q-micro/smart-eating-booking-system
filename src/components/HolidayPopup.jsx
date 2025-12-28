// HolidayPopup.jsx
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Image,
  Text,
  Button,
  Flex,
  Box,
  Heading,
  Badge,
  Icon,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { FaTree } from "react-icons/fa";
import promoImg from "../assets/seblol.png";

// Animate the actual ModalContent
const MotionModalContent = motion(ModalContent);

export default function HolidayPopup() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Auto-open once after page load
  useEffect(() => {
    const timer = setTimeout(onOpen, 800);
    return () => clearTimeout(timer);
  }, [onOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="3xl">
      <ModalOverlay bg="blackAlpha.700" />

      <MotionModalContent
        role="dialog"
        aria-modal="true"
        aria-label="Holiday promotion"
        // animation
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        // styling
        bgGradient="linear(to-br, neutral.900, neutral.800)"
        color="neutral.50"
        borderRadius="2xl"
        overflow="hidden"
        boxShadow="2xl"
        maxW="3xl"
        w="100%"
        position="relative"
      >
        <ModalCloseButton
          top={3}
          right={3}
          color="neutral.100"
          _hover={{ color: "brand.100" }}
        />

        <ModalBody p={0}>
          <Flex
            direction={{ base: "column", md: "row" }}
            align="stretch"
            minH={{ base: "auto", md: "340px" }}
          >
            {/* LEFT: IMAGE */}
            <Box
              flex="0.9"
              maxW={{ base: "100%", md: "42%" }}
              bg="black"
              overflow="hidden"
            >
              <Image
                src={promoImg}
                alt="Christmas dinner & music"
                h="100%"
                w="100%"
                objectFit="cover"
              />
            </Box>

            {/* RIGHT: TEXT + CTA */}
            <Box
              flex="1.1"
              p={{ base: 5, md: 7 }}
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              gap={4}
            >
              <Box>
                <Badge
                  mb={3}
                  px={3}
                  py={1}
                  borderRadius="full"
                  bg="brand.400"
                  color="neutral.900"
                  fontSize="0.7rem"
                  letterSpacing="0.12em"
                  textTransform="uppercase"
                >
                  Christmas Eve Special
                </Badge>

                <Flex align="center" gap={3} mb={2}>
                  <Icon as={FaTree} boxSize={6} color="brand.200" />
                  <Heading
                    as="h2"
                    fontSize={{ base: "xl", md: "2xl" }}
                    color="brand.100"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                  >
                    Holiday Spirit
                  </Heading>
                </Flex>

                <Text fontSize="md" color="neutral.100" mb={3}>
                  Live Christmas music, warm candlelight, and a festive dinner
                  to make your Christmas Eve unforgettable.
                </Text>

                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  color="brand.200"
                  mb={1}
                >
                  🎁 Holiday Discount: Exclusive savings on Christmas Eve
                  reservations!
                </Text>

                <Text fontSize="sm" color="neutral.200">
                  Limited seats available — book now to secure your table and
                  enjoy our special holiday offer.
                </Text>
              </Box>

              <Button
                mt={2}
                alignSelf="stretch"
                colorScheme="brand"
                bg="brand.400"
                color="neutral.900"
                fontWeight="semibold"
                letterSpacing="0.12em"
                textTransform="uppercase"
                py={6}
                _hover={{
                  bg: "brand.500",
                  boxShadow: "0 0 20px rgba(233,165,53,0.6)",
                }}
                _active={{ bg: "brand.600" }}
                onClick={onClose}
              >
                Reserve Now & Save
              </Button>
            </Box>
          </Flex>
        </ModalBody>
      </MotionModalContent>
    </Modal>
  );
}
