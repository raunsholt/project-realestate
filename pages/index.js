import Head from "next/head";
import { useState } from "react";
import { ChakraProvider, Box, Image, Heading, Select, Spinner, Input, Button, Text } from "@chakra-ui/react";

export default function Home() {
  const [userQuestion, setUserQuestion] = useState("");
  const [result, setResult] = useState();
  const [policyType, setPolicyType] = useState("car"); // default to car policy
  const [isLoading, setIsLoading] = useState(false);


  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true); // Set loading state to true when the request starts
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userQuestion, policyType: policyType }), // send policy type
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
      setUserQuestion("");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsLoading(false); // Set loading state to false when the request completes (either success or error)
    }
  }

  return (
    <ChakraProvider>
      <Box as="div">
        <Head>
          <title>Boligtekst AI</title>
          <link rel="icon" href="/monocle.png" /> {/* Consider changing this icon to something more relevant */}
        </Head>

        <Box as="main" display="flex" flexDirection="column" alignItems="center" pt="4" w="100%">
          <Box maxWidth="600px" width="100%"> {/* This is the centered content block */}
            <Image src="/monocle.png" w="34px" mx="auto" />
            <Heading as="h3" size="lg" my="4" textAlign="center">Boligtekst AI</Heading>
            <Text as="h4" mb="2">Vælg police</Text>
            <form onSubmit={onSubmit}>
              <Select value={policyType} onChange={(e) => setPolicyType(e.target.value)} mb="4">
                <option value="car">Bil</option>
                <option value="accident">Ulykke</option>
              </Select>
              <Text as="h4" mb="2">Skriv dit spørgsmål</Text>
              <Input
                type="text"
                name="question"
                placeholder="Fx: 'Dækker min forsikring X situation / Y person'"
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                mb="4"
              />
              <Button type="submit" colorScheme="teal">Stil spørgsmål</Button>
            </form>
            {isLoading && (
              <Box display="flex" justifyContent="center" alignItems="center" mt="4">
                <Spinner size="xl" speed="0.65s" emptyColor="gray.200" color="blue.500" />
              </Box>
            )}
            {result && (
              <Box mt="4" p="4" borderWidth="1px" borderRadius="md" bg="gray.50" w="100%">
                <Heading as="h4" size="md" mb="2">Svar:</Heading>
                <Text>{result}</Text>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </ChakraProvider>
  );
}
