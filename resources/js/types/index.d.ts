export interface User {
    id: number;

    name: string;

    email: string;

    phone: string;

    email_verified_at: null;

    avatar_url: string;

    barber_bookings_count: number;

    role: 'customer' | 'barber' | 'admin';

    status: 'active' | 'inactive' | 'suspended';

    created_at: Date;

    barber_profile?: BarberProfile;

    received_reviews?: Review[];

    customerBookings: Booking;

    barberBookings: Booking;

    createdDiscounts?: Discount[];

    customerDiscounts?: CustomerDiscount[];

    availableDiscounts?: Discount[];

    discountUsages?: DiscountUsage[];
}

export interface BarberProfile {
    id: number;

    user_id: number;

    bio?: string;

    specialization?: string;

    experience_years: number;

    rating_average: number | string;

    total_reviews: number;

    bank_account?: string;

    commission_rate: number;

    is_available: boolean;

    services: Array<{
        id: number;

        name: string;

        duration: number;

        base_price: number;

        pivot?: { custom_price?: number };
    }>;
}

export interface Service {
    id: number;

    category_id: number;

    name: string;

    description?: string;

    duration: number;

    base_price: number;

    is_active: boolean;

    category?: ServiceCategory;

    pivot?: {
        custom_duration?: number;

        custom_price?: number;

        is_available?: boolean;
    };

    discounts?: Discount[];
}

export interface ServiceCategory {
    id: number;

    name: string;

    description?: string;

    icon?: string;

    discounts?: Discount[];

    services_count: number;
}

export interface BarberService {
    id: number;

    service_id: number;

    service_name: string;

    description?: string;

    category_name: string;

    duration: number;

    custom_duration: number | null;

    base_price: number;

    custom_price: number | null;

    is_available: boolean;
}

export interface Booking {
    can_be_cancelled: boolean;

    id: number;

    customer_id: number;

    barber_id: number;

    service_id: number;

    booking_date: string;

    start_time: string;

    end_time: string;

    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

    original_price: number;

    discount_id?: number;

    discount_amount: number;

    total_price: number;

    payment_status: 'pending' | 'paid' | 'refunded';

    payment_method?: string;

    notes?: string;

    customer?: User;

    barber?: User;

    service?: Service;

    review?: Review;

    discount?: Discount;

    discountUsage?: DiscountUsage;
}

export interface Review {
    id: number;

    booking_id: number;

    customer_id: number;

    barber_id: number;

    rating: number;

    comment?: string;

    customer?: { name: string };

    created_at: string;
}

export type DiscountStatus = 'active' | 'upcoming' | 'expired' | 'inactive';

export type ApplicableType = 'service' | 'category' | 'barber';

export interface DiscountApplicableUI {
    type: ApplicableType;

    id: number;

    name: string;
}

export interface Discount {
    id: number;

    name: string;

    code?: string;

    description?: string;

    discount_type: 'percentage' | 'fixed_amount';

    discount_value: number;

    max_discount_amount?: number;

    min_order_amount?: number;

    start_date: string;

    end_date: string;

    usage_limit?: number;

    used_count: number;

    customer_usage_limit?: number;

    is_active: boolean;

    applies_to: 'all' | 'specific';

    created_by: number;

    created_at: string;

    updated_at: string;

    status?: DiscountStatus;

    created_by_name?: string;

    remaining_quota?: number;

    is_available?: boolean;

    creator?: User;

    applicables?: DiscountApplicable[];

    customerDiscounts?: CustomerDiscount[];

    usages?: DiscountUsage[];

    services?: Service[];

    categories?: ServiceCategory[];

    barbers?: User[];

    paginate: PaginatedDiscounts[];

    customer_usage?: CustomerDiscount;

    usage_stats?: {
        total_used: number;

        remaining_quota: number | null;

        usage_percentage: number;

        total_revenue: number;

        total_discount_given: number;
    };
}

export interface DiscountApplicable {
    id: number;

    name: string;

    discount_id: number;

    applicable_type: ApplicableType;

    applicable_id: number;

    created_at: string;

    updated_at: string;

    discount?: Discount;

    applicable?: Service | ServiceCategory | User;
}

export interface CustomerDiscount {
    id: number;

    customer_id: number;

    discount_id: number;

    used_count: number;

    max_usage?: number;

    expires_at?: string;

    created_at: string;

    updated_at: string;

    customer_name?: string;

    customer?: User;

    discount?: Discount;
}

export interface DiscountUsage {
    id: number;

    discount_id: number;

    customer_id: number;

    booking_id: number;

    original_amount: number;

    discount_amount: number;

    final_amount: number;

    used_at: string;

    discount?: Discount;

    customer?: User;

    booking?: Booking;
}

export interface DashboardStats {
    pending_reviews: number;

    upcoming_bookings: number;

    total_users: number;

    total_barbers: number;

    total_customers: number;

    total_bookings: number;

    pending_bookings: number;

    confirmed_bookings: number;

    completed_bookings: number;

    cancelled_bookings: number;

    total_revenue: number;

    monthly_revenue: number;

    total_services: number;

    active_services: number;

    average_rating: number;

    total_reviews: number;

    revenue_growth: number;

    booking_growth: number;

    total_discounts?: number;

    active_discounts?: number;

    total_discount_amount?: number;

    discount_savings?: number;

    today_bookings: number;

    completed_today: number;

    earnings_today: number;

    earnings_month: number;

    completion_rate: number;

    monthly_target: number;

    total_spent?: number;
}

export interface WeeklyActivity {
    day: string;

    bookings: number;

    earnings: number;
}

export interface ReportDataPoint {
    date: string;

    revenue: number;

    bookings: number;
}

export interface ReportBarberData {
    id: number;

    name: string;

    avatar_url: string;

    total_bookings: number;

    revenue: number;

    bookings: number;

    completed_bookings: number;

    barberProfile?: {
        commission_rate: number;
    };

    barberBookings?: Array<{ revenue: number }>;
}

export interface ReportServiceData {
    id: number;

    name: string;

    category?: { name: string };

    total_bookings: number;

    count: number;

    bookings?: Array<{ revenue: number }>;
}

export interface ReportStatusData {
    status: string;

    count: number;
}

export interface ReportData {
    total?: number;

    by_day?: ReportDataPoint[];

    by_barber?: ReportBarberData[];

    by_status?: ReportStatusData[];

    by_service?: ReportServiceData[];

    [index: number]: any;
}

export interface DailyEarning {
    day: string;

    bookings: number;

    earnings: number;
}

export interface TopService {
    name: string;

    count: number;

    revenue: number;
}

export interface BarberSchedule {
    id?: number;

    day_of_week: number;

    start_time: string | null;

    end_time: string | null;

    is_available: boolean;
}

export interface BarberTimeOff {
    id: number;

    barber_id: number;

    start_date: string;

    end_date: string;

    reason: string;
}

export interface TopBarber {
    id: number;

    name: string;

    avatar_url: string;

    total_bookings: number;

    completed_bookings: number;

    barber_profile: {
        rating_average: number | string;
    };
}

export interface DiscountRecommendation {
    id: number;
    name: string;
    code: string;
    description?: string;
    discount_type: 'percentage' | 'fixed_amount';
    discount_value: number;
    max_discount_amount?: number;
    min_order_amount?: number;
    discount_amount: number;
    final_price: number;
    is_eligible: boolean;
    eligibility_message?: string;
}

export interface BookingStatusCount {
    status: string;

    count: number;
}

export interface PeakHour {
    hour: number;

    bookings: number;
}

export interface RecentBooking {
    id: number;

    customer: {
        name: string;

        avatar_url: string;
    };

    service: { name: string };

    booking_date: string;

    start_time: string;

    status: string;

    total_price: number;
}

export interface RecentBooking {
    id: number;

    customer: User;

    barber: User;

    service: Service;

    booking_date: string;

    start_time: string;

    status: string;

    total_price: number;

    original_price?: number;

    discount_amount?: number;

    discount?: Discount;
}

export interface ValidateDiscountResponse {
    success: boolean;

    message: string;

    discount?: {
        id: number;

        name: string;

        code: string;

        discount_type: 'percentage' | 'fixed_amount';

        discount_value: number;

        discount_amount: number;

        final_price: number;
    };
}

export interface UserFilters {
    search?: string;

    role?: 'all' | 'customer' | 'barber' | 'admin';

    status?: 'all' | 'active' | 'inactive' | 'suspended';
}

export interface ServiceFilters {
    search?: string;

    category_id?: string;

    status?: 'all' | 'active' | 'inactive';
}

export interface DiscountFilters {
    search?: string;

    status?: 'all' | 'active' | 'upcoming' | 'expired' | 'inactive';

    discount_type?: 'percentage' | 'fixed_amount' | 'all';

    applies_to?: 'all' | 'specific';

    has_quota?: boolean;

    date_from?: string;

    date_to?: string;
}



export interface CustomerDiscountFilters {
    type?: 'percentage' | 'fixed_amount' | 'all';

    applies_to?: 'all' | 'specific';

    has_quota?: boolean;

    search?: string;
}

export interface DiscountUsageFilters {
    date_from?: string;

    date_to?: string;

    customer_id?: string;
}

export interface BookingFilters {
    status?:
        | 'all'
        | 'pending'
        | 'confirmed'
        | 'in_progress'
        | 'completed'
        | 'cancelled';

    date_from?: string;

    date_to?: string;

    search?: string;

    barber_id: string;
}

interface StatusCounts {
    all: number;
    pending: number;
    confirmed: number;
    in_progress: number;
    completed: number;
    cancelled: number;
}

export interface CalendarBooking {
    id: number;

    start: string;

    customer: string;

    service: string;

    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
}

export interface BarberFilters {
    search?: string;

    service_id?: string;

    status?: 'all' | 'active' | 'inactive' | 'suspended';

    availability?: 'all' | 'available' | 'unavailable';
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};

export interface CreateDiscountForm {
    name: string;

    code?: string | null;

    description?: string | null;

    discount_type: 'percentage' | 'fixed_amount';

    discount_value: number;

    max_discount_amount?: number | null;

    min_order_amount?: number | null;

    start_date: string;

    end_date: string;

    usage_limit?: number | null;

    customer_usage_limit?: number | null;

    is_active: boolean;

    applies_to: 'all' | 'specific';

    applicable_services?: number[] | null;

    applicable_categories?: number[] | null;

    applicable_barbers?: number[] | null;
}

export interface PaginatedDiscounts {
    data: Discount[];

    current_page: number;

    last_page: number;

    total: number;

    has_more_pages: boolean;

    prev_page_url: string;

    next_page_url?: string;
}

export interface PaginatedDiscountUsages {
    data: DiscountUsage[];

    current_page: number;

    last_page: number;

    total: number;
}

export interface PaginationLink {
    url: string | null;

    label: string;

    active: boolean;
}

export interface PaginatedData<T> {
    data: T[];

    links: PaginationLink[];

    total: number;

    current_page: number;

    from: number;

    last_page: number;

    path: string;

    per_page: number;

    to: number;
}

// ========== UNUSED TYPES ==========

export interface UpdateDiscountForm extends CreateDiscountForm {
    id: number;
}

// ========== COMPUTED DISCOUNT TYPES ==========

export interface DiscountEligibility {
    is_eligible: boolean;

    message?: string;

    discount_amount?: number;

    final_price?: number;
}

// ========== Pagination ==========

export interface DiscountCalculation {
    original_amount: number;

    discount_amount: number;

    final_amount: number;

    discount_type: 'percentage' | 'fixed_amount';

    discount_value: number;

    max_discount_amount?: number;
}

export interface ValidateDiscountRequest {
    discount_code: string;

    service_id: number;

    barber_id: number;

    original_price: number;
}
