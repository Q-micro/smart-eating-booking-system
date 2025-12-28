// src/pages/admin/AdminTableLayout.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Heading,
  Text,
  HStack,
  Button,
  Tag,
  Stack,
  Input,
  Select,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Switch,
  Divider,
  Image,
  Badge,
} from "@chakra-ui/react";
import { Rnd } from "react-rnd";
import { useAuth } from "../../auth/AuthContext";
import { db, storage } from "../../firebase";
import { ref as dbRef, onValue, update } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const SHAPES = [
  { value: "round", label: "Round table" },
  { value: "square", label: "Square table" },
  { value: "rect", label: "Rectangle table" },
  { value: "poi", label: "Marker (bathroom / door / kitchen)" },
];

function defaultItem() {
  return {
    id: "",
    label: "",
    shape: "round",
    seats: 4,
    area: "Main",
    unavailable: false,
    view360Url: "",
  };
}

export default function AdminTableLayout({ isPremium = false }) {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);

  // stored in DB (kept for compatibility)
  const [cols, setCols] = useState(24);
  const [rowHeight, setRowHeight] = useState(18);

  // items
  const [tables, setTables] = useState({});
  const [pois, setPois] = useState({});

  // selection
  const [selectedId, setSelectedId] = useState(null);

  // modal
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(defaultItem());
  const [uploading360, setUploading360] = useState(false);

  // scroll/pan stage
  const outerRef = useRef(null);
  const [spaceDown, setSpaceDown] = useState(false);
  const panRef = useRef({
    isPanning: false,
    startX: 0,
    startY: 0,
    startScrollLeft: 0,
    startScrollTop: 0,
  });

  // Bigger stage so you can scroll around
  const STAGE_W = 2600;
  const STAGE_H = 1400;

  // Load layout from DB
  useEffect(() => {
    if (!user?.uid) return;

    const r = dbRef(db, `restaurants/${user.uid}/layouts/main`);
    const unsub = onValue(
      r,
      (snap) => {
        const data = snap.val() || {};
        setCols(data.cols ?? 24);
        setRowHeight(data.rowHeight ?? 18);
        setTables(data.tables || {});
        setPois(data.pois || {});
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user?.uid]);

  const saveLayout = async (next) => {
    if (!user?.uid) return;
    await update(dbRef(db, `restaurants/${user.uid}/layouts/main`), next);
  };

  // Only ids (position is read from tables/pois)
  const layoutItems = useMemo(() => {
    const all = [...Object.values(tables || {}), ...Object.values(pois || {})];
    const list = all.map((t) => ({ i: t.id }));
    list.sort((a, b) => a.i.localeCompare(b.i));
    return list;
  }, [tables, pois]);

  const selectedItem = useMemo(() => {
    return (selectedId && (tables?.[selectedId] || pois?.[selectedId])) || null;
  }, [selectedId, tables, pois]);

  // Keyboard: Space enables pan drag
  useEffect(() => {
    const down = (e) => {
      if (e.code === "Space") {
        setSpaceDown(true);
        // prevent page scroll
        e.preventDefault();
      }
    };
    const up = (e) => {
      if (e.code === "Space") setSpaceDown(false);
    };
    window.addEventListener("keydown", down, { passive: false });
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setDraft(defaultItem());
    setIsOpen(true);
  };

  const openEdit = (id) => {
    const t = tables?.[id] || pois?.[id];
    if (!t) return;

    setEditingId(id);
    setDraft({
      id: t.id,
      label: t.label,
      shape: t.shape,
      seats: t.seats ?? 0,
      area: t.area ?? "Main",
      unavailable: !!t.unavailable,
      view360Url: t.view360Url || "",
    });
    setIsOpen(true);
  };

  const removeItem = async (id) => {
    const nextTables = { ...(tables || {}) };
    const nextPois = { ...(pois || {}) };

    if (nextTables[id]) delete nextTables[id];
    if (nextPois[id]) delete nextPois[id];

    setTables(nextTables);
    setPois(nextPois);

    if (selectedId === id) setSelectedId(null);

    await saveLayout({ cols, rowHeight, tables: nextTables, pois: nextPois });

    toast({
      title: "Deleted",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const upsert = async () => {
    const id = draft.id.trim();
    if (!id) {
      toast({
        title: "ID required",
        description: "Example: A1, B2, T10",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    const label = draft.label.trim() || id;

    const existing = tables?.[editingId] || pois?.[editingId];

    const defaultW =
      draft.shape === "poi" ? 120 : draft.shape === "rect" ? 130 : 105;
    const defaultH =
      draft.shape === "poi" ? 48 : draft.shape === "rect" ? 70 : 72;

    const base = {
      id,
      label,
      shape: draft.shape,
      seats: draft.shape === "poi" ? 0 : Number(draft.seats || 0),
      area: draft.area || "Main",
      unavailable: draft.shape === "poi" ? true : !!draft.unavailable,
      view360Url: draft.shape === "poi" ? "" : draft.view360Url || "",

      x: existing?.x ?? 24,
      y: existing?.y ?? 24,
      w: existing?.w ?? defaultW,
      h: existing?.h ?? defaultH,
    };

    const nextTables = { ...(tables || {}) };
    const nextPois = { ...(pois || {}) };

    if (editingId && editingId !== id) {
      delete nextTables[editingId];
      delete nextPois[editingId];
    }

    if (draft.shape === "poi") {
      nextPois[id] = base;
      delete nextTables[id];
    } else {
      nextTables[id] = base;
      delete nextPois[id];
    }

    setTables(nextTables);
    setPois(nextPois);
    setSelectedId(id);

    await saveLayout({ cols, rowHeight, tables: nextTables, pois: nextPois });

    setIsOpen(false);

    toast({
      title: editingId ? "Updated" : "Added",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleDragStop = async (id, x, y) => {
    const nextTables = { ...(tables || {}) };
    const nextPois = { ...(pois || {}) };

    if (nextTables[id]) nextTables[id] = { ...nextTables[id], x, y };
    if (nextPois[id]) nextPois[id] = { ...nextPois[id], x, y };

    setTables(nextTables);
    setPois(nextPois);

    await saveLayout({ cols, rowHeight, tables: nextTables, pois: nextPois });
  };

  const handleResizeStop = async (id, w, h, x, y) => {
    const nextTables = { ...(tables || {}) };
    const nextPois = { ...(pois || {}) };

    if (nextTables[id]) nextTables[id] = { ...nextTables[id], w, h, x, y };
    if (nextPois[id]) nextPois[id] = { ...nextPois[id], w, h, x, y };

    setTables(nextTables);
    setPois(nextPois);

    await saveLayout({ cols, rowHeight, tables: nextTables, pois: nextPois });
  };

  const upload360 = async (file) => {
    if (!user?.uid) return "";
    setUploading360(true);
    try {
      const safeName = file.name.replace(/[^\w.\-]+/g, "_");
      const path = `restaurants/${user.uid}/tables360/${Date.now()}_${safeName}`;
      const sRef = storageRef(storage, path);
      await uploadBytes(sRef, file);
      const url = await getDownloadURL(sRef);
      return url;
    } finally {
      setUploading360(false);
    }
  };

  // Quick update from inspector
  const quickUpdateSelected = async (patch) => {
    if (!user?.uid || !selectedItem?.id) return;

    const id = selectedItem.id;
    const isPoi = (pois?.[id] && !tables?.[id]) || selectedItem.shape === "poi";

    const nextTables = { ...(tables || {}) };
    const nextPois = { ...(pois || {}) };

    if (isPoi) {
      if (!nextPois[id]) return;
      nextPois[id] = { ...nextPois[id], ...patch };
    } else {
      if (!nextTables[id]) return;
      nextTables[id] = { ...nextTables[id], ...patch };
    }

    setTables(nextTables);
    setPois(nextPois);

    await saveLayout({ cols, rowHeight, tables: nextTables, pois: nextPois });
  };

  // PAN HANDLERS (Space + drag OR middle mouse)
  const startPan = (e) => {
    const outer = outerRef.current;
    if (!outer) return;

    const isMiddleMouse = e.button === 1;
    const canPan = spaceDown || isMiddleMouse;
    if (!canPan) return;

    // only pan if you're clicking the background, not on a table
    // (if user clicks on table while holding space, still pan feels ok)
    panRef.current.isPanning = true;
    panRef.current.startX = e.clientX;
    panRef.current.startY = e.clientY;
    panRef.current.startScrollLeft = outer.scrollLeft;
    panRef.current.startScrollTop = outer.scrollTop;

    // prevent selecting stuff
    e.preventDefault();
  };

  const movePan = (e) => {
    const outer = outerRef.current;
    if (!outer) return;
    if (!panRef.current.isPanning) return;

    const dx = e.clientX - panRef.current.startX;
    const dy = e.clientY - panRef.current.startY;

    outer.scrollLeft = panRef.current.startScrollLeft - dx;
    outer.scrollTop = panRef.current.startScrollTop - dy;
  };

  const endPan = () => {
    panRef.current.isPanning = false;
  };

  if (loading) {
    return (
      <Box color="white">
        <Heading size="md">Table layout</Heading>
        <Text color="whiteAlpha.700">Loading…</Text>
      </Box>
    );
  }

  const showPanHint = spaceDown;

  return (
    <Box color="white">
      <HStack justify="space-between" flexWrap="wrap" gap={3} mb={4}>
        <Box>
          <Heading size="md">Layout editor</Heading>
          <Text color="whiteAlpha.700">
            Drag tables to move. Double-click to edit.{" "}
            <b>Hold Space + drag</b> to pan around.
          </Text>
          {showPanHint && (
            <Text fontSize="sm" color="yellow.200" mt={1}>
              Pan mode ON — drag anywhere to move around
            </Text>
          )}
        </Box>

        <HStack flexWrap="wrap">
          <Tag bg="whiteAlpha.200">Cols: {cols}</Tag>
          <Tag bg="whiteAlpha.200">Row: {rowHeight}px</Tag>

          <Button
            onClick={openAdd}
            bg="blue.600"
            color="white"
            fontWeight="semibold"
            _hover={{ bg: "blue.500" }}
            _active={{ bg: "blue.700" }}
          >
            Add table / marker
          </Button>
        </HStack>
      </HStack>

      <SimpleGridLike>
        {/* SCROLL + PAN CANVAS */}
    <Box
  ref={outerRef}
  bg="blackAlpha.600"
  border="1px solid"
  borderColor="whiteAlpha.200"
  rounded="2xl"
  p={3}
  minH="520px"
  maxH="72vh"
  overflowX="auto"
  overflowY="auto"
  whiteSpace="nowrap"
  sx={{
    "&::-webkit-scrollbar": { height: "12px", width: "12px" },
    "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.25)", borderRadius: "999px" },
    "&::-webkit-scrollbar-track": { background: "rgba(255,255,255,0.06)" },
  }}
>

          {/* INNER STAGE */}
          <Box
            position="relative"
            w={`${STAGE_W}px`}
            h={`${STAGE_H}px`}
            rounded="xl"
            border="1px solid"
            borderColor="whiteAlpha.100"
            bg="blackAlpha.400"
          >
            {layoutItems.map((it) => {
              const data = tables[it.i] || pois[it.i];
              const isPoi = data?.shape === "poi";
              const unavailable = !!data?.unavailable;

              const x = data?.x ?? 24;
              const y = data?.y ?? 24;
              const w = data?.w ?? (isPoi ? 120 : data?.shape === "rect" ? 130 : 105);
              const h = data?.h ?? (isPoi ? 48 : data?.shape === "rect" ? 70 : 72);

              const isSelected = selectedId === it.i;

              return (
                <Rnd
                  key={it.i}
                  bounds="parent"
                  position={{ x, y }}
                  size={{ width: w, height: h }}
                  enableResizing={!isPoi}
                  disableDragging={spaceDown} // ✅ space = pan, not move tables
                  onDragStop={(e, d) => handleDragStop(it.i, d.x, d.y)}
                  onResizeStop={(e, dir, refEl, delta, pos) =>
                    handleResizeStop(
                      it.i,
                      refEl.offsetWidth,
                      refEl.offsetHeight,
                      pos.x,
                      pos.y
                    )
                  }
                  onMouseDown={(e) => {
                    // prevent outer clicks/pan logic from interfering
                    e.stopPropagation();
                    setSelectedId(it.i);
                  }}
                >
                  <Box
                    w="100%"
                    h="100%"
                    bg={isPoi ? "whiteAlpha.200" : unavailable ? "gray.600" : "teal.700"}
                    border="2px solid"
                    borderColor={isSelected ? "yellow.300" : "whiteAlpha.500"}
                    boxShadow={isSelected ? "0 0 0 2px rgba(236, 201, 75, 0.35)" : "none"}
                    rounded={isPoi ? "lg" : data?.shape === "round" ? "full" : "lg"}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    cursor={spaceDown ? "grab" : "grab"}
                    userSelect="none"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      openEdit(it.i);
                    }}
                  >
                    <Stack spacing={0} align="center" pointerEvents="none" px={2}>
                      <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
                        {data?.label || it.i}
                      </Text>

                      {!isPoi ? (
                        <Text fontSize="xs" color="whiteAlpha.800" noOfLines={1}>
                          {data?.seats || 0} seats • {data?.area || "Main"}
                        </Text>
                      ) : (
                        <Text fontSize="xs" color="whiteAlpha.800" noOfLines={1}>
                          {data?.area || "Marker"}
                        </Text>
                      )}
                    </Stack>
                  </Box>
                </Rnd>
              );
            })}

            {layoutItems.length === 0 && (
              <Box mt={2} p={3}>
                <Text color="whiteAlpha.700" fontSize="sm">
                  No items yet. Click <b>Add table / marker</b> to create your first table.
                </Text>
              </Box>
            )}
          </Box>
        </Box>

        {/* INSPECTOR (still here, but selection will NOT disappear anymore) */}
        <Box
          bg="whiteAlpha.50"
          border="1px solid"
          borderColor="whiteAlpha.200"
          rounded="2xl"
          p={4}
          minH="520px"
        >
          <Heading size="sm" mb={2}>
            Selected item
          </Heading>

          {!selectedItem ? (
            <Text color="whiteAlpha.700" fontSize="sm">
              Click a table/marker on the map to edit it. (Double-click for full editor.)
            </Text>
          ) : (
            <Stack spacing={3}>
              <HStack justify="space-between">
                <Box>
                  <Text fontWeight="bold">{selectedItem.label || selectedItem.id}</Text>
                  <Text fontSize="xs" color="whiteAlpha.700">
                    ID: {selectedItem.id} • Type: {selectedItem.shape}
                  </Text>
                </Box>

                <Badge colorScheme={selectedItem.shape === "poi" ? "gray" : "teal"}>
                  {selectedItem.shape === "poi" ? "Marker" : "Table"}
                </Badge>
              </HStack>

              <Divider borderColor="whiteAlpha.200" />

              <FormControl>
                <FormLabel fontSize="sm">Label</FormLabel>
                <Input
                  value={selectedItem.label || ""}
                  onChange={(e) => quickUpdateSelected({ label: e.target.value })}
                  bg="blackAlpha.600"
                  borderColor="whiteAlpha.300"
                  color="white"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Area / Note</FormLabel>
                <Input
                  value={selectedItem.area || ""}
                  onChange={(e) => quickUpdateSelected({ area: e.target.value })}
                  bg="blackAlpha.600"
                  borderColor="whiteAlpha.300"
                  color="white"
                />
              </FormControl>

              {selectedItem.shape !== "poi" && (
                <>
                  <FormControl>
                    <FormLabel fontSize="sm">Seats</FormLabel>
                    <Input
                      type="number"
                      value={selectedItem.seats ?? 0}
                      onChange={(e) =>
                        quickUpdateSelected({ seats: Number(e.target.value || 0) })
                      }
                      bg="blackAlpha.600"
                      borderColor="whiteAlpha.300"
                      color="white"
                    />
                  </FormControl>

                  <FormControl
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <FormLabel fontSize="sm" mb="0">
                      Unavailable (Blocked)
                    </FormLabel>
                    <Switch
                      isChecked={!!selectedItem.unavailable}
                      onChange={(e) =>
                        quickUpdateSelected({ unavailable: e.target.checked })
                      }
                    />
                  </FormControl>

                  <Divider borderColor="whiteAlpha.200" />

                  <Text fontSize="sm" fontWeight="semibold">
                    360° view (demo enabled)
                  </Text>

                  <Input
                    type="file"
                    accept="image/*"
                    p={1}
                    bg="blackAlpha.600"
                    borderColor="whiteAlpha.300"
                    color="white"
                    isDisabled={false} // ✅ always enabled for demo
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const url = await upload360(file);
                      await quickUpdateSelected({ view360Url: url });

                      toast({
                        title: "360 uploaded",
                        status: "success",
                        duration: 2000,
                        isClosable: true,
                      });

                      e.target.value = "";
                    }}
                  />

                  {uploading360 && (
                    <Text fontSize="sm" color="whiteAlpha.700">
                      Uploading…
                    </Text>
                  )}

                  {!!selectedItem.view360Url && (
                    <Box>
                      <Text fontSize="xs" color="green.200" mb={2}>
                        360 attached ✅
                      </Text>
                      <Image
                        src={selectedItem.view360Url}
                        alt="360 preview"
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="whiteAlpha.200"
                        w="100%"
                        h="160px"
                        objectFit="cover"
                      />
                      <Button
                        mt={2}
                        size="xs"
                        variant="outline"
                        borderColor="whiteAlpha.300"
                        onClick={() => quickUpdateSelected({ view360Url: "" })}
                      >
                        Remove 360
                      </Button>
                    </Box>
                  )}
                </>
              )}

              <Divider borderColor="whiteAlpha.200" />

              <HStack justify="space-between">
                <Button
                  size="sm"
                  variant="outline"
                  borderColor="whiteAlpha.300"
                  onClick={() => openEdit(selectedItem.id)}
                >
                  Open full editor
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  borderColor="red.400"
                  color="red.200"
                  onClick={() => removeItem(selectedItem.id)}
                >
                  Delete
                </Button>
              </HStack>
            </Stack>
          )}
        </Box>
      </SimpleGridLike>

      {/* Add/Edit modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} isCentered size="lg">
        <ModalOverlay />
        <ModalContent bg="neutral.900" border="1px solid" borderColor="whiteAlpha.200">
          <ModalHeader color="white">{editingId ? "Edit item" : "Add item"}</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <Stack spacing={4}>
              <HStack>
                <FormControl>
                  <FormLabel color="whiteAlpha.800">ID</FormLabel>
                  <Input
                    value={draft.id}
                    onChange={(e) => setDraft((p) => ({ ...p, id: e.target.value }))}
                    placeholder="A1"
                    bg="blackAlpha.600"
                    borderColor="whiteAlpha.300"
                    color="white"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color="whiteAlpha.800">Label</FormLabel>
                  <Input
                    value={draft.label}
                    onChange={(e) => setDraft((p) => ({ ...p, label: e.target.value }))}
                    placeholder="A1"
                    bg="blackAlpha.600"
                    borderColor="whiteAlpha.300"
                    color="white"
                  />
                </FormControl>
              </HStack>

              <HStack>
                <FormControl>
                  <FormLabel color="whiteAlpha.800">Type</FormLabel>
                  <Select
                    value={draft.shape}
                    onChange={(e) => setDraft((p) => ({ ...p, shape: e.target.value }))}
                    bg="blackAlpha.600"
                    borderColor="whiteAlpha.300"
                    color="white"
                    sx={{ option: { color: "black" } }}
                  >
                    {SHAPES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isDisabled={draft.shape === "poi"}>
                  <FormLabel color="whiteAlpha.800">Seats</FormLabel>
                  <Input
                    type="number"
                    value={draft.seats}
                    onChange={(e) => setDraft((p) => ({ ...p, seats: e.target.value }))}
                    bg="blackAlpha.600"
                    borderColor="whiteAlpha.300"
                    color="white"
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel color="whiteAlpha.800">Area / Note</FormLabel>
                <Input
                  value={draft.area}
                  onChange={(e) => setDraft((p) => ({ ...p, area: e.target.value }))}
                  placeholder={
                    draft.shape === "poi"
                      ? "Bathroom / Kitchen / Door"
                      : "Main / Terrace / Private room"
                  }
                  bg="blackAlpha.600"
                  borderColor="whiteAlpha.300"
                  color="white"
                />
              </FormControl>

              {draft.shape !== "poi" && (
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <FormLabel color="whiteAlpha.800" mb="0">
                    Table unavailable
                  </FormLabel>
                  <Switch
                    isChecked={draft.unavailable}
                    onChange={(e) => setDraft((p) => ({ ...p, unavailable: e.target.checked }))}
                  />
                </FormControl>
              )}

              {draft.shape !== "poi" && (
                <>
                  <Divider borderColor="whiteAlpha.200" />
                  <Text color="whiteAlpha.700" fontSize="sm">
                    360° view (demo enabled)
                  </Text>

                  <FormControl>
                    <FormLabel color="whiteAlpha.800">Upload 360 image</FormLabel>
                    <Input
                      type="file"
                      accept="image/*"
                      bg="blackAlpha.600"
                      borderColor="whiteAlpha.300"
                      color="white"
                      p={1}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const url = await upload360(file);
                        setDraft((p) => ({ ...p, view360Url: url }));
                        toast({
                          title: "Uploaded 360",
                          status: "success",
                          duration: 2000,
                          isClosable: true,
                        });
                        e.target.value = "";
                      }}
                    />

                    {uploading360 && (
                      <Text mt={2} fontSize="sm" color="whiteAlpha.700">
                        Uploading…
                      </Text>
                    )}

                    {!!draft.view360Url && (
                      <Box mt={2}>
                        <Text fontSize="xs" color="green.200" mb={2}>
                          360 attached ✅
                        </Text>
                        <Image
                          src={draft.view360Url}
                          alt="360 preview"
                          borderRadius="lg"
                          border="1px solid"
                          borderColor="whiteAlpha.200"
                          w="100%"
                          h="160px"
                          objectFit="cover"
                        />
                      </Box>
                    )}
                  </FormControl>
                </>
              )}
            </Stack>
          </ModalBody>

          <ModalFooter>
            <HStack>
              {editingId && (
                <Button
                  variant="outline"
                  borderColor="red.400"
                  color="red.200"
                  onClick={() => {
                    removeItem(editingId);
                    setIsOpen(false);
                  }}
                >
                  Delete
                </Button>
              )}
              <Button
                variant="outline"
                borderColor="whiteAlpha.300"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button bg="blue.600" _hover={{ bg: "blue.500" }} onClick={upsert}>
                Save
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

function SimpleGridLike({ children }) {
  return (
    <Box
      display="grid"
      gridTemplateColumns={{ base: "1fr", lg: "2fr 1fr" }}
      gap={6}
      alignItems="start"
    >
      {children}
    </Box>
  );
}
