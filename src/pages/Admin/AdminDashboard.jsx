// src/pages/admin/AdminDashboard.jsx
import { Box, Heading, SimpleGrid, Text, Stack, Badge, useColorModeValue, HStack } from "@chakra-ui/react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const reservationsPerDay = [
  { day: "Mon", reservations: 8 },
  { day: "Tue", reservations: 5 },
  { day: "Wed", reservations: 11 },
  { day: "Thu", reservations: 9 },
  { day: "Fri", reservations: 14 },
  { day: "Sat", reservations: 18 },
  { day: "Sun", reservations: 6 },
];

export default function AdminDashboard() {
  const cardBg = useColorModeValue("gray.800", "gray.800");
  const cardBorder = useColorModeValue("gray.700", "gray.700");
  const subtleText = useColorModeValue("gray.300", "gray.300");

  // basic derived stats from the chart data (keeps it from feeling “dummy”)
  const todayReservations = 12; // keep your value if you don't have DB hooked here yet
  const pendingReservations = 3;
  const upcomingNext24h = 7;

  const totalWeek = reservationsPerDay.reduce((sum, d) => sum + d.reservations, 0);
  const avgPerDay = (totalWeek / reservationsPerDay.length).toFixed(1);

  return (
    <Box color="white">
      <HStack justify="space-between" align="flex-end" mb={6} flexWrap="wrap">
        <Box>
          <Heading size="lg">Dashboard</Heading>
         
        </Box>

        <Badge
          bg="whiteAlpha.200"
          color="whiteAlpha.900"
          px={3}
          py={1}
          rounded="full"
          border="1px solid"
          borderColor="whiteAlpha.300"
        >
          Week total: {totalWeek} • Avg/day: {avgPerDay}
        </Badge>
      </HStack>

      {/* Top stats */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={8}>
        <StatCard label="Reservations today" value={`${todayReservations}`} sub="Guests total shown in reservations page" />
        <StatCard label="Upcoming (next 24h)" value={`${upcomingNext24h}`} sub="Includes confirmed + pending" />
        <StatCard
          label="Pending reservations"
          value={`${pendingReservations}`}
          sub="Requires approval / action"
          badgeColor="orange"
        />
      </SimpleGrid>

      {/* Chart */}
      <Box bg={cardBg} borderWidth="1px" borderColor={cardBorder} borderRadius="2xl" p={{ base: 4, md: 5 }}>
        <HStack justify="space-between" mb={2} flexWrap="wrap">
          <Heading size="md">Weekly reservations</Heading>
          <Badge bg="blue.600" color="white" px={3} py={1} rounded="full">
            Last 7 days
          </Badge>
        </HStack>
        <Text fontSize="sm" mb={4} color={subtleText}>
          Number of reservations per day
        </Text>

        <Box w="100%" h={{ base: "240px", md: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reservationsPerDay} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#2D3748" strokeDasharray="4 4" />
              <XAxis dataKey="day" stroke="#CBD5F5" tickLine={false} axisLine={{ stroke: "#2D3748" }} />
              <YAxis stroke="#CBD5F5" tickLine={false} axisLine={{ stroke: "#2D3748" }} />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.06)" }}
                contentStyle={{
                  background: "#111827",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                  fontSize: "0.85rem",
                  color: "#E2E8F0",
                }}
                labelStyle={{ color: "#E2E8F0" }}
              />
              {/* fixed color */}
              <Bar dataKey="reservations" fill="#3B82F6" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Pending hint row (replaces notifications dummy data) */}
        <Box
          mt={5}
          p={4}
          borderRadius="xl"
          borderWidth="1px"
          borderColor="whiteAlpha.200"
          bg="blackAlpha.400"
        >
          <HStack justify="space-between" flexWrap="wrap" spacing={3}>
            <Box>
              <HStack spacing={2} mb={1}>
                <Badge colorScheme="orange" variant="solid">
                  Pending
                </Badge>
                <Text fontWeight="semibold">Reservations awaiting approval</Text>
              </HStack>
              <Text fontSize="sm" color={subtleText}>
                You currently have {pendingReservations} pending request{pendingReservations === 1 ? "" : "s"}.
                Review them in the reservations page.
              </Text>
            </Box>

            <Badge
              bg="whiteAlpha.200"
              color="whiteAlpha.900"
              px={3}
              py={2}
              rounded="lg"
              border="1px solid"
              borderColor="whiteAlpha.300"
            >
              Pending: {pendingReservations}
            </Badge>
          </HStack>
        </Box>
      </Box>
    </Box>
  );
}

function StatCard({ label, value, sub, badgeLabel, badgeColor }) {
  return (
    <Box bg="gray.800" borderWidth="1px" borderColor="gray.700" borderRadius="2xl" p={5}>
      <HStack justify="space-between" align="start" mb={2}>
        <Text fontSize="sm" color="gray.300">
          {label}
        </Text>
        {badgeLabel && (
          <Badge colorScheme={badgeColor || "blue"} variant="subtle" px={2} py={1} rounded="md">
            {badgeLabel}
          </Badge>
        )}
      </HStack>

      <Heading size="lg" mb={1}>
        {value}
      </Heading>

      {sub && (
        <Text fontSize="xs" color="gray.400">
          {sub}
        </Text>
      )}
    </Box>
  );
}
