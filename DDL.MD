# Database Design Setup

To run an instance of the website on your own machine, you will need a database with a few tables. 

The tables from twitchlights.com are built on QuestDB, which uses PostgresSQL with some variations.

## Table 1: chatters

```CREATE TABLE CHATTERS (ts timestamp, username string, message string, stream_name symbol) timestamp(ts) PARTITION BY DAY;```

## Table 2: vod_link

```CREATE TABLE vod_link(vid_no string, stream_date string, stream_name string);```

## Table 3: highlights

```CREATE TABLE higlights(stream_name symbol, trigger string, vod_id string, score long) timestamp(timestamp) PARTITION BY DAY;```

## Table 4: transcripts

```CREATE TABLE transcripts( stream_name symbol, transcript string, timestamp timestamp) timestamp(timestamp) PARTITION BY DAY;```

# Temp tables
For demonstrations or testing, create alternate versions of each of the tables called [table_name]_temp. These can be easily dropped without losing data from the production tables.

The production tables are built on version 6.5.3 of QuestDB, which doesn't support SQL `DELETE` statements, so be careful when inserting test data into production tables, as it will require a lot of effort to remove.