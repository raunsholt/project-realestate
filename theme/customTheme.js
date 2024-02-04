// theme/customTheme.js
import { theme as baseTheme } from '@chakra-ui/react';

const customTheme = {
    ...baseTheme,
    components: {
        ...baseTheme.components,
        Accordion: {
            baseStyle: {
                root: {
                    padding: 0,
                    // bg: 'red',
                    // _expanded: {
                    //     bg: 'blue.500', // Background color for expanded state
                    //     color: 'white', // Text color for expanded state
                    // },
                },
                container: {
                  //  bgGradient: 'linear(to-b, gray.50, gray.100)',
                    bg: 'gray.50', // Custom background color for the Accordion container
                    borderRadius: 'md', // Rounded corners for the container
                    padding: 2,
                    marginBottom: 4,
                    boxShadow: 'md',
                },
                button: {
                    //bg: 'red.500',
                    padding: 2,
                    borderRadius: 'md', // Rounded corners for the container

                    //   _hover: {
                    //     bg: 'gray.100', // Custom hover background color for Accordion button
                    //   },
                      _expanded: {
                        fontWeight: 'bold',
                      },
                },
                panel: {
                    paddingTop: 4, // Custom padding for the Accordion panel
                    paddingBottom: 4,
                    paddingRight: 4,
                    paddingLeft: 4,
                    //bg: 'red',

                },
            },
            // Add custom variants or sizes here if needed
        },
    },
};

export default customTheme;
