--
-- PostgreSQL database dump
--

\restrict Fsbl14izNdFgNBZ0lLoWgB3gzCNXk2gioQwcunTfRMdHVro4XC0mD31ocVG1A7P

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: active_sessions; Type: TABLE; Schema: public; Owner: utkarsh
--

CREATE TABLE public.active_sessions (
    id integer NOT NULL,
    streamer_id text NOT NULL,
    refresh_token text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.active_sessions OWNER TO utkarsh;

--
-- Name: active_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: utkarsh
--

CREATE SEQUENCE public.active_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.active_sessions_id_seq OWNER TO utkarsh;

--
-- Name: active_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: utkarsh
--

ALTER SEQUENCE public.active_sessions_id_seq OWNED BY public.active_sessions.id;


--
-- Name: blacklisted_tokens; Type: TABLE; Schema: public; Owner: utkarsh
--

CREATE TABLE public.blacklisted_tokens (
    token text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.blacklisted_tokens OWNER TO utkarsh;

--
-- Name: pending_signups; Type: TABLE; Schema: public; Owner: utkarsh
--

CREATE TABLE public.pending_signups (
    discord_id text NOT NULL,
    display_name text,
    email text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pending_signups OWNER TO utkarsh;

--
-- Name: streamers; Type: TABLE; Schema: public; Owner: utkarsh
--

CREATE TABLE public.streamers (
    id character varying(8) NOT NULL,
    discord_id character varying(32) NOT NULL,
    display_name character varying(100) NOT NULL,
    email character varying(255),
    upi_id character varying(100),
    overlay_token character varying(64) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    support_title text DEFAULT 'Support the Stream'::text,
    support_total numeric(10,2) DEFAULT 0.00,
    support_completed numeric(10,2) DEFAULT 0.00,
    live_link text DEFAULT ''::text
);


ALTER TABLE public.streamers OWNER TO utkarsh;

--
-- Name: tips; Type: TABLE; Schema: public; Owner: utkarsh
--

CREATE TABLE public.tips (
    id integer NOT NULL,
    streamer_id character varying(50) NOT NULL,
    client_key character varying(64) NOT NULL,
    name character varying(100) NOT NULL,
    message character varying(255),
    amount numeric(10,2) NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_nsfw boolean DEFAULT false,
    request_id character varying(36),
    support_key character varying(20)
);


ALTER TABLE public.tips OWNER TO utkarsh;

--
-- Name: tips_id_seq; Type: SEQUENCE; Schema: public; Owner: utkarsh
--

CREATE SEQUENCE public.tips_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tips_id_seq OWNER TO utkarsh;

--
-- Name: tips_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: utkarsh
--

ALTER SEQUENCE public.tips_id_seq OWNED BY public.tips.id;


--
-- Name: active_sessions id; Type: DEFAULT; Schema: public; Owner: utkarsh
--

ALTER TABLE ONLY public.active_sessions ALTER COLUMN id SET DEFAULT nextval('public.active_sessions_id_seq'::regclass);


--
-- Name: tips id; Type: DEFAULT; Schema: public; Owner: utkarsh
--

ALTER TABLE ONLY public.tips ALTER COLUMN id SET DEFAULT nextval('public.tips_id_seq'::regclass);


--
-- Data for Name: active_sessions; Type: TABLE DATA; Schema: public; Owner: utkarsh
--

COPY public.active_sessions (id, streamer_id, refresh_token, created_at) FROM stdin;
\.


--
-- Data for Name: blacklisted_tokens; Type: TABLE DATA; Schema: public; Owner: utkarsh
--

COPY public.blacklisted_tokens (token, created_at) FROM stdin;
\.


--
-- Data for Name: pending_signups; Type: TABLE DATA; Schema: public; Owner: utkarsh
--

COPY public.pending_signups (discord_id, display_name, email, created_at) FROM stdin;
\.


--
-- Data for Name: streamers; Type: TABLE DATA; Schema: public; Owner: utkarsh
--

COPY public.streamers (id, discord_id, display_name, email, upi_id, overlay_token, created_at, support_title, support_total, support_completed, live_link) FROM stdin;
\.


--
-- Data for Name: tips; Type: TABLE DATA; Schema: public; Owner: utkarsh
--

COPY public.tips (id, streamer_id, client_key, name, message, amount, status, created_at, is_nsfw, request_id, support_key) FROM stdin;
\.


--
-- Name: active_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: utkarsh
--

SELECT pg_catalog.setval('public.active_sessions_id_seq', 58, true);


--
-- Name: tips_id_seq; Type: SEQUENCE SET; Schema: public; Owner: utkarsh
--

SELECT pg_catalog.setval('public.tips_id_seq', 81, true);


--
-- Name: active_sessions active_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: utkarsh
--

ALTER TABLE ONLY public.active_sessions
    ADD CONSTRAINT active_sessions_pkey PRIMARY KEY (id);


--
-- Name: blacklisted_tokens blacklisted_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: utkarsh
--

ALTER TABLE ONLY public.blacklisted_tokens
    ADD CONSTRAINT blacklisted_tokens_pkey PRIMARY KEY (token);


--
-- Name: pending_signups pending_signups_pkey; Type: CONSTRAINT; Schema: public; Owner: utkarsh
--

ALTER TABLE ONLY public.pending_signups
    ADD CONSTRAINT pending_signups_pkey PRIMARY KEY (discord_id);


--
-- Name: streamers streamers_discord_id_key; Type: CONSTRAINT; Schema: public; Owner: utkarsh
--

ALTER TABLE ONLY public.streamers
    ADD CONSTRAINT streamers_discord_id_key UNIQUE (discord_id);


--
-- Name: streamers streamers_overlay_token_key; Type: CONSTRAINT; Schema: public; Owner: utkarsh
--

ALTER TABLE ONLY public.streamers
    ADD CONSTRAINT streamers_overlay_token_key UNIQUE (overlay_token);


--
-- Name: streamers streamers_pkey; Type: CONSTRAINT; Schema: public; Owner: utkarsh
--

ALTER TABLE ONLY public.streamers
    ADD CONSTRAINT streamers_pkey PRIMARY KEY (id);


--
-- Name: tips tips_client_key_key; Type: CONSTRAINT; Schema: public; Owner: utkarsh
--

ALTER TABLE ONLY public.tips
    ADD CONSTRAINT tips_client_key_key UNIQUE (client_key);


--
-- Name: tips tips_pkey; Type: CONSTRAINT; Schema: public; Owner: utkarsh
--

ALTER TABLE ONLY public.tips
    ADD CONSTRAINT tips_pkey PRIMARY KEY (id);


--
-- Name: tips tips_request_id_key; Type: CONSTRAINT; Schema: public; Owner: utkarsh
--

ALTER TABLE ONLY public.tips
    ADD CONSTRAINT tips_request_id_key UNIQUE (request_id);


--
-- Name: idx_client_key; Type: INDEX; Schema: public; Owner: utkarsh
--

CREATE INDEX idx_client_key ON public.tips USING btree (client_key);


--
-- PostgreSQL database dump complete
--

\unrestrict Fsbl14izNdFgNBZ0lLoWgB3gzCNXk2gioQwcunTfRMdHVro4XC0mD31ocVG1A7P

