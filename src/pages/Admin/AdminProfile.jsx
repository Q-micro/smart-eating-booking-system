// src/pages/admin/AdminProfile.jsx
import {
  Box,
  Heading,
  Text,
  Stack,
  Avatar,
  Badge,
  Button,
  Divider,
  VStack,
  HStack,
  Icon,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  Center,
  Spinner,
  Checkbox,
  Progress,
} from "@chakra-ui/react";
import {
  FiEdit,
  FiSettings,
  FiTrash2,
  FiImage,
  FiBookOpen,
  FiSave,
  FiX,
} from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext.jsx";
import { db, storage } from "../../firebase";
import { ref, onValue, update, remove } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const DAYS = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

const defaultHours = DAYS.reduce((acc, d) => {
  acc[d.key] = { closed: false, open: "12:00", close: "23:00" };
  return acc;
}, {});

export default function AdminProfile() {
  const { user } = useAuth();
  const toast = useToast();

  // This is fallback until you add roles/staff data
  const role = user.role === "owner" ? "Restaurant Manager" : "Staff Member";

  const [restaurant, setRestaurant] = useState(null);
  const [loadingRestaurant, setLoadingRestaurant] = useState(true);

  // update fields you want only
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");

  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [website, setWebsite] = useState("");

  const [operatingHours, setOperatingHours] = useState(defaultHours);

  const [savingSettings, setSavingSettings] = useState(false);

  // menu upload (browse file/image)
  const [menuFile, setMenuFile] = useState(null);
  const [uploadingMenu, setUploadingMenu] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);

  // photos upload (browse file/image)
  const [photoFiles, setPhotoFiles] = useState([]); // File[]
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [photoUploadPct, setPhotoUploadPct] = useState(0);

  const recentActivity = useMemo(() => {
    const statusLine = restaurant?.status
      ? `Status: ${restaurant.status}`
      : "Status: -";
    const planLine = restaurant?.plan ? `Plan: ${restaurant.plan}` : "Plan: basic";
    return [
      statusLine,
      planLine,
      "Update contact + links + hours here",
      "Upload your menu so customers can view it",
    ];
  }, [restaurant]);

  useEffect(() => {
    if (!user?.uid) return;

    const rRef = ref(db, `restaurants/${user.uid}`);
    return onValue(
      rRef,
      (snap) => {
        const data = snap.val() || null;
        setRestaurant(data);
        setLoadingRestaurant(false);

        // sync editor fields
        setEditPhone(data?.phone || "");
        setEditEmail(data?.contactEmail || "");
        setEditAddress(data?.address || "");

        setGoogleMapsUrl(data?.links?.googleMapsUrl || "");
        setInstagram(data?.links?.instagram || "");
        setTiktok(data?.links?.tiktok || "");
        setWebsite(data?.links?.website || "");

        setOperatingHours(data?.operatingHours || defaultHours);
      },
      () => setLoadingRestaurant(false)
    );
  }, [user?.uid]);

  const saveRestaurantSettings = async () => {
    if (!user?.uid) return;

    if (!restaurant) {
      toast({
        title: "No restaurant yet",
        description:
          "Create your restaurant first from the restaurant application page.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSavingSettings(true);
    try {
      await update(ref(db, `restaurants/${user.uid}`), {
        phone: editPhone.trim(),
        contactEmail: editEmail.trim() || null,
        address: editAddress.trim() || null,
        links: {
          googleMapsUrl: googleMapsUrl.trim() || null,
          instagram: instagram.trim() || null,
          tiktok: tiktok.trim() || null,
          website: website.trim() || null,
        },
        operatingHours,
        updatedAt: Date.now(),
      });

      toast({
        title: "Saved ✅",
        description:
          "Updated settings. Customer side will reflect this from restaurants/{uid}.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Save failed",
        description: "Could not update settings.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const uploadMenuFile = async () => {
    if (!user?.uid) return;

    if (!restaurant) {
      toast({
        title: "No restaurant yet",
        description:
          "Create your restaurant first from the restaurant application page.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!menuFile) {
      toast({
        title: "No file selected",
        description: "Please browse and select a menu file first.",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    setUploadingMenu(true);
    setUploadPct(10);

    try {
      const path = `restaurants/${user.uid}/menu/${Date.now()}_${menuFile.name}`;
      const sRef = storageRef(storage, path);

      setUploadPct(35);
      await uploadBytes(sRef, menuFile);
      setUploadPct(75);

      const url = await getDownloadURL(sRef);
      setUploadPct(100);

      await update(ref(db, `restaurants/${user.uid}`), {
        menuUrl: url,
        updatedAt: Date.now(),
      });

      toast({
        title: "Menu uploaded ✅",
        description:
          "Saved to restaurants/{uid}/menuUrl (customer side can show it).",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setMenuFile(null);
    } catch (e) {
      console.error(e);
      toast({
        title: "Upload failed",
        description: "Could not upload menu file.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUploadingMenu(false);
      setTimeout(() => setUploadPct(0), 600);
    }
  };

  const clearMenu = async () => {
    if (!user?.uid) return;
    if (!restaurant) return;

    const ok = window.confirm(
      "Remove menu from your listing? (This clears menuUrl)"
    );
    if (!ok) return;

    try {
      await update(ref(db, `restaurants/${user.uid}`), {
        menuUrl: null,
        updatedAt: Date.now(),
      });

      toast({
        title: "Menu removed",
        description: "menuUrl cleared.",
        status: "info",
        duration: 2500,
        isClosable: true,
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Remove failed",
        description: "Could not remove menu.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const uploadPhotos = async () => {
    if (!user?.uid) return;

    if (!restaurant) {
      toast({
        title: "No restaurant yet",
        description:
          "Create your restaurant first from the restaurant application page.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!photoFiles?.length) {
      toast({
        title: "No photos selected",
        description: "Please browse and select at least 1 photo.",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    setUploadingPhotos(true);
    setPhotoUploadPct(0);

    try {
      const uploadedUrls = [];
      for (let i = 0; i < photoFiles.length; i++) {
        const f = photoFiles[i];
        const path = `restaurants/${user.uid}/photos/${Date.now()}_${i}_${f.name}`;
        const sRef = storageRef(storage, path);

        await uploadBytes(sRef, f);
        const url = await getDownloadURL(sRef);
        uploadedUrls.push(url);

        setPhotoUploadPct(Math.round(((i + 1) / photoFiles.length) * 100));
      }

      const current = Array.isArray(restaurant.photos) ? restaurant.photos : [];
      const next = [...uploadedUrls, ...current].slice(0, 12);

      await update(ref(db, `restaurants/${user.uid}`), {
        photos: next,
        updatedAt: Date.now(),
      });

      toast({
        title: "Photos uploaded ✅",
        description:
          "Saved to restaurants/{uid}/photos (customer side can show them).",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setPhotoFiles([]);
    } catch (e) {
      console.error(e);
      toast({
        title: "Upload failed",
        description: "Could not upload photos.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUploadingPhotos(false);
      setTimeout(() => setPhotoUploadPct(0), 600);
    }
  };

  const removePhotoAtIndex = async (idx) => {
    if (!user?.uid) return;
    if (!restaurant) return;

    const current = Array.isArray(restaurant.photos) ? restaurant.photos : [];
    if (idx < 0 || idx >= current.length) return;

    try {
      const next = current.filter((_, i) => i !== idx);
      await update(ref(db, `restaurants/${user.uid}`), {
        photos: next,
        updatedAt: Date.now(),
      });

      toast({
        title: "Removed",
        description: "Photo removed.",
        status: "info",
        duration: 2500,
        isClosable: true,
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Remove failed",
        description: "Could not remove photo.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const deleteRestaurantListing = async () => {
    if (!user?.uid) return;

    if (!restaurant) {
      toast({
        title: "Nothing to delete",
        description: "No restaurant listing found.",
        status: "info",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    const ok = window.confirm(
      "Delete your restaurant listing? This removes your restaurant data (demo)."
    );
    if (!ok) return;

    try {
      await remove(ref(db, `restaurants/${user.uid}`));
      toast({
        title: "Deleted ✅",
        description: "Restaurant listing removed (demo).",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Delete failed",
        description: "Could not delete restaurant listing.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loadingRestaurant) {
    return (
      <Center minH="60vh">
        <Spinner />
      </Center>
    );
  }

  return (
    <Box maxW="5xl" mx="auto">
      {/* Header */}
      <HStack spacing={6} align="flex-start">
        <Avatar
          name={user.name}
          size="xl"
          bg="brand.400"
          color="white"
          showBorder
          borderColor="brand.300"
        />

        <Stack spacing={1}>
          <Heading fontSize="2xl">{user.name}</Heading>
          <Text color="neutral.300">{user.email}</Text>

          <HStack spacing={3} flexWrap="wrap" mt={2}>
            <Badge
              colorScheme="yellow"
              borderRadius="full"
              px={3}
              py={1}
              fontSize="0.7rem"
            >
              {role}
            </Badge>

            <Badge
              colorScheme={restaurant?.status === "active" ? "green" : "blue"}
              borderRadius="full"
              px={3}
              py={1}
              fontSize="0.7rem"
            >
              {restaurant?.status || "no listing"}
            </Badge>

            <Badge
              colorScheme="purple"
              borderRadius="full"
              px={3}
              py={1}
              fontSize="0.7rem"
            >
              {restaurant?.plan || "basic"}
            </Badge>
          </HStack>
        </Stack>
      </HStack>

      <Divider my={8} borderColor="whiteAlpha.300" />

      {/* Restaurant settings + editing */}
      <Box mb={10}>
        <Heading fontSize="lg" mb={3}>
          Restaurant Settings
        </Heading>

        {!restaurant ? (
          <Box
            p={4}
            borderRadius="lg"
            bg="neutral.800"
            border="1px solid"
            borderColor="whiteAlpha.150"
          >
            <Text color="neutral.300">
              You don’t have a restaurant listing yet. Create it first from the
              restaurant application page.
            </Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {/* Contact + links + hours */}
            <Box
              p={5}
              borderRadius="2xl"
              bg="neutral.800"
              border="1px solid"
              borderColor="whiteAlpha.150"
            >
              <HStack mb={3} spacing={2}>
                <Icon as={FiSettings} />
                <Heading fontSize="md">Update Information</Heading>
              </HStack>

              <Stack spacing={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Phone</FormLabel>
                    <Input
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      bg="whiteAlpha.100"
                      borderColor="whiteAlpha.200"
                      placeholder="Phone"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      bg="whiteAlpha.100"
                      borderColor="whiteAlpha.200"
                      placeholder="Contact email"
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel>Address</FormLabel>
                  <Input
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    bg="whiteAlpha.100"
                    borderColor="whiteAlpha.200"
                    placeholder="Address"
                  />
                </FormControl>

                <Divider borderColor="whiteAlpha.200" />

                <Heading fontSize="sm">Links</Heading>

                <FormControl>
                  <FormLabel>Google Maps URL</FormLabel>
                  <Input
                    value={googleMapsUrl}
                    onChange={(e) => setGoogleMapsUrl(e.target.value)}
                    bg="whiteAlpha.100"
                    borderColor="whiteAlpha.200"
                    placeholder="https://maps.google.com/..."
                  />
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Instagram</FormLabel>
                    <Input
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      bg="whiteAlpha.100"
                      borderColor="whiteAlpha.200"
                      placeholder="https://instagram.com/..."
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>TikTok</FormLabel>
                    <Input
                      value={tiktok}
                      onChange={(e) => setTiktok(e.target.value)}
                      bg="whiteAlpha.100"
                      borderColor="whiteAlpha.200"
                      placeholder="https://tiktok.com/@..."
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Website</FormLabel>
                    <Input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      bg="whiteAlpha.100"
                      borderColor="whiteAlpha.200"
                      placeholder="https://..."
                    />
                  </FormControl>
                </SimpleGrid>

                <Divider borderColor="whiteAlpha.200" />

                <Heading fontSize="sm">Operating hours</Heading>

                <Button
                  size="sm"
                  variant="outline"
                  borderColor="whiteAlpha.300"
                  onClick={() => {
                    const template = operatingHours.mon;
                    setOperatingHours((prev) => {
                      const next = { ...prev };
                      for (const d of DAYS) next[d.key] = { ...template };
                      return next;
                    });
                  }}
                >
                  Copy Mon → All days
                </Button>

                <Stack spacing={3}>
                  {DAYS.map((d) => {
                    const v = operatingHours[d.key] || defaultHours[d.key];
                    return (
                      <Box
                        key={d.key}
                        bg="whiteAlpha.50"
                        border="1px solid"
                        borderColor="whiteAlpha.200"
                        rounded="xl"
                        p={3}
                      >
                        <HStack justify="space-between" flexWrap="wrap" gap={3}>
                          <Text fontWeight="bold">{d.label}</Text>
                          <Checkbox
                            isChecked={!!v.closed}
                            onChange={(e) =>
                              setOperatingHours((prev) => ({
                                ...prev,
                                [d.key]: {
                                  ...prev[d.key],
                                  closed: e.target.checked,
                                },
                              }))
                            }
                          >
                            Closed
                          </Checkbox>
                        </HStack>

                        {!v.closed && (
                          <SimpleGrid
                            columns={{ base: 1, md: 2 }}
                            spacing={3}
                            mt={3}
                          >
                            <FormControl>
                              <FormLabel fontSize="sm">Open</FormLabel>
                              <Input
                                type="time"
                                value={v.open}
                                onChange={(e) =>
                                  setOperatingHours((prev) => ({
                                    ...prev,
                                    [d.key]: {
                                      ...prev[d.key],
                                      open: e.target.value,
                                    },
                                  }))
                                }
                                bg="whiteAlpha.50"
                                borderColor="whiteAlpha.200"
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel fontSize="sm">Close</FormLabel>
                              <Input
                                type="time"
                                value={v.close}
                                onChange={(e) =>
                                  setOperatingHours((prev) => ({
                                    ...prev,
                                    [d.key]: {
                                      ...prev[d.key],
                                      close: e.target.value,
                                    },
                                  }))
                                }
                                bg="whiteAlpha.50"
                                borderColor="whiteAlpha.200"
                              />
                            </FormControl>
                          </SimpleGrid>
                        )}
                      </Box>
                    );
                  })}
                </Stack>

                <Button
                  leftIcon={<FiSave />}
                  colorScheme="brand"
                  borderRadius="full"
                  onClick={saveRestaurantSettings}
                  isLoading={savingSettings}
                >
                  Save settings
                </Button>
              </Stack>
            </Box>

            {/* Menu upload (browse file/image) */}
            <Box
              p={5}
              borderRadius="2xl"
              bg="neutral.800"
              border="1px solid"
              borderColor="whiteAlpha.150"
            >
              <HStack mb={3} spacing={2}>
                <Icon as={FiBookOpen} />
                <Heading fontSize="md">Menu</Heading>
              </HStack>

              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>Upload menu (PDF or image)</FormLabel>
                  <Input
                    type="file"
                    accept="application/pdf,image/*"
                    p={1}
                    onChange={(e) => setMenuFile(e.target.files?.[0] || null)}
                  />
                  {menuFile && (
                    <Text fontSize="xs" color="whiteAlpha.700" mt={1}>
                      Selected: {menuFile.name}
                    </Text>
                  )}
                </FormControl>

                {uploadingMenu && (
                  <Box>
                    <Text fontSize="sm" color="whiteAlpha.700" mb={2}>
                      Uploading…
                    </Text>
                    <Progress value={uploadPct} borderRadius="full" />
                  </Box>
                )}

                <HStack flexWrap="wrap" gap={3}>
                  <Button
                    leftIcon={<FiImage />}
                    colorScheme="brand"
                    borderRadius="full"
                    onClick={uploadMenuFile}
                    isLoading={uploadingMenu}
                  >
                    Upload menu
                  </Button>

                  <Button
                    leftIcon={<FiX />}
                    variant="outline"
                    borderColor="whiteAlpha.300"
                    borderRadius="full"
                    onClick={clearMenu}
                    isDisabled={!restaurant?.menuUrl}
                  >
                    Remove menu
                  </Button>
                </HStack>

                <Text fontSize="sm" color="whiteAlpha.700">
                  Current menu:
                </Text>

                {restaurant?.menuUrl ? (
                  <Text fontSize="xs" color="whiteAlpha.700" noOfLines={2}>
                    {restaurant.menuUrl}
                  </Text>
                ) : (
                  <Text fontSize="sm" color="whiteAlpha.600">
                    No menu uploaded yet.
                  </Text>
                )}
              </Stack>
            </Box>

            {/* Photos manager (browse file/image) */}
            <Box
              p={5}
              borderRadius="2xl"
              bg="neutral.800"
              border="1px solid"
              borderColor="whiteAlpha.150"
            >
              <HStack mb={3} spacing={2}>
                <Icon as={FiImage} />
                <Heading fontSize="md">Photos</Heading>
              </HStack>

              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>Upload photos (images)</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    p={1}
                    onChange={(e) =>
                      setPhotoFiles(Array.from(e.target.files || []))
                    }
                  />
                  {photoFiles?.length > 0 && (
                    <Text fontSize="xs" color="whiteAlpha.700" mt={1}>
                      Selected: {photoFiles.length} photo(s)
                    </Text>
                  )}
                </FormControl>

                {uploadingPhotos && (
                  <Box>
                    <Text fontSize="sm" color="whiteAlpha.700" mb={2}>
                      Uploading…
                    </Text>
                    <Progress value={photoUploadPct} borderRadius="full" />
                  </Box>
                )}

                <Button
                  leftIcon={<FiImage />}
                  colorScheme="brand"
                  borderRadius="full"
                  onClick={uploadPhotos}
                  isLoading={uploadingPhotos}
                >
                  Upload photos
                </Button>

                <Divider borderColor="whiteAlpha.200" />

                <VStack align="stretch" spacing={2}>
                  {(Array.isArray(restaurant.photos) ? restaurant.photos : [])
                    .slice(0, 12)
                    .map((url, idx) => (
                      <HStack
                        key={`${url}-${idx}`}
                        justify="space-between"
                        p={3}
                        borderRadius="md"
                        bg="whiteAlpha.50"
                        border="1px solid"
                        borderColor="whiteAlpha.100"
                      >
                        <Text fontSize="sm" noOfLines={1} maxW="75%">
                          {url}
                        </Text>
                        <Button
                          size="sm"
                          leftIcon={<FiX />}
                          variant="outline"
                          borderColor="whiteAlpha.300"
                          onClick={() => removePhotoAtIndex(idx)}
                        >
                          Remove
                        </Button>
                      </HStack>
                    ))}

                  {(!Array.isArray(restaurant.photos) ||
                    restaurant.photos.length === 0) && (
                    <Text fontSize="sm" color="whiteAlpha.600">
                      No photos added yet.
                    </Text>
                  )}
                </VStack>
              </Stack>
            </Box>

            {/* Danger zone */}
            <Box
              p={5}
              borderRadius="2xl"
              bg="rgba(255,0,0,0.06)"
              border="1px solid"
              borderColor="rgba(255,0,0,0.25)"
            >
              <HStack mb={3} spacing={2}>
                <Icon as={FiTrash2} />
                <Heading fontSize="md">Danger zone</Heading>
              </HStack>

              <Button
                leftIcon={<FiTrash2 />}
                colorScheme="red"
                variant="solid"
                borderRadius="full"
                onClick={deleteRestaurantListing}
              >
                Delete restaurant listing
              </Button>
            </Box>
          </SimpleGrid>
        )}
      </Box>

      {/* Activity log (relevant) */}
      <Box mb={10}>
        <Heading fontSize="lg" mb={3}>
          Recent Activity
        </Heading>

        <VStack align="stretch" spacing={3}>
          {recentActivity.map((item, i) => (
            <HStack
              key={i}
              p={3}
              borderRadius="md"
              bg="neutral.800"
              border="1px solid"
              borderColor="whiteAlpha.100"
              justify="space-between"
            >
              <HStack spacing={3}>
                <Icon as={FiEdit} opacity={0.7} />
                <Text fontSize="sm">{item}</Text>
              </HStack>
              <Text fontSize="xs" color="neutral.400">
                {i === 0 ? "Just now" : `${i} days ago`}
              </Text>
            </HStack>
          ))}
        </VStack>
      </Box>
    </Box>
  );
}
