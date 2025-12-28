import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stack,
  Tag,
  IconButton,
  HStack,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { FaHeart } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";

// ✅ Dummy restaurants (your old seeded data)
import { restaurants as dummyRestaurants } from "../data/restaurants";

// ✅ Firebase
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";

function RestaurantCard({ restaurant }) {
  const [index, setIndex] = useState(0);
  const [isFav, setIsFav] = useState(false);

  const images = restaurant.images || [];
  const hasMultiple = images.length > 1;

  const goPrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasMultiple) return;
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasMultiple) return;
    setIndex((prev) => (prev + 1) % images.length);
  };

  const toggleFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFav((prev) => !prev);
  };

  const topFeatures = Array.isArray(restaurant.features)
    ? restaurant.features.slice(0, 3)
    : [];

  return (
    <Box
      as={RouterLink}
      to={`/restaurants/${restaurant.id}`}
      bg="neutral.400"
      border="1px solid"
      borderColor="whiteAlpha.200"
      rounded="xl"
      overflow="hidden"
      p={4}
      position="relative"
      _hover={{ transform: "translateY(-4px)", boxShadow: "lg" }}
      transition="all 0.2s ease-out"
    >
      {/* Image slider */}
      <Box mb={4} position="relative">
        {images.length > 0 ? (
          <Box
            as="img"
            src={images[index]}
            alt={restaurant.name}
            h="180px"
            w="100%"
            objectFit="cover"
            rounded="lg"
          />
        ) : (
          <Box
            h="180px"
            w="100%"
            rounded="lg"
            bg="whiteAlpha.100"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="whiteAlpha.700"
            fontSize="sm"
          >
            No photos yet
          </Box>
        )}

        {/* ❤️ Favorite button */}
        <IconButton
          aria-label="Favorite restaurant"
          icon={<FaHeart />}
          size="sm"
          position="absolute"
          top="8px"
          right="8px"
          zIndex={2}
          onClick={toggleFav}
          bg={isFav ? "red.500" : "blackAlpha.600"}
          color="white"
          _hover={{ bg: isFav ? "red.400" : "blackAlpha.700" }}
        />

        {hasMultiple && (
          <>
            <IconButton
              aria-label="Previous image"
              icon={<ChevronLeftIcon />}
              size="sm"
              variant="ghost"
              position="absolute"
              top="50%"
              left="8px"
              transform="translateY(-50%)"
              bg="blackAlpha.500"
              _hover={{ bg: "blackAlpha.700" }}
              onClick={goPrev}
            />

            <IconButton
              aria-label="Next image"
              icon={<ChevronRightIcon />}
              size="sm"
              variant="ghost"
              position="absolute"
              top="50%"
              right="8px"
              transform="translateY(-50%)"
              bg="blackAlpha.500"
              _hover={{ bg: "blackAlpha.700" }}
              onClick={goNext}
            />

            <HStack
              spacing={1}
              position="absolute"
              bottom="8px"
              left="50%"
              transform="translateX(-50%)"
            >
              {images.map((_, i) => (
                <Box
                  key={i}
                  w={2}
                  h={2}
                  rounded="full"
                  bg={i === index ? "brand.400" : "whiteAlpha.500"}
                />
              ))}
            </HStack>
          </>
        )}
      </Box>

      {/* Text content */}
      <Stack spacing={2}>
        <HStack justify="space-between" align="start">
          <Heading size="md">{restaurant.name}</Heading>
          {restaurant.plan === "premium" && (
            <Tag bg="purple.700" color="white" size="sm">
              Premium
            </Tag>
          )}
        </HStack>

        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Tag bg="blackAlpha.600" color="neutral.200">
            {restaurant.cuisine}
          </Tag>

          {/* price range (new) OR seed price */}
          {(restaurant.priceRange || restaurant.price) && (
            <Tag bg="blackAlpha.600" color="neutral.200">
              {restaurant.priceRange || restaurant.price}
            </Tag>
          )}

          {/* restaurant type */}
          {restaurant.restaurantType && (
            <Tag bg="blackAlpha.600" color="neutral.200">
              {prettyType(restaurant.restaurantType)}
            </Tag>
          )}

          {/* status badge for firebase restaurants */}
          {restaurant.source === "firebase" && (
            <Tag bg="whiteAlpha.200" color="whiteAlpha.900">
              Verified
            </Tag>
          )}
        </Stack>

        {/* top features */}
        {topFeatures.length > 0 && (
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {topFeatures.map((f) => (
              <Tag key={f} bg="whiteAlpha.200" color="whiteAlpha.900">
                {f}
              </Tag>
            ))}
          </Stack>
        )}

        <Text fontSize="sm" color="neutral.200">
          Tap to view details and booking options.
        </Text>
      </Stack>
    </Box>
  );
}

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

export default function Reservations() {
  const [firebaseRestaurants, setFirebaseRestaurants] = useState([]);
  const [loadingFirebase, setLoadingFirebase] = useState(true);

  useEffect(() => {
    const rRef = ref(db, "restaurants");
    const unsub = onValue(
      rRef,
      (snap) => {
        const data = snap.val() || {};

        // ✅ only show active restaurants to customers
        const list = Object.entries(data)
          .map(([ownerUid, r]) => ({
            id: ownerUid, // IMPORTANT: route id becomes ownerUid for firebase restaurants
            name: r?.name || "Unnamed restaurant",
            cuisine: r?.cuisine || "Cuisine",

            // images compatibility:
            images: r?.photos || r?.images || [],

            menuUrl: r?.menuUrl || null,
            status: r?.status || "unknown",
            source: "firebase",

            // NEW fields
            plan: r?.plan || "basic",
            priceRange: r?.priceRange || null,
            restaurantType: r?.restaurantType || null,
            agePreference: r?.agePreference || null,
            features: Array.isArray(r?.features) ? r.features : [],
          }))
          .filter((r) => r.status === "active");

        setFirebaseRestaurants(list);
        setLoadingFirebase(false);
      },
      (err) => {
        console.error("Error loading restaurants:", err);
        setFirebaseRestaurants([]);
        setLoadingFirebase(false);
      }
    );

    return () => unsub;
  }, []);

  // ✅ map dummy data so it matches the same shape the card expects
  const mappedDummy = useMemo(() => {
    return (dummyRestaurants || []).map((r) => ({
      ...r,
      id: `seed-${r.id}`, // prevent collisions with firebase ids
      source: "seed",
      images: r.images || [],
      plan: "basic",
      priceRange: r.price || null, // seed uses "price"
      restaurantType: r.restaurantType || null,
      features: Array.isArray(r.features) ? r.features : [],
    }));
  }, []);

  const combined = useMemo(() => {
    return [...mappedDummy, ...firebaseRestaurants];
  }, [mappedDummy, firebaseRestaurants]);

  return (
    <Box>
      <Heading mb={2}>Reservations</Heading>
      <Text mb={8} color="neutral.200">
        Browse our restaurants and choose where you’d like to book a table.
      </Text>

      {loadingFirebase ? (
        <Center py={10}>
          <Spinner />
        </Center>
      ) : combined.length === 0 ? (
        <Text color="neutral.200">No restaurants available yet.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {combined.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
