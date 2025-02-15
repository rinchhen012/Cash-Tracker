import { Container, Title, Button, Stack, Text, Paper, Box, SimpleGrid, MantineTheme } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const Home = () => {
  const navigate = useNavigate();
  const currentDate = dayjs().format('MMMM D, YYYY');

  return (
    <Box 
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(45deg, var(--mantine-color-blue-9), var(--mantine-color-cyan-9))',
        padding: 'var(--mantine-spacing-md)'
      }}
    >
      <Container size="xs" py="xl">
        <Paper 
          shadow="md" 
          p="xl" 
          radius="md" 
          withBorder
          bg="dark.6"
          style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <Stack gap="xl">
            <Stack gap="xs" align="center">
              <Title order={2} ta="center" style={{ color: '#FFB800' }}>Namaste Narimasu</Title>
              <Title order={1} ta="center" c="blue.4">Change Tracker</Title>
              <Text size="lg" c="gray.4" ta="center">{currentDate}</Text>
            </Stack>
            
            <Stack gap="lg">
              <Title order={2} ta="center" size="h3" c="gray.3">Choose Driver</Title>
              <SimpleGrid cols={3} spacing="md">
                {[1, 2, 3, 4, 5, 6].map((driverId) => (
                  <Button
                    key={driverId}
                    variant="light"
                    color="blue"
                    onClick={() => navigate(`/calculator/${driverId}`)}
                    styles={(theme: MantineTheme) => ({
                      root: {
                        height: '100px',
                        padding: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        backgroundColor: theme.colors.dark[5],
                        color: theme.colors.gray[2],
                        '&:hover': {
                          backgroundColor: theme.colors.dark[4]
                        }
                      },
                      inner: {
                        height: '100%'
                      }
                    })}
                  >
                    {driverId}
                  </Button>
                ))}
              </SimpleGrid>
            </Stack>
            
            <Button
              variant="filled"
              color="blue"
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