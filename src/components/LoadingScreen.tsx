import { Container, Loader, Stack, Text } from '@mantine/core';

const LoadingScreen = () => {
  return (
    <Container 
      size="xs" 
      h="100vh" 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}
    >
      <Stack align="center" gap="md">
        <Loader size="lg" color="blue" />
        <Text size="lg" c="dimmed">Loading Change Tracker...</Text>
      </Stack>
    </Container>
  );
};

export default LoadingScreen; 