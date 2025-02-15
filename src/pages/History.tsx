import { Box, Stack, Title, Text, Button, Paper, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconCurrencyYen } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Transaction, getTransactions } from '../services/transactionService';
import LoadingScreen from '../components/LoadingScreen';

const History = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (isLoading) {
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
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(45deg, var(--mantine-color-blue-5) 0%, var(--mantine-color-cyan-5) 100%)',
        padding: 'var(--mantine-spacing-md)'
      }}
    >
      <Stack gap="xl">
        <Button
          variant="light"
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
          <Paper key={date}>
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
    </Box>
  );
};

export default History; 