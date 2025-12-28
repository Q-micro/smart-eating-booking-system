import {
  Box,
  Button,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  Badge,
} from "@chakra-ui/react";
import { BellIcon } from "@chakra-ui/icons";
import { useEffect, useMemo, useState } from "react";
import { db
 } from "../firebase";
import { ref, onValue, update } from "firebase/database";
import { useNavigate } from "react-router-dom";

export default function NotificationsBell({ userId }) {
  const [items, setItems] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;
    const nRef = ref(db, `notifications/${userId}`);
    return onValue(nRef, (snap) => setItems(snap.val() || {}));
  }, [userId]);

  const list = useMemo(() => {
    return Object.entries(items)
      .map(([id, n]) => ({ id, ...n }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [items]);

  const unread = useMemo(() => list.filter((n) => !n.read).length, [list]);

  const openNotif = async (n) => {
    // mark read
    await update(ref(db, `notifications/${userId}/${n.id}`), { read: true });

    if (n.link) navigate(n.link);
  };

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Notifications"
        icon={
          <Box position="relative">
            <BellIcon />
            {unread > 0 && (
              <Badge
                position="absolute"
                top="-8px"
                right="-10px"
                colorScheme="red"
                rounded="full"
                fontSize="0.7em"
              >
                {unread}
              </Badge>
            )}
          </Box>
        }
        variant="ghost"
        color="white"
        _hover={{ bg: "whiteAlpha.200" }}
      />
      <MenuList bg="neutral.800" borderColor="whiteAlpha.200" color="white">
        <HStack justify="space-between" px={3} py={2}>
          <Text fontWeight="semibold">Notifications</Text>
          <Text fontSize="xs" color="whiteAlpha.600">
            {unread} unread
          </Text>
        </HStack>

        {list.length === 0 ? (
          <MenuItem bg="transparent" _hover={{ bg: "whiteAlpha.100" }}>
            No notifications yet
          </MenuItem>
        ) : (
          list.slice(0, 8).map((n) => (
            <MenuItem
              key={n.id}
              bg="transparent"
              _hover={{ bg: "whiteAlpha.100" }}
              onClick={() => openNotif(n)}
            >
              <Box>
                <Text fontWeight={n.read ? "normal" : "bold"} fontSize="sm">
                  {n.title}
                </Text>
                <Text fontSize="xs" color="whiteAlpha.700">
                  {n.message}
                </Text>
              </Box>
            </MenuItem>
          ))
        )}

        {list.length > 0 && (
          <Box px={3} py={2}>
            <Button
              size="sm"
              w="100%"
              variant="outline"
              borderColor="whiteAlpha.300"
              _hover={{ bg: "whiteAlpha.100" }}
              onClick={() => navigate("/profile")}
            >
              View all
            </Button>
          </Box>
        )}
      </MenuList>
    </Menu>
  );
}
