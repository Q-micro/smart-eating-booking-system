// import {
//   Box,
//   Heading,
//   Text,
//   Tabs,
//   TabList,
//   TabPanels,
//   Tab,
//   TabPanel,
//   Stack,
//   HStack,
//   Badge,
//   Button,
//   useToast,
//   useColorModeValue,
//   Image,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   ModalCloseButton,
//   useDisclosure,
//   Divider,
//   SimpleGrid,
// } from "@chakra-ui/react";
// import { useEffect, useMemo, useState } from "react";
// import { ref, onValue, update, push, set } from "firebase/database";
// import { db, auth } from "../../../firebase";

// const STATUS = {
//   PENDING: "pending_review",
//   APPROVED: "approved_pending_payment",
//   ACTIVE: "active",
//   REJECTED: "rejected",
// };

// const normalizeStatus = (s) => String(s || STATUS.PENDING).trim().toLowerCase();

// function formatDate(ts) {
//   if (!ts) return "—";
//   try {
//     return new Date(ts).toLocaleString();
//   } catch {
//     return "—";
//   }
// }

// /**
//  * COVER IMAGE FIELD:
//  * Your restaurant object might store photos in different fields.
//  * This function tries common names. Adjust if yours differs.
//  */
// function getCoverUrl(r) {
//   return (
//     r?.coverImageUrl ||
//     r?.outsideImageUrl ||
//     r?.imageUrl ||
//     r?.photoUrl ||
//     (Array.isArray(r?.photos) ? r.photos[0] : null) ||
//     (Array.isArray(r?.images) ? r.images[0] : null) ||
//     null
//   );
// }

// export default function RestaurantsPage() {
//   const toast = useToast();
//   const cardBg = useColorModeValue("white", "gray.800");
//   const border = useColorModeValue("blackAlpha.200", "whiteAlpha.200");
//   const muted = useColorModeValue("gray.600", "whiteAlpha.700");

//   const [restaurantsRaw, setRestaurantsRaw] = useState({});
//   const [selected, setSelected] = useState(null);
//   const details = useDisclosure();

//   useEffect(() => {
//     const r = ref(db, "restaurants");
//     const unsub = onValue(r, (snap) => setRestaurantsRaw(snap.val() || {}));
//     return () => unsub();
//   }, []);

//   const list = useMemo(() => {
//     return Object.entries(restaurantsRaw || {}).map(([ownerId, data]) => ({
//       ownerId,
//       ...data,
//       status: normalizeStatus(data?.status),
//     }));
//   }, [restaurantsRaw]);

//   const byStatus = (s) => list.filter((r) => r.status === s);

//   const pending = byStatus(STATUS.PENDING);
//   const approved = byStatus(STATUS.APPROVED);
//   const active = byStatus(STATUS.ACTIVE);
//   const rejected = byStatus(STATUS.REJECTED);

//   const logAction = async ({ ownerId, action, newStatus }) => {
//     const logRef = push(ref(db, "auditLogs"));
//     await set(logRef, {
//       ownerId,
//       action,
//       newStatus,
//       adminId: auth.currentUser?.uid || null,
//       at: Date.now(),
//     });
//   };

//   const markActivePaid = async (ownerId) => {
//     try {
//       const now = Date.now();
//       await update(ref(db, `restaurants/${ownerId}`), {
//         status: STATUS.ACTIVE,
//         activeSince: now,
//         // optional fields (only if you want them)
//         paymentStatus: "paid",
//         paidAt: now,
//       });
//       await logAction({ ownerId, action: "marked_active", newStatus: STATUS.ACTIVE });

//       toast({
//         title: "Restaurant activated",
//         description: "Marked as Active and saved activeSince date.",
//         status: "success",
//         duration: 2500,
//         isClosable: true,
//       });
//     } catch (e) {
//       console.error(e);
//       toast({
//         title: "Failed to activate",
//         description: "Check platform_admin role + rules.",
//         status: "error",
//         duration: 3500,
//         isClosable: true,
//       });
//     }
//   };

//   const statusBadge = (s) => {
//     if (s === STATUS.PENDING) return <Badge colorScheme="yellow">pending</Badge>;
//     if (s === STATUS.APPROVED) return <Badge colorScheme="purple">awaiting payment</Badge>;
//     if (s === STATUS.ACTIVE) return <Badge colorScheme="green">active</Badge>;
//     if (s === STATUS.REJECTED) return <Badge colorScheme="red">rejected</Badge>;
//     return <Badge>unknown</Badge>;
//   };

// const RestaurantCard = ({ r }) => {
//   const cover = getCoverUrl(r);

//   const joined =
//     r.createdAt || r.activeSince || r.reviewedAt || null;

//   return (
//     <Box
//       bg={cardBg}
//       border="1px solid"
//       borderColor={border}
//       rounded="xl"
//       p={4}
//     >
//       <HStack align="start" spacing={4}>
//         {/* LEFT: thumbnail */}
//         <Box
//           w="96px"
//           h="96px"
//           rounded="lg"
//           overflow="hidden"
//           flexShrink={0}
//           bg={useColorModeValue("gray.100", "whiteAlpha.100")}
//         >
//           {cover ? (
//             <Image
//               src={cover}
//               alt="Restaurant"
//               w="100%"
//               h="100%"
//               objectFit="cover"
//             />
//           ) : (
//             <Box
//               w="100%"
//               h="100%"
//               display="flex"
//               alignItems="center"
//               justifyContent="center"
//             >
//               <Text fontSize="xs" color={muted}>
//                 No image
//               </Text>
//             </Box>
//           )}
//         </Box>

//         {/* RIGHT: content */}
//         <Box flex="1">
//           <HStack justify="space-between" align="start">
//             <Box>
//               <HStack spacing={2} wrap="wrap">
//                 <Heading size="sm">
//                   {r.name || "Unnamed restaurant"}
//                 </Heading>
//                 {statusBadge(r.status)}
//               </HStack>

//               <Text mt={1} fontSize="sm" color={muted}>
//                 Joined: {formatDate(joined)}
//               </Text>

//               <Text fontSize="sm" color={muted}>
//                 {r.contactEmail || "—"} • {r.phone || "—"}
//               </Text>
//             </Box>

//             {/* ACTION */}
//             <Button
//               variant="link"
//               colorScheme="purple"
//               onClick={() => {
//                 setSelected({ ...r, cover });
//                 details.onOpen();
//               }}
//             >
//               View details →
//             </Button>
//           </HStack>
//         </Box>
//       </HStack>
//     </Box>
//   );
// };


//   const Panel = ({ items }) => (
//     <Stack spacing={4} mt={4}>
//       {items.length === 0 ? (
//         <Box bg={cardBg} border="1px solid" borderColor={border} rounded="2xl" p={5}>
//           <Text color={muted}>Nothing here.</Text>
//         </Box>
//       ) : (
//         items.map((r) => <RestaurantCard key={r.ownerId} r={r} />)
//       )}
//     </Stack>
//   );

//   return (
//     <Box>
//       <HStack justify="space-between" mb={2} wrap="wrap">
//         <Box>
//           <Heading size="lg">Restaurants</Heading>
//           <Text color={muted}>All restaurants grouped by status.</Text>
//         </Box>
//         <Badge variant="outline" borderColor={border} color={muted}>
//           {list.length} total
//         </Badge>
//       </HStack>

//       <Tabs variant="soft-rounded" colorScheme="purple">
//         <TabList wrap="wrap" gap={2} mt={4}>
//           <Tab>Pending ({pending.length})</Tab>
//           <Tab>Approved ({approved.length})</Tab>
//           <Tab>Active ({active.length})</Tab>
//           <Tab>Rejected ({rejected.length})</Tab>
//         </TabList>

//         <TabPanels>
//           <TabPanel p={0}><Panel items={pending} /></TabPanel>
//           <TabPanel p={0}><Panel items={approved} /></TabPanel>
//           <TabPanel p={0}><Panel items={active} /></TabPanel>
//           <TabPanel p={0}><Panel items={rejected} /></TabPanel>
//         </TabPanels>
//       </Tabs>

//       {/* Details Modal */}
//       <Modal isOpen={details.isOpen} onClose={details.onClose} size="xl">
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>Restaurant Details</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             {!selected ? null : (
//               <Box>
//                 {/* image */}
//                 <Box rounded="xl" overflow="hidden" border="1px solid" borderColor={border} mb={4}>
//                   {selected.cover ? (
//                     <Image src={selected.cover} alt="Restaurant" w="100%" h="220px" objectFit="cover" />
//                   ) : (
//                     <Box h="220px" bg={useColorModeValue("gray.100", "whiteAlpha.100")} display="flex" alignItems="center" justifyContent="center">
//                       <Text color={muted}>No outside photo</Text>
//                     </Box>
//                   )}
//                 </Box>

//                 <HStack justify="space-between" wrap="wrap">
//                   <Box>
//                     <Heading size="md">{selected.name || "Unnamed restaurant"}</Heading>
//                     <Text color={muted} fontSize="sm" mt={1}>
//                       {statusBadge(selected.status)}
//                     </Text>
//                   </Box>
//                 </HStack>

//                 <Divider my={4} />

//                 <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
//                   <Text><b>OwnerId:</b> {selected.ownerId}</Text>
//                   <Text><b>CR:</b> {selected.crNumber || "—"}</Text>
//                   <Text><b>Email:</b> {selected.contactEmail || "—"}</Text>
//                   <Text><b>Phone:</b> {selected.phone || "—"}</Text>
//                   <Text><b>Address:</b> {selected.address || "—"}</Text>
//                   <Text><b>Cuisine:</b> {selected.cuisine || "—"}</Text>
//                   <Text><b>Plan:</b> {selected.plan || "—"}</Text>
//                   <Text><b>Active since:</b> {formatDate(selected.activeSince)}</Text>
//                   <Text><b>Created:</b> {formatDate(selected.createdAt)}</Text>
//                   <Text><b>Reviewed:</b> {formatDate(selected.reviewedAt)}</Text>
//                 </SimpleGrid>

//                 {selected.description ? (
//                   <>
//                     <Divider my={4} />
//                     <Text color={muted}>{selected.description}</Text>
//                   </>
//                 ) : null}
//               </Box>
//             )}
//           </ModalBody>

//           <ModalFooter>
//             <HStack>
//               <Button variant="outline" onClick={details.onClose}>Close</Button>
//               {selected?.status === STATUS.APPROVED ? (
//                 <Button colorScheme="green" onClick={() => markActivePaid(selected.ownerId)}>
//                   Mark Active (paid)
//                 </Button>
//               ) : null}
//             </HStack>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </Box>
//   );
// }

import {
  Box,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stack,
  HStack,
  Badge,
  Button,
  useToast,
  useColorModeValue,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Divider,
  SimpleGrid,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ref, onValue, update, push, set, remove } from "firebase/database";
import { db, auth } from "../../../firebase";

const STATUS = {
  PENDING: "pending_review",
  APPROVED: "approved_pending_payment",
  ACTIVE: "active",
  REJECTED: "rejected",
};

const normalizeStatus = (s) => String(s || STATUS.PENDING).trim().toLowerCase();

function formatDate(ts) {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "—";
  }
}

/**
 * COVER IMAGE FIELD:
 * Your restaurant object might store photos in different fields.
 * This function tries common names. Adjust if yours differs.
 */
function getCoverUrl(r) {
  return (
    r?.coverImageUrl ||
    r?.outsideImageUrl ||
    r?.imageUrl ||
    r?.photoUrl ||
    (Array.isArray(r?.photos) ? r.photos[0] : null) ||
    (Array.isArray(r?.images) ? r.images[0] : null) ||
    null
  );
}

export default function RestaurantsPage() {
  const toast = useToast();
  const cardBg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("blackAlpha.200", "whiteAlpha.200");
  const muted = useColorModeValue("gray.600", "whiteAlpha.700");

  const [restaurantsRaw, setRestaurantsRaw] = useState({});
  const [selected, setSelected] = useState(null);

  const details = useDisclosure();

  // delete confirm dialog
  const deleteDialog = useDisclosure();
  const cancelRef = useRef();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const r = ref(db, "restaurants");
    const unsub = onValue(r, (snap) => setRestaurantsRaw(snap.val() || {}));
    return () => unsub();
  }, []);

  const list = useMemo(() => {
    return Object.entries(restaurantsRaw || {}).map(([ownerId, data]) => ({
      ownerId,
      ...data,
      status: normalizeStatus(data?.status),
    }));
  }, [restaurantsRaw]);

  const byStatus = (s) => list.filter((r) => r.status === s);

  const pending = byStatus(STATUS.PENDING);
  const approved = byStatus(STATUS.APPROVED);
  const active = byStatus(STATUS.ACTIVE);
  const rejected = byStatus(STATUS.REJECTED);

  const logAction = async ({ ownerId, action, newStatus }) => {
    const logRef = push(ref(db, "auditLogs"));
    await set(logRef, {
      ownerId,
      action,
      newStatus: newStatus || null,
      adminId: auth.currentUser?.uid || null,
      at: Date.now(),
    });
  };

  const markActivePaid = async (ownerId) => {
    try {
      const now = Date.now();
      await update(ref(db, `restaurants/${ownerId}`), {
        status: STATUS.ACTIVE,
        activeSince: now,
        paymentStatus: "paid",
        paidAt: now,
      });
      await logAction({
        ownerId,
        action: "marked_active",
        newStatus: STATUS.ACTIVE,
      });

      toast({
        title: "Restaurant activated",
        description: "Marked as Active and saved activeSince date.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Failed to activate",
        description: "Check platform_admin role + rules.",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    }
  };

  const deleteRestaurant = async (ownerId) => {
    if (!ownerId) return;
    setIsDeleting(true);
    try {
      // HARD DELETE: removes from DB so it disappears for customers immediately
      await remove(ref(db, `restaurants/${ownerId}`));

      await logAction({
        ownerId,
        action: "deleted_restaurant",
        newStatus: "deleted",
      });

      toast({
        title: "Restaurant deleted",
        description: "Removed from the database and hidden from customers.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      // close dialogs + clear selection
      deleteDialog.onClose();
      details.onClose();
      setSelected(null);
    } catch (e) {
      console.error(e);
      toast({
        title: "Delete failed",
        description: "Check your Firebase rules / admin permissions.",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const statusBadge = (s) => {
    if (s === STATUS.PENDING) return <Badge colorScheme="yellow">pending</Badge>;
    if (s === STATUS.APPROVED)
      return <Badge colorScheme="purple">awaiting payment</Badge>;
    if (s === STATUS.ACTIVE) return <Badge colorScheme="green">active</Badge>;
    if (s === STATUS.REJECTED) return <Badge colorScheme="red">rejected</Badge>;
    return <Badge>unknown</Badge>;
  };

  const RestaurantCard = ({ r }) => {
    const cover = getCoverUrl(r);

    const joined = r.createdAt || r.activeSince || r.reviewedAt || null;

    return (
      <Box bg={cardBg} border="1px solid" borderColor={border} rounded="xl" p={4}>
        <HStack align="start" spacing={4}>
          {/* LEFT: thumbnail */}
          <Box
            w="96px"
            h="96px"
            rounded="lg"
            overflow="hidden"
            flexShrink={0}
            bg={useColorModeValue("gray.100", "whiteAlpha.100")}
          >
            {cover ? (
              <Image src={cover} alt="Restaurant" w="100%" h="100%" objectFit="cover" />
            ) : (
              <Box
                w="100%"
                h="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="xs" color={muted}>
                  No image
                </Text>
              </Box>
            )}
          </Box>

          {/* RIGHT: content */}
          <Box flex="1">
            <HStack justify="space-between" align="start">
              <Box>
                <HStack spacing={2} wrap="wrap">
                  <Heading size="sm">{r.name || "Unnamed restaurant"}</Heading>
                  {statusBadge(r.status)}
                </HStack>

                <Text mt={1} fontSize="sm" color={muted}>
                  Joined: {formatDate(joined)}
                </Text>

                <Text fontSize="sm" color={muted}>
                  {r.contactEmail || "—"} • {r.phone || "—"}
                </Text>
              </Box>

              {/* ACTION */}
              <Button
                variant="link"
                colorScheme="purple"
                onClick={() => {
                  setSelected({ ...r, cover });
                  details.onOpen();
                }}
              >
                View details →
              </Button>
            </HStack>
          </Box>
        </HStack>
      </Box>
    );
  };

  const Panel = ({ items }) => (
    <Stack spacing={4} mt={4}>
      {items.length === 0 ? (
        <Box bg={cardBg} border="1px solid" borderColor={border} rounded="2xl" p={5}>
          <Text color={muted}>Nothing here.</Text>
        </Box>
      ) : (
        items.map((r) => <RestaurantCard key={r.ownerId} r={r} />)
      )}
    </Stack>
  );

  return (
    <Box>
      <HStack justify="space-between" mb={2} wrap="wrap">
        <Box>
          <Heading size="lg">Restaurants</Heading>
          <Text color={muted}>All restaurants grouped by status.</Text>
        </Box>
        <Badge variant="outline" borderColor={border} color={muted}>
          {list.length} total
        </Badge>
      </HStack>

      <Tabs variant="soft-rounded" colorScheme="purple">
        <TabList wrap="wrap" gap={2} mt={4}>
          <Tab>Pending ({pending.length})</Tab>
          <Tab>Approved ({approved.length})</Tab>
          <Tab>Active ({active.length})</Tab>
          <Tab>Rejected ({rejected.length})</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            <Panel items={pending} />
          </TabPanel>
          <TabPanel p={0}>
            <Panel items={approved} />
          </TabPanel>
          <TabPanel p={0}>
            <Panel items={active} />
          </TabPanel>
          <TabPanel p={0}>
            <Panel items={rejected} />
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Details Modal */}
      <Modal isOpen={details.isOpen} onClose={details.onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Restaurant Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {!selected ? null : (
              <Box>
                {/* image */}
                <Box
                  rounded="xl"
                  overflow="hidden"
                  border="1px solid"
                  borderColor={border}
                  mb={4}
                >
                  {selected.cover ? (
                    <Image
                      src={selected.cover}
                      alt="Restaurant"
                      w="100%"
                      h="220px"
                      objectFit="cover"
                    />
                  ) : (
                    <Box
                      h="220px"
                      bg={useColorModeValue("gray.100", "whiteAlpha.100")}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text color={muted}>No outside photo</Text>
                    </Box>
                  )}
                </Box>

                <HStack justify="space-between" wrap="wrap">
                  <Box>
                    <Heading size="md">{selected.name || "Unnamed restaurant"}</Heading>
                    <Text color={muted} fontSize="sm" mt={1}>
                      {statusBadge(selected.status)}
                    </Text>
                  </Box>
                </HStack>

                <Divider my={4} />

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  <Text>
                    <b>OwnerId:</b> {selected.ownerId}
                  </Text>
                  <Text>
                    <b>CR:</b> {selected.crNumber || "—"}
                  </Text>
                  <Text>
                    <b>Email:</b> {selected.contactEmail || "—"}
                  </Text>
                  <Text>
                    <b>Phone:</b> {selected.phone || "—"}
                  </Text>
                  <Text>
                    <b>Address:</b> {selected.address || "—"}
                  </Text>
                  <Text>
                    <b>Cuisine:</b> {selected.cuisine || "—"}
                  </Text>
                  <Text>
                    <b>Plan:</b> {selected.plan || "—"}
                  </Text>
                  <Text>
                    <b>Active since:</b> {formatDate(selected.activeSince)}
                  </Text>
                  <Text>
                    <b>Created:</b> {formatDate(selected.createdAt)}
                  </Text>
                  <Text>
                    <b>Reviewed:</b> {formatDate(selected.reviewedAt)}
                  </Text>
                </SimpleGrid>

                {selected.description ? (
                  <>
                    <Divider my={4} />
                    <Text color={muted}>{selected.description}</Text>
                  </>
                ) : null}
              </Box>
            )}
          </ModalBody>

          <ModalFooter>
            <HStack>
              <Button variant="outline" onClick={details.onClose}>
                Close
              </Button>

              {selected?.status === STATUS.APPROVED ? (
                <Button
                  colorScheme="green"
                  onClick={() => markActivePaid(selected.ownerId)}
                >
                  Mark Active (paid)
                </Button>
              ) : null}

              {/* DELETE */}
              {selected?.ownerId ? (
                <Button
                  colorScheme="red"
                  variant="solid"
                  onClick={deleteDialog.onOpen}
                >
                  Delete
                </Button>
              ) : null}
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={deleteDialog.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={deleteDialog.onClose}
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Restaurant
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure? This will permanently remove{" "}
            <b>{selected?.name || "this restaurant"}</b> from the database and it will
            disappear for customers.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={deleteDialog.onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              ml={3}
              isLoading={isDeleting}
              onClick={() => deleteRestaurant(selected?.ownerId)}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
}
