import { useEffect, useState } from 'react';
import { Container, Title, Button, Stack, Text, Select, Paper, Box, Group, Alert, LoadingOverlay } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconFilter, IconWifiOff, IconCurrencyYen } from '@tabler/icons-react';
import { getAllTransactions } from '../services/transactionService';
import { Transaction } from '../types';
import dayjs from 'dayjs';
import LoadingScreen from '../components/LoadingScreen';

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
        sx={(theme) => ({
          minHeight: '100vh',
          background: theme.fn.linearGradient(45, theme.colors.dark[8], theme.colors.dark[9]),
          padding: theme.spacing.md
        })}
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
            <Stack spacing="lg">
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

  if (loading) {
    return <LoadingScreen />;
  }

  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.created_at).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  return (
    <Box 
      sx={(theme) => ({
        minHeight: '100vh',
        background: theme.fn.linearGradient(45, theme.colors.dark[8], theme.colors.dark[9]),
        padding: theme.spacing.md
      })}
    >
      <Container size="md" py="xl">
        <Stack gap="xl">
          <Button
            variant="light"
            color="blue"
            leftSection={<IconArrowLeft size={20} />}
            onClick={() => navigate('/')}
            style={{
              '&:hover': {
                backgroundColor: 'rgba(51, 154, 240, 0.1)'
              }
            }}
          >
            Back
          </Button>

          <Title order={2} c="gray.3">Transaction History</Title>

          {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
            <Paper key={date} withBorder radius="md" p="xl">
              <Stack gap="md">
                <Title order={3} c="gray.4">{date}</Title>

                <Stack gap="sm">
                  {dayTransactions.map((transaction) => (
                    <Paper
                      key={transaction.id}
                      withBorder
                      radius="md"
                      p="md"
                      style={{
                        borderColor: 'rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <Stack gap={4}>
                        <Group justify="space-between">
                          <Text fw={500}>Driver {transaction.driver_id}</Text>
                          <Text c="dimmed" size="sm">
                            {new Date(transaction.created_at).toLocaleTimeString()}
                          </Text>
                        </Group>

                        <Group>
                          <Stack gap={2}>
                            <Text size="sm" c="dimmed">Bill Amount</Text>
                            <Group gap={4}>
                              <IconCurrencyYen size={16} />
                              <Text>{transaction.bill_amount.toLocaleString()}</Text>
                            </Group>
                          </Stack>

                          <Stack gap={2}>
                            <Text size="sm" c="dimmed">Received</Text>
                            <Group gap={4}>
                              <IconCurrencyYen size={16} />
                              <Text>{transaction.amount_received.toLocaleString()}</Text>
                            </Group>
                          </Stack>

                          <Stack gap={2}>
                            <Text size="sm" c="dimmed">Change</Text>
                            <Group gap={4}>
                              <IconCurrencyYen size={16} />
                              <Text>{transaction.change_amount.toLocaleString()}</Text>
                            </Group>
                          </Stack>
                        </Group>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Container>
    </Box>
  );
};

export default History; 