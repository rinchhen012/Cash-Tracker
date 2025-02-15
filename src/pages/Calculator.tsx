import { Box, Stack, Title, Text, Button, NumberInput, Paper } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { IconArrowLeft, IconCurrencyYen } from '@tabler/icons-react';
import { useState } from 'react';
import { saveTransaction } from '../services/transactionService';

const Calculator = () => {
  const navigate = useNavigate();
  const { driverId } = useParams();
  const [billAmount, setBillAmount] = useState<number | string>('');
  const [receivedAmount, setReceivedAmount] = useState<number | string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!billAmount || !receivedAmount || !driverId) return;

    setIsLoading(true);
    try {
      await saveTransaction({
        driver_id: parseInt(driverId),
        bill_amount: Number(billAmount),
        amount_received: Number(receivedAmount),
        change_amount: Number(receivedAmount) - Number(billAmount)
      });
      navigate('/');
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeAmount = receivedAmount && billAmount
    ? Number(receivedAmount) - Number(billAmount)
    : 0;

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

        <Stack gap="lg">
          <Title order={2} c="gray.3">Driver {driverId}</Title>

          <Paper>
            <Stack gap="md">
              <NumberInput
                label="Bill Amount"
                value={billAmount}
                onChange={setBillAmount}
                min={0}
                hideControls
                size="lg"
                radius="md"
                placeholder="Enter bill amount"
                leftSection={<IconCurrencyYen size={20} />}
              />

              <NumberInput
                label="Amount Received"
                value={receivedAmount}
                onChange={setReceivedAmount}
                min={0}
                hideControls
                size="lg"
                radius="md"
                placeholder="Enter received amount"
                leftSection={<IconCurrencyYen size={20} />}
              />

              <Text size="xl" fw={500}>
                Change: ¥{changeAmount.toLocaleString()}
              </Text>
            </Stack>
          </Paper>

          <Stack gap="md" align="center">
            <Button
              size="xl"
              radius="md"
              fullWidth
              loading={isLoading}
              disabled={!billAmount || !receivedAmount || changeAmount < 0}
              onClick={handleSave}
              style={{
                background: 'linear-gradient(45deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-cyan-6) 100%)',
                color: 'white',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(45deg, var(--mantine-color-blue-5) 0%, var(--mantine-color-cyan-5) 100%)'
                }
              }}
            >
              Save Transaction
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

export default Calculator; 