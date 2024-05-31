import Head from "next/head";
import { useState, useRef, useEffect } from "react";
import {
  ChakraProvider,
  FormControl,
  FormLabel,
  Input,
  Flex,
  useToast,
  Button,
  VStack,
  Container,
  Heading,
  Textarea,
  RadioGroup,
  Radio,
  Image,
  Box,
  HStack,
  Link,
  List,
  ListItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Text,
  Stack,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
} from "@chakra-ui/react";
import { Global, css } from '@emotion/react';
import { generateBuildingText } from '../utils/buildingText';
import ReactGA from 'react-ga4';
import customTheme from '../theme/customTheme';

export default function Home() {
  useEffect(() => {
    ReactGA.initialize('G-9SCDQ93V5M');
    ReactGA.send('pageview');
  }, []);

  const GlobalStyles = () => (
    <Global
      styles={css`
        @keyframes pulsate {
          0%, 100% {
            transform: scale(1) rotate(0deg);
          }
          50% {
            transform: scale(1.1) rotate(-3deg);
          }
        }
  
        @keyframes colorChange {
          0% { fill: #4fd1c5; }  /* Chakra UI's teal.300 */
          25% { fill: #38b2ac; } /* Chakra UI's teal.400 */
          50% { fill: #319795; } /* Chakra UI's teal.500 */
          75% { fill: #2c7a7b; } /* Chakra UI's teal.600 */
          100% { fill: #285e61; } /* Chakra UI's teal.700 */
        }
  
        .logo-animate {
          animation: pulsate 2s infinite ease-in-out, colorChange 6s infinite alternate;
        }
      `}
    />
  );


  const [address, setAddress] = useState("");
  const [textInput1, setTextInput1] = useState("");
  const [textInput2, setTextInput2] = useState("");
  const [textInput3, setTextInput3] = useState("");
  const [radioValue, setRadioValue] = useState("");
  const [inspirationText, setInspirationText] = useState("");
  const [dataField, setDataField] = useState("");
  const [webText, setWebText] = useState("");
  const [printText, setPrintText] = useState("");
  const [someText, setSomeText] = useState("");
  const [webTextCount, setWebTextCount] = useState(0);
  const [printTextCount, setPrintTextCount] = useState(0);
  const [someTextCount, setSomeTextCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const dataFieldRef = useRef(null);
  const webTextRef = useRef(null);
  const printTextRef = useRef(null);
  const someTextRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [progressValue, setProgressValue] = useState(0);

  const [loadingData, setLoadingData] = useState(false);
  const [loadingText, setLoadingText] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [dataAccepted, setDataAccepted] = useState(false);
  const [textGenerated, setTextGenerated] = useState(false);

  const [copyButtonText, setCopyButtonText] = useState({
    webText: "Kopiér tekst",
    printText: "Kopiér tekst",
    someText: "Kopiér tekst"
  });

  const styleMapping = {
    option1: { textStyle: "Beskrivende og saglig", temperature: 0.5 },
    option2: { textStyle: "Moderat", temperature: 0.6 },
    option3: { textStyle: "Kreativ og malende", temperature: 0.7 },
  };

  const handleRadioChange = (value) => {
    setRadioValue(value);
    ReactGA.event({
      category: 'User',
      action: 'Radio Selection',
      label: `Selected ${value}`,
    });
  };

  useEffect(() => {
    handleDataFieldInput();
  }, [dataField]);

  const handleDataFieldInput = () => {
    if (dataFieldRef.current) {
      dataFieldRef.current.style.height = 'auto';
      dataFieldRef.current.style.height = `${dataFieldRef.current.scrollHeight}px`;
    }
  };

  const handleResultFieldInput = (ref) => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  };

  const handleWebTextChange = (e) => {
    setWebText(e.target.value);
    setWebTextCount(e.target.value.length);
    handleResultFieldInput(webTextRef);
  };

  const handlePrintTextChange = (e) => {
    setPrintText(e.target.value);
    setPrintTextCount(e.target.value.length);
    handleResultFieldInput(printTextRef);
  };

  const handleSomeTextChange = (e) => {
    setSomeText(e.target.value);
    setSomeTextCount(e.target.value.length);
    handleResultFieldInput(someTextRef);
  };

  async function onGetData(event) {
    event.preventDefault();
    ReactGA.event({ category: 'User', action: 'Clicked Hent Data' });

    setLoading(true);
    setLoadingData(true);
    const encodedAddress = encodeURIComponent(address);

    try {
      const response = await fetch(`/api/generate?address=${encodedAddress}`);
      if (!response.ok) throw new Error('Service Unavailable. Please try again later.');

      const { buildingData, estateData, propertyData } = await response.json();
      const buildingText = generateBuildingText(buildingData, estateData, propertyData);
      setDataField(buildingText);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: error.message || 'An unexpected error occurred.',
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setActiveStep(1);
      setLoading(false);
      setDataFetched(true);
      setLoadingData(false);
      setTimeout(() => {
        if (dataFieldRef.current) dataFieldRef.current.focus();
      }, 500);
    }
  }

  async function onAcceptData(event) {
    event.preventDefault();
    ReactGA.event({ category: 'User', action: 'Clicked Godkend Boligdata' });
    setActiveStep(2);
    setDataAccepted(true);
  }

  async function onGenerateText(event) {
    event.preventDefault();
    setIsModalOpen(true);
    setProgressValue(0);
    ReactGA.event({ category: 'User', action: 'Clicked Generér Tekst' });

    setLoadingText(true);
    const selectedStyle = styleMapping[radioValue];

    try {
      const response = await fetch('/api/generateText', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          textInput1,
          textInput2,
          textInput3,
          textStyle: selectedStyle.textStyle,
          temperature: selectedStyle.temperature,
          dataField,
          inspirationText,
        }),
      });

      if (!response.ok) throw new Error('Service Unavailable. Please try again later.');

      const data = await response.json();
      const [webTextResult, printTextResult, someTextResult] = data.result.split('---');

      setWebText(webTextResult.trim());
      setPrintText(printTextResult.trim());
      setSomeText(someTextResult.trim());

      setWebTextCount(webTextResult.trim().length);
      setPrintTextCount(printTextResult.trim().length);
      setSomeTextCount(someTextResult.trim().length);

      setProgressValue(100);
      setTextGenerated(true);
      setLoadingText(false);
      setActiveStep(4);

      setTimeout(() => {
        setIsModalOpen(false);
        if (webTextRef.current) {
          handleResultFieldInput(webTextRef);
          webTextRef.current.focus();
        }
        if (printTextRef.current) {
          handleResultFieldInput(printTextRef);
        }
        if (someTextRef.current) {
          handleResultFieldInput(someTextRef);
        }
      }, 500);
    } catch (error) {
      console.error('Error generating text:', error);
      toast({
        title: "Kunne ikke generere tekst",
        description: error.message || 'Vi beklager. Prøv venligst igen senere.',
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingText(false);
      setIsModalOpen(false);
    }
  }

  const [suggestions, setSuggestions] = useState([]);

  async function handleAddressChange(e) {
    const query = e.target.value;
    setAddress(query);

    if (query.length > 2) {
      try {
        const response = await fetch(`https://api.dataforsyningen.dk/adresser/autocomplete?q=${query}`);
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Error fetching address suggestions:", error);
      }
    } else {
      setSuggestions([]);
    }
  }

  const copyTextToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyButtonText((prev) => ({ ...prev, [type]: "✔ Tekst kopieret" }));
      setTimeout(() => {
        setCopyButtonText((prev) => ({ ...prev, [type]: "Kopiér tekst" }));
      }, 2000);
    } catch (error) {
      console.error("Error copying text to clipboard:", error);
    }
  };

  const steps = [
    { title: 'Adresse' },
    { title: 'Boligdata' },
    { title: 'Salgsargumenter' },
    { title: 'Skrivestil' },
    { title: 'Boligtekst' },
  ];

  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });

  useEffect(() => {
    switch (activeStep) {
      case 1: // Assuming Step 1 uses `dataFieldRef`
        handleResultFieldInput(dataFieldRef);
        break;
      case 4: // Assuming Step 4 uses `webTextRef`, `printTextRef`, and `someTextRef`
        handleResultFieldInput(webTextRef);
        handleResultFieldInput(printTextRef);
        handleResultFieldInput(someTextRef);
        break;
      default:
        // Add more cases if other steps need resizing
        break;
    }
  }, [activeStep]);

  return (
    <ChakraProvider theme={customTheme}>
      <GlobalStyles />
      <Modal isCentered closeOnOverlayClick={false} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent
          borderRadius="lg"
          maxWidth="400px" // Ensures the modal is not too wide
          width="hug" // Set a fixed width
          height="hug" // Set the same height as width to make it quadratic
        >
          <ModalHeader textAlign="center">Genererer din boligtekst...</ModalHeader>
          <ModalBody pb={6} display="flex" justifyContent="center" alignItems="center">
            <svg width="100" viewBox="0 0 70 77" xmlns="http://www.w3.org/2000/svg" className="logo-animate">
              <path d="M46.8614 0.485589C46.421 0.0304792 45.7526 -0.120052 45.1596 0.102323L15.4344 11.2493C14.9031 11.4485 14.7453 12.1241 15.1334 12.5381L37.0997 35.9688C37.7947 36.7102 38.1815 37.6883 38.1815 38.7046V75.6374C38.1815 76.2217 38.7905 76.6066 39.3183 76.3559L69.5458 61.9978C69.8232 61.8661 70 61.5864 70 61.2793L70 25.5C70 25.2827 69.6436 24.1484 69.5 24L46.8614 0.485589Z" />
              <path d="M29.9906 37.4943L1.07472 26.6529C0.554694 26.4579 0 26.8424 0 27.3977V33.8975C0 34.5607 0.411415 35.1543 1.03241 35.3871L29.9483 46.2285C30.4683 46.4235 31.023 46.0391 31.023 45.4837V38.984C31.023 38.3208 30.6116 37.7271 29.9906 37.4943Z" />
              <path d="M29.9906 52.6081L1.07472 41.7667C0.554694 41.5717 0 41.9561 0 42.5115V49.0112C0 49.6744 0.411415 50.2681 1.03241 50.5009L29.9483 61.3423C30.4683 61.5372 31.023 61.1528 31.023 60.5974V54.0977C31.023 53.4345 30.6116 52.8409 29.9906 52.6081Z" />
              <path d="M15.6728 63.6316C15.6728 62.8629 15.196 62.1749 14.4762 61.9051L1.07472 56.8804C0.554694 56.6855 0 57.0699 0 57.6253V64.125C0 64.7882 0.411415 65.3818 1.03241 65.6146L14.4272 70.6367C15.0299 70.8627 15.6728 70.4172 15.6728 69.7735V63.6316Z" />
            </svg>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Box bgGradient={['linear(to-b, gray.100, gray.300)']} minH="100vh">
        <Container maxW="container.md">
          <Box as="div">
            <Head>
              <title>Boligtekst AI</title>
              <link rel="icon" href="/boligtekst-logo.png" />
            </Head>
            <Box as="main" display="flex" flexDirection="column" alignItems="center" pt="4" w="100%">
              <VStack spacing={6} width="100%" align="start" >
                <Flex direction="row" align="center" justify="start" width="100%" textAlign="left">
                  <Image src="/bt-logo.svg" w="30" mb="2" onClick={() => window.location.reload()} />
                  <Box ml="4">
                    <Heading as="h3" size="lg">boligtekst.ai</Heading>
                    <Text>Lav en gratis boligtekst på 3 minutter</Text>
                  </Box>
                </Flex>
                <Stack width="100%">
                  <Stepper size='md' colorScheme='teal' index={activeStep} width="100%" flexWrap="wrap">
                    {steps.map((step, index) => (
                      <Step key={index} onClick={() => setActiveStep(index)}>
                        <StepIndicator>
                          <StepStatus
                            complete={<StepIcon />}
                            incomplete={<StepNumber />}
                            active={<StepNumber />}
                          />
                        </StepIndicator>
                        <StepSeparator />
                      </Step>
                    ))}
                  </Stepper>
                </Stack>

                {activeStep === 0 && (
                  <Box bg="white" p={6} borderRadius="md" boxShadow="md" width="100%">
                    <Heading as="h4" size="md" mb={4}>Adresse</Heading>
                    <form onSubmit={onGetData} width="100%">
                      <VStack spacing={4} align="start">
                        <FormControl id="address" isRequired>
                          <FormLabel>Søg adresse</FormLabel>
                          <Input
                            type="text"
                            placeholder=""
                            value={address}
                            onChange={handleAddressChange}
                            width="100%"
                          />
                          {suggestions.length > 0 && (
                            <List position="absolute" top="100%" width="100%" bg="white" border="1px solid #ccc" zIndex="1">
                              {suggestions.map((suggestion, index) => (
                                <ListItem key={index} padding="1" cursor="pointer" onClick={() => {
                                  setAddress(suggestion.tekst);
                                  setSuggestions([]);
                                }}>
                                  {suggestion.tekst}
                                </ListItem>
                              ))}
                            </List>
                          )}
                        </FormControl>
                        <Button type="submit" colorScheme="teal" isLoading={loadingData}>
                          Hent data
                        </Button>
                      </VStack>
                    </form>
                  </Box>
                )}

                {activeStep === 1 && (
                  <Box bg="white" p={6} borderRadius="md" boxShadow="md" width="100%">
                    <Heading as="h4" size="md" mb={4}>Boligdata</Heading>
                    <Box bg="blue.50" padding="2" mb="2" borderRadius="md">
                      <Text fontSize='xs'>Der kan være fejl og mangler i BBR-oplysningerne. Gennemgå dataen og foretag rettelser og tilføjelser.</Text>
                    </Box>
                    <form onSubmit={onAcceptData} width="100%">
                      <VStack spacing={6} width="100%" align="start">
                        <FormControl id="editableDataField" isRequired>
                          <FormLabel>Rediger, tilføj og godkend data</FormLabel>
                          <Textarea
                            ref={dataFieldRef}
                            placeholder=""
                            value={dataField}
                            onChange={(e) => setDataField(e.target.value)}
                            onInput={handleDataFieldInput}
                            size="md"
                            width="100%"
                          />
                        </FormControl>
                        <Button type="submit" colorScheme="teal">Godkend data</Button>
                      </VStack>
                    </form>
                  </Box>
                )}

                {activeStep === 2 && (
                  <Box bg="white" p={6} borderRadius="md" boxShadow="md" width="100%">
                    <Heading as="h4" size="md" mb={4}>Argumenter</Heading>
                    <form onSubmit={() => setActiveStep(3)} width="100%">
                      <VStack spacing={6} width="100%" align="start">
                        <VStack spacing={2} width="100%" align="start">
                          <FormControl id="textInput1" isRequired>
                            <FormLabel>1. Grund til at købe boligen</FormLabel>
                            <Input
                              type="text"
                              placeholder=""
                              value={textInput1}
                              onChange={(e) => setTextInput1(e.target.value)}
                              width="100%"
                            />
                          </FormControl>
                          <FormControl id="textInput2" isRequired>
                            <FormLabel>2. Grund til at købe boligen</FormLabel>
                            <Input
                              type="text"
                              placeholder=""
                              value={textInput2}
                              onChange={(e) => setTextInput2(e.target.value)}
                              width="100%"
                            />
                          </FormControl>
                          <FormControl id="textInput3" isRequired>
                            <FormLabel>3. Grund til at købe boligen</FormLabel>
                            <Input
                              type="text"
                              placeholder=""
                              value={textInput3}
                              onChange={(e) => setTextInput3(e.target.value)}
                              width="100%"
                            />
                          </FormControl>
                        </VStack>
                        <Button type="submit" colorScheme="teal">Fortsæt</Button>
                      </VStack>
                    </form>
                  </Box>
                )}

                {activeStep === 3 && (
                  <Box bg="white" p={6} borderRadius="md" boxShadow="md" width="100%">
                    <Heading as="h4" size="md" mb={4}>Skrivestil</Heading>
                    <form onSubmit={onGenerateText} width="100%">
                      <VStack spacing={6} width="100%" align="start">
                        <FormControl id="radioButtons" isRequired>
                          <FormLabel>Vælg en skrivestil</FormLabel>
                          <RadioGroup onChange={handleRadioChange} value={radioValue} width="100%">
                            <VStack spacing={2} align="start" width="100%">
                              <Radio value="option1">Beskrivende og saglig</Radio>
                              <Radio value="option2">Moderat</Radio>
                              <Radio value="option3">Kreativ og malende</Radio>
                            </VStack>
                          </RadioGroup>
                        </FormControl>
                        <FormControl id="inspirationText">
                          <FormLabel>Indsæt en tekst til inspiration (valgfri)</FormLabel>
                          <Box bg="blue.50" padding="2" mb="2" borderRadius="md">
                            <Text fontSize='xs'>Modellen vil kun efterligne skrivestilen - ikke indholdet.</Text>
                          </Box>
                          <Textarea
                            placeholder=""
                            value={inspirationText}
                            onChange={(e) => setInspirationText(e.target.value)}
                            size="md"
                            height="150px"
                            width="100%"
                            maxLength={1000}
                          />
                          <Text fontSize="sm" textAlign="right" fontStyle="italic">Max 1000 tegn</Text>
                        </FormControl>
                        <Button type="submit" colorScheme="teal" isLoading={loadingText}>Generér tekst</Button>
                      </VStack>
                    </form>
                  </Box>
                )}

                {activeStep === 4 && (
                  <Box bg="white" p={6} borderRadius="md" boxShadow="md" width="100%">
                    <Heading as="h4" size="md" mb={4}>Boligtekst</Heading>
                    <Box bg="blue.50" padding="2" mb="2" borderRadius="md">
                      <Text fontSize='xs'>Boligteksterne er typisk 90% færdige. Gennemgå teksterne og foretag de sidste rettelser, inden du bruger dem.</Text>
                    </Box>
                    <VStack spacing={4} width="100%" align="start">
                      <FormControl id="webText">
                        <FormLabel>Hjemmeside</FormLabel>
                        <Textarea
                          ref={webTextRef}
                          placeholder=""
                          value={webText}
                          onChange={handleWebTextChange}
                          size="md"
                          width="100%"
                        />
                        <HStack mb="4" display="flex" justifyContent="space-between" width="100%">
                          <Button mt="2" size="xs" onClick={() => copyTextToClipboard(webText, 'webText')}>
                            {copyButtonText.webText}
                          </Button>
                          <Text fontSize="sm" textAlign="right" fontStyle="italic">{webTextCount} tegn</Text>
                        </HStack>
                      </FormControl>

                      <FormControl id="printText">
                        <FormLabel>Vindue</FormLabel>
                        <Textarea
                          ref={printTextRef}
                          placeholder=""
                          value={printText}
                          onChange={handlePrintTextChange}
                          size="md"
                          width="100%"
                        />
                        <HStack mb="4" display="flex" justifyContent="space-between" width="100%">
                          <Button mt="2" size="xs" onClick={() => copyTextToClipboard(printText, 'printText')}>
                            {copyButtonText.printText}
                          </Button>
                          <Text fontSize="sm" textAlign="right" fontStyle="italic">{printTextCount} tegn</Text>
                        </HStack>
                      </FormControl>

                      <FormControl id="someText">
                        <FormLabel>SoMe</FormLabel>
                        <Textarea
                          ref={someTextRef}
                          placeholder=""
                          value={someText}
                          onChange={handleSomeTextChange}
                          size="md"
                          width="100%"
                        />
                        <HStack mb="4" display="flex" justifyContent="space-between" width="100%">
                          <Button mt="2" size="xs" onClick={() => copyTextToClipboard(someText, 'someText')}>
                            {copyButtonText.someText}
                          </Button>
                          <Text fontSize="sm" textAlign="right" fontStyle="italic">{someTextCount} tegn</Text>
                        </HStack>
                      </FormControl>
                      <HStack display="flex" justifyContent="space-between" width="100%">
                        <Button colorScheme="teal" as="a" onClick={() => window.location.reload()}>
                          Nulstil og lav ny tekst
                        </Button>
                        <Button colorScheme="purple" as="a" href="https://21wm099ap0x.typeform.com/to/euMts0a2" target="_blank" rel="noopener noreferrer">
                          Giv feedback
                        </Button>
                      </HStack>
                    </VStack>
                  </Box>
                )}
              </VStack>
              <Flex direction="row" mt="4" mb="8" align="center" justify="center" width="100%" textAlign="left">
                <Box>
                  <Link href="mailto:support@boligtekst.ai" fontSize="sm" textDecoration="underline">support@boligtekst.ai</Link>
                </Box>
              </Flex>
            </Box>
          </Box>
        </Container>
      </Box>
    </ChakraProvider>
  );
}
