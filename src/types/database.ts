export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type TableDef<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: never[];
};

type Timestamped = {
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<
        {
          id: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: "admin" | "customer";
          status: "active" | "inactive";
        } & Timestamped
      >;
      categories: TableDef<
        {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          type: string | null;
        } & Timestamped
      >;
      destinations: TableDef<
        {
          id: string;
          category_id: string | null;
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
          status: "draft" | "published";
        } & Timestamped
      >;
      travel_packages: TableDef<
        {
          id: string;
          destination_id: string | null;
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
          status: "draft" | "published";
        } & Timestamped
      >;
      package_itineraries: TableDef<
        {
          id: string;
          package_id: string;
          day_number: number;
          title: string;
          description: string;
          location: string | null;
          time: string | null;
        } & Timestamped
      >;
      bookings: TableDef<
        {
          id: string;
          user_id: string | null;
          package_id: string | null;
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
          status: "pending" | "confirmed" | "paid" | "completed" | "cancelled";
        } & Timestamped
      >;
      testimonials: TableDef<
        {
          id: string;
          user_id: string | null;
          customer_name: string;
          customer_photo_url: string | null;
          rating: number;
          content: string;
          status: "draft" | "published";
        } & Timestamped
      >;
      gallery: TableDef<
        {
          id: string;
          title: string;
          image_url: string;
          category: string | null;
          status: "draft" | "published";
        } & Timestamped
      >;
      blog_posts: TableDef<
        {
          id: string;
          author_id: string | null;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string;
          cover_image_url: string | null;
          category: string | null;
          status: "draft" | "published";
          seo_title: string | null;
          seo_description: string | null;
          published_at: string | null;
        } & Timestamped
      >;
      contact_messages: TableDef<{
        id: string;
        full_name: string;
        email: string;
        phone: string | null;
        subject: string | null;
        message: string;
        status: "unread" | "read" | "archived";
        created_at: string;
      }>;
      site_settings: TableDef<
        {
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
        } & Timestamped
      >;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      generate_booking_code: { Args: Record<PropertyKey, never>; Returns: string };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
