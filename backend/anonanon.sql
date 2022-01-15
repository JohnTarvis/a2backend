\echo 'Delete and recreate anonanon db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE anonanon;
CREATE DATABASE anonanon;
\connect anonanon

\i anonanon-setup.sql
\i anonanon-seed.sql

\echo 'Delete and recreate anonanon_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE anonanon_test;
CREATE DATABASE anonanon_test;
\connect anonanon_test


