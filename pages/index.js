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
  Spinner,
  Skeleton,
  Tooltip,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Progress
} from "@chakra-ui/react";
import { generateBuildingText } from '../utils/buildingText';
import ReactGA from 'react-ga4';
import customTheme from '../theme/customTheme'; // Adjust the path as necessary

export default function Home() {
  // Initialization and state hooks remain unchanged
  const [expandedIndex, setExpandedIndex] = useState([0]); // Start with the first item open

  const [address, setAddress] = useState("");
  const [textInput1, setTextInput1] = useState("");
  const [textInput2, setTextInput2] = useState("");
  const [textInput3, setTextInput3] = useState("");
  const [radioValue, setRadioValue] = useState("");
  const [dataField, setDataField] = useState("");
  const [resultField, setResultField] = useState("");

  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const dataFieldRef = useRef(null);
  const resultFieldRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [progressValue, setProgressValue] = useState(0); // Use this if you plan on showing determinate progress


  const [loadingData, setLoadingData] = useState(false);
  const [loadingText, setLoadingText] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [dataAccepted, setDataAccepted] = useState(false);
  const [textGenerated, setTextGenerated] = useState(false);

  const [copyButtonText, setCopyButtonText] = useState("Kopiér tekst");

  const styleMapping = {
    option1: { textStyle: "Beskrivende og saglig", temperature: 0.5 }, // example temperature value
    option2: { textStyle: "Moderat", temperature: 0.6 }, // example temperature value
    option3: { textStyle: "Kreativ og malende", temperature: 0.7 }, // example temperature value
  };

  // Handler function to track radio button changes
  const handleRadioChange = (value) => {
    setRadioValue(value); // Update state with the new value
    // Send the event to Google Analytics
    ReactGA.event({
      category: 'User',
      action: 'Radio Selection',
      label: `Selected ${value}`, // Customize this label to fit your tracking plan
    });
  };

  useEffect(() => {
    // This effect will run whenever dataField changes
    handleDataFieldInput();
  }, [dataField]);

  useEffect(() => {
    // This effect will run whenever dataField changes
    handleResultFieldInput();
  }, [resultField]);

  const handleDataFieldInput = () => {
    if (dataFieldRef.current) {
      dataFieldRef.current.style.height = 'auto';
      dataFieldRef.current.style.height = `${dataFieldRef.current.scrollHeight}px`;
    }
  };

  const handleResultFieldInput = () => {
    if (resultFieldRef.current) {
      resultFieldRef.current.style.height = 'auto';
      resultFieldRef.current.style.height = `${resultFieldRef.current.scrollHeight}px`;
    }
  };

  // Scroll start
  // const textGeneratedCardRef = useRef(null);
  // const salgsargumenterCardRef = useRef(null);
  // const boligDataCardRef = useRef(null);

  // useEffect(() => {
  //   if (dataFetched && boligDataCardRef.current) {
  //     boligDataCardRef.current.scrollIntoView({ behavior: 'smooth' });
  //   } else if (dataAccepted && salgsargumenterCardRef.current) {
  //     salgsargumenterCardRef.current.scrollIntoView({ behavior: 'smooth' });
  //   } else if (textGenerated && textGeneratedCardRef.current) {
  //     textGeneratedCardRef.current.scrollIntoView({ behavior: 'smooth' });
  //   }
  // }, [dataFetched, dataAccepted, textGenerated]);

  // Scroll end

  async function onGetData(event) {
    event.preventDefault();
    // Track button click
    ReactGA.event({
      category: 'User',
      action: 'Clicked Hent Data'
    });

    setLoading(true);
    setLoadingData(true);
    const encodedAddress = encodeURIComponent(address);

    try {
      const response = await fetch(`/api/generate?address=${encodedAddress}`);
      if (!response.ok) {
        throw new Error('Service Unavailable. Please try again later.');
      }
      const { buildingData /*, nearbyPlaces */ } = await response.json();
      const buildingText = generateBuildingText(buildingData/*, nearbyPlaces*/);
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
      setExpandedIndex([1]); // This assumes the second item is at index 1
      setLoading(false);
      setDataFetched(true);
      setLoadingData(false);
      setTimeout(() => {
        if (dataFieldRef.current) {
          dataFieldRef.current.focus(); // Focus on the resultField textarea
        }
      }, 500); // Adjust timing as needed
    }
  }

  async function onAcceptData(event) {
    event.preventDefault();
    // Track button click
    ReactGA.event({
      category: 'User',
      action: 'Clicked Godkend Boligdata'
    });
    setExpandedIndex([2]); // This assumes the second item is at index 1
    setDataAccepted(true);
  }

  async function onGenerateText(event) {
    event.preventDefault();

    // Show the modal and initialize the progress
    setIsModalOpen(true);
    setProgressValue(0); // Starting the progress at 0%

    // Track the button click
    ReactGA.event({
      category: 'User',
      action: 'Clicked Generér Tekst'
    });

    setLoadingText(true);
    const selectedStyle = styleMapping[radioValue];

    try {
      const response = await fetch('/api/generateText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

      if (!response.ok) {
        throw new Error('Service Unavailable. Please try again later.');
      }

      const data = await response.json();

      // Assume some progression here
      setProgressValue(100); // Assuming the operation completes immediately, set to 100%

      setResultField(data.result);
      setTextGenerated(true);
      setLoadingText(false);
      setExpandedIndex([3]); // This assumes the second item is at index 1
      // Ensure the modal is open for a bit before closing to show complete
      setTimeout(() => {
        setIsModalOpen(false); // Hide modal
        if (resultFieldRef.current) {
          resultFieldRef.current.focus(); // Focus on the resultField textarea
        }
      }, 500); // Adjust timing as needed

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
      setIsModalOpen(false); // Hide modal on completion or error
    }
  }



  const [suggestions, setSuggestions] = useState([]);

  async function handleAddressChange(e) {
    const query = e.target.value;
    setAddress(query);

    if (query.length > 2) { // Only fetch suggestions if query length is greater than 2
      try {
        const response = await fetch(`https://api.dataforsyningen.dk/adresser/autocomplete?q=${query}`);
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Error fetching address suggestions:", error);
      }
    } else {
      setSuggestions([]); // Clear suggestions if query length is less than or equal to 2
    }
  }

  async function copyTextToClipboard() {
    try {
      await navigator.clipboard.writeText(resultField);
      setCopyButtonText("✔ Tekst kopieret");
    } catch (error) {
      console.error("Error copying text to clipboard:", error);
      // Handle error here, e.g., show an error message to the user
    }
  }

  return (

    <ChakraProvider theme={customTheme}>

      <Modal isCentered closeOnOverlayClick={false} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Genererer din boligtekst</ModalHeader>
          <ModalBody pb={6}>
            <Progress value={progressValue} size="md" isIndeterminate="true" />
            {/* isIndeterminate will make the progress bar animate continuously if progressValue is not set */}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Box bgGradient={[
        // 'linear(to-tr, gray.200, purple.100)',
        // 'linear(to-t, gray.200, blue.100)',
        'linear(to-b, gray.100, gray.300)',
      ]} minH="100vh">
        <Container maxW="container.md">

          <Box as="div">
            <Head>
              <title>Boligtekst AI</title>
              <link rel="icon" href="/house.png" />
            </Head>

            <Box as="main" display="flex" flexDirection="column" alignItems="center" pt="4" w="100%">
              <VStack spacing={6} width="100%" align="start">
                <Box textAlign="center" width="100%">
                  {/* <Image src="/house.png" w="34px" mb="2" mx="auto" /> */}
                  <Heading as="h3" size="lg">boligtekst.ai</Heading>
                </Box>

                {/* Accordion replaces Card for data fetching section */}
                <Accordion index={expandedIndex} onChange={(index) => setExpandedIndex(index)} width="100%">

                  {/* Address and Data Fetching Section */}
                  <AccordionItem>
                    <form onSubmit={onGetData}>
                      <h3>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">Adresse</Box>
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
                                    setSuggestions([]); // Clear suggestions after selecting an address
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

                  {/* Boligdata Section */}
                  <AccordionItem>
                    <form onSubmit={onAcceptData} width="100%">
                      <h3>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">Boligdata</Box>
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
                                onInput={handleDataFieldInput} // handle input event to resize textarea
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

                  {/* Salgsargumenter Section */}
                  <AccordionItem>
                    <form onSubmit={onGenerateText} width="100%">
                      <h3>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">Salgsargumenter og skrivestil</Box>
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

                  {/* Text Generation Section */}
                  <AccordionItem>
                    <h3>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">Boligtekst</Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h3>
                    <AccordionPanel pb={4}>
                      <VStack spacing={4} width="100%" align="start">
                        <FormControl id="editableResultField">
                          <FormLabel>Rediger og kopier boligtekst</FormLabel>
                          <Tooltip label="Du kan tilrette din boligtekst her" placement="top" hasArrow>
                            <Textarea
                              ref={resultFieldRef}
                              placeholder=""
                              value={resultField}
                              onChange={(e) => setResultField(e.target.value)}
                              onInput={handleResultFieldInput} // handle input event to resize textarea
                              size="md"
                              width="100%"
                            />
                          </Tooltip>
                        </FormControl>
                        <HStack display="flex" justifyContent="space-between" width="100%">
                          <Button colorScheme="teal" onClick={copyTextToClipboard}>
                            {copyButtonText}
                          </Button>
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
