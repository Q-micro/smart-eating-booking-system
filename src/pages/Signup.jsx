// src/pages/Signup.jsx
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
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

import { db, auth } from "../firebase";
import { ref, set } from "firebase/database";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

// ✅ Import images so Vite serves the real high-quality asset paths
import homeBg from "../assets/home.webp";
import ownerBg from "../assets/owner_login.jpg";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Owner pages use owner background (works for /register-owner and any path containing "owner")
  const isOwnerFlow = location.pathname.includes("owner");
  const backgroundImage = isOwnerFlow ? ownerBg : homeBg;

  const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);
  const isStrongPassword = (value) =>
    value.length >= 8 && /[A-Za-z]/.test(value) && /[0-9]/.test(value);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required.";
    if (!email) newErrors.email = "Email is required.";
    else if (!isValidEmail(email))
      newErrors.email = "Please enter a valid email address.";

    if (!password) newErrors.password = "Password is required.";
    else if (!isStrongPassword(password))
      newErrors.password =
        "Password must be at least 8 characters and include a number.";

    if (!confirm) newErrors.confirm = "Please confirm your password.";
    else if (confirm !== password)
      newErrors.confirm = "Passwords do not match.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const firebaseUser = cred.user;

      await updateProfile(firebaseUser, {
        displayName: name.trim(),
      });

      await set(ref(db, `users/${firebaseUser.uid}`), {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: "customer",
        createdAt: Date.now(),
      });

      toast({
        title: "Account created",
        description: "You can now sign in.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      navigate("/login");
    } catch (error) {
      let description = "Something went wrong.";
      if (error.code === "auth/email-already-in-use")
        description = "This email is already in use.";

      toast({
        title: "Signup failed",
        description,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      minH="100vh"
      bgImage={`url(${backgroundImage})`}
      bgSize="cover"
      bgPos="center"
      bgRepeat="no-repeat"
      bgAttachment="fixed"
      position="relative"
      overflowY="auto"
      py={{ base: 10, md: 14 }}
      px={4}
    >
      {/* Dark overlay (nice darker light) */}
      <Box position="absolute" inset={0} bg="blackAlpha.700" />

      <Box
        position="relative"
        zIndex={1}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box
          as="form"
          onSubmit={handleSubmit}
          w="100%"
          maxW="460px"
          bg="blackAlpha.800"
          border="1px solid"
          borderColor="whiteAlpha.200"
          rounded="xl"
          p={{ base: 6, md: 8 }}
          boxShadow="2xl"
        >
          <Stack spacing={6}>
            <Stack spacing={2}>
              <Heading size="lg">Create an account</Heading>
              <Text fontSize="sm" color="neutral.200">
                Join Seb’s and enjoy a tailored experience.
              </Text>
            </Stack>

            <Stack spacing={4}>
              <FormControl isInvalid={!!errors.name}>
                <FormLabel>Name</FormLabel>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.password}>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <InputRightElement>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.confirm}>
                <FormLabel>Confirm password</FormLabel>
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                <FormErrorMessage>{errors.confirm}</FormErrorMessage>
              </FormControl>

              <Button colorScheme="brand" type="submit" isLoading={isSubmitting}>
                Create account
              </Button>
            </Stack>

            {/* 🔥 NEW OWNER LINK */}
            <Text fontSize="sm" color="neutral.200" textAlign="center">
              Own a restaurant?{" "}
              <Link
                as={RouterLink}
                to="/register-owner"
                color="brand.400"
                fontWeight="medium"
              >
                Register your business
              </Link>
            </Text>

            <Text fontSize="sm" color="neutral.200" textAlign="center">
              Already have an account?{" "}
              <Link as={RouterLink} to="/login" color="brand.400">
                Sign in
              </Link>
            </Text>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
