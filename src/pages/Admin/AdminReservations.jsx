// // src/pages/admin/AdminReservations.jsx
// import {
//   Box,
//   Heading,
//   Table,
//   Thead,
//   Tbody,
//   Tr,
//   Th,
//   Td,
//   Button,
//   Tag,
//   HStack,
//   Text,
//   Badge,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalBody,
//   ModalCloseButton,
//   useDisclosure,
//   useToast,
//   Divider,
// } from "@chakra-ui/react";
// import { useEffect, useMemo, useRef, useState } from "react";
// import { db } from "../../firebase";
// import { ref, onValue, update } from "firebase/database";
// import { useAuth } from "../../auth/AuthContext";
// import { sendNotification } from "../../utils/notify";

// function statusColor(status) {
//   if (status === "pending") return "yellow";
//   if (status === "waitlist_offer") return "purple";
//   if (status === "waitlist_requested") return "purple";
//   if (status === "waitlist_confirmed") return "blue";
//   if (status === "approved") return "green";
//   if (status === "rejected") return "red";
//   if (status === "cancelled") return "gray";
//   if (status === "expired") return "gray";
//   return "gray";
// }

// function statusLabel(status) {
//   if (status === "waitlist_offer") return "waitlist offered";
//   if (status === "waitlist_requested") return "waitlist requested";
//   if (status === "waitlist_confirmed") return "waitlist confirmed";
//   return status || "unknown";
// }

// const ACTIVE_STATUSES = [
//   "pending",
//   "approved",
//   "waitlist_requested",
//   "waitlist_offer",
//   "waitlist_confirmed",
// ];

// export default function AdminReservations() {
//   const { user } = useAuth(); // owner
//   const toast = useToast();

//   const [rows, setRows] = useState([]);
//   const [selected, setSelected] = useState(null);
//   const details = useDisclosure();

//   const seenIdsRef = useRef(new Set());

//   useEffect(() => {
//     if (!user?.uid) return;

//     const rRef = ref(db, "reservations");
//     const unsub = onValue(
//       rRef,
//       (snap) => {
//         const data = snap.val() || {};
//         const now = Date.now();

//         const list = Object.entries(data).map(([id, r]) => ({ id, ...r }));

//         // Only reservations for THIS owner restaurant
//         const mine = list.filter((r) => r.restaurantId === user.uid);

//         // Auto-expire pending
//         mine.forEach((r) => {
//           if (r.status === "pending" && r.expiresAt && r.expiresAt < now) {
//             update(ref(db, `reservations/${r.id}`), {
//               status: "expired",
//               handledAt: Date.now(),
//             });
//           }
//         });

//         // Toast when new reservation comes in (pending OR waitlist_requested)
//         mine
//           .filter((r) => r.status === "pending" || r.status === "waitlist_requested")
//           .forEach((r) => {
//             if (!seenIdsRef.current.has(r.id)) {
//               seenIdsRef.current.add(r.id);
//               toast({
//                 title:
//                   r.status === "waitlist_requested"
//                     ? "New waitlist request"
//                     : "New reservation request",
//                 description: `${r.userName || "Guest"} • ${r.date} ${r.time} • ${r.guests} guests • Table ${r.tableLabel}`,
//                 status: "info",
//                 duration: 6000,
//                 isClosable: true,
//               });
//             }
//           });

//         // newest first
//         mine.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
//         setRows(mine);
//       },
//       (err) => console.error(err)
//     );

//     return () => unsub();
//   }, [user?.uid, toast]);

//   const pendingCount = useMemo(
//     () =>
//       rows.filter((r) => r.status === "pending" || r.status === "waitlist_requested")
//         .length,
//     [rows]
//   );

//   // For quick "table already taken" warning in UI
//   const isConflictApproved = (r) => {
//     return rows.some(
//       (x) =>
//         x.id !== r.id &&
//         x.restaurantId === r.restaurantId &&
//         x.date === r.date &&
//         x.timeSlotId === r.timeSlotId &&
//         x.tableId === r.tableId &&
//         x.status === "approved"
//     );
//   };

//   // ----- ACTION HELPERS (with notifications) -----

//   const rejectWithReason = async (reservation, reasonText) => {
//     await update(ref(db, `reservations/${reservation.id}`), {
//       status: "rejected",
//       handledAt: Date.now(),
//       rejectReason: reasonText || null,
//     });

//     if (reservation.userId) {
//       await sendNotification(reservation.userId, {
//         title: "Reservation rejected ❌",
//         message:
//           reasonText ||
//           `Your booking at ${reservation.restaurantName || "the restaurant"} on ${reservation.date} at ${reservation.time} was rejected.`,
//         link: "/profile",
//         type: "rejected",
//       });
//     }
//   };

//   const approve = async (r) => {
//     // safety: if another reservation is already approved for same slot/table, warn and block
//     if (isConflictApproved(r)) {
//       toast({
//         title: "Table already approved",
//         description: "Another reservation is already approved for this table/time.",
//         status: "error",
//         duration: 4000,
//         isClosable: true,
//       });
//       return;
//     }

//     // 1) Approve chosen reservation
//     await update(ref(db, `reservations/${r.id}`), {
//       status: "approved",
//       handledAt: Date.now(),
//     });

//     // 2) Notify the approved customer
//     if (r.userId) {
//       await sendNotification(r.userId, {
//         title: "Reservation approved ✅",
//         message: `Your booking at ${r.restaurantName || "the restaurant"} on ${r.date} at ${r.time} is approved.`,
//         link: "/profile",
//         type: "approved",
//       });
//     }

//     // 3) Auto-reject competing reservations for same restaurant + date + slot + table
//     const competitors = rows.filter(
//       (x) =>
//         x.id !== r.id &&
//         x.restaurantId === r.restaurantId &&
//         x.date === r.date &&
//         x.timeSlotId === r.timeSlotId &&
//         x.tableId === r.tableId &&
//         ACTIVE_STATUSES.includes(x.status) &&
//         x.status !== "approved"
//     );

//     for (const c of competitors) {
//       await rejectWithReason(
//         c,
//         `This table/time was approved for another guest (${r.tableLabel} on ${r.date} at ${r.time}).`
//       );
//     }

//     toast({
//       title: "Approved",
//       description:
//         competitors.length > 0
//           ? `Approved and rejected ${competitors.length} competing request(s).`
//           : "Approved successfully.",
//       status: "success",
//       duration: 3000,
//       isClosable: true,
//     });
//   };

//   const reject = async (r) => {
//     await update(ref(db, `reservations/${r.id}`), {
//       status: "rejected",
//       handledAt: Date.now(),
//     });

//     if (r.userId) {
//       await sendNotification(r.userId, {
//         title: "Reservation rejected ❌",
//         message: `Your booking at ${r.restaurantName || "the restaurant"} on ${r.date} at ${r.time} was rejected.`,
//         link: "/profile",
//         type: "rejected",
//       });
//     }

//     toast({ title: "Rejected", status: "info", duration: 2500, isClosable: true });
//   };

//   // Admin OFFERS waiting list (customer must confirm + enter phone)
//   const offerWaitlist = async (r) => {
//     await update(ref(db, `reservations/${r.id}`), {
//       status: "waitlist_offer",
//       handledAt: Date.now(),
//     });

//     if (r.userId) {
//       await sendNotification(r.userId, {
//         title: "Waiting list option ⏳",
//         message:
//           "We can’t confirm this table right now. Join the waiting list? Add your WhatsApp number.",
//         link: "/profile",
//         type: "waitlist",
//       });
//     }

//     toast({ title: "Waitlist offered", status: "warning", duration: 2500, isClosable: true });
//   };

//   // If customer requested waitlist, admin confirms
//   const acceptWaitlistRequest = async (r) => {
//     await update(ref(db, `reservations/${r.id}`), {
//       status: "waitlist_confirmed",
//       handledAt: Date.now(),
//     });

//     if (r.userId) {
//       await sendNotification(r.userId, {
//         title: "Waitlist confirmed ⏳",
//         message:
//           "Your waitlist request is confirmed. We’ll notify you if the table becomes available.",
//         link: "/profile",
//         type: "waitlist",
//       });
//     }

//     toast({ title: "Waitlist confirmed", status: "warning", duration: 2500, isClosable: true });
//   };

//   return (
//     <Box color="white">
//       <HStack mb={6} spacing={3}>
//         <Heading>Reservations</Heading>
//         {pendingCount > 0 && (
//           <Badge colorScheme="red" borderRadius="full" px={3} py={1}>
//             {pendingCount} new
//           </Badge>
//         )}
//       </HStack>

//       <Table size="sm" variant="simple">
//         <Thead>
//           <Tr>
//             <Th color="whiteAlpha.700">Guest</Th>
//             <Th color="whiteAlpha.700">Date</Th>
//             <Th color="whiteAlpha.700">Time</Th>
//             <Th color="whiteAlpha.700">Guests</Th>
//             <Th color="whiteAlpha.700">Table</Th>
//             <Th color="whiteAlpha.700">Status</Th>
//             <Th color="whiteAlpha.700" isNumeric>
//               Actions
//             </Th>
//           </Tr>
//         </Thead>

//         <Tbody>
//           {rows.map((r) => {
//             const conflict = isConflictApproved(r);

//             return (
//               <Tr key={r.id} opacity={conflict && r.status !== "approved" ? 0.6 : 1}>
//                 <Td>{r.userName || "Guest"}</Td>
//                 <Td>{r.date}</Td>
//                 <Td>{r.time}</Td>
//                 <Td>{r.guests}</Td>
//                 <Td>
//                   <HStack spacing={2}>
//                     <Text>{r.tableLabel}</Text>
//                     {conflict && r.status !== "approved" && (
//                       <Tag size="sm" colorScheme="red">
//                         taken
//                       </Tag>
//                     )}
//                   </HStack>
//                 </Td>
//                 <Td>
//                   <Tag colorScheme={statusColor(r.status)}>{statusLabel(r.status)}</Tag>
//                 </Td>

//                 <Td isNumeric>
//                   <HStack justify="flex-end">
//                     <Button
//                       size="xs"
//                       variant="outline"
//                       borderColor="whiteAlpha.300"
//                       onClick={() => {
//                         setSelected(r);
//                         details.onOpen();
//                       }}
//                     >
//                       View
//                     </Button>

//                     {/* Pending actions */}
//                     {r.status === "pending" && (
//                       <>
//                         <Button size="xs" colorScheme="purple" onClick={() => offerWaitlist(r)}>
//                           Waitlist
//                         </Button>
//                         <Button size="xs" colorScheme="green" onClick={() => approve(r)}>
//                           Approve
//                         </Button>
//                         <Button size="xs" colorScheme="red" variant="outline" onClick={() => reject(r)}>
//                           Reject
//                         </Button>
//                       </>
//                     )}

//                     {/* Waitlist requested actions */}
//                     {r.status === "waitlist_requested" && (
//                       <>
//                         <Button size="xs" colorScheme="purple" onClick={() => acceptWaitlistRequest(r)}>
//                           Confirm Waitlist
//                         </Button>
//                         <Button size="xs" colorScheme="green" onClick={() => approve(r)}>
//                           Approve
//                         </Button>
//                         <Button size="xs" colorScheme="red" variant="outline" onClick={() => reject(r)}>
//                           Reject
//                         </Button>
//                       </>
//                     )}

//                     {/* Waitlist confirmed actions */}
//                     {r.status === "waitlist_confirmed" && (
//                       <>
//                         <Button size="xs" colorScheme="green" onClick={() => approve(r)}>
//                           Approve
//                         </Button>
//                         <Button size="xs" colorScheme="red" variant="outline" onClick={() => reject(r)}>
//                           Reject
//                         </Button>
//                       </>
//                     )}
//                   </HStack>
//                 </Td>
//               </Tr>
//             );
//           })}
//         </Tbody>
//       </Table>

//       {rows.length === 0 && (
//         <Text mt={4} color="whiteAlpha.600">
//           No reservations yet.
//         </Text>
//       )}

//       {/* DETAILS MODAL */}
//       <Modal isOpen={details.isOpen} onClose={details.onClose} isCentered size="lg">
//         <ModalOverlay />
//         <ModalContent bg="neutral.800" border="1px solid" borderColor="whiteAlpha.200">
//           <ModalCloseButton color="white" />
//           <ModalBody p={6} color="white">
//             <Heading size="md" mb={2}>
//               Reservation details
//             </Heading>

//             {!selected ? (
//               <Text color="whiteAlpha.700">No reservation selected.</Text>
//             ) : (
//               <>
//                 <Text color="whiteAlpha.900">
//                   <b>Restaurant:</b> {selected.restaurantName}
//                 </Text>
//                 <Text color="whiteAlpha.900">
//                   <b>Guest:</b> {selected.userName} ({selected.userEmail})
//                 </Text>
//                 <Text color="whiteAlpha.900">
//                   <b>Date:</b> {selected.date}
//                 </Text>
//                 <Text color="whiteAlpha.900">
//                   <b>Time:</b> {selected.time} • {selected.area}
//                 </Text>
//                 <Text color="whiteAlpha.900">
//                   <b>Guests:</b> {selected.guests}
//                 </Text>
//                 <Text color="whiteAlpha.900">
//                   <b>Table:</b> {selected.tableLabel}
//                 </Text>

//                 {selected.waitlistPhone && (
//                   <Text color="whiteAlpha.900">
//                     <b>Waitlist phone:</b> {selected.waitlistPhone}
//                   </Text>
//                 )}

//                 <Divider my={3} borderColor="whiteAlpha.200" />

//                 <Text color="whiteAlpha.800">
//                   <b>Occasion:</b> {selected.occasion || "-"}
//                 </Text>
//                 <Text color="whiteAlpha.800">
//                   <b>Allergies:</b> {(selected.allergies || []).join(", ") || "-"}
//                 </Text>
//                 <Text color="whiteAlpha.800">
//                   <b>Other allergies:</b> {selected.otherAllergies || "-"}
//                 </Text>
//                 <Text color="whiteAlpha.800">
//                   <b>Health notes:</b> {selected.healthNotes || "-"}
//                 </Text>
//                 <Text color="whiteAlpha.800">
//                   <b>Notes:</b> {selected.notes || "-"}
//                 </Text>

//                 {selected.rejectReason && (
//                   <>
//                     <Divider my={3} borderColor="whiteAlpha.200" />
//                     <Text color="red.200">
//                       <b>Reject reason:</b> {selected.rejectReason}
//                     </Text>
//                   </>
//                 )}
//               </>
//             )}
//           </ModalBody>
//         </ModalContent>
//       </Modal>
//     </Box>
//   );
// }



import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Tag,
  HStack,
  Text,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Divider,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { db } from "../../firebase";
import { ref, onValue, update, push, set } from "firebase/database";
import { useAuth } from "../../auth/AuthContext";
import { sendNotification } from "../../utils/notify";

function statusColor(status) {
  if (status === "pending") return "yellow";
  if (status === "waitlist_offer") return "purple";
  if (status === "waitlist_requested") return "purple";
  if (status === "waitlist_confirmed") return "blue";
  if (status === "approved") return "green";
  if (status === "rejected") return "red";
  if (status === "cancelled") return "gray";
  if (status === "expired") return "gray";
  return "gray";
}

function statusLabel(status) {
  if (status === "waitlist_offer") return "waitlist offered";
  if (status === "waitlist_requested") return "waitlist requested";
  if (status === "waitlist_confirmed") return "waitlist confirmed";
  return status || "unknown";
}

const ACTIVE_STATUSES = [
  "pending",
  "approved",
  "waitlist_requested",
  "waitlist_offer",
  "waitlist_confirmed",
];

// ---- EMAIL QUEUE (DEMO-FRIENDLY) ----
// This does NOT send real emails by itself.
// It writes an "email outbox" record to Realtime DB at /emailOutbox,
// which you can later process with a Firebase Cloud Function (recommended)
// or any backend worker to actually send emails.
async function queueEmail({ to, subject, body, reservationId, userId, status }) {
  if (!to) return;
  const outboxRef = push(ref(db, "emailOutbox"));
  await set(outboxRef, {
    to: String(to).trim().toLowerCase(),
    subject: subject || "Seb's notification",
    body: body || "",
    reservationId: reservationId || null,
    userId: userId || null,
    status: status || null,
    createdAt: Date.now(),
    provider: "demo_outbox",
  });
}

export default function AdminReservations() {
  const { user } = useAuth(); // owner
  const toast = useToast();

  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const details = useDisclosure();

  const seenIdsRef = useRef(new Set());

  useEffect(() => {
    if (!user?.uid) return;

    const rRef = ref(db, "reservations");
    const unsub = onValue(
      rRef,
      (snap) => {
        const data = snap.val() || {};
        const now = Date.now();

        const list = Object.entries(data).map(([id, r]) => ({ id, ...r }));

        // Only reservations for THIS owner restaurant
        const mine = list.filter((r) => r.restaurantId === user.uid);

        // Auto-expire pending
        mine.forEach((r) => {
          if (r.status === "pending" && r.expiresAt && r.expiresAt < now) {
            update(ref(db, `reservations/${r.id}`), {
              status: "expired",
              handledAt: Date.now(),
            });
          }
        });

        // Toast when new reservation comes in (pending OR waitlist_requested)
        mine
          .filter((r) => r.status === "pending" || r.status === "waitlist_requested")
          .forEach((r) => {
            if (!seenIdsRef.current.has(r.id)) {
              seenIdsRef.current.add(r.id);
              toast({
                title:
                  r.status === "waitlist_requested"
                    ? "New waitlist request"
                    : "New reservation request",
                description: `${r.userName || "Guest"} • ${r.date} ${r.time} • ${r.guests} guests • Table ${r.tableLabel}`,
                status: "info",
                duration: 6000,
                isClosable: true,
              });
            }
          });

        // newest first
        mine.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setRows(mine);
      },
      (err) => console.error(err)
    );

    return () => unsub();
  }, [user?.uid, toast]);

  const pendingCount = useMemo(
    () =>
      rows.filter((r) => r.status === "pending" || r.status === "waitlist_requested")
        .length,
    [rows]
  );

  // For quick "table already taken" warning in UI
  const isConflictApproved = (r) => {
    return rows.some(
      (x) =>
        x.id !== r.id &&
        x.restaurantId === r.restaurantId &&
        x.date === r.date &&
        x.timeSlotId === r.timeSlotId &&
        x.tableId === r.tableId &&
        x.status === "approved"
    );
  };

  // ----- ACTION HELPERS (with notifications) -----

  const rejectWithReason = async (reservation, reasonText) => {
    await update(ref(db, `reservations/${reservation.id}`), {
      status: "rejected",
      handledAt: Date.now(),
      rejectReason: reasonText || null,
    });

    if (reservation.userId) {
      const msg =
        reasonText ||
        `Your booking at ${reservation.restaurantName || "the restaurant"} on ${reservation.date} at ${reservation.time} was rejected.`;

      await sendNotification(reservation.userId, {
        title: "Reservation rejected ❌",
        message: msg,
        link: "/profile",
        type: "rejected",
      });

      // Email outbox entry (demo-friendly)
      await queueEmail({
        to: reservation.userEmail,
        subject: "Seb’s — Reservation rejected",
        body: msg,
        reservationId: reservation.id,
        userId: reservation.userId,
        status: "rejected",
      });
    }
  };

  const approve = async (r) => {
    // safety: if another reservation is already approved for same slot/table, warn and block
    if (isConflictApproved(r)) {
      toast({
        title: "Table already approved",
        description: "Another reservation is already approved for this table/time.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    // 1) Approve chosen reservation
    await update(ref(db, `reservations/${r.id}`), {
      status: "approved",
      handledAt: Date.now(),
    });

    // 2) Notify the approved customer
    if (r.userId) {
      const msg = `Your booking at ${r.restaurantName || "the restaurant"} on ${r.date} at ${r.time} is approved.`;

      await sendNotification(r.userId, {
        title: "Reservation approved ✅",
        message: msg,
        link: "/profile",
        type: "approved",
      });

      // Email outbox entry (demo-friendly)
      await queueEmail({
        to: r.userEmail,
        subject: "Seb’s — Reservation approved",
        body: msg,
        reservationId: r.id,
        userId: r.userId,
        status: "approved",
      });
    }

    // 3) Auto-reject competing reservations for same restaurant + date + slot + table
    const competitors = rows.filter(
      (x) =>
        x.id !== r.id &&
        x.restaurantId === r.restaurantId &&
        x.date === r.date &&
        x.timeSlotId === r.timeSlotId &&
        x.tableId === r.tableId &&
        ACTIVE_STATUSES.includes(x.status) &&
        x.status !== "approved"
    );

    for (const c of competitors) {
      await rejectWithReason(
        c,
        `This table/time was approved for another guest (${r.tableLabel} on ${r.date} at ${r.time}).`
      );
    }

    toast({
      title: "Approved",
      description:
        competitors.length > 0
          ? `Approved and rejected ${competitors.length} competing request(s).`
          : "Approved successfully.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const reject = async (r) => {
    await update(ref(db, `reservations/${r.id}`), {
      status: "rejected",
      handledAt: Date.now(),
    });

    if (r.userId) {
      const msg = `Your booking at ${r.restaurantName || "the restaurant"} on ${r.date} at ${r.time} was rejected.`;

      await sendNotification(r.userId, {
        title: "Reservation rejected ❌",
        message: msg,
        link: "/profile",
        type: "rejected",
      });

      // Email outbox entry (demo-friendly)
      await queueEmail({
        to: r.userEmail,
        subject: "Seb’s — Reservation rejected",
        body: msg,
        reservationId: r.id,
        userId: r.userId,
        status: "rejected",
      });
    }

    toast({ title: "Rejected", status: "info", duration: 2500, isClosable: true });
  };

  // Admin OFFERS waiting list (customer must confirm + enter phone)
  const offerWaitlist = async (r) => {
    await update(ref(db, `reservations/${r.id}`), {
      status: "waitlist_offer",
      handledAt: Date.now(),
    });

    if (r.userId) {
      const msg =
        "We can’t confirm this table right now. Join the waiting list? Add your WhatsApp number.";

      await sendNotification(r.userId, {
        title: "Waiting list option ⏳",
        message: msg,
        link: "/profile",
        type: "waitlist",
      });

      // Email outbox entry (demo-friendly)
      await queueEmail({
        to: r.userEmail,
        subject: "Seb’s — Waiting list option",
        body: msg,
        reservationId: r.id,
        userId: r.userId,
        status: "waitlist_offer",
      });
    }

    toast({ title: "Waitlist offered", status: "warning", duration: 2500, isClosable: true });
  };

  // If customer requested waitlist, admin confirms
  const acceptWaitlistRequest = async (r) => {
    await update(ref(db, `reservations/${r.id}`), {
      status: "waitlist_confirmed",
      handledAt: Date.now(),
    });

    if (r.userId) {
      const msg =
        "Your waitlist request is confirmed. We’ll notify you if the table becomes available.";

      await sendNotification(r.userId, {
        title: "Waitlist confirmed ⏳",
        message: msg,
        link: "/profile",
        type: "waitlist",
      });

      // Email outbox entry (demo-friendly)
      await queueEmail({
        to: r.userEmail,
        subject: "Seb’s — Waitlist confirmed",
        body: msg,
        reservationId: r.id,
        userId: r.userId,
        status: "waitlist_confirmed",
      });
    }

    toast({ title: "Waitlist confirmed", status: "warning", duration: 2500, isClosable: true });
  };

  return (
    <Box color="white">
      <HStack mb={6} spacing={3}>
        <Heading>Reservations</Heading>
        {pendingCount > 0 && (
          <Badge colorScheme="red" borderRadius="full" px={3} py={1}>
            {pendingCount} new
          </Badge>
        )}
      </HStack>

      <Table size="sm" variant="simple">
        <Thead>
          <Tr>
            <Th color="whiteAlpha.700">Guest</Th>
            <Th color="whiteAlpha.700">Date</Th>
            <Th color="whiteAlpha.700">Time</Th>
            <Th color="whiteAlpha.700">Guests</Th>
            <Th color="whiteAlpha.700">Table</Th>
            <Th color="whiteAlpha.700">Status</Th>
            <Th color="whiteAlpha.700" isNumeric>
              Actions
            </Th>
          </Tr>
        </Thead>

        <Tbody>
          {rows.map((r) => {
            const conflict = isConflictApproved(r);

            return (
              <Tr key={r.id} opacity={conflict && r.status !== "approved" ? 0.6 : 1}>
                <Td>{r.userName || "Guest"}</Td>
                <Td>{r.date}</Td>
                <Td>{r.time}</Td>
                <Td>{r.guests}</Td>
                <Td>
                  <HStack spacing={2}>
                    <Text>{r.tableLabel}</Text>
                    {conflict && r.status !== "approved" && (
                      <Tag size="sm" colorScheme="red">
                        taken
                      </Tag>
                    )}
                  </HStack>
                </Td>
                <Td>
                  <Tag colorScheme={statusColor(r.status)}>{statusLabel(r.status)}</Tag>
                </Td>

                <Td isNumeric>
                  <HStack justify="flex-end">
                    <Button
                      size="xs"
                      variant="outline"
                      borderColor="whiteAlpha.300"
                      onClick={() => {
                        setSelected(r);
                        details.onOpen();
                      }}
                    >
                      View
                    </Button>

                    {/* Pending actions */}
                    {r.status === "pending" && (
                      <>
                        <Button size="xs" colorScheme="purple" onClick={() => offerWaitlist(r)}>
                          Waitlist
                        </Button>
                        <Button size="xs" colorScheme="green" onClick={() => approve(r)}>
                          Approve
                        </Button>
                        <Button size="xs" colorScheme="red" variant="outline" onClick={() => reject(r)}>
                          Reject
                        </Button>
                      </>
                    )}

                    {/* Waitlist requested actions */}
                    {r.status === "waitlist_requested" && (
                      <>
                        <Button size="xs" colorScheme="purple" onClick={() => acceptWaitlistRequest(r)}>
                          Confirm Waitlist
                        </Button>
                        <Button size="xs" colorScheme="green" onClick={() => approve(r)}>
                          Approve
                        </Button>
                        <Button size="xs" colorScheme="red" variant="outline" onClick={() => reject(r)}>
                          Reject
                        </Button>
                      </>
                    )}

                    {/* Waitlist confirmed actions */}
                    {r.status === "waitlist_confirmed" && (
                      <>
                        <Button size="xs" colorScheme="green" onClick={() => approve(r)}>
                          Approve
                        </Button>
                        <Button size="xs" colorScheme="red" variant="outline" onClick={() => reject(r)}>
                          Reject
                        </Button>
                      </>
                    )}
                  </HStack>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>

      {rows.length === 0 && (
        <Text mt={4} color="whiteAlpha.600">
          No reservations yet.
        </Text>
      )}

      {/* DETAILS MODAL */}
      <Modal isOpen={details.isOpen} onClose={details.onClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent bg="neutral.800" border="1px solid" borderColor="whiteAlpha.200">
          <ModalCloseButton color="white" />
          <ModalBody p={6} color="white">
            <Heading size="md" mb={2}>
              Reservation details
            </Heading>

            {!selected ? (
              <Text color="whiteAlpha.700">No reservation selected.</Text>
            ) : (
              <>
                <Text color="whiteAlpha.900">
                  <b>Restaurant:</b> {selected.restaurantName}
                </Text>
                <Text color="whiteAlpha.900">
                  <b>Guest:</b> {selected.userName} ({selected.userEmail})
                </Text>
                <Text color="whiteAlpha.900">
                  <b>Date:</b> {selected.date}
                </Text>
                <Text color="whiteAlpha.900">
                  <b>Time:</b> {selected.time} • {selected.area}
                </Text>
                <Text color="whiteAlpha.900">
                  <b>Guests:</b> {selected.guests}
                </Text>
                <Text color="whiteAlpha.900">
                  <b>Table:</b> {selected.tableLabel}
                </Text>

                {selected.waitlistPhone && (
                  <Text color="whiteAlpha.900">
                    <b>Waitlist phone:</b> {selected.waitlistPhone}
                  </Text>
                )}

                <Divider my={3} borderColor="whiteAlpha.200" />

                <Text color="whiteAlpha.800">
                  <b>Occasion:</b> {selected.occasion || "-"}
                </Text>
                <Text color="whiteAlpha.800">
                  <b>Allergies:</b> {(selected.allergies || []).join(", ") || "-"}
                </Text>
                <Text color="whiteAlpha.800">
                  <b>Other allergies:</b> {selected.otherAllergies || "-"}
                </Text>
                <Text color="whiteAlpha.800">
                  <b>Health notes:</b> {selected.healthNotes || "-"}
                </Text>
                <Text color="whiteAlpha.800">
                  <b>Notes:</b> {selected.notes || "-"}
                </Text>

                {selected.rejectReason && (
                  <>
                    <Divider my={3} borderColor="whiteAlpha.200" />
                    <Text color="red.200">
                      <b>Reject reason:</b> {selected.rejectReason}
                    </Text>
                  </>
                )}
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
