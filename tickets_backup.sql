--
-- PostgreSQL database dump
--

\restrict iiUtxh9XD4EoRt2meuD6l0pwr2zkTW41LUF3LFffFtlNQFhFYcyxc4rMu51WH2h

-- Dumped from database version 14.19 (Homebrew)
-- Dumped by pg_dump version 14.19 (Homebrew)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: tickets; Type: TABLE; Schema: public; Owner: diegoquintero
--

CREATE TABLE public.tickets (
    id integer NOT NULL,
    number integer NOT NULL,
    "raffleId" integer NOT NULL,
    "buyerId" integer NOT NULL,
    status public."TicketStatus" DEFAULT 'SOLD'::public."TicketStatus" NOT NULL,
    "buyerDocument" text NOT NULL,
    "buyerPhone" text,
    "purchaseDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tickets OWNER TO diegoquintero;

--
-- Name: tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: diegoquintero
--

CREATE SEQUENCE public.tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tickets_id_seq OWNER TO diegoquintero;

--
-- Name: tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: diegoquintero
--

ALTER SEQUENCE public.tickets_id_seq OWNED BY public.tickets.id;


--
-- Name: tickets id; Type: DEFAULT; Schema: public; Owner: diegoquintero
--

ALTER TABLE ONLY public.tickets ALTER COLUMN id SET DEFAULT nextval('public.tickets_id_seq'::regclass);


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: diegoquintero
--

COPY public.tickets (id, number, "raffleId", "buyerId", status, "buyerDocument", "buyerPhone", "purchaseDate", "updatedAt") FROM stdin;
1	1	1	2	SOLD	95863888	1150104680	2025-11-02 06:27:05.181	2025-11-02 06:27:05.181
2	2	1	2	SOLD	95863888	1150104680	2025-11-02 06:27:05.181	2025-11-02 06:27:05.181
\.


--
-- Name: tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: diegoquintero
--

SELECT pg_catalog.setval('public.tickets_id_seq', 2, true);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: diegoquintero
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: tickets_raffleId_number_key; Type: INDEX; Schema: public; Owner: diegoquintero
--

CREATE UNIQUE INDEX "tickets_raffleId_number_key" ON public.tickets USING btree ("raffleId", number);


--
-- Name: tickets tickets_buyerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: diegoquintero
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT "tickets_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tickets tickets_raffleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: diegoquintero
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT "tickets_raffleId_fkey" FOREIGN KEY ("raffleId") REFERENCES public.raffles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict iiUtxh9XD4EoRt2meuD6l0pwr2zkTW41LUF3LFffFtlNQFhFYcyxc4rMu51WH2h

