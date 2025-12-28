// src/pages/admin/AdminOnboarding.jsx
import { Box, Heading, Text, Button, Stack, Alert, AlertIcon, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext.jsx";
import { db
 } from "../../firebase";
import { ref, onValue, update } from "firebase/database";

export default function AdminOnboarding() {
  const { user } = useAuth();
  const toast = useToast();
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    const rRef = ref(db, `restaurants/${user.uid}`);
    return onValue(rRef, (snap) => setRestaurant(snap.val()));
  }, [user?.uid]);

  const status = restaurant?.status;

  const fakePay = async () => {
    if (!user?.uid) return;
    try {
      await update(ref(db, `restaurants/${user.uid}`), {
        status: "active",
        activatedAt: Date.now(),
        updatedAt: Date.now(),
      });
      toast({
        title: "Payment successful (demo)",
        description: "Your restaurant is now live.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (e) {
      toast({
        title: "Payment failed",
        description: "Try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box color="white">
      <Heading size="lg" mb={4}>
        Onboarding
      </Heading>

      {!restaurant ? (
        <Alert status="info" rounded="md">
          <AlertIcon />
          No restaurant found yet. Please complete the Restaurant setup first.
        </Alert>
      ) : (
        <Stack spacing={4}>
          {status === "pending_review" && (
            <Alert status="warning" rounded="md">
              <AlertIcon />
              Your application is pending review by Seb’s. You’ll be notified once approved.
            </Alert>
          )}

          {status === "approved_pending_payment" && (
            <>
              <Alert status="success" rounded="md">
                <AlertIcon />
                Approved! Next step: pay the onboarding/subscription fee to go live.
              </Alert>
              <Button onClick={fakePay} colorScheme="purple" w="fit-content">
                Pay now (demo)
              </Button>
              <Text fontSize="sm" color="whiteAlpha.700">
                Real apps would use Stripe or similar. For demo, this button activates your restaurant.
              </Text>
            </>
          )}

          {status === "active" && (
            <Alert status="success" rounded="md">
              <AlertIcon />
              Your restaurant is live You can now use the full dashboard.
            </Alert>
          )}

          {status === "rejected" && (
            <Alert status="error" rounded="md">
              <AlertIcon />
              Your application was rejected. Please update your details and resubmit.
            </Alert>
          )}
        </Stack>
      )}
    </Box>
  );
}


