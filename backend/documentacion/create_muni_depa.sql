create table contabilidad.municipios
(
    munidepa_id int auto_increment
        primary key,
    muni_id     varchar(255)                                 not null,
    muni_nombre varchar(255)                                 not null,
    depa_id     varchar(255)                                 not null,
    muni_status enum ('Active', 'Inactive') default 'Active' not null,
    deleted_at  timestamp                                    null,
    constraint municipios_ibfk_1
        foreign key (depa_id) references contabilidad.departamentos (depa_id)
)
    engine = InnoDB
    collate = utf8mb4_general_ci;

create index depa_id
    on contabilidad.municipios (depa_id);

create index muni_id
    on contabilidad.municipios (muni_id);

create table contabilidad.departamentos
(
    depa_id     varchar(255) not null
        primary key,
    depa_nombre varchar(255) not null
)
    engine = InnoDB
    collate = utf8mb4_general_ci;

INSERT INTO contabilidad.departamentos (depa_id, depa_nombre) VALUES ('00', 'Otro país');
INSERT INTO contabilidad.departamentos (depa_id, depa_nombre) VALUES ('01', 'Ahuachapán');
INSERT INTO contabilidad.departamentos (depa_id, depa_nombre) VALUES ('02', 'Santa Ana');
INSERT INTO contabilidad.departamentos (depa_id, depa_nombre) VALUES ('03', 'Sonsonate');
INSERT INTO contabilidad.departamentos (depa_id, depa_nombre) VALUES ('04', 'Chalatenango');
