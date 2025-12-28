// src/pages/Profile.jsx
import {
  Box,
  Heading,
  Text,
  Stack,
  Avatar,
  Button,
  Divider,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  HStack,
  Tag,
  Icon,
  Input,
  useToast,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { ref, onValue } from "firebase/database";
import { db
 } from "../firebase"
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiStar,
  FiHeart,
  FiPhone,
  FiMoon,
  FiUsers,
} from "react-icons/fi";
import { useAuth } from "../auth/AuthContext.jsx";

const mockUpcomingReservations = [
  {
    id: 1,
    restaurant: "Seb's",
    date: "2025-02-14",
    time: "20:00",
    guests: 2,
    status: "Upcoming",
    area: "Adliya",
  },
];

const mockPastReservations = [
  {
    id: 2,
    restaurant: "Seb's",
    date: "2025-01-10",
    time: "19:30",
    guests: 4,
    status: "Showed up",
  },
  {
    id: 3,
    restaurant: "Café Marais",
    date: "2024-12-20",
    time: "21:00",
    guests: 2,
    status: "Cancelled",
  },
];

const mockFavourites = [
  {
    id: 1,
    name: "Seb's",
    location: "Adliya, Bahrain",
    vibe: ["🌙 Late night", "🎷 Live music", "💑 Date spot"],
  },
  {
    id: 2,
    name: "Café Marais",
    location: "Manama",
    vibe: ["☕ Brunch", "🌿 Outdoor", "👯 Friends"],
  },
];

export default function Profile() {
  const [myReservations, setMyReservations] = useState([]);
  const updatesCount = myReservations.filter(r => r.status && r.status !== "pending").length;
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef(null);

  // guard in case someone hits /profile without RequireAuth
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);


  useEffect(() => {
  if (!user) return;

  const rRef = ref(db, "reservations");

  const unsub = onValue(rRef, (snap) => {
    const data = snap.val() || {};
    const list = Object.values(data).filter(
      (r) => r.userId === user.uid
    );
    setMyReservations(list);
  });

  return () => unsub();
}, [user]);


  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedMood, setSelectedMood] = useState("Chill");
  const [preferences, setPreferences] = useState({
    phone: "",
    favouriteCuisine: "",
    dietaryNotes: "",
    perfectNight: "",
  });

  if (!user) return null;

  const getInitials = (nameOrEmail) => {
    if (!nameOrEmail) return "";
    return nameOrEmail
      .split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const initials = getInitials(user.name || user.email);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setAvatarPreview(url);

    toast({
      title: "Profile picture updated (locally)",
      description: "We’ll wire this up to real storage later.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handlePreferenceChange = (field) => (e) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSavePreferences = () => {
    toast({
      title: "Preferences saved (for now)",
      description: "Later this can be stored in your actual account.",
      status: "success",
      duration: 2500,
      isClosable: true,
    });
  };

  const moods = ["Chill", "Friends", "Fancy"];

  // ===== RENDER HELPERS =====

  const renderTonight = () => {
    const tonight = mockUpcomingReservations[0];

    return (
      <Stack spacing={6}>
        <Box>
          <Heading as="h2" fontSize="md" mb={2}>
            Tonight
          </Heading>
          {tonight ? (
            <Box
              p={5}
              borderRadius="2xl"
              bg="neutral.800"
              border="1px solid"
              borderColor="whiteAlpha.200"
            >
              <Text
                fontSize="xs"
                letterSpacing="0.18em"
                textTransform="uppercase"
                color="brand.200"
                mb={2}
              >
                Your next night
              </Text>
              <Heading fontSize="lg" mb={1}>
                {tonight.restaurant}
              </Heading>
              <Text fontSize="sm" color="neutral.200" mb={3}>
                {tonight.area} · {tonight.guests} guests
              </Text>

              <HStack spacing={4} fontSize="sm" color="neutral.200" mb={4}>
                <HStack spacing={1}>
                  <Icon as={FiCalendar} />
                  <Text>{tonight.date}</Text>
                </HStack>
                <HStack spacing={1}>
                  <Icon as={FiClock} />
                  <Text>{tonight.time}</Text>
                </HStack>
              </HStack>

              <HStack spacing={2}>
                <Badge colorScheme="yellow" borderRadius="full">
                  Upcoming
                </Badge>
                <Tag
                  size="sm"
                  borderRadius="full"
                  bg="whiteAlpha.100"
                  color="neutral.100"
                >
                  Auto-reminder before your booking
                </Tag>
              </HStack>

              <HStack spacing={3} mt={4}>
                <Button
                  size="sm"
                  colorScheme="brand"
                  borderRadius="full"
                >
                  View details
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  borderRadius="full"
                  borderColor="whiteAlpha.400"
                  _hover={{ bg: "whiteAlpha.100" }}
                >
                  Change time
                </Button>
              </HStack>
            </Box>
          ) : (
            <Box
              p={5}
              borderRadius="2xl"
              bg="neutral.800"
              border="1px solid"
              borderColor="whiteAlpha.200"
            >
              <Text fontSize="sm" color="neutral.200" mb={3}>
                No plans for tonight yet.
              </Text>
              <Button
                colorScheme="brand"
                borderRadius="full"
                size="sm"
                onClick={() => navigate("/reservations")}
              >
                Find a table
              </Button>
            </Box>
          )}
        </Box>

        <Box>
          <Heading as="h2" fontSize="md" mb={2}>
            Your mood for the night
          </Heading>
          <HStack spacing={2}>
            {moods.map((mood) => (
              <Button
                key={mood}
                size="xs"
                borderRadius="full"
                variant={selectedMood === mood ? "solid" : "outline"}
                colorScheme="brand"
                onClick={() => setSelectedMood(mood)}
              >
                {mood === "Chill" && "✨ Chill"}
                {mood === "Friends" && "👯 Friends"}
                {mood === "Fancy" && "🍷 Fancy"}
              </Button>
            ))}
          </HStack>
          <Text fontSize="xs" color="neutral.300" mt={2}>
            (Just for fun for now — later we can use this to suggest places.)
          </Text>
        </Box>
      </Stack>
    );
  };

  const renderMyNights = () => (
    <Stack spacing={5}>
      <Box>
        <Heading as="h2" fontSize="md" mb={2}>
          Your nights so far
        </Heading>
        <Text fontSize="sm" color="neutral.200">
          You&apos;ve gone out with us{" "}
          <b>{mockPastReservations.length}</b> times.
        </Text>
      </Box>

      <Box position="relative">
        <Box
          position="absolute"
          left="10px"
          top="0"
          bottom="0"
          borderLeft="1px dashed"
          borderColor="whiteAlpha.300"
        />
        <Stack spacing={4} pl={6}>
{myReservations.length === 0 ? (
  <Text fontSize="sm" color="neutral.300">
    No reservations yet.
  </Text>
) : (
  myReservations.map((r, i) => (
    <Box
      key={i}
      p={3}
      border="1px solid"
      borderColor="whiteAlpha.200"
      borderRadius="md"
      mb={3}
    >
      <Text fontWeight="bold">{r.restaurantName}</Text>
      <Text fontSize="sm" color="neutral.200">
        {r.date} · {r.time} · {r.guests} guests
      </Text>
      <Tag
        mt={2}
        colorScheme={
          r.status === "approved"
            ? "green"
            : r.status === "pending"
            ? "yellow"
            : r.status === "rejected"
            ? "red"
            : "gray"
        }
      >
        {r.status}
      </Tag>
    </Box>
  ))
)}

        </Stack>
      </Box>
    </Stack>
  );

  const renderSavedSpots = () => (
    <Stack spacing={4}>
      <Box>
        <Heading as="h2" fontSize="md" mb={2}>
          Saved spots
        </Heading>
        <Text fontSize="sm" color="neutral.200">
          Places you love, or want to try soon. Tap a card to turn a &quot;maybe
          later&quot; into a real night out.
        </Text>
      </Box>

      {mockFavourites.length === 0 ? (
        <Text fontSize="sm" color="neutral.300">
          You haven&apos;t saved any spots yet. Tap the heart icon on a
          restaurant to add it here.
        </Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {mockFavourites.map((fav) => (
            <Box
              key={fav.id}
              p={4}
              borderRadius="xl"
              bg="neutral.800"
              border="1px solid"
              borderColor="whiteAlpha.150"
            >
              <HStack justify="space-between" mb={2}>
                <Box>
                  <Text fontWeight="semibold" fontSize="sm">
                    {fav.name}
                  </Text>
                  <HStack spacing={1} mt={1} fontSize="xs" color="neutral.200">
                    <Icon as={FiMapPin} />
                    <Text>{fav.location}</Text>
                  </HStack>
                </Box>
                <Icon as={FiHeart} color="brand.200" />
              </HStack>

              <HStack spacing={2} flexWrap="wrap" mb={3}>
                {fav.vibe.map((tag) => (
                  <Tag
                    key={tag}
                    size="sm"
                    borderRadius="full"
                    bg="whiteAlpha.100"
                    color="neutral.50"
                  >
                    {tag}
                  </Tag>
                ))}
              </HStack>

              <Button
                size="xs"
                borderRadius="full"
                colorScheme="brand"
                variant="solid"
              >
                Book a table
              </Button>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );

  const renderYou = () => (
    <Stack spacing={5} maxW="lg">
      <Box>
        <Heading as="h2" fontSize="md" mb={2}>
          You
        </Heading>
        <Text fontSize="sm" color="neutral.200">
          A few optional details that help shape your experience. None of this
          is required — just fill what feels useful.
        </Text>
      </Box>

      <Stack spacing={3}>
        <Box>
          <Text fontSize="xs" mb={1} color="neutral.300">
            Phone number (optional)
          </Text>
          <InputGroup size="sm">
            <InputLeftElement pointerEvents="none">
              <Icon as={FiPhone} fontSize="xs" color="neutral.300" />
            </InputLeftElement>
            <Input
              borderRadius="lg"
              placeholder="+973 ..."
              value={preferences.phone}
              onChange={handlePreferenceChange("phone")}
            />
          </InputGroup>
        </Box>

        <Box>
          <Text fontSize="xs" mb={1} color="neutral.300">
            Favourite cuisine
          </Text>
          <Input
            size="sm"
            borderRadius="lg"
            placeholder="Italian, Japanese, European..."
            value={preferences.favouriteCuisine}
            onChange={handlePreferenceChange("favouriteCuisine")}
          />
        </Box>

        <Box>
          <Text fontSize="xs" mb={1} color="neutral.300">
            Dietary notes
          </Text>
          <Input
            size="sm"
            borderRadius="lg"
            placeholder="Vegetarian, halal, gluten-free..."
            value={preferences.dietaryNotes}
            onChange={handlePreferenceChange("dietaryNotes")}
          />
        </Box>

        <Box>
          <Text fontSize="xs" mb={1} color="neutral.300">
            Describe your perfect night out
          </Text>
          <Input
            as="textarea"
            rows={3}
            resize="vertical"
            size="sm"
            borderRadius="lg"
            placeholder="Cozy table, good music, slow dinner..."
            value={preferences.perfectNight}
            onChange={handlePreferenceChange("perfectNight")}
          />
        </Box>
      </Stack>

      <Button
        alignSelf="flex-start"
        colorScheme="brand"
        borderRadius="full"
        size="sm"
        onClick={handleSavePreferences}
      >
        Save preferences
      </Button>

      <Stack spacing={2} pt={3}>
        <Text fontSize="xs" color="neutral.400">
          We&apos;ll later use this to help you find places that match your
          vibe: quieter rooms, certain cuisines, or special nights.
        </Text>
      </Stack>
    </Stack>
  );

  // ===== MAIN RENDER =====

  return (
    <Box maxW="6xl" mx="auto" pt={2} pb={10}>
      <Stack spacing={6}>
        {/* Header: avatar + name + quick actions */}
        <Stack
          direction={{ base: "column", md: "row" }}
          spacing={6}
          align={{ base: "flex-start", md: "center" }}
          justify="space-between"
        >
          <HStack spacing={4} align="center">
            <Box position="relative">
              <Avatar
                name={user.name || user.email}
                size="lg"
                bg="brand.400"
                color="white"
                src={avatarPreview || undefined}
                cursor="pointer"
                _hover={{ boxShadow: "0 0 0 2px rgba(250, 240, 230, 0.4)" }}
                onClick={handleAvatarClick}
              >
                {!avatarPreview && initials}
              </Avatar>
              <Input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                display="none"
                onChange={handleAvatarChange}
              />
            </Box>

            <Box>
              <Heading fontSize="2xl" mb={1}>
                Hi, {user.name || "there"}
              </Heading>
              <Text fontSize="sm" color="neutral.200">
                {user.email}
              </Text>
              {user.role && (
                <Badge
                  mt={2}
                  colorScheme={user.role === "owner" ? "red" : "yellow"}
                  borderRadius="full"
                >
                  {user.role === "owner" ? "Admin" : "Guest"}
                </Badge>
              )}
            </Box>
          </HStack>

          <HStack spacing={3}>
            <Button
              variant="outline"
              borderRadius="full"
              borderColor="brand.200"
              color="neutral.50"
              _hover={{ bg: "whiteAlpha.100", borderColor: "brand.100" }}
              size="sm"
              onClick={() => navigate("/reservations")}
            >
              Go to reservations
            </Button>
            <Button
              colorScheme="red"
              borderRadius="full"
              size="sm"
              onClick={handleLogout}
            >
              Log out
            </Button>
          </HStack>
        </Stack>

        <Divider borderColor="whiteAlpha.300" />

        {/* Tabs */}
        <Tabs variant="soft-rounded" colorScheme="brand">
          <TabList
            mb={4}
            bg="neutral.800"
            p={1}
            borderRadius="full"
            border="1px solid"
            borderColor="whiteAlpha.200"
          >
            <Tab fontSize="sm">
              <HStack spacing={1}>
                <Icon as={FiMoon} />
                <Text display={{ base: "none", sm: "inline" }}>Tonight</Text>
                <Text display={{ base: "inline", sm: "none" }}>Now</Text>
              </HStack>
            </Tab>
<Tab fontSize="sm">
  <HStack spacing={2}>
    <Text>My nights</Text>
    {updatesCount > 0 && (
      <Badge colorScheme="red" borderRadius="full" px={2}>
        {updatesCount}
      </Badge>
    )}
  </HStack>
</Tab>
            <Tab fontSize="sm">Saved spots</Tab>
            <Tab fontSize="sm">You</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>{renderTonight()}</TabPanel>
            <TabPanel px={0}>{renderMyNights()}</TabPanel>
            <TabPanel px={0}>{renderSavedSpots()}</TabPanel>
            <TabPanel px={0}>{renderYou()}</TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>
    </Box>
  );
}
