# Database Schema

## users

id

name

email

password

role

created_at

updated_at

---

## customers

id

company_name

contact_person

email

phone

address

city

province

country

postal_code

notes

created_at

updated_at

---

## invoices

id

invoice_number

customer_id

invoice_date

due_date

payment_terms

po_number

subtotal

tax

discount

shipping

total

status

notes

terms

created_at

updated_at

---

## invoice_items

id

invoice_id

description

quantity

rate

amount

created_at

updated_at

---

## settings

id

company_name

company_email

company_phone

company_address

default_tax

currency

logo_url

payment_terms

updated_at

---

## activity_logs

id

user_id

action

entity_type

entity_id

created_at