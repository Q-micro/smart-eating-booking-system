// src/pages/SignupOwner.jsx
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
  Badge,
  useToast,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

import { db, auth } from "../../firebase";
import { ref, set } from "firebase/database";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

// background image
const ownerBg = "src/assets/owner_login.jpg";

export default function SignupOwner() {
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

  const isValidEmail = (v) => /\S+@\S+\.\S+/.test(v);
  const isStrongPassword = (v) =>
    v.length >= 8 && /[A-Za-z]/.test(v) && /[0-9]/.test(v);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Contact name is required.";
    if (!email) e.email = "Business email is required.";
    else if (!isValidEmail(email)) e.email = "Invalid email.";
    if (!password) e.password = "Password is required.";
    else if (!isStrongPassword(password))
      e.password = "Min 8 chars with a number.";
    if (!confirm) e.confirm = "Confirm your password.";
    else if (confirm !== password) e.confirm = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
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

      await updateProfile(cred.user, { displayName: name.trim() });

      await set(ref(db, `users/${cred.user.uid}`), {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: "owner",
        createdAt: Date.now(),
      });

      toast({
        title: "Business account created",
        description: "Next step: create your restaurant",
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      navigate("/admin");
    } catch (err) {
      toast({
        title: "Signup failed",
        description: err.message,
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
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      bgImage={`url(${ownerBg})`}
      bgSize="cover"
      bgPos="center"
      bgRepeat="no-repeat"
      px={4}
      py={{ base: 10, md: 14 }}
      overflowY="auto"
    >
      {/* Dark overlay */}
      <Box position="absolute" inset={0} bg="blackAlpha.700" />

      <Box
        as="form"
        onSubmit={handleSubmit}
        maxW="480px"
        w="100%"
        p={8}
        position="relative"
        zIndex={1}
        bg="#585454b0"
        border="1px solid"
        borderColor="whiteAlpha.300"
        rounded="xl"
        boxShadow="2xl"
      >
        <Stack spacing={6}>
          <Stack spacing={3}>
            <Badge
              bg="#0a4757dc"
              color="white"
              w="fit-content"
              px={3}
              py={1}
              rounded="full"
              fontSize="0.7rem"
              letterSpacing="wide"
            >
              BUSINESS ACCOUNT
            </Badge>

            <Heading size="lg" color="white">
              Restaurant owner signup
            </Heading>
            <Text fontSize="sm" color="whiteAlpha.800">
              Manage reservations, tables, and availability
            </Text>
          </Stack>

          <FormControl isInvalid={errors.name}>
            <FormLabel color="whiteAlpha.900">Contact name</FormLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              bg="whiteAlpha.200"
              borderColor="whiteAlpha.300"
              _hover={{ borderColor: "whiteAlpha.500" }}
              _focus={{ borderColor: "whiteAlpha.600" }}
              color="white"
            />
            <FormErrorMessage>{errors.name}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.email}>
            <FormLabel color="whiteAlpha.900">Business email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              bg="whiteAlpha.200"
              borderColor="whiteAlpha.300"
              _hover={{ borderColor: "whiteAlpha.500" }}
              _focus={{ borderColor: "whiteAlpha.600" }}
              color="white"
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.password}>
            <FormLabel color="whiteAlpha.900">Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                bg="whiteAlpha.200"
                borderColor="whiteAlpha.300"
                _hover={{ borderColor: "whiteAlpha.500" }}
                _focus={{ borderColor: "whiteAlpha.600" }}
                color="white"
              />
              <InputRightElement>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                  color="white"
                >
                  {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.confirm}>
            <FormLabel color="whiteAlpha.900">Confirm password</FormLabel>
            <Input
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              bg="whiteAlpha.200"
              borderColor="whiteAlpha.300"
              _hover={{ borderColor: "whiteAlpha.500" }}
              _focus={{ borderColor: "whiteAlpha.600" }}
              color="white"
            />
            <FormErrorMessage>{errors.confirm}</FormErrorMessage>
          </FormControl>

          {/*Submit Button  */}
          <Button
            type="submit"
            size="lg"
            bg="#180d0db0"
            color="white"
            border="1px solid"
            borderColor="whiteAlpha.300"
            boxShadow="lg"
            _hover={{ bg: "brown.600", transform: "translateY(-1px)" }}
            _active={{ bg: "brown.800", transform: "translateY(0px)" }}
            isLoading={isSubmitting}
          >
            Create business account
          </Button>

          <Text fontSize="sm" textAlign="center" color="whiteAlpha.800">
            Just a customer?{" "}
            <Link as={RouterLink} to="/signup" color="blue.200">
              Create a customer account
            </Link>
          </Text>
        </Stack>
      </Box>
    </Box>
  );
}
