// import {
//   Box,
//   Flex,
//   VStack,
//   Heading,
//   Button,
//   HStack,
//   Image,
//   Text,
//   Spinner,
//   Badge,
//   Divider,
// } from "@chakra-ui/react";
// import { Outlet, Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
// import { useEffect, useMemo, useState } from "react";
// import { useAuth } from "../auth/AuthContext.jsx";
// import { db
//  } from "../firebase";
// import { ref, onValue } from "firebase/database";
// import NotificationsBell from "../components/NotificationsBell";


// export default function AdminLayout() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const [restaurant, setRestaurant] = useState(null);
//   const [loadingRestaurant, setLoadingRestaurant] = useState(true);

//   useEffect(() => {
//     if (!user?.uid) return;

//     const rRef = ref(db, `restaurants/${user.uid}`);
//     const unsub = onValue(
//       rRef,
//       (snap) => {
//         setRestaurant(snap.val());
//         setLoadingRestaurant(false);
//       },
//       () => {
//         setRestaurant(null);
//         setLoadingRestaurant(false);
//       }
//     );

//     return () => unsub();
//   }, [user?.uid]);

//   const status = restaurant?.status;
//   const hasRestaurant = !!restaurant;
//   const canUseFullDashboard = status === "active";

//   const path = location.pathname;
//   const onRestaurant = path.startsWith("/admin/restaurant");
//   const onOnboarding = path.startsWith("/admin/onboarding");
//   const onWelcome = path.startsWith("/admin/welcome");
// const onTables = path.startsWith("/admin/tables");


//   // ✅ GATE LOGIC (new)
// useEffect(() => {
//   if (loadingRestaurant) return;

//   const path = location.pathname;

//   const allowBeforeActive = [
//     "/admin/welcome",
//     "/admin/restaurant",
//     "/admin/restaurant/layout",
//     "/admin/onboarding",
//     "/admin/billing",
//   ].some((p) => path.startsWith(p));

//   // If no restaurant yet, allow welcome + restaurant pages only
//   if (!hasRestaurant) {
//     if (!path.startsWith("/admin/welcome") && !path.startsWith("/admin/restaurant")) {
//       navigate("/admin/welcome", { replace: true });
//     }
//     return;
//   }

//   // Has restaurant but not active:
//   // allow the application flow (including layout) + onboarding + billing
//   if (status !== "active") {
//     if (!allowBeforeActive) {
//       navigate("/admin/onboarding", { replace: true });
//     }
//     return;
//   }

//   // Active restaurant:
//   // allow everything (no redirect)
// }, [loadingRestaurant, hasRestaurant, status, location.pathname, navigate]);




//   const isActive = (p) => location.pathname === p;

//   const statusLabel = useMemo(() => {
//     if (!hasRestaurant) return { text: "Not started", tone: "whiteAlpha" };
//     if (status === "pending_review") return { text: "Pending review", tone: "yellow" };
//     if (status === "approved_pending_payment") return { text: "Approved • Payment required", tone: "purple" };
//     if (status === "rejected") return { text: "Rejected", tone: "red" };
//     if (status === "active") return { text: "Active", tone: "blue" };
//     return { text: status || "Unknown", tone: "whiteAlpha" };
//   }, [hasRestaurant, status]);

//   return (
//     <Flex minH="100vh" bg="neutral.900">
//       {/* Sidebar */}
//       <Box
//         w="280px"
//         bgGradient="linear(to-b, #0b1220, #070b12)"
//         color="white"
//         p={6}
//         display="flex"
//         flexDirection="column"
//         borderRight="1px solid"
//         borderColor="whiteAlpha.100"
//       >
//         <HStack mb={5} spacing={3} justify="center">
//           <Image
//             src="/src/assets/THELOGO.png"
//             alt="Seb's logo"
//             boxSize="78px"
//             objectFit="contain"
//           />
//         </HStack>

// <HStack justify="center" mb={4}>
//   {user && <NotificationsBell userId={user.uid} />}
// </HStack>

//         <Heading size="sm" textAlign="center" letterSpacing="wide">
//           Seb&apos;s Owner Portal
//         </Heading>

//         <Box mt={3} mb={5} textAlign="center">
//           {loadingRestaurant ? (
//             <HStack justify="center" spacing={2}>
//               <Spinner size="sm" />
//               <Text fontSize="xs" color="whiteAlpha.700">
//                 Loading status…
//               </Text>
//             </HStack>
//           ) : (
//             <Badge colorScheme={statusLabel.tone} variant="subtle" px={3} py={1} rounded="full">
//               {statusLabel.text}
//             </Badge>
//           )}
//         </Box>

//         <Divider borderColor="whiteAlpha.200" mb={4} />

//         <VStack align="stretch" spacing={2} flex="1">
//           {/* Always visible */}
//           <NavButton to="/admin/welcome" active={isActive("/admin/welcome")}>
//             Welcome
//           </NavButton>

//           <NavButton to="/admin/restaurant" active={isActive("/admin/restaurant")}>
//             Restaurant Application
//           </NavButton>

// <NavButton to="/admin/billing" active={isActive("/admin/billing")}>
//   Billing
// </NavButton>

//           <Divider borderColor="whiteAlpha.200" my={3} />

//           {/* allow to show even if not active */}
//           {canUseFullDashboard && (
//             <>
//               <NavButton to="/admin" active={isActive("/admin")}>
//                 Dashboard
//               </NavButton>
//               <NavButton to="/admin/reservations" active={isActive("/admin/reservations")}>
//                 Reservations
//               </NavButton>
//       {hasRestaurant && (
//   <NavButton to="/admin/tables" active={isActive("/admin/tables")}>
//     Tables
//   </NavButton>
// )}

//               <NavButton to="/admin/staff" active={isActive("/admin/staff")}>
//                 Staff
//               </NavButton>
//               <NavButton to="/admin/profile" active={isActive("/admin/profile")}>
//                 My Profile
//               </NavButton>
//             </>
//           )}
//         </VStack>

//         <Button
//           as={RouterLink}
//           to="/"
//           mt={4}
//           variant="outline"
//           borderColor="whiteAlpha.300"
//           color="whiteAlpha.900"
//           _hover={{ bg: "whiteAlpha.100", borderColor: "whiteAlpha.500" }}
//         >
//           Back to site
//         </Button>
//       </Box>

//       {/* Main */}
//       <Box flex="1" p={{ base: 5, md: 8 }} overflowY="auto">
//         <Outlet />
//       </Box>
//     </Flex>
//   );
// }

// function NavButton({ to, active, disabled, children }) {
//   return (
//     <Button
//       as={RouterLink}
//       to={disabled ? undefined : to}
//       onClick={(e) => disabled && e.preventDefault()}
//       justifyContent="flex-start"
//       size="sm"
//       borderRadius="lg"
//       variant={active ? "solid" : "ghost"}
//       bg={active ? "whiteAlpha.200" : "transparent"}
//       color={active ? "white" : "whiteAlpha.800"}
//       _hover={{ bg: "whiteAlpha.200", color: "white" }}
//       opacity={disabled ? 0.45 : 1}
//       cursor={disabled ? "not-allowed" : "pointer"}
//     >
//       {children}
//     </Button>
//   );
// }

import {
  Box,
  Flex,
  VStack,
  Heading,
  Button,
  HStack,
  Image,
  Text,
  Spinner,
  Badge,
  Divider,
} from "@chakra-ui/react";
import { Outlet, Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import NotificationsBell from "../components/NotificationsBell";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [restaurant, setRestaurant] = useState(null);
  const [loadingRestaurant, setLoadingRestaurant] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const rRef = ref(db, `restaurants/${user.uid}`);
    const unsub = onValue(
      rRef,
      (snap) => {
        setRestaurant(snap.val());
        setLoadingRestaurant(false);
      },
      () => {
        setRestaurant(null);
        setLoadingRestaurant(false);
      }
    );

    return () => unsub();
  }, [user?.uid]);

  const status = restaurant?.status;
  const hasRestaurant = !!restaurant;
  const canUseFullDashboard = status === "active";

  // ✅ GATE LOGIC (your original)
  useEffect(() => {
    if (loadingRestaurant) return;

    const path = location.pathname;

    const allowBeforeActive = [
      "/admin/welcome",
      "/admin/restaurant",
      "/admin/restaurant/layout",
      "/admin/onboarding",
      "/admin/billing",
    ].some((p) => path.startsWith(p));

    if (!hasRestaurant) {
      if (!path.startsWith("/admin/welcome") && !path.startsWith("/admin/restaurant")) {
        navigate("/admin/welcome", { replace: true });
      }
      return;
    }

    if (status !== "active") {
      if (!allowBeforeActive) {
        navigate("/admin/onboarding", { replace: true });
      }
      return;
    }
  }, [loadingRestaurant, hasRestaurant, status, location.pathname, navigate]);

  const isActive = (p) => location.pathname === p;

  const statusLabel = useMemo(() => {
    if (!hasRestaurant) return { text: "Not started", tone: "whiteAlpha" };
    if (status === "pending_review") return { text: "Pending review", tone: "yellow" };
    if (status === "approved_pending_payment") return { text: "Approved • Payment required", tone: "purple" };
    if (status === "rejected") return { text: "Rejected", tone: "red" };
    if (status === "active") return { text: "Active", tone: "blue" };
    return { text: status || "Unknown", tone: "whiteAlpha" };
  }, [hasRestaurant, status]);

  return (
    <Flex minH="100vh" bg="neutral.900">
      {/* Sidebar */}
      <Box
        w="280px"
        bgGradient="linear(to-b, #0b1220, #070b12)"
        color="white"
        p={6}
        display="flex"
        flexDirection="column"
        borderRight="1px solid"
        borderColor="whiteAlpha.100"
      >
        <HStack mb={5} spacing={3} justify="center">
          <Image
            src="/src/assets/THELOGO.png"
            alt="Seb's logo"
            boxSize="78px"
            objectFit="contain"
          />
        </HStack>

        <HStack justify="center" mb={4}>
          {user && <NotificationsBell userId={user.uid} />}
        </HStack>

        <Heading size="sm" textAlign="center" letterSpacing="wide">
          Seb&apos;s Owner Portal
        </Heading>

        <Box mt={3} mb={5} textAlign="center">
          {loadingRestaurant ? (
            <HStack justify="center" spacing={2}>
              <Spinner size="sm" />
              <Text fontSize="xs" color="whiteAlpha.700">
                Loading status…
              </Text>
            </HStack>
          ) : (
            <Badge colorScheme={statusLabel.tone} variant="subtle" px={3} py={1} rounded="full">
              {statusLabel.text}
            </Badge>
          )}
        </Box>

        <Divider borderColor="whiteAlpha.200" mb={4} />

        <VStack align="stretch" spacing={2} flex="1">
          {/* Always visible */}
          <NavButton to="/admin/welcome" active={isActive("/admin/welcome")}>
            Welcome
          </NavButton>

          <NavButton to="/admin/restaurant" active={isActive("/admin/restaurant")}>
            Restaurant Application
          </NavButton>

          <NavButton to="/admin/billing" active={isActive("/admin/billing")}>
            Billing
          </NavButton>

          <Divider borderColor="whiteAlpha.200" my={3} />

          {/* Active restaurant tools */}
          {canUseFullDashboard && (
            <>
              <NavButton to="/admin" active={isActive("/admin")}>
                Dashboard
              </NavButton>

              <NavButton to="/admin/reservations" active={isActive("/admin/reservations")}>
                Reservations
              </NavButton>

              {hasRestaurant && (
                <NavButton to="/admin/tables" active={isActive("/admin/tables")}>
                  Tables
                </NavButton>
              )}

              {/* ✅ ADDED */}
              <NavButton to="/admin/events" active={isActive("/admin/events")}>
                Events
              </NavButton>

              {/* ✅ ADDED */}
              <NavButton to="/admin/analytics" active={isActive("/admin/analytics")}>
                Analytics
              </NavButton>

              <NavButton to="/admin/staff" active={isActive("/admin/staff")}>
                Staff
              </NavButton>

              <NavButton to="/admin/profile" active={isActive("/admin/profile")}>
                My Profile
              </NavButton>
            </>
          )}
        </VStack>

        <Button
          as={RouterLink}
          to="/"
          mt={4}
          variant="outline"
          borderColor="whiteAlpha.300"
          color="whiteAlpha.900"
          _hover={{ bg: "whiteAlpha.100", borderColor: "whiteAlpha.500" }}
        >
          Back to site
        </Button>
      </Box>

      {/* Main */}
      <Box flex="1" p={{ base: 5, md: 8 }} overflowY="auto">
        <Outlet />
      </Box>
    </Flex>
  );
}

function NavButton({ to, active, disabled, children }) {
  return (
    <Button
      as={RouterLink}
      to={disabled ? undefined : to}
      onClick={(e) => disabled && e.preventDefault()}
      justifyContent="flex-start"
      size="sm"
      borderRadius="lg"
      variant={active ? "solid" : "ghost"}
      bg={active ? "whiteAlpha.200" : "transparent"}
      color={active ? "white" : "whiteAlpha.800"}
      _hover={{ bg: "whiteAlpha.200", color: "white" }}
      opacity={disabled ? 0.45 : 1}
      cursor={disabled ? "not-allowed" : "pointer"}
    >
      {children}
    </Button>
  );
}
