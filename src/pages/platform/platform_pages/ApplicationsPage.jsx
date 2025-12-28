import {
  Box, Heading, Text, Stack, HStack, Button, Badge,
  useToast, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton, useDisclosure,
  Divider, useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { ref, onValue, update, push, set } from "firebase/database";
import { db, auth } from "../../../firebase";
const PENDING = "pending_review";
const APPROVED = "approved_pending_payment";
const REJECTED = "rejected";

export default function ApplicationsPage() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cardBg = useColorModeValue("white", "gray.900");
  const border = useColorModeValue("blackAlpha.200", "whiteAlpha.200");

  const [restaurants, setRestaurants] = useState({});
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const r = ref(db, "restaurants");
    const unsub = onValue(r, (snap) => setRestaurants(snap.val() || {}));
    return () => unsub();
  }, []);

  const pending = useMemo(() => {
    return Object.entries(restaurants)
      .map(([ownerId, data]) => ({ ownerId, ...data }))
      .filter((r) => (r.status || PENDING) === PENDING);
  }, [restaurants]);

  const logAction = async ({ ownerId, action, newStatus }) => {
    const logRef = push(ref(db, "auditLogs"));
    await set(logRef, {
      ownerId,
      action,
      newStatus,
      adminId: auth.currentUser?.uid || null,
      at: Date.now(),
    });
  };

  const setStatus = async (ownerId, status, action) => {
    try {
      await update(ref(db, `restaurants/${ownerId}`), {
        status,
        reviewedAt: Date.now(),
      });
      await logAction({ ownerId, action, newStatus: status });

      toast({
        title: "Saved",
        description: `Application ${action}`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      onClose();
      setSelected(null);
    } catch (e) {
      console.error(e);
      toast({
        title: "Action failed",
        description: "Your account must be platform_admin (role in users node).",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Box>
          <Heading size="lg">Applications</Heading>
          <Text opacity={0.75}>Pending restaurant applications waiting for approval.</Text>
        </Box>
        <Badge colorScheme="yellow" fontSize="0.9em">{pending.length} Pending</Badge>
      </HStack>

      <Stack spacing={4}>
        {pending.length === 0 ? (
          <Box bg={cardBg} border="1px solid" borderColor={border} rounded="2xl" p={5}>
            <Text opacity={0.7}>No pending applications.</Text>
          </Box>
        ) : (
          pending.map((r) => (
            <Box key={r.ownerId} bg={cardBg} border="1px solid" borderColor={border} rounded="2xl" p={5}>
              <HStack justify="space-between" align="start" wrap="wrap">
                <Box>
                  <Heading size="md">{r.name || "Unnamed restaurant"}</Heading>
                  <Text opacity={0.75} fontSize="sm">
                    CR: {r.crNumber || "-"} • Email: {r.contactEmail || "-"} • Phone: {r.phone || "-"}
                  </Text>
                </Box>
                <HStack>
                  <Button
                    variant="outline"
                    onClick={() => { setSelected(r); onOpen(); }}
                  >
                    View details
                  </Button>
                  <Button colorScheme="purple" onClick={() => setStatus(r.ownerId, APPROVED, "approved")}>
                    Accept
                  </Button>
                  <Button colorScheme="red" variant="outline" onClick={() => setStatus(r.ownerId, REJECTED, "rejected")}>
                    Reject
                  </Button>
                </HStack>
              </HStack>
            </Box>
          ))
        )}
      </Stack>

      {/* Detail modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Application details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {!selected ? null : (
              <Box>
                <Heading size="md" mb={2}>{selected.name || "Unnamed"}</Heading>
                <Divider my={3} />
                <Text><b>OwnerId:</b> {selected.ownerId}</Text>
                <Text><b>CR:</b> {selected.crNumber || "-"}</Text>
                <Text><b>Email:</b> {selected.contactEmail || "-"}</Text>
                <Text><b>Phone:</b> {selected.phone || "-"}</Text>
                <Text><b>Address:</b> {selected.address || "-"}</Text>
                <Text mt={3} opacity={0.8}>{selected.description || ""}</Text>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            {!selected ? null : (
              <HStack>
                <Button colorScheme="purple" onClick={() => setStatus(selected.ownerId, APPROVED, "approved")}>
                  Accept
                </Button>
                <Button colorScheme="red" variant="outline" onClick={() => setStatus(selected.ownerId, REJECTED, "rejected")}>
                  Reject
                </Button>
              </HStack>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
