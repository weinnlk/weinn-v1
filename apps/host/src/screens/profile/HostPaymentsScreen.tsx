import React from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Text, Card, Button, Chip, XStack, YStack, Divider } from '@weinn/ui';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '@weinn/core';

export function HostPaymentsScreen({
    onBack,
    onOpenPayHere,
    refreshToken,
}: {
    onBack: () => void;
    onOpenPayHere: (html: string) => void;
    refreshToken: number;
}) {
    const insets = useSafeAreaInsets();
    const theme = useTheme();

    const [loading, setLoading] = React.useState(false);
    const [status, setStatus] = React.useState<string>('');
    const [invoice, setInvoice] = React.useState<
        | {
            id: string;
            period_year: number;
            period_month: number;
            amount_due_lkr: number;
            status: string;
            due_at: string;
        }
        | null
    >(null);
    const [items, setItems] = React.useState<
        Array<{
            id: string;
            ledger_id?: string | null;
            booking_id: string;
            booking_reference?: string | null;
            check_in?: string | null;
            check_out?: string | null;
            booking_total_lkr: number;
            commission_lkr: number;
            event_type?: string | null;
            occurred_at?: string | null;
        }>
    >([]);

    const now = new Date();
    const periodYear = now.getFullYear();
    const periodMonth = now.getMonth() + 1;

    const load = React.useCallback(async () => {
        try {
            const authUserId = (await supabase.auth.getUser()).data.user?.id ?? null;
            if (!authUserId) throw new Error('Not signed in');

            setLoading(true);
            setStatus('');

            const { data: invoiceId, error: invErr } = await supabase.rpc('ensure_host_commission_invoice', {
                p_host_id: authUserId,
                p_period_year: periodYear,
                p_period_month: periodMonth,
            });
            if (invErr) throw invErr;
            if (!invoiceId) throw new Error('Missing invoice id');

            const { data: invRow, error: invSelErr } = await supabase
                .from('host_commission_invoices')
                .select('id, period_year, period_month, amount_due_lkr, status, due_at')
                .eq('id', invoiceId)
                .single();
            if (invSelErr) throw invSelErr;

            const { data: itemRows, error: itemsErr } = await supabase
                .from('host_commission_invoice_items')
                .select('id, booking_id, booking_total_lkr, commission_lkr, ledger_id')
                .eq('invoice_id', invoiceId)
                .order('commission_lkr', { ascending: false });
            if (itemsErr) throw itemsErr;

            const rawItems = ((itemRows ?? []) as any[]).map((r) => ({
                id: String(r.id),
                ledger_id: r.ledger_id ? String(r.ledger_id) : null,
                booking_id: String(r.booking_id),
                booking_total_lkr: Number(r.booking_total_lkr ?? 0),
                commission_lkr: Number(r.commission_lkr ?? 0),
            }));

            const ledgerIds = Array.from(
                new Set(rawItems.map((r) => r.ledger_id).filter((x): x is string => typeof x === 'string' && !!x))
            );
            const bookingIds = Array.from(new Set(rawItems.map((r) => r.booking_id).filter((x) => !!x)));

            const [ledgerRes, bookingsRes] = await Promise.all([
                ledgerIds.length
                    ? supabase.from('host_commission_ledger').select('id, event_type, occurred_at').in('id', ledgerIds)
                    : Promise.resolve({ data: [] as any[], error: null as any }),
                bookingIds.length
                    ? supabase.from('bookings').select('id, reservation_code, check_in, check_out, total_amount_lkr').in('id', bookingIds)
                    : Promise.resolve({ data: [] as any[], error: null as any }),
            ]);

            if ((ledgerRes as any)?.error) throw (ledgerRes as any).error;
            if ((bookingsRes as any)?.error) throw (bookingsRes as any).error;

            const ledgerById = new Map<string, any>(((ledgerRes as any)?.data ?? []).map((l: any) => [String(l.id), l]));
            const bookingById = new Map<string, any>(((bookingsRes as any)?.data ?? []).map((b: any) => [String(b.id), b]));

            setInvoice({
                id: (invRow as any).id,
                period_year: (invRow as any).period_year,
                period_month: (invRow as any).period_month,
                amount_due_lkr: Number((invRow as any).amount_due_lkr ?? 0),
                status: String((invRow as any).status ?? 'open'),
                due_at: String((invRow as any).due_at ?? ''),
            });
            setItems(
                rawItems.map((r) => {
                    const ledger = r.ledger_id ? ledgerById.get(r.ledger_id) : null;
                    const booking = bookingById.get(r.booking_id) ?? null;
                    return {
                        id: r.id,
                        ledger_id: r.ledger_id,
                        booking_id: r.booking_id,
                        booking_reference: booking?.reservation_code ? String(booking.reservation_code) : null,
                        check_in: booking?.check_in ? String(booking.check_in) : null,
                        check_out: booking?.check_out ? String(booking.check_out) : null,
                        booking_total_lkr:
                            booking?.total_amount_lkr != null ? Number(booking.total_amount_lkr ?? 0) : Number(r.booking_total_lkr ?? 0),
                        commission_lkr: Number(r.commission_lkr ?? 0),
                        event_type: ledger?.event_type ? String(ledger.event_type) : null,
                        occurred_at: ledger?.occurred_at ? String(ledger.occurred_at) : null,
                    };
                })
            );
        } catch (e: any) {
            setInvoice(null);
            setItems([]);
            setStatus(typeof e?.message === 'string' ? e.message : 'Failed to load payments');
        } finally {
            setLoading(false);
        }
    }, [periodMonth, periodYear]);

    React.useEffect(() => {
        load();
    }, [load, refreshToken]);

    const monthLabel = `${new Date(periodYear, periodMonth - 1, 1).toLocaleString(undefined, { month: 'long' })} ${periodYear}`;
    const normalizedStatus = String(invoice?.status ?? '').toLowerCase();
    const isPaid = normalizedStatus === 'paid';
    const isOverdue = normalizedStatus === 'overdue';
    const dueAmount = invoice ? (isPaid ? 0 : Math.round(invoice.amount_due_lkr)) : 0;

    const normalizedItems = items.map((it) => ({
        ...it,
        event_type: String(it.event_type ?? '').toLowerCase(),
    }));
    const chargeItems = normalizedItems.filter((x) => x.event_type !== 'credit');
    const creditItems = normalizedItems.filter((x) => x.event_type === 'credit');

    const formatDateRange = (checkIn?: string | null, checkOut?: string | null) => {
        try {
            if (!checkIn && !checkOut) return '';
            const inD = checkIn ? new Date(checkIn) : null;
            const outD = checkOut ? new Date(checkOut) : null;
            if (inD && outD) {
                const same = inD.toDateString() === outD.toDateString();
                if (same) return inD.toLocaleDateString();
                return `${inD.toLocaleDateString()} – ${outD.toLocaleDateString()}`;
            }
            return (inD ?? outD)?.toLocaleDateString() ?? '';
        } catch {
            return '';
        }
    };

    const handlePay = async () => {
        try {
            if (!invoice?.id) return;
            if (isPaid) {
                setStatus('Invoice already paid');
                return;
            }
            setLoading(true);
            setStatus('');

            const { data: sessionData } = await supabase.auth.getSession();
            const accessToken = sessionData.session?.access_token ?? null;
            if (!accessToken) throw new Error('Not signed in');

            const supabaseUrl = String((supabase as any)?.supabaseUrl ?? '').replace(/\/$/, '');
            const supabaseAnonKey = String((supabase as any)?.supabaseKey ?? '');
            if (!supabaseUrl || !supabaseAnonKey) throw new Error('Missing Supabase client configuration');

            const res = await fetch(`${supabaseUrl}/functions/v1/payhere-create-checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    apikey: supabaseAnonKey,
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ invoice_id: invoice.id }),
            });

            const data = await res.json().catch(() => null);
            if (!res.ok) {
                const serverMsg = typeof (data as any)?.error === 'string' ? (data as any).error : '';
                throw new Error(serverMsg || `PayHere checkout failed (${res.status})`);
            }

            const html = (data as any)?.html;
            if (typeof html !== 'string' || !html.trim()) throw new Error('Missing PayHere checkout payload');
            onOpenPayHere(html);
        } catch (e: any) {
            setStatus(typeof e?.message === 'string' ? e.message : 'Failed to start PayHere checkout');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.get() }}>
            <View style={{ paddingHorizontal: 16, paddingTop: insets.top + 8, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.surface.get(), borderBottomWidth: 1, borderBottomColor: theme.borderColor.get() }}>
                <Button variant="ghost" icon={<Icon name="arrow-left" size={24} color={theme.color.get()} />} onPress={onBack} width={48} height={48} />
                <Text variant="title" style={{ fontWeight: 'bold' }}>Payments</Text>
                <Button variant="ghost" icon={<Icon name="refresh" size={24} color={theme.color.get()} />} onPress={load} disabled={loading} width={48} height={48} />
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 + insets.bottom, gap: 16 }}
            >
                <Card variant="filled" style={{ borderRadius: 16, padding: 24, backgroundColor: theme.surface.get() }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View>
                            <Text variant="body" style={{ color: theme.gray11.get() }}>{monthLabel}</Text>
                            <Text variant="title" style={{ fontWeight: 'bold', color: theme.primary.get(), marginTop: 8, fontSize: 32 }}>
                                LKR {dueAmount.toLocaleString()}
                            </Text>
                            <Text variant="label" style={{ color: theme.gray11.get(), marginTop: 4 }}>
                                Commission due (2.2%)
                            </Text>
                        </View>
                        <Chip
                            icon={<Icon name={isPaid ? "check" : isOverdue ? "alert-circle-outline" : "clock-outline"} size={16} color={isPaid ? theme.onSecondaryContainer.get() : isOverdue ? theme.onErrorContainer.get() : theme.onSurfaceVariant.get()} />}
                            style={{ backgroundColor: isPaid ? theme.secondaryContainer.get() : isOverdue ? theme.errorContainer.get() : theme.surfaceVariant.get() }}
                        >
                            <Text style={{ color: isPaid ? theme.onSecondaryContainer.get() : isOverdue ? theme.onErrorContainer.get() : theme.onSurfaceVariant.get(), fontSize: 12 }}>
                                {isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Due'}
                            </Text>
                        </Chip>
                    </View>

                    {invoice?.due_at && !isPaid && (
                        <View style={{ marginTop: 16, padding: 8, backgroundColor: theme.surfaceVariant.get(), borderRadius: 8 }}>
                            <Text variant="label" style={{ textAlign: 'center', color: theme.onSurfaceVariant.get() }}>
                                Due by {new Date(invoice.due_at).toLocaleDateString()}
                            </Text>
                        </View>
                    )}
                </Card>

                {status ? (
                    <View style={{ padding: 16, backgroundColor: theme.errorContainer.get(), borderRadius: 8 }}>
                        <Text style={{ color: theme.onErrorContainer.get(), textAlign: 'center' }}>{status}</Text>
                    </View>
                ) : null}

                <Text variant="label" style={{ color: theme.primary.get(), fontWeight: 'bold', marginLeft: 8 }}>Breakdown</Text>

                <Card variant="filled" style={{ borderRadius: 16, overflow: 'hidden', backgroundColor: theme.surface.get(), padding: 0 }}>
                    <View style={{ padding: 16, paddingBottom: 8 }}>
                        <Text variant="label" style={{ fontWeight: 'bold' }}>Confirmed Bookings</Text>
                    </View>
                    {chargeItems.length ? (
                        chargeItems.map((it, idx) => (
                            <React.Fragment key={it.id}>
                                <Button variant="ghost" style={{ paddingVertical: 12, height: 'auto', justifyContent: 'flex-start' }}>
                                    <XStack alignItems="center" width="100%">
                                        <Icon name="calendar-check" size={24} color={theme.color.get()} />
                                        <YStack flex={1} marginLeft="$3">
                                            <Text variant="body" style={{ fontWeight: 'bold' }}>{it.booking_reference ?? `Booking #${it.booking_id.slice(0, 4)}`}</Text>
                                            <Text variant="label" style={{ color: theme.gray11.get() }}>
                                                {`${formatDateRange(it.check_in, it.check_out)}\nTotal: LKR ${Math.round(it.booking_total_lkr).toLocaleString()}`}
                                            </Text>
                                        </YStack>
                                        <View style={{ justifyContent: 'center', paddingRight: 8 }}>
                                            <Text variant="body" style={{ fontWeight: 'bold' }}>LKR {Math.round(it.commission_lkr)}</Text>
                                        </View>
                                    </XStack>
                                </Button>
                                {idx !== chargeItems.length - 1 ? <Divider /> : null}
                            </React.Fragment>
                        ))
                    ) : (
                        <Button variant="ghost" style={{ paddingVertical: 12, height: 'auto', justifyContent: 'flex-start' }}>
                            <XStack alignItems="center" width="100%">
                                <Icon name="check-circle-outline" size={24} color={theme.gray11.get()} />
                                <Text variant="body" style={{ marginLeft: 16 }}>No bookings this month</Text>
                            </XStack>
                        </Button>
                    )}

                    {creditItems.length > 0 && (
                        <>
                            <Divider style={{ height: 8, backgroundColor: theme.surfaceVariant.get() }} />
                            <View style={{ padding: 16, paddingBottom: 8 }}>
                                <Text variant="label" style={{ fontWeight: 'bold' }}>Adjustments</Text>
                            </View>
                            {creditItems.map((it, idx) => (
                                <React.Fragment key={it.id}>
                                    <Button variant="ghost" style={{ paddingVertical: 12, height: 'auto', justifyContent: 'flex-start' }}>
                                        <XStack alignItems="center" width="100%">
                                            <Icon name="credit-card-refund" size={24} color={theme.color.get()} />
                                            <YStack flex={1} marginLeft="$3">
                                                <Text variant="body" style={{ fontWeight: 'bold' }}>Credit Adjustment</Text>
                                                <Text variant="label" style={{ color: theme.gray11.get() }}>
                                                    {it.occurred_at ? new Date(it.occurred_at).toLocaleDateString() : 'Manual credit'}
                                                </Text>
                                            </YStack>
                                            <View style={{ justifyContent: 'center', paddingRight: 8 }}>
                                                <Text variant="body" style={{ fontWeight: 'bold', color: theme.primary.get() }}>- LKR {Math.round(it.commission_lkr)}</Text>
                                            </View>
                                        </XStack>
                                    </Button>
                                    {idx !== creditItems.length - 1 ? <Divider /> : null}
                                </React.Fragment>
                            ))}
                        </>
                    )}
                </Card>
            </ScrollView>

            {!isPaid && (
                <View style={{ padding: 16, paddingBottom: 16 + insets.bottom, backgroundColor: theme.surface.get(), borderTopWidth: 1, borderTopColor: theme.borderColor.get() }}>
                    <Button
                        variant="primary"
                        onPress={handlePay}
                        disabled={loading || !invoice || invoice.amount_due_lkr <= 0}
                        style={{ borderRadius: 100, height: 48 }}
                    >
                        {loading ? 'Processing...' : `Pay LKR ${dueAmount.toLocaleString()}`}
                    </Button>
                </View>
            )}
        </View>
    );
}
