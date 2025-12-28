// // src/pages/Events.jsx
// import React, { useMemo, useState } from "react";
// import { AiFillStar } from "react-icons/ai";

// import {
//   Box,
//   Flex,
//   Text,
//   Select,
//   Button,
//   Badge,
//   SimpleGrid,
//   Stack,
//   useColorModeValue,
//   Divider,
//   Image,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalBody,
//   ModalCloseButton,
//   ModalFooter,
//   Textarea,
//   HStack,
//   Icon,
//   AspectRatio,
//   useDisclosure,
// } from "@chakra-ui/react";
// import { useNavigate } from "react-router-dom";

// // -------- EVENTS (The Bear) --------
// const EVENTS = [
//   {
//     id: 1,
//     restaurantId: "the-bear",
//     restaurantName: "The Bear",
//     title: "Live Jazz Night",
//     description: "Smooth jazz with a 3-course dinner set menu.",
//     date: "2025-12-05",
//     time: "20:00", // 24h
//     priceLabel: "BD 15 per person",
//     reservationOnly: true,
//     imageUrl:
//       "https://images.pexels.com/photos/1647161/pexels-photo-1647161.jpeg?auto=compress&cs=tinysrgb&w=800",
//     videoUrl: "https://www.youtube.com/embed/ysz5S6PUM-U", // placeholder video
//   },
//   {
//     id: 2,
//     restaurantId: "the-bear",
//     restaurantName: "The Bear",
//     title: "Sushi & DJ Evening",
//     description: "House music and unlimited sushi from 19:00–22:00.",
//     date: "2025-12-12",
//     time: "19:00", // 24h
//     priceLabel: "BD 18 per person",
//     ticketUrl: "https://example.com/tickets/sushi-dj",
//     imageUrl:
//       "https://images.pexels.com/photos/1047451/pexels-photo-1047451.jpeg?auto=compress&cs=tinysrgb&w=800",
//     videoUrl: "https://www.youtube.com/embed/ysz5S6PUM-U", // placeholder video
//   },
// ];

// // seed some example reviews
// const INITIAL_REVIEWS = {
//   1: [
//     {
//       id: 1,
//       name: "Lara",
//       rating: 5,
//       comment: "Amazing atmosphere, the band was great and food was on point.",
//       date: "2025-11-30",
//     },
//     {
//       id: 2,
//       name: "Ahmed",
//       rating: 4,
//       comment: "Loved the music, wish it went a bit longer.",
//       date: "2025-12-01",
//     },
//   ],
//   2: [
//     {
//       id: 3,
//       name: "Sara",
//       rating: 5,
//       comment: "Sushi was super fresh and the DJ kept the vibe high all night.",
//       date: "2025-12-02",
//     },
//   ],
// };

// const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// // -------- HELPERS --------
// function getDaysForMonth(currentMonth) {
//   const year = currentMonth.getFullYear();
//   const month = currentMonth.getMonth();
//   const daysInMonth = new Date(year, month + 1, 0).getDate();
//   const firstDay = new Date(year, month, 1).getDay();

//   const days = [];
//   for (let i = 0; i < firstDay; i++) days.push(null);
//   for (let day = 1; day <= daysInMonth; day++) {
//     days.push(new Date(year, month, day));
//   }
//   return days;
// }

// function isSameDay(a, b) {
//   return (
//     a.getFullYear() === b.getFullYear() &&
//     a.getMonth() === b.getMonth() &&
//     a.getDate() === b.getDate()
//   );
// }

// // star display (for static ratings)
// function StarRating({ rating, size = 4 }) {
//   if (rating == null) return null;

//   return (
//     <HStack spacing={1}>
//       {[1, 2, 3, 4, 5].map((star) => (
//         <Icon
//           key={star}
//           as={AiFillStar}
//           boxSize={size}
//           color={star <= rating ? "yellow.400" : "gray.600"}
//         />
//       ))}
//     </HStack>
//   );
// }

// // -------- MAIN PAGE --------
// function Events() {
//   const navigate = useNavigate();

//   const [selectedRestaurant, setSelectedRestaurant] = useState("all");
//   const [viewMode, setViewMode] = useState("calendar");
//   const [currentMonth, setCurrentMonth] = useState(() => {
//     const t = new Date();
//     return new Date(t.getFullYear(), t.getMonth(), 1);
//   });
//   const [selectedDate, setSelectedDate] = useState(() => new Date());

//   const [reviewsByEvent, setReviewsByEvent] = useState(INITIAL_REVIEWS);
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [newRating, setNewRating] = useState(0);
//   const [newComment, setNewComment] = useState("");
//   const { isOpen, onOpen, onClose } = useDisclosure();

//   // force dark-ish colors (no white cards)
//   const cardBg = useColorModeValue("gray.900", "gray.900");
//   const cardBorder = useColorModeValue("gray.700", "gray.700");
//   const mutedText = useColorModeValue("gray.400", "gray.400");

//   const restaurants = useMemo(() => {
//     const map = new Map();
//     EVENTS.forEach((e) => map.set(e.restaurantId, e.restaurantName));
//     return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
//   }, []);

//   const filteredEvents = useMemo(
//     () =>
//       selectedRestaurant === "all"
//         ? EVENTS
//         : EVENTS.filter((e) => e.restaurantId === selectedRestaurant),
//     [selectedRestaurant]
//   );

//   const sortedEvents = [...filteredEvents].sort(
//     (a, b) => new Date(a.date) - new Date(b.date)
//   );

//   const eventsForSelectedDate = filteredEvents.filter((e) =>
//     isSameDay(new Date(e.date), selectedDate)
//   );

//   const days = getDaysForMonth(currentMonth);

//   function hasEventsOnDate(date) {
//     return filteredEvents.some((e) => isSameDay(new Date(e.date), date));
//   }

//   // small helpers for 24h + EU-style date
//   function formatDate(dateStr) {
//     return new Date(dateStr).toLocaleDateString("en-GB"); // dd/mm/yyyy
//   }

//   function getAverageRating(eventId) {
//     const list = reviewsByEvent[eventId];
//     if (!list || list.length === 0) return null;
//     const sum = list.reduce((acc, r) => acc + r.rating, 0);
//     return sum / list.length;
//   }

//   const handleOpenDetails = (event) => {
//     setSelectedEvent(event);
//     setNewRating(0);
//     setNewComment("");
//     onOpen();
//   };

//   const handleCloseDetails = () => {
//     onClose();
//     setSelectedEvent(null);
//     setNewRating(0);
//     setNewComment("");
//   };

//   const handleSubmitReview = () => {
//     if (!selectedEvent) return;
//     if (newRating === 0 || newComment.trim() === "") {
//       // you could add a toast here if you want
//       return;
//     }

//     const newReview = {
//       id: Date.now(),
//       name: "Anonymous foodie",
//       rating: newRating,
//       comment: newComment.trim(),
//       date: new Date().toISOString().split("T")[0],
//     };

//     setReviewsByEvent((prev) => {
//       const existing = prev[selectedEvent.id] || [];
//       return {
//         ...prev,
//         [selectedEvent.id]: [...existing, newReview],
//       };
//     });

//     setNewRating(0);
//     setNewComment("");
//   };

//   const selectedEventReviews =
//     selectedEvent && reviewsByEvent[selectedEvent.id]
//       ? reviewsByEvent[selectedEvent.id]
//       : [];

//   return (
//     <Box
//       maxW="1200px"
//       mx="auto"
//       px={{ base: 4, md: 6 }}
//       py={{ base: 6, md: 10 }}
//       color="gray.100"
//     >
//       {/* TOP BAR: back button + title + filters */}
//       <Flex justify="space-between" align="flex-start" mb={8} wrap="wrap" gap={4}>
//         <Box>
//           {/* back button so you can leave the page even if nav is hidden */}
//           <Button
//             size="sm"
//             variant="ghost"
//             onClick={() => navigate(-1)}
//             mb={2}
//           >
//             ← Back
//           </Button>
//           <Text fontSize="3xl" fontWeight="bold">
//             Restaurant Event Calendar
//           </Text>
//           <Text fontSize="md" color={mutedText}>
//             Discover upcoming events hosted by The Bear.
//           </Text>
//         </Box>

//         <Flex gap={4} align="center">
//           <Select
//             value={selectedRestaurant}
//             onChange={(e) => setSelectedRestaurant(e.target.value)}
//             bg="gray.800"
//             borderColor="gray.700"
//             color="gray.200"
//             _hover={{ borderColor: "teal.400" }}
//             minW="180px"
//           >
//             <option value="all">All restaurants</option>
//             {restaurants.map((r) => (
//               <option key={r.id} value={r.id}>
//                 {r.name}
//               </option>
//             ))}
//           </Select>

//           <Flex bg="gray.800" p="2px" borderRadius="full">
//             <Button
//               size="sm"
//               variant={viewMode === "calendar" ? "solid" : "ghost"}
//               borderRadius="full"
//               colorScheme="teal"
//               onClick={() => setViewMode("calendar")}
//             >
//               Calendar
//             </Button>
//             <Button
//               size="sm"
//               variant={viewMode === "list" ? "solid" : "ghost"}
//               borderRadius="full"
//               colorScheme="teal"
//               onClick={() => setViewMode("list")}
//             >
//               List
//             </Button>
//           </Flex>
//         </Flex>
//       </Flex>

//       {/* -------- CALENDAR VIEW -------- */}
//       {viewMode === "calendar" && (
//         <Flex gap={6} wrap="wrap">
//           {/* LEFT: calendar */}
//           <Box
//             flex="2"
//             bg={cardBg}
//             borderRadius="xl"
//             p={6}
//             borderWidth="1px"
//             borderColor={cardBorder}
//           >
//             <Flex justify="space-between" mb={4} align="center">
//               <Button
//                 size="sm"
//                 variant="ghost"
//                 onClick={() =>
//                   setCurrentMonth(
//                     new Date(
//                       currentMonth.getFullYear(),
//                       currentMonth.getMonth() - 1,
//                       1
//                     )
//                   )
//                 }
//               >
//                 ←
//               </Button>
//               <Text fontSize="lg" fontWeight="semibold">
//                 {currentMonth.toLocaleString("default", {
//                   month: "long",
//                   year: "numeric",
//                 })}
//               </Text>
//               <Button
//                 size="sm"
//                 variant="ghost"
//                 onClick={() =>
//                   setCurrentMonth(
//                     new Date(
//                       currentMonth.getFullYear(),
//                       currentMonth.getMonth() + 1,
//                       1
//                     )
//                   )
//                 }
//               >
//                 →
//               </Button>
//             </Flex>

//             {/* Weekday labels */}
//             <SimpleGrid columns={7} mb={2}>
//               {WEEKDAYS.map((d) => (
//                 <Text
//                   key={d}
//                   textAlign="center"
//                   fontSize="sm"
//                   color={mutedText}
//                 >
//                   {d}
//                 </Text>
//               ))}
//             </SimpleGrid>

//             {/* Calendar cells */}
//             <SimpleGrid columns={7} gap={2}>
//               {days.map((date, idx) =>
//                 date ? (
//                   <Box
//                     key={idx}
//                     p={3}
//                     h="70px"
//                     borderWidth="1px"
//                     borderRadius="md"
//                     borderColor={
//                       isSameDay(date, selectedDate) ? "teal.400" : cardBorder
//                     }
//                     bg={
//                       isSameDay(date, selectedDate) ? "teal.900" : "gray.800"
//                     }
//                     color="gray.200"
//                     cursor="pointer"
//                     position="relative"
//                     _hover={{ borderColor: "teal.300" }}
//                     onClick={() => setSelectedDate(date)}
//                   >
//                     <Text fontSize="sm">{date.getDate()}</Text>

//                     {/* ---- icon EVENT INDICATOR ---- */}
//                     {hasEventsOnDate(date) && (
//                       <Box
//                         position="absolute"
//                         bottom="4px"
//                         left="50%"
//                         transform="translateX(-50%)"
//                         color="yellow.300"
//                         fontSize="18px"
//                         filter="drop-shadow(0 0 4px rgba(246, 224, 94, 0.8))"
//                       >
//                         <AiFillStar />
//                       </Box>
//                     )}
//                   </Box>
//                 ) : (
//                   <Box key={idx} />
//                 )
//               )}
//             </SimpleGrid>
//           </Box>

//           {/* RIGHT: events for selected day */}
//           <Box
//             flex="1"
//             bg={cardBg}
//             borderRadius="xl"
//             p={6}
//             borderWidth="1px"
//             borderColor={cardBorder}
//           >
//             <Text fontWeight="bold" fontSize="lg" mb={4}>
//               {selectedDate.toLocaleDateString("en-GB", {
//                 weekday: "long",
//                 day: "numeric",
//                 month: "long",
//               })}
//             </Text>

//             {eventsForSelectedDate.length === 0 ? (
//               <Text color={mutedText}>No events on this date.</Text>
//             ) : (
//               <Stack spacing={4}>
//                 {eventsForSelectedDate.map((event) => (
//                   <EventCard
//                     key={event.id}
//                     event={event}
//                     formatDate={formatDate}
//                     onOpenDetails={() => handleOpenDetails(event)}
//                     averageRating={getAverageRating(event.id)}
//                     reviewCount={
//                       reviewsByEvent[event.id]
//                         ? reviewsByEvent[event.id].length
//                         : 0
//                     }
//                   />
//                 ))}
//               </Stack>
//             )}
//           </Box>
//         </Flex>
//       )}

//       {/* -------- LIST VIEW -------- */}
//       {viewMode === "list" && (
//         <Box
//           bg={cardBg}
//           borderRadius="xl"
//           p={6}
//           borderWidth="1px"
//           borderColor={cardBorder}
//         >
//           <Stack spacing={4}>
//             {sortedEvents.map((event, i) => (
//               <React.Fragment key={event.id}>
//                 {i !== 0 && <Divider borderColor="gray.700" />}
//                 <EventCard
//                   event={event}
//                   formatDate={formatDate}
//                   onOpenDetails={() => handleOpenDetails(event)}
//                   averageRating={getAverageRating(event.id)}
//                   reviewCount={
//                     reviewsByEvent[event.id]
//                       ? reviewsByEvent[event.id].length
//                       : 0
//                   }
//                 />
//               </React.Fragment>
//             ))}
//           </Stack>
//         </Box>
//       )}

//       {/* -------- POP-OUT EVENT DETAILS -------- */}
//       {selectedEvent && (
//         <Modal
//           isOpen={isOpen}
//           onClose={handleCloseDetails}
//           size="xl"
//           isCentered
//         >
//           <ModalOverlay />
//           <ModalContent
//             bg={cardBg}
//             borderColor={cardBorder}
//             borderWidth="1px"
//             maxH="90vh"
//             overflow="hidden"
//           >
//             <ModalHeader>
//               <Flex justify="space-between" align="center" gap={3}>
//                 <Box>
//                   <Flex align="center" gap={2}>
//                     <Text fontWeight="bold" fontSize="lg">
//                       {selectedEvent.title}
//                     </Text>
//                     <Badge colorScheme="teal" fontSize="0.7rem">
//                       {selectedEvent.restaurantName}
//                     </Badge>
//                   </Flex>
//                   <Text fontSize="sm" color={mutedText}>
//                     {formatDate(selectedEvent.date)} • {selectedEvent.time}
//                   </Text>
//                 </Box>
//               </Flex>
//             </ModalHeader>
//             <ModalCloseButton />

//             <ModalBody overflowY="auto" pb={4}>
//               {selectedEvent.imageUrl && (
//                 <Image
//                   src={selectedEvent.imageUrl}
//                   alt={selectedEvent.title}
//                   borderRadius="lg"
//                   mb={4}
//                   w="100%"
//                   h="220px"
//                   objectFit="cover"
//                 />
//               )}

//               {selectedEvent.videoUrl && (
//                 <Box mb={4}>
//                   <Text fontSize="sm" color={mutedText} mb={2}>
//                     A quick look at the vibe:
//                   </Text>
//                   <AspectRatio ratio={16 / 9}>
//                     <iframe
//                       src={selectedEvent.videoUrl}
//                       title="Event vibe video"
//                       allowFullScreen
//                       style={{ borderRadius: "8px" }}
//                     />
//                   </AspectRatio>
//                 </Box>
//               )}

//               <Box mb={4}>
//                 {selectedEvent.priceLabel && (
//                   <Text fontWeight="semibold" mb={1}>
//                     {selectedEvent.priceLabel}
//                   </Text>
//                 )}
//                 <Text color="gray.300">{selectedEvent.description}</Text>
//               </Box>

//               {/* Reviews list */}
//               <Box mt={4}>
//                 <Flex justify="space-between" align="center" mb={2}>
//                   <Text fontWeight="semibold">What guests say</Text>
//                   <Flex align="center" gap={2}>
//                     <StarRating
//                       rating={getAverageRating(selectedEvent.id)}
//                       size={4}
//                     />
//                     <Text fontSize="xs" color={mutedText}>
//                       {selectedEventReviews.length} review
//                       {selectedEventReviews.length !== 1 ? "s" : ""}
//                     </Text>
//                   </Flex>
//                 </Flex>

//                 {selectedEventReviews.length === 0 ? (
//                   <Text fontSize="sm" color={mutedText}>
//                     No feedback yet. Be the first to share your experience!
//                   </Text>
//                 ) : (
//                   <Stack spacing={3}>
//                     {selectedEventReviews.map((review) => (
//                       <Box
//                         key={review.id}
//                         borderWidth="1px"
//                         borderColor="gray.700"
//                         borderRadius="md"
//                         p={3}
//                       >
//                         <Flex justify="space-between" align="center" mb={1}>
//                           <Text fontSize="sm" fontWeight="semibold">
//                             {review.name}
//                           </Text>
//                           <StarRating rating={review.rating} size={3} />
//                         </Flex>
//                         <Text fontSize="sm" color="gray.300" mb={1}>
//                           {review.comment}
//                         </Text>
//                         <Text fontSize="xs" color={mutedText}>
//                           {formatDate(review.date)}
//                         </Text>
//                       </Box>
//                     ))}
//                   </Stack>
//                 )}
//               </Box>

//               {/* Add review */}
//               <Box mt={6}>
//                 <Text fontWeight="semibold">Share your experience</Text>
//                 <Text fontSize="sm" color={mutedText} mb={2}>
//                   Tap the stars and leave a short comment.
//                 </Text>

//                 <HStack mb={3}>
//                   {[1, 2, 3, 4, 5].map((star) => (
//                     <Icon
//                       key={star}
//                       as={AiFillStar}
//                       boxSize={7}
//                       cursor="pointer"
//                       color={star <= newRating ? "yellow.400" : "gray.600"}
//                       onClick={() => setNewRating(star)}
//                     />
//                   ))}
//                 </HStack>

//                 <Textarea
//                   value={newComment}
//                   onChange={(e) => setNewComment(e.target.value)}
//                   placeholder="How was the music, food, and service?"
//                   bg="gray.800"
//                   borderColor="gray.700"
//                   _hover={{ borderColor: "teal.400" }}
//                   _focus={{ borderColor: "teal.300", boxShadow: "0 0 0 1px #38B2AC" }}
//                   rows={3}
//                 />

//                 <Button
//                   mt={3}
//                   size="sm"
//                   colorScheme="teal"
//                   onClick={handleSubmitReview}
//                 >
//                   Submit feedback
//                 </Button>
//               </Box>
//             </ModalBody>

//             <ModalFooter>
//               <Button variant="ghost" size="sm" onClick={handleCloseDetails}>
//                 Close
//               </Button>
//             </ModalFooter>
//           </ModalContent>
//         </Modal>
//       )}
//     </Box>
//   );
// }

// // -------- EVENT CARD --------
// function EventCard({
//   event,
//   formatDate,
//   onOpenDetails = () => {},
//   averageRating,
//   reviewCount,
// }) {
//   return (
//     <Box borderWidth="1px" borderColor="gray.700" borderRadius="md" p={4}>
//       <Flex
//         gap={4}
//         align="stretch"
//         direction={{ base: "column", md: "row" }}
//       >
//         {event.imageUrl && (
//           <Image
//             src={event.imageUrl}
//             alt={event.title}
//             borderRadius="md"
//             w={{ base: "100%", md: "180px" }}
//             h="130px"
//             objectFit="cover"
//           />
//         )}

//         <Box flex="1">
//           <Flex justify="space-between" align="flex-start" gap={3} wrap="wrap">
//             <Box>
//               <Flex align="center" gap={2} mb={1}>
//                 <Text fontWeight="bold" color="teal.300">
//                   {event.title}
//                 </Text>
//                 <Badge colorScheme="teal" fontSize="0.7rem">
//                   {event.restaurantName}
//                 </Badge>
//               </Flex>

//               {/* date = en-GB, time = whatever you type (keep using 24h like "21:30") */}
//               <Text color="gray.400">
//                 {formatDate(event.date)} • {event.time}
//               </Text>

//               {event.priceLabel && (
//                 <Text mt={1} fontWeight="medium">
//                   {event.priceLabel}
//                 </Text>
//               )}

//               <Text mt={2} color="gray.300">
//                 {event.description}
//               </Text>

//               {typeof averageRating === "number" && (
//                 <HStack mt={2} spacing={2}>
//                   <StarRating rating={averageRating} size={4} />
//                   <Text fontSize="xs" color="gray.400">
//                     {averageRating.toFixed(1)} • {reviewCount} review
//                     {reviewCount !== 1 ? "s" : ""}
//                   </Text>
//                 </HStack>
//               )}
//             </Box>

//             <Box display="flex" flexDir="column" gap={2} alignItems="flex-end">
//               {event.ticketUrl ? (
//                 <Button
//                   as="a"
//                   href={event.ticketUrl}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   colorScheme="teal"
//                   size="sm"
//                 >
//                   Get Tickets
//                 </Button>
//               ) : event.reservationOnly ? (
//                 <Button variant="outline" colorScheme="teal" size="sm">
//                   Reserve Spot – Pay at Venue
//                 </Button>
//               ) : (
//                 <Button size="sm">Learn More</Button>
//               )}

//               <Button
//                 size="xs"
//                 variant="ghost"
//                 colorScheme="teal"
//                 onClick={onOpenDetails}
//               >
//                 View details
//               </Button>
//             </Box>
//           </Flex>
//         </Box>
//       </Flex>
//     </Box>
//   );
// }

// export default Events;

import React, { useEffect, useMemo, useState } from "react";
import { AiFillStar } from "react-icons/ai";
import {
  Box,
  Flex,
  Text,
  Select,
  Button,
  Badge,
  SimpleGrid,
  Stack,
  useColorModeValue,
  Divider,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Textarea,
  HStack,
  Icon,
  AspectRatio,
  useDisclosure,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { onValue, ref } from "firebase/database";

// -------- Helpers (same idea as your original) --------
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysForMonth(currentMonth) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }
  return days;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function StarRating({ rating, size = 4 }) {
  if (rating == null) return null;
  return (
    <HStack spacing={1}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon key={star} as={AiFillStar} boxSize={size} color={star <= rating ? "yellow.400" : "gray.600"} />
      ))}
    </HStack>
  );
}

// -------- MAIN PAGE --------
export default function Events() {
  const navigate = useNavigate();

  const [selectedRestaurant, setSelectedRestaurant] = useState("all");
  const [viewMode, setViewMode] = useState("calendar");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  // events loaded from Firebase
  const [eventsByRestaurant, setEventsByRestaurant] = useState({}); // { restaurantId: [events] }

  // reviews are still local/demo for now
  const [reviewsByEvent, setReviewsByEvent] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const cardBg = useColorModeValue("gray.900", "gray.900");
  const cardBorder = useColorModeValue("gray.700", "gray.700");
  const mutedText = useColorModeValue("gray.400", "gray.400");

  // Load ALL events (simple version): events/{restaurantId}/{eventId}
  useEffect(() => {
    const allRef = ref(db, "events");
    return onValue(allRef, (snap) => {
      const val = snap.val() || {};
      // convert into arrays
      const mapped = {};
      Object.entries(val).forEach(([restaurantId, eventsMap]) => {
        const list = Object.entries(eventsMap || {}).map(([id, e]) => ({
          id,
          restaurantId,
          restaurantName: e.restaurantName || "Restaurant",
          ...e,
        }));
        mapped[restaurantId] = list;
      });
      setEventsByRestaurant(mapped);
    });
  }, []);

  // build restaurant dropdown from firebase keys (restaurantId)
  const restaurants = useMemo(() => {
    const list = Object.keys(eventsByRestaurant || {}).map((id) => ({
      id,
      name: "Restaurant", // you can replace by fetching restaurant profile name later
    }));
    // if you have restaurant profiles, you can map id -> real name
    return list;
  }, [eventsByRestaurant]);

  const allEvents = useMemo(() => {
    const flat = [];
    Object.values(eventsByRestaurant || {}).forEach((arr) => flat.push(...arr));
    // sort
    flat.sort((a, b) => new Date(a.date) - new Date(b.date));
    return flat;
  }, [eventsByRestaurant]);

  const filteredEvents = useMemo(() => {
    if (selectedRestaurant === "all") return allEvents;
    return allEvents.filter((e) => e.restaurantId === selectedRestaurant);
  }, [allEvents, selectedRestaurant]);

  const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.date) - new Date(b.date));
  const eventsForSelectedDate = filteredEvents.filter((e) => isSameDay(new Date(e.date), selectedDate));

  const days = getDaysForMonth(currentMonth);

  function hasEventsOnDate(date) {
    return filteredEvents.some((e) => isSameDay(new Date(e.date), date));
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-GB");
  }

  function getAverageRating(eventId) {
    const list = reviewsByEvent[eventId];
    if (!list || list.length === 0) return null;
    const sum = list.reduce((acc, r) => acc + r.rating, 0);
    return sum / list.length;
  }

  const handleOpenDetails = (event) => {
    setSelectedEvent(event);
    setNewRating(0);
    setNewComment("");
    onOpen();
  };

  const handleCloseDetails = () => {
    onClose();
    setSelectedEvent(null);
    setNewRating(0);
    setNewComment("");
  };

  const handleSubmitReview = () => {
    if (!selectedEvent) return;
    if (newRating === 0 || newComment.trim() === "") return;

    const newReview = {
      id: Date.now(),
      name: "Anonymous guest",
      rating: newRating,
      comment: newComment.trim(),
      date: new Date().toISOString().split("T")[0],
    };

    setReviewsByEvent((prev) => {
      const existing = prev[selectedEvent.id] || [];
      return { ...prev, [selectedEvent.id]: [...existing, newReview] };
    });

    setNewRating(0);
    setNewComment("");
  };

  const selectedEventReviews =
    selectedEvent && reviewsByEvent[selectedEvent.id] ? reviewsByEvent[selectedEvent.id] : [];

  return (
    <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 6, md: 10 }} color="gray.100">
      <Flex justify="space-between" align="flex-start" mb={8} wrap="wrap" gap={4}>
        <Box>
          <Button size="sm" variant="ghost" onClick={() => navigate(-1)} mb={2}>
            ← Back
          </Button>
          <Text fontSize="3xl" fontWeight="bold">
            Restaurant Event Calendar
          </Text>
          <Text fontSize="md" color={mutedText}>
            Discover upcoming events hosted by restaurants.
          </Text>
        </Box>

        <Flex gap={4} align="center">
          <Select
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            bg="gray.800"
            borderColor="gray.700"
            color="gray.200"
            _hover={{ borderColor: "teal.400" }}
            minW="180px"
          >
            <option value="all">All restaurants</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.id.slice(0, 6)}…)
              </option>
            ))}
          </Select>

          <Flex bg="gray.800" p="2px" borderRadius="full">
            <Button
              size="sm"
              variant={viewMode === "calendar" ? "solid" : "ghost"}
              borderRadius="full"
              colorScheme="teal"
              onClick={() => setViewMode("calendar")}
            >
              Calendar
            </Button>
            <Button
              size="sm"
              variant={viewMode === "list" ? "solid" : "ghost"}
              borderRadius="full"
              colorScheme="teal"
              onClick={() => setViewMode("list")}
            >
              List
            </Button>
          </Flex>
        </Flex>
      </Flex>

      {viewMode === "calendar" && (
        <Flex gap={6} wrap="wrap">
          <Box flex="2" bg={cardBg} borderRadius="xl" p={6} borderWidth="1px" borderColor={cardBorder}>
            <Flex justify="space-between" mb={4} align="center">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              >
                ←
              </Button>
              <Text fontSize="lg" fontWeight="semibold">
                {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
              </Text>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
              >
                →
              </Button>
            </Flex>

            <SimpleGrid columns={7} mb={2}>
              {WEEKDAYS.map((d) => (
                <Text key={d} textAlign="center" fontSize="sm" color={mutedText}>
                  {d}
                </Text>
              ))}
            </SimpleGrid>

            <SimpleGrid columns={7} gap={2}>
              {days.map((date, idx) =>
                date ? (
                  <Box
                    key={idx}
                    p={3}
                    h="70px"
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor={isSameDay(date, selectedDate) ? "teal.400" : cardBorder}
                    bg={isSameDay(date, selectedDate) ? "teal.900" : "gray.800"}
                    color="gray.200"
                    cursor="pointer"
                    position="relative"
                    _hover={{ borderColor: "teal.300" }}
                    onClick={() => setSelectedDate(date)}
                  >
                    <Text fontSize="sm">{date.getDate()}</Text>
                    {hasEventsOnDate(date) && (
                      <Box
                        position="absolute"
                        bottom="4px"
                        left="50%"
                        transform="translateX(-50%)"
                        color="yellow.300"
                        fontSize="18px"
                        filter="drop-shadow(0 0 4px rgba(246, 224, 94, 0.8))"
                      >
                        <AiFillStar />
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box key={idx} />
                )
              )}
            </SimpleGrid>
          </Box>

          <Box flex="1" bg={cardBg} borderRadius="xl" p={6} borderWidth="1px" borderColor={cardBorder}>
            <Text fontWeight="bold" fontSize="lg" mb={4}>
              {selectedDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
            </Text>

            {eventsForSelectedDate.length === 0 ? (
              <Text color={mutedText}>No events on this date.</Text>
            ) : (
              <Stack spacing={4}>
                {eventsForSelectedDate.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    formatDate={formatDate}
                    onOpenDetails={() => handleOpenDetails(event)}
                    averageRating={getAverageRating(event.id)}
                    reviewCount={reviewsByEvent[event.id] ? reviewsByEvent[event.id].length : 0}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Flex>
      )}

      {viewMode === "list" && (
        <Box bg={cardBg} borderRadius="xl" p={6} borderWidth="1px" borderColor={cardBorder}>
          <Stack spacing={4}>
            {sortedEvents.length === 0 ? (
              <Text color={mutedText}>No events available.</Text>
            ) : (
              sortedEvents.map((event, i) => (
                <React.Fragment key={event.id}>
                  {i !== 0 && <Divider borderColor="gray.700" />}
                  <EventCard
                    event={event}
                    formatDate={formatDate}
                    onOpenDetails={() => handleOpenDetails(event)}
                    averageRating={getAverageRating(event.id)}
                    reviewCount={reviewsByEvent[event.id] ? reviewsByEvent[event.id].length : 0}
                  />
                </React.Fragment>
              ))
            )}
          </Stack>
        </Box>
      )}

      {selectedEvent && (
        <Modal isOpen={isOpen} onClose={handleCloseDetails} size="xl" isCentered>
          <ModalOverlay />
          <ModalContent bg={cardBg} borderColor={cardBorder} borderWidth="1px" maxH="90vh" overflow="hidden">
            <ModalHeader>
              <Flex justify="space-between" align="center" gap={3}>
                <Box>
                  <Flex align="center" gap={2}>
                    <Text fontWeight="bold" fontSize="lg">
                      {selectedEvent.title}
                    </Text>
                    <Badge colorScheme="teal" fontSize="0.7rem">
                      Event
                    </Badge>
                  </Flex>
                  <Text fontSize="sm" color={mutedText}>
                    {formatDate(selectedEvent.date)} • {selectedEvent.time}
                  </Text>
                </Box>
              </Flex>
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody overflowY="auto" pb={4}>
              {selectedEvent.imageUrl && (
                <Image
                  src={selectedEvent.imageUrl}
                  alt={selectedEvent.title}
                  borderRadius="lg"
                  mb={4}
                  w="100%"
                  h="220px"
                  objectFit="cover"
                />
              )}

              {selectedEvent.videoUrl && (
                <Box mb={4}>
                  <Text fontSize="sm" color={mutedText} mb={2}>
                    Event preview:
                  </Text>
                  <AspectRatio ratio={16 / 9}>
                    <iframe src={selectedEvent.videoUrl} title="Event video" allowFullScreen style={{ borderRadius: "8px" }} />
                  </AspectRatio>
                </Box>
              )}

              <Box mb={4}>
                {selectedEvent.priceLabel && (
                  <Text fontWeight="semibold" mb={1}>
                    {selectedEvent.priceLabel}
                  </Text>
                )}
                <Text color="gray.300">{selectedEvent.description}</Text>
              </Box>

              {selectedEvent.ticketUrl ? (
                <Button as="a" href={selectedEvent.ticketUrl} target="_blank" rel="noopener noreferrer" colorScheme="teal" size="sm">
                  Get Tickets
                </Button>
              ) : selectedEvent.reservationOnly ? (
                <Button variant="outline" colorScheme="teal" size="sm">
                  Reserve Spot – Pay at Venue
                </Button>
              ) : null}

              <Box mt={6}>
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontWeight="semibold">What guests say</Text>
                  <Flex align="center" gap={2}>
                    <StarRating rating={getAverageRating(selectedEvent.id)} size={4} />
                    <Text fontSize="xs" color={mutedText}>
                      {selectedEventReviews.length} review{selectedEventReviews.length !== 1 ? "s" : ""}
                    </Text>
                  </Flex>
                </Flex>

                {selectedEventReviews.length === 0 ? (
                  <Text fontSize="sm" color={mutedText}>
                    No feedback yet.
                  </Text>
                ) : (
                  <Stack spacing={3}>
                    {selectedEventReviews.map((review) => (
                      <Box key={review.id} borderWidth="1px" borderColor="gray.700" borderRadius="md" p={3}>
                        <Flex justify="space-between" align="center" mb={1}>
                          <Text fontSize="sm" fontWeight="semibold">
                            {review.name}
                          </Text>
                          <StarRating rating={review.rating} size={3} />
                        </Flex>
                        <Text fontSize="sm" color="gray.300" mb={1}>
                          {review.comment}
                        </Text>
                        <Text fontSize="xs" color={mutedText}>
                          {formatDate(review.date)}
                        </Text>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>

              <Box mt={6}>
                <Text fontWeight="semibold">Share your experience</Text>
                <Text fontSize="sm" color={mutedText} mb={2}>
                  Tap the stars and leave a short comment.
                </Text>

                <HStack mb={3}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon
                      key={star}
                      as={AiFillStar}
                      boxSize={7}
                      cursor="pointer"
                      color={star <= newRating ? "yellow.400" : "gray.600"}
                      onClick={() => setNewRating(star)}
                    />
                  ))}
                </HStack>

                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="How was the event?"
                  bg="gray.800"
                  borderColor="gray.700"
                  _hover={{ borderColor: "teal.400" }}
                  _focus={{ borderColor: "teal.300", boxShadow: "0 0 0 1px #38B2AC" }}
                  rows={3}
                />

                <Button mt={3} size="sm" colorScheme="teal" onClick={handleSubmitReview}>
                  Submit feedback
                </Button>
              </Box>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" size="sm" onClick={handleCloseDetails}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
}

function EventCard({ event, formatDate, onOpenDetails = () => {}, averageRating, reviewCount }) {
  return (
    <Box borderWidth="1px" borderColor="gray.700" borderRadius="md" p={4}>
      <Flex gap={4} align="stretch" direction={{ base: "column", md: "row" }}>
        {event.imageUrl && (
          <Image
            src={event.imageUrl}
            alt={event.title}
            borderRadius="md"
            w={{ base: "100%", md: "180px" }}
            h="130px"
            objectFit="cover"
          />
        )}

        <Box flex="1">
          <Flex justify="space-between" align="flex-start" gap={3} wrap="wrap">
            <Box>
              <Flex align="center" gap={2} mb={1}>
                <Text fontWeight="bold" color="teal.300">
                  {event.title}
                </Text>
                <Badge colorScheme="teal" fontSize="0.7rem">
                  Event
                </Badge>
              </Flex>

              <Text color="gray.400">
                {formatDate(event.date)} • {event.time}
              </Text>

              {event.priceLabel && (
                <Text mt={1} fontWeight="medium">
                  {event.priceLabel}
                </Text>
              )}

              <Text mt={2} color="gray.300" noOfLines={3}>
                {event.description}
              </Text>

              {typeof averageRating === "number" && (
                <HStack mt={2} spacing={2}>
                  <StarRating rating={averageRating} size={4} />
                  <Text fontSize="xs" color="gray.400">
                    {averageRating.toFixed(1)} • {reviewCount} review{reviewCount !== 1 ? "s" : ""}
                  </Text>
                </HStack>
              )}
            </Box>

            <Box display="flex" flexDir="column" gap={2} alignItems="flex-end">
              {event.ticketUrl ? (
                <Button as="a" href={event.ticketUrl} target="_blank" rel="noopener noreferrer" colorScheme="teal" size="sm">
                  Get Tickets
                </Button>
              ) : event.reservationOnly ? (
                <Button variant="outline" colorScheme="teal" size="sm">
                  Reserve Spot – Pay at Venue
                </Button>
              ) : null}

              <Button size="xs" variant="ghost" colorScheme="teal" onClick={onOpenDetails}>
                View details
              </Button>
            </Box>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}
