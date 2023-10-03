import Head from "next/head";
import { useState, useRef, useEffect } from "react";
import {
  ChakraProvider,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  List,
  ListItem,
  VStack,
  Container,
  Heading,
  Textarea,
  RadioGroup,
  Radio,
  Image,
  Box,
  Spinner,
  Skeleton
} from "@chakra-ui/react"
import { generateBuildingText } from '../utils/buildingText'; 

export default function Home() {
  const [address, setAddress] = useState("");
  const [textInput1, setTextInput1] = useState("");
  const [textInput2, setTextInput2] = useState("");
  const [textInput3, setTextInput3] = useState("");
  const [radioValue, setRadioValue] = useState("");
  const [dataField, setDataField] = useState("");
  const [resultField, setResultField] = useState("");

  const [loading, setLoading] = useState(false);

  const dataFieldRef = useRef(null);
  const resultFieldRef = useRef(null);

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
  const textGeneratedCardRef = useRef(null);
  const salgsargumenterCardRef = useRef(null);
  const boligDataCardRef = useRef(null);

  useEffect(() => {
    if (dataFetched && boligDataCardRef.current) {
      boligDataCardRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (dataAccepted && salgsargumenterCardRef.current) {
      salgsargumenterCardRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (textGenerated && textGeneratedCardRef.current) {
      textGeneratedCardRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [dataFetched, dataAccepted, textGenerated]);

  // Scroll end

  async function onGetData(event) {
    event.preventDefault();
    setLoading(true); // Set loading to true when request starts
    const encodedAddress = encodeURIComponent(address);

    try {
      const response = await fetch(`/api/generate?address=${encodedAddress}`);
      const buildingData = await response.json();

      const buildingText = generateBuildingText(buildingData);
      setDataField(buildingText);

    } catch (error) {
      console.error("Error fetching building data:", error);
    }

    setLoading(false); // Set loading to false when request completes
    setDataFetched(true);
    setLoadingData(false);
  }

  async function onAcceptData(event) {
    event.preventDefault();
    setDataAccepted(true);
  }

  async function onGenerateText(event) {
    event.preventDefault();
    setLoadingText(true);
  
    const selectedStyle = styleMapping[radioValue]; // derive selectedStyle from radioValue
  
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
      const data = await response.json();
  
      setResultField(data.result);
      setTextGenerated(true);
      setLoadingText(false);
  
    } catch (error) {
      console.error('Error generating text:', error);
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
    <ChakraProvider>
      <Container maxW="container.md">
        <Box as="div">
          <Head>
            <title>Boligtekst AI</title>
            <link rel="icon" href="/house.png" />
          </Head>

          <Box as="main" display="flex" flexDirection="column" alignItems="center" pt="4" w="100%">
            <VStack spacing={6} width="100%" align="start">
              <Box textAlign="center" width="100%">
                <Image src="/house.png" w="34px" mb="2" mx="auto" />
                <Heading as="h3" size="lg">Boligtekst AI</Heading>
              </Box>

              <Card width="100%">
                <form onSubmit={onGetData}>
                  <CardHeader>
                    <Heading size='md'>Adresse</Heading>
                  </CardHeader>
                  <CardBody>
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
                    </VStack>

                  </CardBody>
                  <CardFooter>
                    <Button type="submit" colorScheme="teal" isLoading={loadingData}>
                      Hent data
                    </Button>
                  </CardFooter>
                </form>
              </Card>

              {dataFetched && (
                <Skeleton isLoaded={!loadingData} width="100%">
                  <Card width="100%" ref={boligDataCardRef}>
                    <form onSubmit={onAcceptData} width="100%">
                      <CardHeader>
                        <Heading size='md'>Boligdata</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={6} width="100%" align="start">
                          <FormControl id="editableDataField" isRequired>
                            <FormLabel>Godkend eller redigér boligdata</FormLabel>
                            <Textarea
                              ref={dataFieldRef}
                              placeholder=""
                              value={dataField}
                              onChange={(e) => setDataField(e.target.value)}
                              onInput={handleDataFieldInput} // handle input event to resize textarea
                              size="md"
                              width="100%"
                            />
                          </FormControl>
                        </VStack>
                      </CardBody>
                      <CardFooter>
                        <Button type="submit" colorScheme="teal">Godkend boligdata</Button>
                      </CardFooter>
                    </form>
                  </Card>
                </Skeleton>
              )}

              {dataAccepted && (
                <Skeleton isLoaded={!loadingData} width="100%">
                  <Card width="100%" ref={salgsargumenterCardRef}>
                    <form onSubmit={onGenerateText} width="100%">
                      <CardHeader>
                        <Heading size='md'>Salgsargumenter</Heading>
                      </CardHeader>
                      <CardBody>
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
                            <RadioGroup onChange={setRadioValue} value={radioValue} width="100%">
                              <VStack spacing={2} align="start" width="100%">
                                <Radio value="option1">Beskrivende og saglig</Radio>
                                <Radio value="option2">Moderat</Radio>
                                <Radio value="option3">Kreativ og malende</Radio>
                              </VStack>
                            </RadioGroup>
                          </FormControl>
                        </VStack>
                      </CardBody>
                      <CardFooter>
                        <Button type="submit" colorScheme="teal" isLoading={loadingText}>Generér tekst (30 sek.)</Button>
                      </CardFooter>
                    </form>
                  </Card>
                </Skeleton>
              )}

              {textGenerated && (
                <Skeleton isLoaded={!loadingText} width="100%">
                  <Card width="100%" ref={textGeneratedCardRef}>
                    <CardHeader>
                      <Heading size='md'>Resultat</Heading>
                    </CardHeader>
                    <CardBody>
                      <Box as="div" width="100%">
                        <VStack spacing={4} width="100%" align="start">
                          <FormControl id="editableResultField">
                            <FormLabel>Ret boligtekst</FormLabel>
                            <Textarea
                              ref={resultFieldRef}
                              placeholder=""
                              value={resultField}
                              onChange={(e) => setResultField(e.target.value)}
                              onInput={handleResultFieldInput} // handle input event to resize textarea
                              size="md"
                              width="100%"
                            />
                          </FormControl>
                        </VStack>
                      </Box>
                    </CardBody>
                    <CardFooter>
                      <Button colorScheme="teal" onClick={copyTextToClipboard}>
                        {copyButtonText}
                      </Button>
                    </CardFooter>
                  </Card>
                </Skeleton>
              )}
            </VStack>
          </Box>
          <Box height="50px" /> {/* This will add extra space at the bottom */}
        </Box>
      </Container>
    </ChakraProvider>
  );
}
