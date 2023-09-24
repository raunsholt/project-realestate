import Head from "next/head";
import { useState } from "react";
import { ChakraProvider, Box, Image, Heading, Input, Button, Radio, RadioGroup, Textarea, VStack, List, ListItem } from "@chakra-ui/react";

export default function Home() {
  const [address, setAddress] = useState("");
  const [textInput1, setTextInput1] = useState("");
  const [textInput2, setTextInput2] = useState("");
  const [textInput3, setTextInput3] = useState("");
  const [radioValue, setRadioValue] = useState("");
  const [dataField, setDataField] = useState("");
  const [resultField, setResultField] = useState("");

  async function onGetData(event) {
    event.preventDefault();
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
            buildingText += "Boligtype: " + use + ". ";
        }

        if (insideArea !== null) {
            buildingText += "Boligareal: " + insideArea + ". ";
        }

        if (rooms !== null) {
            if (rooms <= 2) {
                buildingText += "Værelser i alt: " + rooms + ". ";
            }
            else {
                rooms = rooms - 1;
                buildingText += "Stue: 1. Værelser: " + rooms + ". ";
            }
        }

        if (bathrooms !== null) {
            buildingText += "Badeværelser: " + bathrooms + ". ";
        }

        if (toilets !== null && toilets > bathrooms) {
            toilets = toilets - bathrooms;
            buildingText += "Toiletter: " + toilets + ". ";
        }

        if (build !== null) {
            buildingText += "Byggeår: " + build + ". ";
        }

        if (reBuild !== null && reBuild !== 0) {
            buildingText += "Ombygget: " + reBuild + ". ";
        }

        if (roof !== null && roofTypes.hasOwnProperty(roof)) {
            roof = roofTypes[roof];
            buildingText += "Tag: " + roof + ". ";
        }

        if (wall !== null && wallTypes.hasOwnProperty(wall)) {
            wall = wallTypes[wall];
            buildingText += "Ydervægge: " + wall + ". ";
        }

        if (heating !== null && heatingTypes.hasOwnProperty(heating)) {
            heating = heatingTypes[heating];
            buildingText += "Varme: " + heating + ". ";
        }

        setDataField(buildingText); 
    } catch (error) {
        console.error("Error fetching building data:", error);
    }
}


  async function onGenerateText(event) {
    event.preventDefault();
    // Handle the logic for the "Generate text" button here
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

  return (
    <ChakraProvider>
      <Box as="div">
        <Head>
          <title>Boligtekst AI</title>
          <link rel="icon" href="/house.png" />
        </Head>

        <Box as="main" display="flex" flexDirection="column" alignItems="center" pt="6" w="100%" px="4">
          <VStack spacing={6} maxWidth="600px" width="100%">
            <Box textAlign="center">
              <Image src="/house.png" w="34px" mx="auto" mb="2" />
              <Heading as="h3" size="lg">Boligtekst AI</Heading>
            </Box>

            <form onSubmit={onGetData}>
              <VStack spacing={4}>
                <Box position="relative" width="100%">
                  <Input
                    type="text"
                    placeholder="Enter address"
                    value={address}
                    onChange={handleAddressChange}
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
                </Box>
                <Button type="submit" colorScheme="teal" width="full">Get data</Button>
              </VStack>
            </form>

            <Textarea
              placeholder="Editable data field"
              value={dataField}
              onChange={(e) => setDataField(e.target.value)}
              size="md"
            />

            <VStack spacing={4} width="100%">
              <Input
                type="text"
                placeholder="Text input 1"
                value={textInput1}
                onChange={(e) => setTextInput1(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Text input 2"
                value={textInput2}
                onChange={(e) => setTextInput2(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Text input 3"
                value={textInput3}
                onChange={(e) => setTextInput3(e.target.value)}
              />
            </VStack>

            <RadioGroup onChange={setRadioValue} value={radioValue}>
              <VStack spacing={2} align="start">
                <Radio value="option1">Option 1</Radio>
                <Radio value="option2">Option 2</Radio>
                <Radio value="option3">Option 3</Radio>
              </VStack>
            </RadioGroup>

            <form onSubmit={onGenerateText}>
              <VStack spacing={4}>
                <Button type="submit" colorScheme="teal" width="full">Generate text</Button>
                <Textarea
                  placeholder="Editable result field"
                  value={resultField}
                  onChange={(e) => setResultField(e.target.value)}
                  size="md"
                />
              </VStack>
            </form>
          </VStack>
        </Box>
      </Box>
    </ChakraProvider>
  );
}
