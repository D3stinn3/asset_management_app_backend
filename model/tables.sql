CREATE TABLE IF NOT EXISTS category
(
 category_id       serial,
 name     varchar(30) NOT NULL,
 dep_type varchar(30) NOT NULL,
 num_dep  int NOT NULL,
 freq_dep int NOT NULL,
 CONSTRAINT PK_5 PRIMARY KEY ( category_id )
);

CREATE TABLE company(
    name    varchar(50),
    company_id      serial,
    CONSTRAINT PK_6 PRIMARY KEY ( company_id )
);

CREATE TABLE branch(
    branch_id              serial,
    company_id      serial,            -- id of the company the branch belongs to
    city            varchar(50),     -- city where the branch is located in
    name            varchar(50),
    CONSTRAINT PK_7 PRIMARY KEY ( branch_id ),
  	CONSTRAINT comp_fkey FOREIGN KEY (company_id) REFERENCES company(company_id)
);

CREATE TABLE location(
    location_id              serial,
    branch_id       serial,
    name            varchar(50),
  	CONSTRAINT PK_8 PRIMARY KEY (location_id),
  	CONSTRAINT loc_fkey FOREIGN KEY (branch_id) REFERENCES branch(branch_id)
);

CREATE TABLE IF NOT EXISTS users(
    user_id varchar(255),
    email varchar(255) NOT NULL UNIQUE,
    username varchar(255) NOT NULL UNIQUE,
    CONSTRAINT PK_11 PRIMARY KEY (user_id)
);

CREATE TABLE item(
    item_id                  varchar(255),
    category_id            int,        -- id of the category the item belongs to
    name                varchar(50),
    user_id             varchar(50),        -- id of the owner of an item
    purchase_date       date,
    purchase_amount     real,       -- buying price of the item
    next_dep_date       date,       -- the date of its next depreciation
    accum_dep           real,       -- the accumulated depreciation on the item
    isnew               boolean,    -- whether the item was newly purchased or its an existing item
    location_id         serial,
    CONSTRAINT PK_9 PRIMARY KEY (item_id),
    CONSTRAINT categ_item_fkey FOREIGN KEY (category_id) REFERENCES category(category_id),
    CONSTRAINT loc_item_fkey FOREIGN KEY (location_id) REFERENCES location(location_id),
    CONSTRAINT user_item_fkey FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- gatepass SQL
-- ****************************** SqlDBM: PostgreSQL *****************************
-- * Generated by SqlDBM: Asset Management App, v10 by roman.njoroge@njuguna.com *

-- ************************************** Assets.gatepass

CREATE TABLE IF NOT EXISTS gatepass
(
 gatepass_id  serial,
 leaving_time timestamp NOT NULL,
 item_id      varchar(255) NOT NULL,
 reason       varchar(255) NOT NULL,
 days_gone    int NOT NULL,
 location_id int NOT NULL,
 user_id varchar(255) NOT NULL,
 CONSTRAINT PK_10 PRIMARY KEY ( gatepass_id ),
 CONSTRAINT gatepass_user_fk FOREIGN KEY (user_id) REFERENCES users(user_id),
 CONSTRAINT gatepass_location_fk FOREIGN KEY (location_id) REFERENCES location(location_id),
 CONSTRAINT gatepass_item_fk FOREIGN KEY ( item_id ) REFERENCES item(item_id)
);

-- To create Temporary category
INSERT INTO category(name, dep_type, num_dep, freq_dep) VALUES('Temporary', 'None', 0, 0);