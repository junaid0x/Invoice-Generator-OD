# System Architecture

## Application Structure

Frontend

↓

API Layer

↓

Backend

↓

MySQL

↓

PDF Engine

---

## Frontend Structure

src

components/

layouts/

pages/

features/

services/

store/

hooks/

utils/

assets/

---

## Backend Structure

server

config/

controllers/

routes/

services/

middleware/

models/

utils/

database/

---

## Architecture Rule

React components should never directly talk to the database.

Flow:

React

↓

API Service

↓

Express Route

↓

Controller

↓

Service

↓

Database

---

## PDF Flow

Invoice Data

↓

Build HTML

↓

Puppeteer

↓

Generate PDF

↓

Download PDF