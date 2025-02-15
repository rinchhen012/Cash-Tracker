import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, NumberInput, Button, Stack, Text, Group, Paper, Box } from '@mantine/core';
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
      sx={(theme) => ({
        minHeight: '100vh',
        background: theme.fn.linearGradient(45, theme.colors.blue[5], theme.colors.cyan[5]),
        padding: theme.spacing.md
      })}
    >
      <Container size="xs" py="xl">
        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Stack spacing="xl">
            <Group justify="space-between" align="center">
              <Button 
                variant="subtle" 
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => navigate('/')}
              >
                Back
              </Button>
              <Title order={2} size="h3">Driver {driverId}</Title>
            </Group>

            <Paper withBorder p="md" radius="md">
              <Stack spacing="md">
                <NumberInput
                  label="Order Total"
                  value={orderTotal}
                  onChange={setOrderTotal}
                  min={0}
                  precision={2}
                  size="lg"
                  radius="md"
                  placeholder="Enter order total"
                  leftSection={<Text size="sm">$</Text>}
                />

                <NumberInput
                  label="Amount Received"
                  value={amountReceived}
                  onChange={setAmountReceived}
                  min={0}
                  precision={2}
                  size="lg"
                  radius="md"
                  placeholder="Enter amount received"
                  leftSection={<Text size="sm">$</Text>}
                />
              </Stack>
            </Paper>

            <Paper 
              withBorder 
              p="md" 
              radius="md"
              bg={changeAmount >= 0 ? 'green.0' : 'red.0'}
            >
              <Stack spacing="xs" align="center">
                <Text size="lg" fw={500} c="dimmed">Change to Give:</Text>
                <Text 
                  size="xl" 
                  fw={700}
                  c={changeAmount >= 0 ? 'green' : 'red'}
                >
                  ${Math.abs(changeAmount).toFixed(2)}
                </Text>
              </Stack>
            </Paper>

            <Button
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={!orderTotal || !amountReceived}
              size="lg"
              radius="md"
              leftSection={<IconCalculator size={20} />}
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
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