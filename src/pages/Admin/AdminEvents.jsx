// src/pages/admin/AdminEvents.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Stack,
  HStack,
  SimpleGrid,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Input,
  Textarea,
  Switch,
  FormControl,
  FormLabel,
  Divider,
  Image,
  Badge,
  AspectRatio,
  useDisclosure,
  useToast,
  Select,
  Spinner,
} from "@chakra-ui/react";
import { AiFillStar } from "react-icons/ai";
import { useAuth } from "../../auth/AuthContext.jsx";
import { db } from "../../firebase";
import { onValue, push, ref, remove, set, update } from "firebase/database";

// ✅ Firebase Storage (for browse/upload)
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "firebase/storage";

// ------- calendar helpers -------
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysForMonth(currentMonth) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }
  return days;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toISODate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-GB");
}

function isEmbedUrl(url) {
  if (!url) return false;
  const u = url.toLowerCase();
  return u.includes("youtube.com/embed") || u.includes("player.vimeo.com") || u.includes("youtube-nocookie.com/embed");
}

function isVideoFileUrl(url) {
  if (!url) return false;
  const u = url.toLowerCase().split("?")[0];
  return u.endsWith(".mp4") || u.endsWith(".webm") || u.endsWith(".mov") || u.endsWith(".m4v") || u.endsWith(".ogg");
}

const emptyForm = {
  title: "",
  description: "",
  date: "",
  time: "19:00",
  priceLabel: "",
  reservationOnly: false,
  ticketUrl: "",
  imageUrl: "",
  videoUrl: "", // can be embed url OR direct storage video url
};

export default function AdminEvents() {
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const cardBg = useColorModeValue("gray.900", "gray.900");
  const cardBorder = useColorModeValue("gray.700", "gray.700");
  const mutedText = useColorModeValue("gray.400", "gray.400");

  const [eventsMap, setEventsMap] = useState({});
  const [currentMonth, setCurrentMonth] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const [mode, setMode] = useState("create"); // create | edit
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // load admin events
  useEffect(() => {
    if (!user?.uid) return;
    const eRef = ref(db, `events/${user.uid}`);
    return onValue(eRef, (snap) => {
      setEventsMap(snap.val() || {});
    });
  }, [user?.uid]);

  const eventsList = useMemo(() => {
    const list = Object.entries(eventsMap || {}).map(([id, data]) => ({
      id,
      ...data,
    }));
    list.sort((a, b) => new Date(a.date) - new Date(b.date));
    return list;
  }, [eventsMap]);

  const days = getDaysForMonth(currentMonth);

  const eventsForSelectedDate = useMemo(() => {
    const iso = toISODate(selectedDate);
    return eventsList.filter((e) => e.date === iso);
  }, [eventsList, selectedDate]);

  function hasEventsOnDate(date) {
    const iso = toISODate(date);
    return eventsList.some((e) => e.date === iso);
  }

  const openCreate = () => {
    setMode("create");
    setEditingId(null);
    setForm({ ...emptyForm, date: toISODate(selectedDate) });
    onOpen();
  };

  const openEdit = (event) => {
    setMode("edit");
    setEditingId(event.id);
    setForm({
      title: event.title || "",
      description: event.description || "",
      date: event.date || "",
      time: event.time || "19:00",
      priceLabel: event.priceLabel || "",
      reservationOnly: !!event.reservationOnly,
      ticketUrl: event.ticketUrl || "",
      imageUrl: event.imageUrl || "",
      videoUrl: event.videoUrl || "",
    });
    onOpen();
  };

  const closeModal = () => {
    onClose();
    setSaving(false);
    setUploadingImage(false);
    setUploadingVideo(false);
  };

  const validate = () => {
    if (!form.title.trim()) return "Title is required.";
    if (!form.date) return "Date is required.";
    if (!form.time) return "Time is required.";
    return null;
  };

  // ✅ Upload helpers (Storage)
  const uploadFileToStorage = async (file, kind) => {
    if (!user?.uid) throw new Error("No user");
    const storage = getStorage();
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const key = `${Date.now()}_${safeName}`;
    const path = `events_uploads/${user.uid}/${kind}/${key}`;
    const fileRef = sRef(storage, path);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    return url;
  };

  const onPickImage = () => imageInputRef.current?.click();
  const onPickVideo = () => videoInputRef.current?.click();

  const onImageSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // reset input so selecting same file again works
    e.target.value = "";

    try {
      setUploadingImage(true);
      const url = await uploadFileToStorage(file, "images");
      setForm((p) => ({ ...p, imageUrl: url }));
      toast({
        title: "Image uploaded",
        description: "Image URL added to the event.",
        status: "success",
        duration: 2200,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Image upload failed",
        description: "Check Firebase Storage rules/config and try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const onVideoSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";

    try {
      setUploadingVideo(true);
      const url = await uploadFileToStorage(file, "videos");
      setForm((p) => ({ ...p, videoUrl: url }));
      toast({
        title: "Video uploaded",
        description: "Video URL added to the event.",
        status: "success",
        duration: 2200,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Video upload failed",
        description: "Check Firebase Storage rules/config and try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUploadingVideo(false);
    }
  };

  const saveEvent = async () => {
    const err = validate();
    if (err) {
      toast({
        title: "Missing information",
        description: err,
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }
    if (!user?.uid) return;

    setSaving(true);
    try {
      const now = Date.now();
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        date: form.date,
        time: form.time,
        priceLabel: form.priceLabel.trim(),
        reservationOnly: !!form.reservationOnly,
        ticketUrl: form.ticketUrl.trim(),
        imageUrl: form.imageUrl.trim(),
        videoUrl: form.videoUrl.trim(),
        updatedAt: now,
      };

      if (mode === "create") {
        const newRef = push(ref(db, `events/${user.uid}`));
        await set(newRef, { ...payload, createdAt: now });
        toast({ title: "Event created", status: "success", duration: 2000, isClosable: true });
      } else {
        await update(ref(db, `events/${user.uid}/${editingId}`), payload);
        toast({ title: "Event updated", status: "success", duration: 2000, isClosable: true });
      }

      closeModal();
    } catch (e) {
      toast({
        title: "Save failed",
        description: "Please try again.",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
      setSaving(false);
    }
  };

  const deleteEvent = async (eventId) => {
    if (!user?.uid) return;
    try {
      await remove(ref(db, `events/${user.uid}/${eventId}`));
      toast({ title: "Event deleted", status: "info", duration: 2000, isClosable: true });
    } catch (e) {
      toast({
        title: "Delete failed",
        description: "Please try again.",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    }
  };

  return (
    <Box color="white">
      <HStack justify="space-between" align="flex-end" mb={6} flexWrap="wrap">
        <Box>
          <Heading size="lg">Events</Heading>
          <Text fontSize="sm" color={mutedText} mt={1}>
            Create events that appear on the customer Events page.
          </Text>
        </Box>

        <Button colorScheme="teal" onClick={openCreate}>
          + Add event
        </Button>
      </HStack>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
        {/* Calendar */}
        <Box
          bg={cardBg}
          borderWidth="1px"
          borderColor={cardBorder}
          rounded="2xl"
          p={5}
          gridColumn={{ base: "span 1", lg: "span 2" }}
        >
          <HStack justify="space-between" mb={4}>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
            >
              ←
            </Button>

            <Text fontSize="lg" fontWeight="semibold">
              {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
            </Text>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
            >
              →
            </Button>
          </HStack>

          <SimpleGrid columns={7} mb={2}>
            {WEEKDAYS.map((d) => (
              <Text key={d} textAlign="center" fontSize="sm" color={mutedText}>
                {d}
              </Text>
            ))}
          </SimpleGrid>

          <SimpleGrid columns={7} gap={2}>
            {days.map((date, idx) =>
              date ? (
                <Box
                  key={idx}
                  p={3}
                  h="70px"
                  borderWidth="1px"
                  borderRadius="md"
                  borderColor={isSameDay(date, selectedDate) ? "teal.400" : cardBorder}
                  bg={isSameDay(date, selectedDate) ? "teal.900" : "gray.800"}
                  color="gray.200"
                  cursor="pointer"
                  position="relative"
                  _hover={{ borderColor: "teal.300" }}
                  onClick={() => setSelectedDate(date)}
                >
                  <Text fontSize="sm">{date.getDate()}</Text>

                  {hasEventsOnDate(date) && (
                    <Box
                      position="absolute"
                      bottom="4px"
                      left="50%"
                      transform="translateX(-50%)"
                      color="yellow.300"
                      fontSize="18px"
                      filter="drop-shadow(0 0 4px rgba(246, 224, 94, 0.8))"
                    >
                      <AiFillStar />
                    </Box>
                  )}
                </Box>
              ) : (
                <Box key={idx} />
              )
            )}
          </SimpleGrid>

          <Divider my={5} borderColor="whiteAlpha.200" />

          <HStack justify="space-between" flexWrap="wrap" spacing={3}>
            <Text fontWeight="semibold">
              Selected:{" "}
              <Text as="span" color="whiteAlpha.800">
                {selectedDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
              </Text>
            </Text>
            <Button size="sm" variant="outline" borderColor="whiteAlpha.300" onClick={openCreate}>
              Add event for this date
            </Button>
          </HStack>
        </Box>

        {/* Events list for selected day */}
        <Box bg={cardBg} borderWidth="1px" borderColor={cardBorder} rounded="2xl" p={5}>
          <Heading size="md" mb={2}>
            Events
          </Heading>
          <Text fontSize="sm" color={mutedText} mb={4}>
            {formatDate(toISODate(selectedDate))}
          </Text>

          {eventsForSelectedDate.length === 0 ? (
            <Text color={mutedText}>No events on this date.</Text>
          ) : (
            <Stack spacing={4}>
              {eventsForSelectedDate.map((e) => (
                <Box
                  key={e.id}
                  borderWidth="1px"
                  borderColor="whiteAlpha.200"
                  rounded="xl"
                  p={4}
                  bg="blackAlpha.400"
                >
                  <HStack justify="space-between" align="start" gap={3}>
                    <Box>
                      <HStack spacing={2} mb={1} flexWrap="wrap">
                        <Text fontWeight="bold">{e.title}</Text>
                        {e.reservationOnly ? (
                          <Badge colorScheme="teal">Reservation Only</Badge>
                        ) : e.ticketUrl ? (
                          <Badge colorScheme="purple">Tickets</Badge>
                        ) : (
                          <Badge bg="whiteAlpha.200" color="whiteAlpha.900">
                            General
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="sm" color={mutedText}>
                        {formatDate(e.date)} • {e.time}
                      </Text>
                      {e.priceLabel && (
                        <Text mt={1} fontSize="sm" color="whiteAlpha.900" fontWeight="semibold">
                          {e.priceLabel}
                        </Text>
                      )}
                      {e.description && (
                        <Text mt={2} fontSize="sm" color="whiteAlpha.800" noOfLines={3}>
                          {e.description}
                        </Text>
                      )}
                    </Box>

                    <Stack spacing={2} align="flex-end">
                      <Button size="sm" colorScheme="teal" variant="outline" onClick={() => openEdit(e)}>
                        Edit
                      </Button>
                      <Button size="sm" colorScheme="red" variant="ghost" onClick={() => deleteEvent(e.id)}>
                        Delete
                      </Button>
                    </Stack>
                  </HStack>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </SimpleGrid>

      {/* Create/Edit Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} size="xl" isCentered scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent bg="gray.900" color="white" border="1px solid" borderColor="whiteAlpha.200" rounded="2xl">
          <ModalHeader>{mode === "create" ? "Create Event" : "Edit Event"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={4}>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  bg="gray.800"
                  borderColor="gray.700"
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel>Date</FormLabel>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                    bg="gray.800"
                    borderColor="gray.700"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Time (24h)</FormLabel>
                  <Input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
                    bg="gray.800"
                    borderColor="gray.700"
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  bg="gray.800"
                  borderColor="gray.700"
                  rows={4}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Price label (optional)</FormLabel>
                <Input
                  value={form.priceLabel}
                  onChange={(e) => setForm((p) => ({ ...p, priceLabel: e.target.value }))}
                  placeholder="e.g. BD 15 per person"
                  bg="gray.800"
                  borderColor="gray.700"
                />
              </FormControl>

              <HStack justify="space-between" flexWrap="wrap" gap={3}>
                <FormControl display="flex" alignItems="center" gap={3}>
                  <FormLabel mb="0">Reservation only (pay at venue)</FormLabel>
                  <Switch
                    isChecked={form.reservationOnly}
                    onChange={(e) => setForm((p) => ({ ...p, reservationOnly: e.target.checked }))}
                  />
                </FormControl>

                <FormControl maxW="260px">
                  <FormLabel>Type</FormLabel>
                  <Select
                    value={form.ticketUrl ? "tickets" : form.reservationOnly ? "reservationOnly" : "general"}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "tickets") setForm((p) => ({ ...p, reservationOnly: false }));
                      if (v === "reservationOnly") setForm((p) => ({ ...p, ticketUrl: "" }));
                      if (v === "general") setForm((p) => ({ ...p, reservationOnly: false, ticketUrl: "" }));
                    }}
                    bg="gray.800"
                    borderColor="gray.700"
                  >
                    <option value="general">General</option>
                    <option value="reservationOnly">Reservation only</option>
                    <option value="tickets">Tickets</option>
                  </Select>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Ticket / Payment link (optional)</FormLabel>
                <Input
                  value={form.ticketUrl}
                  onChange={(e) => setForm((p) => ({ ...p, ticketUrl: e.target.value }))}
                  placeholder="https://..."
                  bg="gray.800"
                  borderColor="gray.700"
                />
                <Text fontSize="xs" color="whiteAlpha.700" mt={1}>
                  If you provide a link, customers will see a “Get Tickets” button.
                </Text>
              </FormControl>

              {/* ✅ IMAGE URL + BROWSE */}
              <FormControl>
                <FormLabel>Image (URL or upload)</FormLabel>

                <HStack spacing={3} align="center" flexWrap="wrap">
                  <Input
                    value={form.imageUrl}
                    onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
                    placeholder="https://...  (or upload below)"
                    bg="gray.800"
                    borderColor="gray.700"
                  />

                  <Button
                    onClick={onPickImage}
                    variant="outline"
                    borderColor="whiteAlpha.300"
                    isDisabled={uploadingImage}
                    minW="140px"
                  >
                    {uploadingImage ? (
                      <HStack spacing={2}>
                        <Spinner size="sm" />
                        <Text fontSize="sm">Uploading</Text>
                      </HStack>
                    ) : (
                      "Browse Image"
                    )}
                  </Button>

                  <Input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    display="none"
                    onChange={onImageSelected}
                  />
                </HStack>

                {form.imageUrl?.trim() && (
                  <Image
                    src={form.imageUrl}
                    alt="Preview"
                    mt={3}
                    borderRadius="lg"
                    w="100%"
                    h="180px"
                    objectFit="cover"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                  />
                )}
              </FormControl>

              {/* ✅ VIDEO URL + BROWSE */}
              <FormControl>
                <FormLabel>Video (embed URL or upload)</FormLabel>

                <HStack spacing={3} align="center" flexWrap="wrap">
                  <Input
                    value={form.videoUrl}
                    onChange={(e) => setForm((p) => ({ ...p, videoUrl: e.target.value }))}
                    placeholder="YouTube embed URL OR upload a video"
                    bg="gray.800"
                    borderColor="gray.700"
                  />

                  <Button
                    onClick={onPickVideo}
                    variant="outline"
                    borderColor="whiteAlpha.300"
                    isDisabled={uploadingVideo}
                    minW="140px"
                  >
                    {uploadingVideo ? (
                      <HStack spacing={2}>
                        <Spinner size="sm" />
                        <Text fontSize="sm">Uploading</Text>
                      </HStack>
                    ) : (
                      "Browse Video"
                    )}
                  </Button>

                  <Input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    display="none"
                    onChange={onVideoSelected}
                  />
                </HStack>

                {/* Preview video: iframe for embed, video tag for uploaded file */}
                {form.videoUrl?.trim() && (
                  <Box
                    mt={3}
                    borderRadius="lg"
                    overflow="hidden"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                  >
                    {isEmbedUrl(form.videoUrl) ? (
                      <AspectRatio ratio={16 / 9}>
                        <iframe title="Event video preview" src={form.videoUrl} allowFullScreen />
                      </AspectRatio>
                    ) : (
                      <Box bg="black">
                        <video
                          src={form.videoUrl}
                          controls
                          style={{ width: "100%", height: "auto", display: "block" }}
                        />
                      </Box>
                    )}
                  </Box>
                )}

                <Text fontSize="xs" color="whiteAlpha.700" mt={2}>
                  If you paste a YouTube embed link, it will show as an embedded video. If you upload a file, it will play as a normal video.
                </Text>
              </FormControl>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={saveEvent}
              isLoading={saving}
              isDisabled={uploadingImage || uploadingVideo}
            >
              {mode === "create" ? "Create" : "Save"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
