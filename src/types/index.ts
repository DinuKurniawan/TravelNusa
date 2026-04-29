export type UserRole = "admin" | "customer";
export type PublishStatus = "draft" | "published";
export type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "paid"
  | "completed"
  | "cancelled"
  | "expired";
export type PaymentStatus =
  | "pending"
  | "settlement"
  | "capture"
  | "expire"
  | "cancel"
  | "deny"
  | "failure"
  | "refund";
export type TicketStatus = "active" | "used" | "cancelled";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  type: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Destination = {
  id: string;
  category_id: string | null;
  categories?: Pick<Category, "name" | "slug" | "icon"> | null;
  name: string;
  slug: string;
  province: string;
  city: string;
  address: string | null;
  description: string;
  facilities: string[];
  main_image_url: string | null;
  gallery_urls: string[];
  latitude: number | null;
  longitude: number | null;
  is_featured: boolean;
  status: PublishStatus;
  created_at?: string;
  updated_at?: string;
};

export type TravelPackage = {
  id: string;
  destination_id: string | null;
  destinations?: Pick<Destination, "name" | "slug" | "province" | "city"> | null;
  name: string;
  slug: string;
  short_description: string | null;
  description: string;
  price: number;
  discount_price: number | null;
  duration_days: number;
  duration_nights: number;
  quota: number;
  included: string[];
  excluded: string[];
  main_image_url: string | null;
  gallery_urls: string[];
  rating: number;
  total_reviews: number;
  is_featured: boolean;
  status: PublishStatus;
  created_at?: string;
  updated_at?: string;
};

export type PackageItinerary = {
  id: string;
  package_id: string;
  day_number: number;
  title: string;
  description: string;
  location: string | null;
  time: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Booking = {
  id: string;
  user_id: string | null;
  package_id: string | null;
  travel_packages?: (Pick<TravelPackage, "id" | "name" | "slug" | "main_image_url" | "price" | "discount_price" | "quota"> & {
    destinations?: Pick<Destination, "name" | "slug" | "province" | "city"> | null;
  }) | null;
  payments?: Payment[] | null;
  tickets?: Ticket[] | null;
  booking_code: string;
  full_name: string;
  email: string;
  phone: string;
  departure_date: string;
  participant_count: number;
  price_per_person: number;
  total_price: number;
  note: string | null;
  admin_note: string | null;
  booking_status: BookingStatus;
  created_at?: string;
  updated_at?: string;
};

export type Payment = {
  id: string;
  booking_id: string;
  bookings?: Pick<Booking, "booking_code" | "full_name" | "email" | "phone"> | null;
  order_id: string;
  snap_token: string | null;
  snap_redirect_url: string | null;
  payment_type: string | null;
  transaction_id: string | null;
  transaction_status: string;
  fraud_status: string | null;
  gross_amount: number;
  currency: string;
  payment_status: PaymentStatus;
  raw_response: unknown | null;
  paid_at: string | null;
  expired_at: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Ticket = {
  id: string;
  booking_id: string;
  ticket_code: string;
  qr_code_url: string | null;
  pdf_url: string | null;
  ticket_status: TicketStatus;
  issued_at: string;
  used_at: string | null;
  created_at?: string;
  updated_at?: string;
};

export type PaymentLog = {
  id: string;
  payment_id: string;
  order_id: string | null;
  event_type: string | null;
  transaction_status: string | null;
  payload: unknown | null;
  created_at?: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  status: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
};

export type Testimonial = {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_photo_url: string | null;
  rating: number;
  content: string;
  status: PublishStatus;
  created_at?: string;
  updated_at?: string;
};

export type GalleryItem = {
  id: string;
  title: string;
  image_url: string;
  category: string | null;
  status: PublishStatus;
  created_at?: string;
  updated_at?: string;
};

export type BlogPost = {
  id: string;
  author_id: string | null;
  profiles?: Pick<Profile, "full_name" | "avatar_url"> | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  category: string | null;
  status: PublishStatus;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at?: string;
  updated_at?: string;
};

export type SiteSettings = {
  id: string;
  site_name: string;
  logo_url: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at?: string;
  updated_at?: string;
};
