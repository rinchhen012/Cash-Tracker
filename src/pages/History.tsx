import { useEffect, useState } from 'react';
import { Container, Title, Button, Stack, Text, Select, Paper, Box, Group, Alert, LoadingOverlay } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconFilter, IconWifiOff } from '@tabler/icons-react';
import { getAllTransactions } from '../services/transactionService';
import { Transaction } from '../types';
import dayjs from 'dayjs';

const History = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load transactions
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllTransactions();
        if (Array.isArray(data)) {
          setTransactions(data);
        } else {
          setTransactions([]);
          setError('Invalid data format received');
        }
      } catch (error: any) {
        console.error('Error loading transactions:', error);
        setError(error.message || 'Failed to load transactions');
        setTransactions([]); // Reset transactions on error
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  // Safely get unique dates
  const uniqueDates = Array.isArray(transactions) 
    ? [...new Set(transactions.map(t => t.date))].sort().reverse()
    : [];

  const driverOptions = [1, 2, 3, 4, 5, 6].map(id => ({ 
    value: id.toString(), 
    label: `Driver ${id}` 
  }));

  // Safely filter transactions
  const filteredTransactions = Array.isArray(transactions) 
    ? transactions.filter(t => {
        if (!t) return false;
        if (selectedDriver && t.driverId?.toString() !== selectedDriver) return false;
        if (selectedDate && t.date !== selectedDate) return false;
        return true;
      })
    : [];

  // Safely calculate totals
  const totalAmount = filteredTransactions.reduce((sum, t) => {
    const amount = typeof t.orderTotal === 'number' ? t.orderTotal : 0;
    return sum + amount;
  }, 0);
  const totalTransactions = filteredTransactions.length;

  if (error) {
    return (
      <Box 
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(45deg, var(--mantine-color-dark-8), var(--mantine-color-dark-9))',
          padding: 'var(--mantine-spacing-md)'
        }}
      >
        <Container size="md" py="xl">
          <Paper 
            shadow="md" 
            p="xl" 
            radius="md" 
            withBorder
            bg="dark.7"
            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <Stack gap="lg">
              <Alert 
                color="red" 
                title="Error Loading Transactions" 
                onClose={() => setError(null)}
                styles={{
                  root: { backgroundColor: 'rgba(255, 0, 0, 0.1)' }
                }}
              >
                {error}
              </Alert>
              <Button
                variant="light"
                onClick={() => navigate('/')}
                leftSection={<IconArrowLeft size={16} />}
                color="gray.4"
              >
                Back to Home
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box 
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(45deg, var(--mantine-color-dark-8), var(--mantine-color-dark-9))',
        padding: 'var(--mantine-spacing-md)'
      }}
    >
      <Container size="md" py="xl">
        <Stack gap="lg">
          <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
          
          {isOffline && (
            <Alert 
              color="yellow" 
              title="Offline Mode" 
              icon={<IconWifiOff size={16} />}
              styles={{
                root: { backgroundColor: 'rgba(255, 184, 0, 0.1)' }
              }}
            >
              You are currently offline. Some features may be limited.
            </Alert>
          )}

          <Paper 
            shadow="md" 
            p="xl" 
            radius="md" 
            withBorder
            bg="dark.7"
            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <Stack gap="lg">
              <Group justify="space-between" align="center">
                <Button 
                  variant="subtle" 
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={() => navigate('/')}
                  color="gray.4"
                >
                  Back
                </Button>
                <Title order={2} size="h3" c="gray.3">Transaction History</Title>
              </Group>

              <Paper 
                withBorder 
                p="md" 
                radius="md"
                bg="dark.6"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <Stack gap="md">
                  <Group align="flex-start" grow>
                    <Select
                      label={<Text c="gray.3">Filter by Driver</Text>}
                      placeholder="All Drivers"
                      data={driverOptions}
                      value={selectedDriver}
                      onChange={setSelectedDriver}
                      clearable
                      leftSection={<IconFilter size={16} />}
                      styles={(theme) => ({
                        input: {
                          backgroundColor: theme.colors.dark[8],
                          color: theme.colors.gray[3],
                          borderColor: 'rgba(255, 255, 255, 0.1)'
                        }
                      })}
                    />
                    <Select
                      label={<Text c="gray.3">Filter by Date</Text>}
                      placeholder="All Dates"
                      data={uniqueDates}
                      value={selectedDate}
                      onChange={setSelectedDate}
                      clearable
                      leftSection={<IconFilter size={16} />}
                      styles={(theme) => ({
                        input: {
                          backgroundColor: theme.colors.dark[8],
                          color: theme.colors.gray[3],
                          borderColor: 'rgba(255, 255, 255, 0.1)'
                        }
                      })}
                    />
                  </Group>

                  <Group grow>
                    <Paper 
                      withBorder 
                      p="md" 
                      radius="md"
                      bg="dark.8"
                      style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                    >
                      <Stack gap={0} align="center">
                        <Text size="sm" c="gray.4">Total Transactions</Text>
                        <Text size="xl" fw={700} c="gray.2">{totalTransactions}</Text>
                      </Stack>
                    </Paper>
                    <Paper 
                      withBorder 
                      p="md" 
                      radius="md"
                      bg="dark.8"
                      style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                    >
                      <Stack gap={0} align="center">
                        <Text size="sm" c="gray.4">Total Amount</Text>
                        <Text size="xl" fw={700} c="gray.2">￥{totalAmount.toLocaleString()}</Text>
                      </Stack>
                    </Paper>
                  </Group>
                </Stack>
              </Paper>
            </Stack>
          </Paper>

          <Stack gap="md">
            {!loading && filteredTransactions.length === 0 ? (
              <Paper 
                shadow="sm" 
                p="xl" 
                radius="md" 
                withBorder
                bg="dark.7"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <Text ta="center" c="gray.4">No transactions found</Text>
              </Paper>
            ) : (
              filteredTransactions.map((transaction) => {
                if (!transaction) return null;
                const {
                  id,
                  driverId,
                  date,
                  orderTotal = 0,
                  amountReceived = 0,
                  changeAmount = 0,
                  timestamp
                } = transaction;
                
                return (
                  <Paper 
                    key={id || Date.now().toString()}
                    shadow="sm" 
                    p="md" 
                    radius="md" 
                    withBorder
                    bg="dark.7"
                    style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <Group justify="apart" align="flex-start">
                      <Stack gap={4}>
                        <Text fw={500} c="gray.2">Driver {driverId}</Text>
                        <Stack gap={0}>
                          <Text size="sm" c="gray.5">
                            {dayjs(date).format('MMM D, YYYY')}
                          </Text>
                          <Text size="sm" c="gray.5">
                            Time: {dayjs(timestamp).format('HH:mm')}
                          </Text>
                        </Stack>
                        <Text size="sm" c="orange.4">
                          Order Total (जम्मा): ￥{orderTotal.toLocaleString()}
                        </Text>
                        <Text size="sm" c="teal.4">
                          Amount Received (पाएको): ￥{amountReceived.toLocaleString()}
                        </Text>
                        <Text size="sm" c="red.4">
                          Change to Give (फिर्ता दिनु): ￥{Math.abs(changeAmount).toLocaleString()}
                        </Text>
                      </Stack>
                    </Group>
                  </Paper>
                );
              })
            )}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default History; 