import Head from "next/head";
import { useState, useRef, useEffect } from "react";
import {
  ChakraProvider,
  FormControl,
  FormLabel,
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
  const [textGenerated, setTextGenerated] = useState(false);

  const [copyButtonText, setCopyButtonText] = useState("Kopiér tekst");

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

  async function onGetData(event) {
    event.preventDefault();
    setLoading(true); // Set loading to true when request starts
    const encodedAddress = encodeURIComponent(address);

    try {
      const response = await fetch(`/api/generate?address=${encodedAddress}`);
      const buildingData = await response.json();
      let insideArea = buildingData[0].BEBO_ARL;
      let rooms = buildingData[0].VAERELSE_ANT;
      let bathrooms = buildingData[0].AntBadevaerelser;
      let toilets = buildingData[0].AntVandskylToilleter;
      let build = buildingData[0].bygning.OPFOERELSE_AAR;
      let reBuild = buildingData[0].bygning.OMBYG_AAR;
      // let planes = buildingData[0].bygning.ETAGER_ANT;
      let heating = buildingData[0].bygning.VARMEINSTAL_KODE;
      let use = buildingData[0].ENH_ANVEND_KODE;
      let wall = buildingData[0].bygning.YDERVAEG_KODE;
      let roof = buildingData[0].bygning.TAG_KODE;

      let roofTypes = {
        "1": "Fladt tag",
        "2": "Tagpap",
        "3": "Fibercement",
        "4": "Cementsten",
        "5": "Tegl",
        "6": "Metalplader",
        "7": "Stråtag",
        "10": "Fibercement",
        "11": "PVC",
        "12": "Glas"
      };

      let wallTypes = {
        "1": "Mursten",
        "2": "Letbeton",
        "3": "Fibercement",
        "4": "Bindingsværk",
        "5": "Træbeklædning",
        "6": "Betonelementer",
        "8": "Metalplader",
        "10": "Fibercement",
        "11": "PVC",
        "12": "Glas"
      };

      let useTypes = {
        "110": "Stuehus til landbrugsejendom",
        "120": "Parcelhus",
        "130": "Rækkehus",
        "140": "Lejlighed",
        "510": "Sommerhus",
        "540": "Kolonihave"
      };

      let heatingTypes = {
        "1": "Fjernvarme",
        "2": "Centralvarme",
        "3": "Ovne",
        "5": "Varmepumpe",
        "6": "Centralvarme med to fyringsenheder",
        "7": "Elovne",
        "8": "Gasradiatorer",
        "9": "Ingen varmeinstallationer"
      };

      let buildingText = "";

      if (use !== null && useTypes.hasOwnProperty(use)) {
        use = useTypes[use];
        buildingText += "Boligtype: " + use + "\n";
      }

      if (insideArea !== null) {
        buildingText += "Boligareal: " + insideArea + "\n";
      }

      if (rooms !== null) {
        if (rooms <= 2) {
          buildingText += "Værelser i alt: " + rooms + "\n";
        }
        else {
          rooms = rooms - 1;
          buildingText += "Stue: 1" + "\n" + "Værelser: " + rooms + "\n";
        }
      }

      if (bathrooms !== null) {
        buildingText += "Badeværelser: " + bathrooms + "\n";
      }

      if (toilets !== null && toilets > bathrooms) {
        toilets = toilets - bathrooms;
        buildingText += "Toiletter: " + toilets + "\n";
      }

      if (build !== null) {
        buildingText += "Byggeår: " + build + "\n";
      }

      if (reBuild !== null && reBuild !== 0) {
        buildingText += "Ombygget: " + reBuild + "\n";
      }

      if (roof !== null && roofTypes.hasOwnProperty(roof)) {
        roof = roofTypes[roof];
        buildingText += "Tag: " + roof + "\n";
      }

      if (wall !== null && wallTypes.hasOwnProperty(wall)) {
        wall = wallTypes[wall];
        buildingText += "Ydervægge: " + wall + "\n";
      }

      if (heating !== null && heatingTypes.hasOwnProperty(heating)) {
        heating = heatingTypes[heating];
        buildingText += "Varme: " + heating + "\n";
      }

      setDataField(buildingText);

    } catch (error) {
      console.error("Error fetching building data:", error);
    }

    setLoading(false); // Set loading to false when request completes
    setDataFetched(true);
    setLoadingData(false);
  }

  async function onGenerateText(event) {
    event.preventDefault();
    setLoadingText(true);

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
          radioValue,
          dataField,
        }),
      });

      const data = await response.json();

      // Start polling the server for the task status
      pollTaskStatus(data.taskId);
    } catch (error) {
      console.error('Error starting text generation:', error);
    }
  }

  async function pollTaskStatus(taskId) {
    const response = await fetch(`/api/taskStatus/${taskId}`);
    try {
      const data = await response.json();

      if (data.status === 'completed') {
        setResultField(data.result);
        setTextGenerated(true);
        setLoadingText(false);
      } else if (data.status === 'running') {
        // Poll again after a delay
        setTimeout(() => pollTaskStatus(taskId), 5000);
      } else {
        console.error('Error generating text:', data.result);
      }
    } catch (error) {
      console.error('Error polling task status:', error);
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
                      <FormControl id="address" >
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
                  <Card width="100%" >
                    <form onSubmit={onGenerateText} width="100%">
                      <CardHeader>
                        <Heading size='md'>Boligdata</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={6} width="100%" align="start">
                          <FormControl id="editableDataField">
                            <FormLabel>Check og redigér boligdata</FormLabel>
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
                          <Heading as="h4" size="sm">3 gode grunde til at købe boligen</Heading>
                          <VStack spacing={2} width="100%" align="start">
                            <FormControl id="textInput1">
                              <FormLabel>Grund #1</FormLabel>
                              <Input
                                type="text"
                                placeholder=""
                                value={textInput1}
                                onChange={(e) => setTextInput1(e.target.value)}
                                width="100%"
                              />
                            </FormControl>
                            <FormControl id="textInput2">
                              <FormLabel>Grund #2</FormLabel>
                              <Input
                                type="text"
                                placeholder=""
                                value={textInput2}
                                onChange={(e) => setTextInput2(e.target.value)}
                                width="100%"
                              />
                            </FormControl>
                            <FormControl id="textInput3">
                              <FormLabel>Grund #3</FormLabel>
                              <Input
                                type="text"
                                placeholder=""
                                value={textInput3}
                                onChange={(e) => setTextInput3(e.target.value)}
                                width="100%"
                              />
                            </FormControl>
                          </VStack>
                          <FormControl id="radioButtons">
                            <FormLabel>Hvordan skal skrivestilen være?</FormLabel>
                            <RadioGroup onChange={setRadioValue} value={radioValue} width="100%">
                              <VStack spacing={2} align="start" width="100%">
                                <Radio value="option1">Saglig</Radio>
                                <Radio value="option2">Beskrivende</Radio>
                                <Radio value="option3">Malende</Radio>
                              </VStack>
                            </RadioGroup>
                          </FormControl>
                        </VStack>
                      </CardBody>
                      <CardFooter>
                        <Button type="submit" colorScheme="teal" isLoading={loadingText}>Generér tekst</Button>
                      </CardFooter>
                    </form>
                  </Card>
                </Skeleton>
              )}

              {textGenerated && (
                <Skeleton isLoaded={!loadingText} width="100%">
                  <Card width="100%">
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
