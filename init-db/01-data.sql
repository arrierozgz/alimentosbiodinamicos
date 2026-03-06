--
-- PostgreSQL database dump
--

\restrict gKeurPfW6VwjUyHKhQjVNIpilWOD3714TVlFHPYoW2GZSjc5DcZZmm7HuVRNQV5

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'consumidor',
    'agricultor',
    'ganadero',
    'elaborador',
    'tienda'
);


--
-- Name: certification_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.certification_type AS ENUM (
    'ecologico',
    'ecologico_certificado',
    'biodinamico',
    'demeter'
);


--
-- Name: preparation_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.preparation_type AS ENUM (
    '500',
    '501',
    '502',
    '503',
    '504',
    '505',
    '506',
    '507',
    '508',
    'maria_thun'
);


--
-- Name: product_unit; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.product_unit AS ENUM (
    'g',
    'kg',
    'unidad',
    'litro',
    'docena'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: beta_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.beta_feedback (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    email character varying(200) NOT NULL,
    comentarios text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: beta_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.beta_feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: beta_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.beta_feedback_id_seq OWNED BY public.beta_feedback.id;


--
-- Name: biodynamic_preparations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.biodynamic_preparations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    preparation public.preparation_type NOT NULL,
    price numeric(10,2),
    unit text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: farmer_contact_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.farmer_contact_details (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    contact_email text,
    contact_phone text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: farmer_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.farmer_profiles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    farm_name text NOT NULL,
    presentation text,
    approximate_location text,
    postal_code text,
    province text,
    contact_web text,
    activity_types public.app_role[] DEFAULT '{}'::public.app_role[],
    is_public boolean DEFAULT true,
    preferred_language text DEFAULT 'es'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: farmer_profiles_public; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.farmer_profiles_public AS
 SELECT id,
    user_id,
    farm_name,
    presentation,
    approximate_location,
    postal_code,
    province,
    contact_web,
    activity_types,
    preferred_language,
    created_at,
    updated_at
   FROM public.farmer_profiles
  WHERE (is_public = true);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    from_user_id uuid NOT NULL,
    to_user_id uuid NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: product_variations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_variations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    product_id uuid NOT NULL,
    variety text,
    packaging text,
    unit public.product_unit,
    net_price numeric(10,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    product_type text,
    season text,
    photo_url text,
    certifications public.certification_type[] DEFAULT '{}'::public.certification_type[],
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    photos jsonb DEFAULT '[]'::jsonb
);


--
-- Name: user_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_preferences (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    last_unit_used public.product_unit,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    display_name text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    email_confirmed boolean DEFAULT false,
    last_sign_in timestamp with time zone
);


--
-- Name: beta_feedback id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beta_feedback ALTER COLUMN id SET DEFAULT nextval('public.beta_feedback_id_seq'::regclass);


--
-- Data for Name: beta_feedback; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.beta_feedback (id, nombre, email, comentarios, created_at) FROM stdin;
1	Javier	info@atalaya-bio.com	1.Me da error al guardar el perfil pero no me dice que campo hay que corregir. Los he cumplimentado todos...\n2.Tambien me ha pasado que al crear la cuenta me equivoque y puse consumidor/productor/ elaborado de preparados., cuando no vendemos preparados biodinamicos, pero o no sé o no me deja cambiarlo...\n3. Error 404 pinchando en el mapa.	2026-03-04 20:36:40.299309+01
2	Javier	info@atalaya-bio.com	he refrescado pero todo sigue igual.	2026-03-04 20:44:59.026147+01
3	Victor Casado	casadofrut@gmail.com	Soy productor me he registrado pero no consigo introducir productos	2026-03-04 23:15:50.10393+01
4	Victor Casado	casadofrut@gmail.com	He vuelto a intentar probar la pagina. No me deja meter productos los desplegables no funcionan y se bloquea antes de meter todos los datos	2026-03-05 22:45:18.181779+01
\.


--
-- Data for Name: biodynamic_preparations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.biodynamic_preparations (id, user_id, preparation, price, unit, is_active, created_at, updated_at) FROM stdin;
6384f512-3b96-45f1-926d-54082a8cb561	0ca65339-53ea-4a9f-ac46-3a7a425e4648	504	\N	kg	t	2026-03-05 00:53:10.275201+01	2026-03-05 00:53:10.275201+01
\.


--
-- Data for Name: farmer_contact_details; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.farmer_contact_details (id, user_id, contact_email, contact_phone, created_at, updated_at) FROM stdin;
3417616b-8295-4d1d-a4b3-b89e74ac610c	26f512a9-4ac0-4f89-8d46-f9a7a9942e16	augusto@fabara.com	666123456	2026-03-03 17:30:11.997065+01	2026-03-03 17:30:11.997065+01
e6c0ba3a-8744-4242-9f7d-7f42f45ace6c	22222222-2222-2222-2222-222222222222	agustin@azuara.com	600333444	2026-03-03 17:36:57.432663+01	2026-03-03 17:36:57.432663+01
ac3aa698-6a59-4c1c-b135-0b2461e8b3b2	44444444-4444-4444-4444-444444444444	enrique@granada.com	600777888	2026-03-03 17:36:57.442251+01	2026-03-03 17:36:57.442251+01
ff64f2f7-9569-4541-8ee3-e736cd68d7cf	f5a81465-a205-40bb-a0ca-12b72e2e9664	info@atalaya-bio.com	626982039	2026-03-04 20:20:40.745304+01	2026-03-04 20:20:40.745304+01
01216267-0b23-4502-ab59-88d55fd912c6	0ca65339-53ea-4a9f-ac46-3a7a425e4648	mcarlosmorales@hotmail.com	+346499058000	2026-03-05 00:42:08.273023+01	2026-03-05 00:42:08.273023+01
888c04e9-ff5b-47c7-b12b-30f70b9ef6ee	2168dba6-11e4-4976-a9c8-4b06d3faf862	enriqueaguilera27@gmail.com	613443697	2026-03-05 16:19:11.529425+01	2026-03-05 16:19:11.529425+01
ccb2afcd-4d40-4cac-8e47-c8edb9e4ae3a	9e3c163b-039e-45c7-92ca-99559d21f620	zaragoza@biopompas.com	613000377	2026-03-05 21:36:20.725624+01	2026-03-05 21:36:20.725624+01
f3900ddc-df7e-4098-9f84-5196872c0292	39f9c46d-1c2d-481d-9db2-c9249bcb533d	casadofrut@gmail.com	649776219	2026-03-04 22:19:11.111633+01	2026-03-04 22:19:11.111633+01
\.


--
-- Data for Name: farmer_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.farmer_profiles (id, user_id, farm_name, presentation, approximate_location, postal_code, province, contact_web, activity_types, is_public, preferred_language, created_at, updated_at) FROM stdin;
046cd29b-988f-4a92-9e63-4c7d5bb94e15	26f512a9-4ac0-4f89-8d46-f9a7a9942e16	Augusto - Aceites y Olivas	\N	Fabara	50793	Zaragoza	\N	{agricultor}	t	es	2026-03-03 17:30:11.975739+01	2026-03-03 17:30:11.975739+01
24af04c7-65ab-46d5-aa56-9872fef3ca13	22222222-2222-2222-2222-222222222222	Aceites Agustín	\N	Azuara	50140	Zaragoza	\N	{agricultor}	t	es	2026-03-03 17:36:57.431825+01	2026-03-03 17:36:57.431825+01
ff653ab9-0259-494a-b832-b5f042a1d8a5	44444444-4444-4444-4444-444444444444	Aguacates del Sur	\N	Granada	18001	Granada	\N	{agricultor}	t	es	2026-03-03 17:36:57.441462+01	2026-03-03 17:36:57.441462+01
6b8cdc38-bf36-4ff2-b755-33525353226e	f5a81465-a205-40bb-a0ca-12b72e2e9664	Aloe vera ATALAYA BIO	\N	Madrid	28014	Madrid	\N	{elaborador}	t	es	2026-03-04 20:20:40.695985+01	2026-03-04 20:20:40.695985+01
54bb450e-8164-4844-a950-3a2f87ff251f	39f9c46d-1c2d-481d-9db2-c9249bcb533d	Finca La Beltrana 	Familia de productores de fruta certificados en ecológico que incorporamos practicas Biodinamicass	Moros	50215	Zaragoza	\N	{agricultor}	t	es	2026-03-04 22:19:10.894943+01	2026-03-04 22:19:10.894943+01
83322b65-18e3-4925-84d8-438852a8ca14	0ca65339-53ea-4a9f-ac46-3a7a425e4648	trufas Biodinamicas.com	Pequeña plantación de tubber melanosporum recibiendo los preparados hace más de 8 años	Almonacid de la Sierra 	50108	\N	trufasbiodinamicas.com	{}	t	es	2026-03-05 00:42:08.126964+01	2026-03-05 00:42:08.126964+01
53a1dcdf-bdb0-4616-80ef-389009d4b016	2168dba6-11e4-4976-a9c8-4b06d3faf862	Enrique Aguilera Pareja	Agricultura ecológica y biodinamica de citricos , trapicales y aloe vera	Albolote 	18220	Granada	\N	{agricultor}	t	es	2026-03-05 16:19:11.433168+01	2026-03-05 16:19:11.433168+01
8446a636-eec3-423e-82a4-211b11ad65c6	9e3c163b-039e-45c7-92ca-99559d21f620	Biopompas zaragoza 	Somos una ecodrogeria de productos ecológicos de limpieza e higiene personal a granel ,apostando siempre por lo natural y conciencia biodinamica 	Zaragoza 	50005	\N	Zaragoza.biopompas.com	{}	t	es	2026-03-05 21:36:20.418628+01	2026-03-05 21:36:20.418628+01
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, from_user_id, to_user_id, message, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: product_variations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_variations (id, product_id, variety, packaging, unit, net_price, created_at, updated_at) FROM stdin;
7bca1391-40ae-465f-a372-98189a8a036e	1378e1d8-481b-44be-a91d-a6c9c391f516	Picual	Botella 1L	litro	8.50	2026-03-03 17:32:49.550308+01	2026-03-03 17:32:49.550308+01
7d06f9ee-66ab-4fa5-9ae5-15081488e847	a2222222-2222-2222-2222-222222222222	Arbequina	Botella 750ml	litro	7.50	2026-03-03 17:36:57.434262+01	2026-03-03 17:36:57.434262+01
39f5898a-d368-4805-b0aa-84cdf5501488	a2222222-2222-2222-2222-222222222222	Picual	Garrafa 5L	litro	6.00	2026-03-03 17:36:57.434262+01	2026-03-03 17:36:57.434262+01
53d86f50-5f95-49b1-add5-e513dd00f282	a4444444-4444-4444-4444-444444444444	Hass	Caja 2kg	kg	6.50	2026-03-03 17:36:57.443778+01	2026-03-03 17:36:57.443778+01
82587f4b-85c8-435c-9792-85c68259d02c	a4444444-4444-4444-4444-444444444444	Beicon	Caja 5kg	kg	5.80	2026-03-03 17:36:57.443778+01	2026-03-03 17:36:57.443778+01
c53aed0b-b61e-4a62-bd36-0fb7799b3222	3680083f-8c10-4abf-abf9-07b856a2dbec	Melanosporum 	Otro	g	1.00	2026-03-05 18:34:30.129296+01	2026-03-05 18:34:30.129296+01
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, user_id, name, product_type, season, photo_url, certifications, is_active, created_at, updated_at, photos) FROM stdin;
1378e1d8-481b-44be-a91d-a6c9c391f516	26f512a9-4ac0-4f89-8d46-f9a7a9942e16	Aceite de oliva virgen extra	Aceite	\N	\N	{biodinamico}	t	2026-03-03 17:32:49.531849+01	2026-03-03 17:32:49.531849+01	[]
a2222222-2222-2222-2222-222222222222	22222222-2222-2222-2222-222222222222	Aceite de oliva virgen extra	Aceite	\N	\N	{biodinamico,ecologico_certificado}	t	2026-03-03 17:36:57.433501+01	2026-03-03 17:36:57.433501+01	[]
a4444444-4444-4444-4444-444444444444	44444444-4444-4444-4444-444444444444	Aguacate	Aguacate	\N	\N	{ecologico}	t	2026-03-03 17:36:57.443008+01	2026-03-03 17:36:57.443008+01	[]
3680083f-8c10-4abf-abf9-07b856a2dbec	0ca65339-53ea-4a9f-ac46-3a7a425e4648	Trufa negra de invierno 	Seta / Trufa	Invierno	\N	{ecologico,ecologico_certificado,biodinamico,demeter}	t	2026-03-05 00:49:29.462011+01	2026-03-05 00:49:29.462011+01	[]
\.


--
-- Data for Name: user_preferences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_preferences (id, user_id, last_unit_used, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_roles (id, user_id, role, created_at) FROM stdin;
d4c91eb0-74b7-47d6-ad05-ff1946a061e0	26f512a9-4ac0-4f89-8d46-f9a7a9942e16	agricultor	2026-03-03 17:29:20.375683+01
c0568867-bf02-46aa-9126-4cf60cce1e52	22222222-2222-2222-2222-222222222222	agricultor	2026-03-03 17:36:57.431007+01
98c02446-5b24-411a-8c6f-dd55692b73db	44444444-4444-4444-4444-444444444444	agricultor	2026-03-03 17:36:57.440677+01
826f47f5-8d7c-463b-b3d0-d7b7a40c41f6	0ca65339-53ea-4a9f-ac46-3a7a425e4648	consumidor	2026-03-04 15:00:09.073923+01
f1c7d984-e380-49f4-9a58-82cd24fb0c2f	0ca65339-53ea-4a9f-ac46-3a7a425e4648	agricultor	2026-03-04 15:00:09.229968+01
f4d75762-1995-402c-9179-c6adb6e14bc5	0ca65339-53ea-4a9f-ac46-3a7a425e4648	elaborador	2026-03-04 15:00:09.415376+01
0c5e36fb-5a1e-4c70-a5a3-428022cedf71	ce7244eb-ece8-4941-8501-d8cf440ff5dc	consumidor	2026-03-04 17:22:32.783492+01
61ca51f6-983f-40fc-905f-3fccaa5947e1	f5a81465-a205-40bb-a0ca-12b72e2e9664	elaborador	2026-03-04 20:20:10.285864+01
67e8c0b8-ca18-4fbd-b875-8f05a8a67106	f5a81465-a205-40bb-a0ca-12b72e2e9664	agricultor	2026-03-04 20:20:10.478071+01
46c54b79-c4b4-4135-84aa-63bd31090abe	f5a81465-a205-40bb-a0ca-12b72e2e9664	consumidor	2026-03-04 20:20:10.547391+01
8800d999-ea3a-4f12-8675-ee63339f2bac	39f9c46d-1c2d-481d-9db2-c9249bcb533d	agricultor	2026-03-04 22:12:08.599121+01
b6608e9c-37ac-408b-81d3-98805abbac4c	57da23a3-9305-44b3-8403-70836068096b	consumidor	2026-03-05 11:55:19.840248+01
da3d6712-db6a-4c67-8743-4b437ea13643	57da23a3-9305-44b3-8403-70836068096b	agricultor	2026-03-05 11:55:19.999425+01
269b761f-a232-4f1f-a956-165cc9fa7f83	57da23a3-9305-44b3-8403-70836068096b	elaborador	2026-03-05 11:55:20.119037+01
ca761bbc-ceb5-489d-a581-c28933b2d4d9	2168dba6-11e4-4976-a9c8-4b06d3faf862	agricultor	2026-03-05 15:41:45.149485+01
db66476c-99bb-4fe7-8891-e8fd98058a18	2168dba6-11e4-4976-a9c8-4b06d3faf862	elaborador	2026-03-05 15:41:45.25474+01
aeed8099-9e3f-417e-9de3-f9d7a23b4298	2a0d1628-5ec6-4b3e-9084-0e38c8112531	consumidor	2026-03-05 16:31:11.763935+01
f166254a-769a-45f5-bdaa-08c33e7bd13e	9e3c163b-039e-45c7-92ca-99559d21f620	consumidor	2026-03-05 21:23:25.010107+01
378cfbb5-cf6f-4e29-91d0-9d3c76c1eb37	9e3c163b-039e-45c7-92ca-99559d21f620	agricultor	2026-03-05 21:23:25.2093+01
b09291e3-b94f-406e-b94b-de107641a4eb	9e3c163b-039e-45c7-92ca-99559d21f620	elaborador	2026-03-05 21:23:25.379998+01
282bd6be-b8c8-4552-bdf4-68ee4b8c963c	9e3c163b-039e-45c7-92ca-99559d21f620	tienda	2026-03-05 21:50:09.496065+01
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, display_name, created_at, updated_at, email_confirmed, last_sign_in) FROM stdin;
26f512a9-4ac0-4f89-8d46-f9a7a9942e16	augusto@fabara.com	$2b$12$Avl1FIYtvGWePOJEKYrV4OwPRkD3t8TL4HeWYf.68kUXLTv4Km.0q	\N	2026-03-03 17:28:49.055892+01	2026-03-03 17:28:49.055892+01	t	\N
22222222-2222-2222-2222-222222222222	agustin@azuara.com	$2a$12$demo000000000000000000000000000000000000000000000	Agustín	2026-03-03 17:36:57.430082+01	2026-03-03 17:36:57.430082+01	t	\N
44444444-4444-4444-4444-444444444444	enrique@granada.com	$2a$12$demo000000000000000000000000000000000000000000000	Enrique	2026-03-03 17:36:57.44003+01	2026-03-03 17:36:57.44003+01	t	\N
fe9f2b75-e536-4541-bf13-83ea077141e4	casarurallola@gmail.com	$2b$12$jyHWGeQeDYLjQR48d5PDW.D4t/CxYWPLy19SPdkQgXdDcn0.XGdbq	Casa Rural Lola	2026-03-04 15:51:35.551086+01	2026-03-04 15:51:35.551086+01	t	\N
ce7244eb-ece8-4941-8501-d8cf440ff5dc	makipbp@gmail.com	$2b$12$QXp8qTIX.qGn2BfPYFDfaOKjoMtt14gHYkBEIBf.jh8TaGS2rEvKG	\N	2026-03-04 17:22:07.633066+01	2026-03-04 17:22:07.633066+01	t	\N
f5a81465-a205-40bb-a0ca-12b72e2e9664	info@atalaya-bio.com	$2b$12$NJVInCi0fFRVBQD.18f9Te9mloAxbXt4IhwKEF/BgnXtrqWpBRFBm	ATALAYA BIO	2026-03-04 20:19:47.749703+01	2026-03-04 20:19:47.749703+01	t	2026-03-04 20:23:42.870828+01
0ca65339-53ea-4a9f-ac46-3a7a425e4648	mcarlosmorales@hotmail.com	$2b$12$83jO4Uw0mf3bp9Qk3V9YFeSpRWWj8.WyBwOEB/wR8fm/0JWSPlWH.	\N	2026-03-04 15:00:00.873891+01	2026-03-04 15:00:00.873891+01	t	2026-03-04 21:45:22.760504+01
39f9c46d-1c2d-481d-9db2-c9249bcb533d	casadofrut@gmail.com	$2b$12$DrWlXcdnw0Ya/aFkP/7.e.X7CvdXZZ3ggoTN8EdLaikU.QDqp4Z/O	\N	2026-03-04 22:11:51.259009+01	2026-03-04 22:11:51.259009+01	t	\N
57da23a3-9305-44b3-8403-70836068096b	viviburillo@hotmail.com	$2b$12$/1WGrtj4hZc1Y4JZulvGGuIPkwJJL4EiyVZt.ErqTUqvNofxDw7tm	\N	2026-03-05 11:55:03.583128+01	2026-03-05 11:55:03.583128+01	t	\N
2168dba6-11e4-4976-a9c8-4b06d3faf862	enriqueaguilera27@gmail.com	$2b$12$kpnI3Wjx2rf3LN0Hfv3wbuO3h6TstA6bLJQt8ckcBOg3deD6y3tk6	Enrique aguilera pareja	2026-03-05 15:41:29.341503+01	2026-03-05 15:41:29.341503+01	t	\N
2a0d1628-5ec6-4b3e-9084-0e38c8112531	marian.deluque@biodinamica.es	$2b$12$W2NXALACwQdCh3iCqnuWzO1k/9di3R3pogLM49VQWsGjdAl7rtgCW	\N	2026-03-05 16:31:01.337745+01	2026-03-05 16:31:01.337745+01	t	\N
9e3c163b-039e-45c7-92ca-99559d21f620	dimari240@hotmail.com	$2b$12$ebFppEmoIUHYYndnf9LO/.gEgywoyeRacb.SG2GjWAl3YJq9vtUdS	\N	2026-03-05 21:22:45.560602+01	2026-03-05 21:22:45.560602+01	t	\N
\.


--
-- Name: beta_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.beta_feedback_id_seq', 4, true);


--
-- Name: beta_feedback beta_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beta_feedback
    ADD CONSTRAINT beta_feedback_pkey PRIMARY KEY (id);


--
-- Name: biodynamic_preparations biodynamic_preparations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.biodynamic_preparations
    ADD CONSTRAINT biodynamic_preparations_pkey PRIMARY KEY (id);


--
-- Name: farmer_contact_details farmer_contact_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_contact_details
    ADD CONSTRAINT farmer_contact_details_pkey PRIMARY KEY (id);


--
-- Name: farmer_contact_details farmer_contact_details_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_contact_details
    ADD CONSTRAINT farmer_contact_details_user_id_key UNIQUE (user_id);


--
-- Name: farmer_profiles farmer_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_profiles
    ADD CONSTRAINT farmer_profiles_pkey PRIMARY KEY (id);


--
-- Name: farmer_profiles farmer_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_profiles
    ADD CONSTRAINT farmer_profiles_user_id_key UNIQUE (user_id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: product_variations product_variations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variations
    ADD CONSTRAINT product_variations_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: user_preferences user_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (id);


--
-- Name: user_preferences user_preferences_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_user_id_key UNIQUE (user_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_farmer_profiles_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_farmer_profiles_location ON public.farmer_profiles USING btree (approximate_location);


--
-- Name: idx_farmer_profiles_postal; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_farmer_profiles_postal ON public.farmer_profiles USING btree (postal_code);


--
-- Name: idx_messages_conversation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_conversation ON public.messages USING btree (LEAST(from_user_id, to_user_id), GREATEST(from_user_id, to_user_id), created_at DESC);


--
-- Name: idx_messages_from; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_from ON public.messages USING btree (from_user_id, created_at DESC);


--
-- Name: idx_messages_to; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_to ON public.messages USING btree (to_user_id, created_at DESC);


--
-- Name: idx_product_variations_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_variations_product ON public.product_variations USING btree (product_id);


--
-- Name: idx_products_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_active ON public.products USING btree (is_active) WHERE (is_active = true);


--
-- Name: idx_products_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_type ON public.products USING btree (product_type);


--
-- Name: idx_products_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_user_id ON public.products USING btree (user_id);


--
-- Name: idx_user_roles_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_roles_user ON public.user_roles USING btree (user_id);


--
-- Name: biodynamic_preparations biodynamic_preparations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.biodynamic_preparations
    ADD CONSTRAINT biodynamic_preparations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: farmer_contact_details farmer_contact_details_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_contact_details
    ADD CONSTRAINT farmer_contact_details_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: farmer_profiles farmer_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_profiles
    ADD CONSTRAINT farmer_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_from_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_from_user_id_fkey FOREIGN KEY (from_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_to_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_to_user_id_fkey FOREIGN KEY (to_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: product_variations product_variations_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variations
    ADD CONSTRAINT product_variations_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products products_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_preferences user_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict gKeurPfW6VwjUyHKhQjVNIpilWOD3714TVlFHPYoW2GZSjc5DcZZmm7HuVRNQV5

