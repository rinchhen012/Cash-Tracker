import { Container, Title, Button, Group, Stack, Text, Paper, Box } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const Home = () => {
  const navigate = useNavigate();
  const currentDate = dayjs().format('MMMM D, YYYY');

  return (
    <Box 
      sx={(theme) => ({
        minHeight: '100vh',
        background: theme.fn.linearGradient(45, theme.colors.blue[5], theme.colors.cyan[5]),
        padding: theme.spacing.md
      })}
    >
      <Container size="xs" py="xl">
        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Stack spacing="xl">
            <Stack spacing="xs" align="center">
              <Title order={1} ta="center" c="blue">Change Tracker</Title>
              <Text size="lg" c="dimmed" ta="center">{currentDate}</Text>
            </Stack>
            
            <Stack spacing="lg">
              <Title order={2} ta="center" size="h3">Select Driver</Title>
              <Group justify="center" gap="sm" grow wrap>
                {[1, 2, 3, 4, 5].map((driverId) => (
                  <Button
                    key={driverId}
                    size="xl"
                    variant="light"
                    onClick={() => navigate(`/calculator/${driverId}`)}
                    radius="md"
                    fullWidth
                    sx={(theme) => ({
                      flex: '1 1 calc(33.333% - 8px)',
                      maxWidth: 'calc(33.333% - 8px)',
                      '@media (max-width: 480px)': {
                        flex: '1 1 calc(50% - 8px)',
                        maxWidth: 'calc(50% - 8px)',
                      }
                    })}
                  >
                    Driver {driverId}
                  </Button>
                ))}
              </Group>
            </Stack>
            
            <Button
              variant="white"
              onClick={() => navigate('/history')}
              size="lg"
              radius="md"
            >
              View History
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default Home; 