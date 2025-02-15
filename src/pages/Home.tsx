import { Box, Stack, Title, Text, Button } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(45deg, var(--mantine-color-blue-5) 0%, var(--mantine-color-cyan-5) 100%)',
        padding: 'var(--mantine-spacing-md)'
      }}
    >
      <Stack gap="xl">
        <Stack gap="xs" align="center">
          <Title c="gold" order={1}>Namaste Narimasu</Title>
          <Title c="blue.4" order={2}>Change Tracker</Title>
          <Text c="gray.4" size="lg">{new Date().toLocaleDateString()}</Text>
        </Stack>

        <Title c="gray.3" order={3}>Choose Driver</Title>

        <Stack gap="md">
          {[1, 2, 3, 4].map((driverId) => (
            <Button
              key={driverId}
              size="xl"
              variant="light"
              onClick={() => navigate(`/calculator/${driverId}`)}
              radius="md"
              fullWidth
              style={{
                flex: '1',
                maxWidth: '100%'
              }}
            >
              Driver {driverId}
            </Button>
          ))}
        </Stack>

        <Button
          variant="filled"
          onClick={() => navigate('/history')}
          radius="md"
          size="lg"
        >
          View History
        </Button>
      </Stack>
    </Box>
  );
};

export default Home; 