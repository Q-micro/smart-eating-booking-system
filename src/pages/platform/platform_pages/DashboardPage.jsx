// src/pages/platform/pages/DashboardPage.jsx
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  HStack,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  Badge,
  useColorModeValue,
  Divider,
  Grid,
  GridItem,
  Tooltip,
  Button,
  Progress,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../../firebase";

const normalizeStatus = (s) => String(s || "pending_review").trim().toLowerCase();

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function DashboardPage() {
  // theming
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const panelBg = useColorModeValue("white", "gray.800");
  const cardBg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("blackAlpha.200", "whiteAlpha.200");
  const muted = useColorModeValue("gray.600", "whiteAlpha.700");
  const accent = useColorModeValue("#c49a3a", "yellow.300"); // gold accent
  const softAccentBg = useColorModeValue("yellow.50", "whiteAlpha.100");

  const [restaurantsRaw, setRestaurantsRaw] = useState({});

  useEffect(() => {
    const unsubR = onValue(ref(db, "restaurants"), (s) => setRestaurantsRaw(s.val() || {}));
    return () => unsubR();
  }, []);

  const restaurants = useMemo(() => {
    return Object.entries(restaurantsRaw || {}).map(([ownerId, data]) => ({
      ownerId,
      ...data,
      status: normalizeStatus(data?.status),
    }));
  }, [restaurantsRaw]);

  const pending = useMemo(() => restaurants.filter((r) => r.status === "pending_review"), [restaurants]);
  const awaitingPayment = useMemo(
    () => restaurants.filter((r) => r.status === "approved_pending_payment"),
    [restaurants]
  );
  const active = useMemo(() => restaurants.filter((r) => r.status === "active"), [restaurants]);
  const rejected = useMemo(() => restaurants.filter((r) => r.status === "rejected"), [restaurants]);

  const total = restaurants.length || 0;

  const pct = useMemo(() => {
    const safeTotal = total || 1;
    return {
      pending: clamp((pending.length / safeTotal) * 100, 0, 100),
      awaitingPayment: clamp((awaitingPayment.length / safeTotal) * 100, 0, 100),
      active: clamp((active.length / safeTotal) * 100, 0, 100),
      rejected: clamp((rejected.length / safeTotal) * 100, 0, 100),
    };
  }, [total, pending.length, awaitingPayment.length, active.length, rejected.length]);

  /**
   * Subscriptions by month (Basic vs Premium)
   * Sample data for demonstration/UX evaluation purposes only.
   */
  const subscriptionSeries = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const seed =
      (pending.length * 17 +
        awaitingPayment.length * 29 +
        active.length * 7 +
        rejected.length * 13 +
        total * 3) ||
      9;

    const last6 = months.slice(6); // Jul..Dec
    const points = last6.map((m, i) => {
      const t = seed + i * 11;

      const base = Math.max(10, Math.round(total * 0.6) + 40);
      const wobble = Math.sin(t * 0.17) * 18 + Math.cos(t * 0.09) * 10;

      const premiumBias = 0.34 + Math.sin(t * 0.12) * 0.06; // ~34% premium
      const totalSubs = clamp(Math.round(base + wobble + i * 14), 35, 220);

      const premium = clamp(Math.round(totalSubs * premiumBias), 8, totalSubs - 10);
      const basic = clamp(totalSubs - premium, 10, 999);

      return { month: m, basic, premium, total: basic + premium };
    });

    const maxTotal = Math.max(1, ...points.map((p) => p.total));
    return { points, maxTotal };
  }, [pending.length, awaitingPayment.length, active.length, rejected.length, total]);

  const totalsByPlan = useMemo(() => {
    const basic = subscriptionSeries.points.reduce((a, p) => a + p.basic, 0);
    const premium = subscriptionSeries.points.reduce((a, p) => a + p.premium, 0);
    const all = basic + premium || 1;
    const pctPremium = clamp((premium / all) * 100, 0, 100);
    const pctBasic = clamp(100 - pctPremium, 0, 100);
    return { basic, premium, pctPremium, pctBasic };
  }, [subscriptionSeries.points]);

  /**
   * Partnerships (Bahrain) - clean list view
   * Sample data for demonstration/UX evaluation purposes only.
   */
  const partnershipAreas = useMemo(() => {
    const seed = total * 13 + active.length * 17 + pending.length * 7 + 11;

    const mk = (name, base) => {
      const wobble = Math.round((Math.sin(seed * 0.08 + base) + 1) * 2.5);
      const count = clamp(base + wobble, 3, 45);
      return { name, count };
    };

    const areas = [
      mk("Manama", 18),
      mk("Seef", 12),
      mk("Juffair", 10),
      mk("Riffa", 14),
      mk("Muharraq", 9),
      mk("Isa Town", 8),
    ];

    const totalPartners = areas.reduce((a, x) => a + x.count, 0);
    const top = [...areas].sort((a, b) => b.count - a.count);
    return { top, totalPartners };
  }, [total, active.length, pending.length]);

  return (
    <Box bg={pageBg} minH="100vh" px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }}>
      {/* Top header */}
      <HStack justify="space-between" mb={6} wrap="wrap" spacing={4}>
        <Box>
          <HStack spacing={3} mb={1} align="center" wrap="wrap">
            <Badge
              variant="subtle"
              bg={softAccentBg}
              color={useColorModeValue("yellow.800", "yellow.200")}
              borderRadius="full"
              px={3}
              py={1}
              fontSize="xs"
              letterSpacing="0.12em"
              textTransform="uppercase"
            >
              /sebs-admin
            </Badge>
           
          </HStack>

      
        </Box>

        <Tooltip label="Refreshes automatically via Firebase listeners" hasArrow>
          <Button variant="outline" borderColor={border}>
            Live
            <Box
              as="span"
              ml={2}
              w="8px"
              h="8px"
              borderRadius="full"
              bg={useColorModeValue("green.400", "green.300")}
              display="inline-block"
            />
          </Button>
        </Tooltip>
      </HStack>

      {/* Main content panel */}
      <Box
        bg={panelBg}
        borderRadius="2xl"
        boxShadow="sm"
        border="1px solid"
        borderColor={useColorModeValue("blackAlpha.100", "whiteAlpha.100")}
        p={{ base: 4, md: 6, lg: 8 }}
      >
        {/* KPI cards */}
        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={5} mb={8}>
          <Card title="Pending applications" value={pending.length} highlight={pending.length > 0} />
          <Card title="Awaiting payment" value={awaitingPayment.length} highlight={awaitingPayment.length > 0} />
          <Card title="Active restaurants" value={active.length} highlight />
          <Card title="Rejected" value={rejected.length} />
        </SimpleGrid>

        {/* Insights + Visuals */}
        <Grid templateColumns={{ base: "1fr", lg: "1.05fr 1fr" }} gap={6} mb={6}>
          {/* Status Breakdown */}
          <GridItem>
            <Box
              bg={cardBg}
              border="1px solid"
              borderColor={border}
              rounded="2xl"
              p={{ base: 5, md: 6 }}
              boxShadow="xs"
            >
              <HStack justify="space-between" mb={3} align="start" wrap="wrap" spacing={3}>
                <Box>
                  <Heading size="md">Status breakdown</Heading>
                  <Text fontSize="sm" color={muted} mt={1}>
                    Distribution across the full pipeline.
                  </Text>
                </Box>
                <Badge variant="outline" borderRadius="full" px={3} fontSize="xs">
                  total: {total}
                </Badge>
              </HStack>

              {/* stacked bar */}
              <Box border="1px solid" borderColor={border} rounded="xl" overflow="hidden" h="14px" mb={4}>
                <HStack spacing={0} h="100%">
                  <Box flex={pct.pending} bg={useColorModeValue("yellow.400", "yellow.300")} />
                  <Box flex={pct.awaitingPayment} bg={useColorModeValue("blue.400", "blue.300")} />
                  <Box flex={pct.active} bg={useColorModeValue("green.400", "green.300")} />
                  <Box flex={pct.rejected} bg={useColorModeValue("red.400", "red.300")} />
                </HStack>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <MiniMetric
                  label="Pending review"
                  value={`${pct.pending.toFixed(0)}%`}
                  sub={`${pending.length} items`}
                  colorScheme="yellow"
                />
                <MiniMetric
                  label="Awaiting payment"
                  value={`${pct.awaitingPayment.toFixed(0)}%`}
                  sub={`${awaitingPayment.length} items`}
                  colorScheme="blue"
                />
                <MiniMetric label="Active" value={`${pct.active.toFixed(0)}%`} sub={`${active.length} items`} colorScheme="green" />
                <MiniMetric
                  label="Rejected"
                  value={`${pct.rejected.toFixed(0)}%`}
                  sub={`${rejected.length} items`}
                  colorScheme="red"
                />
              </SimpleGrid>

              <Divider my={4} />

              {/* Quick “health” hint bars */}
              <VStack align="stretch" spacing={3}>
                <HealthRow
                  label="Activation ratio"
                  value={total ? clamp((active.length / total) * 100, 0, 100) : 0}
                  colorScheme="green"
                  hint="Active ÷ total restaurants"
                />
                <HealthRow
                  label="Rejection ratio"
                  value={total ? clamp((rejected.length / total) * 100, 0, 100) : 0}
                  colorScheme="red"
                  hint="Rejected ÷ total restaurants"
                />
              </VStack>
            </Box>
          </GridItem>

          {/* Subscriptions chart */}
          <GridItem>
            <Box
              bg={cardBg}
              border="1px solid"
              borderColor={border}
              rounded="2xl"
              p={{ base: 5, md: 6 }}
              boxShadow="xs"
            >
              <HStack justify="space-between" mb={2} align="start" wrap="wrap" spacing={3}>
                <Box>
                  <Heading size="md">Subscriptions by month</Heading>
                  <Text fontSize="sm" color={muted} mt={1}>
                    Basic vs Premium restaurants (sample data for demonstration purposes).
                  </Text>
                </Box>

                <HStack spacing={2} wrap="wrap">
                  <Badge colorScheme="purple" borderRadius="full" px={3}>
                    Premium share: {totalsByPlan.pctPremium.toFixed(0)}%
                  </Badge>
                  <Badge colorScheme="gray" variant="outline" borderRadius="full" px={3} borderColor={border}>
                    Basic share: {totalsByPlan.pctBasic.toFixed(0)}%
                  </Badge>
                </HStack>
              </HStack>

              <Divider my={4} />

              {/* Legend */}
              <HStack spacing={3} mb={3} wrap="wrap">
                <HStack spacing={2}>
                  <Box w="10px" h="10px" borderRadius="sm" bg={useColorModeValue("blackAlpha.300", "whiteAlpha.300")} />
                  <Text fontSize="sm" color={muted}>
                    Basic
                  </Text>
                </HStack>
                <HStack spacing={2}>
                  <Box w="10px" h="10px" borderRadius="sm" bg={accent} />
                  <Text fontSize="sm" color={muted}>
                    Premium
                  </Text>
                </HStack>
              </HStack>

              {/* Bars */}
              <HStack align="end" spacing={3} h="160px">
                {subscriptionSeries.points.map((p) => {
                  const totalH = Math.max(10, Math.round((p.total / subscriptionSeries.maxTotal) * 140));
                  const premH = Math.max(6, Math.round((p.premium / Math.max(1, p.total)) * totalH));
                  const basicH = Math.max(6, totalH - premH);

                  return (
                    <Tooltip
                      key={p.month}
                      hasArrow
                      label={`${p.month}: ${p.total} total • ${p.basic} basic • ${p.premium} premium`}
                    >
                      <Box flex="1" minW="34px">
                        <Box
                          h={`${totalH}px`}
                          border="1px solid"
                          borderColor={border}
                          rounded="lg"
                          overflow="hidden"
                          display="flex"
                          flexDir="column"
                          justifyContent="flex-end"
                          bg={useColorModeValue("white", "gray.900")}
                        >
                          <Box h={`${basicH}px`} bg={useColorModeValue("blackAlpha.300", "whiteAlpha.300")} />
                          <Box h={`${premH}px`} bg={accent} />
                        </Box>
                        <Text mt={2} fontSize="xs" color={muted} textAlign="center">
                          {p.month}
                        </Text>
                      </Box>
                    </Tooltip>
                  );
                })}
              </HStack>

              <Divider my={4} />

              <SimpleGrid columns={{ base: 2 }} spacing={4}>
                <MiniStat label="Basic (6 mo)" value={totalsByPlan.basic} />
                <MiniStat label="Premium (6 mo)" value={totalsByPlan.premium} />
              </SimpleGrid>
            </Box>
          </GridItem>
        </Grid>

        {/* Bahrain partnerships (clean list, no map) */}
        <Box
          bg={cardBg}
          border="1px solid"
          borderColor={border}
          rounded="2xl"
          p={{ base: 5, md: 6 }}
          boxShadow="xs"
        >
          <HStack justify="space-between" mb={2} align="start" wrap="wrap" spacing={3}>
            <Box>
              <Heading size="md">Partnership footprint </Heading>
            </Box>
            <Badge variant="outline" borderRadius="full" px={3} borderColor={border}>
              partners: {partnershipAreas.totalPartners}
            </Badge>
          </HStack>

          <Divider my={4} />

          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
            {partnershipAreas.top.map((a) => (
              <Box
                key={a.name}
                border="1px solid"
                borderColor={border}
                rounded="xl"
                p={4}
                _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
                transition="all 0.15s ease-out"
              >
                <HStack justify="space-between" align="start">
                  <Box>
                    <Text fontWeight="900">{a.name}</Text>
                    <Text fontSize="sm" color={muted} mt={0.5}>
                      Partner restaurants
                    </Text>
                  </Box>
                  <Badge colorScheme="green" borderRadius="full" px={3}>
                    {a.count}
                  </Badge>
                </HStack>
              </Box>
            ))}
          </SimpleGrid>

          <Divider my={4} />

    
        </Box>
      </Box>
    </Box>
  );
}

function Card({ title, value, highlight }) {
  const cardBg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("blackAlpha.200", "whiteAlpha.200");
  const muted = useColorModeValue("gray.600", "whiteAlpha.700");
  const accent = useColorModeValue("#c49a3a", "yellow.300");

  return (
    <Stat
      bg={cardBg}
      border="1px solid"
      borderColor={border}
      rounded="2xl"
      p={5}
      boxShadow="xs"
      _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
      transition="all 0.15s ease-out"
    >
      <StatLabel color={muted} fontWeight="700" fontSize="sm" textTransform="capitalize">
        {title}
      </StatLabel>
      <StatNumber fontSize="2xl" color={highlight ? accent : "inherit"} mt={1}>
        {value}
      </StatNumber>
    </Stat>
  );
}

function MiniMetric({ label, value, sub, colorScheme = "gray" }) {
  const border = useColorModeValue("blackAlpha.200", "whiteAlpha.200");
  const muted = useColorModeValue("gray.600", "whiteAlpha.700");
  const bg = useColorModeValue("white", "gray.800");

  return (
    <Box bg={bg} border="1px solid" borderColor={border} rounded="xl" p={4}>
      <HStack justify="space-between" align="start">
        <Box>
          <Text fontSize="sm" fontWeight="900">
            {label}
          </Text>
          <Text fontSize="xs" color={muted} mt={1}>
            {sub}
          </Text>
        </Box>

        <Badge colorScheme={colorScheme} borderRadius="full" px={3} py={1} fontWeight="900">
          {value}
        </Badge>
      </HStack>
    </Box>
  );
}

function MiniStat({ label, value }) {
  const border = useColorModeValue("blackAlpha.200", "whiteAlpha.200");
  const muted = useColorModeValue("gray.600", "whiteAlpha.700");
  const bg = useColorModeValue("white", "gray.800");

  return (
    <Box bg={bg} border="1px solid" borderColor={border} rounded="xl" p={4}>
      <Text fontSize="xs" color={muted} fontWeight="800" letterSpacing="0.08em" textTransform="uppercase">
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight="900" mt={1}>
        {value}
      </Text>
    </Box>
  );
}

function HealthRow({ label, value, colorScheme, hint }) {
  const border = useColorModeValue("blackAlpha.200", "whiteAlpha.200");
  const muted = useColorModeValue("gray.600", "whiteAlpha.700");

  return (
    <Box border="1px solid" borderColor={border} rounded="xl" p={4}>
      <HStack justify="space-between" mb={2} wrap="wrap" spacing={2}>
        <Box>
          <Text fontWeight="900" fontSize="sm">
            {label}
          </Text>
          <Text fontSize="xs" color={muted} mt={0.5}>
            {hint}
          </Text>
        </Box>
        <Badge colorScheme={colorScheme} borderRadius="full" px={3}>
          {value.toFixed(0)}%
        </Badge>
      </HStack>
      <Progress value={value} colorScheme={colorScheme} borderRadius="full" />
    </Box>
  );
}
