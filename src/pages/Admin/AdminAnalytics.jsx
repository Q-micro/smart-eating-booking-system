import React, { useMemo } from "react";
import { Box, Heading, Text, SimpleGrid, useColorModeValue, HStack, Badge } from "@chakra-ui/react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const weeklyAttendance = [
  { day: "Mon", attended: 22, noShow: 4, canceled: 6 },
  { day: "Tue", attended: 18, noShow: 3, canceled: 5 },
  { day: "Wed", attended: 25, noShow: 6, canceled: 7 },
  { day: "Thu", attended: 20, noShow: 2, canceled: 4 },
  { day: "Fri", attended: 34, noShow: 7, canceled: 9 },
  { day: "Sat", attended: 41, noShow: 10, canceled: 12 },
  { day: "Sun", attended: 16, noShow: 3, canceled: 4 },
];

const repeatCustomers = [
  { label: "1 visit", value: 62 },
  { label: "2–3 visits", value: 28 },
  { label: "4+ visits", value: 10 },
];

const favoritesTrend = [
  { week: "W1", favorites: 12 },
  { week: "W2", favorites: 18 },
  { week: "W3", favorites: 23 },
  { week: "W4", favorites: 31 },
];

const PIE_COLORS = ["#3B82F6", "#22C55E", "#F59E0B"]; // blue, green, amber

export default function AdminAnalytics() {
  const cardBg = useColorModeValue("gray.900", "gray.900");
  const cardBorder = useColorModeValue("gray.700", "gray.700");
  const mutedText = useColorModeValue("gray.400", "gray.400");

  const totals = useMemo(() => {
    const attended = weeklyAttendance.reduce((s, d) => s + d.attended, 0);
    const noShow = weeklyAttendance.reduce((s, d) => s + d.noShow, 0);
    const canceled = weeklyAttendance.reduce((s, d) => s + d.canceled, 0);
    return { attended, noShow, canceled };
  }, []);

  return (
    <Box color="white">
      <HStack justify="space-between" align="flex-end" mb={6} flexWrap="wrap">
        <Box>
          <Heading size="lg">Analytics</Heading>
          <Text fontSize="sm" color={mutedText} mt={1}>
            Business insights (demo data for now).
          </Text>
        </Box>

        <HStack spacing={2} flexWrap="wrap">
          <Badge bg="whiteAlpha.200" color="whiteAlpha.900" px={3} py={1} rounded="full">
            Attended: {totals.attended}
          </Badge>
          <Badge bg="whiteAlpha.200" color="whiteAlpha.900" px={3} py={1} rounded="full">
            No-shows: {totals.noShow}
          </Badge>
          <Badge bg="whiteAlpha.200" color="whiteAlpha.900" px={3} py={1} rounded="full">
            Canceled: {totals.canceled}
          </Badge>
        </HStack>
      </HStack>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Attendance Breakdown (stacked bar) */}
        <Box bg={cardBg} borderWidth="1px" borderColor={cardBorder} rounded="2xl" p={5}>
          <Heading size="md" mb={1}>
            Attendance outcomes
          </Heading>
          <Text fontSize="sm" color={mutedText} mb={4}>
            Attended vs no-show vs canceled by day
          </Text>

          <Box h={{ base: "260px", md: "320px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyAttendance} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                />
                <Bar dataKey="attended" stackId="a" fill="#22C55E" radius={[8, 8, 0, 0]} />
                <Bar dataKey="noShow" stackId="a" fill="#3B82F6" />
                <Bar dataKey="canceled" stackId="a" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* Favorites trend (line chart) */}
        <Box bg={cardBg} borderWidth="1px" borderColor={cardBorder} rounded="2xl" p={5}>
          <Heading size="md" mb={1}>
            Favorites growth
          </Heading>
          <Text fontSize="sm" color={mutedText} mb={4}>
            How many customers added your restaurant to favorites
          </Text>

          <Box h={{ base: "260px", md: "320px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={favoritesTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#2D3748" strokeDasharray="4 4" />
                <XAxis dataKey="week" stroke="#CBD5F5" tickLine={false} axisLine={{ stroke: "#2D3748" }} />
                <YAxis stroke="#CBD5F5" tickLine={false} axisLine={{ stroke: "#2D3748" }} />
                <Tooltip
                  cursor={{ stroke: "rgba(255,255,255,0.15)" }}
                  contentStyle={{
                    background: "#111827",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    fontSize: "0.85rem",
                    color: "#E2E8F0",
                  }}
                />
                <Line type="monotone" dataKey="favorites" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* Repeat customers (pie) */}
        <Box bg={cardBg} borderWidth="1px" borderColor={cardBorder} rounded="2xl" p={5} gridColumn={{ base: "span 1", lg: "span 2" }}>
          <Heading size="md" mb={1}>
            Repeat customers
          </Heading>
          <Text fontSize="sm" color={mutedText} mb={4}>
            Distribution of customer return frequency
          </Text>

          <Box h={{ base: "280px", md: "360px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    background: "#111827",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    fontSize: "0.85rem",
                    color: "#E2E8F0",
                  }}
                />
                <Legend />
                <Pie
                  data={repeatCustomers}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={2}
                >
                  {repeatCustomers.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Box>

          <Text fontSize="xs" color={mutedText} mt={2}>
            Tip: Improving repeat customers usually comes from consistent service + a simple loyalty perk.
          </Text>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
