import {
  Box,
  Heading,
  Text,
  Stack,
  HStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  Divider,
  useToast,
  Badge,
  Center,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext.jsx";
import { db } from "../../firebase";
import { ref, onValue, push, set, update } from "firebase/database";

function maskCard(num) {
  const clean = (num || "").replace(/\s/g, "");
  if (clean.length < 4) return "****";
  return `**** **** **** ${clean.slice(-4)}`;
}

export default function AdminBilling() {
  const { user } = useAuth();
  const toast = useToast();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  // payment history
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  // PRICES (BHD)
  const BASIC_PRICE_BHD = 20;
  const PREMIUM_PRICE_BHD = 45;

  // fake payment fields
  const [cardName, setCardName] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");

  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    const rRef = ref(db, `restaurants/${user.uid}`);
    return onValue(
      rRef,
      (snap) => {
        setRestaurant(snap.val() || null);
        setLoading(false);
      },
      () => setLoading(false)
    );
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;

    const pRef = ref(db, `payments/${user.uid}`);
    return onValue(
      pRef,
      (snap) => {
        const val = snap.val() || {};
        const list = Object.values(val)
          .filter(Boolean)
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setPayments(list);
        setLoadingPayments(false);
      },
      () => setLoadingPayments(false)
    );
  }, [user?.uid]);

  const canPay = useMemo(() => {
    if (!restaurant) return false;
    return restaurant.status === "approved_pending_payment";
  }, [restaurant]);

  const validate = () => {
    const clean = cardNum.replace(/\s/g, "");
    if (!cardName.trim()) return "Card name is required.";
    if (!/^\d{16}$/.test(clean)) return "Card number must be 16 digits (demo).";
    if (!/^\d{2}\/\d{2}$/.test(exp)) return "Expiry must be MM/YY (demo).";
    if (!/^\d{3,4}$/.test(cvc)) return "CVC must be 3–4 digits (demo).";
    return null;
  };

  const payNow = async () => {
    if (!user?.uid) return;

    if (!canPay) {
      toast({
        title: "Payment not available",
        description: "You can pay only after Seb’s approves your application.",
        status: "info",
        duration: 3500,
        isClosable: true,
      });
      return;
    }

    const err = validate();
    if (err) {
      toast({ title: "Check details", description: err, status: "error" });
      return;
    }

    setIsPaying(true);

    try {
      // fake processing
      await new Promise((r) => setTimeout(r, 1200));

      // create payment record
      const paymentRef = push(ref(db, `payments/${user.uid}`));
      const paymentId = paymentRef.key;

      const now = Date.now();

      const plan = restaurant.plan || "basic";
      const amountBHD = plan === "premium" ? PREMIUM_PRICE_BHD : BASIC_PRICE_BHD;

      await set(paymentRef, {
        paymentId,
        ownerId: user.uid,
        plan,
        currency: "BHD",
        amountBHD: amountBHD,
        amountBD: amountBHD, // kept for backward compatibility (old field)
        method: "card",
        card: maskCard(cardNum),
        status: "paid",
        createdAt: now,
      });

      // activate restaurant (visible to customers)
      await update(ref(db, `restaurants/${user.uid}`), {
        status: "active",
        activatedAt: now,
        nextBillingAt: now + 1000 * 60 * 60 * 24 * 30, // +30 days (fake)
      });

      toast({
        title: "Payment successful",
        description: "Welcome to Seb’s. Your restaurant is now active.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      setCardName("");
      setCardNum("");
      setExp("");
      setCvc("");
    } catch (e) {
      console.error(e);
      toast({
        title: "Payment failed",
        description: "Could not process payment (demo). Try again.",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) {
    return (
      <Center minH="60vh">
        <Spinner />
      </Center>
    );
  }

  if (!restaurant) {
    return (
      <Box color="white">
        <Heading size="lg" mb={2}>
          Billing
        </Heading>
        <Text color="whiteAlpha.700">
          No restaurant application found yet. Submit your application first.
        </Text>
      </Box>
    );
  }

  return (
    <Box color="white">
      <Heading size="lg" mb={2}>
        Billing & subscription
      </Heading>
      

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {/* LEFT: status */}
        <Box
          bg="rgba(255,255,255,0.04)"
          border="1px solid"
          borderColor="whiteAlpha.200"
          rounded="2xl"
          p={5}
        >
          <Heading size="md" mb={2}>
            Your status
          </Heading>

          <HStack mb={3} spacing={3}>
            <Badge colorScheme="purple">{restaurant.plan || "basic"}</Badge>
            <Badge
              colorScheme={
                restaurant.status === "active"
                  ? "green"
                  : restaurant.status === "approved_pending_payment"
                  ? "yellow"
                  : restaurant.status === "pending_review"
                  ? "blue"
                  : "red"
              }
            >
              {restaurant.status}
            </Badge>
          </HStack>

          <Text fontSize="sm" color="whiteAlpha.700">
            Restaurant: {restaurant.name || "-"}
          </Text>

          <Divider my={4} borderColor="whiteAlpha.200" />

          <Text fontSize="sm" color="whiteAlpha.700">
            Plan pricing (BHD):
          </Text>
          <Text fontSize="sm" color="whiteAlpha.700">
            • Basic: {BASIC_PRICE_BHD} BHD / month
          </Text>
          <Text fontSize="sm" color="whiteAlpha.700" mb={3}>
            • Premium: {PREMIUM_PRICE_BHD} BHD / month
          </Text>

          {restaurant.status === "pending_review" && (
            <Text color="whiteAlpha.700">
              Seb’s is reviewing your application. Payment will unlock after
              approval.
            </Text>
          )}

          {restaurant.status === "approved_pending_payment" && (
            <Text color="whiteAlpha.700">
              Approved Please complete payment to activate your listing.
            </Text>
          )}

          {restaurant.status === "active" && (
            <Text color="whiteAlpha.700">
              Active  Your restaurant is live for customers.
            </Text>
          )}

          {restaurant.status === "rejected" && (
            <Text color="whiteAlpha.700">
              Your application was rejected. Contact Seb’s support (demo).
            </Text>
          )}

          <Divider my={4} borderColor="whiteAlpha.200" />

          <Heading size="sm" mb={2}>
            Payment history
          </Heading>

          {loadingPayments ? (
            <HStack color="whiteAlpha.700">
              <Spinner size="sm" />
              <Text fontSize="sm">Loading payments…</Text>
            </HStack>
          ) : payments.length === 0 ? (
            <Text fontSize="sm" color="whiteAlpha.700">
              01/12  Basic 20BD
            </Text>
          ) : (
            <Stack spacing={3}>
              {payments.map((p) => {
                const dateText = p.createdAt
                  ? new Date(p.createdAt).toLocaleString()
                  : "-";
                const amt =
                  typeof p.amountBHD === "number"
                    ? p.amountBHD
                    : typeof p.amountBD === "number"
                    ? p.amountBD
                    : 0;
                return (
                  <Box
                    key={p.paymentId || `${p.createdAt}-${p.card}`}
                    bg="whiteAlpha.50"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    rounded="xl"
                    p={3}
                  >
                    <HStack justify="space-between" align="start">
                      <Stack spacing={0}>
                        <Text fontSize="sm" color="whiteAlpha.900">
                          {p.plan || "basic"} • {amt} BHD
                        </Text>
                        <Text fontSize="xs" color="whiteAlpha.700">
                          {dateText}
                        </Text>
                        <Text fontSize="xs" color="whiteAlpha.700">
                          {p.method || "card"} • {p.card || "****"}
                        </Text>
                      </Stack>

                      <Badge
                        colorScheme={p.status === "paid" ? "green" : "yellow"}
                      >
                        {p.status || "paid"}
                      </Badge>
                    </HStack>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>

        {/* RIGHT: fake checkout */}
        <Box
          bg="rgba(255,255,255,0.04)"
          border="1px solid"
          borderColor="whiteAlpha.200"
          rounded="2xl"
          p={5}
        >
          <Heading size="md" mb={2}>
            Checkout
          </Heading>
          

          <Stack spacing={4}>
            <FormControl>
              <FormLabel>Cardholder name</FormLabel>
              <Input
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                bg="whiteAlpha.100"
                borderColor="whiteAlpha.200"
                placeholder="Sebastian A."
              />
            </FormControl>

            <FormControl>
              <FormLabel>Card number</FormLabel>
              <Input
                value={cardNum}
                onChange={(e) =>
                  setCardNum(
                    e.target.value
                      .replace(/[^\d]/g, "")
                      .slice(0, 16)
                      .replace(/(\d{4})/g, "$1 ")
                      .trim()
                  )
                }
                bg="whiteAlpha.100"
                borderColor="whiteAlpha.200"
                placeholder="1234 5678 9012 3456"
              />
            </FormControl>

            <HStack spacing={4}>
              <FormControl>
                <FormLabel>Expiry</FormLabel>
                <Input
                  value={exp}
                  onChange={(e) => {
                    let v = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                    if (v.length >= 3) v = `${v.slice(0, 2)}/${v.slice(2)}`;
                    setExp(v);
                  }}
                  bg="whiteAlpha.100"
                  borderColor="whiteAlpha.200"
                  placeholder="MM/YY"
                />
              </FormControl>

              <FormControl>
                <FormLabel>CVC</FormLabel>
                <Input
                  value={cvc}
                  onChange={(e) =>
                    setCvc(e.target.value.replace(/[^\d]/g, "").slice(0, 4))
                  }
                  bg="whiteAlpha.100"
                  borderColor="whiteAlpha.200"
                  placeholder="123"
                />
              </FormControl>
            </HStack>

            <Button
              colorScheme="purple"
              onClick={payNow}
              isLoading={isPaying}
              isDisabled={!canPay}
            >
              Pay & Activate 
            </Button>

            {!canPay && restaurant.status !== "active" && (
              <Text fontSize="xs" color="whiteAlpha.600">
                Payment unlocks after platform approval.
              </Text>
            )}
          </Stack>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
