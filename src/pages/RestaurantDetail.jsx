// RestaurantDetail.jsx
import {
  Box,
  Heading,
  Text,
  Image,
  Stack,
  Tag,
  HStack,
  Button,
  IconButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  FormErrorMessage,
  useToast,
  Link,
  Divider,
  Wrap,
  WrapItem,
  Collapse,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Spinner,
  Center,
  useDisclosure,
  Tooltip,
  Checkbox,
} from "@chakra-ui/react";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import { useState, useMemo, useRef, useEffect } from "react";
import { sendNotification } from "../utils/notify";

// ✅ Social app icons
import {
  FaInstagram,
  FaTiktok,
  FaGlobe,
  FaMapMarkerAlt,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
  FaUsers,
  FaClock,
  FaInfoCircle,
} from "react-icons/fa";

// Dummy data
import { restaurants as dummyRestaurants } from "../data/restaurants";

// Firebase (Realtime Database)
import { db } from "../firebase";
import { ref, push, onValue, set, update } from "firebase/database";
import { useAuth } from "../auth/AuthContext";

import tableA1View from "../assets/table-a1-view.jpeg";
import SebTimer from "../components/SebTimer";

/**
 * Table map (TEMP — for seed restaurants)
 */
const seedTables = [
  { id: "B1", label: "B1", capacity: 4, area: "Restaurant (non-smoking)" },
  { id: "B2", label: "B2", capacity: 4, area: "Restaurant (non-smoking)" },
  { id: "B3", label: "B3", capacity: 4, area: "Restaurant (non-smoking)" },
  { id: "B4", label: "B4", capacity: 4, area: "Lounge (smoking area)" },
  { id: "B5", label: "B5", capacity: 4, area: "Lounge (smoking area)" },
  { id: "B6", label: "B6", capacity: 4, area: "Lounge (smoking area)" },
  { id: "A1", label: "A1", capacity: 2, area: "Terrace" },
  { id: "A2", label: "A2", capacity: 2, area: "Terrace" },
  { id: "A3", label: "A3", capacity: 4, area: "Private room" },
  { id: "A4", label: "A4", capacity: 4, area: "Private room" },
];

/**
 * Time slots
 */
const timeSlots = [
  { id: "21-30-lounge", time: "9:30 PM", area: "Lounge (smoking area)" },
  { id: "21-30-rest", time: "9:30 PM", area: "Restaurant (non-smoking)" },
  { id: "22-00-rest", time: "10:00 PM", area: "Restaurant (non-smoking)" },
  { id: "22-00-lounge", time: "10:00 PM", area: "Lounge (smoking area)" },
  { id: "22-30-terr", time: "10:30 PM", area: "Terrace (smoking area)" },
  { id: "22-30-rest", time: "10:30 PM", area: "Restaurant (non-smoking)" },
  { id: "23-00-terr", time: "11:00 PM", area: "Terrace (smoking area)" },
  { id: "23-00-rest", time: "11:00 PM", area: "Restaurant (non-smoking)" },
  { id: "23-30-terr", time: "11:30 PM", area: "Terrace (smoking area)" },
  { id: "23-30-rest", time: "11:30 PM", area: "Restaurant (non-smoking)" },
];

/**
 * “Stay duration” choices (stored as TEXT like you requested)
 * You can edit these labels anytime.
 */
const STAY_OPTIONS = ["±30m", "±1h", "±2h", "1+", "2+", "3+"];

/**
 * Occasion chips (you can add/remove freely)
 * (Matches the vibe of the screenshot — pill chips)
 */
const OCCASION_OPTIONS = [
  "Anniversary",
  "Baby Shower",
  "Birthday",
  "Bridal Shower",
  "Business Celebration",
  "Business Meeting",
  "Celebration",
  "Congratulations",
  "Corporate Event",
  "Engagement",
  "Graduation",
  "Honeymoon",
  "Job Promotion",
  "Special Event",
];

/**
 * Dietary & allergy options (expanded to match your screenshot vibe)
 * You can trim this list if you want.
 */
const DIETARY_OPTIONS = [
  "Alcohol-Free",
  "Allergy",
  "Allium",
  "Celery",
  "Crustacean",
  "Dairy-Free",
  "Diabetic",
  "Eggs",
  "Fish",
  "Garlic",
  "Gluten-Free",
  "Halal",
  "Hazelnut",
  "Kosher",
  "Lactose Intolerant",
  "Lupin",
  "Milk",
  "Mushrooms",
  "Mustard",
  "Nightshade",
  "Nuts",
  "Paleo",
  "Peanuts",
  "Pescatarian",
  "Pork",
  "Poultry",
  "Pregnant",
  "Red Meat",
  "Salt",
  "Seafood",
  "Sesame",
  "Shellfish",
  "Shrimp",
  "Soy",
  "Sulfites",
  "Tomatoes",
  "Tree Nuts",
  "Vegan",
  "Vegetarian",
  "Walnuts",
  "Wheat",
];

function normalizeRestaurant(r, source, idFromRoute) {
  if (!r) return null;

  if (source === "seed") {
    return {
      id: idFromRoute,
      name: r.name,
      cuisine: r.cuisine,
      priceRange: r.price || null,
      images: r.images || [],
      description: r.description || "",
      location: r.location || "",
      hours: r.hours || "",
      agePreference: r.ageRestriction || "",
      phone: r.phone || "",
      contactEmail: r.contactEmail || "",
      address: r.address || "",
      menuUrl: r.menuUrl || null,
      features: Array.isArray(r.features) ? r.features : [],
      links: r.links || {},
      plan: "basic",
      operatingHours: null,
      status: "active",
      source: "seed",
    };
  }

  // firebase shape
  return {
    id: idFromRoute, // ownerUid
    name: r.name || "Unnamed restaurant",
    cuisine: r.cuisine || "Cuisine",
    priceRange: r.priceRange || null,
    images: r.photos || r.images || [],
    description: r.description || "",
    location: r.location || "",
    hours: r.hours || "",
    agePreference: r.agePreference || r.ageRestriction || "",
    phone: r.phone || "",
    contactEmail: r.contactEmail || "",
    address: r.address || "",
    menuUrl: r.menuUrl || null,
    restaurantType: r.restaurantType || null,
    features: Array.isArray(r.features) ? r.features : [],
    operatingHours: r.operatingHours || null,
    links: r.links || {},
    plan: r.plan || "basic",
    status: r.status || "unknown",
    source: "firebase",
  };
}

export default function RestaurantDetail() {
  const { id } = useParams();
  const toast = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isSeed = id?.startsWith("seed-");
  const seedId = isSeed ? id.replace("seed-", "") : null;

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  // Saved layout (from RTDB)
  const [layout, setLayout] = useState(null);
  const [layoutLoading, setLayoutLoading] = useState(true);

  // Saved layout tables only (tables node)
  const [layoutTables, setLayoutTables] = useState({});
  const [loadingLayout, setLoadingLayout] = useState(false);

  // panorama
  const tableImages = { A1: tableA1View };
  const viewModal = useDisclosure();

  // login modal
  const loginModal = useDisclosure();

  // pending status modal
  const pendingModal = useDisclosure();

  // timer modal
  const timerModal = useDisclosure();

  // waitlist modal (ONLY when table taken)
  const waitlistTakenModal = useDisclosure();

  // waitlist prompt modal (admin offered waitlist)
  const waitlistPromptModal = useDisclosure();

  // rules modal (before final submit)
  const rulesModal = useDisclosure();

  // booking form state
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UI polish additions
  const [stayDuration, setStayDuration] = useState(""); // ✅ text like "±1h" or "2+"

  // VIP extras
  const [showExtraDetails, setShowExtraDetails] = useState(false);
  const [occasion, setOccasion] = useState("");
  const [dietary, setDietary] = useState([]); // ✅ expanded options
  const [otherDietary, setOtherDietary] = useState("");
  const [healthNotes, setHealthNotes] = useState("");

  // Rules acceptance
  const [agreedToRules, setAgreedToRules] = useState(false);

  // all reservations snapshot (to check taken tables)
  const [allReservations, setAllReservations] = useState({});

  // waitlist flow data
  const [pendingTablePick, setPendingTablePick] = useState(null);
  const [waitlistPhone, setWaitlistPhone] = useState("");
  const [waitlistBusy, setWaitlistBusy] = useState(false);

  // live tracking of the reservation that was just submitted
  const [submittedReservationId, setSubmittedReservationId] = useState(null);
  const [pendingStatus, setPendingStatus] = useState("pending");
  const [expiresAt, setExpiresAt] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // date limits
  const { minDate, maxDate } = useMemo(() => {
    const today = new Date();
    const sixMonths = new Date();
    sixMonths.setMonth(sixMonths.getMonth() + 6);
    const toInput = (d) => d.toISOString().split("T")[0];
    return { minDate: toInput(today), maxDate: toInput(sixMonths) };
  }, []);

  // load restaurant (seed or firebase)
  useEffect(() => {
    setLoading(true);

    if (isSeed) {
      const found = dummyRestaurants.find((r) => r.id === seedId);
      setRestaurant(normalizeRestaurant(found, "seed", id));
      setLoading(false);
      return;
    }

    const rRef = ref(db, `restaurants/${id}`);
    const unsub = onValue(
      rRef,
      (snap) => {
        const data = snap.val();
        setRestaurant(normalizeRestaurant(data, "firebase", id));
        setLoading(false);
      },
      (err) => {
        console.error("Error loading restaurant:", err);
        setRestaurant(null);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [id, isSeed, seedId]);

  // Load saved layout tables for firebase restaurants (tables node)
  useEffect(() => {
    if (isSeed) {
      setLayoutTables({});
      setLoadingLayout(false);
      return;
    }

    if (!id) return;

    setLoadingLayout(true);
    const tRef = ref(db, `restaurants/${id}/layouts/main/tables`);

    const unsub = onValue(
      tRef,
      (snap) => {
        setLayoutTables(snap.val() || {});
        setLoadingLayout(false);
      },
      (err) => {
        console.error("Error loading layout tables:", err);
        setLayoutTables({});
        setLoadingLayout(false);
      }
    );

    return () => unsub();
  }, [id, isSeed]);

  // Load whole layout (cols/rowHeight/tables/pois)
  useEffect(() => {
    if (!restaurant?.id) return;

    setLayoutLoading(true);
    const layoutRef = ref(db, `restaurants/${restaurant.id}/layouts/main`);
    const unsub = onValue(
      layoutRef,
      (snap) => {
        setLayout(snap.val() || null);
        setLayoutLoading(false);
      },
      () => {
        setLayout(null);
        setLayoutLoading(false);
      }
    );

    return () => unsub();
  }, [restaurant?.id]);

  // read all reservations to detect taken tables
  useEffect(() => {
    const rRef = ref(db, "reservations");
    return onValue(rRef, (snap) => setAllReservations(snap.val() || {}));
  }, []);

  const isTableTaken = (tableId) => {
    if (!restaurant?.id || !date || !selectedSlot?.id) return false;

    const list = Object.entries(allReservations).map(([rid, r]) => ({
      id: rid,
      ...r,
    }));

    const activeStatuses = [
      "pending",
      "approved",
      "waitlist_requested",
      "waitlist_offer",
      "waitlist_confirmed",
    ];

    return list.some((r) => {
      return (
        r.restaurantId === restaurant.id &&
        r.date === date &&
        r.timeSlotId === selectedSlot.id &&
        r.tableId === tableId &&
        activeStatuses.includes(r.status)
      );
    });
  };

  // live subscribe to submitted reservation and handle status updates
  useEffect(() => {
    if (!submittedReservationId) return;

    const oneRef = ref(db, `reservations/${submittedReservationId}`);
    const unsub = onValue(oneRef, (snap) => {
      const r = snap.val();
      if (!r) return;

      const st = r.status || "pending";
      setPendingStatus(st);
      setExpiresAt(r.expiresAt || null);

      if (["approved", "rejected", "expired"].includes(st)) {
        timerModal.onClose();
        pendingModal.onClose();
        setSubmittedReservationId(null);

        toast({
          title:
            st === "approved"
              ? "Reservation approved ✅"
              : st === "rejected"
              ? "Reservation rejected ❌"
              : "Reservation expired ⏰",
          status:
            st === "approved"
              ? "success"
              : st === "rejected"
              ? "error"
              : "warning",
          duration: 6000,
          isClosable: true,
        });

        return;
      }

      if (st === "waitlist_offer") {
        timerModal.onClose();
        pendingModal.onClose();
        setWaitlistPhone("");
        waitlistPromptModal.onOpen();

        toast({
          title: "Waiting list option",
          description:
            "The restaurant offered a waiting list spot. Add your WhatsApp number to join or cancel.",
          status: "info",
          duration: 6000,
          isClosable: true,
        });

        return;
      }
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submittedReservationId]);

  // countdown seconds for display
  useEffect(() => {
    if (!expiresAt) return;
    if (!submittedReservationId) return;
    if (pendingStatus !== "pending" && pendingStatus !== "waitlist_requested")
      return;

    const tick = () => {
      const left = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setSecondsLeft(left);
    };
    tick();
    const t = setInterval(tick, 250);
    return () => clearInterval(t);
  }, [expiresAt, pendingStatus, submittedReservationId]);

  const tablesForUI = useMemo(() => {
    // seed fallback
    if (isSeed) return seedTables;

    const list = Object.entries(layoutTables || {}).map(([key, t]) => ({
      id: key,
      label: t.label || key,
      capacity: Number(t.seats ?? 2),
      area: t.area || "Main",
      shape: t.shape || "square",
      unavailable: !!t.unavailable,
      occupied: !!t.occupied,

      // saved layout coords
      x: t.x ?? 0,
      y: t.y ?? 0,
      w: t.w ?? 4,
      h: t.h ?? 4,

      view360Url: t.view360Url || "",
      type: t.type || "table",
    }));

    list.sort(
      (a, b) => (a.y - b.y) || (a.x - b.x) || a.label.localeCompare(b.label)
    );
    return list;
  }, [isSeed, layoutTables]);

  if (loading) {
    return (
      <Center py={10}>
        <Spinner />
      </Center>
    );
  }

  if (!restaurant) {
    return (
      <Box>
        <Heading size="lg" mb={2}>
          Restaurant not found
        </Heading>
        <Text color="neutral.200" mb={4}>
          The restaurant you’re looking for doesn’t exist.
        </Text>
        <Button as={RouterLink} to="/reservations" colorScheme="brand">
          Back to reservations
        </Button>
      </Box>
    );
  }

  // block firebase restaurants not active
  if (restaurant.source === "firebase" && restaurant.status !== "active") {
    return (
      <Box>
        <Heading size="lg" mb={2}>
          Restaurant not available yet
        </Heading>
        <Text color="neutral.200" mb={4}>
          This restaurant is not active yet. Please check back later.
        </Text>
        <Button as={RouterLink} to="/reservations" colorScheme="brand">
          Back to reservations
        </Button>
      </Box>
    );
  }

  const images = Array.isArray(restaurant.images) ? restaurant.images : [];

  const validate = () => {
    const newErrors = {};
    if (!date) newErrors.date = "Please choose a date.";
    if (!guests || Number(guests) <= 0)
      newErrors.guests = "Please select number of guests.";
    if (!selectedSlot) newErrors.slot = "Please choose a time and area.";
    if (!selectedTable) newErrors.table = "Please choose a table.";
    if (!stayDuration) newErrors.stay = "Please choose how long you’ll stay.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createReservation = async ({ status, phoneOverride }) => {
    if (!user?.uid) {
      toast({
        title: "Please sign in to book",
        description: "You need an account to make a reservation.",
        status: "info",
        duration: 3500,
        isClosable: true,
      });
      loginModal.onOpen();
      return;
    }

    const expires = Date.now() + 120 * 1000; // 2 min
    const reservation = {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      date,
      guests: Number(guests),
      timeSlotId: selectedSlot.id,
      time: selectedSlot.time,
      area: selectedSlot.area,
      tableId: selectedTable.id,
      tableLabel: selectedTable.label,

      // ✅ NEW
      stayDuration: stayDuration || null, // text like "±1h" or "2+"
      occasion: occasion || null,
      dietary: Array.isArray(dietary) ? dietary : [],
      otherDietary: otherDietary.trim() || null,
      healthNotes: healthNotes.trim() || null,
      notes: notes.trim() || null,

      // ✅ rules acceptance (optional, but helpful)
      agreedToRules: !!agreedToRules,

      status,
      waitlistPhone: status === "waitlist_requested" ? phoneOverride : null,

      createdAt: Date.now(),
      expiresAt: expires,

      userId: user.uid,
      userName: user.name || user.displayName || null,
      userEmail: user.email || null,
    };

    const newRef = push(ref(db, "reservations"));
    await set(newRef, reservation);

    if (restaurant?.source === "firebase" && restaurant?.id) {
      await sendNotification(restaurant.id, {
        title: "New booking request",
        message: `${reservation.userName || "A customer"} requested Table ${
          reservation.tableLabel
        } at ${reservation.time} on ${reservation.date}`,
        link: `/admin/reservations`,
        type: "booking",
      });
    }

    setSubmittedReservationId(newRef.key);
    setExpiresAt(expires);
    setPendingStatus(status);

    pendingModal.onOpen();
    timerModal.onOpen();

    toast({
      title: "Booking request sent.",
      description:
        status === "waitlist_requested"
          ? "You requested a waiting list spot. The restaurant will respond."
          : "Waiting for restaurant confirmation…",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  // ✅ Instead of submitting immediately, we show rules first (if not accepted)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (!agreedToRules) {
      rulesModal.onOpen();
      return;
    }

    if (isTableTaken(selectedTable.id)) {
      setPendingTablePick(selectedTable);
      setWaitlistPhone("");
      waitlistTakenModal.onOpen();
      return;
    }

    setIsSubmitting(true);
    try {
      await createReservation({ status: "pending", phoneOverride: null });

      // reset optional fields
      setNotes("");
      setShowExtraDetails(false);
      setOccasion("");
      setDietary([]);
      setOtherDietary("");
      setHealthNotes("");
      setStayDuration("");
      setAgreedToRules(false);
    } catch (err) {
      console.error("Error saving reservation:", err);
      toast({
        title: "Could not submit booking.",
        description: "Please try again in a moment.",
        status: "error",
        duration: 4500,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelRequest = async () => {
    if (!submittedReservationId) return;
    try {
      await update(ref(db, `reservations/${submittedReservationId}`), {
        status: "cancelled",
        cancelledAt: Date.now(),
      });
      timerModal.onClose();
      pendingModal.onClose();
      setSubmittedReservationId(null);

      toast({
        title: "Cancelled",
        description: "Your request was cancelled.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Cancel failed",
        description: "Could not cancel. Try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Customer joins admin-offered waitlist
  const joinWaitlistOffer = async () => {
    if (!submittedReservationId) return;
    setWaitlistBusy(true);
    try {
      await update(ref(db, `reservations/${submittedReservationId}`), {
        status: "waitlist_requested",
        waitlistPhone: waitlistPhone.trim(),
        waitlistRequestedAt: Date.now(),
      });

      const restaurantWhatsApp = "97333071236";
      const msg = encodeURIComponent(
        `Hi! I joined the waiting list for ${restaurant?.name}.\n` +
          `Reservation ID: ${submittedReservationId}\n` +
          `Name: ${user?.displayName || user?.email || "Customer"}\n` +
          `Date: ${date} • Time: ${selectedSlot?.time}\n` +
          `Table: ${selectedTable?.label}`
      );
      window.open(`https://wa.me/${restaurantWhatsApp}?text=${msg}`, "_blank");

      toast({
        title: "Joined waiting list ✅",
        description: "(Demo) WhatsApp number saved.",
        status: "success",
        duration: 3500,
        isClosable: true,
      });

      waitlistPromptModal.onClose();
    } catch (err) {
      console.error(err);
      toast({
        title: "Could not join waitlist",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setWaitlistBusy(false);
    }
  };

  // Customer declines admin-offered waitlist
  const declineWaitlistOffer = async () => {
    if (!submittedReservationId) return;
    setWaitlistBusy(true);
    try {
      await update(ref(db, `reservations/${submittedReservationId}`), {
        status: "waitlist_declined",
        waitlistDeclinedAt: Date.now(),
      });

      toast({
        title: "Cancelled",
        description: "You declined the waiting list.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });

      waitlistPromptModal.onClose();
      setSubmittedReservationId(null);
    } catch (err) {
      console.error(err);
      toast({
        title: "Could not update",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setWaitlistBusy(false);
    }
  };

  return (
    <Box>
      <Button
        as={RouterLink}
        to="/reservations"
        variant="ghost"
        mb={4}
        color="neutral.200"
      >
        ← Back to reservations
      </Button>

      <Box
        bg="neutral.400"
        border="1px solid"
        borderColor="whiteAlpha.200"
        rounded="xl"
        overflow="hidden"
        boxShadow="lg"
      >
        {/* ✅ Hero: slideshow (more reliable than “just showing images[0]”) */}
        <Box>
          <ImageCarousel images={images} alt={restaurant.name} />
          {/* ✅ Social icons moved UNDER the photo (your request) */}
          <Box px={{ base: 4, md: 6 }} pt={3} pb={2}>
            <SocialRow links={restaurant?.links} />
          </Box>
        </Box>

        <Box p={{ base: 6, md: 8 }}>
          <Stack spacing={8}>
            {/* INFO */}
            <Stack spacing={4}>
              <Stack spacing={3}>
                <HStack justify="space-between" align="start">
                  <Heading>{restaurant.name}</Heading>
                  {restaurant.plan === "premium" && (
                    <Tag bg="purple.700" color="white">
                      Premium
                    </Tag>
                  )}
                </HStack>

                <HStack spacing={3} flexWrap="wrap">
                  <Tag bg="blackAlpha.700" color="neutral.200">
                    {restaurant.cuisine}
                  </Tag>

                  {restaurant.priceRange && (
                    <Tag bg="blackAlpha.700" color="neutral.200">
                      {restaurant.priceRange}
                    </Tag>
                  )}

                  {restaurant.restaurantType && (
                    <Tag bg="blackAlpha.700" color="neutral.200">
                      {prettyType(restaurant.restaurantType)}
                    </Tag>
                  )}

                  {restaurant.agePreference && (
                    <Tag bg="blackAlpha.700" color="neutral.200">
                      {prettyAge(restaurant.agePreference)}
                    </Tag>
                  )}

                  {restaurant.source === "firebase" && (
                    <Tag bg="whiteAlpha.200" color="whiteAlpha.900">
                      Verified
                    </Tag>
                  )}
                </HStack>

                {restaurant.description && (
                  <Text color="neutral.200">{restaurant.description}</Text>
                )}
              </Stack>

              {/* Operating hours */}
              {restaurant.operatingHours ? (
                <InfoBlock
                  label="Operating hours"
                  value={<HoursTable hours={restaurant.operatingHours} />}
                />
              ) : (
                <SimpleInfoRow label="Hours" value={restaurant.hours} />
              )}

              <SimpleInfoRow label="Phone" value={restaurant.phone} />
              {restaurant.contactEmail && (
                <SimpleInfoRow label="Email" value={restaurant.contactEmail} />
              )}
              {restaurant.address && (
                <SimpleInfoRow label="Address" value={restaurant.address} />
              )}

              {/* Features */}
              {Array.isArray(restaurant.features) &&
                restaurant.features.length > 0 && (
                  <InfoBlock
                    label="Key features"
                    value={<FeatureChips features={restaurant.features} />}
                  />
                )}

              {/* Links row (small buttons) */}
              <LinksRow links={restaurant.links} />

              {/* Menu */}
              {restaurant.menuUrl && restaurant.menuUrl !== "#" ? (
                <SimpleInfoRow
                  label="Menu"
                  value={
                    <Link href={restaurant.menuUrl} color="brand.400" isExternal>
                      View menu
                    </Link>
                  }
                />
              ) : (
                <SimpleInfoRow label="Menu" value="Menu link coming soon." />
              )}
            </Stack>

            <Divider borderColor="whiteAlpha.300" />

            {/* BOOKING */}
            <Box
              as="form"
              onSubmit={handleSubmit}
              bg="blackAlpha.500"
              border="1px solid"
              borderColor="whiteAlpha.300"
              rounded="lg"
              p={4}
            >
              <Heading size="md" mb={4}>
                Book a table
              </Heading>
              <Stack spacing={6}>
                {/* Guests + Date (bigger / nicer UI) */}
                <Stack direction={{ base: "column", md: "row" }} spacing={4}>
                  <FormControl isInvalid={!!errors.guests} flex="1">
                    <FormLabel fontSize="sm">Guests</FormLabel>
                    <Box position="relative">
                      <Box
                        position="absolute"
                        left="12px"
                        top="50%"
                        transform="translateY(-50%)"
                        color="whiteAlpha.700"
                        zIndex={2}
                      >
                        <FaUsers />
                      </Box>
                      <Select
                        pl="42px"
                        placeholder="Select guests"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        bg="blackAlpha.700"
                        borderColor="whiteAlpha.400"
                        color="white"
                        size="lg"
                        sx={{ option: { color: "black" } }}
                      >
                        <option value="1">1 guest</option>
                        <option value="2">2 guests</option>
                        <option value="3">3 guests</option>
                        <option value="4">4 guests</option>
                        <option value="5">5 guests</option>
                        <option value="6">6 guests</option>
                      </Select>
                    </Box>
                    {errors.guests && (
                      <FormErrorMessage>{errors.guests}</FormErrorMessage>
                    )}
                  </FormControl>

                  <FormControl isInvalid={!!errors.date} flex="1.2">
                    <FormLabel fontSize="sm">Date</FormLabel>

                    <Box position="relative">
                      <Box
                        position="absolute"
                        left="12px"
                        top="50%"
                        transform="translateY(-50%)"
                        color="whiteAlpha.700"
                        zIndex={2}
                      >
                        <FaCalendarAlt />
                      </Box>

                      <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        bg="blackAlpha.700"
                        borderColor="whiteAlpha.400"
                        min={minDate}
                        max={maxDate}
                        size="lg"
                        pl="42px"
                        color="white"
                        h="48px"
                      />
                    </Box>

                    {errors.date && (
                      <FormErrorMessage>{errors.date}</FormErrorMessage>
                    )}
                  </FormControl>
                </Stack>

                {/* ✅ Stay duration selector (like your screenshot) */}
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <FormLabel fontSize="sm" m={0}>
                      How long might you stay?
                    </FormLabel>
                    <Tooltip
                      label="Helps restaurants plan seating time."
                      hasArrow
                      placement="top"
                    >
                      <Box color="whiteAlpha.700">
                        <FaInfoCircle />
                      </Box>
                    </Tooltip>
                  </HStack>

                  <Wrap spacing={3}>
                    {STAY_OPTIONS.map((opt) => {
                      const active = stayDuration === opt;
                      return (
                        <WrapItem key={opt}>
                          <Button
                            type="button"
                            onClick={() => setStayDuration(opt)}
                            variant={active ? "solid" : "outline"}
                            colorScheme={active ? "brand" : "gray"}
                            bg={active ? "brand.400" : "blackAlpha.700"}
                            borderColor="whiteAlpha.400"
                            _hover={{
                              bg: active ? "brand.500" : "whiteAlpha.200",
                            }}
                            rounded="xl"
                            px={6}
                            py={6}
                            minW="110px"
                            leftIcon={<FaClock />}
                          >
                            {opt}
                          </Button>
                        </WrapItem>
                      );
                    })}
                  </Wrap>

                  {errors.stay && (
                    <Text mt={2} fontSize="xs" color="red.300">
                      {errors.stay}
                    </Text>
                  )}
                </Box>

                {/* Time slots */}
                <Box>
                  <FormLabel fontSize="sm">Time & area</FormLabel>
                  <Wrap spacing={3}>
                    {timeSlots.map((slot) => {
                      const active = selectedSlot?.id === slot.id;
                      return (
                        <WrapItem key={slot.id}>
                          <Button
                            onClick={() => setSelectedSlot(slot)}
                            variant={active ? "solid" : "outline"}
                            colorScheme={active ? "brand" : undefined}
                            borderColor="whiteAlpha.400"
                            bg={active ? "brand.400" : "blackAlpha.700"}
                            _hover={{
                              bg: active ? "brand.500" : "whiteAlpha.200",
                            }}
                            py={5}
                            px={5}
                            minW="170px"
                            justifyContent="flex-start"
                            rounded="xl"
                            type="button"
                          >
                            <Stack spacing={0} align="flex-start">
                              <Text fontWeight="semibold">{slot.time}</Text>
                              <Text fontSize="xs">{slot.area}</Text>
                            </Stack>
                          </Button>
                        </WrapItem>
                      );
                    })}
                  </Wrap>
                  {errors.slot && (
                    <Text mt={2} fontSize="xs" color="red.300">
                      {errors.slot}
                    </Text>
                  )}
                </Box>

                {/* ✅ Table selection */}
                <Box>
                  <FormLabel fontSize="sm">Table selection</FormLabel>

                  <Box
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    rounded="md"
                    p={4}
                    bg="blackAlpha.600"
                  >
                    <HStack justify="space-between" mb={3}>
                      <Text fontSize="xs" color="neutral.200">
                        Live layout (tap a table)
                      </Text>

                      <Text fontSize="xs" color="whiteAlpha.600">
                        {restaurant?.plan === "premium"
                          ? "Premium 360 enabled"
                          : "Basic (no 360 uploads)"}
                      </Text>
                    </HStack>

                    {loadingLayout || layoutLoading ? (
                      <Center py={8}>
                        <Spinner />
                      </Center>
                    ) : tablesForUI.length === 0 ? (
                      <Text fontSize="sm" color="whiteAlpha.700">
                        No tables found for this restaurant yet.
                      </Text>
                    ) : (
                      <CustomerLiveLayout
                        tables={tablesForUI}
                        date={date}
                        selectedSlot={selectedSlot}
                        isTableTaken={isTableTaken}
                        selectedId={selectedTable?.id}
                        onPick={(t) => {
                          const taken =
                            selectedSlot?.id && date
                              ? isTableTaken(t.id)
                              : false;
                          const blocked = !!t.unavailable;
                          const isPoi = t.type && t.type !== "table";

                          if (isPoi) return;

                          if (!selectedSlot || !date) {
                            toast({
                              title: "Pick date & time first",
                              description:
                                "Select your date and time slot before choosing a table.",
                              status: "info",
                              duration: 2500,
                              isClosable: true,
                            });
                            return;
                          }

                          if (blocked) {
                            toast({
                              title: "Table unavailable",
                              description:
                                "This table is currently blocked by the restaurant.",
                              status: "warning",
                              duration: 2500,
                              isClosable: true,
                            });
                            return;
                          }

                          if (taken) {
                            setPendingTablePick(t);
                            setWaitlistPhone("");
                            waitlistTakenModal.onOpen();
                          } else {
                            setSelectedTable(t);
                          }
                        }}
                        canShow360={restaurant?.plan === "premium"}
                        onOpen360={(t) => {
                          setSelectedTable(t);
                          viewModal.onOpen();
                        }}
                      />
                    )}
                  </Box>

                  {/* ✅ Premium 360 preview */}
                  {selectedTable &&
                    restaurant?.plan === "premium" &&
                    !!selectedTable.view360Url && (
                      <Box mt={4}>
                        <Text fontSize="sm" mb={2} color="neutral.200">
                          360° view from table {selectedTable.label}
                        </Text>

                        <Box
                          rounded="md"
                          border="1px solid"
                          borderColor="whiteAlpha.300"
                          overflow="hidden"
                          w="100%"
                          maxH={{ base: "260px", md: "320px" }}
                        >
                          <PanoramaView
                            src={selectedTable.view360Url}
                            height={{ base: 260, md: 320 }}
                            onClick={viewModal.onOpen}
                          />
                        </Box>

                        <Text fontSize="xs" mt={1} color="neutral.300">
                          Drag or swipe left / right to look around. Tap to open
                          full screen.
                        </Text>
                      </Box>
                    )}

                  {/* ✅ Seed demo preview */}
                  {selectedTable && isSeed && tableImages[selectedTable.id] && (
                    <Box mt={4}>
                      <Text fontSize="sm" mb={2} color="neutral.200">
                        View from table {selectedTable.label}
                      </Text>

                      <Box
                        rounded="md"
                        border="1px solid"
                        borderColor="whiteAlpha.300"
                        overflow="hidden"
                        w="100%"
                        maxH={{ base: "260px", md: "320px" }}
                      >
                        <PanoramaView
                          src={tableImages[selectedTable.id]}
                          height={{ base: 260, md: 320 }}
                          onClick={viewModal.onOpen}
                        />
                      </Box>

                      <Text fontSize="xs" mt={1} color="neutral.300">
                        Drag or swipe left / right to look around. Tap to open
                        full screen.
                      </Text>
                    </Box>
                  )}

                  {errors.table && (
                    <Text mt={2} fontSize="xs" color="red.300">
                      {errors.table}
                    </Text>
                  )}
                </Box>

                {/* Extra details */}
                <Box>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowExtraDetails((v) => !v)}
                    _hover={{ bg: "whiteAlpha.100" }}
                    type="button"
                    rounded="lg"
                  >
                    {showExtraDetails
                      ? "Hide extra details"
                      : "Add occasion / dietary needs (optional)"}
                  </Button>

                  <Collapse in={showExtraDetails} animateOpacity>
                    <Stack
                      mt={3}
                      spacing={5}
                      borderTop="1px solid"
                      borderColor="whiteAlpha.200"
                      pt={4}
                    >
                      {/* ✅ Occasion chips */}
                      <Box>
                        <FormLabel fontSize="sm">
                          Is this a special occasion? (optional)
                        </FormLabel>

                        <Wrap spacing={2}>
                          {OCCASION_OPTIONS.map((opt) => {
                            const active = occasion === opt;
                            return (
                              <WrapItem key={opt}>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={active ? "solid" : "outline"}
                                  colorScheme={active ? "brand" : "gray"}
                                  bg={active ? "brand.400" : "transparent"}
                                  borderColor="whiteAlpha.300"
                                  _hover={{
                                    bg: active
                                      ? "brand.500"
                                      : "whiteAlpha.100",
                                  }}
                                  rounded="full"
                                  onClick={() => setOccasion(active ? "" : opt)}
                                >
                                  {opt}
                                </Button>
                              </WrapItem>
                            );
                          })}
                        </Wrap>
                      </Box>

                      {/* ✅ Dietary chips (like your screenshot) */}
                      <Box>
                        <FormLabel fontSize="sm">
                          Allergies / dietary preferences (optional)
                        </FormLabel>

                        <Wrap spacing={2}>
                          {DIETARY_OPTIONS.map((opt) => {
                            const active = dietary.includes(opt);
                            return (
                              <WrapItem key={opt}>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  borderColor="whiteAlpha.300"
                                  bg={active ? "whiteAlpha.200" : "transparent"}
                                  color="white"
                                  _hover={{ bg: "whiteAlpha.150" }}
                                  rounded="full"
                                  onClick={() => {
                                    setDietary((prev) => {
                                      if (prev.includes(opt)) {
                                        return prev.filter((x) => x !== opt);
                                      }
                                      return [...prev, opt];
                                    });
                                  }}
                                >
                                  {opt}
                                </Button>
                              </WrapItem>
                            );
                          })}
                        </Wrap>

                        <Input
                          mt={3}
                          placeholder="Other allergy/diet notes (e.g. 'no onions', 'low salt')"
                          value={otherDietary}
                          onChange={(e) => setOtherDietary(e.target.value)}
                          bg="blackAlpha.700"
                          borderColor="whiteAlpha.400"
                          color="white"
                          rounded="lg"
                        />

                        <Textarea
                          mt={3}
                          placeholder="Health notes related to food (optional)"
                          value={healthNotes}
                          onChange={(e) => setHealthNotes(e.target.value)}
                          bg="blackAlpha.700"
                          borderColor="whiteAlpha.400"
                          rows={3}
                          color="white"
                          rounded="lg"
                        />
                      </Box>
                    </Stack>
                  </Collapse>
                </Box>

                {/* Notes */}
                <FormControl>
                  <FormLabel fontSize="sm">
                    Any further info or special requests?
                  </FormLabel>
                  <Textarea
                    placeholder="Service preferences, surprises, accessibility needs…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    bg="blackAlpha.700"
                    borderColor="whiteAlpha.400"
                    color="white"
                    rounded="lg"
                  />
                </FormControl>

                {/* Submit */}
                {!user?.uid ? (
                  <Button
                    colorScheme="brand"
                    type="button"
                    onClick={loginModal.onOpen}
                    rounded="xl"
                    h="48px"
                  >
                    Sign in to book
                  </Button>
                ) : (
                  <Button
                    colorScheme="brand"
                    type="submit"
                    alignSelf="flex-start"
                    isLoading={isSubmitting}
                    rounded="xl"
                    h="48px"
                    px={8}
                  >
                    Submit booking request
                  </Button>
                )}

                {/* tiny hint */}
                <Text fontSize="xs" color="whiteAlpha.700">
                  By submitting, you’ll confirm the booking rules in the next
                  step.
                </Text>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Box>
      {/* Panorama full screen */}
      <Modal isOpen={viewModal.isOpen} onClose={viewModal.onClose} size="full">
        <ModalOverlay />
        <ModalContent bg="blackAlpha.900">
          <ModalCloseButton />
          <ModalBody p={0}>
            {/* Premium full-screen */}
            {selectedTable &&
              restaurant?.plan === "premium" &&
              selectedTable.view360Url && (
                <PanoramaView src={selectedTable.view360Url} height="100vh" />
              )}

            {/* Seed full-screen */}
            {selectedTable && isSeed && tableImages[selectedTable.id] && (
              <PanoramaView src={tableImages[selectedTable.id]} height="100vh" />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Login modal */}
      <Modal
        isOpen={loginModal.isOpen}
        onClose={loginModal.onClose}
        isCentered
        size="md"
      >
        <ModalOverlay />
        <ModalContent
          bg="neutral.400"
          border="1px solid"
          borderColor="whiteAlpha.200"
        >
          <ModalCloseButton />
          <ModalBody p={6}>
            <Heading size="md" mb={2}>
              Sign in required
            </Heading>
            <Text color="neutral.200" mb={5}>
              Please sign in to make a reservation.
            </Text>
            <Button
              colorScheme="brand"
              w="100%"
              onClick={() => {
                loginModal.onClose();
                navigate("/login");
              }}
              rounded="xl"
              h="48px"
            >
              Open sign in
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* ✅ Rules modal (opens before final booking submit) */}
      <Modal
        isOpen={rulesModal.isOpen}
        onClose={rulesModal.onClose}
        isCentered
        size="lg"
      >
        <ModalOverlay />
        <ModalContent
          bg="neutral.900"
          border="1px solid"
          borderColor="whiteAlpha.200"
          rounded="2xl"
        >
          <ModalHeader color="white">Before you confirm</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <Stack spacing={3}>
              <Text color="whiteAlpha.800">
                Please review these booking rules:
              </Text>

              <Box
                bg="blackAlpha.600"
                border="1px solid"
                borderColor="whiteAlpha.200"
                rounded="xl"
                p={4}
              >
                <Stack spacing={2}>
                  <Text color="whiteAlpha.900" fontWeight="semibold">
                    General rules
                  </Text>
                  <Text color="whiteAlpha.700" fontSize="sm">
                    • Arrive on time (we may hold the table for a limited time).
                  </Text>
                  <Text color="whiteAlpha.700" fontSize="sm">
                    • Guest count should match your booking as much as possible.
                  </Text>
                  <Text color="whiteAlpha.700" fontSize="sm">
                    • Special requests aren’t guaranteed (but we’ll try).
                  </Text>

                  <Divider borderColor="whiteAlpha.200" />

                  <Text color="whiteAlpha.900" fontWeight="semibold">
                    Cancellation / no-show
                  </Text>
                  <Text color="whiteAlpha.700" fontSize="sm">
                    • If you can’t attend, please cancel early.
                  </Text>
                  <Text color="whiteAlpha.700" fontSize="sm">
                    • Repeated no-shows may result in temporary booking limits.
                  </Text>
                  <Text color="whiteAlpha.700" fontSize="sm">
                    • Some restaurants may apply a no-show policy later (if you
                    add payments in the future).
                  </Text>
                </Stack>
              </Box>

              <Checkbox
                colorScheme="brand"
                isChecked={agreedToRules}
                onChange={(e) => setAgreedToRules(e.target.checked)}
              >
                <Text color="whiteAlpha.900">
                  I agree to the booking rules.
                </Text>
              </Checkbox>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <HStack>
              <Button
                variant="outline"
                borderColor="whiteAlpha.300"
                onClick={rulesModal.onClose}
              >
                Go back
              </Button>
              <Button
                colorScheme="brand"
                isDisabled={!agreedToRules}
                isLoading={isSubmitting}
                onClick={async () => {
                  // run the same “taken table” check and submit
                  if (!validate()) {
                    rulesModal.onClose();
                    return;
                  }

                  rulesModal.onClose();

                  if (isTableTaken(selectedTable.id)) {
                    setPendingTablePick(selectedTable);
                    setWaitlistPhone("");
                    waitlistTakenModal.onOpen();
                    return;
                  }

                  setIsSubmitting(true);
                  try {
                    await createReservation({
                      status: "pending",
                      phoneOverride: null,
                    });

                    setNotes("");
                    setShowExtraDetails(false);
                    setOccasion("");
                    setDietary([]);
                    setOtherDietary("");
                    setHealthNotes("");
                    setStayDuration("");
                    setAgreedToRules(false);
                  } catch (err) {
                    console.error("Error saving reservation:", err);
                    toast({
                      title: "Could not submit booking.",
                      description: "Please try again in a moment.",
                      status: "error",
                      duration: 4500,
                      isClosable: true,
                    });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                Confirm & submit
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Pending modal */}
      <Modal
        isOpen={pendingModal.isOpen}
        onClose={pendingModal.onClose}
        isCentered
        size="lg"
      >
        <ModalOverlay />
        <ModalContent
          bg="neutral.400"
          border="1px solid"
          borderColor="whiteAlpha.200"
        >
          <ModalCloseButton />
          <ModalBody p={6}>
            <Heading size="md" mb={2}>
              Waiting for confirmation
            </Heading>

            <HStack justify="space-between" mb={3}>
              <Tag
                colorScheme={
                  pendingStatus === "approved"
                    ? "green"
                    : pendingStatus === "rejected"
                    ? "red"
                    : pendingStatus === "expired"
                    ? "gray"
                    : pendingStatus === "waitlist_offer"
                    ? "purple"
                    : pendingStatus === "waitlist_requested"
                    ? "purple"
                    : "yellow"
                }
              >
                {pendingStatus}
              </Tag>

              {(pendingStatus === "pending" ||
                pendingStatus === "waitlist_requested") && (
                <Text fontSize="sm" color="neutral.200">
                  ⏰ {Math.floor(secondsLeft / 60)}:
                  {String(secondsLeft % 60).padStart(2, "0")}
                </Text>
              )}
            </HStack>

            <Text color="neutral.200" mb={4}>
              Your request is being reviewed by the restaurant. This will update
              automatically.
            </Text>

            <Divider borderColor="whiteAlpha.300" my={4} />

            <HStack justify="flex-end">
              <Button
                variant="outline"
                borderColor="whiteAlpha.400"
                onClick={pendingModal.onClose}
              >
                Close
              </Button>
              <Button colorScheme="brand" onClick={() => navigate("/profile")}>
                Go to profile
              </Button>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Timer modal (2 minutes) */}
      <Modal
        isOpen={timerModal.isOpen}
        onClose={timerModal.onClose}
        isCentered
        size="lg"
      >
        <ModalOverlay />
        <ModalContent
          bg="blackAlpha.900"
          border="1px solid"
          borderColor="whiteAlpha.200"
          rounded="2xl"
        >
          <ModalCloseButton />
          <ModalBody py={8} display="flex" flexDir="column" alignItems="center">
            <SebTimer
              totalSeconds={120}
              size={300}
              title="Request Sent"
              subtitle="Waiting for restaurant response"
              autoStart
              onExpire={async () => {
                try {
                  if (submittedReservationId) {
                    await update(ref(db, `reservations/${submittedReservationId}`), {
                      status: "expired",
                      expiredAt: Date.now(),
                    });
                  }
                } finally {
                  timerModal.onClose();
                  pendingModal.onClose();
                  setSubmittedReservationId(null);
                }
              }}
            />

            <HStack mt={5}>
              <Button
                variant="outline"
                borderColor="whiteAlpha.300"
                onClick={timerModal.onClose}
              >
                Close
              </Button>
              <Button colorScheme="red" onClick={cancelRequest}>
                Cancel request
              </Button>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Waitlist modal (ONLY when table taken) */}
      <Modal
        isOpen={waitlistTakenModal.isOpen}
        onClose={waitlistTakenModal.onClose}
        isCentered
      >
        <ModalOverlay />
        <ModalContent
          bg="neutral.900"
          border="1px solid"
          borderColor="whiteAlpha.200"
        >
          <ModalHeader color="white">Table is currently occupied</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <Text color="whiteAlpha.700" mb={3}>
              That table is already booked for this date/time. Want to join the
              waiting list?
            </Text>

            <FormControl>
              <FormLabel color="whiteAlpha.800" fontSize="sm">
                Phone number (for WhatsApp later)
              </FormLabel>
              <Input
                value={waitlistPhone}
                onChange={(e) => setWaitlistPhone(e.target.value)}
                placeholder="+973 3XXXXXXX"
                bg="blackAlpha.600"
                borderColor="whiteAlpha.300"
                color="white"
              />
              <Text fontSize="xs" color="whiteAlpha.600" mt={2}>
                (Demo) Later you can connect real WhatsApp/email.
              </Text>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <HStack>
              <Button
                variant="outline"
                borderColor="whiteAlpha.300"
                onClick={waitlistTakenModal.onClose}
              >
                Pick another table
              </Button>

              <Button
                colorScheme="purple"
                isLoading={isSubmitting}
                onClick={async () => {
                  if (!pendingTablePick) return;
                  setSelectedTable(pendingTablePick);
                  waitlistTakenModal.onClose();

                  try {
                    setIsSubmitting(true);
                    await createReservation({
                      status: "waitlist_requested",
                      phoneOverride: waitlistPhone.trim() || null,
                    });
                  } finally {
                    setIsSubmitting(false);
                    setWaitlistPhone("");
                  }
                }}
              >
                Join waiting list
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Waitlist prompt modal (ADMIN offered waitlist while pending) */}
      <Modal
        isOpen={waitlistPromptModal.isOpen}
        onClose={() => {}}
        isCentered
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent
          bg="neutral.900"
          border="1px solid"
          borderColor="whiteAlpha.200"
        >
          <ModalHeader color="white">Join the waiting list?</ModalHeader>
          <ModalCloseButton display="none" />
          <ModalBody>
            <Text color="whiteAlpha.700" mb={3}>
              The restaurant offered a waiting list spot. Add your WhatsApp
              number to join or cancel.
            </Text>

            <FormControl>
              <FormLabel color="whiteAlpha.800" fontSize="sm">
                WhatsApp number
              </FormLabel>
              <Input
                value={waitlistPhone}
                onChange={(e) => setWaitlistPhone(e.target.value)}
                placeholder="+973 3XXXXXXX"
                bg="blackAlpha.600"
                borderColor="whiteAlpha.300"
                color="white"
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <HStack>
              <Button
                variant="outline"
                borderColor="whiteAlpha.300"
                onClick={declineWaitlistOffer}
                isLoading={waitlistBusy}
              >
                Cancel
              </Button>
              <Button
                colorScheme="purple"
                onClick={joinWaitlistOffer}
                isLoading={waitlistBusy}
                isDisabled={!waitlistPhone.trim()}
              >
                Join
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

/* ---------- helpers ---------- */

function prettyType(v) {
  const map = {
    casual: "Casual",
    family: "Family-friendly",
    fine: "Fine dining",
    cafe: "Cafe",
    "fast-casual": "Fast casual",
    "date-night": "Date night",
    business: "Business",
    buffet: "Buffet",
    other: "Other",
  };
  return map[v] || v;
}

function prettyAge(v) {
  const map = {
    all: "All ages",
    family: "Family-friendly",
    adults: "Adults only",
    "18+": "18+",
    "21+": "21+",
  };
  return map[v] || v;
}

function InfoBlock({ label, value }) {
  if (!value) return null;
  return (
    <Box>
      <Text fontSize="sm" color="neutral.200" mb={2}>
        {label}
      </Text>
      <Box color="neutral.50">{value}</Box>
    </Box>
  );
}

function SimpleInfoRow({ label, value }) {
  if (!value) return null;
  return (
    <HStack spacing={3} align="flex-start">
      <Text fontSize="sm" color="neutral.200" minW="120px">
        {label}
      </Text>
      <Text fontSize="sm" color="neutral.50">
        {value}
      </Text>
    </HStack>
  );
}

function FeatureChips({ features }) {
  return (
    <Wrap spacing={2}>
      {features.map((f) => (
        <WrapItem key={f}>
          <Tag bg="whiteAlpha.200" color="whiteAlpha.900">
            {f}
          </Tag>
        </WrapItem>
      ))}
    </Wrap>
  );
}

function LinksRow({ links }) {
  if (!links) return null;

  const items = [
    { key: "googleMapsUrl", label: "Open in Maps", url: links.googleMapsUrl },
    { key: "instagram", label: "Instagram", url: links.instagram },
    { key: "tiktok", label: "TikTok", url: links.tiktok },
    { key: "website", label: "Website", url: links.website },
  ].filter((x) => !!x.url);

  if (items.length === 0) return null;

  return (
    <InfoBlock
      label="Links"
      value={
        <HStack spacing={3} flexWrap="wrap">
          {items.map((x) => (
            <Button
              key={x.key}
              as={Link}
              href={x.url}
              isExternal
              size="sm"
              variant="outline"
              borderColor="whiteAlpha.300"
              _hover={{ bg: "whiteAlpha.100" }}
            >
              {x.label}
            </Button>
          ))}
        </HStack>
      }
    />
  );
}

/** Better hours spacing */
function HoursTable({ hours }) {
  const days = [
    ["mon", "Mon"],
    ["tue", "Tue"],
    ["wed", "Wed"],
    ["thu", "Thu"],
    ["fri", "Fri"],
    ["sat", "Sat"],
    ["sun", "Sun"],
  ];

  const fmt = (t) => t || "—";

  return (
    <Stack spacing={1}>
      {days.map(([key, label]) => {
        const v = hours?.[key];
        if (!v) return null;

        return (
          <Box
            key={key}
            display="grid"
            gridTemplateColumns="70px 1fr"
            gap="12px"
            alignItems="center"
          >
            <Text fontSize="sm" color="whiteAlpha.800">
              {label}
            </Text>
            <Text fontSize="sm" color="whiteAlpha.900">
              {v.closed ? "Closed" : `${fmt(v.open)} – ${fmt(v.close)}`}
            </Text>
          </Box>
        );
      })}
    </Stack>
  );
}

/* ---------- Social row under the image ---------- */
function SocialRow({ links }) {
  const items = [
    { label: "Instagram", url: links?.instagram, icon: <FaInstagram /> },
    { label: "TikTok", url: links?.tiktok, icon: <FaTiktok /> },
    { label: "Website", url: links?.website, icon: <FaGlobe /> },
    { label: "Maps", url: links?.googleMapsUrl, icon: <FaMapMarkerAlt /> },
  ].filter((x) => !!x.url);

  if (items.length === 0) return null;

  return (
    <HStack spacing={2} flexWrap="wrap">
      {items.map((x) => (
        <Button
          key={x.label}
          as={Link}
          href={x.url}
          isExternal
          leftIcon={x.icon}
          size="sm"
          variant="outline"
          borderColor="whiteAlpha.300"
          bg="blackAlpha.600"
          _hover={{ bg: "whiteAlpha.100" }}
          rounded="full"
        >
          {x.label}
        </Button>
      ))}
    </HStack>
  );
}

/* ---------- Slideshow / carousel (more reliable + avoids weird overlay bugs) ---------- */
function ImageCarousel({ images, alt }) {
  const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
  }, [safeImages.length]);

  if (safeImages.length === 0) {
    return (
      <Box
        w="100%"
        h={{ base: "220px", md: "320px" }}
        bg="blackAlpha.600"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="whiteAlpha.700">No photos yet</Text>
      </Box>
    );
  }

  const goPrev = () => setIdx((p) => (p - 1 + safeImages.length) % safeImages.length);
  const goNext = () => setIdx((p) => (p + 1) % safeImages.length);

  return (
    <Box position="relative">
      <Image
        src={safeImages[idx]}
        alt={alt}
        w="100%"
        h={{ base: "220px", md: "320px" }}
        objectFit="cover"
        // ✅ helps avoid “pixelated” look from accidental stretching
        // (Real fix is using higher-res uploads/URLs, but this avoids bad resizing)
        loading="lazy"
        fallback={<Box w="100%" h={{ base: "220px", md: "320px" }} bg="blackAlpha.600" />}
      />

      {safeImages.length > 1 && (
        <>
          <IconButton
            aria-label="Previous image"
            icon={<FaChevronLeft />}
            position="absolute"
            left="10px"
            top="50%"
            transform="translateY(-50%)"
            onClick={goPrev}
            bg="blackAlpha.600"
            _hover={{ bg: "blackAlpha.800" }}
            color="white"
            rounded="full"
          />
          <IconButton
            aria-label="Next image"
            icon={<FaChevronRight />}
            position="absolute"
            right="10px"
            top="50%"
            transform="translateY(-50%)"
            onClick={goNext}
            bg="blackAlpha.600"
            _hover={{ bg: "blackAlpha.800" }}
            color="white"
            rounded="full"
          />
        </>
      )}

      {/* little dots */}
      {safeImages.length > 1 && (
        <HStack
          position="absolute"
          bottom="10px"
          left="50%"
          transform="translateX(-50%)"
          spacing={2}
          bg="blackAlpha.500"
          px={3}
          py={2}
          rounded="full"
        >
          {safeImages.map((_, i) => (
            <Box
              key={i}
              w="8px"
              h="8px"
              rounded="full"
              bg={i === idx ? "whiteAlpha.900" : "whiteAlpha.500"}
              cursor="pointer"
              onClick={() => setIdx(i)}
            />
          ))}
        </HStack>
      )}
    </Box>
  );
}

/* ---------------- Customer layout renderer (ABSOLUTE positioning) ---------------- */

function LegendDot({ label, bg }) {
  return (
    <HStack spacing={2}>
      <Box
        w="10px"
        h="10px"
        rounded="full"
        bg={bg}
        border="1px solid"
        borderColor="whiteAlpha.600"
      />
      <Text fontSize="xs" color="whiteAlpha.900">
        {label}
      </Text>
    </HStack>
  );
}

function CustomerLiveLayout({
  tables,
  date,
  selectedSlot,
  isTableTaken,
  selectedId,
  onPick,
  canShow360,
  onOpen360,
}) {
  const stageRef = useRef(null);
  const [stageW, setStageW] = useState(900);

  // We treat admin layout as a "design canvas" and scale to fit.
  const DESIGN_W = 900;
  const stageH = 520;

  useEffect(() => {
    if (!stageRef.current) return;

    const el = stageRef.current;
    const ro = new ResizeObserver(() => {
      setStageW(el.clientWidth || 900);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = stageW / DESIGN_W;

  return (
    <Box
      ref={stageRef}
      w="100%"
      overflowX="auto"
      overflowY="auto"
      border="1px dashed"
      borderColor="whiteAlpha.200"
      rounded="lg"
      bg="blackAlpha.500"
      p={2}
    >
      <Box position="relative" w={`${Math.max(stageW, DESIGN_W)}px`} h={`${stageH}px`} pb="40px">
        <HStack
          position="absolute"
          top="10px"
          left="10px"
          spacing={3}
          zIndex={5}
          bg="blackAlpha.700"
          px={3}
          py={2}
          rounded="md"
          border="1px solid"
          borderColor="whiteAlpha.300"
        >
          <LegendDot label="Available" bg="teal.700" />
          <LegendDot label="Selected" bg="brand.400" />
          <LegendDot label="Occupied" bg="orange.400" />
          <LegendDot label="Unavailable" bg="gray.600" />
        </HStack>

        {tables.map((t) => {
          const taken = selectedSlot?.id && date ? isTableTaken(t.id) : false;
          const selected = selectedId === t.id;
          const blocked = !!t.unavailable;
          const isPoi = t.type && t.type !== "table";

          const left = (t.x ?? 20) * scale;
          const top = (t.y ?? 20) * scale;

          const isUnitish = (t.w ?? 0) <= 12 && (t.h ?? 0) <= 12;

          const baseW = isUnitish ? (t.shape === "rect" ? 110 : 64) : t.w;
          const baseH = isUnitish ? (t.shape === "rect" ? 44 : 64) : t.h;

          const w = (baseW ?? 64) * scale;
          const h = (baseH ?? 64) * scale;

          const bg = isPoi
            ? "whiteAlpha.200"
            : blocked
            ? "gray.600"
            : taken
            ? "orange.400"
            : selected
            ? "brand.400"
            : "teal.700";

          return (
            <Box
              key={t.id}
              position="absolute"
              left={`${left}px`}
              top={`${top}px`}
              w={`${w}px`}
              h={`${h}px`}
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor={isPoi ? "default" : "pointer"}
              onClick={() => {
                if (!isPoi) onPick(t);
              }}
              bg={bg}
              border="2px solid"
              borderColor={selected ? "whiteAlpha.900" : "whiteAlpha.500"}
              rounded={isPoi ? "md" : t.shape === "round" ? "full" : "md"}
              opacity={blocked ? 0.55 : 1}
              _hover={{ filter: isPoi ? "none" : "brightness(1.05)" }}
              userSelect="none"
            >
              <Box textAlign="center" px={2}>
                <Text fontSize="xs" fontWeight="bold" lineHeight="1.1">
                  {t.label || t.id}
                </Text>

                {!isPoi && (
                  <Text fontSize="10px" color="whiteAlpha.800" lineHeight="1.1">
                    {t.capacity || 0} seats
                  </Text>
                )}

                {!!t.area && (
                  <Text fontSize="10px" color="whiteAlpha.800" lineHeight="1.1">
                    {t.area}
                  </Text>
                )}

                {canShow360 && !isPoi && !!t.view360Url && (
                  <Text
                    mt={1}
                    fontSize="10px"
                    color="whiteAlpha.900"
                    textDecor="underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpen360?.(t);
                    }}
                  >
                    360°
                  </Text>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

/**
 * PanoramaView (unchanged)
 */
function PanoramaView({ src, height = 260, onClick }) {
  const [offsetX, setOffsetX] = useState(0);
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);

  const getHeightValue = () => {
    if (typeof height === "number") return `${height}px`;
    if (typeof height === "object") return undefined;
    return height;
  };

  const handleDown = (clientX) => {
    draggingRef.current = true;
    lastXRef.current = clientX;
  };

  const handleMove = (clientX) => {
    if (!draggingRef.current) return;
    const delta = clientX - lastXRef.current;
    lastXRef.current = clientX;
    setOffsetX((prev) => prev + delta);
  };

  const handleUp = () => {
    draggingRef.current = false;
  };

  return (
    <Box
      h={typeof height === "object" ? height : undefined}
      style={{
        height: getHeightValue(),
        cursor: "grab",
        userSelect: "none",
        touchAction: "none",
      }}
      bgImage={`url(${src})`}
      bgRepeat="repeat-x"
      bgSize="auto 100%"
      bgPosition={`${offsetX}px center`}
      onMouseDown={(e) => {
        e.preventDefault();
        handleDown(e.clientX);
      }}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleUp}
      onMouseLeave={handleUp}
      onTouchStart={(e) => e.touches[0] && handleDown(e.touches[0].clientX)}
      onTouchMove={(e) => e.touches[0] && handleMove(e.touches[0].clientX)}
      onTouchEnd={handleUp}
      onClick={onClick}
    />
  );
}
