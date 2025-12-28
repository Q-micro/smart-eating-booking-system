import {
  Box,
  Heading,
  Text,
  Button,
  Stack,
  HStack,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminWelcome() {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const hidden = localStorage.getItem("hideWelcomeNav") === "1";
    if (hidden) navigate("/admin/restaurant");
  }, [navigate]);

  return (
    <Box
      position="relative"
      minH={{ base: "calc(100vh - 64px)", md: "calc(100vh - 72px)" }}
      color="white"
      bg="gray.900"
    >
      {/* Picture on far right - from public folder */}
      <Image
        src="/dashA.jpg"
        alt="Dashboard preview"
        position="absolute"
        top="7%"
        right={{ base: 5, md: 10, lg: 20 }}
        w={{ base: "200px", md: "300px", lg: "400px" }}
        h="auto"
        rounded="2xl"
        boxShadow="2xl"
        zIndex={1}
      />

      <Box position="relative" zIndex={2} px={{ base: 5, md: 10 }} py={{ base: 12, md: 20 }}>
        <Stack spacing={6} maxW="2xl">
          <Heading
            fontFamily="'Cedarville Cursive', cursive"
            fontWeight="normal"
            fontSize={{ base: "3xl", md: "4xl", lg: "4xl" }}
            lineHeight="1.1"
            mb={1}
          >
            Welcome to Seb&apos;s
          </Heading>

          <Text fontSize={{ base: "md", md: "lg" }} color="whiteAlpha.900">
            Where Efficient Booking Meets Better Business.
          </Text>

          <HStack spacing={4} flexWrap="wrap">
            <Button
              bg="blue.600"
              _hover={{ bg: "blue.500" }}
              color="white"
              onClick={() => navigate("/admin/restaurant")}
            >
              Let&apos;s get started
            </Button>

            <Button
              variant="outline"
              borderColor="whiteAlpha.400"
              color="white"
              _hover={{ bg: "whiteAlpha.200" }}
              onClick={onOpen}
            >
              Read rules & policies
            </Button>
          </HStack>

         
        </Stack>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside" isCentered>
        <ModalOverlay />
        <ModalContent
          bg="gray.900"
          color="white"
          border="1px solid"
          borderColor="whiteAlpha.200"
          rounded="2xl"
        >
          <ModalHeader>Rules, Terms & Privacy Policy</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack spacing={4} color="whiteAlpha.900" fontSize="sm">
              <Text>
                This administrative portal is provided to restaurant owners and authorized personnel for the purpose of
                managing restaurant information and reservation operations. By accessing or using this portal, you agree
                to comply with the following requirements.
              </Text>

              <Heading size="sm">1. Accuracy and Integrity of Information</Heading>
              <Text>
                You must ensure that all restaurant information is accurate, complete, and updated as needed, including
                business name, address, contact details, opening hours, menus, and service policies. Any misleading,
                false, or materially inaccurate information may result in restriction, suspension, or removal of the
                listing.
              </Text>

              <Heading size="sm">2. Reservation Administration</Heading>
              <Text>
                You are responsible for honoring accepted reservations and maintaining appropriate capacity settings
                (tables, time slots, party-size limits). Repeated cancellations, failure to honor reservations, or
                negligent reservation handling may result in account review or operational restrictions.
              </Text>

              <Heading size="sm">3. Authorized Access and Security</Heading>
              <Text>
                Administrative credentials must be protected. Access must be granted only to authorized staff and must
                be revoked promptly when no longer required. You are responsible for actions taken under your account
                and any associated staff access.
              </Text>

              <Heading size="sm">4. Content Standards and Intellectual Property</Heading>
              <Text>
                You may upload only materials that you own or have permission to use, including logos, photographs, and
                menu content. Infringing, unauthorized, or deceptive content may be removed and may result in account
                action.
              </Text>

              <Heading size="sm">5. Customer Data and Privacy</Heading>
              <Text>
                Customer reservation information must be used solely for reservation fulfillment and customer service
                related to bookings. You may not sell, distribute, or use customer data for unrelated marketing without
                lawful consent or a valid legal basis.
              </Text>

              <Heading size="sm">6. Enforcement and Compliance</Heading>
              <Text>
                Violations of these requirements may result in warnings, feature limitations, temporary suspension, or
                removal from the platform. Verification or documentation may be requested when necessary to maintain
                platform integrity.
              </Text>

              <HStack justify="flex-end" pt={2}>
                <Button variant="outline" borderColor="whiteAlpha.300" onClick={onClose}>
                  Close
                </Button>
                <Button
                  bg="blue.600"
                  _hover={{ bg: "blue.500" }}
                  onClick={() => {
                    onClose();
                    navigate("/admin/restaurant");
                  }}
                >
                  Continue
                </Button>
              </HStack>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
