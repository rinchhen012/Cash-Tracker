import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, NumberInput, Button, Stack, Text, Group, Paper, Box, MantineTheme } from '@mantine/core';
import { IconCalculator, IconArrowLeft } from '@tabler/icons-react';
import { addTransaction } from '../services/transactionService';
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
      const transaction = {
        driverId: parseInt(driverId),
        orderTotal,
        amountReceived,
        changeAmount,
        date: dayjs().format('YYYY-MM-DD'),
        timestamp: Date.now()
      };

      await addTransaction(transaction);
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
      style={(theme: MantineTheme) => ({
        minHeight: '100vh',
        background: theme.fn.linearGradient(45, theme.colors.dark[8], theme.colors.dark[9]),
        padding: theme.spacing.md
      })}
    >
      <Container size="xs" py="xl">
        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Stack gap="xl">
            <Group justify="space-between" align="center">
              <Button 
                variant="subtle" 
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => navigate('/')}
                color="gray.4"
              >
                Back
              </Button>
              <Title order={2} size="h3" c="gray.3">Driver {driverId}</Title>
            </Group>

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