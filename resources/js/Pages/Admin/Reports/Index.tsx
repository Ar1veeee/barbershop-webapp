import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    PageProps,
    ReportBarberData,
    ReportData,
    ReportDataPoint,
    ReportServiceData,
    ReportStatusData,
} from '@/types';
import { Head, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { motion, Variants } from 'framer-motion';
import {
    BarChart3,
    Calendar,
    DollarSign,
    Download,
    Scissors,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface ReportsIndexProps extends PageProps {
    type: string;
    startDate: string;
    endDate: string;
    data: ReportData;
}

const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 120, damping: 16 },
    },
};

const stagger: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { delayChildren: 0.2 },
    },
};

const tabs = [
    { value: 'revenue', label: 'Revenue', icon: DollarSign },
    { value: 'bookings', label: 'Bookings', icon: Calendar },
    { value: 'barbers', label: 'Barbers', icon: Users },
    { value: 'services', label: 'Services', icon: Scissors },
];

const EmptyChart = ({
    message = 'No data available',
}: {
    message?: string;
}) => (
    <div className="flex h-64 items-center justify-center rounded-lg bg-zinc-50 sm:h-80">
        <div className="text-center text-zinc-500">
            <BarChart3 className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p className="text-sm">{message}</p>
        </div>
    </div>
);

export default function Index({
    type,
    startDate,
    endDate,
    data,
}: ReportsIndexProps) {
    const [activeTab, setActiveTab] = useState(type);
    const [start, setStart] = useState(startDate);
    const [end, setEnd] = useState(endDate);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const updateUrl = useCallback(() => {
        router.get(
            route('admin.reports.index'),
            { type: activeTab, start_date: start, end_date: end },
            { preserveState: true, preserveScroll: true },
        );
    }, [activeTab, start, end]);

    useEffect(() => {
        const timeout = setTimeout(updateUrl, 600);
        return () => clearTimeout(timeout);
    }, [start, end, activeTab, updateUrl]);

    const formatRupiah = (value: number) =>
        `Rp ${value.toLocaleString('id-ID')}`;

    const getData = (key: keyof ReportData, defaultValue: any = []) => {
        return data && data[key] !== undefined ? data[key] : defaultValue;
    };

    const getChartData = (): ReportDataPoint[] => {
        const chartData = getData('by_day', []);
        return chartData && chartData.length > 0 ? chartData : [];
    };

    const hasChartData = getChartData().length > 0;

    return (
        <AuthenticatedLayout>
            <Head title="Reports" />

            <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 py-6 sm:py-8 lg:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="mb-2 text-4xl font-black tracking-tighter text-black sm:text-5xl lg:text-6xl">
                                    Reports
                                </h1>
                                <p className="text-base font-medium text-zinc-600 sm:text-lg">
                                    Business insights at a glance
                                </p>
                            </div>
                            <Button className="h-11 bg-black px-5 font-semibold shadow-sm hover:bg-zinc-800">
                                <Download className="mr-2 h-5 w-5" />
                                <span className="hidden sm:inline">Export</span>
                            </Button>
                        </div>
                    </motion.div>

                    {/* Date Range */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <Card className="border-zinc-200 bg-white/80 shadow-sm backdrop-blur">
                            <CardContent className="p-4 sm:p-5">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                                    {/* Date Inputs */}
                                    <div className="flex-1">
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="start-date"
                                                    className="text-xs font-medium text-zinc-700"
                                                >
                                                    Start Date
                                                </Label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-zinc-400" />
                                                    <Input
                                                        id="start-date"
                                                        type="date"
                                                        value={start}
                                                        onChange={(e) =>
                                                            setStart(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-10 border-zinc-300 pl-10 focus:border-black focus:ring-1 focus:ring-black"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="end-date"
                                                    className="text-xs font-medium text-zinc-700"
                                                >
                                                    End Date
                                                </Label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-zinc-400" />
                                                    <Input
                                                        id="end-date"
                                                        type="date"
                                                        value={end}
                                                        onChange={(e) =>
                                                            setEnd(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-10 border-zinc-300 pl-10 focus:border-black focus:ring-1 focus:ring-black"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const today = new Date()
                                                    .toISOString()
                                                    .split('T')[0];
                                                setStart(today);
                                                setEnd(today);
                                            }}
                                            className="h-9 border-zinc-300 text-xs hover:border-black hover:bg-zinc-50"
                                        >
                                            Today
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const start = new Date();
                                                start.setDate(
                                                    start.getDate() - 7,
                                                );
                                                const end = new Date();
                                                setStart(
                                                    start
                                                        .toISOString()
                                                        .split('T')[0],
                                                );
                                                setEnd(
                                                    end
                                                        .toISOString()
                                                        .split('T')[0],
                                                );
                                            }}
                                            className="h-9 border-zinc-300 text-xs hover:border-black hover:bg-zinc-50"
                                        >
                                            Last 7 Days
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const start = new Date(
                                                    new Date().getFullYear(),
                                                    new Date().getMonth(),
                                                    1,
                                                );
                                                const end = new Date();
                                                setStart(
                                                    start
                                                        .toISOString()
                                                        .split('T')[0],
                                                );
                                                setEnd(
                                                    end
                                                        .toISOString()
                                                        .split('T')[0],
                                                );
                                            }}
                                            className="h-9 border-zinc-300 text-xs hover:border-black hover:bg-zinc-50"
                                        >
                                            This Month
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Tabs */}
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <TabsList className="grid h-auto w-full grid-cols-2 rounded-xl bg-zinc-100 p-1 sm:grid-cols-4">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        className="rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                    >
                                        <Icon className="mr-2 h-4 w-4" />
                                        <span>{tab.label}</span>
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>

                        {/* Revenue Tab */}
                        <TabsContent value="revenue" className="mt-6">
                            <motion.div
                                variants={stagger}
                                initial="hidden"
                                animate="visible"
                            >
                                <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                                    <motion.div variants={fadeInUp}>
                                        <Card className="border-zinc-200">
                                            <CardContent className="p-5">
                                                <p className="text-xs text-zinc-500">
                                                    Total Revenue
                                                </p>
                                                <p className="mt-1 text-2xl font-black text-black">
                                                    {formatRupiah(
                                                        getData('total', 0),
                                                    )}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                    <motion.div variants={fadeInUp}>
                                        <Card className="border-zinc-200">
                                            <CardContent className="p-5">
                                                <p className="text-xs text-zinc-500">
                                                    Total Bookings
                                                </p>
                                                <p className="mt-1 text-2xl font-black text-black">
                                                    {getData(
                                                        'by_day',
                                                        [],
                                                    ).reduce(
                                                        (sum: number, d: any) =>
                                                            sum +
                                                            (d.bookings || 0),
                                                        0,
                                                    )}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                    <motion.div variants={fadeInUp}>
                                        <Card className="border-zinc-200">
                                            <CardContent className="p-5">
                                                <p className="text-xs text-zinc-500">
                                                    Avg per Day
                                                </p>
                                                <p className="mt-1 text-2xl font-black text-black">
                                                    {getData('by_day', [])
                                                        .length > 0
                                                        ? formatRupiah(
                                                              Math.round(
                                                                  getData(
                                                                      'total',
                                                                      0,
                                                                  ) /
                                                                      getData(
                                                                          'by_day',
                                                                          [],
                                                                      ).length,
                                                              ),
                                                          )
                                                        : 'Rp 0'}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </div>

                                <motion.div
                                    variants={fadeInUp}
                                    className="mb-6"
                                >
                                    <Card className="border-zinc-200">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-lg font-bold text-black">
                                                <TrendingUp className="h-5 w-5" />
                                                Revenue Trend
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div
                                                className="h-64 min-h-0 sm:h-80"
                                                style={{ minWidth: 0 }}
                                            >
                                                {isClient && hasChartData ? (
                                                    <ResponsiveContainer
                                                        width="100%"
                                                        height="100%"
                                                        minWidth={0}
                                                    >
                                                        <LineChart
                                                            data={getChartData()}
                                                            margin={{
                                                                top: 5,
                                                                right: 30,
                                                                left: 20,
                                                                bottom: 5,
                                                            }}
                                                        >
                                                            <CartesianGrid
                                                                strokeDasharray="3 3"
                                                                stroke="#f4f4f5"
                                                            />
                                                            <XAxis
                                                                dataKey="date"
                                                                tickFormatter={(
                                                                    v,
                                                                ) =>
                                                                    format(
                                                                        parseISO(
                                                                            v,
                                                                        ),
                                                                        'dd MMM',
                                                                        {
                                                                            locale: id,
                                                                        },
                                                                    )
                                                                }
                                                                stroke="#71717a"
                                                                fontSize={12}
                                                            />
                                                            <YAxis
                                                                stroke="#71717a"
                                                                fontSize={12}
                                                                tickFormatter={(
                                                                    value,
                                                                ) =>
                                                                    formatRupiah(
                                                                        value,
                                                                    )
                                                                }
                                                            />
                                                            <Tooltip
                                                                contentStyle={{
                                                                    backgroundColor:
                                                                        '#fff',
                                                                    border: '1px solid #e4e4e7',
                                                                    borderRadius:
                                                                        '8px',
                                                                    boxShadow:
                                                                        '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                                }}
                                                                formatter={(
                                                                    value: any,
                                                                ) => [
                                                                    formatRupiah(
                                                                        value,
                                                                    ),
                                                                    'Revenue',
                                                                ]}
                                                                labelFormatter={(
                                                                    label,
                                                                ) =>
                                                                    `Date: ${format(parseISO(label), 'dd MMM yyyy', { locale: id })}`
                                                                }
                                                            />
                                                            <Line
                                                                type="monotone"
                                                                dataKey="revenue"
                                                                stroke="#000"
                                                                strokeWidth={2}
                                                                dot={{
                                                                    fill: '#000',
                                                                    strokeWidth: 2,
                                                                    r: 4,
                                                                }}
                                                                activeDot={{
                                                                    r: 6,
                                                                    stroke: '#000',
                                                                    strokeWidth: 2,
                                                                }}
                                                            />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <EmptyChart
                                                        message={
                                                            hasChartData
                                                                ? 'Loading chart...'
                                                                : 'No revenue data available for the selected period'
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                <motion.div variants={fadeInUp}>
                                    <Card className="border-zinc-200">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-bold text-black">
                                                Top Barbers
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {getData('by_barber', [])
                                                    .length > 0 ? (
                                                    getData(
                                                        'by_barber',
                                                        [],
                                                    ).map(
                                                        (
                                                            b: ReportBarberData,
                                                            i: number,
                                                        ) => (
                                                            <div
                                                                key={i}
                                                                className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-zinc-50"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white">
                                                                        {b.name?.charAt(
                                                                            0,
                                                                        ) ||
                                                                            'B'}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium text-black">
                                                                            {b.name ||
                                                                                'Unknown Barber'}
                                                                        </p>
                                                                        <p className="text-xs text-zinc-500">
                                                                            {b.bookings ||
                                                                                0}{' '}
                                                                            bookings
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <p className="font-bold text-black">
                                                                    {formatRupiah(
                                                                        b.revenue ||
                                                                            0,
                                                                    )}
                                                                </p>
                                                            </div>
                                                        ),
                                                    )
                                                ) : (
                                                    <div className="py-8 text-center text-zinc-500">
                                                        <Users className="mx-auto mb-2 h-8 w-8 opacity-50" />
                                                        <p className="text-sm">
                                                            No barber data
                                                            available
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </motion.div>
                        </TabsContent>

                        {/* Bookings Tab */}
                        <TabsContent value="bookings" className="mt-6">
                            <motion.div
                                variants={stagger}
                                initial="hidden"
                                animate="visible"
                            >
                                <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                                    {[
                                        'pending',
                                        'confirmed',
                                        'completed',
                                        'cancelled',
                                    ].map((status) => {
                                        const count =
                                            getData('by_status', []).find(
                                                (s: ReportStatusData) =>
                                                    s.status === status,
                                            )?.count || 0;
                                        return (
                                            <motion.div
                                                key={status}
                                                variants={fadeInUp}
                                            >
                                                <Card className="border-zinc-200">
                                                    <CardContent className="p-4 text-center">
                                                        <p className="text-xs capitalize text-zinc-500">
                                                            {status}
                                                        </p>
                                                        <p className="mt-1 text-2xl font-black text-black">
                                                            {count}
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                <motion.div variants={fadeInUp}>
                                    <Card className="border-zinc-200">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-bold text-black">
                                                Top Services
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {getData('by_service', [])
                                                    .length > 0 ? (
                                                    getData(
                                                        'by_service',
                                                        [],
                                                    ).map(
                                                        (
                                                            s: ReportServiceData,
                                                            i: number,
                                                        ) => (
                                                            <div
                                                                key={i}
                                                                className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-zinc-50"
                                                            >
                                                                <div>
                                                                    <p className="font-medium text-black">
                                                                        {s.name ||
                                                                            'Unknown Service'}
                                                                    </p>
                                                                </div>
                                                                <p className="font-bold text-black">
                                                                    {s.count ||
                                                                        0}{' '}
                                                                    bookings
                                                                </p>
                                                            </div>
                                                        ),
                                                    )
                                                ) : (
                                                    <div className="py-8 text-center text-zinc-500">
                                                        <Scissors className="mx-auto mb-2 h-8 w-8 opacity-50" />
                                                        <p className="text-sm">
                                                            No service data
                                                            available
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </motion.div>
                        </TabsContent>

                        {/* Barbers Tab */}
                        <TabsContent value="barbers" className="mt-6">
                            <motion.div
                                variants={stagger}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                            >
                                {(Array.isArray(data) ? data : []).length >
                                0 ? (
                                    (Array.isArray(data) ? data : []).map(
                                        (barber: ReportBarberData) => (
                                            <motion.div
                                                key={barber.id}
                                                variants={fadeInUp}
                                            >
                                                <Card className="border-zinc-200 transition-shadow hover:shadow-lg">
                                                    <CardContent className="p-5">
                                                        <div className="mb-4 flex items-center gap-3">
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 font-bold text-white">
                                                                {barber.name?.charAt(
                                                                    0,
                                                                ) || 'B'}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-black">
                                                                    {barber.name ||
                                                                        'Unknown Barber'}
                                                                </p>
                                                                <p className="text-xs text-zinc-500">
                                                                    Commission:{' '}
                                                                    {barber
                                                                        .barberProfile
                                                                        ?.commission_rate ||
                                                                        0}
                                                                    %
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-zinc-600">
                                                                    Total
                                                                    Bookings
                                                                </span>
                                                                <span className="font-semibold text-black">
                                                                    {barber.total_bookings ||
                                                                        0}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-zinc-600">
                                                                    Completed
                                                                </span>
                                                                <span className="font-semibold text-black">
                                                                    {barber.completed_bookings ||
                                                                        0}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between border-t border-zinc-100 pt-2">
                                                                <span className="text-zinc-600">
                                                                    Revenue
                                                                </span>
                                                                <span className="font-bold text-black">
                                                                    {formatRupiah(
                                                                        barber
                                                                            .barberBookings?.[0]
                                                                            ?.revenue ||
                                                                            0,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ),
                                    )
                                ) : (
                                    <div className="col-span-full py-12 text-center text-zinc-500">
                                        <Users className="mx-auto mb-3 h-12 w-12 opacity-50" />
                                        <p className="text-lg font-medium">
                                            No barber data available
                                        </p>
                                        <p className="mt-1 text-sm">
                                            Try selecting a different date range
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        </TabsContent>

                        {/* Services Tab */}
                        <TabsContent value="services" className="mt-6">
                            <motion.div
                                variants={stagger}
                                initial="hidden"
                                animate="visible"
                                className="space-y-4"
                            >
                                {(Array.isArray(data) ? data : []).length >
                                0 ? (
                                    (Array.isArray(data) ? data : []).map(
                                        (service: ReportServiceData) => (
                                            <motion.div
                                                key={service.id}
                                                variants={fadeInUp}
                                            >
                                                <Card className="border-zinc-200 transition-shadow hover:shadow-md">
                                                    <CardContent className="p-5">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex flex-1 items-center gap-3">
                                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
                                                                    <Scissors className="h-6 w-6 text-zinc-600" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="font-bold text-black">
                                                                        {service.name ||
                                                                            'Unknown Service'}
                                                                    </p>
                                                                    <p className="text-xs text-zinc-500">
                                                                        {service
                                                                            .category
                                                                            ?.name ||
                                                                            'Uncategorized'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-2xl font-black text-black">
                                                                    {service.total_bookings ||
                                                                        0}
                                                                </p>
                                                                <p className="text-xs text-zinc-500">
                                                                    bookings
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-3 flex justify-between border-t border-zinc-100 pt-3 text-sm">
                                                            <span className="text-zinc-600">
                                                                Revenue
                                                            </span>
                                                            <span className="font-bold text-black">
                                                                {formatRupiah(
                                                                    service
                                                                        .bookings?.[0]
                                                                        ?.revenue ||
                                                                        0,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ),
                                    )
                                ) : (
                                    <div className="py-12 text-center text-zinc-500">
                                        <Scissors className="mx-auto mb-3 h-12 w-12 opacity-50" />
                                        <p className="text-lg font-medium">
                                            No service data available
                                        </p>
                                        <p className="mt-1 text-sm">
                                            Try selecting a different date range
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
