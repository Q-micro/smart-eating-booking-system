// import {
//   Box,
//   Flex,
//   Heading,
//   Text,
//   Stack,
//   SimpleGrid,
//   Badge,
//   Button,
//   HStack,
//   Divider,
//   Image,
//   useToast,
//   Tabs,
//   TabList,
//   TabPanels,
//   Tab,
//   TabPanel,
//   Input,
//   InputGroup,
//   InputLeftElement,
//   Tag,
//   IconButton,
// } from "@chakra-ui/react";
// import { SearchIcon, ArrowDownIcon } from "@chakra-ui/icons";
// import { useEffect, useMemo, useRef, useState } from "react";
// import { db
//  } from "../../firebase";
// import { ref, onValue, update, push, set } from "firebase/database";
// import { useAuth } from "../../auth/AuthContext.jsx";

// import ceoVideo from "../../assets/ceo_vid.mp4";

// /* ---------------- helpers ---------------- */

// function statusMeta(status) {
//   if (status === "pending_review") return { label: "Pending Review", scheme: "yellow" };
//   if (status === "approved_pending_payment")
//     return { label: "Approved (Awaiting Payment)", scheme: "purple" };
//   if (status === "active") return { label: "Active", scheme: "green" };
//   if (status === "rejected") return { label: "Rejected", scheme: "red" };
//   return { label: status || "Unknown", scheme: "gray" };
// }

// function GlassCard({ children, ...props }) {
//   return (
//     <Box
//       bg="rgba(255,255,255,0.06)"
//       border="1px solid"
//       borderColor="whiteAlpha.200"
//       rounded="2xl"
//       p={{ base: 4, md: 5 }}
//       backdropFilter="blur(10px)"
//       boxShadow="0 20px 60px rgba(0,0,0,0.35)"
//       {...props}
//     >
//       {children}
//     </Box>
//   );
// }

// function SideNavButton({ active, children, ...props }) {
//   return (
//     <Button
//       size="sm"
//       justifyContent="flex-start"
//       variant={active ? "solid" : "ghost"}
//       bg={active ? "whiteAlpha.200" : "transparent"}
//       _hover={{ bg: "whiteAlpha.200" }}
//       color="white"
//       borderRadius="lg"
//       {...props}
//     >
//       {children}
//     </Button>
//   );
// }

// /* -------------- main -------------- */

// export default function PlatformDashboard() {
//   const { user } = useAuth();
//   const toast = useToast();

//   const dashRef = useRef(null);

//   const [restaurants, setRestaurants] = useState({});
//   const [query, setQuery] = useState("");

//   useEffect(() => {
//     const rRef = ref(db, "restaurants");
//     return onValue(
//       rRef,
//       (snap) => setRestaurants(snap.val() || {}),
//       (err) => console.error(err)
//     );
//   }, []);

//   const allList = useMemo(() => {
//     return Object.entries(restaurants).map(([ownerId, r]) => ({
//       ownerId,
//       ...r,
//     }));
//   }, [restaurants]);

//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     if (!q) return allList;
//     return allList.filter((r) => {
//       const hay = [
//         r.name,
//         r.cuisine,
//         r.crNumber,
//         r.contactEmail,
//         r.phone,
//         r.address,
//         r.ownerId,
//         r.plan,
//         r.status,
//       ]
//         .filter(Boolean)
//         .join(" ")
//         .toLowerCase();
//       return hay.includes(q);
//     });
//   }, [allList, query]);

//   const groups = useMemo(() => {
//     const g = {
//       pending_review: [],
//       approved_pending_payment: [],
//       active: [],
//       rejected: [],
//     };

//     for (const r of filtered) {
//       const key = r.status || "pending_review";
//       if (!g[key]) g[key] = [];
//       g[key].push(r);
//     }
//     return g;
//   }, [filtered]);

//   const logAction = async ({ ownerId, action }) => {
//     const logRef = push(ref(db, "auditLogs"));
//     await set(logRef, {
//       ownerId,
//       action, // approve | reject
//       adminId: user?.uid || null,
//       at: Date.now(),
//     });
//   };

//   const approve = async (ownerId) => {
//     try {
//       await update(ref(db, `restaurants/${ownerId}`), {
//         status: "approved_pending_payment",
//         reviewedAt: Date.now(),
//       });
//       await logAction({ ownerId, action: "approve" });

//       toast({
//         title: "Approved",
//         description: "Restaurant approved. Awaiting owner payment.",
//         status: "success",
//         duration: 2800,
//         isClosable: true,
//       });
//     } catch (err) {
//       console.error(err);
//       toast({
//         title: "Approve failed",
//         description: "Check RTDB rules + platform_admin role.",
//         status: "error",
//         duration: 3500,
//         isClosable: true,
//       });
//     }
//   };

//   const reject = async (ownerId) => {
//     try {
//       await update(ref(db, `restaurants/${ownerId}`), {
//         status: "rejected",
//         reviewedAt: Date.now(),
//       });
//       await logAction({ ownerId, action: "reject" });

//       toast({
//         title: "Rejected",
//         description: "Saved to history (not deleted).",
//         status: "info",
//         duration: 2800,
//         isClosable: true,
//       });
//     } catch (err) {
//       console.error(err);
//       toast({
//         title: "Reject failed",
//         description: "Check RTDB rules + platform_admin role.",
//         status: "error",
//         duration: 3500,
//         isClosable: true,
//       });
//     }
//   };

//   const scrollToDashboard = () => {
//     dashRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
//   };

//   const Panel = ({ title, subtitle, list, allowActions }) => (
//     <Box>
//       <HStack justify="space-between" mb={4}>
//         <Box>
//           <Heading size="md">{title}</Heading>
//           <Text color="whiteAlpha.700" fontSize="sm">
//             {subtitle}
//           </Text>
//         </Box>
//         <Tag bg="whiteAlpha.200" color="whiteAlpha.900">
//           {list.length}
//         </Tag>
//       </HStack>

//       {list.length === 0 ? (
//         <GlassCard>
//           <Text color="whiteAlpha.700">Nothing here yet.</Text>
//         </GlassCard>
//       ) : (
//         <Stack spacing={5}>
//           {list.map((r) => {
//             const s = statusMeta(r.status);
//             return (
//               <GlassCard key={r.ownerId}>
//                 <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
//                   <Box>
//                     <HStack mb={2} spacing={3} flexWrap="wrap">
//                       <Heading size="md">{r.name || "Unnamed"}</Heading>
//                       <Badge colorScheme={s.scheme}>{s.label}</Badge>
//                       {r.plan && (
//                         <Badge variant="subtle" colorScheme="blue">
//                           {String(r.plan).toUpperCase()}
//                         </Badge>
//                       )}
//                     </HStack>

//                     <Stack spacing={1}>
//                       <Text fontSize="sm" color="whiteAlpha.800">
//                         <Box as="span" color="whiteAlpha.600">CR:</Box> {r.crNumber || "-"}
//                       </Text>
//                       <Text fontSize="sm" color="whiteAlpha.800">
//                         <Box as="span" color="whiteAlpha.600">Email:</Box> {r.contactEmail || "-"}
//                       </Text>
//                       <Text fontSize="sm" color="whiteAlpha.800">
//                         <Box as="span" color="whiteAlpha.600">Phone:</Box> {r.phone || "-"}
//                       </Text>
//                     </Stack>

//                     <Divider my={3} borderColor="whiteAlpha.200" />

//                     <Text fontSize="sm" color="whiteAlpha.700">
//                       {r.description || "No description."}
//                     </Text>
//                   </Box>

//                   <Box>
//                     <Text fontWeight="semibold" mb={2}>
//                       Media
//                     </Text>

//                     <SimpleGrid columns={3} spacing={2} mb={3}>
//                       {(r.photos || r.images || []).slice(0, 3).map((url) => (
//                         <Image
//                           key={url}
//                           src={url}
//                           alt="Restaurant"
//                           rounded="lg"
//                           objectFit="cover"
//                           h="86px"
//                           w="100%"
//                         />
//                       ))}
//                     </SimpleGrid>

//                     <HStack spacing={3} mb={4}>
//                       {r.menuUrl ? (
//                         <Button
//                           as="a"
//                           href={r.menuUrl}
//                           target="_blank"
//                           size="sm"
//                           variant="outline"
//                           borderColor="whiteAlpha.300"
//                           _hover={{ bg: "whiteAlpha.100" }}
//                         >
//                           View menu
//                         </Button>
//                       ) : (
//                         <Button size="sm" variant="outline" borderColor="whiteAlpha.200" isDisabled>
//                           No menu
//                         </Button>
//                       )}
//                     </HStack>

//                     {allowActions ? (
//                       <HStack spacing={3}>
//                         <Button colorScheme="purple" onClick={() => approve(r.ownerId)}>
//                           Approve
//                         </Button>
//                         <Button colorScheme="red" variant="outline" onClick={() => reject(r.ownerId)}>
//                           Reject
//                         </Button>
//                       </HStack>
//                     ) : (
//                       <Text fontSize="sm" color="whiteAlpha.600">
//                         Actions disabled for this status.
//                       </Text>
//                     )}
//                   </Box>
//                 </SimpleGrid>
//               </GlassCard>
//             );
//           })}
//         </Stack>
//       )}
//     </Box>
//   );

//   return (
//     <Box
//       minH="100dvh"
//       bgGradient="linear(90deg, #000328 0%, #00458E 100%)"
//       color="white"
//     >
//       {/* ===== HERO ===== */}
//       <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" position="relative">
//         <Stack align="center" spacing={6} w="100%">
//           {/* ✅ THIS IS THE FIXED SIZE (fills your red box) */}
//           <Box
//             w="100%"
//             px={{ base: 4, md: 10 }}
//             maxW="1400px"
//             h={{ base: "280px", md: "520px" }}
//             rounded="2xl"
//             overflow="hidden"
//             boxShadow="0 30px 90px rgba(0,0,0,0.6)"
//           >
//             <video
//               src={ceoVideo}
//               autoPlay
//               muted
//               loop
//               playsInline
//               style={{
//                 width: "100%",
//                 height: "100%",
//                 objectFit: "cover",
//                 display: "block",
//               }}
//             />
//           </Box>

//           <Text fontSize="sm" color="whiteAlpha.700" letterSpacing="0.14em" textTransform="uppercase">
//             Seb’s Platform Admin
//           </Text>

//           <IconButton
//             aria-label="Scroll to dashboard"
//             icon={<ArrowDownIcon />}
//             variant="outline"
//             borderColor="whiteAlpha.300"
//             _hover={{ bg: "whiteAlpha.100" }}
//             onClick={scrollToDashboard}
//             rounded="full"
//           />
//         </Stack>
//       </Box>

//       {/* ===== DASHBOARD ===== */}
//       <Box ref={dashRef} px={{ base: 4, md: 8 }} pb={{ base: 10, md: 14 }}>
//         <Flex gap={6} align="flex-start">
//           {/* Sidebar */}
//           <Box
//             w={{ base: "0", md: "260px" }}
//             display={{ base: "none", md: "block" }}
//             position="sticky"
//             top={6}
//           >
//             <GlassCard p={4}>
//               <Text fontSize="xs" color="whiteAlpha.700" letterSpacing="0.12em" textTransform="uppercase" mb={3}>
//                 Navigation
//               </Text>

//               <Stack spacing={2}>
//                 <SideNavButton active>Applications</SideNavButton>
//                 <SideNavButton>Restaurants</SideNavButton>
//                 <SideNavButton>Payments</SideNavButton>
//                 <SideNavButton>Audit log</SideNavButton>
//               </Stack>

//               <Divider my={4} borderColor="whiteAlpha.200" />

//               <Text fontSize="xs" color="whiteAlpha.700">
//                 Minimal console (demo)
//               </Text>
//               <Text fontSize="xs" color="whiteAlpha.600">
//                 History is kept by status — nothing is deleted.
//               </Text>
//             </GlassCard>
//           </Box>

//           {/* Main */}
//           <Box flex="1" minW={0}>
//             <HStack justify="space-between" mb={6} flexWrap="wrap" gap={3}>
//               <Box>
//                 <Heading size="lg">Applications</Heading>
//                 <Text color="whiteAlpha.700">
//                   Review, approve, and move restaurants through onboarding.
//                 </Text>
//               </Box>

//               <InputGroup maxW="520px">
//                 <InputLeftElement pointerEvents="none">
//                   <SearchIcon color="whiteAlpha.600" />
//                 </InputLeftElement>
//                 <Input
//                   value={query}
//                   onChange={(e) => setQuery(e.target.value)}
//                   placeholder="Search by name, CR, email, phone..."
//                   bg="whiteAlpha.100"
//                   borderColor="whiteAlpha.200"
//                   _placeholder={{ color: "whiteAlpha.500" }}
//                 />
//               </InputGroup>
//             </HStack>

//             {/* ✅ FIXED: TabPanels are explicit (so nothing disappears) */}
//             <Tabs variant="soft-rounded" colorScheme="purple">
//               <TabList flexWrap="wrap" gap={2}>
//                 <Tab>Pending ({groups.pending_review?.length || 0})</Tab>
//                 <Tab>Approved ({groups.approved_pending_payment?.length || 0})</Tab>
//                 <Tab>Active ({groups.active?.length || 0})</Tab>
//                 <Tab>Rejected ({groups.rejected?.length || 0})</Tab>
//               </TabList>

//               <TabPanels mt={6}>
//                 <TabPanel p={0}>
//                   <Panel
//                     title="Pending review"
//                     subtitle="Approve or reject after checking CR + docs (demo)."
//                     list={groups.pending_review || []}
//                     allowActions
//                   />
//                 </TabPanel>

//                 <TabPanel p={0}>
//                   <Panel
//                     title="Approved (awaiting payment)"
//                     subtitle="Owners must pay to become active."
//                     list={groups.approved_pending_payment || []}
//                     allowActions={false}
//                   />
//                 </TabPanel>

//                 <TabPanel p={0}>
//                   <Panel
//                     title="Active"
//                     subtitle="Visible in customer app right now."
//                     list={groups.active || []}
//                     allowActions={false}
//                   />
//                 </TabPanel>

//                 <TabPanel p={0}>
//                   <Panel
//                     title="Rejected"
//                     subtitle="Stored for history (not deleted)."
//                     list={groups.rejected || []}
//                     allowActions={false}
//                   />
//                 </TabPanel>
//               </TabPanels>
//             </Tabs>
//           </Box>
//         </Flex>
//       </Box>
//     </Box>
//   );
// }

import { Routes, Route } from "react-router-dom";
import PlatformLayout from "./PlatformLayout";

import DashboardPage from "./platform_pages/DashboardPage";
import ApplicationsPage from "./platform_pages/ApplicationsPage";
import RestaurantsPage from "./platform_pages/RestaurantsPage";
import UsersPage from "./platform_pages/UsersPage";
import FinancialsPage from "./platform_pages/FinancialsPage";
import AuditLogsPage from "./platform_pages/AuditLogsPage";

export default function PlatformApp() {
  return (
    <PlatformLayout>
      <Routes>
  <Route index element={<DashboardPage />} />
  <Route path="applications" element={<ApplicationsPage />} />
  <Route path="restaurants" element={<RestaurantsPage />} />
  <Route path="users" element={<UsersPage />} />
  <Route path="financials" element={<FinancialsPage />} />
  <Route path="audit" element={<AuditLogsPage />} />
</Routes>

    </PlatformLayout>
  );
}

