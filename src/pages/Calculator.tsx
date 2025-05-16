import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, NumberInput, Button, Stack, Text, Paper, Box } from '@mantine/core';
import { IconCalculator, IconArrowLeft } from '@tabler/icons-react';
import { addTransaction } from '../services/transactionService';
import { getOrCreateAppUserId } from '../utils/userId';
import dayjs from 'dayjs';

const Calculator = () => {
  const { driverId } = useParams();
  const navigate = useNavigate();
  const [orderTotal, setOrderTotal] = useState<number | string>('');
  const [amountReceived, setAmountReceived] = useState<number | string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const changeAmount = typeof orderTotal === 'number' && typeof amountReceived === 'number'
    ? amountReceived - orderTotal
    : 0;

  const handleSubmit = async () => {
    if (typeof orderTotal !== 'number' || typeof amountReceived !== 'number' || !driverId) return;

    setIsSubmitting(true);
    try {
      const appUserId = getOrCreateAppUserId();
      const transaction = {
        userId: appUserId,
        driverId: parseInt(driverId),
        orderTotal,
        amountReceived,
        changeAmount,
        date: dayjs().format('YYYY-MM-DD'),
        timestamp: Date.now()
      };

      await addTransaction(transaction, appUserId);
      setOrderTotal('');
      setAmountReceived('');
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box 
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(45deg, var(--mantine-color-dark-8), var(--mantine-color-dark-9))',
        padding: 'var(--mantine-spacing-md)'
      }}
    >
      <Container size="xs" py="xl">
        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Stack gap="xl">
            <Button 
              variant="filled" 
              leftSection={<IconArrowLeft size={24} />}
              onClick={() => navigate('/')}
              style={{ backgroundColor: '#1864AB', color: 'white' }}
              size="xl"
              radius="xl"
              fullWidth
              h={60}
              styles={(theme) => ({
                root: {
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: theme.colors.blue[8]
                  }
                },
                section: {
                  color: 'white'
                }
              })}
            >
              Back
            </Button>

            <Title order={2} size="h3" c="gray.3">Driver {driverId}</Title>

            <Paper withBorder p="md" radius="md">
              <Stack gap="md">
                <NumberInput
                  label={<Text c="gray.3">Order Total (जम्मा)</Text>}
                  value={orderTotal}
                  onChange={setOrderTotal}
                  min={0}
                  hideControls
                  size="xl"
                  radius="md"
                  placeholder="Order Total"
                  leftSection={<Text size="sm" c="gray.5">￥</Text>}
                  styles={(theme) => ({
                    input: {
                      backgroundColor: theme.colors.dark[8],
                      color: theme.colors.gray[1],
                      '&::placeholder': {
                        color: theme.colors.gray[1]
                      }
                    }
                  })}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />

                <NumberInput
                  label={<Text c="gray.3">Amount Received (पाएको)</Text>}
                  value={amountReceived}
                  onChange={setAmountReceived}
                  min={0}
                  hideControls
                  size="xl"
                  radius="md"
                  placeholder="Amount Received"
                  leftSection={<Text size="sm" c="gray.5">￥</Text>}
                  styles={(theme) => ({
                    input: {
                      backgroundColor: theme.colors.dark[8],
                      color: theme.colors.gray[1],
                      '&::placeholder': {
                        color: theme.colors.gray[1]
                      }
                    }
                  })}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </Stack>
            </Paper>

            <Paper withBorder p="md" radius="md" bg={changeAmount >= 0 ? 'dark.6' : 'red.9'}>
              <Stack gap="xs" align="center">
                <Text size="lg" fw={500} c="gray.4">Change to Give (फिर्ता दिनु)</Text>
                <Text 
                  size="xl" 
                  fw={700}
                  c={changeAmount >= 0 ? 'teal.4' : 'red.4'}
                >
                  ￥{Math.abs(changeAmount).toLocaleString()}
                </Text>
              </Stack>
            </Paper>

            <Button
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={!orderTotal || !amountReceived}
              size="lg"
              radius="md"
              leftSection={<IconCalculator size={20} style={{ color: 'white' }} />}
              variant="gradient"
              gradient={{ from: 'teal.6', to: 'blue.6' }}
              styles={{
                label: {
                  color: 'white',
                  fontWeight: 600
                }
              }}
            >
              Save Transaction
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default Calculator; 