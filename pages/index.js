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
  Progress,
  Tooltip,
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
import { generateBuildingText } from '../utils/buildingText';
import ReactGA from 'react-ga4';
import customTheme from '../theme/customTheme';

export default function Home() {
  useEffect(() => {
    ReactGA.initialize('G-9SCDQ93V5M');
    ReactGA.send('pageview');
  }, []);

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

  const [copyButtonText, setCopyButtonText] = useState("Kopiér tekst");

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

  async function copyTextToClipboard() {
    try {
      await navigator.clipboard.writeText(`${webText}\n\n${printText}\n\n${someText}`);
      setCopyButtonText("✔ Tekst kopieret");
    } catch (error) {
      console.error("Error copying text to clipboard:", error);
    }
  }

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

  return (
    <ChakraProvider theme={customTheme}>
      <Modal isCentered closeOnOverlayClick={false} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Genererer din boligtekst</ModalHeader>
          <ModalBody pb={6}>
            <Progress value={progressValue} size="md" isIndeterminate={progressValue === 0} />
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
              <VStack spacing={6} width="100%" align="start">
                <Box textAlign="center" width="100%">
                  <Image src="/boligtekst-logo.png" w="34px" mb="2" mx="auto" />
                  <Heading as="h3" size="lg">boligtekst.ai</Heading>
                </Box>

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
                    <form onSubmit={onAcceptData} width="100%">
                      <VStack spacing={6} width="100%" align="start">
                        <FormControl id="editableDataField" isRequired>
                          <FormLabel>Rediger, tilføj og godkend data</FormLabel>
                          <Tooltip label="Du kan redigere og tilføje information her" placement="top" hasArrow>
                            <Textarea
                              ref={dataFieldRef}
                              placeholder=""
                              value={dataField}
                              onChange={(e) => setDataField(e.target.value)}
                              onInput={handleDataFieldInput}
                              size="md"
                              width="100%"
                            />
                          </Tooltip>
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
                        <Button type="submit" colorScheme="teal">Næste</Button>
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
                        <Button type="submit" colorScheme="teal" isLoading={loadingText}>Generér tekst (30 sek.)</Button>
                      </VStack>
                    </form>
                  </Box>
                )}

                {activeStep === 4 && (
                  <Box bg="white" p={6} borderRadius="md" boxShadow="md" width="100%">
                    <Heading as="h4" size="md" mb={4}>Boligtekst</Heading>
                    <VStack spacing={4} width="100%" align="start">
                      <FormControl id="webText">
                        <FormLabel>Hjemmeside</FormLabel>
                        <Tooltip label="Rediger hjemmesideteksten" placement="top" hasArrow>
                          <Textarea
                            ref={webTextRef}
                            placeholder=""
                            value={webText}
                            onChange={handleWebTextChange}
                            size="md"
                            width="100%"
                          />
                        </Tooltip>
                        <Text fontSize="sm" textAlign="right" fontStyle="italic">{webTextCount} tegn</Text>
                      </FormControl>
                      <FormControl id="printText">
                        <FormLabel>Vindue</FormLabel>
                        <Tooltip label="Rediger vinduesteksten" placement="top" hasArrow>
                          <Textarea
                            ref={printTextRef}
                            placeholder=""
                            value={printText}
                            onChange={handlePrintTextChange}
                            size="md"
                            width="100%"
                          />
                        </Tooltip>
                        <Text fontSize="sm" textAlign="right" fontStyle="italic">{printTextCount} tegn</Text>
                      </FormControl>
                      <FormControl id="someText">
                        <FormLabel>SoMe</FormLabel>
                        <Tooltip label="Rediger SoMe teksten" placement="top" hasArrow>
                          <Textarea
                            ref={someTextRef}
                            placeholder=""
                            value={someText}
                            onChange={handleSomeTextChange}
                            size="md"
                            width="100%"
                          />
                        </Tooltip>
                        <Text fontSize="sm" textAlign="right" fontStyle="italic">{someTextCount} tegn</Text>
                      </FormControl>
                      <HStack display="flex" justifyContent="space-between" width="100%">
                        <Button colorScheme="purple" as="a" href="https://21wm099ap0x.typeform.com/to/euMts0a2" target="_blank" rel="noopener noreferrer">
                          Giv feedback
                        </Button>
                      </HStack>
                    </VStack>
                  </Box>
                )}
              </VStack>
            </Box>
          </Box>
        </Container>
      </Box>
    </ChakraProvider>
  );
}
