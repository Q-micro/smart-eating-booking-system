// src/pages/Login.jsx
import {
  Box,
  Heading,
  Text,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Link,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  useToast,
  Badge,
  HStack,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { FcGoogle } from "react-icons/fc";

// Firebase
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { ref, get, set, update } from "firebase/database";

// ✅ Import images so Vite serves the real high-quality asset paths
import homeBg from "../assets/home.webp";
import ownerBg from "../assets/owner_login.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = "Email is required.";
    if (!password) newErrors.password = "Password is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const redirectByRole = (role) => {
    if (role === "platform_admin") {
      navigate("/sebs-admin", { replace: true });
    } else if (role === "owner") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  const ensureUserProfile = async (firebaseUser) => {
    const userRef = ref(db, `users/${firebaseUser.uid}`);
    const snap = await get(userRef);
    const existing = snap.val();

    // Create profile if first time signing in with Google
    if (!existing) {
      const profile = {
        name: firebaseUser.displayName || "User",
        email: (firebaseUser.email || "").toLowerCase(),
        role: "customer",
        createdAt: Date.now(),
        provider: "google",
      };
      await set(userRef, profile);
      return profile;
    }

    // Optional: keep name/email in sync (non-destructive)
    const patch = {};
    if (!existing.email && firebaseUser.email)
      patch.email = firebaseUser.email.toLowerCase();
    if (!existing.name && firebaseUser.displayName)
      patch.name = firebaseUser.displayName;
    if (Object.keys(patch).length) await update(userRef, patch);

    return existing;
  };

  const handleGoogle = async () => {
    setIsGoogleSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      // Optional: force account chooser every time
      // provider.setCustomParameters({ prompt: "select_account" });

      const cred = await signInWithPopup(auth, provider);
      const firebaseUser = cred.user;

      const profile = await ensureUserProfile(firebaseUser);
      const role = profile.role || "customer";

      toast({
        title: "Signed in with Google.",
        description: "Welcome to Seb's.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      redirectByRole(role);
    } catch (error) {
      console.error("Google login error:", error);

      let description = "Could not sign in with Google.";
      if (error.code === "auth/popup-closed-by-user") {
        description = "Popup closed before completing sign-in.";
      } else if (error.code === "auth/cancelled-popup-request") {
        description = "Popup request cancelled. Try again.";
      } else if (error.code === "auth/popup-blocked") {
        description = "Popup blocked by the browser. Allow popups and try again.";
      }

      toast({
        title: "Google sign-in failed.",
        description,
        status: "error",
        duration: 4000,
        isClosable: true,
      });

      toast({
        title: "Google sign-in failed.",
        description: `${error.code || "unknown"} — ${error.message || ""}`,
        status: "error",
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const firebaseUser = cred.user;

      const snap = await get(ref(db, `users/${firebaseUser.uid}`));
      const profile = snap.val() || {};
      const role = profile.role || "customer";

      toast({
        title: "Signed in.",
        description: "Welcome back to Seb's.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      redirectByRole(role);
    } catch (error) {
      console.error("Login error:", error);

      let description = "Invalid email or password.";
      if (error.code === "auth/user-not-found")
        description = "No account found with this email.";
      else if (error.code === "auth/wrong-password")
        description = "Incorrect password.";
      else if (error.code === "auth/too-many-requests")
        description = "Too many attempts. Try again later.";
      else if (error.code === "auth/invalid-email")
        description = "Invalid email address.";

      toast({
        title: "Login failed.",
        description,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Owner background if route contains "owner"
  const isOwnerLogin = location.pathname.includes("owner");
  const backgroundImage = isOwnerLogin ? ownerBg : homeBg;

  return (
    <Box
      minH="100vh"
      bgImage={`url(${backgroundImage})`}
      bgSize="cover"
      bgPos="center"
      bgRepeat="no-repeat"
      bgAttachment="fixed"
      position="relative"
      overflow="hidden"
      px={4}
    >
      {/* Dark overlay */}
      <Box position="absolute" inset={0} bg="blackAlpha.700" />

      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        zIndex={1}
      >
        <Box
          as="form"
          onSubmit={handleSubmit}
          w="100%"
          maxW="420px"
          bg="rgba(21, 19, 19, 0.95)"
          border="1px solid"
          borderColor="whiteAlpha.200"
          rounded="xl"
          p={{ base: 6, md: 8 }}
          boxShadow="2xl"
        >
          <Stack spacing={6}>
            <Stack spacing={2}>
              <HStack justify="space-between" align="center">
                <Heading size="lg">Sign In</Heading>
              </HStack>
              <Text color="neutral.200" fontSize="sm">
                Welcome back. Enter your details to continue.
              </Text>
            </Stack>

            <Button
              w="100%"
              variant="outline"
              bg="rgba(104, 98, 98, 0.95)"
              borderColor="whiteAlpha.300"
              leftIcon={<FcGoogle />}
              _hover={{ bg: "whiteAlpha.100" }}
              onClick={handleGoogle}
              isLoading={isGoogleSubmitting}
            >
              Continue with Google
            </Button>

            <Stack spacing={4}>
              <FormControl isInvalid={!!errors.email}>
                <FormLabel fontSize="sm">Email</FormLabel>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  bg="blackAlpha.500"
                  borderColor="whiteAlpha.300"
                  _hover={{ borderColor: "whiteAlpha.500" }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && (
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl isInvalid={!!errors.password}>
                <FormLabel fontSize="sm">Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    bg="blackAlpha.500"
                    borderColor="whiteAlpha.300"
                    _hover={{ borderColor: "whiteAlpha.500" }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <InputRightElement>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                {errors.password && (
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                )}
              </FormControl>

              <Button
                colorScheme="brand"
                size="md"
                mt={2}
                type="submit"
                isLoading={isSubmitting}
              >
                Sign In
              </Button>
            </Stack>

            <Text fontSize="sm" color="neutral.200">
              New here?{" "}
              <Link
                as={RouterLink}
                to="/signup"
                color="brand.400"
                fontWeight="medium"
              >
                Create an account
              </Link>
            </Text>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
