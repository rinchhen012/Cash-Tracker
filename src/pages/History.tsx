import { useEffect, useState, useCallback } from 'react';
import { Container, Title, Button, Stack, Text, Select, Paper, Box, Group, Alert, LoadingOverlay, Badge, ActionIcon, Tooltip, Transition } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconFilter, IconWifiOff, IconCloudUpload, IconCheck, IconClock, IconRefresh } from '@tabler/icons-react';
import { getAllTransactions, syncPendingTransactions } from '../services/transactionService';
import { getPendingTransactions } from '../services/localStorageService';
import { Transaction } from '../types';
import dayjs from 'dayjs';
import { useViewportSize } from '@mantine/hooks';

const History = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { height } = useViewportSize();

  // Monitor online/offline status and pending transactions
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    const checkPending = () => setPendingCount(getPendingTransactions().length);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check pending count initially and every 1 second
    checkPending();
    const interval = setInterval(checkPending, 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Handle manual sync
  const handleSync = async () => {
    if (isOffline || syncing) return;
    
    setSyncing(true);
    try {
      await syncPendingTransactions();
      const updatedTransactions = await getAllTransactions();
      setTransactions(updatedTransactions);
      setPendingCount(getPendingTransactions().length);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

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

  // Refresh function
  const refreshTransactions = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const data = await getAllTransactions();
      if (Array.isArray(data)) {
        setTransactions(data);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshing]);

  // Auto-refresh every 30 seconds if online
  useEffect(() => {
    if (isOffline) return;
    const interval = setInterval(refreshTransactions, 30000);
    return () => clearInterval(interval);
  }, [isOffline, refreshTransactions]);

  // Pull to refresh setup
  useEffect(() => {
    let startY = 0;
    let pulling = false;

    const handleTouchStart = (e: TouchEvent) => {
      const scrollTop = document.documentElement.scrollTop;
      if (scrollTop <= 0) {
        startY = e.touches[0].clientY;
        pulling = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!pulling) return;
      const y = e.touches[0].clientY;
      const delta = y - startY;
      if (delta > 50) {
        pulling = false;
        refreshTransactions();
      }
    };

    const handleTouchEnd = () => {
      pulling = false;
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [refreshTransactions]);

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  // Sort dates in reverse chronological order
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

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
                leftSection={<IconArrowLeft size={24} />}
                onClick={() => navigate('/')}
                color="gray.4"
                size="xl"
                radius="xl"
                fullWidth
                h={60}
                styles={(theme) => ({
                  root: {
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: theme.colors.dark[4]
                    }
                  }
                })}
              >
                Back
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
          <LoadingOverlay visible={loading || refreshing} overlayProps={{ blur: 2 }} />
          
          {isOffline && (
            <Alert 
              color="yellow" 
              title="Offline Mode" 
              icon={<IconWifiOff size={16} />}
              styles={{
                root: { backgroundColor: 'rgba(255, 184, 0, 0.1)' }
              }}
            >
              You are currently offline. Transactions will be synced when you&apos;re back online.
              {pendingCount > 0 && (
                <Text size="sm" mt="xs" c="yellow.4">
                  {pendingCount} transaction{pendingCount !== 1 ? 's' : ''} pending sync
                </Text>
              )}
            </Alert>
          )}

          {!isOffline && pendingCount > 0 && (
            <Alert 
              color="blue" 
              title="Sync Available" 
              icon={<IconCloudUpload size={16} />}
              styles={{
                root: { backgroundColor: 'rgba(0, 102, 255, 0.1)' }
              }}
            >
              <Group justify="space-between" align="center">
                <Text size="sm">
                  {pendingCount} transaction{pendingCount !== 1 ? 's' : ''} ready to sync
                </Text>
                <Button 
                  variant="light" 
                  color="blue" 
                  size="xs" 
                  onClick={handleSync}
                  loading={syncing}
                >
                  Sync Now
                </Button>
              </Group>
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
                  variant="light" 
                  leftSection={<IconArrowLeft size={24} />}
                  onClick={() => navigate('/')}
                  color="gray.4"
                  size="xl"
                  radius="xl"
                  fullWidth
                  h={60}
                  styles={(theme) => ({
                    root: {
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: theme.colors.dark[4]
                      }
                    }
                  })}
                >
                  Back
                </Button>
              </Group>

              <Group justify="space-between" align="center">
                <Title order={2} size="h3" c="gray.3">Transaction History</Title>
                <Group gap="xs" align="center">
                  <Text size="xs" c="gray.5">
                    Last updated: {dayjs(lastRefresh).format('HH:mm:ss')}
                  </Text>
                  <ActionIcon 
                    variant="subtle" 
                    color="gray" 
                    onClick={refreshTransactions}
                    loading={refreshing}
                    disabled={isOffline}
                  >
                    <IconRefresh size={16} />
                  </ActionIcon>
                </Group>
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
              sortedDates.map(date => (
                <Stack key={date} gap="xs">
                  <Group justify="space-between" px="md">
                    <Text fw={700} c="gray.4">
                      {dayjs(date).format('MMM D, YYYY')}
                      {date === dayjs().format('YYYY-MM-DD') && (
                        <Text span size="sm" ml="xs" c="blue.4">Today</Text>
                      )}
                    </Text>
                    <Text size="sm" c="gray.5">
                      {groupedTransactions[date].length} transaction{groupedTransactions[date].length !== 1 ? 's' : ''}
                    </Text>
                  </Group>
                  
                  {groupedTransactions[date].map((transaction) => {
                    if (!transaction) return null;
                    const {
                      id,
                      driverId,
                      orderTotal = 0,
                      amountReceived = 0,
                      changeAmount = 0,
                      timestamp,
                      isPending
                    } = transaction;
                    
                    return (
                      <Paper 
                        key={id || Date.now().toString()}
                        shadow="sm" 
                        p="md" 
                        radius="md" 
                        withBorder
                        bg="dark.7"
                        style={{ 
                          borderColor: isPending ? 'rgba(255, 184, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                          position: 'relative',
                          transition: 'transform 0.2s ease, opacity 0.2s ease',
                          cursor: 'pointer'
                        }}
                      >
                        {isPending && (
                          <Tooltip label="Pending Sync" position="top-end">
                            <Badge 
                              color="yellow" 
                              variant="light"
                              style={{ 
                                position: 'absolute',
                                top: '12px',
                                right: '12px'
                              }}
                              leftSection={<IconClock size={14} />}
                            >
                              Pending
                            </Badge>
                          </Tooltip>
                        )}
                        <Group justify="space-between" align="flex-start">
                          <Stack gap={4}>
                            <Group align="center" gap="xs">
                              <Text fw={500} c="gray.2">Driver {driverId}</Text>
                              <Text size="sm" c="gray.5">
                                {dayjs(timestamp).format('HH:mm')}
                              </Text>
                            </Group>
                            <Stack gap={8}>
                              <Group justify="space-between">
                                <Text size="sm" c="orange.4">Order Total (जम्मा):</Text>
                                <Text size="sm" fw={500} c="orange.4">￥{orderTotal.toLocaleString()}</Text>
                              </Group>
                              <Group justify="space-between">
                                <Text size="sm" c="teal.4">Amount Received (पाएको):</Text>
                                <Text size="sm" fw={500} c="teal.4">￥{amountReceived.toLocaleString()}</Text>
                              </Group>
                              <Group justify="space-between">
                                <Text size="sm" c="red.4">Change to Give (फिर्ता दिनु):</Text>
                                <Text size="sm" fw={500} c="red.4">￥{Math.abs(changeAmount).toLocaleString()}</Text>
                              </Group>
                            </Stack>
                          </Stack>
                        </Group>
                      </Paper>
                    );
                  })}
                </Stack>
              ))
            )}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default History; 