import { Heading, Stack, FormControl, FormLabel, Input, Textarea, Button } from "@chakra-ui/react";
export default function Contact() {
  return (
    <Stack spacing={4} maxW="lg">
      <Heading>Contact</Heading>
      <FormControl isRequired>
        <FormLabel>Name</FormLabel>
        <Input placeholder="Your name" />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Email</FormLabel>
        <Input type="email" placeholder="you@example.com" />
      </FormControl>
      <FormControl>
        <FormLabel>Message</FormLabel>
        <Textarea rows={4} placeholder="Tell me about your project..." />
      </FormControl>
      <Button>Send</Button>
    </Stack>
  );
}
