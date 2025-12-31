CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  password text NOT NULL,
  role text NOT NULL,
  phone text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

CREATE TABLE IF NOT EXISTS leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  lead_source text NOT NULL,
  lead_status text DEFAULT 'new' NOT NULL,
  contact_name text NOT NULL,
  contact_phone text NOT NULL,
  contact_email text NOT NULL,
  vehicle_interested text,
  inquiry_date timestamp with time zone DEFAULT now() NOT NULL,
  follow_up_date timestamp with time zone,
  assigned_to uuid,
  estimated_value decimal(10,2),
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads (assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (contact_email);

CREATE TABLE IF NOT EXISTS customers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text NOT NULL,
  address text,
  lead_id uuid,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers (email);
CREATE INDEX IF NOT EXISTS idx_customers_lead_id ON customers (lead_id);

CREATE TABLE IF NOT EXISTS vehicles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  vin text NOT NULL UNIQUE,
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  color text,
  price decimal(10,2) NOT NULL,
  status text DEFAULT 'available' NOT NULL,
  mileage integer,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON vehicles (vin);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles (status);

CREATE TABLE IF NOT EXISTS trade_ins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  vin text NOT NULL,
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  mileage integer NOT NULL,
  condition text NOT NULL,
  appraised_value decimal(10,2) NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_trade_ins_vin ON trade_ins (vin);

CREATE TABLE IF NOT EXISTS sales (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  customer_id uuid NOT NULL,
  vehicle_id uuid NOT NULL,
  sale_date timestamp with time zone DEFAULT now() NOT NULL,
  sale_price decimal(10,2) NOT NULL,
  financing_type text NOT NULL,
  salesperson_id uuid NOT NULL,
  trade_in_vehicle_id uuid,
  trade_in_value decimal(10,2),
  delivery_date timestamp with time zone,
  warranty_package text,
  sale_status text DEFAULT 'pending' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales (customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_vehicle_id ON sales (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_sales_salesperson_id ON sales (salesperson_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales (sale_status);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  user_id uuid NOT NULL,
  lead_id uuid,
  type text NOT NULL,
  message text NOT NULL,
  scheduled_date timestamp with time zone NOT NULL,
  sent boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_date ON notifications (scheduled_date);
CREATE INDEX IF NOT EXISTS idx_notifications_sent ON notifications (sent);

CREATE TABLE IF NOT EXISTS activity_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  user_id uuid NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  details jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log (user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log (created_at);