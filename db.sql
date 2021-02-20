--
-- PostgreSQL database dump
--

-- Dumped from database version 12.4 (Ubuntu 12.4-0ubuntu0.20.04.1)
-- Dumped by pg_dump version 12.4 (Ubuntu 12.4-0ubuntu0.20.04.1)

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
-- Name: ingredients; Type: TABLE; Schema: public; Owner: jorboy
--

CREATE TABLE public.ingredients (
    id integer NOT NULL,
    name_eng character varying(255),
    details text,
    image character varying(255),
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.ingredients OWNER TO jorboy;

--
-- Name: ingredients_id_seq; Type: SEQUENCE; Schema: public; Owner: jorboy
--

CREATE SEQUENCE public.ingredients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ingredients_id_seq OWNER TO jorboy;

--
-- Name: ingredients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jorboy
--

ALTER SEQUENCE public.ingredients_id_seq OWNED BY public.ingredients.id;


--
-- Name: quantifiers; Type: TABLE; Schema: public; Owner: jorboy
--

CREATE TABLE public.quantifiers (
    id integer NOT NULL,
    quantifiers_eng character varying(255)
);


ALTER TABLE public.quantifiers OWNER TO jorboy;

--
-- Name: quantifiers_id_seq; Type: SEQUENCE; Schema: public; Owner: jorboy
--

CREATE SEQUENCE public.quantifiers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.quantifiers_id_seq OWNER TO jorboy;

--
-- Name: quantifiers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jorboy
--

ALTER SEQUENCE public.quantifiers_id_seq OWNED BY public.quantifiers.id;


--
-- Name: recipes; Type: TABLE; Schema: public; Owner: jorboy
--

CREATE TABLE public.recipes (
    id integer NOT NULL,
    recipe_name_eng character varying(255),
    cover_pic character varying(255),
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    creater_id integer
);


ALTER TABLE public.recipes OWNER TO jorboy;

--
-- Name: recipes_id_seq; Type: SEQUENCE; Schema: public; Owner: jorboy
--

CREATE SEQUENCE public.recipes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.recipes_id_seq OWNER TO jorboy;

--
-- Name: recipes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jorboy
--

ALTER SEQUENCE public.recipes_id_seq OWNED BY public.recipes.id;


--
-- Name: steps; Type: TABLE; Schema: public; Owner: jorboy
--

CREATE TABLE public.steps (
    id integer NOT NULL,
    steps_description text,
    steps_order integer,
    steps_img character varying(255),
    recipes_id integer
);


ALTER TABLE public.steps OWNER TO jorboy;

--
-- Name: steps_id_seq; Type: SEQUENCE; Schema: public; Owner: jorboy
--

CREATE SEQUENCE public.steps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.steps_id_seq OWNER TO jorboy;

--
-- Name: steps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jorboy
--

ALTER SEQUENCE public.steps_id_seq OWNED BY public.steps.id;


--
-- Name: steps_ingres; Type: TABLE; Schema: public; Owner: jorboy
--

CREATE TABLE public.steps_ingres (
    id integer NOT NULL,
    ingres_id integer,
    steps_id integer,
    ingres_quan character varying(255)
);


ALTER TABLE public.steps_ingres OWNER TO jorboy;

--
-- Name: steps_ingres_id_seq; Type: SEQUENCE; Schema: public; Owner: jorboy
--

CREATE SEQUENCE public.steps_ingres_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.steps_ingres_id_seq OWNER TO jorboy;

--
-- Name: steps_ingres_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jorboy
--

ALTER SEQUENCE public.steps_ingres_id_seq OWNED BY public.steps_ingres.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: jorboy
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255),
    password character varying(255),
    profile_pic character varying(255),
    email character varying(255),
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.users OWNER TO jorboy;

--
-- Name: users_fav_ingres; Type: TABLE; Schema: public; Owner: jorboy
--

CREATE TABLE public.users_fav_ingres (
    id integer NOT NULL,
    users_id integer,
    ingres_id integer,
    created_at timestamp without time zone
);


ALTER TABLE public.users_fav_ingres OWNER TO jorboy;

--
-- Name: users_fav_ingres_id_seq; Type: SEQUENCE; Schema: public; Owner: jorboy
--

CREATE SEQUENCE public.users_fav_ingres_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_fav_ingres_id_seq OWNER TO jorboy;

--
-- Name: users_fav_ingres_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jorboy
--

ALTER SEQUENCE public.users_fav_ingres_id_seq OWNED BY public.users_fav_ingres.id;


--
-- Name: users_fav_recipes; Type: TABLE; Schema: public; Owner: jorboy
--

CREATE TABLE public.users_fav_recipes (
    id integer NOT NULL,
    users_id integer,
    recipes_id integer
);


ALTER TABLE public.users_fav_recipes OWNER TO jorboy;

--
-- Name: users_fav_recipes_id_seq; Type: SEQUENCE; Schema: public; Owner: jorboy
--

CREATE SEQUENCE public.users_fav_recipes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_fav_recipes_id_seq OWNER TO jorboy;

--
-- Name: users_fav_recipes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jorboy
--

ALTER SEQUENCE public.users_fav_recipes_id_seq OWNED BY public.users_fav_recipes.id;


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: jorboy
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO jorboy;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jorboy
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: ingredients id; Type: DEFAULT; Schema: public; Owner: jorboy
--

ALTER TABLE ONLY public.ingredients ALTER COLUMN id SET DEFAULT nextval('public.ingredients_id_seq'::regclass);


--
-- Name: quantifiers id; Type: DEFAULT; Schema: public; Owner: jorboy
--

ALTER TABLE ONLY public.quantifiers ALTER COLUMN id SET DEFAULT nextval('public.quantifiers_id_seq'::regclass);


--
-- Name: recipes id; Type: DEFAULT; Schema: public; Owner: jorboy
--

ALTER TABLE ONLY public.recipes ALTER COLUMN id SET DEFAULT nextval('public.recipes_id_seq'::regclass);


--
-- Name: steps id; Type: DEFAULT; Schema: public; Owner: jorboy
--

ALTER TABLE ONLY public.steps ALTER COLUMN id SET DEFAULT nextval('public.steps_id_seq'::regclass);


--
-- Name: steps_ingres id; Type: DEFAULT; Schema: public; Owner: jorboy
--

ALTER TABLE ONLY public.steps_ingres ALTER COLUMN id SET DEFAULT nextval('public.steps_ingres_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: jorboy
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: users_fav_ingres id; Type: DEFAULT; Schema: public; Owner: jorboy
--

ALTER TABLE ONLY public.users_fav_ingres ALTER COLUMN id SET DEFAULT nextval('public.users_fav_ingres_id_seq'::regclass);


--
-- Name: users_fav_recipes id; Type: DEFAULT; Schema: public; Owner: jorboy
--

ALTER TABLE ONLY public.users_fav_recipes ALTER COLUMN id SET DEFAULT nextval('public.users_fav_recipes_id_seq'::regclass);


--
-- Data for Name: ingredients; Type: TABLE DATA; Schema: public; Owner: jorboy
--

COPY public.ingredients (id, name_eng, details, image, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: quantifiers; Type: TABLE DATA; Schema: public; Owner: jorboy
--

COPY public.quantifiers (id, quantifiers_eng) FROM stdin;
\.


--
-- Data for Name: recipes; Type: TABLE DATA; Schema: public; Owner: jorboy
--

COPY public.recipes (id, recipe_name_eng, cover_pic, created_at, updated_at, creater_id) FROM stdin;
\.


--
-- Data for Name: steps; Type: TABLE DATA; Schema: public; Owner: jorboy
--

COPY public.steps (id, steps_description, steps_order, steps_img, recipes_id) FROM stdin;
\.


--
-- Data for Name: steps_ingres; Type: TABLE DATA; Schema: public; Owner: jorboy
--

COPY public.steps_ingres (id, ingres_id, steps_id, ingres_quan) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: jorboy
--

COPY public.users (id, username, password, profile_pic, email, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users_fav_ingres; Type: TABLE DATA; Schema: public; Owner: jorboy
--

COPY public.users_fav_ingres (id, users_id, ingres_id, created_at) FROM stdin;
\.


--
-- Data for Name: users_fav_recipes; Type: TABLE DATA; Schema: public; Owner: jorboy
--

COPY public.users_fav_recipes (id, users_id, recipes_id) FROM stdin;
\.


--
-- Name: ingredients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jorboy
--

SELECT pg_catalog.setval('public.ingredients_id_seq', 1, false);


--
-- Name: quantifiers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jorboy
--

SELECT pg_catalog.setval('public.quantifiers_id_seq', 1, false);


--
-- Name: recipes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jorboy
--

SELECT pg_catalog.setval('public.recipes_id_seq', 1, false);


--
-- Name: steps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jorboy
--

SELECT pg_catalog.setval('public.steps_id_seq', 1, false);


--
-- Name: steps_ingres_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jorboy
--

SELECT pg_catalog.setval('public.steps_ingres_id_seq', 1, false);


--
-- Name: users_fav_ingres_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jorboy
--

SELECT pg_catalog.setval('public.users_fav_ingres_id_seq', 1, false);


--
-- Name: users_fav_recipes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jorboy
--

SELECT pg_catalog.setval('public.users_fav_recipes_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jorboy
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- Name: ingredients ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: jorboy
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_pkey PRIMARY KEY (id);


--
-- Name: quantifiers quantifiers_pkey; Type: CONSTRAINT; Schema: public; Owner: jorboy
--

ALTER TABLE ONLY public.quantifiers
    ADD CONSTRAINT quantifiers_pkey PRIMARY KEY (id);


--
-- Name: recipes recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: jorboy
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_pkey PRIMARY KEY (id);


--
-- Name: steps_ingres steps_ingres_pkey; Type: CONSTRAINT; Schema: public; Owner: jorboy
--

ALTER TABLE ONLY public.steps_ingres
    ADD CONSTRAINT steps_ingres_pkey PRIMARY KEY (id);


--
-- Name: steps steps_pkey; Type: CONSTRAINT; Schema: public; Owner: jorboy
--

ALTER TABLE ONLY public.steps
    ADD CONSTRAINT steps_pkey PRIMARY KEY (id);


--
-- Name: users_fav_ingres users_fav_ingres_pkey; Type: CONSTRAINT; Schema: public; Owner: jorboy
--

ALTER TABLE ONLY public.users_fav_ingres
    ADD CONSTRAINT users_fav_ingres_pkey PRIMARY KEY (id);


--
-- Name: users_fav_recipes users_fav_recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: jorboy
--

ALTER TABLE ONLY public.users_fav_recipes
    ADD CONSTRAINT users_fav_recipes_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: jorboy
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: recipes recipes_creater_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jorboy
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_creater_id_fkey FOREIGN KEY (creater_id) REFERENCES public.users(id);


--
-- Name: steps_ingres steps_ingres_ingres_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jorboy
--

ALTER TABLE ONLY public.steps_ingres
    ADD CONSTRAINT steps_ingres_ingres_id_fkey FOREIGN KEY (ingres_id) REFERENCES public.ingredients(id);


--
-- Name: steps_ingres steps_ingres_steps_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jorboy
--

ALTER TABLE ONLY public.steps_ingres
    ADD CONSTRAINT steps_ingres_steps_id_fkey FOREIGN KEY (steps_id) REFERENCES public.steps(id);


--
-- Name: steps steps_recipes_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jorboy
--

ALTER TABLE ONLY public.steps
    ADD CONSTRAINT steps_recipes_id_fkey FOREIGN KEY (recipes_id) REFERENCES public.recipes(id);


--
-- Name: users_fav_ingres users_fav_ingres_ingres_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jorboy
--

ALTER TABLE ONLY public.users_fav_ingres
    ADD CONSTRAINT users_fav_ingres_ingres_id_fkey FOREIGN KEY (ingres_id) REFERENCES public.ingredients(id);


--
-- Name: users_fav_ingres users_fav_ingres_users_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jorboy
--

ALTER TABLE ONLY public.users_fav_ingres
    ADD CONSTRAINT users_fav_ingres_users_id_fkey FOREIGN KEY (users_id) REFERENCES public.users(id);


--
-- Name: users_fav_recipes users_fav_recipes_recipes_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jorboy
--

ALTER TABLE ONLY public.users_fav_recipes
    ADD CONSTRAINT users_fav_recipes_recipes_id_fkey FOREIGN KEY (recipes_id) REFERENCES public.recipes(id);


--
-- Name: users_fav_recipes users_fav_recipes_users_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jorboy
--

ALTER TABLE ONLY public.users_fav_recipes
    ADD CONSTRAINT users_fav_recipes_users_id_fkey FOREIGN KEY (users_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

