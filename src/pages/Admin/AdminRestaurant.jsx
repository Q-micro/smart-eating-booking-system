// // src/pages/admin/AdminRestaurant.jsx
// import {
//   Box,
//   Heading,
//   Text,
//   Stack,
//   SimpleGrid,
//   FormControl,
//   FormLabel,
//   Input,
//   Textarea,
//   Select,
//   Button,
//   HStack,
//   Divider,
//   Badge,
//   useToast,
//   FormErrorMessage,
//   RadioGroup,
//   Radio,
//   Progress,
//   Checkbox,
//   CheckboxGroup,
//   Wrap,
//   WrapItem,
// } from "@chakra-ui/react";
// import { useMemo, useState, useEffect } from "react";
// import { useAuth } from "../../auth/AuthContext.jsx";
// import { db, storage } from "../../firebase";
// import { ref as dbRef, set, onValue, update } from "firebase/database";
// import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

// // ✅ IMPORTANT: this should be your grid editor component (we fix it below)
// import AdminTableLayout from "./AdminTableLayout.jsx";

// const isValidEmail = (v) => /\S+@\S+\.\S+/.test(v);
// const isValidUrlLoose = (v) => {
//   if (!v?.trim()) return true;
//   try {
//     const withProto = v.startsWith("http") ? v : `https://${v}`;
//     new URL(withProto);
//     return true;
//   } catch {
//     return false;
//   }
// };

// const DESCRIPTION_MAX = 800;

// const DAYS = [
//   { key: "mon", label: "Mon" },
//   { key: "tue", label: "Tue" },
//   { key: "wed", label: "Wed" },
//   { key: "thu", label: "Thu" },
//   { key: "fri", label: "Fri" },
//   { key: "sat", label: "Sat" },
//   { key: "sun", label: "Sun" },
// ];

// const defaultHours = DAYS.reduce((acc, d) => {
//   acc[d.key] = { closed: false, open: "12:00", close: "23:00" };
//   return acc;
// }, {});

// const cuisineOptions = [
//   "Bahraini",
//   "Gulf / Khaleeji",
//   "Middle Eastern",
//   "Lebanese",
//   "Turkish",
//   "Persian / Iranian",
//   "Iraqi",
//   "Egyptian",
//   "Moroccan",
//   "Yemeni",
//   "Indian",
//   "Pakistani",
//   "Bangladeshi",
//   "Sri Lankan",
//   "Nepalese",
//   "Chinese",
//   "Japanese",
//   "Korean",
//   "Thai",
//   "Vietnamese",
//   "Asian Fusion",
//   "Italian",
//   "French",
//   "American",
//   "Mexican",
//   "Seafood",
//   "Steakhouse",
//   "Cafe",
//   "Breakfast / Brunch",
//   "Desserts",
//   "Healthy / Fitness",
//   "Vegan",
//   "Vegetarian",
//   "International",
//   "Other",
// ];

// const featureOptions = [
//   "Parking",
//   "Valet",
//   "Wheelchair accessible",
//   "Outdoor seating",
//   "Indoor seating",
//   "Smoking area",
//   "Kids meals",
//   "High chairs",
//   "Pet friendly",
//   "Free Wi-Fi",
//   "Live music",
//   "Sports screening (TV)",
//   "Private rooms",
//   "Takeaway",
//   "Delivery",
//   "Reservations recommended",
//   "Accepts cards",
//   "Apple Pay / Contactless",
//   "Halal options",
//   "Vegan options",
//   "Vegetarian options",
//   "Gluten-free options",
// ];

// function Card({ title, subtitle, children }) {
//   return (
//     <Box
//       bg="whiteAlpha.50"
//       border="1px solid"
//       borderColor="whiteAlpha.200"
//       rounded="2xl"
//       p={{ base: 4, md: 5 }}
//     >
//       <HStack justify="space-between" mb={3} flexWrap="wrap" gap={2}>
//         <Box>
//           <Heading size="sm">{title}</Heading>
//           {subtitle && (
//             <Text fontSize="sm" color="whiteAlpha.700">
//               {subtitle}
//             </Text>
//           )}
//         </Box>
//       </HStack>
//       {children}
//     </Box>
//   );
// }

// export default function AdminRestaurant() {
//   const { user } = useAuth();
//   const toast = useToast();

//   // ✅ STEPS (inside component!)
//   const [step, setStep] = useState(1); // 1 = info, 2 = table layout

//   // plan
//   const [plan, setPlan] = useState("basic");

//   // existing fields
//   const [name, setName] = useState("");
//   const [cuisine, setCuisine] = useState("");
//   const [description, setDescription] = useState("");
//   const [phone, setPhone] = useState("");
//   const [contactEmail, setContactEmail] = useState("");
//   const [address, setAddress] = useState("");
//   const [crNumber, setCrNumber] = useState("");

//   // new fields
//   const [priceRange, setPriceRange] = useState("$$");
//   const [agePreference, setAgePreference] = useState("all");
//   const [restaurantType, setRestaurantType] = useState("casual");
//   const [features, setFeatures] = useState([]);

//   const [googleMapsUrl, setGoogleMapsUrl] = useState("");
//   const [instagram, setInstagram] = useState("");
//   const [tiktok, setTiktok] = useState("");
//   const [website, setWebsite] = useState("");
//   const [operatingHours, setOperatingHours] = useState(defaultHours);

//   // uploads
//   const [photos, setPhotos] = useState([]); // File[]
//   const [menuFile, setMenuFile] = useState(null); // File | null

//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [uploadPct, setUploadPct] = useState(0);

//   const planCards = useMemo(
//     () => [
//       {
//         key: "basic",
//         title: "Basic",
//         price: "BD 20 / month",
//         bullets: [
//           "Verified listing on Seb’s",
//           "Reservations dashboard",
//           "Profile, photos, menu",
//           "Map + social links",
//           "custom table floor map"
//         ],
//       },
//       {
//         key: "premium",
//         title: "Premium",
//         price: "BD 45 / month",
//         bullets: [
//           "Everything in Basic",
//           "Premium badge",
//           "Priority placement",
//           "360° table views",
//           "Events Page",
//           "Data Analysis"
//         ],
//       },
//     ],
//     []
//   );


// // ✅ autosave draft so Back doesn't lose data
// useEffect(() => {
//   if (!user?.uid) return;

//   const draftPayload = {
//     name,
//     cuisine,
//     description,
//     phone,
//     contactEmail,
//     address,
//     crNumber,
//     priceRange,
//     agePreference,
//     restaurantType,
//     features,
//     operatingHours,
//     plan,
//     links: {
//       googleMapsUrl,
//       instagram,
//       tiktok,
//       website,
//     },
//     draftUpdatedAt: Date.now(),
//   };

//   const t = setTimeout(() => {
//     update(dbRef(db, `restaurants/${user.uid}`), draftPayload).catch(() => {});
//   }, 500); // debounce typing

//   return () => clearTimeout(t);
// }, [
//   user?.uid,
//   name,
//   cuisine,
//   description,
//   phone,
//   contactEmail,
//   address,
//   crNumber,
//   priceRange,
//   agePreference,
//   restaurantType,
//   features,
//   operatingHours,
//   plan,
//   googleMapsUrl,
//   instagram,
//   tiktok,
//   website,
// ]);




//   // ✅ Load existing restaurant data (so editing works)
//   useEffect(() => {
//     if (!user?.uid) return;

//     const rRef = dbRef(db, `restaurants/${user.uid}`);
//     const unsub = onValue(rRef, (snap) => {
//       const data = snap.val();
//       if (!data) return;

//       setPlan(data.plan || "basic");
//       setName(data.name || "");
//       setCuisine(data.cuisine || "");
//       setDescription(data.description || "");
//       setPhone(data.phone || "");
//       setContactEmail(data.contactEmail || "");
//       setAddress(data.address || "");
//       setCrNumber(data.crNumber || "");
//       setPriceRange(data.priceRange || "$$");
//       setAgePreference(data.agePreference || "all");
//       setRestaurantType(data.restaurantType || "casual");
//       setFeatures(Array.isArray(data.features) ? data.features : []);
//       setGoogleMapsUrl(data.links?.googleMapsUrl || "");
//       setInstagram(data.links?.instagram || "");
//       setTiktok(data.links?.tiktok || "");
//       setWebsite(data.links?.website || "");
//       setOperatingHours(data.operatingHours || defaultHours);
//     });

//     return () => unsub();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user?.uid]);

//   // ✅ Save plan immediately (so table layout knows premium/basic)
//   useEffect(() => {
//     if (!user?.uid) return;
//     update(dbRef(db, `restaurants/${user.uid}`), {
//       plan,
//       updatedAt: Date.now(),
//     }).catch(() => {});
//   }, [plan, user?.uid]);

//   const validateStep1 = () => {
//     const next = {};

//     if (!name.trim()) next.name = "Restaurant name is required.";
//     if (!cuisine) next.cuisine = "Cuisine is required.";
//     if (!description.trim()) next.description = "Description is required.";
//     if (description.length > DESCRIPTION_MAX)
//       next.description = `Max ${DESCRIPTION_MAX} characters.`;

//     if (!phone.trim()) next.phone = "Phone is required.";
//     if (contactEmail && !isValidEmail(contactEmail))
//       next.contactEmail = "Invalid email format.";

//     if (googleMapsUrl && !isValidUrlLoose(googleMapsUrl))
//       next.googleMapsUrl = "Invalid URL.";
//     if (instagram && !isValidUrlLoose(instagram)) next.instagram = "Invalid URL.";
//     if (tiktok && !isValidUrlLoose(tiktok)) next.tiktok = "Invalid URL.";
//     if (website && !isValidUrlLoose(website)) next.website = "Invalid URL.";

//     // operating hours sanity
//     for (const d of DAYS) {
//       const v = operatingHours?.[d.key];
//       if (!v) continue;
//       if (!v.closed && (!v.open || !v.close)) {
//         next.operatingHours = "Please set opening and closing times for all open days.";
//         break;
//       }
//     }

//     if (!photos?.length) next.photos = "Please upload at least 1 photo.";

//     setErrors(next);
//     return Object.keys(next).length === 0;
//   };

//   const uploadOneFile = async (file, path) => {
//     const sRef = storageRef(storage, path);
//     await uploadBytes(sRef, file);
//     return await getDownloadURL(sRef);
//   };

//   const handleSubmitForReview = async () => {
//     if (!user?.uid) return;

//     // optional: you can require step 2 has at least 1 table
//     // but for now we just submit

//     setIsSubmitting(true);
//     setUploadPct(0);

//     try {
//       // Upload photos
//       const photoUrls = [];
//       for (let i = 0; i < photos.length; i++) {
//         const f = photos[i];
//         const url = await uploadOneFile(
//           f,
//           `restaurants/${user.uid}/photos/${Date.now()}_${i}_${f.name}`
//         );
//         photoUrls.push(url);
//         setUploadPct(Math.round(((i + 1) / (photos.length + (menuFile ? 1 : 0))) * 100));
//       }

//       // Upload menu (optional)
//       let menuUrl = null;
//       if (menuFile) {
//         menuUrl = await uploadOneFile(
//           menuFile,
//           `restaurants/${user.uid}/menu/${Date.now()}_${menuFile.name}`
//         );
//         setUploadPct(100);
//       }

//       const payload = {
//         name: name.trim(),
//         cuisine,
//         description: description.trim(),
//         phone: phone.trim(),
//         contactEmail: contactEmail.trim() || null,
//         address: address.trim() || null,
//         crNumber: crNumber.trim() || null,

//         priceRange,
//         agePreference,
//         restaurantType,
//         features,

//         links: {
//           googleMapsUrl: googleMapsUrl.trim() || null,
//           instagram: instagram.trim() || null,
//           tiktok: tiktok.trim() || null,
//           website: website.trim() || null,
//         },

//         operatingHours,
//         plan,

//         photos: photoUrls,
//         menuUrl,

//         status: "pending_review",
//         updatedAt: Date.now(),
//         createdAt: Date.now(),
//       };

//       await update(dbRef(db, `restaurants/${user.uid}`), payload);

//       toast({
//         title: "Submitted for review ✅",
//         description: "We’ll review your application and notify you.",
//         status: "success",
//         duration: 3500,
//         isClosable: true,
//       });

//       // optional: go back to welcome or onboarding
//       // setStep(1);
//     } catch (err) {
//       console.error(err);
//       toast({
//         title: "Submit failed",
//         description: err?.message || "Please try again.",
//         status: "error",
//         duration: 3500,
//         isClosable: true,
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <Box color="white">
//       <HStack justify="space-between" mb={4} flexWrap="wrap" gap={2}>
//         <Box>
//           <Heading size="lg">Restaurant Application</Heading>
//           <Text color="whiteAlpha.700">
//             Submit your details for verification. Seb&apos;s will review before your listing goes live.
//           </Text>
//         </Box>

//         <Badge bg="whiteAlpha.200" px={3} py={1} rounded="full">
//           Step {step} of 2
//         </Badge>
//       </HStack>

//       <Progress
//         value={step === 1 ? 50 : 100}
//         borderRadius="full"
//         mb={5}
//         bg="whiteAlpha.200"
//       />

//       {/* ================= STEP 1 ================= */}
//       {step === 1 && (
//         <Stack spacing={4}>
//           <Card title="Choose your plan" subtitle="You’ll pay only after approval.">
//             <RadioGroup value={plan} onChange={setPlan}>
//               <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
//                 {planCards.map((p) => {
//                   const active = plan === p.key;
//                   return (
//                     <Box
//                       key={p.key}
//                       border="1px solid"
//                       borderColor={active ? "blue.300" : "whiteAlpha.200"}
//                       bg={active ? "blue.900" : "whiteAlpha.50"}
//                       rounded="2xl"
//                       p={4}
//                       cursor="pointer"
//                       onClick={() => setPlan(p.key)}
//                     >
//                       <HStack justify="space-between" mb={2}>
//                         <Heading size="md">{p.title}</Heading>
//                         {active && (
//                           <Badge colorScheme="blue" rounded="full" px={3}>
//                             SELECTED
//                           </Badge>
//                         )}
//                       </HStack>
//                       <Text fontWeight="bold" mb={3}>
//                         {p.price}
//                       </Text>
//                       <Stack spacing={1}>
//                         {p.bullets.map((b) => (
//                           <Text key={b} fontSize="sm" color="whiteAlpha.800">
//                             • {b}
//                           </Text>
//                         ))}
//                       </Stack>
//                     </Box>
//                   );
//                 })}
//               </SimpleGrid>
//             </RadioGroup>
//           </Card>

//           <Card title="Restaurant details" subtitle="The essentials customers will see.">
//             <Stack spacing={4}>
//               <FormControl isInvalid={!!errors.name}>
//                 <FormLabel>Restaurant name</FormLabel>
//                 <Input value={name} onChange={(e) => setName(e.target.value)} />
//                 <FormErrorMessage>{errors.name}</FormErrorMessage>
//               </FormControl>

//               <FormControl isInvalid={!!errors.cuisine}>
//                 <FormLabel>Cuisine</FormLabel>
//                <Select
//   placeholder="Select cuisine"
//   value={cuisine}
//   onChange={(e) => setCuisine(e.target.value)}
//   bg="blackAlpha.700"
//   borderColor="whiteAlpha.300"
//   color="white"
//   sx={{ option: { color: "black" } }}
// >
//   {cuisineOptions.map((c) => (
//     <option key={c} value={c}>
//       {c}
//     </option>
//   ))}
// </Select>

//                 <FormErrorMessage>{errors.cuisine}</FormErrorMessage>
//               </FormControl>

//               <FormControl isInvalid={!!errors.description}>
//                 <FormLabel>Description</FormLabel>
//                 <Textarea
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                   rows={5}
//                 />
//                 <HStack justify="space-between" mt={1}>
//                   <Text fontSize="xs" color="whiteAlpha.700">
//                     {description.length}/{DESCRIPTION_MAX}
//                   </Text>
//                   <FormErrorMessage>{errors.description}</FormErrorMessage>
//                 </HStack>
//               </FormControl>

//               <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
//                 <FormControl isInvalid={!!errors.phone}>
//                   <FormLabel>Phone</FormLabel>
//                   <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
//                   <FormErrorMessage>{errors.phone}</FormErrorMessage>
//                 </FormControl>

//                 <FormControl isInvalid={!!errors.contactEmail}>
//                   <FormLabel>Contact email (optional)</FormLabel>
//                   <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
//                   <FormErrorMessage>{errors.contactEmail}</FormErrorMessage>
//                 </FormControl>
//               </SimpleGrid>

//               <FormControl>
//                 <FormLabel>Address (optional)</FormLabel>
//                 <Input value={address} onChange={(e) => setAddress(e.target.value)} />
//               </FormControl>

//               <FormControl>
//                 <FormLabel>CR number (optional)</FormLabel>
//                 <Input value={crNumber} onChange={(e) => setCrNumber(e.target.value)} />
//               </FormControl>

//               <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
//                 <FormControl>
//                   <FormLabel>Price range</FormLabel>
//                   <Select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}
//                      bg="blackAlpha.700"
//   borderColor="whiteAlpha.300"
//   color="white"
//   sx={{ option: { color: "black" } }}>
//                     <option value="$">$</option>
//                     <option value="$$">$$</option>
//                     <option value="$$$">$$$</option>
//                     <option value="$$$$">$$$$</option>
//                   </Select>
//                 </FormControl>

//                 <FormControl>
//                   <FormLabel>Age preference</FormLabel>
//                   <Select value={agePreference} onChange={(e) => setAgePreference(e.target.value)}
//                      bg="blackAlpha.700"
//   borderColor="whiteAlpha.300"
//   color="white"
//   sx={{ option: { color: "black" } }}>
//                     <option value="all">All ages</option>
//                     <option value="family">Family-friendly</option>
//                     <option value="adults">Adults only</option>
//                     <option value="18+">18+</option>
//                     <option value="21+">21+</option>
//                   </Select>
//                 </FormControl>

//                 <FormControl>
//                   <FormLabel>Restaurant type</FormLabel>
//                   <Select value={restaurantType} onChange={(e) => setRestaurantType(e.target.value)}
//                      bg="blackAlpha.700"
//   borderColor="whiteAlpha.300"
//   color="white"
//   sx={{ option: { color: "black" } }}>
//                     <option value="casual">Casual</option>
//                     <option value="family">Family-friendly</option>
//                     <option value="fine">Fine dining</option>
//                     <option value="cafe">Cafe</option>
//                     <option value="fast-casual">Fast casual</option>
//                     <option value="date-night">Date night</option>
//                     <option value="business">Business</option>
//                     <option value="buffet">Buffet</option>
//                     <option value="other">Other</option>
//                   </Select>
//                 </FormControl>
//               </SimpleGrid>
//             </Stack>
//           </Card>

//           <Card title="Links" subtitle="Optional, but strongly recommended.">
//             <Stack spacing={4}>
//               <FormControl isInvalid={!!errors.googleMapsUrl}>
//                 <FormLabel>Google Maps URL</FormLabel>
//                 <Input value={googleMapsUrl} onChange={(e) => setGoogleMapsUrl(e.target.value)} />
//                 <FormErrorMessage>{errors.googleMapsUrl}</FormErrorMessage>
//               </FormControl>

//               <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
//                 <FormControl isInvalid={!!errors.instagram}>
//                   <FormLabel>Instagram</FormLabel>
//                   <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} />
//                   <FormErrorMessage>{errors.instagram}</FormErrorMessage>
//                 </FormControl>

//                 <FormControl isInvalid={!!errors.tiktok}>
//                   <FormLabel>TikTok</FormLabel>
//                   <Input value={tiktok} onChange={(e) => setTiktok(e.target.value)} />
//                   <FormErrorMessage>{errors.tiktok}</FormErrorMessage>
//                 </FormControl>

//                 <FormControl isInvalid={!!errors.website}>
//                   <FormLabel>Website</FormLabel>
//                   <Input value={website} onChange={(e) => setWebsite(e.target.value)} />
//                   <FormErrorMessage>{errors.website}</FormErrorMessage>
//                 </FormControl>
//               </SimpleGrid>
//             </Stack>
//           </Card>

//           <Card title="Key features" subtitle="Helps customers filter and decide quickly.">
//             <FormControl>
//               <CheckboxGroup value={features} onChange={setFeatures}>
//                 <Wrap spacing={3}>
//                   {featureOptions.map((f) => (
//                     <WrapItem key={f}>
//                       <Checkbox value={f}>{f}</Checkbox>
//                     </WrapItem>
//                   ))}
//                 </Wrap>
//               </CheckboxGroup>
//             </FormControl>
//           </Card>

//           <Card title="Operating hours" subtitle="Set opening/closing times per day (or mark closed).">
//             {errors.operatingHours && (
//               <Text color="red.300" fontSize="sm" mb={2}>
//                 {errors.operatingHours}
//               </Text>
//             )}
// <HStack justify="space-between" flexWrap="wrap" gap={2} mb={3}>
//   <Text color="whiteAlpha.700" fontSize="sm">
//     Tip: set one day, then copy to all.
//   </Text>

//   <Button
//     size="sm"
//     variant="outline"
//     borderColor="whiteAlpha.300"
//     onClick={() => {
//       // take Monday as the template (or any day you want)
//       const template = operatingHours.mon;
//       setOperatingHours((prev) => {
//         const next = { ...prev };
//         for (const d of DAYS) next[d.key] = { ...template };
//         return next;
//       });
//     }}
//   >
//     Copy Mon → All days
//   </Button>
// </HStack>

//             <Stack spacing={3}>
//               {DAYS.map((d) => {
//                 const v = operatingHours[d.key];
//                 return (
//                   <Box
//                     key={d.key}
//                     bg="whiteAlpha.50"
//                     border="1px solid"
//                     borderColor="whiteAlpha.200"
//                     rounded="xl"
//                     p={3}
//                   >
//                     <HStack justify="space-between" flexWrap="wrap" gap={3}>
//                       <Text fontWeight="bold">{d.label}</Text>
//                       <Checkbox
//                         isChecked={v.closed}
//                         onChange={(e) =>
//                           setOperatingHours((prev) => ({
//                             ...prev,
//                             [d.key]: { ...prev[d.key], closed: e.target.checked },
//                           }))
//                         }
//                       >
//                         Closed
//                       </Checkbox>
//                     </HStack>

//                     {!v.closed && (
//                       <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mt={3}>
//                         <FormControl>
//                           <FormLabel fontSize="sm">Open</FormLabel>
//                           <Input
//                             type="time"
//                             value={v.open}
//                             onChange={(e) =>
//                               setOperatingHours((prev) => ({
//                                 ...prev,
//                                 [d.key]: { ...prev[d.key], open: e.target.value },
//                               }))
//                             }
//                             bg="whiteAlpha.50"
//                             borderColor="whiteAlpha.200"
//                           />
//                         </FormControl>

//                         <FormControl>
//                           <FormLabel fontSize="sm">Close</FormLabel>
//                           <Input
//                             type="time"
//                             value={v.close}
//                             onChange={(e) =>
//                               setOperatingHours((prev) => ({
//                                 ...prev,
//                                 [d.key]: { ...prev[d.key], close: e.target.value },
//                               }))
//                             }
//                             bg="whiteAlpha.50"
//                             borderColor="whiteAlpha.200"
//                           />
//                         </FormControl>
//                       </SimpleGrid>
//                     )}
//                   </Box>
//                 );
//               })}
//             </Stack>
//           </Card>

//           <Card title="Photos & menu" subtitle="Upload at least 1 photo. Menu PDF/image optional.">
//             <Stack spacing={4}>
//               <FormControl isInvalid={!!errors.photos}>
//                 <FormLabel>Restaurant photos</FormLabel>
//                 <Input
//                   type="file"
//                   accept="image/*"
//                   multiple
//                   p={1}
//                   onChange={(e) => setPhotos(Array.from(e.target.files || []))}
//                 />
//                 <FormErrorMessage>{errors.photos}</FormErrorMessage>
//                 {photos?.length > 0 && (
//                   <Text fontSize="xs" color="whiteAlpha.700" mt={1}>
//                     Selected: {photos.length} photo(s)
//                   </Text>
//                 )}
//               </FormControl>

//               <FormControl>
//                 <FormLabel>Menu file (optional)</FormLabel>
//                 <Input
//                   type="file"
//                   accept="application/pdf,image/*"
//                   p={1}
//                   onChange={(e) => setMenuFile(e.target.files?.[0] || null)}
//                 />
//                 {menuFile && (
//                   <Text fontSize="xs" color="whiteAlpha.700" mt={1}>
//                     Selected: {menuFile.name}
//                   </Text>
//                 )}
//               </FormControl>
//             </Stack>
//           </Card>

//           <Divider borderColor="whiteAlpha.200" />

//           <HStack justify="space-between" flexWrap="wrap" gap={3}>
//             <Text color="whiteAlpha.700" fontSize="sm">
//               Next: set up your table layout (Step 2).
//             </Text>

//             <Button
//               bg="blue.700"
//               _hover={{ bg: "blue.600" }}
//               onClick={() => {
//                 if (!validateStep1()) return;
//                 setStep(2);
//               }}
//             >
//               Next →
//             </Button>
//           </HStack>
//         </Stack>
//       )}

//       {/* ================= STEP 2 ================= */}
//       {step === 2 && (
//         <Stack spacing={4}>
//           <Card
//             title="Table Layout (Step 2)"
//             subtitle="Drag tables on the grid. Click any item to edit. Basic can’t upload 360°."
//           >
//             <AdminTableLayout isPremium={plan === "premium"} />
//           </Card>

//           {isSubmitting && (
//             <Box>
//               <Text fontSize="sm" color="whiteAlpha.700" mb={2}>
//                 Uploading…
//               </Text>
//               <Progress value={uploadPct} borderRadius="full" />
//             </Box>
//           )}

//           <Divider borderColor="whiteAlpha.200" />

//           <HStack justify="space-between" flexWrap="wrap" gap={3}>
//             <Button variant="outline" borderColor="whiteAlpha.300" onClick={() => setStep(1)}>
//               ← Back
//             </Button>

//             <Button
//               bg="blue.700"
//               _hover={{ bg: "blue.600" }}
//               onClick={handleSubmitForReview}
//               isLoading={isSubmitting}
//             >
//               Submit for review
//             </Button>
//           </HStack>
//         </Stack>
//       )}
//     </Box>
//   );
// }

// src/pages/admin/AdminRestaurant.jsx
import {
  Box,
  Heading,
  Text,
  Stack,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  HStack,
  Divider,
  Badge,
  useToast,
  FormErrorMessage,
  RadioGroup,
  Radio,
  Progress,
  Checkbox,
  CheckboxGroup,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useMemo, useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext.jsx";
import { db, storage } from "../../firebase";
import { ref as dbRef, set, onValue, update } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

// ✅ IMPORTANT: this should be your grid editor component (we fix it below)
import AdminTableLayout from "./AdminTableLayout";

const isValidEmail = (v) => /\S+@\S+\.\S+/.test(v);
const isValidUrlLoose = (v) => {
  if (!v?.trim()) return true;
  try {
    const withProto = v.startsWith("http") ? v : `https://${v}`;
    new URL(withProto);
    return true;
  } catch {
    return false;
  }
};

const DESCRIPTION_MAX = 800;

const DAYS = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

const defaultHours = DAYS.reduce((acc, d) => {
  acc[d.key] = { closed: false, open: "12:00", close: "23:00" };
  return acc;
}, {});

const cuisineOptions = [
  "Bahraini",
  "Gulf / Khaleeji",
  "Middle Eastern",
  "Lebanese",
  "Turkish",
  "Persian / Iranian",
  "Iraqi",
  "Egyptian",
  "Moroccan",
  "Yemeni",
  "Indian",
  "Pakistani",
  "Bangladeshi",
  "Sri Lankan",
  "Nepalese",
  "Chinese",
  "Japanese",
  "Korean",
  "Thai",
  "Vietnamese",
  "Asian Fusion",
  "Italian",
  "French",
  "American",
  "Mexican",
  "Seafood",
  "Steakhouse",
  "Cafe",
  "Breakfast / Brunch",
  "Desserts",
  "Healthy / Fitness",
  "Vegan",
  "Vegetarian",
  "International",
  "Other",
];

const featureOptions = [
  "Parking",
  "Valet",
  "Wheelchair accessible",
  "Outdoor seating",
  "Indoor seating",
  "Smoking area",
  "Kids meals",
  "High chairs",
  "Pet friendly",
  "Free Wi-Fi",
  "Live music",
  "Sports screening (TV)",
  "Private rooms",
  "Takeaway",
  "Delivery",
  "Reservations recommended",
  "Accepts cards",
  "Apple Pay / Contactless",
  "Halal options",
  "Vegan options",
  "Vegetarian options",
  "Gluten-free options",
];

function Card({ title, subtitle, children }) {
  return (
    <Box
      bg="whiteAlpha.50"
      border="1px solid"
      borderColor="whiteAlpha.200"
      rounded="2xl"
      p={{ base: 4, md: 5 }}
    >
      <HStack justify="space-between" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Heading size="sm">{title}</Heading>
          {subtitle && (
            <Text fontSize="sm" color="whiteAlpha.700">
              {subtitle}
            </Text>
          )}
        </Box>
      </HStack>
      {children}
    </Box>
  );
}

export default function AdminRestaurant() {
  const { user } = useAuth();
  const toast = useToast();

  // ✅ STEPS (inside component!)
  const [step, setStep] = useState(1); // 1 = info, 2 = table layout

  // plan
  const [plan, setPlan] = useState("basic");

  // existing fields
  const [name, setName] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [address, setAddress] = useState("");
  const [crNumber, setCrNumber] = useState("");

  // new fields
  const [priceRange, setPriceRange] = useState("$$");
  const [agePreference, setAgePreference] = useState("all");
  const [restaurantType, setRestaurantType] = useState("casual");
  const [features, setFeatures] = useState([]);

  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [website, setWebsite] = useState("");
  const [operatingHours, setOperatingHours] = useState(defaultHours);

  // uploads
  const [photos, setPhotos] = useState([]); // File[]
  const [menuFile, setMenuFile] = useState(null); // File | null

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);

  const planCards = useMemo(
    () => [
      {
        key: "basic",
        title: "Basic",
        price: "BD 20 / month",
        bullets: [
          "Verified listing on Seb’s",
          "Reservations dashboard",
          "Profile, photos, menu",
          "Map + social links",
          "custom table floor map"
        ],
      },
      {
        key: "premium",
        title: "Premium",
        price: "BD 45 / month",
        bullets: [
          "Everything in Basic",
          "Premium badge",
          "Priority placement",
          "360° table views",
          "Events Page",
          "Data Analysis"
        ],
      },
    ],
    []
  );


// ✅ autosave draft so Back doesn't lose data
useEffect(() => {
  if (!user?.uid) return;

  const draftPayload = {
    name,
    cuisine,
    description,
    phone,
    contactEmail,
    address,
    crNumber,
    priceRange,
    agePreference,
    restaurantType,
    features,
    operatingHours,
    plan,
    links: {
      googleMapsUrl,
      instagram,
      tiktok,
      website,
    },
    draftUpdatedAt: Date.now(),
  };

  const t = setTimeout(() => {
    update(dbRef(db, `restaurants/${user.uid}`), draftPayload).catch(() => {});
  }, 500); // debounce typing

  return () => clearTimeout(t);
}, [
  user?.uid,
  name,
  cuisine,
  description,
  phone,
  contactEmail,
  address,
  crNumber,
  priceRange,
  agePreference,
  restaurantType,
  features,
  operatingHours,
  plan,
  googleMapsUrl,
  instagram,
  tiktok,
  website,
]);




  // ✅ Load existing restaurant data (so editing works)
  useEffect(() => {
    if (!user?.uid) return;

    const rRef = dbRef(db, `restaurants/${user.uid}`);
    const unsub = onValue(rRef, (snap) => {
      const data = snap.val();
      if (!data) return;

      setPlan(data.plan || "basic");
      setName(data.name || "");
      setCuisine(data.cuisine || "");
      setDescription(data.description || "");
      setPhone(data.phone || "");
      setContactEmail(data.contactEmail || "");
      setAddress(data.address || "");
      setCrNumber(data.crNumber || "");
      setPriceRange(data.priceRange || "$$");
      setAgePreference(data.agePreference || "all");
      setRestaurantType(data.restaurantType || "casual");
      setFeatures(Array.isArray(data.features) ? data.features : []);
      setGoogleMapsUrl(data.links?.googleMapsUrl || "");
      setInstagram(data.links?.instagram || "");
      setTiktok(data.links?.tiktok || "");
      setWebsite(data.links?.website || "");
      setOperatingHours(data.operatingHours || defaultHours);
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // ✅ Save plan immediately (so table layout knows premium/basic)
  useEffect(() => {
    if (!user?.uid) return;
    update(dbRef(db, `restaurants/${user.uid}`), {
      plan,
      updatedAt: Date.now(),
    }).catch(() => {});
  }, [plan, user?.uid]);

  const validateStep1 = () => {
    const next = {};

    if (!name.trim()) next.name = "Restaurant name is required.";
    if (!cuisine) next.cuisine = "Cuisine is required.";
    if (!description.trim()) next.description = "Description is required.";
    if (description.length > DESCRIPTION_MAX)
      next.description = `Max ${DESCRIPTION_MAX} characters.`;

    if (!phone.trim()) next.phone = "Phone is required.";
    if (contactEmail && !isValidEmail(contactEmail))
      next.contactEmail = "Invalid email format.";

    if (googleMapsUrl && !isValidUrlLoose(googleMapsUrl))
      next.googleMapsUrl = "Invalid URL.";
    if (instagram && !isValidUrlLoose(instagram)) next.instagram = "Invalid URL.";
    if (tiktok && !isValidUrlLoose(tiktok)) next.tiktok = "Invalid URL.";
    if (website && !isValidUrlLoose(website)) next.website = "Invalid URL.";

    // operating hours sanity
    for (const d of DAYS) {
      const v = operatingHours?.[d.key];
      if (!v) continue;
      if (!v.closed && (!v.open || !v.close)) {
        next.operatingHours = "Please set opening and closing times for all open days.";
        break;
      }
    }

    if (!photos?.length) next.photos = "Please upload at least 1 photo.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const uploadOneFile = async (file, path) => {
    const sRef = storageRef(storage, path);
    await uploadBytes(sRef, file);
    return await getDownloadURL(sRef);
  };

  const handleSubmitForReview = async () => {
    if (!user?.uid) return;

    // optional: you can require step 2 has at least 1 table
    // but for now we just submit

    setIsSubmitting(true);
    setUploadPct(0);

    try {
      // Upload photos
      const photoUrls = [];
      for (let i = 0; i < photos.length; i++) {
        const f = photos[i];
        const url = await uploadOneFile(
          f,
          `restaurants/${user.uid}/photos/${Date.now()}_${i}_${f.name}`
        );
        photoUrls.push(url);
        setUploadPct(Math.round(((i + 1) / (photos.length + (menuFile ? 1 : 0))) * 100));
      }

      // Upload menu (optional)
      let menuUrl = null;
      if (menuFile) {
        menuUrl = await uploadOneFile(
          menuFile,
          `restaurants/${user.uid}/menu/${Date.now()}_${menuFile.name}`
        );
        setUploadPct(100);
      }

      const payload = {
        name: name.trim(),
        cuisine,
        description: description.trim(),
        phone: phone.trim(),
        contactEmail: contactEmail.trim() || null,
        address: address.trim() || null,
        crNumber: crNumber.trim() || null,

        priceRange,
        agePreference,
        restaurantType,
        features,

        links: {
          googleMapsUrl: googleMapsUrl.trim() || null,
          instagram: instagram.trim() || null,
          tiktok: tiktok.trim() || null,
          website: website.trim() || null,
        },

        operatingHours,
        plan,

        photos: photoUrls,
        menuUrl,

        status: "pending_review",
        updatedAt: Date.now(),
        createdAt: Date.now(),
      };

      await update(dbRef(db, `restaurants/${user.uid}`), payload);

      toast({
        title: "Submitted for review ✅",
        description: "We’ll review your application and notify you.",
        status: "success",
        duration: 3500,
        isClosable: true,
      });

      // optional: go back to welcome or onboarding
      // setStep(1);
    } catch (err) {
      console.error(err);
      toast({
        title: "Submit failed",
        description: err?.message || "Please try again.",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box color="white">
      <HStack justify="space-between" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Heading size="lg">Restaurant Application</Heading>
          <Text color="whiteAlpha.700">
            Submit your details for verification. Seb&apos;s will review before your listing goes live.
          </Text>
        </Box>

        <Badge bg="whiteAlpha.200" px={3} py={1} rounded="full">
          Step {step} of 2
        </Badge>
      </HStack>

      <Progress
        value={step === 1 ? 50 : 100}
        borderRadius="full"
        mb={5}
        bg="whiteAlpha.200"
      />

      {/* ================= STEP 1 ================= */}
      {step === 1 && (
        <Stack spacing={4}>
          <Card title="Choose your plan" subtitle="You’ll pay only after approval.">
            <RadioGroup value={plan} onChange={setPlan}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {planCards.map((p) => {
                  const active = plan === p.key;
                  return (
                    <Box
                      key={p.key}
                      border="1px solid"
                      borderColor={active ? "blue.300" : "whiteAlpha.200"}
                      bg={active ? "blue.900" : "whiteAlpha.50"}
                      rounded="2xl"
                      p={4}
                      cursor="pointer"
                      onClick={() => setPlan(p.key)}
                    >
                      <HStack justify="space-between" mb={2}>
                        <Heading size="md">{p.title}</Heading>
                        {active && (
                          <Badge colorScheme="blue" rounded="full" px={3}>
                            SELECTED
                          </Badge>
                        )}
                      </HStack>
                      <Text fontWeight="bold" mb={3}>
                        {p.price}
                      </Text>
                      <Stack spacing={1}>
                        {p.bullets.map((b) => (
                          <Text key={b} fontSize="sm" color="whiteAlpha.800">
                            • {b}
                          </Text>
                        ))}
                      </Stack>
                    </Box>
                  );
                })}
              </SimpleGrid>
            </RadioGroup>
          </Card>

          <Card title="Restaurant details" subtitle="The essentials customers will see.">
            <Stack spacing={4}>
              <FormControl isInvalid={!!errors.name}>
                <FormLabel>Restaurant name</FormLabel>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.cuisine}>
                <FormLabel>Cuisine</FormLabel>
               <Select
  placeholder="Select cuisine"
  value={cuisine}
  onChange={(e) => setCuisine(e.target.value)}
  bg="blackAlpha.700"
  borderColor="whiteAlpha.300"
  color="white"
  sx={{ option: { color: "black" } }}
>
  {cuisineOptions.map((c) => (
    <option key={c} value={c}>
      {c}
    </option>
  ))}
</Select>

                <FormErrorMessage>{errors.cuisine}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.description}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                />
                <HStack justify="space-between" mt={1}>
                  <Text fontSize="xs" color="whiteAlpha.700">
                    {description.length}/{DESCRIPTION_MAX}
                  </Text>
                  <FormErrorMessage>{errors.description}</FormErrorMessage>
                </HStack>
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isInvalid={!!errors.phone}>
                  <FormLabel>Phone</FormLabel>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <FormErrorMessage>{errors.phone}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.contactEmail}>
                  <FormLabel>Contact email (optional)</FormLabel>
                  <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                  <FormErrorMessage>{errors.contactEmail}</FormErrorMessage>
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Address (optional)</FormLabel>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
              </FormControl>

              <FormControl>
                <FormLabel>CR number (optional)</FormLabel>
                <Input value={crNumber} onChange={(e) => setCrNumber(e.target.value)} />
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <FormControl>
                  <FormLabel>Price range</FormLabel>
                  <Select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}
                     bg="blackAlpha.700"
  borderColor="whiteAlpha.300"
  color="white"
  sx={{ option: { color: "black" } }}>
                    <option value="$">$</option>
                    <option value="$$">$$</option>
                    <option value="$$$">$$$</option>
                    <option value="$$$$">$$$$</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Age preference</FormLabel>
                  <Select value={agePreference} onChange={(e) => setAgePreference(e.target.value)}
                     bg="blackAlpha.700"
  borderColor="whiteAlpha.300"
  color="white"
  sx={{ option: { color: "black" } }}>
                    <option value="all">All ages</option>
                    <option value="family">Family-friendly</option>
                    <option value="adults">Adults only</option>
                    <option value="18+">18+</option>
                    <option value="21+">21+</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Restaurant type</FormLabel>
                  <Select value={restaurantType} onChange={(e) => setRestaurantType(e.target.value)}
                     bg="blackAlpha.700"
  borderColor="whiteAlpha.300"
  color="white"
  sx={{ option: { color: "black" } }}>
                    <option value="casual">Casual</option>
                    <option value="family">Family-friendly</option>
                    <option value="fine">Fine dining</option>
                    <option value="cafe">Cafe</option>
                    <option value="fast-casual">Fast casual</option>
                    <option value="date-night">Date night</option>
                    <option value="business">Business</option>
                    <option value="buffet">Buffet</option>
                    <option value="other">Other</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
            </Stack>
          </Card>

          <Card title="Links" subtitle="Optional, but strongly recommended.">
            <Stack spacing={4}>
              <FormControl isInvalid={!!errors.googleMapsUrl}>
                <FormLabel>Google Maps URL</FormLabel>
                <Input value={googleMapsUrl} onChange={(e) => setGoogleMapsUrl(e.target.value)} />
                <FormErrorMessage>{errors.googleMapsUrl}</FormErrorMessage>
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <FormControl isInvalid={!!errors.instagram}>
                  <FormLabel>Instagram</FormLabel>
                  <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} />
                  <FormErrorMessage>{errors.instagram}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.tiktok}>
                  <FormLabel>TikTok</FormLabel>
                  <Input value={tiktok} onChange={(e) => setTiktok(e.target.value)} />
                  <FormErrorMessage>{errors.tiktok}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.website}>
                  <FormLabel>Website</FormLabel>
                  <Input value={website} onChange={(e) => setWebsite(e.target.value)} />
                  <FormErrorMessage>{errors.website}</FormErrorMessage>
                </FormControl>
              </SimpleGrid>
            </Stack>
          </Card>

          <Card title="Key features" subtitle="Helps customers filter and decide quickly.">
            <FormControl>
              <CheckboxGroup value={features} onChange={setFeatures}>
                <Wrap spacing={3}>
                  {featureOptions.map((f) => (
                    <WrapItem key={f}>
                      <Checkbox value={f}>{f}</Checkbox>
                    </WrapItem>
                  ))}
                </Wrap>
              </CheckboxGroup>
            </FormControl>
          </Card>

          <Card title="Operating hours" subtitle="Set opening/closing times per day (or mark closed).">
            {errors.operatingHours && (
              <Text color="red.300" fontSize="sm" mb={2}>
                {errors.operatingHours}
              </Text>
            )}
<HStack justify="space-between" flexWrap="wrap" gap={2} mb={3}>
  <Text color="whiteAlpha.700" fontSize="sm">
    Tip: set one day, then copy to all.
  </Text>

  <Button
    size="sm"
    variant="outline"
    borderColor="whiteAlpha.300"
    onClick={() => {
      // take Monday as the template (or any day you want)
      const template = operatingHours.mon;
      setOperatingHours((prev) => {
        const next = { ...prev };
        for (const d of DAYS) next[d.key] = { ...template };
        return next;
      });
    }}
  >
    Copy Mon → All days
  </Button>
</HStack>

            <Stack spacing={3}>
              {DAYS.map((d) => {
                const v = operatingHours[d.key];
                return (
                  <Box
                    key={d.key}
                    bg="whiteAlpha.50"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    rounded="xl"
                    p={3}
                  >
                    <HStack justify="space-between" flexWrap="wrap" gap={3}>
                      <Text fontWeight="bold">{d.label}</Text>
                      <Checkbox
                        isChecked={v.closed}
                        onChange={(e) =>
                          setOperatingHours((prev) => ({
                            ...prev,
                            [d.key]: { ...prev[d.key], closed: e.target.checked },
                          }))
                        }
                      >
                        Closed
                      </Checkbox>
                    </HStack>

                    {!v.closed && (
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mt={3}>
                        <FormControl>
                          <FormLabel fontSize="sm">Open</FormLabel>
                          <Input
                            type="time"
                            value={v.open}
                            onChange={(e) =>
                              setOperatingHours((prev) => ({
                                ...prev,
                                [d.key]: { ...prev[d.key], open: e.target.value },
                              }))
                            }
                            bg="whiteAlpha.50"
                            borderColor="whiteAlpha.200"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="sm">Close</FormLabel>
                          <Input
                            type="time"
                            value={v.close}
                            onChange={(e) =>
                              setOperatingHours((prev) => ({
                                ...prev,
                                [d.key]: { ...prev[d.key], close: e.target.value },
                              }))
                            }
                            bg="whiteAlpha.50"
                            borderColor="whiteAlpha.200"
                          />
                        </FormControl>
                      </SimpleGrid>
                    )}
                  </Box>
                );
              })}
            </Stack>
          </Card>

          <Card title="Photos & menu" subtitle="Upload at least 1 photo. Menu PDF/image optional.">
            <Stack spacing={4}>
              <FormControl isInvalid={!!errors.photos}>
                <FormLabel>Restaurant photos</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  p={1}
                  onChange={(e) => setPhotos(Array.from(e.target.files || []))}
                />
                <FormErrorMessage>{errors.photos}</FormErrorMessage>
                {photos?.length > 0 && (
                  <Text fontSize="xs" color="whiteAlpha.700" mt={1}>
                    Selected: {photos.length} photo(s)
                  </Text>
                )}
              </FormControl>

              <FormControl>
                <FormLabel>Menu file (optional)</FormLabel>
                <Input
                  type="file"
                  accept="application/pdf,image/*"
                  p={1}
                  onChange={(e) => setMenuFile(e.target.files?.[0] || null)}
                />
                {menuFile && (
                  <Text fontSize="xs" color="whiteAlpha.700" mt={1}>
                    Selected: {menuFile.name}
                  </Text>
                )}
              </FormControl>
            </Stack>
          </Card>

          <Divider borderColor="whiteAlpha.200" />

          <HStack justify="space-between" flexWrap="wrap" gap={3}>
            <Text color="whiteAlpha.700" fontSize="sm">
              Next: set up your table layout (Step 2).
            </Text>

            <Button
              bg="blue.700"
              _hover={{ bg: "blue.600" }}
              onClick={() => {
                if (!validateStep1()) return;
                setStep(2);
              }}
            >
              Next →
            </Button>
          </HStack>
        </Stack>
      )}

      {/* ================= STEP 2 ================= */}
      {step === 2 && (
        <Stack spacing={4}>
          <Card
            title="Table Layout (Step 2)"
            subtitle="Drag tables on the grid. Click any item to edit. Basic can’t upload 360°."
          >
            <AdminTableLayout isPremium={plan === "premium"} />
          </Card>

          {isSubmitting && (
            <Box>
              <Text fontSize="sm" color="whiteAlpha.700" mb={2}>
                Uploading…
              </Text>
              <Progress value={uploadPct} borderRadius="full" />
            </Box>
          )}

          <Divider borderColor="whiteAlpha.200" />

          <HStack justify="space-between" flexWrap="wrap" gap={3}>
            <Button variant="outline" borderColor="whiteAlpha.300" onClick={() => setStep(1)}>
              ← Back
            </Button>

            <Button
              bg="blue.700"
              _hover={{ bg: "blue.600" }}
              onClick={handleSubmitForReview}
              isLoading={isSubmitting}
            >
              Submit for review
            </Button>
          </HStack>
        </Stack>
      )}
    </Box>
  );
}
