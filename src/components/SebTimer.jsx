import { Box, Text, VStack, HStack, Button } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";

/**
 * SebTimer
 * - autoStart (default true)
 * - onExpire() called when timer hits 0
 */
export default function SebTimer({
  totalSeconds = 120, // 2 minutes default
  title = "Booking Timer",
  subtitle = "Waiting for restaurant response",
  size = 260,
  autoStart = true,
  onExpire,
}) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(autoStart);

  // reset if totalSeconds changes
  useEffect(() => {
    setSecondsLeft(totalSeconds);
    setRunning(autoStart);
  }, [totalSeconds, autoStart]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (secondsLeft === 0) {
      setRunning(false);
      onExpire?.();
    }
  }, [secondsLeft, onExpire]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const progress = useMemo(() => {
    if (totalSeconds <= 0) return 0;
    return (secondsLeft / totalSeconds) * 100;
  }, [secondsLeft, totalSeconds]);

  const r = (size - 24) / 2;
  const c = 2 * Math.PI * r;
  const dash = (progress / 100) * c;

  return (
    <Box
      bg="rgba(255,255,255,0.06)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      rounded="2xl"
      p={6}
      w="fit-content"
      boxShadow="0 25px 70px rgba(0,0,0,0.45)"
      backdropFilter="blur(10px)"
    >
      <VStack spacing={4}>
        <VStack spacing={0}>
          <Text fontWeight="semibold" letterSpacing="0.06em">
            {title}
          </Text>
          <Text fontSize="sm" color="whiteAlpha.700">
            {subtitle}
          </Text>
        </VStack>

        <Box position="relative" w={`${size}px`} h={`${size}px`}>
          <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="12"
              fill="transparent"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke="rgba(255, 226, 160, 0.95)"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={`${dash} ${c - dash}`}
              strokeLinecap="round"
            />
          </svg>

          <VStack position="absolute" inset={0} align="center" justify="center" spacing={1}>
            <Text fontSize="52px" fontWeight="700" letterSpacing="0.02em">
              {mm}:{ss}
            </Text>
            <Text fontSize="xs" color="whiteAlpha.700">
              Auto-expires if no response
            </Text>
          </VStack>
        </Box>

        <HStack spacing={3}>
        </HStack>
      </VStack>
    </Box>
  );
}
