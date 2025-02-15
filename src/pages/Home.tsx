import { Box, Stack, Title, Button, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconHistory } from '@tabler/icons-react';

const Home = () => {
  const navigate = useNavigate();
  const drivers = [1, 2, 3, 4, 5];

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(45deg, var(--mantine-color-blue-5) 0%, var(--mantine-color-cyan-5) 100%)',
        padding: 'var(--mantine-spacing-md)'
      }}
    >
      <Stack gap="xl">
        <Stack gap="md" align="center">
          <Title order={1} c="gray.3">Change Tracker</Title>
          <Button
            variant="light"
            rightSection={<IconHistory size={20} />}
            onClick={() => navigate('/history')}
          >
            View History
          </Button>
        </Stack>

        <Stack gap="md">
          <Title order={2} c="gray.3">Select Driver</Title>
          <Group gap="md">
            {drivers.map((driver) => (
              <Button
                key={driver}
                size="xl"
                variant="light"
                onClick={() => navigate(`/calculator/${driver}`)}
                radius="md"
                style={{
                  flex: '1 1 200px',
                  maxWidth: '200px',
                  '@media (max-width: 480px)': {
                    flex: '1 1 100%',
                    maxWidth: '100%'
                  }
                }}
              >
                Driver {driver}
              </Button>
            ))}
          </Group>
        </Stack>
      </Stack>
    </Box>
  );
};

export default Home; 