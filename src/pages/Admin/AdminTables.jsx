// // src/pages/admin/AdminTables.jsx
// import {
//   Box,
//   Heading,
//   Text,
//   Table,
//   Thead,
//   Tbody,
//   Tr,
//   Th,
//   Td,
//   Switch,
//   Badge,
//   HStack,
//   Button,
// } from "@chakra-ui/react";
// import { useState } from "react";

// const INITIAL_TABLES = [
//   { id: "T1", number: 1, capacity: 2, area: "Window", active: true },
//   { id: "T2", number: 2, capacity: 4, area: "Main floor", active: true },
//   { id: "T3", number: 3, capacity: 4, area: "Main floor", active: true },
//   { id: "T4", number: 4, capacity: 6, area: "Terrace", active: false },
// ];

// export default function AdminTables() {
//   const [tables, setTables] = useState(INITIAL_TABLES);

//   const toggleActive = (id) => {
//     setTables((prev) =>
//       prev.map((t) =>
//         t.id === id
//           ? {
//               ...t,
//               active: !t.active,
//             }
//           : t
//       )
//     );
//   };

//   return (
//     <Box color="white">
//       <Heading size="lg" mb={6}>
//         Tables
//       </Heading>

//       <Box mb={4}>
//         <Text fontSize="sm" color="gray.300">
//           Manage your table layout. Turning a table off will make it unavailable
//           for online reservations.
//         </Text>
//       </Box>

//       {/* Top actions – future: add / edit table */}
//       <HStack justify="space-between" mb={4}>
//         <Text fontSize="sm" color="gray.400">
//           Total tables: {tables.length} · Active:{" "}
//           {tables.filter((t) => t.active).length}
//         </Text>
//         <Button size="sm" colorScheme="purple" variant="outline">
//           + Add table (later)
//         </Button>
//       </HStack>

//       <Box
//         bg="gray.900"
//         borderRadius="xl"
//         borderWidth="1px"
//         borderColor="gray.700"
//         overflowX="auto"
//       >
//         <Table size="sm">
//           <Thead bg="gray.800">
//             <Tr>
//               <Th color="gray.300">Table #</Th>
//               <Th color="gray.300">Capacity</Th>
//               <Th color="gray.300">Area</Th>
//               <Th color="gray.300">Status</Th>
//               <Th color="gray.300" isNumeric>
//                 Active
//               </Th>
//             </Tr>
//           </Thead>
//           <Tbody>
//             {tables.map((t) => (
//               <Tr key={t.id}>
//                 <Td>{t.number}</Td>
//                 <Td>{t.capacity} seats</Td>
//                 <Td>{t.area}</Td>
//                 <Td>
//                   <Badge
//                     colorScheme={t.active ? "green" : "red"}
//                     borderRadius="full"
//                   >
//                     {t.active ? "Available for booking" : "Blocked / inactive"}
//                   </Badge>
//                 </Td>
//                 <Td isNumeric>
//                   <Switch
//                     isChecked={t.active}
//                     onChange={() => toggleActive(t.id)}
//                     colorScheme="purple"
//                   />
//                 </Td>
//               </Tr>
//             ))}
//           </Tbody>
//         </Table>
//       </Box>
//     </Box>
//   );
// }



// // src/pages/admin/AdminTables.jsx
// import {
//   Box,
//   Heading,
//   Text,
//   Table,
//   Thead,
//   Tbody,
//   Tr,
//   Th,
//   Td,
//   Switch,
//   Badge,
//   HStack,
//   Button,
//   Spinner,
//   Alert,
//   AlertIcon,
//   useToast,
// } from "@chakra-ui/react";
// import { useEffect, useMemo, useState } from "react";

// // ✅ Realtime Database imports
// import { ref, onValue, update, push, set } from "firebase/database";
// import { db } from "../../firebase";

// /**
//  * AdminTables
//  * - Reads tables in realtime from RTDB
//  * - Updates table "active" and optional "occupied"
//  * - Supports multi-restaurant via restaurantKey
//  *
//  * Expected RTDB structure:
//  * restaurants/
//  *   {restaurantKey}/
//  *     tables/
//  *       {tableId}:
//  *         number: 1
//  *         capacity: 2
//  *         area: "Window"
//  *         active: true
//  *         occupied: false
//  */
// export default function AdminTables({ restaurantKey }) {
//   const toast = useToast();

//   // realtime tables from RTDB
//   const [tables, setTables] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [loadErr, setLoadErr] = useState(null);

//   // basic "connected" guard
//   const isReady = useMemo(() => !!restaurantKey, [restaurantKey]);

//   useEffect(() => {
//     if (!isReady) {
//       setTables([]);
//       setLoading(false);
//       setLoadErr(null);
//       return;
//     }

//     setLoading(true);
//     setLoadErr(null);

//     const tablesRef = ref(db, `restaurants/${restaurantKey}/tables`);

//     // ✅ realtime listener
//     const unsub = onValue(
//       tablesRef,
//       (snap) => {
//         const val = snap.val();

//         if (!val) {
//           setTables([]);
//           setLoading(false);
//           return;
//         }

//         // val shape: { tableId: {number, capacity, ...}, ... }
//         const rows = Object.entries(val).map(([id, data]) => ({
//           id,
//           ...data,
//         }));

//         // sort by table number if exists
//         rows.sort((a, b) => (a.number ?? 0) - (b.number ?? 0));

//         setTables(rows);
//         setLoading(false);
//       },
//       (err) => {
//         console.error("RTDB onValue error:", err);
//         setLoadErr(err);
//         setLoading(false);
//       }
//     );

//     // onValue returns an unsubscribe function
//     return () => unsub();
//   }, [restaurantKey, isReady]);

//   const toggleActive = async (table) => {
//     if (!isReady) return;

//     try {
//       const tableRef = ref(db, `restaurants/${restaurantKey}/tables/${table.id}`);

//       await update(tableRef, {
//         active: !table.active,
//         updatedAt: Date.now(),
//       });
//     } catch (err) {
//       console.error(err);
//       toast({
//         title: "Could not update table",
//         description: err?.message || "Update failed",
//         status: "error",
//         isClosable: true,
//       });
//     }
//   };

//   // Optional: occupied toggle (customers can see this)
//   const toggleOccupied = async (table) => {
//     if (!isReady) return;

//     try {
//       const tableRef = ref(db, `restaurants/${restaurantKey}/tables/${table.id}`);

//       await update(tableRef, {
//         occupied: !table.occupied,
//         updatedAt: Date.now(),
//       });
//     } catch (err) {
//       console.error(err);
//       toast({
//         title: "Could not update occupied status",
//         description: err?.message || "Update failed",
//         status: "error",
//         isClosable: true,
//       });
//     }
//   };

//   /**
//    * Optional helper: Add a table (basic version)
//    * - You said "+ Add table (later)" but I’m keeping this complete + ready.
//    * - You can remove the function if you don’t want it yet.
//    */
//   const addTable = async () => {
//     if (!isReady) return;

//     try {
//       const tablesRef = ref(db, `restaurants/${restaurantKey}/tables`);
//       const newRef = push(tablesRef);

//       // basic auto number = max+1
//       const maxNumber = tables.reduce((m, t) => Math.max(m, t.number ?? 0), 0);
//       const nextNumber = maxNumber + 1;

//       await set(newRef, {
//         number: nextNumber,
//         capacity: 2,
//         area: "Main floor",
//         active: true,
//         occupied: false,
//         createdAt: Date.now(),
//         updatedAt: Date.now(),
//       });

//       toast({
//         title: "Table added",
//         description: `Created table #${nextNumber}`,
//         status: "success",
//         isClosable: true,
//       });
//     } catch (err) {
//       console.error(err);
//       toast({
//         title: "Could not add table",
//         description: err?.message || "Add failed",
//         status: "error",
//         isClosable: true,
//       });
//     }
//   };

//   const activeCount = tables.filter((t) => !!t.active).length;
//   const occupiedCount = tables.filter((t) => !!t.occupied).length;

//   return (
//     <Box color="white">
//       <Heading size="lg" mb={6}>
//         Tables
//       </Heading>

//       {!isReady && (
//         <Alert status="warning" mb={4}>
//           <AlertIcon />
//           Missing <b style={{ marginLeft: 6, marginRight: 6 }}>restaurantKey</b>.
//           Pass the restaurant key/id into this page (example: ownerId).
//         </Alert>
//       )}

//       {loadErr && (
//         <Alert status="error" mb={4}>
//           <AlertIcon />
//           Failed to load tables from database.
//         </Alert>
//       )}

//       <Box mb={4}>
//         <Text fontSize="sm" color="gray.300">
//           Manage your table layout. Turning a table off will make it unavailable for online
//           reservations. You can also set a table as occupied to reflect live status on the customer
//           side.
//         </Text>
//       </Box>

//       {/* Top actions */}
//       <HStack justify="space-between" mb={4}>
//         <Text fontSize="sm" color="gray.400">
//           Total tables: {tables.length} · Active: {activeCount} · Occupied: {occupiedCount}
//         </Text>

//         <Button
//           size="sm"
//           colorScheme="purple"
//           variant="outline"
//           onClick={addTable}
//           isDisabled={!isReady}
//         >
//           + Add table
//         </Button>
//       </HStack>

//       <Box
//         bg="gray.900"
//         borderRadius="xl"
//         borderWidth="1px"
//         borderColor="gray.700"
//         overflowX="auto"
//       >
//         {loading ? (
//           <Box p={6}>
//             <Spinner />
//           </Box>
//         ) : (
//           <Table size="sm">
//             <Thead bg="gray.800">
//               <Tr>
//                 <Th color="gray.300">Table #</Th>
//                 <Th color="gray.300">Capacity</Th>
//                 <Th color="gray.300">Area</Th>
//                 <Th color="gray.300">Booking Status</Th>
//                 <Th color="gray.300">Occupied</Th>
//                 <Th color="gray.300" isNumeric>
//                   Active
//                 </Th>
//               </Tr>
//             </Thead>

//             <Tbody>
//               {tables.map((t) => (
//                 <Tr key={t.id}>
//                   <Td>{t.number}</Td>
//                   <Td>{t.capacity} seats</Td>
//                   <Td>{t.area}</Td>

//                   <Td>
//                     <Badge
//                       colorScheme={t.active ? "green" : "red"}
//                       borderRadius="full"
//                     >
//                       {t.active ? "Available for booking" : "Blocked / inactive"}
//                     </Badge>
//                   </Td>

//                   <Td>
//                     <HStack spacing={3}>
//                       <Badge
//                         colorScheme={t.occupied ? "orange" : "green"}
//                         borderRadius="full"
//                       >
//                         {t.occupied ? "Occupied" : "Free"}
//                       </Badge>

//                       <Button
//                         size="xs"
//                         variant="outline"
//                         colorScheme="orange"
//                         onClick={() => toggleOccupied(t)}
//                         isDisabled={!isReady}
//                       >
//                         Toggle
//                       </Button>
//                     </HStack>
//                   </Td>

//                   <Td isNumeric>
//                     <Switch
//                       isChecked={!!t.active}
//                       onChange={() => toggleActive(t)}
//                       colorScheme="purple"
//                       isDisabled={!isReady}
//                     />
//                   </Td>
//                 </Tr>
//               ))}

//               {tables.length === 0 && (
//                 <Tr>
//                   <Td colSpan={6}>
//                     <Text p={4} color="gray.400">
//                       No tables found for this restaurant. Click “+ Add table” to create one.
//                     </Text>
//                   </Td>
//                 </Tr>
//               )}
//             </Tbody>
//           </Table>
//         )}
//       </Box>
//     </Box>
//   );
// }


// src/pages/admin/AdminTables.jsx
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Switch,
  Badge,
  HStack,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { ref, onValue, update } from "firebase/database";
import { db } from "../../firebase";
import { useAuth } from "../../auth/AuthContext.jsx";
/**
 * AdminTables (NEW)
 * Source of truth:
 * restaurants/{uid}/layouts/main/tables/{tableId}
 *
 * Each table object expected:
 * { id, label, seats, area, unavailable, occupied?, shape, x,y,w,h }
 */
export default function AdminTables() {
  const toast = useToast();
  const { user } = useAuth();

  const [tablesMap, setTablesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState(null);

  const isReady = useMemo(() => !!user?.uid, [user?.uid]);

  useEffect(() => {
    if (!isReady) {
      setTablesMap({});
      setLoading(false);
      setLoadErr(null);
      return;
    }

    setLoading(true);
    setLoadErr(null);

    const tablesRef = ref(db, `restaurants/${user.uid}/layouts/main/tables`);

    const unsub = onValue(
      tablesRef,
      (snap) => {
        setTablesMap(snap.val() || {});
        setLoading(false);
      },
      (err) => {
        console.error("RTDB onValue error:", err);
        setLoadErr(err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [isReady, user?.uid]);

  const rows = useMemo(() => {
    const list = Object.entries(tablesMap || {}).map(([id, t]) => ({
      id,
      ...t,
    }));

    // sort by label/id nicely (A1, A2, B1…)
    list.sort((a, b) => String(a.label || a.id).localeCompare(String(b.label || b.id)));
    return list;
  }, [tablesMap]);

  const toggleUnavailable = async (t) => {
    if (!isReady) return;
    try {
      const oneRef = ref(db, `restaurants/${user.uid}/layouts/main/tables/${t.id}`);
      await update(oneRef, { unavailable: !t.unavailable, updatedAt: Date.now() });
    } catch (err) {
      console.error(err);
      toast({
        title: "Could not update table",
        description: err?.message || "Update failed",
        status: "error",
        isClosable: true,
      });
    }
  };

  const toggleOccupied = async (t) => {
    if (!isReady) return;
    try {
      const oneRef = ref(db, `restaurants/${user.uid}/layouts/main/tables/${t.id}`);
      await update(oneRef, { occupied: !t.occupied, updatedAt: Date.now() });
    } catch (err) {
      console.error(err);
      toast({
        title: "Could not update occupied status",
        description: err?.message || "Update failed",
        status: "error",
        isClosable: true,
      });
    }
  };

  const activeCount = rows.filter((t) => !t.unavailable).length;
  const occupiedCount = rows.filter((t) => !!t.occupied).length;

  return (
    <Box color="white">
      <HStack justify="space-between" mb={4} flexWrap="wrap" gap={3}>
        <Box>
          <Heading size="lg">Tables</Heading>
          
        </Box>

       <Button
  as={RouterLink}
  to="/admin/table-layout"
  bg="blue.600"
  color="white"
  fontWeight="semibold"
  _hover={{ bg: "blue.500" }}
  _active={{ bg: "blue.700" }}
  boxShadow="md"
>
  Open layout editor
</Button>

      </HStack>

      {!isReady && (
        <Alert status="warning" mb={4}>
          <AlertIcon />
          Please sign in as an owner.
        </Alert>
      )}

      {loadErr && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          Failed to load tables from database.
        </Alert>
      )}

      <HStack justify="space-between" mb={4}>
        <Text fontSize="sm" color="whiteAlpha.600">
          Total: {rows.length} · Available: {activeCount} · Occupied: {occupiedCount}
        </Text>
      </HStack>

      <Box
        bg="blackAlpha.600"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="whiteAlpha.200"
        overflowX="auto"
      >
        {loading ? (
          <Box p={6}>
            <Spinner />
          </Box>
        ) : (
          <Table size="sm">
            <Thead bg="blackAlpha.500">
              <Tr>
                <Th color="whiteAlpha.700">Label</Th>
                <Th color="whiteAlpha.700">Seats</Th>
                <Th color="whiteAlpha.700">Area</Th>
                <Th color="whiteAlpha.700">Availability</Th>
                <Th color="whiteAlpha.700">Occupied</Th>
                <Th color="whiteAlpha.700" isNumeric>
                  Block table
                </Th>
              </Tr>
            </Thead>

            <Tbody>
              {rows.map((t) => (
                <Tr key={t.id}>
                  <Td>{t.label || t.id}</Td>
                  <Td>{t.seats || 0}</Td>
                  <Td>{t.area || "-"}</Td>

                  <Td>
                    <Badge colorScheme={!t.unavailable ? "green" : "red"} borderRadius="full">
                      {!t.unavailable ? "Available" : "Blocked"}
                    </Badge>
                  </Td>

                  <Td>
                    <HStack spacing={3}>
                      <Badge colorScheme={t.occupied ? "orange" : "green"} borderRadius="full">
                        {t.occupied ? "Occupied" : "Free"}
                      </Badge>

                      <Button
                        size="xs"
                        variant="outline"
                        borderColor="whiteAlpha.300"
                        onClick={() => toggleOccupied(t)}
                        isDisabled={!isReady}
                      >
                        Toggle
                      </Button>
                    </HStack>
                  </Td>

                  <Td isNumeric>
                    <Switch
                      isChecked={!!t.unavailable}
                      onChange={() => toggleUnavailable(t)}
                      colorScheme="red"
                      isDisabled={!isReady}
                    />
                  </Td>
                </Tr>
              ))}

              {rows.length === 0 && (
                <Tr>
                  <Td colSpan={6}>
                    <Text p={4} color="whiteAlpha.600">
                      No tables yet. Go to{" "}
                      <Button
                        as={RouterLink}
                        to="/admin/table-layout"
                        size="xs"
                        variant="link"
                        color="blue.300"
                      >
                        Layout Editor
                      </Button>{" "}
                      and add your first tables.
                    </Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        )}
      </Box>
    </Box>
  );
}
