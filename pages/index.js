import Head from "next/head";
import { useState, useRef, useEffect } from "react";
import {
  ChakraProvider,
  FormControl,
  FormLabel,
  Input,
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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
} from "@chakra-ui/react";
import { generateBuildingText } from '../utils/buildingText';
import ReactGA from 'react-ga4';
import customTheme from '../theme/customTheme';

export default function Home() {
  useEffect(() => {
    ReactGA.initialize('G-9SCDQ93V5M');
    ReactGA.send('pageview');
  }, []);

  const [expandedIndex, setExpandedIndex] = useState([0]);
  const [address, setAddress] = useState("");
  const [textInput1, setTextInput1] = useState("");
  const [textInput2, setTextInput2] = useState("");
  const [textInput3, setTextInput3] = useState("");
  const [radioValue, setRadioValue] = useState("");
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
      setExpandedIndex([1]);
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
    setExpandedIndex([2]);
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
      setExpandedIndex([3]);

      // Juster textarea-felterne her
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

                <Accordion index={expandedIndex} onChange={(index) => setExpandedIndex(index)} width="100%">
                  <AccordionItem>
                    <form onSubmit={onGetData}>
                      <h3>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">1. Adresse</Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h3>
                      <AccordionPanel pb={4}>
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
                      </AccordionPanel>
                    </form>
                  </AccordionItem>

                  <AccordionItem>
                    <form onSubmit={onAcceptData} width="100%">
                      <h3>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">2. Boligdata</Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h3>
                      <AccordionPanel pb={4}>
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
                      </AccordionPanel>
                    </form>
                  </AccordionItem>

                  <AccordionItem>
                    <form onSubmit={onGenerateText} width="100%">
                      <h3>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">3. Salgsargumenter og skrivestil</Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h3>
                      <AccordionPanel pb={4}>
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
                          <Button type="submit" colorScheme="teal" isLoading={loadingText}>Generér tekst (30 sek.)</Button>
                        </VStack>
                      </AccordionPanel>
                    </form>
                  </AccordionItem>

                  <AccordionItem>
                    <h3>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">4. Boligtekst</Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h3>
                    <AccordionPanel pb={4}>
                      <VStack spacing={4} width="100%" align="start">
                        <FormControl id="webText">
                          <FormLabel>Hjemmeside</FormLabel>
                          <Tooltip label="Rediger web teksten" placement="top" hasArrow>
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
                          <Tooltip label="Rediger print teksten" placement="top" hasArrow>
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
                          {/* <Button colorScheme="teal" onClick={copyTextToClipboard}>
                            {copyButtonText}
                          </Button> */}
                          <Button colorScheme="purple" as="a" href="https://21wm099ap0x.typeform.com/to/euMts0a2" target="_blank" rel="noopener noreferrer">
                            Giv feedback
                          </Button>
                        </HStack>
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </VStack>
            </Box>
          </Box>
        </Container>
      </Box>
    </ChakraProvider>
  );
}
